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
  return new Intl.DateTimeFormat(language === 'ko' ? 'ko-KR' : 'en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Seoul',
  }).format(date);
}
