const articulationMap = {
  locale: 'fr-FR',
  neutral_frame: 0,
  frames: [
    { index: 0,  label: 'neutral',           phonemes: [] },
    { index: 1,  label: 'a_u',               phonemes: ['a', 'an'] },
    { index: 2,  label: 'e',                 phonemes: ['e', 'o', 'on', 'wa'] },
    { index: 3,  label: 'ee',                phonemes: ['i', 'in', 'un'] },
    { index: 4,  label: 'ue',                phonemes: ['eu'] },
    { index: 5,  label: 'oo_o_ou_w',         phonemes: ['u', 'oo'] },
    { index: 6,  label: 'c_k_q_kh_g',        phonemes: ['k', 'g'] },
    { index: 7,  label: 't_tsk_d_j',         phonemes: ['t', 'd'] },
    { index: 8,  label: 'b_p_m',             phonemes: ['b', 'p', 'm'] },
    { index: 9,  label: 'n',                 phonemes: ['n', 'ny'] },
    { index: 10, label: 'ng',                phonemes: [] },
    { index: 11, label: 's_z_x',             phonemes: ['s', 'z'] },
    { index: 12, label: 'sh',                phonemes: ['sh', 'zh'] },
    { index: 13, label: 'th',                phonemes: [] },
    { index: 14, label: 'f_v',               phonemes: ['f', 'v'] },
    { index: 15, label: 'ch',                phonemes: [] },
    { index: 16, label: 'h',                 phonemes: [] },
    { index: 17, label: 'r-rr',              phonemes: ['r'] },
    { index: 18, label: 'l',                 phonemes: ['l'] },
    { index: 19, label: 'LL_y',              phonemes: ['y'] },
  ],
};

export const phonemeToFrameIndex = (() => {
  const map = {};
  for (const f of articulationMap.frames) {
    for (const p of f.phonemes) map[p] = f.index;
  }
  return map;
})();

export default articulationMap;