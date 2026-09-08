import * as THREE from 'three';
import { adaptQuality, shouldAnimate, chooseQuality, qualitySettings, sampleTimeline } from './timeline.mjs';
import { createInfrastructure, createPortal } from './world';
import { createTexturedWorld } from './textured-world';
import { createNetworkWorld } from './network-world';

export type SceneController = {
  setProgress: (progress: number) => void;
  setPointer: (x: number, y: number) => void;
  dispose: () => void;
};

type DeviceNavigator = Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };

export async function createScene(host: HTMLElement, onFailure: () => void, signal?: AbortSignal): Promise<SceneController> {
  signal?.throwIfAborted();
  const device = navigator as DeviceNavigator;
  let mobile = window.innerWidth <= 1024 && window.innerHeight > window.innerWidth;
  const deviceQuality = () => chooseQuality({ cores: device.hardwareConcurrency, memory: device.deviceMemory, mobile: window.innerWidth < 760 || matchMedia('(pointer: coarse)').matches, saveData: device.connection?.saveData });
  let quality = deviceQuality();
  let settings = qualitySettings(quality, devicePixelRatio, host.clientWidth, host.clientHeight);
  // Reject unsupported GPUs before downloading/decompressing the world.
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'low-power', failIfMajorPerformanceCaveat: true });
  const loading = new AbortController();
  const abortLoading = () => loading.abort(signal?.reason);
  const loseWhileLoading = (event: Event) => { event.preventDefault(); loading.abort(new Error('WebGL lost while loading')); };
  signal?.addEventListener('abort', abortLoading, { once: true });
  renderer.domElement.addEventListener('webglcontextlost', loseWhileLoading);
  let world: Awaited<ReturnType<typeof createTexturedWorld>>;
  try {
    world = await createTexturedWorld(loading.signal);
    if (renderer.getContext().isContextLost()) { world.dispose(); throw new Error('WebGL lost while loading'); }
  }
  catch (error) { renderer.dispose(); renderer.forceContextLoss(); throw error; }
  finally { signal?.removeEventListener('abort', abortLoading); renderer.domElement.removeEventListener('webglcontextlost', loseWhileLoading); }
  renderer.setClearColor(0x090909, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.setAttribute('aria-hidden', 'true');
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(39, 1, .1, 130);
  const root = new THREE.Group();
  root.add(world.mesh);
  const network = createNetworkWorld(world.mesh);
  root.add(network.mesh);
  const infrastructure = createInfrastructure();
  root.add(infrastructure.group);
  scene.add(root);

  const javaPortal = createPortal('#eeeeee');
  const bedrockPortal = createPortal('#aaaaaa');
  javaPortal.position.set(-8.2, 1.8, 0);
  bedrockPortal.position.set(8.2, 1.8, 0);
  root.add(javaPortal, bedrockPortal);

  // Fine orbit and survey lines provide scale without transparent particle clouds.
  const orbitPoints = Array.from({ length: 129 }, (_, i) => {
    const angle = i / 128 * Math.PI * 2;
    return new THREE.Vector3(Math.cos(angle) * 10.6, -3.9, Math.sin(angle) * 10.6);
  });
  const orbit = new THREE.Line(new THREE.BufferGeometry().setFromPoints(orbitPoints), new THREE.LineBasicMaterial({ color: '#888888', transparent: true, opacity: .55 }));
  root.add(orbit);
  const grid = new THREE.GridHelper(25, 16, '#666666', '#303030');
  grid.position.y = -4.7;
  const gridMaterial = grid.material as THREE.Material;
  gridMaterial.transparent = true;
  gridMaterial.opacity = .19;
  root.add(grid);

  const particleGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(112 * 3);
  for (let i = 0; i < 112; i++) {
    positions[i * 3] = Math.sin(i * 13.31) * 17;
    positions[i * 3 + 1] = Math.cos(i * 8.17) * 8;
    positions[i * 3 + 2] = Math.sin(i * 4.73) * 16;
  }
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particles = new THREE.Points(particleGeometry, new THREE.PointsMaterial({ color: '#cccccc', size: .045, sizeAttenuation: true }));
  root.add(particles);

  const packetGeometry = new THREE.BoxGeometry(.11, .11, .32);
  const packets = new THREE.InstancedMesh(packetGeometry, new THREE.MeshBasicMaterial({ color: '#ffffff' }), 20);
  packets.frustumCulled = false;
  const packetDummy = new THREE.Object3D();
  root.add(packets);

  // Compile every transition material while the poster is visible. First entering
  // the network must not trigger several driver shader compilations mid-scroll.
  try { renderer.compile(scene, camera); }
  catch (error) { world.dispose(); renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove(); throw error; }

  let progress = 0, targetProgress = 0, pointerX = 0, pointerY = 0;
  let targetX = 0, targetY = 0, lastRendered = 0, lastRaf = 0;
  let raf = 0, disposed = false, visible = true, activeUntil = 0;
  let samples: number[] = [];
  let frames = 0;

  function resize() {
    if (disposed) return;
    const width = host.clientWidth, height = host.clientHeight;
    const nextMobile = window.innerWidth <= 1024 && window.innerHeight > window.innerWidth;
    if (nextMobile !== mobile) quality = deviceQuality();
    mobile = nextMobile;
    settings = qualitySettings(quality, devicePixelRatio, width, height);
    renderer.setPixelRatio(settings.dpr);
    renderer.setSize(width, height);
    camera.aspect = width / Math.max(1, height);
    camera.fov = mobile ? 43 : height < 520 ? 47 : 39;
    camera.updateProjectionMatrix();
    particleGeometry.setDrawRange(0, settings.particles);
    host.dataset.quality = quality;
    wake();
  }

  function draw(now: number) {
    raf = 0;
    if (disposed || document.hidden || !visible) return;
    const rafDelta = lastRaf ? now - lastRaf : 16.7;
    lastRaf = now;
    if (now - lastRendered < 1000 / settings.fps - .5) {
      raf = requestAnimationFrame(draw);
      return;
    }
    const elapsed = lastRendered ? Math.min(64, now - lastRendered) : 16.7;
    lastRendered = now;
    const alpha = 1 - Math.exp(-elapsed / (mobile ? 60 : 90));
    const velocity = targetProgress - progress;
    progress += velocity * alpha;
    pointerX += (targetX - pointerX) * alpha;
    pointerY += (targetY - pointerY) * alpha;
    const pose = sampleTimeline(progress, mobile);
    camera.position.set(pose.camera[0] + pointerX * .65, pose.camera[1] + pointerY * .4, pose.camera[2]);
    camera.lookAt(pose.target[0], pose.target[1], pose.target[2]);
    root.rotation.y = pose.rotation + Math.max(-.025, Math.min(.025, velocity));
    root.rotation.z = mobile ? 0 : pointerX * .007;
    world.mesh.visible = pose.network < .18;
    network.mesh.visible = pose.network > .01;
    network.uniforms.uNetwork.value = pose.network;
    network.uniforms.uSpread.value = mobile ? .72 : 1;
    world.uniforms.uNetwork.value = Math.min(1, pose.network / .18);
    world.uniforms.uSplit.value = pose.split;
    world.uniforms.uTime.value = now / 1000;
    infrastructure.material.opacity = pose.network * .65;
    infrastructure.group.visible = pose.network > .01;
    orbit.visible = grid.visible = particles.visible = pose.network > .03 || pose.split > .03;
    javaPortal.visible = bedrockPortal.visible = pose.split > .05;
    javaPortal.scale.setScalar(.65 + pose.split * .35);
    bedrockPortal.scale.copy(javaPortal.scale);
    packets.visible = pose.split > .05 || pose.network > .05;
    if (packets.visible) {
      for (let i = 0; i < 20; i++) {
        const phase = ((now / 2400 + i / 20) % 1);
        packetDummy.position.set((phase - .5) * 16, -3.8 + Math.sin(i) * .16, .2);
        packetDummy.updateMatrix();
        packets.setMatrixAt(i, packetDummy.matrix);
      }
      packets.instanceMatrix.needsUpdate = true;
    }
    const start = performance.now();
    renderer.render(scene, camera);
    const cpu = performance.now() - start;
    frames++;
    // Low-frequency DOM diagnostics enable reproducible profiling without globals.
    if (frames % 20 === 0 || frames === 1) {
      host.dataset.calls = String(renderer.info.render.calls);
      host.dataset.triangles = String(renderer.info.render.triangles);
      host.dataset.frames = String(frames);
      host.dataset.frameMs = cpu.toFixed(2);
      host.dataset.geometries = String(renderer.info.memory.geometries);
      host.dataset.textures = String(renderer.info.memory.textures);
      host.dataset.networkNodes = String(network.mesh.count);
      host.dataset.packetPhase = String((now / 2400) % 1);
    }
    if (frames > 10 && rafDelta < 150) {
      samples.push(Math.max(cpu, rafDelta));
      if (samples.length >= 60) {
        const next = adaptQuality(quality, samples);
        samples = [];
        if (next !== quality) { quality = next; resize(); }
      }
    }
    const unsettled = Math.abs(targetProgress - progress) > .00005 || Math.abs(targetX - pointerX) > .002 || Math.abs(targetY - pointerY) > .002;
    if (unsettled || shouldAnimate(pose) || now < activeUntil) {
      if (!raf) raf = requestAnimationFrame(draw);
    } else {
      host.dataset.frames = String(frames);
      host.dataset.sleeping = 'true';
    }
  }

  function wake() {
    if (disposed || document.hidden || !visible) return;
    activeUntil = performance.now() + (mobile ? 500 : 850);
    host.dataset.sleeping = 'false';
    if (!raf) { lastRaf = 0; raf = requestAnimationFrame(draw); }
  }

  function onVisibility() {
    if (document.hidden) { cancelAnimationFrame(raf); raf = 0; }
    else wake();
  }
  function onContextLost(event: Event) {
    event.preventDefault();
    cancelAnimationFrame(raf);
    raf = 0;
    onFailure();
  }
  renderer.domElement.addEventListener('webglcontextlost', onContextLost);
  document.addEventListener('visibilitychange', onVisibility);
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) wake(); else { cancelAnimationFrame(raf); raf = 0; }
  });
  intersection.observe(host);
  resize();

  return {
    setProgress(value) { targetProgress = value; wake(); },
    setPointer(x, y) { if (!mobile) { targetX = x; targetY = y; wake(); } },

    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      observer.disconnect();
      intersection.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      const geometries = new Set<THREE.BufferGeometry>();
      const materials = new Set<THREE.Material>();
      scene.traverse(object => {
        const drawable = object as THREE.Mesh;
        if (drawable.geometry) geometries.add(drawable.geometry);
        if (drawable.material) (Array.isArray(drawable.material) ? drawable.material : [drawable.material]).forEach(m => materials.add(m));
        if (object instanceof THREE.InstancedMesh) object.dispose();
      });
      geometries.forEach(geometry => geometry.dispose());
      materials.forEach(material => material.dispose());
      world.uniforms.uAtlas.value.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    },
  };
}
