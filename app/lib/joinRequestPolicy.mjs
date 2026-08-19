const javaNicknamePattern = /^[A-Za-z0-9_]{3,16}$/;
const bedrockNicknamePattern = /^[^\u0000-\u001f\u007f"\\]{1,32}$/;

function clean(value) {
  return typeof value === 'string' ? value.trim() : '';
}

export function validateJoinRequest(request) {
  const errors = [];
  const edition = clean(request.edition).toLowerCase();
  const minecraftNickname = clean(request.minecraftNickname);

  if (!['java', 'bedrock'].includes(edition)) errors.push('edition');

  const nicknameIsValid = edition === 'java'
    ? javaNicknamePattern.test(minecraftNickname)
    : edition === 'bedrock' && bedrockNicknamePattern.test(minecraftNickname);
  if (!nicknameIsValid) errors.push('minecraftNickname');

  if (!clean(request.inviterName)) errors.push('inviterName');
  if (!clean(request.contact)) errors.push('contact');
  if (request.rulesAgreed !== true) errors.push('rulesAgreed');
  if (request.privacyAgreed !== true) errors.push('privacyAgreed');

  return errors;
}

export function normalizeJoinRequest(request) {
  return {
    edition: clean(request.edition).toLowerCase(),
    minecraft_nickname: clean(request.minecraftNickname),
    inviter_name: clean(request.inviterName),
    contact: clean(request.contact),
    rules_agreed: request.rulesAgreed === true,
    privacy_agreed: request.privacyAgreed === true,
  };
}

export function buildWhitelistCommand(edition, minecraftNickname) {
  const normalizedEdition = clean(edition).toLowerCase();
  const nickname = clean(minecraftNickname);

  if (normalizedEdition === 'java') return `/whitelist add ${nickname}`;
  if (normalizedEdition === 'bedrock') {
    const commandNickname = /\s/.test(nickname) ? `"${nickname}"` : nickname;
    return `/fwhitelist add ${commandNickname}`;
  }

  throw new Error('Unsupported Minecraft edition.');
}
