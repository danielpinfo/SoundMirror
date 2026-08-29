/**
 * AirflowParticleEmitter
 *
 * Spawns lightweight particles that travel along Bezier paths.
 * Particle count is intentionally capped (MAX_PARTICLES) to avoid GPU overhead.
 *
 * Usage:
 *   const emitter = new AirflowParticleEmitter();
 *   emitter.emit(bezierControlPoints, options);   // called each RAF tick
 *   emitter.update();                             // physics step
 *   emitter.draw(ctx);                            // render
 */

import { sampleAt, tangentAt } from './AirflowRibbon';

const MAX_PARTICLES = 36;

export class AirflowParticleEmitter {
  constructor() {
    this._p = [];
  }

  /**
   * Spawn `count` particles near the start of a cubic Bezier path.
   * @param {{ p0, cp1, cp2, p1 }} bezier
   * @param {{ velocity, color, count, turbulent }} opts
   */
  emit({ p0, cp1, cp2, p1 }, { velocity = 0.5, color = '180,220,255', count = 1, turbulent = false } = {}) {
    if (this._p.length >= MAX_PARTICLES) return;

    const toSpawn = Math.min(count, MAX_PARTICLES - this._p.length);

    for (let i = 0; i < toSpawn; i++) {
      const t   = Math.random() * 0.25;
      const pt  = sampleAt(p0, cp1, cp2, p1, t);
      const tan = tangentAt(p0, cp1, cp2, p1, t);
      const spd = 0.8 + velocity * 1.8;

      this._p.push({
        x:   pt.x,
        y:   pt.y,
        vx:  tan.x * spd + (turbulent ? (Math.random() - 0.5) * 0.6 : 0),
        vy:  tan.y * spd + (turbulent ? (Math.random() - 0.5) * 0.6 : 0),
        life:  1.0,
        decay: 0.014 + Math.random() * 0.016,
        size:  1.0 + velocity * 1.2,
        color,
        turbulent,
      });
    }
  }

  /** Physics step — call once per RAF tick before draw(). */
  update() {
    this._p = this._p.filter(p => {
      p.x    += p.vx;
      p.y    += p.vy;
      p.life -= p.decay;
      if (p.turbulent) {
        p.vx += (Math.random() - 0.5) * 0.12;
        p.vy += (Math.random() - 0.5) * 0.12;
      }
      return p.life > 0;
    });
  }

  /** Render all living particles. */
  draw(ctx) {
    ctx.save();
    for (const p of this._p) {
      ctx.globalAlpha = p.life * 0.75;
      ctx.fillStyle   = `rgb(${p.color})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  clear() { this._p = []; }

  get count() { return this._p.length; }
}