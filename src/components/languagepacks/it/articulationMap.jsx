/**
 * Articulation map — phoneme → frame index (0-19).
 *
 * Italian pack-owned map.
 * This must stay aligned with the Italian PhonemeResolver output.
 */

const articulationMap = {
  locale: 'it-IT',
  neutral_frame: 0,
  frames: [
    { index: 0,  label: 'neutral',           phonemes: [] },
    { index: 1,  label: 'a_u',               phonemes: ['a', 'u'] },
    { index: 2,  label: 'e',                 phonemes: ['e'] },
    { index: 3,  label: 'ee',                phonemes: ['i'] },
    { index: 4,  label: 'ue',                phonemes: [] },
    { index: 5,  label: 'oo_o_ou_w',         phonemes: ['o', 'u', 'w'] },
    { index: 6,  label: 'c_k_q_kh_g',        phonemes: ['k', 'g'] },
    { index: 7,  label: 't_tsk_d_j',         phonemes: ['t', 'd', 'j'] },
    { index: 8,  label: 'b_p_m',             phonemes: ['b', 'p', 'm'] },
    { index: 9,  label: 'n',                 phonemes: ['n', 'ny'] },
    { index: 10, label: 'ng',                phonemes: [] },
    { index: 11, label: 's_z_x',             phonemes: ['s', 'z', 'x'] },
    { index: 12, label: 'sh',                phonemes: ['sh'] },
    { index: 13, label: 'th',                phonemes: [] },
    { index: 14, label: 'f_v',               phonemes: ['f', 'v'] },
    { index: 15, label: 'ch',                phonemes: ['ch', 'ts'] },
    { index: 16, label: 'h',                 phonemes: [] },
    { index: 17, label: 'r-rr',              phonemes: ['r', 'rr'] },
    { index: 18, label: 'l',                 phonemes: ['l'] },
    { index: 19, label: 'LL_y',              phonemes: ['ly', 'y'] },
  ],
};

export const phonemeToFrameIndex = (() => {
  const map = {};
  for (const frame of articulationMap.frames) {
    for (const phoneme of frame.phonemes) {
      map[phoneme] = frame.index;
    }
  }
  return map;
})();

export default articulationMap;