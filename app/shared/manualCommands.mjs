const unquoted = /^[A-Za-z0-9_.+-]+$/;
const controlChars = /[\u0000-\u001f\u007f]/g;
const placeholderPattern = /<[^<>\s][^<>]*>/;

export function sanitizePlayerName(value) {
  return String(value ?? '').replace(controlChars, '').trim().slice(0, 64);
}

export function formatCommandTarget(value, placeholder) {
  const name = sanitizePlayerName(value);
  if (!name) return `<${placeholder}>`;
  if (unquoted.test(name)) return name;
  return `"${name.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

export function resolveCommand(template, names = {}) {
  return template.replace(/\{(PlayerA|PlayerB|PlayerC)\}/g, (_, key) => formatCommandTarget(names[key], key));
}

export function hasPlaceholder(command) {
  return placeholderPattern.test(command);
}

export function splitPlaceholders(command) {
  return command
    .split(/(<[^<>\s][^<>]*>)/)
    .filter(Boolean)
    .map(text => ({ text, placeholder: /^<[^<>\s][^<>]*>$/.test(text) }));
}

export function joinCommands(commands) {
  return commands.join('\n');
}

export async function copyText(text, env = globalThis) {
  try {
    if (env.navigator?.clipboard?.writeText && env.isSecureContext !== false) {
      await env.navigator.clipboard.writeText(text);
      return true;
    }
  } catch {}
  try {
    const doc = env.document;
    if (!doc?.body || !doc.execCommand) return false;
    const area = doc.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    doc.body.appendChild(area);
    area.select();
    const ok = doc.execCommand('copy');
    doc.body.removeChild(area);
    return Boolean(ok);
  } catch {
    return false;
  }
}
