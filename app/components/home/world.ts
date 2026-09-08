import * as THREE from 'three';

export type WorldUniforms = {
  uExplode: { value: number }; uNetwork: { value: number };
  uSplit: { value: number }; uTime: { value: number };
};

// A fixed seed keeps the composition identical after resize/remount.
function random(seed: number) {
  const n = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return n - Math.floor(n);
}

type Block = { x: number; y: number; z: number; sx: number; sy: number; sz: number; color: string };

export function createWorld() {
  const blocks: Block[] = [];
  const add = (x: number, y: number, z: number, sx: number, sy: number, sz: number, color: string) =>
    blocks.push({ x, y, z, sx, sy, sz, color });
  const surface = (x: number, z: number) => Math.max(0, Math.floor((Math.sin(x * .45) + Math.cos(z * .5)) * .75)) * .48;

  // A cutaway chunk: exposed stone strata below a stepped, inhabited surface.
  for (let x = -11; x <= 11; x++) {
    for (let z = -10; z <= 10; z++) {
      const seed = (x + 12) * 41 + z + 10;
      if (Math.hypot(x * .92, z) > 10.6 + random(seed) * .8) continue;
      const px = x * .61, pz = z * .61, top = surface(x, z);
      const depth = 1.1 + (1 - Math.hypot(x, z) / 16) * 2.8 + random(seed + 1) * .9;
      add(px, top - depth / 2, pz, .596, depth, .596, ['#374945', '#45524c', '#293f3e', '#53615b'][Math.floor(random(seed) * 4)]);
      const plaza = Math.abs(x) < 4 || Math.abs(z) < 2;
      add(px, top + .14, pz, .60, .28, .60, plaza ? ['#9dafa0', '#c1cbb5', '#778f80'][seed % 3] : ['#506a45', '#708353', '#879567', '#405d44'][seed % 4]);
      if (random(seed + 33) > .84) add(px, top - depth - .28, pz, .44, .55, .44, '#304340');
      if (Math.abs(x) === 3 && z % 3 === 0) add(px, top + .3, pz, .09, .035, .5, '#c6ffd7');
    }
  }

  // Cubic trees are a Minecraft cue without relying on stock grass-block art.
  for (const [x, z, height] of [[-4.6, -2.8, 2.3], [-5, 1.5, 1.8], [4.4, 2.8, 2.2], [3.9, -4, 2], [-2.8, 4.4, 1.8], [1.9, 4.7, 1.5]]) {
    const y = surface(Math.round(x / .61), Math.round(z / .61)) + .3;
    add(x, y + height / 2, z, .25, height, .25, '#a7ad93');
    for (let layer = 0; layer < 3; layer++) {
      const size = layer === 1 ? 1.65 : 1.15;
      add(x, y + height - .15 + layer * .46, z, size, .48, size, ['#8baf84', '#abc798', '#c2d6af'][layer]);
    }
  }

  // Small pitched-roof builds, lit windows and a central technology gateway.
  for (const [x, z, wide] of [[-3.4, -1.2, 1.8], [3.4, -2.4, 2], [2.8, 2, 1.5]]) {
    const y = surface(Math.round(x / .61), Math.round(z / .61)) + .3;
    add(x, y + .8, z, wide, 1.6, 1.7, '#b5b29a');
    for (let step = 0; step < 4; step++) add(x, y + 1.6 + step * .22, z, wide + .4 - step * .4, .23, 2.1, '#355c54');
    for (const offset of [-.45, .45]) {
      add(x + offset, y + .95, z + .86, .3, .48, .04, '#ffc48c');
      add(x + offset, y + .95, z - .86, .3, .48, .04, '#ffc48c');
    }
    add(x, y + .5, z + .89, .3, 1, .1, '#3a4a41');
    for (const side of [-1, 1]) add(x + side * (wide / 2 - .1), y + .8, z + .87, .14, 1.7, .14, '#435c4c');
  }
  for (let step = 0; step < 4; step++) add(0, .35 + step * .17, 1.7 - step * .42, 2.5, .25, .44, '#c0c8b3');
  for (const side of [-1, 1]) {
    add(side * 1.38, 2.45, -.1, .65, 4.4, .7, '#86988c');
    add(side * 1.38, 2.55, .28, .16, 3.6, .08, '#cdffe1');
    add(side * 1.38, .7, -.1, .96, .6, .98, '#b4c5ae');
  }
  add(0, 4.6, -.1, 3.4, .65, .85, '#b4c5ae');
  add(0, 4.58, .35, 2.8, .12, .04, '#d2ffe0');

  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const count = blocks.length;
  const scatter = new Float32Array(count * 3);
  const network = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const color = new THREE.Color();
  const uniforms: WorldUniforms = {
    uExplode: { value: 0 }, uNetwork: { value: 0 }, uSplit: { value: 0 }, uTime: { value: 0 },
  };
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: `
      attribute vec3 aScatter;
      attribute vec3 aNetwork;
      attribute vec3 aColor;
      uniform float uExplode;
      uniform float uNetwork;
      uniform float uSplit;
      uniform float uTime;
      varying vec3 vColor;
      varying float vLight;
      varying float vDepth;
      void main() {
        vec3 center = instanceMatrix[3].xyz;
        vec3 local = mat3(instanceMatrix) * position;
        vec3 destination = mix(center, aScatter, uExplode);
        destination = mix(destination, aNetwork, uNetwork);
        destination.x += sign(center.x + 0.01) * uSplit * 3.6;
        destination.y += sin(uTime * .6 + center.x) * .06 * uExplode;
        local *= mix(1.0, .24, uNetwork);
        vec4 mvPosition = modelViewMatrix * vec4(destination + local, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        vDepth = -mvPosition.z;
        vColor = mix(aColor, vec3(.52, .88, .69), uNetwork * .8);
        vLight = .53 + .47 * max(0.0, dot(normal, normalize(vec3(-.5, 1.0, .7))));
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vLight;
      varying float vDepth;
      void main() {
        vec3 color = vColor * vLight;
        color = mix(color, vec3(.031, .055, .063), smoothstep(38., 90., vDepth));
        gl_FragColor = vec4(color, 1.0);
        #include <colorspace_fragment>
      }
    `,
  });
  const mesh = new THREE.InstancedMesh(geometry, material, count);
  const dummy = new THREE.Object3D();
  blocks.forEach((block, i) => {
    dummy.position.set(block.x, block.y, block.z);
    dummy.scale.set(block.sx, block.sy, block.sz);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
    color.set(block.color).toArray(colors, i * 3);
    scatter.set([block.x * 1.55 + (random(i) - .5) * 6, block.y * 1.5 + (random(i + 5) - .4) * 9, block.z * 1.55], i * 3);
    // Three server-like volumes made from the exact blocks of the world.
    const rack = i % 3;
    const cell = Math.floor(i / 3);
    network.set([(rack - 1) * 6 + (cell % 5 - 2) * .55, Math.floor(cell / 25) * .43 - 3, (Math.floor(cell / 5) % 5 - 2) * .65], i * 3);
  });
  geometry.setAttribute('aScatter', new THREE.InstancedBufferAttribute(scatter, 3));
  geometry.setAttribute('aNetwork', new THREE.InstancedBufferAttribute(network, 3));
  geometry.setAttribute('aColor', new THREE.InstancedBufferAttribute(colors, 3));
  mesh.frustumCulled = false; // Shader disassembly extends beyond the rest-pose bounds.
  return { mesh, uniforms, count };
}

