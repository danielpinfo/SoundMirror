const NON_SPEECH_TOKENS = new Set(['<pad>', '[PAD]', '<s>', '</s>', '<unk>', '[UNK]', '']);

const IPA_HELPER_MAP = Object.freeze({
  'ɑ': 'aa', 'ɑː': 'aa', 'aː': 'aa', 'æ': 'a', 'ɐ': 'a', 'ʌ': 'a', 'ə': 'a',
  'ɪ': 'i', 'iː': 'ii', 'ʊ': 'u', 'uː': 'uu', 'eː': 'e', 'ɛ': 'e',
  'oː': 'o', 'ɔ': 'o', 'ɔː': 'au',
  'ŋ': 'ng', 'ɲ': 'ny', 'ɳ': 'nn', 'ɴ': 'n',
  'ʈ': 'tt', 'ʈʰ': 'tth', 'ɖ': 'dd', 'ɖʰ': 'ddh',
  't̪': 't', 't̪ʰ': 'th', 'd̪': 'd', 'd̪ʰ': 'dh',
  'kʰ': 'kh', 'ɡ': 'g', 'ɡʱ': 'gh', 'gʱ': 'gh',
  'pʰ': 'ph', 'bʱ': 'bh', 'tʃ': 'ch', 't͡ʃ': 'ch', 'tʃʰ': 'chh',
  'dʒ': 'j', 'd͡ʒ': 'j', 'dʒʱ': 'jh',
  'ʃ': 'sh', 'ʂ': 'ssh', 'ɦ': 'h', 'x': 'x', 'ɣ': 'ghh', 'ʒ': 'zh',
  'ɽ': 'rr', 'ɽʱ': 'rrh', 'ɾ': 'r', 'ɹ': 'r', 'ʋ': 'v', 'w': 'v', 'j': 'y',
  '̃': '~', 'ː': '', 'ˈ': '', 'ˌ': '', '.': '', '5': '',
});

export function normalizeDetectedPhoneme(rawToken) {
  const raw = String(rawToken ?? '').normalize('NFC').trim();
  if (!raw || NON_SPEECH_TOKENS.has(raw)) return '';
  const withoutArtifacts = raw
    .replace(/[ˈˌ.]/g, '')
    .replace(/(?:[0-5])$/g, '');
  if (Object.prototype.hasOwnProperty.call(IPA_HELPER_MAP, withoutArtifacts)) {
    return IPA_HELPER_MAP[withoutArtifacts];
  }
  return withoutArtifacts.toLowerCase();
}

export function getDisplayToken(rawToken) {
  if (rawToken === null || rawToken === undefined) return '';
  const value = String(rawToken).trim();
  if (NON_SPEECH_TOKENS.has(value)) return '';
  return normalizeDetectedPhoneme(value) || value;
}

export function sanitizeTranscript(text) {
  if (!text) return '';
  return String(text)
    .split(/\s+/)
    .map(getDisplayToken)
    .filter(Boolean)
    .join(' ');
}

export { IPA_HELPER_MAP };
