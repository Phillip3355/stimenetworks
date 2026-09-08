import * as THREE from 'three';
import { networkCell } from './timeline.mjs';

export function createNetworkWorld() {
  // Every node is a closed, identically sized cube. Terrain face culling is never
  // reused here, so rotating the network cannot expose missing walls or stair fragments.
  const geometry = new THREE.BoxGeometry(.32,.32,.32);
  const material = new THREE.ShaderMaterial({
    uniforms:{uReveal:{value:0}},
    vertexShader:`uniform float uReveal; varying float vLight;
      void main(){ vLight=.5+.5*max(0.,dot(normal,normalize(vec3(-.5,1.,.6))));
      vec3 p=(instanceMatrix*vec4(position*uReveal,1.)).xyz;
      gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.); }`,
    fragmentShader:`varying float vLight; void main(){gl_FragColor=vec4(vec3(.82)*vLight,1.); #include <colorspace_fragment> }`.replace('#include','\n#include').replace('> }','>\n}'),
  });
  const mesh = new THREE.InstancedMesh(geometry,material,1080), transform=new THREE.Object3D();
  for(let id=0;id<1080;id++){ const [x,y,z]=networkCell(id); transform.position.set(x,y,z); transform.updateMatrix(); mesh.setMatrixAt(id,transform.matrix); }
  mesh.frustumCulled=false;
  return {mesh,uniforms:material.uniforms};
}
