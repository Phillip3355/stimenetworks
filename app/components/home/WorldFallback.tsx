import { memo } from 'react';

// Static vector art must not rebuild its tile tree on every chapter change.
export default memo(function WorldFallback() {
  const tiles = [];
  for (let x = 0; x < 11; x++) for (let z = 0; z < 11; z++) {
    if (Math.hypot(x - 5, z - 5) > 5.8) continue;
    const px = 410 + (x - z) * 23, py = 195 + (x + z) * 11;
    const depth = 45 + ((x * 17 + z * 13) % 5) * 10;
    const shade = ['#789278', '#8b9f81', '#a0b397', '#617a66'][(x + z * 3) % 4];
    tiles.push(<g key={`${x}-${z}`}>
      <path d={`M${px - 23} ${py}l23 11v${depth}l-23 -11z`} fill="#344f46" stroke="#080e10" strokeWidth=".6" />
      <path d={`M${px} ${py + 11}l23 -11v${depth}l-23 11z`} fill="#243d39" stroke="#080e10" strokeWidth=".6" />
      <path d={`M${px} ${py - 11}l23 11 -23 11 -23 -11z`} fill={shade} stroke="#4b6557" strokeWidth=".6" />
    </g>);
  }
  return <svg viewBox="0 0 820 620" fill="none" aria-hidden="true">
    <ellipse cx="410" cy="422" rx="300" ry="115" stroke="#416457" />
    <path d="M110 422h600M410 500v40M110 422l300 -145 300 145 -300 145z" stroke="#355147" strokeDasharray="3 9" />
    {tiles}
    <g stroke="#bff2cf" strokeWidth="3"><path d="M354 324V189l108 15v135M354 189l24 -15 108 15v135l-24 15M462 204l24 -15" fill="#39594b" /><path d="M372 322V211l73 10v111" fill="#0b1c19" /></g>
    <g fill="#adc5a0" stroke="#597d67"><path d="M252 294v-55l35 -17 35 17v55l-35 17z" /><path d="M510 343v-55l35 -17 35 17v55l-35 17z" /><path d="M294 208v-44l28 -14 28 14v44l-28 14z" /></g>
    <path d="M287 270v45M545 318v48M322 183v38" stroke="#859881" strokeWidth="8" />
    <path d="M139 340h55v50h37M590 360h48v-50h42M410 467v39" stroke="#bff2cf" />
    <g fill="#c3f4d4"><rect x="133" y="334" width="9" height="9" /><rect x="676" y="304" width="9" height="9" /><rect x="406" y="502" width="9" height="9" /></g>
  </svg>;
});
