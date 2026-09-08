import * as THREE from 'three';

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