export function createInfrastructure() {
  const group = new THREE.Group();
  const edgePoints: number[] = [];
  const segment = (a: number[], b: number[]) => edgePoints.push(...a, ...b);
  for (const x of [-6, 0, 6]) {
    for (const y of [-3.3, 3.8]) {
      segment([x - 1.55, y, -1.8], [x + 1.55, y, -1.8]);
      segment([x + 1.55, y, -1.8], [x + 1.55, y, 1.8]);
      segment([x + 1.55, y, 1.8], [x - 1.55, y, 1.8]);
      segment([x - 1.55, y, 1.8], [x - 1.55, y, -1.8]);
    }
    for (const dx of [-1.55, 1.55]) for (const z of [-1.8, 1.8]) segment([x + dx, -3.3, z], [x + dx, 3.8, z]);
    segment([x, -3.3, 0], [x, -4.4, 0]);
    segment([x, -4.4, 0], [0, -4.4, 0]);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(edgePoints, 3));
  const material = new THREE.LineBasicMaterial({ color: '#a9efca', transparent: true, opacity: 0 });
  group.add(new THREE.LineSegments(geometry, material));
  return { group, material };
}

export function createPortal(color: string) {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({ color });
  const mesh = new THREE.InstancedMesh(geometry, material, 12);
  const dummy = new THREE.Object3D();
  for (let layer = 0; layer < 3; layer++) {
    const w = 3.1 + layer * .24, h = 4.4 + layer * .24, line = layer === 0 ? .06 : .024;
    [[-w / 2, 0, line, h], [w / 2, 0, line, h], [0, h / 2, w, line], [0, -h / 2, w, line]].forEach(([x, y, sx, sy], i) => {
      dummy.position.set(x, y, -layer * .45);
      dummy.scale.set(sx, sy, line);
      dummy.updateMatrix();
      mesh.setMatrixAt(layer * 4 + i, dummy.matrix);
    });
  }
  mesh.frustumCulled = false;
  return mesh;
}
