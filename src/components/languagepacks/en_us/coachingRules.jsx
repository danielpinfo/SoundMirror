const coachingRules = {
  locale: 'en-US',
  version: '2.1',

  /*
   * SoundMirror Coaching Contract
   *
   * Corrective coaching is earned by a real pronunciation mismatch.
   *
   * 1. Expected phoneme matches detected phoneme:
   *      NO CORRECTIVE COACHING.
   *
   * 2. Expected phoneme does not match detected phoneme:
   *      Coaching may investigate the mismatch.
   *
   * 3. Visual mouth evidence helps diagnose WHY the mismatch happened.
   *
   * 4. Visual evidence alone must never manufacture a pronunciation error.
   *
   * 5. Positive praise is handled by the combined attempt-level verdict.
   */
  policy: {
    mismatchOnly: true,
    requireAudioMismatch: true,
    silenceOnPhonemeMatch: true,

    visualEvidenceRole: 'diagnose-after-audio-mismatch',

    preferSpecificVisualDiagnosis: true,
    allowPhonemeFamilyFallback: true,

    maxPrimaryCards: 1,
    maxSecondaryCards: 1,

    scoredFeatures: [
      'lip_closure',
      'lip_rounding',
      'lip_spread',
      'mouth_open',
    ],

    supportingFeatures: [
      'lower_lip_roll',
      'upper_lip_roll',
      'lower_lip_shrug',
      'upper_lip_shrug',
      'labiodental_contact_proxy',
      'bilabial_closure_proxy',
      'tongue_out',
      'teeth_visibility',
    ],
  },

  /*
   * Do not restore the old generic rule system.
   *
   * The upgraded ArticulationComparator consumes coachingLibrary below.
   */
  rules: [],

  categories: [
    'vowels',
    'bilabials',
    'alveolars',
    'velars',
    'nasals',
    'sibilants',
    'postalveolars',
    'dentals',
    'labiodentals',
    'affricates',
    'glottals',
    'rhotics',
    'laterals',
    'glides',
    'voicing',
    'nasal_oral_contrast',
    'rounding',
    'tongue_placement',
    'jaw_opening',
    'airflow',
  ],

  coachingLibrary: {
    cards: {
      open_vowel_jaw: {
        category: 'jaw_opening',
        frame: 1,

        title: 'Open the vowel more',

        tip:
          'Open your jaw more and keep the tongue relaxed for this vowel.',

        whatToDo:
          'Let the jaw drop comfortably instead of squeezing the sound through a small opening.',

        tongue:
          'Keep the tongue broad and relaxed rather than pushing it high toward the roof of the mouth.',

        lips:
          'Keep the lips relaxed. Do not round them unless the sound specifically requires rounding.',

        jaw:
          'Use a clearly open jaw position.',

        airflow:
          'Let the voice and air move freely through the mouth without a blockage.',

        voicing:
          'Keep the voice continuous through the vowel.',

        visualCue:
          'You should see a noticeably open mouth rather than a narrow opening.',

        commonMistake:
          'The jaw stays too closed and the vowel begins to sound like a different, tighter vowel.',

        correction:
          'Drop the jaw first, then say the vowel without changing that open position.',

        practiceDrill:
          'Hold the vowel slowly, relax, then repeat it three times with the same open jaw.',

        successCue:
          'The sound should feel open and unrestricted, with no lip closure or tongue blockage.',

        compareWith:
          'Compare it with a tighter front vowel and notice how much farther the jaw opens.',
      },

      mid_vowel_balance: {
        category: 'vowels',
        frame: 2,

        title: 'Find the middle vowel position',

        tip:
          'Keep the jaw partly open and the lips relaxed instead of opening too wide or closing too much.',

        whatToDo:
          'Aim for a middle mouth opening—not the wide opening of AH and not the tight shape of EE.',

        tongue:
          'Keep the tongue in a comfortable middle-to-front position.',

        lips:
          'Keep the lips mostly neutral rather than strongly rounded.',

        jaw:
          'Use a moderate jaw opening.',

        airflow:
          'Keep airflow smooth and uninterrupted.',

        voicing:
          'Maintain steady vocal vibration.',

        visualCue:
          'The mouth should look comfortably open, but not stretched or widely dropped.',

        commonMistake:
          'Turning the vowel into either a very open vowel or a tight high vowel.',

        correction:
          'Start from a relaxed mouth and open only enough to form the vowel clearly.',

        practiceDrill:
          'Alternate the target vowel with AH and EE and notice the middle position.',

        successCue:
          'The vowel sounds clear without excessive jaw opening, spreading, or rounding.',

        compareWith:
          'Compare the mouth opening with AH and EE.',
      },

      high_front_vowel: {
        category: 'vowels',
        frame: 3,

        title: 'Bring the vowel forward',

        tip:
          'Spread the lips slightly and keep the jaw relatively narrow for EE.',

        whatToDo:
          'Bring the front of the tongue higher while keeping enough space for the vowel to remain clear.',

        tongue:
          'Raise the front of the tongue toward the hard palate without making contact.',

        lips:
          'Use a light horizontal spread rather than rounding.',

        jaw:
          'Keep the jaw more closed than for an open vowel.',

        airflow:
          'Allow continuous voiced airflow through the mouth.',

        voicing:
          'Keep the voice steady.',

        visualCue:
          'The lips should appear slightly wider and flatter, not rounded forward.',

        commonMistake:
          'Opening the jaw too much or rounding the lips, causing the vowel to drift backward.',

        correction:
          'Narrow the jaw slightly and gently widen the lips.',

        practiceDrill:
          'Hold EE slowly, relax, and repeat while keeping the same forward tongue and lip shape.',

        successCue:
          'The sound feels forward in the mouth and the lips remain unrounded.',

        compareWith:
          'Compare EE with OO and notice spread versus rounded lips.',
      },

      /*
       * Universal frame 04 is retained in the English library so the
       * physical family remains documented, but the current English
       * phoneme inventory does not trigger this card.
       */
      front_rounded_vowel: {
        category: 'rounding',
        frame: 4,

        title: 'Round the lips while keeping the tongue forward',

        tip:
          'Keep the tongue forward while rounding the lips clearly.',

        whatToDo:
          'Form the forward tongue position first, then add lip rounding without pulling the tongue backward.',

        tongue:
          'Keep the tongue high and toward the front of the mouth.',

        lips:
          'Round and project the lips forward.',

        jaw:
          'Keep a moderate-to-narrow opening.',

        airflow:
          'Maintain smooth voiced airflow through the rounded opening.',

        voicing:
          'Keep continuous vocal vibration.',

        visualCue:
          'You should see obvious lip rounding without a large jaw opening.',

        commonMistake:
          'Moving the tongue backward when the lips round.',

        correction:
          'Hold the forward tongue position and change only the lips.',

        practiceDrill:
          'Alternate an unrounded front vowel with the rounded version while keeping the tongue still.',

        successCue:
          'The lips round strongly while the vowel still feels forward.',

        compareWith:
          'Compare the same tongue position with rounded and unrounded lips.',
      },

      back_rounded_vowel: {
        category: 'rounding',
        frame: 5,

        title: 'Shape the rounded vowel',

        tip:
          'Use the rounded/back mouth posture that belongs to the target vowel.',

        whatToDo:
          'Keep the vowel toward the back of the mouth and use visible rounding when the target requires it.',

        tongue:
          'Keep the tongue farther back than for a front vowel.',

        lips:
          'Use a rounded or softly rounded lip position appropriate to the target sound.',

        jaw:
          'Keep the jaw comfortably open without dropping it excessively.',

        airflow:
          'Let voiced airflow pass smoothly through the mouth.',

        voicing:
          'Maintain continuous voice through the vowel.',

        visualCue:
          'The lips should not look strongly spread as they would for EE.',

        commonMistake:
          'Flattening or spreading the lips so much that the vowel moves toward a front-vowel sound.',

        correction:
          'Bring the vowel farther back and use the target amount of lip rounding.',

        practiceDrill:
          'Practice the target vowel slowly, then compare it with EE to feel the front-versus-back difference.',

        successCue:
          'The vowel feels farther back and the lips are not strongly spread.',

        compareWith:
          'Compare the target with EE and notice the difference in tongue position and lip shape.',
      },

      w_glide: {
        category: 'glides',
        frame: 5,

        title: 'Start W with a strong rounded shape',

        tip:
          'Begin with rounded lips, then move smoothly into the following vowel.',

        whatToDo:
          'Form a brief OO-like lip shape and immediately glide into the next sound.',

        tongue:
          'Keep the tongue raised toward the back without creating a full closure.',

        lips:
          'Round the lips clearly at the beginning of the sound.',

        jaw:
          'Keep the jaw controlled and allow it to follow the next vowel.',

        airflow:
          'Use smooth continuous airflow; do not create a stop or burst.',

        voicing:
          'W is normally voiced.',

        visualCue:
          'The lips should round first and then visibly transition toward the next vowel.',

        commonMistake:
          'Starting the following vowel without making the initial rounded W shape.',

        correction:
          'Pause on a tiny OO shape before gliding into the vowel.',

        practiceDrill:
          'Practice W-OO, W-AH, W-EE slowly, then shorten the transition.',

        successCue:
          'You hear a clear W without a pause between W and the vowel.',

        compareWith:
          'Compare W with a vowel that begins without lip rounding.',
      },

      velar_contact: {
        category: 'velars',
        frame: 6,

        title: 'Move the contact farther back',

        tip:
          'Raise the back of your tongue toward the soft palate for K or G.',

        whatToDo:
          'Make the closure with the back of the tongue rather than the tongue tip.',

        tongue:
          'The back of the tongue should briefly contact the soft palate.',

        lips:
          'The lips do not need to close.',

        jaw:
          'Keep enough opening for the tongue to make the rear contact comfortably.',

        airflow:
          'Build pressure behind the tongue closure, then release it.',

        voicing:
          'K is voiceless; G uses the same tongue location with voice.',

        visualCue:
          'There may be little visible lip movement because the important contact happens farther back in the mouth.',

        commonMistake:
          'Using the tongue tip and producing something closer to T or D.',

        correction:
          'Keep the tongue tip relaxed and move the back of the tongue upward instead.',

        practiceDrill:
          'Alternate K-T-K-T, then G-D-G-D, noticing front contact versus back contact.',

        successCue:
          'The release feels as if it comes from the back of the mouth.',

        compareWith:
          'Compare K with T and G with D.',
      },

      alveolar_contact: {
        category: 'alveolars',
        frame: 7,

        title: 'Use the tongue tip at the alveolar ridge',

        tip:
          'Touch the tongue tip just behind the upper teeth for T or D.',

        whatToDo:
          'Make a brief complete tongue contact at the ridge behind the upper front teeth, then release.',

        tongue:
          'Use the tip or front edge of the tongue at the alveolar ridge.',

        lips:
          'Keep the lips relaxed and open.',

        jaw:
          'Keep a small comfortable opening.',

        airflow:
          'Pressure builds behind the tongue contact and releases quickly.',

        voicing:
          'T is voiceless; D uses the same mouth position with voice.',

        visualCue:
          'The lips should not close together for T or D.',

        commonMistake:
          'Closing the lips or moving the tongue contact too far backward.',

        correction:
          'Touch the ridge behind the upper teeth with the tongue tip, not the lips.',

        practiceDrill:
          'Repeat T-D-T-D slowly while keeping the tongue contact in exactly the same place.',

        successCue:
          'T and D feel identical in tongue placement, differing mainly in voicing.',

        compareWith:
          'Compare T/D with K/G to feel front versus back tongue contact.',
      },

      bilabial_closure: {
        category: 'bilabials',
        frame: 8,

        title: 'Close both lips completely',

        tip:
          'Bring both lips fully together before releasing the sound.',

        whatToDo:
          'Make a clean lip-to-lip seal. Do not leave a gap between the lips.',

        tongue:
          'The tongue can remain relaxed; it does not create the closure.',

        lips:
          'Upper and lower lips must meet completely.',

        jaw:
          'Allow the jaw to support the lip closure without clenching.',

        airflow:
          'For P and B, pressure builds behind the lips and releases. For M, air continues through the nose.',

        voicing:
          'P is voiceless, B is voiced, and M is voiced with nasal airflow.',

        visualCue:
          'The front view should show complete lip closure.',

        commonMistake:
          'Leaving the lips slightly apart and producing a weak or different consonant.',

        correction:
          'Hold the lips together for a brief moment before releasing.',

        practiceDrill:
          'Repeat P-B-M slowly while making the same full lip closure each time.',

        successCue:
          'You can clearly feel both lips touch before the sound releases.',

        compareWith:
          'Compare P/B/M with F/V, where the upper teeth contact the lower lip instead.',
      },

      alveolar_nasal: {
        category: 'nasals',
        frame: 9,

        title: 'Keep N nasal while the tongue stays forward',

        tip:
          'Touch the tongue behind the upper teeth and let the air escape through the nose.',

        whatToDo:
          'Hold the same tongue contact used near T/D, but keep the voice running and open the nasal airflow path.',

        tongue:
          'Touch the alveolar ridge behind the upper front teeth.',

        lips:
          'Keep the lips relaxed and open.',

        jaw:
          'Use a small comfortable opening.',

        airflow:
          'Air should exit through the nose rather than the mouth.',

        voicing:
          'N is voiced.',

        visualCue:
          'The lips stay apart; the important distinction is tongue contact plus nasal airflow.',

        commonMistake:
          'Releasing the tongue and turning N into a vowel or blocking the nasal airflow.',

        correction:
          'Keep the tongue touching while humming through the nose.',

        practiceDrill:
          'Hold NNN, then alternate N-D-N-D to feel nasal flow versus an oral stop.',

        successCue:
          'You should feel vibration and airflow through the nose while the tongue remains in contact.',

        compareWith:
          'Compare N with D: same general tongue location, different airflow.',
      },

      velar_nasal: {
        category: 'nasals',
        frame: 10,

        title: 'Move the nasal contact to the back',

        tip:
          'Raise the back of the tongue and let the sound resonate through the nose for NG.',

        whatToDo:
          'Use the back of the tongue against the soft palate while keeping nasal airflow open.',

        tongue:
          'The back of the tongue makes the contact; the tongue tip should remain relaxed.',

        lips:
          'Keep the lips relaxed.',

        jaw:
          'Keep a comfortable opening.',

        airflow:
          'Air exits through the nose while the oral path is blocked by the back of the tongue.',

        voicing:
          'NG is voiced.',

        visualCue:
          'There may be little obvious lip movement because the important action occurs at the back of the tongue.',

        commonMistake:
          'Adding a separate hard G release after NG when it is not required.',

        correction:
          'Hold the nasal resonance and finish without adding an extra stop.',

        practiceDrill:
          'Hold NG, then alternate NG-G-NG-G to feel nasal versus oral release.',

        successCue:
          'The sound resonates through the nose and the tongue contact feels far back.',

        compareWith:
          'Compare NG with N to feel back versus front tongue placement.',
      },

      sibilant_channel: {
        category: 'sibilants',
        frame: 11,

        title: 'Make a narrow S/Z air channel',

        tip:
          'Keep a narrow central airflow channel and avoid rounding the lips.',

        whatToDo:
          'Bring the tongue close to the ridge behind the upper teeth without fully blocking the airflow.',

        tongue:
          'The tongue forms a narrow groove directing air toward the front teeth.',

        lips:
          'Keep the lips mostly neutral or slightly spread, not rounded.',

        jaw:
          'Keep a small opening.',

        airflow:
          'Use a narrow, steady, focused stream of air.',

        voicing:
          'S is voiceless; Z uses the same mouth shape with vocal vibration.',

        visualCue:
          'The mouth should look relatively narrow and unrounded.',

        commonMistake:
          'Rounding the lips or allowing the air channel to become too wide.',

        correction:
          'Flatten the lips slightly and focus the air through the center.',

        practiceDrill:
          'Hold SSS, then ZZZ, keeping the mouth shape unchanged.',

        successCue:
          'The airflow sounds focused and hiss-like instead of diffuse.',

        compareWith:
          'Compare S/Z with SH/ZH and notice that SH/ZH use more lip rounding.',
      },

      postalveolar_channel: {
        category: 'postalveolars',
        frame: 12,

        title: 'Move SH/ZH slightly back and add rounding',

        tip:
          'Move the tongue channel slightly farther back and round the lips more than for S or Z.',

        whatToDo:
          'Create a broad narrow channel behind the alveolar ridge while gently rounding the lips.',

        tongue:
          'Raise the front of the tongue toward the area just behind the alveolar ridge without full closure.',

        lips:
          'Use mild visible rounding.',

        jaw:
          'Keep a modest opening.',

        airflow:
          'Maintain steady turbulent airflow.',

        voicing:
          'SH is voiceless; ZH uses the same articulation with voice.',

        visualCue:
          'The lips should look more rounded than they do for S or Z.',

        commonMistake:
          'Keeping the tongue too far forward and producing S or Z.',

        correction:
          'Move the tongue channel slightly backward and add gentle rounding.',

        practiceDrill:
          'Alternate S-SH-S-SH, then Z-ZH-Z-ZH.',

        successCue:
          'SH/ZH sound deeper and less sharp than S/Z.',

        compareWith:
          'Compare SH with S and ZH with Z.',
      },

      dental_fricative: {
        category: 'dentals',
        frame: 13,

        title: 'Bring the tongue to the teeth',

        tip:
          'Place the tongue lightly at or just between the front teeth and let air pass around it.',

        whatToDo:
          'Use gentle tongue-to-teeth contact without making a complete stop.',

        tongue:
          'The tongue tip should reach the upper front teeth or extend very slightly between the teeth.',

        lips:
          'Keep the lips relaxed and out of the way.',

        jaw:
          'Keep enough opening for the tongue tip to reach the teeth.',

        airflow:
          'Let a continuous stream of air pass around the tongue.',

        voicing:
          'TH may be voiceless or voiced depending on the word; the mouth position remains essentially the same.',

        visualCue:
          'A small amount of tongue may be visible near the front teeth.',

        commonMistake:
          'Keeping the tongue behind the teeth and producing T, D, S, or Z instead.',

        correction:
          'Move the tongue forward until it lightly meets the teeth, then sustain the airflow.',

        practiceDrill:
          'Hold TH slowly, then compare TH-S and voiced TH-Z.',

        successCue:
          'You feel light tongue-to-teeth contact with continuous airflow rather than a stop.',

        compareWith:
          'Compare TH with T/D and S/Z.',
      },

      labiodental_contact: {
        category: 'labiodentals',
        frame: 14,

        title: 'Use upper teeth against the lower lip',

        tip:
          'Rest the upper teeth lightly against the inside edge of the lower lip.',

        whatToDo:
          'Create a narrow air passage between the upper teeth and lower lip without closing both lips together.',

        tongue:
          'Keep the tongue relaxed; it does not make the constriction.',

        lips:
          'The lower lip touches the upper teeth. The two lips should not close together.',

        jaw:
          'Keep the jaw steady and comfortable.',

        airflow:
          'Send a continuous stream of air between the teeth and lower lip.',

        voicing:
          'F is voiceless; V uses the same mouth position with vocal vibration.',

        visualCue:
          'You should see the upper teeth near or touching the lower lip.',

        commonMistake:
          'Closing both lips together and drifting toward P or B.',

        correction:
          'Keep the upper lip out of the closure and let only the lower lip meet the upper teeth.',

        practiceDrill:
          'Hold FFFF, then VVVV, then alternate F-V-F-V without changing the mouth position.',

        successCue:
          'You feel air at the lower lip and the upper teeth remain in contact with it.',

        compareWith:
          'Compare F/V with P/B.',
      },

      affricate_release: {
        category: 'affricates',
        frame: 15,

        title: 'Combine the stop and friction into one sound',

        tip:
          'Begin with a brief tongue closure and release directly into the SH/ZH-like airflow.',

        whatToDo:
          'Do not separate the stop and fricative into two independent syllables. They should form one compact consonant.',

        tongue:
          'Begin with contact near the postalveolar region, then release into a narrow fricative channel.',

        lips:
          'Use mild rounding during the release.',

        jaw:
          'Keep a controlled small-to-moderate opening.',

        airflow:
          'Pressure builds briefly, then releases into turbulent airflow.',

        voicing:
          'CH is voiceless; J uses the corresponding voiced pattern.',

        visualCue:
          'You may see a short restricted phase followed immediately by a slightly rounded release.',

        commonMistake:
          'Producing only SH/ZH or separating the stop and fricative too much.',

        correction:
          'Make the closure very brief and let it flow directly into the friction.',

        practiceDrill:
          'Practice T-SH faster and faster until it becomes one CH sound; repeat the voiced version for J.',

        successCue:
          'You hear one compact consonant with a crisp beginning and friction at the release.',

        compareWith:
          'Compare CH with SH and J with ZH.',
      },

      glottal_airflow: {
        category: 'airflow',
        frame: 16,

        title: 'Let H come from the breath',

        tip:
          'Keep the mouth open and let H begin as a gentle breath rather than a tongue or lip closure.',

        whatToDo:
          'Shape the mouth for the following vowel and begin it with a soft stream of breath.',

        tongue:
          'Do not create a special tongue closure for H.',

        lips:
          'Let the lips take the shape of the following vowel.',

        jaw:
          'Let the jaw follow the vowel that comes next.',

        airflow:
          'Use open, unobstructed airflow from the throat through the mouth.',

        voicing:
          'Begin without strong vocal vibration, then transition into the following voiced sound.',

        visualCue:
          'There should be no lip closure or obvious tongue blockage.',

        commonMistake:
          'Adding a hard consonant-like closure before the vowel.',

        correction:
          'Exhale gently into the vowel instead of striking the sound.',

        practiceDrill:
          'Whisper H before AH, EE, and OO, then gradually add the normal voice of the vowel.',

        successCue:
          'H feels like breath entering the following vowel.',

        compareWith:
          'Compare H-AH with a plain AH beginning.',
      },

      rhotic_shape: {
        category: 'rhotics',
        frame: 17,

        title: 'Shape the English R',

        tip:
          'Retract or bunch the tongue for R without letting the tongue tip make firm contact.',

        whatToDo:
          'Create a narrow central tongue shape while keeping the tip free of a hard closure.',

        tongue:
          'The tongue may be slightly curled back or bunched upward depending on the speaker, but it should not tap the roof.',

        lips:
          'A small amount of lip rounding may help.',

        jaw:
          'Keep a moderate opening.',

        airflow:
          'Maintain smooth voiced airflow through the central channel.',

        voicing:
          'English R and ER are voiced.',

        visualCue:
          'The lips may round slightly, but there should be no full closure.',

        commonMistake:
          'Letting the tongue touch or tap the roof of the mouth, producing an L-like or tap-like sound.',

        correction:
          'Pull or bunch the tongue slightly backward and keep the tip from making firm contact.',

        practiceDrill:
          'Hold RRR or ER slowly, then alternate R-L-R-L while noticing contact versus no contact.',

        successCue:
          'The rhotic quality remains continuous and does not contain a tongue tap.',

        compareWith:
          'Compare R with L.',
      },

      lateral_l: {
        category: 'laterals',
        frame: 18,

        title: 'Touch the tongue tip and let air escape around the sides',

        tip:
          'Place the tongue tip behind the upper teeth and let the airflow pass around the sides of the tongue.',

        whatToDo:
          'Make firm tongue-tip contact while keeping side passages open for the air.',

        tongue:
          'The tongue tip touches the alveolar ridge behind the upper front teeth.',

        lips:
          'Keep the lips relaxed.',

        jaw:
          'Use a comfortable moderate opening.',

        airflow:
          'Air should move around the sides of the tongue rather than straight through the centre.',

        voicing:
          'L is voiced.',

        visualCue:
          'The lips remain open; the critical movement is the tongue-tip contact.',

        commonMistake:
          'Pulling the tongue away from the ridge and turning L toward a vowel or R-like sound.',

        correction:
          'Touch the ridge deliberately and hold LLL for a moment.',

        practiceDrill:
          'Hold LLL, then alternate L-R-L-R.',

        successCue:
          'You feel clear tongue-tip contact while the sound continues.',

        compareWith:
          'Compare L with R.',
      },

      y_glide: {
        category: 'glides',
        frame: 19,

        title: 'Glide from a high front tongue position',

        tip:
          'Raise the front of the tongue toward the roof of the mouth and glide directly into the vowel.',

        whatToDo:
          'Begin from an EE-like tongue position without holding a full vowel, then move immediately into the next sound.',

        tongue:
          'Keep the front of the tongue high and close to the hard palate without touching it.',

        lips:
          'Keep the lips generally unrounded unless the following vowel changes them.',

        jaw:
          'Use a relatively narrow opening at the start.',

        airflow:
          'Maintain smooth continuous airflow.',

        voicing:
          'Y is voiced.',

        visualCue:
          'The mouth should transition smoothly into the following vowel rather than stopping.',

        commonMistake:
          'Turning Y into a full EE vowel or omitting the glide completely.',

        correction:
          'Start from the EE position but move immediately into the following vowel.',

        practiceDrill:
          'Practice Y-AH, Y-OO, and Y-EE slowly, then shorten the initial glide.',

        successCue:
          'You hear a brief glide rather than a separate extra syllable.',

        compareWith:
          'Compare Y-AH with plain AH.',
      },

      voicing_contrast: {
        category: 'voicing',

        title: 'Keep the mouth shape—change the voice',

        tip:
          'Your mouth position may be close. Concentrate on whether your vocal cords should be vibrating.',

        whatToDo:
          'Keep the same lips and tongue position and switch only the voicing on or off.',

        tongue:
          'Do not change the articulation location merely to change voicing.',

        lips:
          'Keep the same lip shape for the paired sounds.',

        jaw:
          'Keep the same jaw position.',

        airflow:
          'Maintain the appropriate airflow while changing vocal vibration.',

        voicing:
          'Touch your throat lightly. A voiced sound should produce noticeable vibration; its voiceless partner should not.',

        visualCue:
          'The visible mouth shape may look nearly identical between voiced and voiceless partners.',

        commonMistake:
          'Changing tongue or lip placement when the real difference is voicing.',

        correction:
          'Freeze the mouth position and practice turning throat vibration on and off.',

        practiceDrill:
          'Alternate the confused pair slowly while touching your throat.',

        successCue:
          'The mouth stays nearly unchanged while the throat vibration clearly switches.',

        compareWith:
          'Useful pairs include P/B, T/D, K/G, F/V, S/Z, SH/ZH, TH/DH, and CH/J.',
      },

      nasal_oral_contrast: {
        category: 'nasal_oral_contrast',

        title: 'Send the airflow through the correct path',

        tip:
          'Keep the mouth position, but make sure the airflow is nasal when the target sound requires it.',

        whatToDo:
          'For a nasal sound, allow air to leave through the nose. For an oral sound, keep the nasal airflow closed.',

        tongue:
          'Maintain the target tongue placement while changing the airflow route.',

        lips:
          'Keep the required lip closure or opening for the target consonant.',

        jaw:
          'Do not change the jaw merely to create nasal airflow.',

        airflow:
          'The important distinction is nose versus mouth airflow.',

        voicing:
          'English nasal consonants are voiced.',

        visualCue:
          'Some nasal/oral contrasts can look very similar from the front, so airflow evidence matters.',

        commonMistake:
          'Using the correct visible mouth position but sending the air through the wrong path.',

        correction:
          'Hold the sound and notice whether you feel vibration and airflow at the nose.',

        practiceDrill:
          'Alternate M-B, N-D, and NG-G to compare nasal versus oral airflow.',

        successCue:
          'You can feel the airflow route change while the articulation location remains stable.',

        compareWith:
          'Compare M/B, N/D, and NG/G.',
      },
    },

    triggers: [
      // ---------------------------------------------------------------------
      // Frame 01 — English A / AH / AW / AI
      // ---------------------------------------------------------------------
      {
        id: 'open_vowel_too_closed',
        cardId: 'open_vowel_jaw',
        priority: 100,

        expectedPhonemes: [
          'a',
          'ah',
          'aw',
          'ai',
        ],

        requireAudioMismatch: true,
        requireVisualCondition: true,

        visualAny: [
          {
            feature: 'mouth_open',
            relation: 'below_expected',
            minDelta: 0.18,
          },
        ],
      },

      {
        id: 'open_vowel_fallback',
        cardId: 'open_vowel_jaw',
        priority: 40,

        expectedPhonemes: [
          'a',
          'ah',
          'aw',
          'ai',
        ],

        requireAudioMismatch: true,
      },

      // ---------------------------------------------------------------------
      // Frame 02 — English E / I(IH) / EI
      // ---------------------------------------------------------------------
      {
        id: 'mid_vowel_shape',
        cardId: 'mid_vowel_balance',
        priority: 70,

        expectedPhonemes: [
          'e',
          'i',
          'ei',
        ],

        requireAudioMismatch: true,

        visualAny: [
          {
            feature: 'mouth_open',
            relation: 'outside_expected',
            minDelta: 0.2,
          },
        ],
      },

      {
        id: 'mid_vowel_fallback',
        cardId: 'mid_vowel_balance',
        priority: 35,

        expectedPhonemes: [
          'e',
          'i',
          'ei',
        ],

        requireAudioMismatch: true,
      },

      // ---------------------------------------------------------------------
      // Frame 03 — English EE
      // ---------------------------------------------------------------------
      {
        id: 'front_vowel_not_spread',
        cardId: 'high_front_vowel',
        priority: 100,

        expectedPhonemes: [
          'ee',
        ],

        requireAudioMismatch: true,
        requireVisualCondition: true,

        visualAny: [
          {
            feature: 'lip_spread',
            relation: 'below_expected',
            minDelta: 0.18,
          },

          {
            feature: 'lip_rounding',
            relation: 'above_expected',
            minDelta: 0.18,
          },

          {
            feature: 'mouth_open',
            relation: 'above_expected',
            minDelta: 0.2,
          },
        ],
      },

      {
        id: 'front_vowel_fallback',
        cardId: 'high_front_vowel',
        priority: 40,

        expectedPhonemes: [
          'ee',
        ],

        requireAudioMismatch: true,
      },

      // ---------------------------------------------------------------------
      // Frame 04 — universal front-rounded vowel
      // ---------------------------------------------------------------------
      //
      // No current English phoneme uses frame 04.
      //
      // English canonical token "ue" represents ARPABET UH and therefore
      // belongs to English frame 05 rather than universal frame 04.
      //

      // ---------------------------------------------------------------------
      // Frame 05 — English UE / OO / O / OW / OI
      // ---------------------------------------------------------------------
      {
        id: 'rounded_vowel_not_rounded',
        cardId: 'back_rounded_vowel',
        priority: 100,

        expectedPhonemes: [
          'ue',
          'oo',
          'o',
          'ow',
          'oi',
        ],

        requireAudioMismatch: true,
        requireVisualCondition: true,

        visualAny: [
          {
            feature: 'lip_rounding',
            relation: 'below_expected',
            minDelta: 0.18,
          },

          {
            feature: 'lip_spread',
            relation: 'above_expected',
            minDelta: 0.2,
          },
        ],
      },

      {
        id: 'rounded_vowel_fallback',
        cardId: 'back_rounded_vowel',
        priority: 40,

        expectedPhonemes: [
          'ue',
          'oo',
          'o',
          'ow',
          'oi',
        ],

        requireAudioMismatch: true,
      },

      {
        id: 'w_rounding',
        cardId: 'w_glide',
        priority: 100,

        expectedPhonemes: [
          'w',
        ],

        requireAudioMismatch: true,

        visualAny: [
          {
            feature: 'lip_rounding',
            relation: 'below_expected',
            minDelta: 0.15,
          },
        ],
      },

      // ---------------------------------------------------------------------
      // Frame 06 — K / G
      // ---------------------------------------------------------------------
      {
        id: 'velar_place',
        cardId: 'velar_contact',
        priority: 60,

        expectedPhonemes: [
          'k',
          'g',
        ],

        requireAudioMismatch: true,
      },

      // ---------------------------------------------------------------------
      // Frame 07 — T / D
      // ---------------------------------------------------------------------
      {
        id: 'alveolar_stop_place',
        cardId: 'alveolar_contact',
        priority: 60,

        expectedPhonemes: [
          't',
          'd',
        ],

        requireAudioMismatch: true,
      },

      // ---------------------------------------------------------------------
      // Frame 08 — P / B / M
      // ---------------------------------------------------------------------
      {
        id: 'bilabial_not_closed',
        cardId: 'bilabial_closure',
        priority: 120,

        expectedPhonemes: [
          'p',
          'b',
          'm',
        ],

        requireAudioMismatch: true,
        requireVisualCondition: true,

        visualAny: [
          {
            feature: 'lip_closure',
            relation: 'below_expected',
            minDelta: 0.18,
          },

          {
            feature: 'bilabial_closure_proxy',
            relation: 'below_absolute',
            value: 0.45,
          },
        ],
      },

      {
        id: 'bilabial_fallback',
        cardId: 'bilabial_closure',
        priority: 50,

        expectedPhonemes: [
          'p',
          'b',
          'm',
        ],

        requireAudioMismatch: true,
      },

      // ---------------------------------------------------------------------
      // Frame 09 — N
      // ---------------------------------------------------------------------
      {
        id: 'n_place_and_airflow',
        cardId: 'alveolar_nasal',
        priority: 60,

        expectedPhonemes: [
          'n',
        ],

        requireAudioMismatch: true,
      },

      // ---------------------------------------------------------------------
      // Frame 10 — NG
      // ---------------------------------------------------------------------
      {
        id: 'ng_place_and_airflow',
        cardId: 'velar_nasal',
        priority: 60,

        expectedPhonemes: [
          'ng',
        ],

        requireAudioMismatch: true,
      },

      // ---------------------------------------------------------------------
      // Frame 11 — S / Z
      // ---------------------------------------------------------------------
      {
        id: 'sibilant_shape',
        cardId: 'sibilant_channel',
        priority: 100,

        expectedPhonemes: [
          's',
          'z',
        ],

        requireAudioMismatch: true,

        visualAny: [
          {
            feature: 'lip_rounding',
            relation: 'above_expected',
            minDelta: 0.18,
          },

          {
            feature: 'lip_spread',
            relation: 'below_expected',
            minDelta: 0.18,
          },
        ],
      },

      {
        id: 'sibilant_fallback',
        cardId: 'sibilant_channel',
        priority: 45,

        expectedPhonemes: [
          's',
          'z',
        ],

        requireAudioMismatch: true,
      },

      // ---------------------------------------------------------------------
      // Frame 12 — SH / ZH
      // ---------------------------------------------------------------------
      {
        id: 'postalveolar_shape',
        cardId: 'postalveolar_channel',
        priority: 100,

        expectedPhonemes: [
          'sh',
          'zh',
        ],

        requireAudioMismatch: true,

        visualAny: [
          {
            feature: 'lip_rounding',
            relation: 'below_expected',
            minDelta: 0.15,
          },
        ],
      },

      {
        id: 'postalveolar_fallback',
        cardId: 'postalveolar_channel',
        priority: 45,

        expectedPhonemes: [
          'sh',
          'zh',
        ],

        requireAudioMismatch: true,
      },

      // ---------------------------------------------------------------------
      // Frame 13 — TH / DH
      // ---------------------------------------------------------------------
      {
        id: 'dental_place',
        cardId: 'dental_fricative',
        priority: 100,

        expectedPhonemes: [
          'th',
          'dh',
        ],

        requireAudioMismatch: true,

        visualAny: [
          {
            feature: 'tongue_out',
            relation: 'below_absolute',
            value: 0.08,
          },
        ],
      },

      {
        id: 'dental_fallback',
        cardId: 'dental_fricative',
        priority: 50,

        expectedPhonemes: [
          'th',
          'dh',
        ],

        requireAudioMismatch: true,
      },

      // ---------------------------------------------------------------------
      // Frame 14 — F / V
      // ---------------------------------------------------------------------
      {
        id: 'labiodental_contact_missing',
        cardId: 'labiodental_contact',
        priority: 130,

        expectedPhonemes: [
          'f',
          'v',
        ],

        requireAudioMismatch: true,
        requireVisualCondition: true,

        visualAny: [
          {
            feature: 'labiodental_contact_proxy',
            relation: 'below_absolute',
            value: 0.3,
          },

          {
            feature: 'bilabial_closure_proxy',
            relation: 'above_absolute',
            value: 0.6,
          },
        ],
      },

      {
        id: 'labiodental_fallback',
        cardId: 'labiodental_contact',
        priority: 55,

        expectedPhonemes: [
          'f',
          'v',
        ],

        requireAudioMismatch: true,
      },

      // ---------------------------------------------------------------------
      // Frame 15 — CH / J
      // ---------------------------------------------------------------------
      {
        id: 'affricate_release',
        cardId: 'affricate_release',
        priority: 60,

        expectedPhonemes: [
          'ch',
          'j',
        ],

        requireAudioMismatch: true,
      },

      // ---------------------------------------------------------------------
      // Frame 16 — H
      // ---------------------------------------------------------------------
      {
        id: 'h_airflow',
        cardId: 'glottal_airflow',
        priority: 60,

        expectedPhonemes: [
          'h',
        ],

        requireAudioMismatch: true,
      },

      // ---------------------------------------------------------------------
      // Frame 17 — R / ER
      // ---------------------------------------------------------------------
      {
        id: 'r_shape',
        cardId: 'rhotic_shape',
        priority: 60,

        expectedPhonemes: [
          'r',
          'er',
        ],

        requireAudioMismatch: true,
      },

      // ---------------------------------------------------------------------
      // Frame 18 — L
      // ---------------------------------------------------------------------
      {
        id: 'l_lateral',
        cardId: 'lateral_l',
        priority: 60,

        expectedPhonemes: [
          'l',
        ],

        requireAudioMismatch: true,
      },

      // ---------------------------------------------------------------------
      // Frame 19 — Y
      // ---------------------------------------------------------------------
      {
        id: 'y_glide',
        cardId: 'y_glide',
        priority: 60,

        expectedPhonemes: [
          'y',
        ],

        requireAudioMismatch: true,
      },

      // ---------------------------------------------------------------------
      // Voicing confusion pairs
      // ---------------------------------------------------------------------
      {
        id: 'voicing_pair_confusion',
        cardId: 'voicing_contrast',
        priority: 150,

        requireAudioMismatch: true,

        confusionPairs: [
          ['p', 'b'],
          ['b', 'p'],

          ['t', 'd'],
          ['d', 't'],

          ['k', 'g'],
          ['g', 'k'],

          ['f', 'v'],
          ['v', 'f'],

          ['s', 'z'],
          ['z', 's'],

          ['sh', 'zh'],
          ['zh', 'sh'],

          ['th', 'dh'],
          ['dh', 'th'],

          ['ch', 'j'],
          ['j', 'ch'],
        ],
      },

      // ---------------------------------------------------------------------
      // Nasal / oral confusion pairs
      // ---------------------------------------------------------------------
      {
        id: 'nasal_oral_confusion',
        cardId: 'nasal_oral_contrast',
        priority: 145,

        requireAudioMismatch: true,

        confusionPairs: [
          ['m', 'b'],
          ['m', 'p'],
          ['b', 'm'],
          ['p', 'm'],

          ['n', 'd'],
          ['n', 't'],
          ['d', 'n'],
          ['t', 'n'],

          ['ng', 'g'],
          ['ng', 'k'],
          ['g', 'ng'],
          ['k', 'ng'],
        ],
      },
    ],
  },
};

export default coachingRules;