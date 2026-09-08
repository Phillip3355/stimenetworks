function formatSlugTitle(slug) {
  return String(slug ?? '')
    .split('/')
    .map((part) => part
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (letter) => letter.toUpperCase()))
    .join(' / ');
}

export function extractReportTitleAndContent(markdown, fallbackTitle) {
  const source = String(markdown ?? '');
  const match = source.match(/^\s*#\s+(.+)$/m);

  if (!match) {
    return {
      title: formatSlugTitle(fallbackTitle),
      content: source,
    };
  }

  return {
    title: match[1].trim(),
    content: source.replace(match[0], '').trim(),
  };
}

export function buildReportSummary(report) {
  const { title } = extractReportTitleAndContent(report.content, report.slug);

  return {
    id: report.id,
    slug: report.slug,
    title,
    createdAt: report.created_at,
  };
}
