const axes = [[0, 2, 1], [0, 2, 1], [1, 0, 2], [1, 0, 2], [2, 0, 1], [2, 0, 1]];
const eps = 1e-6;
export function subtractRectangle(rect, cut) {
  const [u0, v0, u1, v1] = rect;
  const a = Math.max(u0, cut[0]), b = Math.max(v0, cut[1]);
  const c = Math.min(u1, cut[2]), d = Math.min(v1, cut[3]);
  if (a >= c - eps || b >= d - eps) return [rect];
  return [[u0,v0,a,v1],[c,v0,u1,v1],[a,v0,c,b],[a,d,c,v1]].filter(r => r[2] - r[0] > eps && r[3] - r[1] > eps);
}

// Offline CSG for axis-aligned Minecraft cubes/slabs. Clip covered surfaces,
// including partial overlaps; retain a single deterministic owner for coplanar faces.
export function unionSurfaces(boxes) {
  const bins = new Map();
  const bounds = boxes.map(b => [[b.x,b.y,b.z],[b.x+b.sx,b.y+b.sy,b.z+b.sz]]);
  const visit = (min,max,fn) => { for(let x=Math.floor(min[0]-eps);x<=Math.floor(max[0]+eps);x++) for(let y=Math.floor(min[1]-eps);y<=Math.floor(max[1]+eps);y++) for(let z=Math.floor(min[2]-eps);z<=Math.floor(max[2]+eps);z++) fn(`${x},${y},${z}`); };
  bounds.forEach(([min,max],id) => visit(min,max,key => { if(!bins.has(key)) bins.set(key,[]); bins.get(key).push(id); }));
  const result = [];
  boxes.forEach((box,id) => {
    const [min,max] = bounds[id], nearby = new Set();
    visit(min,max,key => bins.get(key)?.forEach(n => nearby.add(n)));
    for(let face=0;face<6;face++) {
      const [axis,u,v]=axes[face], positive=face%2===0, plane=positive?max[axis]:min[axis];
      let pieces = [[min[u],min[v],max[u],max[v]]];
      for(const other of nearby) {
        if(other===id || !pieces.length) continue;
        if(boxes[other].material==='iron_bars' && box.material!=='iron_bars') continue;
        const [a,b]=bounds[other];
        const occupiesOutside = positive ? a[axis]<=plane+eps && b[axis]>plane+eps : a[axis]<plane-eps && b[axis]>=plane-eps;
        const sameSurface = other>id && Math.abs((positive?b[axis]:a[axis])-plane)<eps;
        if(occupiesOutside || sameSurface) pieces=pieces.flatMap(piece=>subtractRectangle(piece,[a[u],a[v],b[u],b[v]]));
      }
      for(const piece of pieces) {
        const start=[...min],size=[box.sx,box.sy,box.sz];
        start[u]=piece[0]; start[v]=piece[1]; size[u]=piece[2]-piece[0]; size[v]=piece[3]-piece[1];
        // Face winding determines which edge starts its UV range.
        const reverseU=face===0 || face===5, reverseV=face===2;
        const uv=[reverseU?max[u]-piece[2]:piece[0]-min[u],reverseV?max[v]-piece[3]:piece[1]-min[v]];
        result.push({ ...box,x:start[0],y:start[1],z:start[2],sx:size[0],sy:size[1],sz:size[2],face,uv,id });
      }
    }
  });
  return result;
}
