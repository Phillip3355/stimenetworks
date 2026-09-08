const corners = [
  [[1,0,1],[1,0,0],[1,1,0],[1,1,1]], [[0,0,0],[0,0,1],[0,1,1],[0,1,0]],
  [[0,1,1],[1,1,1],[1,1,0],[0,1,0]], [[0,0,0],[1,0,0],[1,0,1],[0,0,1]],
  [[0,0,1],[1,0,1],[1,1,1],[0,1,1]], [[1,0,0],[0,0,0],[0,1,0],[1,1,0]],
];
export function expandSettlement(buffer) {
  const view = new DataView(buffer);
  if (view.byteLength < 8 || view.getUint32(0, true) !== 0x53544d44) throw new Error('Invalid world geometry');
  const faces = view.getUint32(4, true);
  if (faces > 30000 || view.byteLength !== 8 + faces * 24) throw new Error('Invalid world geometry');
  const vertices = new Float32Array(faces * 4 * 14), indices = new Uint32Array(faces * 6);
  for (let face = 0; face < faces; face++) {
    const offset = 8 + face * 24;
    const cx = view.getInt16(offset, true) / 1000, cy = view.getInt16(offset + 2, true) / 1000, cz = view.getInt16(offset + 4, true) / 1000;
    const sx = view.getUint16(offset + 6, true) / 1000, sy = view.getUint16(offset + 8, true) / 1000, sz = view.getUint16(offset + 10, true) / 1000;
    const tile = view.getUint8(offset + 12), r = view.getUint8(offset + 13) / 255, g = view.getUint8(offset + 14) / 255, b = view.getUint8(offset + 15) / 255;
    const light = view.getUint8(offset + 16) / 100, direction = view.getUint8(offset + 17), id = view.getUint16(offset + 18, true);
    if (direction > 5 || tile > 28) throw new Error('Invalid world material');
    const uSize = (direction < 2 ? sz : sx) / .4, vSize = (direction === 2 || direction === 3 ? sz : sy) / .4;
    for (let corner = 0; corner < 4; corner++) {
      const c = corners[direction][corner], start = (face * 4 + corner) * 14;
      vertices[start] = (c[0] - .5) * sx; vertices[start + 1] = (c[1] - .5) * sy; vertices[start + 2] = (c[2] - .5) * sz;
      vertices[start + 3] = cx; vertices[start + 4] = cy; vertices[start + 5] = cz;
      vertices[start + 6] = view.getUint16(offset + 20, true) / 1000 + (corner === 1 || corner === 2 ? uSize : 0);
      vertices[start + 7] = view.getUint16(offset + 22, true) / 1000 + (corner >= 2 ? vSize : 0);
      vertices[start + 8] = r; vertices[start + 9] = g; vertices[start + 10] = b;
      vertices[start + 11] = tile;
      vertices[start + 12] = light * (cy + 1.3 - sy / 2 >= -.001 && direction !== 2 && c[1] === 0 ? .93 : 1);
      vertices[start + 13] = id;
    }
    const start = face * 6, base = face * 4;
    indices[start] = base; indices[start + 1] = base + 1; indices[start + 2] = base + 2;
    indices[start + 3] = base; indices[start + 4] = base + 2; indices[start + 5] = base + 3;
  }
  return { vertices, indices };
}
