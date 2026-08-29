import { phonemeToFrameIndex } from './articulationMap';
import { resolveHindiReading } from './hindiReadingEngine';

const LEAD_IN_MS = 40;
const PAUSE_MS = 80;
const SHORT_MS = 90;
const LONG_MS = 140;
const CONSONANT_MS = 95;

function keyToFrame(key) {
  return phonemeToFrameIndex[key] ?? 0;
}

function isLongToken(token) {
  return ['aa', 'ii', 'uu', 'ai', 'au', 'e', 'o'].includes(token);
}

function buildUnits(reading) {
  const units = [];
  let helperIndex = 0;

  reading.words.forEach((word, wordIndex) => {
    if (wordIndex > 0) units.push({ type: 'pause' });
    word.phones.forEach((phone) => {
      units.push({
        type: 'phoneme',
        key: phone.token,
        label: reading.helperTokens[helperIndex],
        duration: isLongToken(phone.token)
          ? LONG_MS
          : phone.kind === 'vowel'
            ? SHORT_MS
            : CONSONANT_MS,
      });
      helperIndex += 1;
    });
  });

  return units;
}

class PhonemeResolver {
  resolveUntimed(text) {
    const reading = resolveHindiReading(text);
    const expectedFrames = reading.phonemes.map(keyToFrame);
    const tokens = reading.phones.map((phone, index) => ({
      ...phone,
      phoneme: phone.token,
      frame: expectedFrames[index],
      label: reading.helperTokens[index],
    }));

    return {
      ...reading,
      word: reading.text,
      expectedPhonemes: reading.phonemes,
      expectedFrames,
      frames: expectedFrames,
      helperText: reading.helperText,
      pronunciation: reading.pronunciation,
      tokens,
      tokenGroups: reading.words,
      ipaPhonemes: [],
    };
  }

  resolve(text) {
    const source = String(text || '').trim();

    if (!source) {
      return {
        word: '',
        helperText: '',
        phonemes: [],
        frames: [0, 0],
        pronunciation: '',
        phonemeTimeline: [],
        helperChunks: [],
        ipaPhonemes: [],
      };
    }

    const reading = resolveHindiReading(source);
    const units = buildUnits(reading);

    const phonemeTimeline = [];
    const helperChunks = [];
    const phonemes = [];
    const frames = [0];

    let cursor = LEAD_IN_MS;

    phonemeTimeline.push({
      phoneme: 'neutral',
      frame: 0,
      startMs: 0,
      endMs: LEAD_IN_MS,
    });

    units.forEach((unit) => {
      if (unit.type === 'pause') {
        phonemeTimeline.push({
          phoneme: 'pause',
          frame: 0,
          startMs: cursor,
          endMs: cursor + PAUSE_MS,
        });
        frames.push(0);
        cursor += PAUSE_MS;
        return;
      }

      const frame = keyToFrame(unit.key);
      const start = cursor;
      const end = cursor + unit.duration;

      phonemeTimeline.push({
        phoneme: unit.key,
        label: unit.label,
        frame,
        startMs: start,
        endMs: end,
      });

      helperChunks.push({
        text: unit.label,
        startMs: start,
        endMs: end,
      });

      phonemes.push(unit.key);
      frames.push(frame);
      cursor = end;
    });

    phonemeTimeline.push({
      phoneme: 'neutral',
      frame: 0,
      startMs: cursor,
      endMs: cursor + LEAD_IN_MS,
    });

    frames.push(0);

    return {
      word: source,
      normalizedText: reading.normalizedText,
      helperText: reading.helperText,
      phonemes,
      frames,
      expectedPhonemes: phonemes,
      expectedFrames: frames.slice(1, -1),
      pronunciation: reading.pronunciation,
      phonemeTimeline,
      helperChunks,
      ipaPhonemes: [],
      approved: reading.approved,
      unresolved: reading.unresolved,
      validation: reading.validation,
      tokens: reading.phones,
      tokenGroups: reading.words,
    };
  }
}

export default PhonemeResolver;
