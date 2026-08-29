/**
 * AirflowEngine
 *
 * Pure state machine — no React, no canvas.
 *
 * update() accepts a timelineEntry produced by resolveTimelinePosition():
 *   { frame, phoneme?, start?, end?, startMs?, endMs? }
 *
 * Lookup priority:
 *   1. airflowMap.byPhoneme[phoneme]  — phoneme-accurate airflow (speech mode)
 *   2. airflowMap.byFrame[frame]      — frame-index fallback
 *   3. AIRFLOW_IDLE                   — no airflow
 *
 * When timeline timestamps and posMs are available, airflow timing is driven
 * by the playback position rather than wall-clock time.
 */

export const AIRFLOW_IDLE = {
  pattern: 'silence',
  origin: 'lungs',
  exit: 'mouth',
  velocity: 0,
  width: 'narrow',
  oral: 0,
  nasal: 0,
  turbulent: false,
  burst: false,
  split: false,
  age: 0,
};

function finiteNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function clamp01(value) {
  return Math.max(
    0,
    Math.min(1, Number(value) || 0)
  );
}

export class AirflowEngine {
  constructor(airflowMap) {
    this._byFrame =
      airflowMap?.byFrame ?? {};

    this._byPhoneme =
      airflowMap?.byPhoneme ?? {};

    /*
     * A slot must represent a particular occurrence in the timeline,
     * not merely a phoneme symbol.
     *
     * This matters for sequences such as:
     *   s ... s
     *   a ... a
     *
     * where the same phoneme appears more than once.
     */
    this._slotKey = null;
    this._slotEnterTime = 0;
    this._lastPosMs = null;
  }

  /**
   * @param {{
   *   frame: number,
   *   phoneme?: string,
   *   start?: number,
   *   end?: number,
   *   startMs?: number,
   *   endMs?: number
   * }} entry
   *
   * frame   — articulation frame index (0–19)
   * phoneme — language-pack phoneme/unit when available
   * start   — slot start in ms
   * end     — slot end in ms
   *
   * @param {number} now
   *   performance.now() fallback for non-timeline/manual modes
   *
   * @param {number|null} posMs
   *   current playback/timeline position in ms
   *
   * @returns {object} airflow state
   */
  update(entry, now, posMs = null) {
    const frame =
      entry?.frame ??
      entry ??
      0;

    const phoneme =
      entry?.phoneme ??
      null;

    const start =
      finiteNumber(
        entry?.startMs ??
        entry?.start
      );

    const end =
      finiteNumber(
        entry?.endMs ??
        entry?.end
      );

    const playheadMs =
      finiteNumber(posMs);

    /*
     * Include timing boundaries in the slot identity.
     *
     * Two consecutive occurrences of the same phoneme therefore remain
     * separate airflow events.
     */
    const slotKey = [
      phoneme ?? `frame:${frame}`,
      frame,
      start ?? '',
      end ?? '',
    ].join('|');

    /*
     * Seeking backwards also represents a fresh entry into the current
     * timeline state.
     */
    const movedBackward =
      playheadMs != null &&
      this._lastPosMs != null &&
      playheadMs < this._lastPosMs;

    if (
      slotKey !== this._slotKey ||
      movedBackward
    ) {
      this._slotKey =
        slotKey;

      this._slotEnterTime =
        now;
    }

    if (playheadMs != null) {
      this._lastPosMs =
        playheadMs;
    }

    /*
     * Phoneme truth is authoritative during speech.
     * Frame lookup exists only as a fallback for modes where no phoneme
     * is available.
     */
    const def =
      (
        phoneme &&
        this._byPhoneme[phoneme]
      ) ??
      this._byFrame[String(frame)] ??
      this._byFrame[frame];

    if (!def) {
      return {
        ...AIRFLOW_IDLE,
        phoneme,
        age: 0,
      };
    }

    const phonemeDuration =
      start != null &&
      end != null
        ? Math.max(
            0,
            end - start
          )
        : null;

    /*
     * Speech/timeline mode:
     * derive age directly from the supplied playhead.
     *
     * Manual/frame-only mode:
     * fall back to wall-clock time since entering the slot.
     */
    let age;

    if (
      playheadMs != null &&
      start != null
    ) {
      age =
        Math.max(
          0,
          playheadMs - start
        );

      if (
        phonemeDuration != null
      ) {
        age =
          Math.min(
            age,
            phonemeDuration
          );
      }
    } else {
      age =
        Math.max(
          0,
          now -
          this._slotEnterTime
        );
    }

    let velocity =
      clamp01(
        def.velocity ?? 0
      );

    /*
     * Stops and other burst profiles receive a short attack/sustain/release
     * envelope. When exact timeline duration exists, the envelope remains
     * completely inside that phoneme's assigned time.
     */
    if (def.burst) {
      const duration =
        phonemeDuration != null &&
        phonemeDuration > 0
          ? phonemeDuration
          : null;

      const rampEnd =
        duration != null
          ? duration * 0.35
          : 80;

      const sustainEnd =
        duration != null
          ? duration * 0.55
          : 120;

      const fadeEnd =
        duration != null
          ? duration * 0.95
          : 400;

      const peakVelocity =
        velocity * 1.6;

      if (
        rampEnd > 0 &&
        age < rampEnd
      ) {
        velocity =
          (age / rampEnd) *
          peakVelocity;
      } else if (
        age < sustainEnd
      ) {
        velocity =
          peakVelocity;
      } else if (
        fadeEnd > sustainEnd &&
        age < fadeEnd
      ) {
        velocity =
          peakVelocity *
          (
            1 -
            (
              age -
              sustainEnd
            ) /
            (
              fadeEnd -
              sustainEnd
            )
          );
      } else {
        velocity = 0;
      }
    }

    return {
      pattern:
        def.pattern ??
        'continuous',

      origin:
        def.origin ??
        'lungs',

      exit:
        def.exit ??
        'mouth',

      velocity:
        clamp01(velocity),

      width:
        def.width ??
        'medium',

      oral:
        clamp01(
          def.oral ?? 0
        ),

      nasal:
        clamp01(
          def.nasal ?? 0
        ),

      turbulent:
        def.turbulent ??
        false,

      burst:
        def.burst ??
        false,

      split:
        def.split ??
        false,

      phoneme,

      age,
    };
  }

  /**
   * Hot-swap the active language pack's airflow map.
   */
  setMap(airflowMap) {
    this._byFrame =
      airflowMap?.byFrame ?? {};

    this._byPhoneme =
      airflowMap?.byPhoneme ?? {};

    this._slotKey = null;
    this._slotEnterTime = 0;
    this._lastPosMs = null;
  }
}