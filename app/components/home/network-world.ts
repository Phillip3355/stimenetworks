import * as THREE from 'three';
import { networkCell } from './timeline.mjs';

export function createNetworkWorld(world: THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>) {
  // Closed cubes replace the sealed world during breakup: no culled interior
  // surfaces can become holes. Reuse the original atlas, with no extra texture.
  const geometry = new THREE.BoxGeometry(.32, .32, .32);
  const centers = world.geometry.getAttribute('aCenter');
  const ids = world.geometry.getAttribute('aId');
  const tiles = world.geometry.getAttribute('aTile');
  const tints = world.geometry.getAttribute('aTint');
  const unique = new Map<number, number>();
  for (let i = 0; i < ids.count; i += 4) if (!unique.has(ids.getX(i))) unique.set(ids.getX(i), i);
  const samples = [...unique.values()];
  const sources = new Float32Array(1080 * 3), colors = new Float32Array(1080 * 3);
  const tile = new Float32Array(1080), seeds = new Float32Array(1080);
  for (let id = 0; id < 1080; id++) {
    // A coprime permutation interleaves distant building/terrain blocks in racks.
    const sample = samples[Math.floor(((id * 487) % 1080) / 1080 * samples.length)];
    sources.set([centers.getX(sample), centers.getY(sample), centers.getZ(sample)], id * 3);
    colors.set([tints.getX(sample), tints.getY(sample), tints.getZ(sample)], id * 3);
    tile[id] = tiles.getX(sample); seeds[id] = id;
  }
  geometry.setAttribute('aSource', new THREE.InstancedBufferAttribute(sources, 3));
  geometry.setAttribute('aTint', new THREE.InstancedBufferAttribute(colors, 3));
  geometry.setAttribute('aTile', new THREE.InstancedBufferAttribute(tile, 1));
  geometry.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seeds, 1));
  const material = new THREE.ShaderMaterial({
    uniforms: { uAtlas: world.material.uniforms.uAtlas, uNetwork: { value: 0 }, uSpread: { value: 1 } },
    vertexShader: `
      uniform float uNetwork, uSpread;
      attribute vec3 aSource, aTint;
      attribute float aTile, aSeed;
      varying vec2 vUv;
      varying vec3 vTint;
      varying float vTile, vLight;
      void main() {
        float t = clamp(uNetwork, 0., 1.);
        float burst = sin(t * 3.14159265);
        float seed = aSeed * 2.39996323;
        float angle = burst * (5. + mod(aSeed, 5.));
        mat2 spin = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
        vec3 local = position;
        local.xz = spin * local.xz;
        local.xy = spin * local.xy;
        local *= smoothstep(0., .09, t);
        vec3 destination = instanceMatrix[3].xyz;
        vec3 p = mix(aSource, destination, smoothstep(.08, .98, t));
        p += burst * uSpread * vec3(sin(seed + t * 9.) * 8., cos(seed * 1.7 + t * 7.) * 6., cos(seed + t * 11.) * 8.);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p + local, 1.);
        vUv = uv; vTint = aTint; vTile = aTile;
        vLight = .55 + .45 * max(0., dot(normal, normalize(vec3(-.5, 1., .6))));
      }
    `,
    fragmentShader: world.material.fragmentShader.replace(
      'gl_FragColor = vec4(color, 1.0 - uNetwork);',
      'color = mix(color, vec3(.82) * vLight, smoothstep(.65, .98, uNetwork)); gl_FragColor = vec4(color, 1.0);'
    ).replace('else if (texel.a < .4 && vTile < 27.5) discard;', 'else if (texel.a < .4 && vTile < 27.5 && uNetwork < .65) discard;'),
  });
  const mesh = new THREE.InstancedMesh(geometry, material, 1080), transform = new THREE.Object3D();
  for (let id = 0; id < 1080; id++) {
    const [x, y, z] = networkCell(id);
    transform.position.set(x, y, z); transform.updateMatrix(); mesh.setMatrixAt(id, transform.matrix);
  }
  mesh.frustumCulled = false;
  return { mesh, uniforms: material.uniforms };
}
