export function formatReportDate(value, language = 'ko') {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? (language === 'ko' ? '날짜 미상' : 'Date unavailable')
    : new Intl.DateTimeFormat(language === 'ko' ? 'ko-KR' : 'en-US', {
      year: 'numeric', month: 'short', day: 'numeric', timeZone: 'Asia/Seoul',
    }).format(date);
}

export function formatReportTimestamp(value, language = 'ko') {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return formatReportDate(value, language);
  // ICU day-period labels and locale punctuation vary between Node and browsers.
  // Use Intl only to resolve the community's numeric calendar/clock fields.
  const parts = new Intl.DateTimeFormat('en-US', {
    calendar: 'gregory', numberingSystem: 'latn', timeZone: 'Asia/Seoul',
    year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(date);
  const fields = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  const month = Number(fields.month);
  const day = Number(fields.day);
  const time = `${fields.hour.padStart(2, '0')}:${fields.minute.padStart(2, '0')}`;
  if (language === 'ko') return `${fields.year}년 ${month}월 ${day}일 ${time}`;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[month - 1]} ${day}, ${fields.year}, ${time}`;
}
