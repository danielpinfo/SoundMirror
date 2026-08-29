/**
 * AirflowRenderer
 *
 * Renders the full airflow scene on a canvas:
 *   • Internal ribbon: lungs → oral cavity
 *   • External ribbon: mouth → outside air  (visible for fricatives / vowels)
 *   • Nasal split ribbon: oral cavity → nasal cavity → nose exit
 *   • Idle breathing ribbon: nose ↔ nasal cavity
 *   • Particle layer on top
 *
 * All geometry is proportional to canvas width/height — no hardcoded pixels.
 * Language rules come exclusively from the airflow state produced by AirflowEngine.
 */

import { drawRibbon }             from './AirflowRibbon';
import { AirflowParticleEmitter } from './AirflowParticleEmitter';

export class AirflowRenderer {
  constructor(canvas) {
    this._canvas      = canvas;
    this._emitter     = new AirflowParticleEmitter();
    this._breathPhase = 0;
  }

  /**
   * Main render call — invoke every RAF tick.
   * @param {object} state   — output from AirflowEngine.update()
   * @param {boolean} isPlaying
   */
  render(state, isPlaying) {
    const canvas = this._canvas;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const W   = canvas.width;
    const H   = canvas.height;
    const cx  = W * 0.5;

    ctx.clearRect(0, 0, W, H);

    if (!isPlaying) {
      this._emitter.clear();
      return;
    }

    // ── Geometry anchors (all relative) ───────────────────────────────────────
    const g = {
      thorax:       { x: cx,              y: H * 0.82 },
      oralIn:       { x: cx,              y: H * 0.56 },
      mouthExit:    { x: cx,              y: H * 0.64 },
      nasalIn:      { x: cx - W * 0.03,   y: H * 0.42 },
      noseExit:     { x: cx - W * 0.04,   y: H * 0.30 },
      outsideMouth: { x: cx + W * 0.02,   y: H * 0.74 },
    };

    const { oral, nasal, velocity, turbulent, burst, split, pattern } = state;
    const ov = oral  * velocity;
    const nv = nasal * velocity;

    // ── 1. Idle breathing ─────────────────────────────────────────────────────
    if (pattern === 'breathing') {
      this._breathPhase += 0.035;
      const osc = 0.5 + 0.5 * Math.sin(this._breathPhase);
      const bv  = nv > 0 ? nv * osc : 0.15 * osc;

      if (bv > 0.03) {
        drawRibbon(ctx, {
          p0:  g.noseExit,
          cp1: { x: cx - W * 0.03, y: H * 0.32 },
          cp2: { x: cx - W * 0.01, y: H * 0.38 },
          p1:  g.nasalIn,
        }, { width: 3 + bv * 6, widthEnd: 1.5, color: '120,200,255', opacity: bv * 0.55 });
      }

      this._emitter.update();
      this._emitter.draw(ctx);
      return;
    }

    // ── 2. Internal oral flow: thorax → oral cavity ───────────────────────────
    if (ov > 0.04) {
      const iw = 7 + ov * 12;
      drawRibbon(ctx, {
        p0:  g.thorax,
        cp1: { x: cx - W * 0.06, y: H * 0.72 },
        cp2: { x: cx + W * 0.04, y: H * 0.62 },
        p1:  g.oralIn,
      }, { width: iw, widthEnd: iw * 0.6, color: '70,150,255', opacity: ov * 0.38, turbulent });

      // ── 3. External: mouth → outside air ────────────────────────────────────
      if (ov > 0.12) {
        const ew = 4 + ov * 9;
        drawRibbon(ctx, {
          p0:  g.mouthExit,
          cp1: { x: cx + W * 0.01, y: H * 0.68 },
          cp2: { x: cx + W * 0.03, y: H * 0.72 },
          p1:  g.outsideMouth,
        }, { width: ew, widthEnd: 0.5, color: '100,200,255', opacity: ov * 0.60, turbulent });

        // Particles on exit path
        if (Math.random() < ov * 0.55) {
          const pColor = turbulent ? '0,170,255' : '180,225,255';
          const pCount = burst ? 3 : 1;
          this._emitter.emit(
            { p0: g.mouthExit,
              cp1: { x: cx+W*0.01, y: H*0.68 },
              cp2: { x: cx+W*0.03, y: H*0.72 },
              p1:  g.outsideMouth },
            { velocity: ov, color: pColor, count: pCount, turbulent }
          );
        }
      }
    }

    // ── 4. Nasal split ────────────────────────────────────────────────────────
    if (split || nv > 0.04) {
      // Oral cavity → nasal cavity
      drawRibbon(ctx, {
        p0:  g.oralIn,
        cp1: { x: cx - W * 0.04, y: H * 0.50 },
        cp2: { x: cx - W * 0.03, y: H * 0.45 },
        p1:  g.nasalIn,
      }, { width: 4 + nv * 8, widthEnd: 2 + nv * 4, color: '130,205,255', opacity: nv * 0.50 });

      // Nasal cavity → nose exit
      drawRibbon(ctx, {
        p0:  g.nasalIn,
        cp1: { x: cx - W * 0.03, y: H * 0.37 },
        cp2: { x: cx - W * 0.04, y: H * 0.32 },
        p1:  g.noseExit,
      }, { width: 3 + nv * 5, widthEnd: 0.5, color: '155,215,255', opacity: nv * 0.45 });

      // Particles at nose exit
      if (Math.random() < nv * 0.35) {
        this._emitter.emit(
          { p0: g.nasalIn,
            cp1: { x: cx-W*0.03, y: H*0.37 },
            cp2: { x: cx-W*0.04, y: H*0.32 },
            p1:  g.noseExit },
          { velocity: nv * 0.8, color: '160,220,255', count: 1, turbulent: false }
        );
      }
    }

    // ── Particle step ─────────────────────────────────────────────────────────
    this._emitter.update();
    this._emitter.draw(ctx);
  }

  dispose() {
    this._emitter.clear();
  }
}