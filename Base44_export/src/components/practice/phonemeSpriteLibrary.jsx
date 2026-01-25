// Phoneme sprite library
// Each phoneme has a canonical mouth motion URL
// Built from user-created frames that capture the sweet spot for that sound

export const PHONEME_SPRITES = {
        // NEUTRAL/REST
        closed: {
          name: 'closed',
          label: 'closed',
          frames: [
            'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/5fa09d76a_visemea11.jpg',
            'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/5fa09d76a_visemea11.jpg',
          ]
        },

        // VOWELS - open mouth shapes
        a: {
          name: 'a',
          label: 'ah',
          frames: [
            'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/0037c6d8b_visemea01.jpg',
            'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/896634b97_visemea02.jpg',
            'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/896634b97_visemea02.jpg',
          ]
        },

  // CONSONANTS
  b: {
    name: 'b',
    label: 'b',
    frames: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/0d17e20b6_visemeb1.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/7a965fa5f_visemeb2.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/7a965fa5f_visemeb2.jpg',
    ]
  },

  c: {
    name: 'c',
    label: 'k',
    frames: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/ff0ffce2c_visemec01.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/abf11cc05_visemec02.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/abf11cc05_visemec02.jpg',
    ]
  },

  d: {
    name: 'd',
    label: 'd',
    frames: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/d1e0bcb92_visemed01.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/7e4aed665_visemed02.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/d349fa442_visemed03.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/9908ce756_visemed04.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/9908ce756_visemed04.jpg',
    ]
  },

  e: {
    name: 'e',
    label: 'eh',
    frames: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/fd8ad7f8e_visemee01.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/af6f573fc_visemee02.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/af6f573fc_visemee02.jpg',
    ]
  },

  enye: {
    name: 'enye',
    label: 'ny',
    frames: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/2b31fd783_visemeenye1.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/ccc6e330f_visemeenye2.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/316a38e59_visemeenye10.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/316a38e59_visemeenye10.jpg',
    ]
  },

  f: {
    name: 'f',
    label: 'f',
    frames: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/2345f689d_visemef02.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/1a772a879_visemef03.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/1a772a879_visemef03.jpg',
    ]
  },

  g: {
    name: 'g',
    label: 'g',
    frames: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/7f9596b85_visemeg01.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/3d97a7d85_visemeg02.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/e1cc8f3cc_visemeg03.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/e1cc8f3cc_visemeg03.jpg',
    ]
  },

  h: {
    name: 'h',
    label: 'h',
    frames: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/dfb73d390_visemeh02.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/6dfa478f8_visemeh03.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/6dfa478f8_visemeh03.jpg',
    ]
  },

  i: {
    name: 'i',
    label: 'ee',
    frames: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/2ce948105_visemei02.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/c26984dd9_visemei03.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/c26984dd9_visemei03.jpg',
    ]
  },

  j: {
    name: 'j',
    label: 'j',
    frames: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/5c32dd975_visemej02.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/ee4656875_visemej03.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/ee4656875_visemej03.jpg',
    ]
  },

  k: {
    name: 'k',
    label: 'k',
    frames: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/c9828a881_visemek02.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/7e74d54d2_visemek03.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/7e74d54d2_visemek03.jpg',
    ]
  },

  l: {
   name: 'l',
   label: 'l',
   frames: [
     'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/ab1da28d2_visemel02.jpg',
     'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/f1b18eb71_visemel03.jpg',
     'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/e798ad2ac_visemel05.jpg',
     'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/e798ad2ac_visemel05.jpg',
   ]
  },

  ll: {
    name: 'll',
    label: 'll',
    frames: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/36ced85a8_visemeenye2.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/b9de4192e_visemeenye2.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/b9de4192e_visemeenye2.jpg',
    ]
  },

  m: {
    name: 'm',
    label: 'm',
    frames: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/e855450d6_visemem01.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/f6a93191a_visemem02.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/f6a93191a_visemem02.jpg',
    ]
  },

  n: {
    name: 'n',
    label: 'n',
    frames: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/9f4a0b473_visemen02.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/c2c03dfbd_visemen03.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/c2c03dfbd_visemen03.jpg',
    ]
  },

  o: {
    name: 'o',
    label: 'o',
    frames: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/4f02a83bf_visemeo01.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/2315bba1f_visemeo01.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/2315bba1f_visemeo01.jpg',
    ]
  },

  p: {
    name: 'p',
    label: 'p',
    frames: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/0969b1ed5_visemep01.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/15f36c6e8_visemep02.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/15f36c6e8_visemep02.jpg',
    ]
  },

  q: {
    name: 'q',
    label: 'q',
    frames: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/769e068f6_visemeq05.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/7561dd22a_visemeq06.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/7561dd22a_visemeq06.jpg',
    ]
  },

  r: {
    name: 'r',
    label: 'r',
    frames: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/d3bfe1a5b_visemer02.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/71e1cf6e9_visemer03.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/4e54c63c8_visemer04.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/4e54c63c8_visemer04.jpg',
    ]
  },

  s: {
    name: 's',
    label: 's',
    frames: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/9918898e2_visemes03.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/0936e0cfc_visemes04.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/0936e0cfc_visemes04.jpg',
    ]
  },

  t: {
    name: 't',
    label: 't',
    frames: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/5bfdd6616_visemet02.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/6ce9a92f9_visemet03.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/6ce9a92f9_visemet03.jpg',
    ]
  },

  u: {
    name: 'u',
    label: 'oo',
    frames: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/64145c161_visemeu02.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/a14943da9_visemeu03.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/a14943da9_visemeu03.jpg',
    ]
  },

  v: {
    name: 'v',
    label: 'v',
    frames: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/f134fefe5_visemev01.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/cddbc76e2_visemev02.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/cddbc76e2_visemev02.jpg',
    ]
  },

  w: {
    name: 'w',
    label: 'w',
    frames: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/7078c7615_visemew05.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/e8ff9d386_visemew06.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/e8ff9d386_visemew06.jpg',
    ]
  },

  x: {
    name: 'x',
    label: 'x',
    frames: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/bebab88ff_visemex01.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/64d271352_visemex02.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/64d271352_visemex02.jpg',
    ]
  },

  y: {
    name: 'y',
    label: 'y',
    frames: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/bf8774a8f_visemey04.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/c0ec3c833_visemey05.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/c0ec3c833_visemey05.jpg',
    ]
  },

  z: {
    name: 'z',
    label: 'z',
    frames: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/b75fd7e51_visemez04.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/041b90257_visemez05.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/041b90257_visemez05.jpg',
    ]
  },

  ch: {
    name: 'ch',
    label: 'ch',
    frames: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/78473f278_visemez05.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/982388f48_visemez06.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/982388f48_visemez06.jpg',
    ]
  },

  sh: {
    name: 'sh',
    label: 'sh',
    frames: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/03a2c4201_visemes04.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/83f10718f_visemes05.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/83f10718f_visemes05.jpg',
    ]
  },

  th: {
    name: 'th',
    label: 'th',
    frames: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/c732ac9a4_Th0.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/e93cbf5b3_Th1.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/e93cbf5b3_Th1.jpg',
    ]
  },

  ng: {
    name: 'ng',
    label: 'ng',
    frames: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/125e13daa_visemeg02.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/4a732a87b_visemeg03.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/4a732a87b_visemeg03.jpg',
    ]
  },

  oy: {
    name: 'oy',
    label: 'oy',
    frames: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/2dabe6ddc_visemeo03.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/5ccc0e5e9_Oy0.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/5ccc0e5e9_Oy0.jpg',
    ]
  },

  ow: {
    name: 'ow',
    label: 'ow',
    frames: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/82dd552d0_visemea04.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/5a71fcfc0_visemew06.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/5a71fcfc0_visemew06.jpg',
    ]
  },

  ou: {
    name: 'ou',
    label: 'ou',
    frames: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/284e3a2b6_visemeo01.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/c351c6f60_visemeo04.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/c351c6f60_visemeo04.jpg',
    ]
  },

  ay: {
    name: 'ay',
    label: 'ay',
    frames: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/fe5712f8d_visemea01.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/adb3ce51b_visemey03.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/adb3ce51b_visemey03.jpg',
    ]
  },

  ee: {
    name: 'ee',
    label: 'ee',
    frames: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/d6595533a_visemey03.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/b63db7980_visemey04.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/b63db7980_visemey04.jpg',
    ]
  },

  oi: {
    name: 'oi',
    label: 'oi',
    frames: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/f1affaa8c_visemeo03.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/38793a0b3_visemey05.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/38793a0b3_visemey05.jpg',
    ]
  },

  ar: {
    name: 'ar',
    label: 'ar',
    frames: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/6462b2edf_visemea02.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/ff6789cbf_visemer05.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/ff6789cbf_visemer05.jpg',
    ]
  },

  or: {
    name: 'or',
    label: 'or',
    frames: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/010a4266c_visemeo03.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/391d55268_visemer05.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/391d55268_visemer05.jpg',
    ]
  },

  er: {
    name: 'er',
    label: 'er',
    frames: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/09f9ff601_visemee01.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/08520f6ef_visemer04.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/08520f6ef_visemer04.jpg',
    ]
  },

  aw: {
    name: 'aw',
    label: 'aw',
    frames: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/cefc432bf_visemea02.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/877de0eff_visemew06.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/877de0eff_visemew06.jpg',
    ]
  },

  ny: {
    name: 'ny',
    label: 'ñ',
    frames: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/baf9c5b49_visemen02.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/eab8c0a39_visemey05.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/eab8c0a39_visemey05.jpg',
    ]
  },

  ce: {
    name: 'ce',
    label: 'ce',
    frames: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/1bfb164fd_visemes04.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/40756eb4f_visemes05.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/40756eb4f_visemes05.jpg',
    ]
  },

  si: {
    name: 'si',
    label: 'si',
    frames: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/7e5d6cbea_visemes03.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/03c361c38_visemei03.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/03c361c38_visemei03.jpg',
    ]
  },

  ge: {
    name: 'ge',
    label: 'ge',
    frames: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/6b36f7cc4_visemeg03.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/69902bf86_visemei06.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/69902bf86_visemei06.jpg',
    ]
  },

  gi: {
    name: 'gi',
    label: 'gi',
    frames: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/30316dc8a_visemeg03.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/4e38a3ea8_visemes04.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/4e38a3ea8_visemes04.jpg',
    ]
  },

  eu: {
    name: 'eu',
    label: 'eu',
    frames: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/d43475851_visemey06.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/1148c0921_visemew05.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/ed90c6d5f_visemew06.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/ed90c6d5f_visemew06.jpg',
    ]
  },

  oe: {
    name: 'oe',
    label: 'oe',
    frames: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/997e54778_visemeo01.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/1737baed4_visemew06.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/1737baed4_visemew06.jpg',
    ]
  },

  wa: {
    name: 'wa',
    label: 'wa',
    frames: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/08f4e2ba4_visemew06.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/9896af18f_visemew09.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/9896af18f_visemew09.jpg',
    ]
  },
  
  kh: {
    name: 'kh',
    label: 'kh',
    frames: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/66a3ff37f_visemek03.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/d4440505e_visemek04.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/d4440505e_visemek04.jpg',
    ]
  },
  
  ts: {
    name: 'ts',
    label: 'ts',
    frames: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/297847208_Eu0.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/81dcd2d3f_Eu1.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/81dcd2d3f_Eu1.jpg',
    ]
  },
  
  zu: {
    name: 'zu',
    label: 'zu',
    frames: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/a38412ff1_visemed01.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/1af241fd7_visemez01.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/014c463ec_visemeo04.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/014c463ec_visemeo04.jpg',
    ]
  },
  
  di: {
    name: 'di',
    label: 'di',
    frames: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/a504fa84d_visemej03.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/59e0d718b_visemes04.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/59e0d718b_visemes04.jpg',
    ]
  },
  
  du: {
    name: 'du',
    label: 'du',
    frames: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/e13ac9b7f_visemez01.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/af46c5b40_visemeo04.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/af46c5b40_visemeo04.jpg',
    ]
  },
  
  ye: {
    name: 'ye',
    label: 'ye',
    frames: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/991670630_Oy1.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/1526b91e7_visemee04.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/1526b91e7_visemee04.jpg',
    ]
  },
  
  fu: {
    name: 'fu',
    label: 'fu',
    frames: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/f6eca3750_visemep02.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/171e9b3ff_visemep03.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/171e9b3ff_visemep03.jpg',
    ]
  },
  
  dz: {
    name: 'dz',
    label: 'dz',
    frames: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/188a49fcd_visemed01.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/481dfb383_visemez01.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/481dfb383_visemez01.jpg',
    ]
  },
  
  zh: {
    name: 'zh',
    label: 'zh',
    frames: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/d4a64e7a8_visemej05.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/15e85853b_visemeu04.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/15e85853b_visemeu04.jpg',
    ]
  },
  
  ang: {
    name: 'ang',
    label: 'ang',
    frames: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/337f5e63a_visemeo01.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/0263654af_visemen03.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/7e0de36a1_visemeg03.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/7e0de36a1_visemeg03.jpg',
    ]
  },
  
  eng: {
    name: 'eng',
    label: 'eng',
    frames: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/ebdff7102_visemeu02.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/581dde72a_visemen03.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/6d23bbcea_visemeg03.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/6d23bbcea_visemeg03.jpg',
    ]
  },
  
  ing: {
    name: 'ing',
    label: 'ing',
    frames: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/90c1b3c9e_visemeg01.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/f61a246f6_visemeg03.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/f61a246f6_visemeg03.jpg',
    ]
  },
  
  ong: {
    name: 'ong',
    label: 'ong',
    frames: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/e35fceea4_visemeo01.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/0f4ef625e_visemen03.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/4e758cb8d_visemeg03.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/4e758cb8d_visemeg03.jpg',
    ]
  },
  
  an: {
    name: 'an',
    label: 'an',
    frames: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/4ee9e6d82_visemea02.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/d6d0af395_visemen03.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/d6d0af395_visemen03.jpg',
    ]
  },
  
  en: {
    name: 'en',
    label: 'en',
    frames: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/a97b3443d_visemen03.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/f4b5b25cf_visemeg02.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/f4b5b25cf_visemeg02.jpg',
    ]
  },
  
  in: {
    name: 'in',
    label: 'in',
    frames: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/74fea4fd7_visemen03.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/53855af4e_visemen05.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/aed430ffd_visemen01.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/aed430ffd_visemen01.jpg',
    ]
  },
  
  un: {
    name: 'un',
    label: 'un',
    frames: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/75e98c7f5_visemew03.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/8c75a5ec5_visemen03.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/8c75a5ec5_visemen03.jpg',
    ]
  },
  
  uan: {
    name: 'uan',
    label: 'uan',
    frames: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/4d9579dc3_visemew06.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/aedd52a41_visemea02.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/00fbc44f7_visemen03.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/00fbc44f7_visemen03.jpg',
    ]
  },
  
  uang: {
    name: 'uang',
    label: 'uang',
    frames: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/1d817da8e_visemew06.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/c63ee998c_visemea02.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/d2362fc4e_visemen02.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/a000a2748_visemeg02.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/a000a2748_visemeg02.jpg',
    ]
  },
  
  dh: {
    name: 'dh',
    label: 'dh',
    frames: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/ef5a1f02a_Th0.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/4c6a2db53_Th1.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/4c6a2db53_Th1.jpg',
    ]
  },
  
  gh: {
    name: 'gh',
    label: 'gh',
    frames: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/7f22cd034_visemeg01.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/686593de2_visemeg02.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/3235689c4_visemeg05.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/3235689c4_visemeg05.jpg',
    ]
  },
  
  ph: {
    name: 'ph',
    label: 'ph',
    frames: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/cd79e6eae_visemef01.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/6e815c18e_visemef02.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/6e815c18e_visemef02.jpg',
    ]
  },
  
  bh: {
    name: 'bh',
    label: 'bh',
    frames: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/6b52984c8_visemeb2.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/0ace8d715_visemeh02.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/0ace8d715_visemeh02.jpg',
    ]
  },

  dd: {
    name: 'dd',
    label: 'dd',
    frames: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/ae10db9a6_Th0.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/ffbc3e8e1_Th1.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/ffbc3e8e1_Th1.jpg',
    ]
  },

  tt: {
    name: 'tt',
    label: 'tt',
    frames: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/b469f3e22_visemet02.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/fb6882307_visemet03.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/fb6882307_visemet03.jpg',
    ]
  },

  ss: {
    name: 'ss',
    label: 'ss',
    frames: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/fcf4454c5_visemes03.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/6b59abf60_visemes06.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/96bf92b6c_visemes03.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/96bf92b6c_visemes03.jpg',
    ]
  },

  qq: {
    name: 'qq',
    label: 'qq',
    frames: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/5dcb81b90_visemeq05.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/0c1705f59_visemeq01.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/b09514d6b_visemeq05.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/b09514d6b_visemeq05.jpg',
    ]
  },

  ly: {
    name: 'ly',
    label: 'ly',
    frames: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/c4e0772f3_visemel05.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/940ff19dd_Eu1.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/940ff19dd_Eu1.jpg',
    ]
  },

  pf: {
    name: 'pf',
    label: 'pf',
    frames: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/f4bb5e73d_visemep03.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/13885f4c7_visemeenye1.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/13885f4c7_visemeenye1.jpg',
    ]
  },

  kv: {
    name: 'kv',
    label: 'kv',
    frames: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/92cde2d32_visemek02.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/7908ce4f6_visemev01.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/7908ce4f6_visemev01.jpg',
    ]
  },

  sht: {
    name: 'sht',
    label: 'sht',
    frames: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/c97eb0844_visemes02.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/76c7c8c9a_Eu0.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/ff40b1e24_visemet02.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/ff40b1e24_visemet02.jpg',
    ]
  },

  shp: {
    name: 'shp',
    label: 'shp',
    frames: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/b13484a88_Eu0.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/4901c6229_Eu1.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/4901c6229_Eu1.jpg',
    ]
  },

  rr: {
    name: 'rr',
    label: 'rr',
    frames: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/541777ef5_visemer02.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/e98e2232f_visemer03.jpg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6921e086dd69b1499f897440/e98e2232f_visemer03.jpg',
    ]
  },
  };

// Get frame URL for a phoneme at a specific frame index
export function getPhonemeFrameUrl(phoneme, frameIndex = 0) {
  const sprite = PHONEME_SPRITES[String(phoneme || '').toLowerCase().trim()];
  if (!sprite || !sprite.frames) return null;
  
  const idx = Math.max(0, Math.min(sprite.frames.length - 1, Number(frameIndex) || 0));
  return sprite.frames[idx] || null;
}

// Get total frame count for a phoneme
export function getPhonemeFrameCount(phoneme) {
  const sprite = PHONEME_SPRITES[String(phoneme || '').toLowerCase().trim()];
  return sprite?.frames?.length || 0;
}

// Get all phonemes
export function getAllPhonemes() {
  return Object.keys(PHONEME_SPRITES);
}