const featureMotions = [
  {
    kind: 'clip-reveal',
    image: { opacity: 0.72, scale: 1.07, clipPath: 'inset(0 0 100% 0)' },
    copy: { opacity: 0, y: 24 },
  },
  {
    kind: 'depth-rise',
    image: { opacity: 0.68, scale: 1.095, y: 28 },
    copy: { opacity: 0, y: 38 },
  },
  {
    kind: 'split-drift',
    image: { opacity: 0.7, scale: 1.045, x: 34 },
    copy: { opacity: 0, x: -26 },
  },
];

export function getHeroRevealTransition(index, reducedMotion) {
  if (reducedMotion) return { duration: 0, delay: 0 };

  return {
    duration: 0.72,
    delay: 0.12 * (index + 1),
    ease: [0.22, 0.75, 0.2, 1],
  };
}

export function getFeatureMotion(index, reducedMotion) {
  if (reducedMotion) {
    return { kind: 'reduced', image: false, copy: false };
  }

  return featureMotions[index % featureMotions.length];
}
