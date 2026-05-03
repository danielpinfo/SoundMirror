# Universal Sprite Assets

Target project folder:

`src/components/animation/assets/`

Files:

- `front_universal_20.png`
- `side_universal_20.png`
- `universal_sprite_metadata.json`

Layout:

- Each sprite sheet is a single horizontal row of 20 frames.
- Frame order is 00 through 19, left to right.
- No padding and no spacing.
- Each front frame is 939 x 793.
- Each side frame is 939 x 793.
- Each full sheet is 18,780 x 793.
- Front and side frames are index-locked: front frame N pairs with side frame N.

Important:

The metadata contains no timing values. Timing must come from TTS audio duration.
PE provides the phoneme sequence. AE maps phonemes to frames and distributes them
across the TTS timing container.
