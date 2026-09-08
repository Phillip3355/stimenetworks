export const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, Number.isFinite(value) ? value : min));
const mix = (a, b, t) => a + (b - a) * t;
const smooth = (t) => t * t * (3 - 2 * t);
export const chapterOpacity = (progress, index) => smooth(clamp((.43 - Math.abs(clamp(progress) * 6 - index)) / .19));
export const shouldAnimate = pose => pose.network > .01 || pose.split > .01;
export const networkCell = id => { const rack=Math.floor(id/360),cell=id%360; return [(rack-1)*6+(Math.floor(cell/6)%6-2.5)*.5,(Math.floor(cell/36)-4.5)*.65,(cell%6-2.5)*.5]; };

// Seven poses are interpolated continuously. These are artistic coordinates,
// never live server metrics. Portrait uses its own path and target placement.
const poses = [
  { camera: [21, 19, 32], mobile: [28, 25, 43], target: [-2.2, 3, 0], rotation: -0.22, explode: 0, network: 0, split: 0, portal: 0.25 },
  { camera: [12, 14, 27], mobile: [24, 23, 38], target: [-2, 4, 0], rotation: -0.12, explode: 0, network: 0, split: 0, portal: 0.7 },
  { camera: [23, 12, 27], mobile: [30, 26, 38], target: [-2, 0, 0], rotation: -0.18, explode: 0.1, network: 0, split: 1, portal: 1 },
  { camera: [22, 16, 29], mobile: [26, 25, 36], target: [-2, 1, 0], rotation: 0.45, explode: 1, network: 1, split: 0, portal: 0.3 },
  { camera: [12, 9, 17], mobile: [22, 20, 30], target: [-1, 1, 0], rotation: .45, explode: 1, network: 1, split: 0, portal: 0.7 },
  { camera: [25, 19, 31], mobile: [28, 26, 40], target: [-2, 3, 0], rotation: .45, explode: 0, network: 0, split: 0, portal: 0.5 },
  { camera: [11, 11, 24], mobile: [25, 23, 38], target: [-2.7, 4, 0], rotation: -.12, explode: 0, network: 0, split: 0, portal: 1 },
];

export function sampleTimeline(progress, mobile = false) {
  const position = clamp(progress) * 6;
  const index = Math.min(5, Math.floor(position));
  const t = smooth(position - index);
  const from = poses[index];
  const to = poses[index + 1];
  const cameraKey = mobile ? 'mobile' : 'camera';
  return {
    camera: from[cameraKey].map((v, i) => mix(v, to[cameraKey][i], t)),
    target: mobile ? [0, 3.5, 0] : from.target.map((v, i) => mix(v, to.target[i], t)),
    rotation: mix(from.rotation, to.rotation, t),
    explode: mix(from.explode, to.explode, t),
    network: mix(from.network, to.network, t),
    split: mix(from.split, to.split, t),
    portal: mix(from.portal, to.portal, t),
  };
}

export function chooseQuality({ cores = 4, memory = 4, mobile = false, saveData = false } = {}) {
  if (saveData || cores <= 2 || memory <= 2) return 'low';
  if (!mobile && cores >= 8 && memory >= 8) return 'high';
  return 'balanced';
}

export function qualitySettings(level, deviceDpr = 1, width = 1440, height = 900) {
  const caps = level === 'low' ? [1, 30, 32] : level === 'high' ? [1.5, 60, 112] : [1.25, 45, 64];
  return {
    dpr: Math.min(caps[0], Math.max(0.1, deviceDpr), Math.sqrt(2400000 / Math.max(1, width * height))),
    fps: caps[1], particles: caps[2],
  };
}

export function adaptQuality(level, samples) {
  if (samples.length < 60 || level === 'low') return level;
  const expensive = samples.filter((ms) => ms > (level === 'high' ? 23 : 32)).length;
  return expensive > samples.length * 0.65 ? (level === 'high' ? 'balanced' : 'low') : level;
}
