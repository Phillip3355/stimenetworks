export const MAIN_SERVER_OPEN_AT = '2026-08-22T14:00:00+09:00';

export function getCountdownParts(targetMs, nowMs = Date.now()) {
  const remainingMs = Math.max(0, targetMs - nowMs);
  const totalSeconds = Math.floor(remainingMs / 1000);

  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    complete: remainingMs === 0,
  };
}

export function formatCountdown({ days, hours, minutes, seconds }) {
  return [days, hours, minutes, seconds]
    .map((unit) => String(unit).padStart(2, '0'))
    .join(':');
}
