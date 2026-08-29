/**
 * Japanese pack-owned pronunciation rules.
 *
 * These rules are learner-facing guidance only. They do not create AS timing
 * and they do not replace the resolver. The resolver remains the source of
 * expected phonemes for AS/UAS comparison.
 */

export const pronunciationRules = [
  {
    id: 'ja-mora-timing',
    title: 'even syllable timing',
    pattern: 'Japanese mora rhythm',
    helper:
      'Japanese is built from short, even sound beats. Try to keep each sound steady instead of stretching one part too much.',
    examples: ['こんにちは', 'ありがとう', 'すみません'],
  },
  {
    id: 'ja-a-i-u-e-o',
    title: 'vowels',
    pattern: 'a, i, u, e, o',
    helper:
      'Japanese vowels are clear and steady: a, i, u, e, o. Avoid changing them into English-style blended vowels.',
    examples: ['あ', 'い', 'う', 'え', 'お'],
  },
  {
    id: 'ja-u',
    title: 'u',
    pattern: 'う / u',
    helper:
      'Japanese u is usually less rounded than English “oo.” Keep the lips relaxed.',
    examples: ['す', 'く', 'ありがとう'],
  },
  {
    id: 'ja-r',
    title: 'r',
    pattern: 'ら, り, る, れ, ろ',
    helper:
      'Japanese r is a quick tap near the roof of the mouth. It is not exactly English r or English l.',
    examples: ['ら', 'ありがとう', 'さようなら'],
  },
  {
    id: 'ja-shi',
    title: 'shi',
    pattern: 'し',
    helper: 'し sounds like shi, not si.',
    examples: ['し', 'すみません', 'おいしい'],
  },
  {
    id: 'ja-chi',
    title: 'chi',
    pattern: 'ち',
    helper: 'ち sounds like chi, not ti.',
    examples: ['ち', 'こんにちは', 'いち'],
  },
  {
    id: 'ja-tsu',
    title: 'tsu',
    pattern: 'つ',
    helper:
      'つ starts with a small t sound before su. Keep it together as one short Japanese beat.',
    examples: ['つ', 'つぎ', 'まつ'],
  },
  {
    id: 'ja-fu',
    title: 'fu',
    pattern: 'ふ',
    helper:
      'ふ is softer than English f. Let the air pass gently with relaxed lips.',
    examples: ['ふ', 'ふじ', 'ふたり'],
  },
  {
    id: 'ja-n',
    title: 'n',
    pattern: 'ん',
    helper:
      'ん is its own sound beat. It may sound like n, m, or ng depending on the next sound.',
    examples: ['こんにちは', 'すみません', 'さん'],
  },
  {
    id: 'ja-small-tsu',
    title: 'small tsu',
    pattern: 'っ',
    helper:
      'Small っ creates a short hold before the next consonant. Pause slightly, then release the next sound clearly.',
    examples: ['きって', 'まって', 'ちょっと'],
  },
  {
    id: 'ja-long-vowel',
    title: 'long vowel',
    pattern: 'ー / doubled vowel',
    helper:
      'A long vowel is held for an extra beat. Do not turn it into a new consonant sound.',
    examples: ['おはよう', 'コーヒー', 'ありがとう'],
  },
  {
    id: 'ja-ya-yu-yo-combinations',
    title: 'small ya, yu, yo',
    pattern: 'ゃ, ゅ, ょ',
    helper:
      'Small ゃ, ゅ, ょ blend with the previous sound, like kya, sha, cha, or ryo.',
    examples: ['きゃ', 'しゅ', 'ちょ', 'りょ'],
  },
];

export default pronunciationRules;