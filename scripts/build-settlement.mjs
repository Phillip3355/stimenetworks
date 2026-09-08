import { mkdir, writeFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { Color } from 'three';
import { createSettlement, materialFaces, textureNames } from '../app/components/home/settlement.mjs';

import { unionSurfaces } from '../app/components/home/surface-union.mjs';

// Bake mesh and directional occlusion offline: zero scene-generation work at startup.
const settlement = createSettlement(), blocks = [...settlement.cells.values(), ...settlement.details];
const surfaces = unionSurfaces(blocks);
const records = [];
const normals = [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
function shadow(x, y, z) {
  // Fixed warm afternoon sun; two neighboring rays soften block shadow edges.
  let light = 0;
  for (const offset of [-.22, .22]) {
    let transmission = 1;
    for (let step = 1; step < 44; step++) {
      const hit = settlement.cells.get(`${Math.floor(x - step * .65 + offset)},${Math.floor(y + step * .88)},${Math.floor(z - step * .38 + offset)}`);
      if (!hit) continue;
      if (hit.material.includes('leaves')) { transmission *= .86; if (transmission < .35) break; }
      else { transmission = .18; break; }
    }
    light += transmission * .5;
  }
  return light;
}
surfaces.forEach(b => {
  const {face,id}=b;
  const center = [(b.x + b.sx / 2) * .4, (b.y + b.sy / 2) * .4 - 1.3, (b.z + b.sz / 2) * .4];

    const n = normals[face], material = materialFaces(b.material, face), tile = textureNames.indexOf(material);
    if (tile < 0) throw new Error(`Unknown texture ${material}`);
    const tint = new Color(b.material === 'grass' && face === 2 ? '#91ad64' : b.tint);
    const sunlight = Math.max(0, n[0] * -.56 + n[1] * .76 - n[2] * .33);
    const exposure = shadow(b.x + b.sx / 2 + n[0] * (b.sx / 2 + .02), b.y + b.sy / 2 + n[1] * (b.sy / 2 + .02), b.z + b.sz / 2 + n[2] * (b.sz / 2 + .02));
    const shade = material === 'glowstone' ? 1.85 : (.48 + sunlight * exposure * .72) * (material === 'andesite' ? 1.3 : 1);
    const record = Buffer.alloc(24);
    center.forEach((value, axis) => record.writeInt16LE(Math.round(value * 1000), axis * 2));
    [b.sx, b.sy, b.sz].forEach((value, axis) => record.writeUInt16LE(Math.round(value * 400), 6 + axis * 2));
    record[12] = tile;
    [tint.r, tint.g, tint.b].forEach((value, axis) => { record[13 + axis] = Math.round(value * 255); });
    record[16] = Math.round(shade * 100); record[17] = face; record.writeUInt16LE(id, 18);
    record.writeUInt16LE(Math.round((b.uv[0]%1)*1000),20);
    record.writeUInt16LE(Math.round((b.uv[1]%1)*1000),22);
    records.push(record);
});
const header = Buffer.alloc(8);
header.writeUInt32LE(0x53544d44, 0); header.writeUInt32LE(records.length, 4);
await mkdir('public/home/minecraft', { recursive: true });
const compressed = gzipSync(Buffer.concat([header, ...records]), { level: 9 });
await writeFile('public/home/minecraft/settlement.bin.gz', compressed);
const report = { blocks: blocks.length, vertices: records.length * 4, triangles: records.length * 2, stride: 14, bytes: records.length * (4 * 14 * 4 + 6 * 4), packedBytes: 8 + records.length * 24, transferredBytes: compressed.length, bounds: { lighthouseHeight: 36 * .4, groundWidth: 48 * .4 }, lighting: 'Two-ray offline voxel sun occlusion, directional face light and contact shading. No runtime shadow maps.' };
await writeFile('public/home/minecraft/settlement.json', JSON.stringify(report, null, 2) + '\n');
console.log(report);
