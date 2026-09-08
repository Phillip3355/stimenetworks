// Screenshot reconstruction in Minecraft block units. Hidden backs are inferred.
// Integer cells are solid cubes; stairs, eaves, rails and props use partial boxes.
export const textureNames = ['bricks', 'polished_andesite', 'stone_bricks', 'cobblestone', 'deepslate_tiles', 'spruce_planks', 'spruce_log', 'spruce_log_top', 'birch_log', 'birch_log_top', 'birch_leaves', 'spruce_leaves', 'oak_leaves', 'gravel', 'grass_block_top', 'grass_block_side', 'dirt', 'sand', 'glowstone', 'iron_bars', 'barrel_side', 'barrel_top', 'mossy_cobblestone', 'stone', 'lantern', 'short_grass', 'oak_planks', 'andesite', 'water_still'];
const random = n => { const f = Math.sin(n * 127.1 + 311.7) * 43758.5453; return f - Math.floor(f); };
export function createSettlement() {
  const cells = new Map(), details = [];
  const cube = (x, y, z, material, tint = '#ffffff') => cells.set(`${x},${y},${z}`, { x, y, z, sx: 1, sy: 1, sz: 1, material, tint, solid: true });
  const box = (x, y, z, sx, sy, sz, material, tint = '#ffffff') => details.push({ x, y, z, sx, sy, sz, material, tint, solid: false });
  const fill = (x, y, z, sx, sy, sz, material) => { for (let a = 0; a < sx; a++) for (let b = 0; b < sy; b++) for (let c = 0; c < sz; c++) cube(x + a, y + b, z + c, material); };
  // A gravel clearing meets an irregular sandy riverbank, with rising woodland behind.
  for (let x = -23; x <= 24; x++) for (let z = -24; z <= 18; z++) {
    if ((x / 26) ** 2 + ((z + 2) / 25) ** 2 > 1.13) continue;
    const river = x < -16 + Math.sin(z * .23) * 2;
    const wooded = z < -7 || x > 18;
    const height = wooded ? Math.max(0, Math.floor((-z - 7) / 6)) : 0;
    const top = river ? -2 : height;
    for (let y = -3; y < top; y++) cube(x, y, z, y === top - 1 ? river ? 'sand' : wooded ? 'grass' : random(x * 23 + z) > .12 ? 'gravel' : 'cobblestone' : y < -2 ? 'stone' : 'dirt');
    if (river) box(x, -1.6, z, 1, .04, 1, 'water_still', '#799ca9');
  }
  // Lighthouse: narrow tall octagonal shaft, five brick/andesite bands.
  const tx = -7, tz = 0;
  for (let y = 0; y < 27; y++) for (let x = -3; x <= 3; x++) for (let z = -3; z <= 3; z++) {
    if (Math.abs(x) === 3 && Math.abs(z) === 3) continue;
    if (Math.abs(x) < 2 && Math.abs(z) < 2) continue;
    const material = y < 2 ? 'stone_bricks' : y % 6 < 3 ? 'andesite' : 'bricks';
    cube(tx + x, y, tz + z, material);
  }
  // Tall inset windows in timber frames, repeated on visible and inferred sides.
  for (const y of [7, 19]) for (const side of [-1, 1]) {
    fill(tx - 1, y, tz + side * 3, 3, 3, 1, 'spruce_planks');
    box(tx - 1.25, y - .3, tz + side * 3 + (side > 0 ? .65 : -.3), 3.5, .45, .65, 'spruce_planks');
    box(tx - 1.25, y + 3, tz + side * 3 + (side > 0 ? .65 : -.3), 3.5, .5, .65, 'spruce_planks');
    box(tx + .1, y + .25, tz + side * 3 + (side > 0 ? 1.01 : -.02), .8, 2.4, .02, 'iron_bars');
    box(tx + side * 3 + (side > 0 ? 1.01 : -.03), y + .25, tz - .5, .02, 2.4, 1.4, 'iron_bars');
    for (const frameZ of [-1.25, 1.9]) box(tx + side * 3 + (side > 0 ? .85 : -.25), y, tz + frameZ, .4, 3, .3, 'spruce_log');
    for (const frameY of [y - .3, y + 3]) box(tx + side * 3 + (side > 0 ? .85 : -.4), frameY, tz - 1.4, .6, .45, 3.8, 'spruce_planks');
  }
  // Stone belt corbels and lower buttresses.
  for (const y of [10, 24]) for (let i = -3; i <= 3; i++) {
    for (const side of [-1, 1]) {
      box(tx + i, y, tz + side * 3 + (side > 0 ? 1 : -.4), 1, .5, .4, 'stone_bricks');
      box(tx + side * 3 + (side > 0 ? 1 : -.4), y, tz + i, .4, .5, 1, 'stone_bricks');
      if (i % 2 === 0) {
        box(tx + i, y - .5, tz + side * 3 + (side > 0 ? 1 : -.3), 1, .5, .3, 'stone_bricks');
        box(tx + side * 3 + (side > 0 ? 1 : -.3), y - .5, tz + i, .3, .5, 1, 'stone_bricks');
      }
    }
  }
  fill(tx - 1, 0, tz + 3, 2, 3, 1, 'spruce_planks');
  for (const x of [-3, 3]) for (const z of [-2, 2]) fill(tx + x, 0, tz + z, 1, 3, 1, 'polished_andesite');
  // Overhanging dark stone balcony and individual iron rail bars.
  for (let x = -4; x <= 4; x++) for (let z = -4; z <= 4; z++) {
    if (Math.abs(x) === 4 && Math.abs(z) === 4) continue;
    box(tx + x, 26, tz + z, 1, .5, 1, 'deepslate_tiles');
    if (Math.abs(x) === 4 || Math.abs(z) === 4) {
      box(tx + x + .45, 26.5, tz + z + .45, .1, 1.35, .1, 'deepslate_tiles');
      box(tx + x, 27.7, tz + z, Math.abs(x) === 4 ? .15 : 1, .12, Math.abs(z) === 4 ? .15 : 1, 'deepslate_tiles');
    }
  }
  for (let x = -2; x <= 2; x++) for (let z = -2; z <= 2; z++) {
    cube(tx + x, 27, tz + z, 'stone_bricks');
    cube(tx + x, 31, tz + z, 'stone_bricks');
    if (Math.abs(x) === 2 || Math.abs(z) === 2) for (let y = 28; y < 31; y++) cube(tx + x, y, tz + z, Math.abs(x) === 2 && Math.abs(z) === 2 ? 'polished_andesite' : 'glowstone');
  }
  for (let layer = 0; layer < 3; layer++) for (let x = -3 + layer; x <= 3 - layer; x++) for (let z = -3 + layer; z <= 3 - layer; z++) box(tx + x, 32 + layer * .5, tz + z, 1, .5, 1, 'spruce_planks');
  box(tx + .35, 33.5, tz + .35, .3, 2.5, .3, 'deepslate_tiles');

  function house(x, z, w = 9, d = 7) {
    for (let a = 0; a < w; a++) for (let c = 0; c < d; c++) {
      cube(x + a, 0, z + c, 'stone_bricks');
      if (a === 0 || a === w - 1 || c === 0 || c === d - 1) for (let y = 1; y < 5; y++) cube(x + a, y, z + c, (a === 0 || a === w - 1) && (c === 0 || c === d - 1) ? 'spruce_log' : 'bricks');
    }
    // Ridge runs across the facade, exposing the broad steep roof in the reference.
    for (let c = 0; c < d; c++) for (let y = 5; y < 5 + Math.min(c, d - 1 - c); y++) for (const a of [0, w - 1]) cube(x + a, y, z + c, 'spruce_planks');
    for (let step = 0; step <= Math.floor(d / 2) + 1; step++) for (let a = -1; a <= w; a++) for (const side of [-1, 1]) {
      const c = side < 0 ? z - 1 + step : z + d - step;
      box(x + a, 4 + step, c, 1, .5, 1, 'spruce_planks');
      box(x + a, 4.5 + step, c + (side < 0 ? .5 : 0), 1, .5, .5, 'spruce_planks');
    }
    fill(x + Math.floor(w / 2), 1, z + d - 1, 1, 3, 1, 'spruce_planks');
    box(x + 1.2, 2.2, z + d + .01, 1.5, 1.5, .03, 'iron_bars');
    box(x + w - 2.7, 2.2, z + d + .01, 1.5, 1.5, .03, 'iron_bars');
    for (let a = 0; a < w; a++) box(x + a, 0, z + d, 1, .5, 1, 'stone_bricks');
    fill(x + w - 3, 6, z + 2, 1, 4, 1, 'stone_bricks');
    box(x + w - 3.15, 10, z + 1.85, 1.3, .3, 1.3, 'stone_bricks');
  }
  house(6, 2, 9, 7);
  house(-7, -9, 7, 5);
  house(17, -7, 5, 5);

  function tree(x, z, height, birch = true) {
    const y = z < -7 ? Math.max(0, Math.floor((-z - 7) / 6)) : 0;
    fill(x, y, z, 1, height, 1, birch ? 'birch_log' : 'spruce_log');
    for (let layer = 0; layer < (birch ? 4 : 7); layer++) {
      const radius = birch ? layer === 3 ? 1 : 2 : Math.max(0, Math.floor((6 - layer) / 2));
      for (let a = -radius; a <= radius; a++) for (let c = -radius; c <= radius; c++) {
        if (Math.abs(a) === radius && Math.abs(c) === radius && radius && random(x * 22 + z + layer) > .35) continue;
        if (a === 0 && c === 0 && layer < 2) continue;
        cube(x + a, y + height - 2 + layer, z + c, birch ? 'birch_leaves' : 'spruce_leaves', birch ? '#91ab66' : '#688252');
      }
    }
  }
  for (let z = -21; z <= -10; z += 5) for (let x = -20; x <= 22; x += 5) {
    if (z > -13 && x > -10 && x < 2) continue;
    tree(x + Math.floor(random(x * 7 + z) * 2), z, 6 + Math.floor(random(x + z * 9) * 3), random(x * 4 + z) > .25);
  }
  for (const [x, z, h, birch] of [[-15, 1, 9, 0], [-13, 8, 8, 0], [-19, 12, 7, 1], [20, 0, 7, 1], [22, 7, 6, 1], [-15, -6, 8, 1]]) tree(x, z, h, !!birch);

  const barrel = (x, z, y = 0) => box(x, y, z, 1, 1, 1, 'barrel');
  for (const [x, z, y] of [[-4, 4, 0], [-3, 4, 0], [-4, 4, 1], [-9, 4, 0], [8, 10, 0], [9, 10, 0], [8, 10, 1], [16, 6, 0]]) barrel(x, z, y);
  for (const [x, z] of [[-11, 10], [-2, 8], [3, -1], [15, -4], [-12, -7]]) {
    box(x + .38, 0, z + .38, .24, 2.5, .24, 'spruce_log');
    box(x + .25, 2.5, z + .25, .5, .65, .5, 'glowstone');
    box(x + .18, 3.15, z + .18, .64, .15, .64, 'deepslate_tiles');
  }
  return { cells, details };
}

export const materialFaces = (name, face) => name === 'grass' ? face === 2 ? 'grass_block_top' : face === 3 ? 'dirt' : 'grass_block_side' : name === 'barrel' ? face === 2 || face === 3 ? 'barrel_top' : 'barrel_side' : name.endsWith('_log') && (face === 2 || face === 3) ? `${name}_top` : name;

// Neighbor culling preserves leaf cutouts against the sky; solid terrain interiors vanish.
export function visibleBoxes({ cells, details }) {
  const directions = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
  const blocks = [];
  for (const block of cells.values()) {
    const faces = directions.map(([dx, dy, dz]) => {
      const neighbor = cells.get(`${block.x + dx},${block.y + dy},${block.z + dz}`);
      return !neighbor || neighbor.material.includes('leaves') && !block.material.includes('leaves');
    });
    if (faces.some(Boolean)) blocks.push({ ...block, faces });
  }
  return [...blocks, ...details.map(block => ({ ...block, faces: [true, true, true, true, true, true] }))];
}
