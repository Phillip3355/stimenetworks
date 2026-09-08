// Source PNGs are extracted from the SHA-1 verified Mojang client archive.
// This packs original pixels, without generating or painting replacement textures.
import sharp from 'sharp';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
export const names = ['bricks', 'polished_andesite', 'stone_bricks', 'cobblestone', 'deepslate_tiles', 'spruce_planks', 'spruce_log', 'spruce_log_top', 'birch_log', 'birch_log_top', 'birch_leaves', 'spruce_leaves', 'oak_leaves', 'gravel', 'grass_block_top', 'grass_block_side', 'dirt', 'sand', 'glowstone', 'iron_bars', 'barrel_side', 'barrel_top', 'mossy_cobblestone', 'stone', 'lantern', 'short_grass', 'oak_planks', 'andesite', 'water_still'];
const directory = 'public/home/minecraft';
await mkdir(directory, { recursive: true });
const layers = [], sources = [];
for (const [index, name] of names.entries()) {
  const input = await readFile(`scratch/cinematic/assets/blocks/${name}.png`);
  const metadata = await sharp(input).metadata();
  // Animated textures use their first original frame. Eight-pixel edge padding.
  const tile = await sharp(input).extract({ left: 0, top: 0, width: 16, height: 16 }).extend({ top: 8, bottom: 8, left: 8, right: 8, extendWith: 'copy' }).png().toBuffer();
  layers.push({ input: tile, left: index % 8 * 32, top: Math.floor(index / 8) * 32 });
  sources.push({ name, sha256: createHash('sha256').update(input).digest('hex'), originalSize: [metadata.width, metadata.height], tile: index });
}
await sharp({ create: { width: 256, height: 128, channels: 4, background: '#00000000' } }).composite(layers).png({ compressionLevel: 9, palette: false }).toFile(`${directory}/blocks.png`);
await writeFile(`${directory}/sources.json`, JSON.stringify({ edition: 'Minecraft Java 1.21.1', owner: 'Mojang / Microsoft', source: 'https://piston-data.mojang.com/v1/objects/30c73b1c5da787909b2f73340419fdf13b9def88/client.jar', clientSHA1: '30c73b1c5da787909b2f73340419fdf13b9def88', processing: 'Original 16px pixels; edge padding; first frame for animated images. No AI textures.', textures: sources }, null, 2) + '\n');
console.log(`Packed ${names.length} original block textures into 256×128 atlas.`);
