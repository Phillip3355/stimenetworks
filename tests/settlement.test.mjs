import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { createSettlement, visibleBoxes, materialFaces, textureNames } from '../app/components/home/settlement.mjs';
import { expandSettlement } from '../app/components/home/settlement-geometry.mjs';
import { unionSurfaces } from '../app/components/home/surface-union.mjs';

test('voxel visibility removes sealed interiors and retains faces beside cutout leaves', () => {
  const cells = new Map();
  for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++) cells.set(`${x},${y},${z}`, { x, y, z, material: 'stone' });
  assert.equal(visibleBoxes({ cells, details: [] }).length, 26);
  cells.get('1,0,0').material = 'birch_leaves';
  assert.ok(visibleBoxes({ cells, details: [] }).find(b => b.x === 0 && b.y === 0 && b.z === 0).faces[0]);
});
test('Minecraft material orientation uses log end grain and grass top only on the correct faces', () => {
  assert.equal(materialFaces('birch_log', 2), 'birch_log_top');
  assert.equal(materialFaces('birch_log', 0), 'birch_log');
  assert.equal(materialFaces('grass', 2), 'grass_block_top');
  assert.equal(materialFaces('grass', 3), 'dirt');
  assert.equal(materialFaces('barrel', 2), 'barrel_top');
});
test('the complete textured reconstruction fits its mobile geometry budget', () => {
  const settlement = createSettlement();
  const boxes = [...settlement.cells.values(),...settlement.details];
  const faces = unionSurfaces(boxes).length;
  assert.ok(faces * 2 < 40000);
  for (const box of boxes) for (let face = 0; face < 6; face++) assert.ok(textureNames.includes(materialFaces(box.material, face)));
  const compressed = readFileSync('public/home/minecraft/settlement.bin.gz');
  assert.ok(compressed.byteLength < 130000);
  const binary = gunzipSync(compressed);
  const { vertices, indices } = expandSettlement(binary.buffer.slice(binary.byteOffset, binary.byteOffset + binary.byteLength));
  assert.equal(vertices.length, faces * 4 * 14);
  assert.equal(indices.length, faces * 6);
  assert.ok(vertices.every(Number.isFinite));
  assert.ok(indices.every(index => index < vertices.length / 14));
});

test('malformed packed geometry fails before GPU allocation', () => {
  assert.throws(() => expandSettlement(new ArrayBuffer(2)));
  const data = new ArrayBuffer(8), view = new DataView(data);
  view.setUint32(0, 0x53544d44, true); view.setUint32(4, 30001, true);
  assert.throws(() => expandSettlement(data));
});

test('the actual settlement has no overlapping opaque coplanar surfaces', () => {
  const settlement = createSettlement();
  const surfaces = unionSurfaces([...settlement.cells.values(), ...settlement.details]);
  const axes = [[0,2,1],[0,2,1],[1,0,2],[1,0,2],[2,0,1],[2,0,1]];
  const planes = new Map();
  for (const box of surfaces) {
    if (box.material === 'iron_bars') continue;
    const min = [box.x,box.y,box.z], size = [box.sx,box.sy,box.sz];
    const [axis,u,v] = axes[box.face];
    const plane = min[axis] + (box.face % 2 === 0 ? size[axis] : 0);
    const key = `${box.face}:${plane.toFixed(5)}`;
    const rect = [min[u],min[v],min[u]+size[u],min[v]+size[v]];
    const previous = planes.get(key) ?? [];
    for (const other of previous) {
      const width = Math.min(rect[2],other[2])-Math.max(rect[0],other[0]);
      const height = Math.min(rect[3],other[3])-Math.max(rect[1],other[1]);
      assert.ok(width < 1e-6 || height < 1e-6, `Duplicate visible surface on ${key}`);
    }
    previous.push(rect); planes.set(key,previous);
  }
});
