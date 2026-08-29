# SoundMirror Phoneme Service Contract

## Goal
Replace Whisper-based word guessing with true phoneme detection.

## Architecture
SoundMirror app shell
-> functions/analyzeRecording.ts
-> local Python phoneme service
-> phoneme result
-> shell comparison / coaching

## Request
POST /detect-phonemes

Content-Type: application/json

```json
{
  "audioBase64": "<base64 audio>",
  "language": "en"
}
````

## Response

```json
{
  "provider": "huggingface",
  "phonemes": ["j", "ɛ", "l", "oʊ"],
  "confidence": 0.82,
  "rawSegments": []
}
```

## Rules

* No word guessing
* No transcript output
* No autocorrect
* No language model smoothing
* Acoustic evidence only

## Notes

* analyzeRecording.ts should stop calling OpenAI Whisper
* analyzeRecording.ts should call this phoneme service instead
* language packs remain responsible for interpretation, articulation mapping, and coaching

```
``