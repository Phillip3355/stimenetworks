import { mkdir, readFile, writeFile, copyFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
const directory = 'scratch/cinematic/assets';
await mkdir(`${directory}/blocks`, { recursive: true });
await mkdir(`${directory}/extracted`, { recursive: true });
const source = JSON.parse(await readFile('public/home/minecraft/sources.json', 'utf8'));
const client = `${directory}/minecraft-1.21.1-client.jar`;
if (!existsSync(client)) {
  const response = await fetch(source.source);
  if (!response.ok) throw new Error('Minecraft client download failed');
  await writeFile(client, Buffer.from(await response.arrayBuffer()));
}
if (createHash('sha1').update(await readFile(client)).digest('hex') !== source.clientSHA1) throw new Error('Minecraft client archive hash mismatch');
const paths = source.textures.map(texture => `assets/minecraft/textures/block/${texture.name}.png`);
// System bsdtar supports ZIP/JAR; extract only the explicitly listed texture files.
execFileSync('tar', ['-xf', resolve(client), '-C', resolve(`${directory}/extracted`), ...paths], { windowsHide: true });
for (const [index, texture] of source.textures.entries()) {
  const path = `${directory}/extracted/${paths[index]}`;
  const input = await readFile(path);
  if (createHash('sha256').update(input).digest('hex') !== texture.sha256) throw new Error(`Texture hash mismatch: ${texture.name}`);
  await copyFile(path, `${directory}/blocks/${texture.name}.png`);
}
console.log('Verified the Mojang archive and all 29 original texture hashes.');
