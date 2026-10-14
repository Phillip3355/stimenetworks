export async function copyReportLink(slug, origin, clipboard) {
  const value = new URL(`/${slug}`, origin).href;
  try {
    if (!clipboard?.writeText) return { state: 'manual', value };
    await clipboard.writeText(value);
    return { state: 'copied', value };
  } catch {
    return { state: 'manual', value };
  }
}
