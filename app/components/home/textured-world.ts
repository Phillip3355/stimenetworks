import * as THREE from 'three';
import { expandSettlement } from './settlement-geometry.mjs';

export async function createTexturedWorld(signal?: AbortSignal) {
  // Data is baked offline. Runtime never traverses a voxel map or ray-casts shadows.
  const response = await fetch('/home/minecraft/settlement.bin.gz', { signal });
  if (!response.ok || !response.body) throw new Error('World geometry unavailable');
  const buffer = await new Response(response.body.pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
  signal?.throwIfAborted();
  const { vertices, indices } = expandSettlement(buffer);
  const atlas = await new Promise<THREE.Texture>((resolve, reject) => {
    const onAbort = () => reject(signal?.reason);
    signal?.addEventListener('abort', onAbort, { once: true });
    new THREE.TextureLoader().load('/home/minecraft/blocks.png', texture => {
      signal?.removeEventListener('abort', onAbort);
      if (signal?.aborted) { texture.dispose(); reject(signal.reason); }
      else resolve(texture);
    }, undefined, error => { signal?.removeEventListener('abort', onAbort); reject(error); });
  });
  if (signal?.aborted) { atlas.dispose(); signal.throwIfAborted(); }
  atlas.colorSpace = THREE.SRGBColorSpace;
  atlas.magFilter = THREE.NearestFilter;
  atlas.minFilter = THREE.NearestMipmapLinearFilter;
  atlas.generateMipmaps = true;
  const geometry = new THREE.BufferGeometry();
  const interleaved = new THREE.InterleavedBuffer(vertices, 14);
  for (const [name, size, offset] of [['position', 3, 0], ['aCenter', 3, 3], ['uv', 2, 6], ['aTint', 3, 8], ['aTile', 1, 11], ['aLight', 1, 12], ['aId', 1, 13]] as const) geometry.setAttribute(name, new THREE.InterleavedBufferAttribute(interleaved, size, offset));
  geometry.setIndex(new THREE.BufferAttribute(indices, 1));
  const uniforms = { uAtlas: { value: atlas }, uExplode: { value: 0 }, uNetwork: { value: 0 }, uSplit: { value: 0 }, uTime: { value: 0 } };
  const material = new THREE.ShaderMaterial({
    uniforms, transparent: true,
    vertexShader: `
      attribute vec3 aCenter;
      attribute vec3 aTint;
      attribute float aTile;
      attribute float aLight;
      attribute float aId;
      uniform float uExplode, uNetwork, uSplit, uTime;
      varying vec2 vUv;
      varying vec3 vTint;
      varying float vTile, vLight;
      void main() {
        gl_Position = projectionMatrix * modelViewMatrix * vec4(aCenter + position, 1.0);
        vUv = uv; vTile = aTile; vTint = aTint; vLight = aLight;
      }
    `,
    fragmentShader: `
      uniform sampler2D uAtlas;
      uniform float uNetwork;
      varying vec2 vUv;
      varying vec3 vTint;
      varying float vTile, vLight;
      void main() {
        // Repeat every block, including half-block stair UVs. Original 16px pixels.
        vec2 pixel = floor(fract(vUv) * 16.0) + .5;
        pixel.y = 16.0 - pixel.y;
        vec2 cell = vec2(mod(vTile, 8.0), floor(vTile / 8.0)) * 32.0;
        vec2 atlasUv = (cell + vec2(8.0) + pixel) / vec2(256.0, 128.0);
        atlasUv.y = 1.0 - atlasUv.y;
        // Derivatives come from continuous block UVs, avoiding seams at each repeat.
        vec2 scale = vec2(16.0 / 256.0, 16.0 / 128.0);
        vec2 limit = vec2(8.0/256.0,8.0/128.0);
        vec4 texel = textureGrad(uAtlas, atlasUv, clamp(dFdx(vUv) * scale,-limit,limit), clamp(dFdy(vUv) * scale,-limit,limit));
        if (vTile >= 10.0 && vTile <= 12.0) {
          // Minecraft's opaque-leaf presentation: dense canopies at every quality.
          texel.rgb = mix(vec3(.075), texel.rgb, texel.a);
        } else if (texel.a < .4 && vTile < 27.5) discard;
        vec3 color = texel.rgb * vTint * vLight;
        color *= vec3(1.06, 1.0, .91);
        // Light sources stay bright without a bloom pass.
        if (vTile > 17.5 && vTile < 18.5) color = mix(color, vec3(1.0, .8, .28), .5);

        gl_FragColor = vec4(color, 1.0 - uNetwork);
        #include <colorspace_fragment>
      }
    `,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;
  return { mesh, uniforms, dispose() { geometry.dispose(); material.dispose(); atlas.dispose(); } };
}
