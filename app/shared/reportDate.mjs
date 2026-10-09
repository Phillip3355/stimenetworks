export function formatReportDate(value, language = 'ko') {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? (language === 'ko' ? '날짜 미상' : 'Date unavailable')
    : new Intl.DateTimeFormat(language === 'ko' ? 'ko-KR' : 'en-US', {
      year: 'numeric', month: 'short', day: 'numeric', timeZone: 'Asia/Seoul',
    }).format(date);
}
