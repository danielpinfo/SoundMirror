# Universal Sprite Assets

Target project folder:

`src/components/animation/assets/`

Files:

- `front_universal_20.png`
- `side_universal_20.png`
- `universal_sprite_metadata.json`

Layout:

- Each sprite sheet is a 5 x 4 grid of 20 frames.
- Frame order is 00 through 19, left to right, top to bottom.
- No padding and no spacing.
- Each front frame is 939 x 793.
- Each side frame is 939 x 793.
- Each full sheet is 4695 x 3172.
- Front and side frames are index-locked: front frame N pairs with side frame N.

Grid order:

```
00 01 02 03 04
05 06 07 08 09
10 11 12 13 14
15 16 17 18 19
```

Important:

- The runtime PNGs contain no human-readable labels.
- The metadata JSON contains the labels and exact x/y/w/h coordinates.
- The metadata contains no timing values. Timing must come from TTS audio duration.
- PE provides the phoneme sequence. AE maps phonemes to frames and distributes them
  across the TTS timing container.
