const coachingRules = {
  locale: 'es-US',
  version: '1.0',

  rules: [
    {
      id: 'bilabial_closure',
      phonemes: ['b', 'p', 'm'],
      tip: 'Junta los labios por completo antes de soltar el aire.',
    },
    {
      id: 'alveolar_tip',
      phonemes: ['t', 'd', 'n', 'r'],
      tip: 'Toca con la punta de la lengua la zona detrás de los dientes superiores.',
    },
    {
      id: 'alveolar_trill',
      phonemes: ['rr'],
      tip: 'Haz vibrar la punta de la lengua contra los alvéolos con golpes rápidos.',
    },
    {
      id: 'palatal_nasal',
      phonemes: ['ny'],
      tip: 'Eleva la parte media de la lengua hacia el paladar para el sonido "ñ".',
    },
    {
      id: 'velar_stops',
      phonemes: ['k', 'g'],
      tip: 'Eleva la parte posterior de la lengua contra el velo del paladar.',
    },
    {
      id: 'fricative_airflow',
      phonemes: ['f', 'v', 's', 'h'],
      tip: 'Mantén un flujo de aire constante por un canal estrecho.',
    },
    {
      id: 'affricate',
      phonemes: ['ch'],
      tip: 'Empieza con una pequeña oclusión y suelta con fricción.',
    },
    {
      id: 'lateral',
      phonemes: ['l'],
      tip: 'Deja escapar el aire por los lados de la lengua.',
    },
    {
      id: 'glides',
      phonemes: ['y', 'w'],
      tip: 'Transición rápida y suave sin sostener como una vocal.',
    },
    {
      id: 'vowels',
      phonemes: ['a', 'e', 'i', 'o', 'u'],
      tip: 'Vocales puras y estables sin deslizamientos.',
    },
  ],
};

export default coachingRules;
