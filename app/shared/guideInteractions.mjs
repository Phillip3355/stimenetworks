export async function copyConnectionValue(presentation, field, clipboard) {
  const value = presentation?.[field];
  if (!['address', 'port'].includes(field) || !presentation?.canCopy || presentation.state !== 'ready' || value == null || value === '') {
    return { state: 'unavailable', value: null };
  }
  const text = String(value);
  try {
    if (!clipboard?.writeText) return { state: 'manual', value: text };
    await clipboard.writeText(text);
    return { state: 'copied', value: text };
  } catch {
    return { state: 'manual', value: text };
  }
}

export function syncDocumentLanguage(document, language) {
  document.documentElement.lang = language;
}
