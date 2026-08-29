const coachingRules = {
  locale: 'de-DE',
  version: '1.0',
  rules: [
    {
      id: 'umlauts',
      phonemes: ['oe', 'ue'],
      tip: 'Halte Umlaute stabil und deutlich von o/u getrennt.'
    },
    {
      id: 'ich_bach',
      phonemes: ['ch', 'kh'],
      tip: 'Unterscheide ich-Laut nach Vorderzungenvokalen und ach-Laut nach offenen/dunklen Vokalen.'
    },
    {
      id: 'affricates',
      phonemes: ['ts', 'pf'],
      tip: 'Halte z und pf als klare Doppelbewegung in einem einzigen Lautblock.'
    },
    {
      id: 'final_devoicing',
      phonemes: ['b', 'd', 'g'],
      tip: 'Sprich auslautendes b/d/g am Wortende hart als p/t/k.'
    },
  ],
};

export default coachingRules;