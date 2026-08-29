/**
 * AirflowRibbon
 *
 * Draws a cubic Bezier ribbon on a 2D canvas context.
 * The ribbon tapers from `width` at the start to `widthEnd` at the end.
 * Opacity fades toward the tip. Turbulent mode adds per-segment jitter.
 */

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ p0, cp1, cp2, p1 }} bezier  — cubic control points {x,y}
 * @param {object} opts
 *   width      {number}   base half-width at origin
 *   widthEnd   {number}   half-width at terminus
 *   color      {string}   RGB triple  e.g. '100,180,255'
 *   opacity    {number}   0-1 master alpha
 *   turbulent  {boolean}  add lateral jitter
 *   segments   {number}   tessellation granularity
 */
export function drawRibbon(ctx, { p0, cp1, cp2, p1 }, {
  width     = 8,
  widthEnd  = 2,
  color     = '100,180,255',
  opacity   = 0.5,
  turbulent = false,
  segments  = 22,
} = {}) {
  if (opacity <= 0.01) return;

  const pts = _sampleCubic(p0, cp1, cp2, p1, segments);
  ctx.save();

  for (let i = 0; i < pts.length - 1; i++) {
    const t     = i / (pts.length - 2);
    const w     = (width + (widthEnd - width) * t) * 0.5;
    const alpha = opacity * (1 - t * 0.55);

    const a  = pts[i];
    const b  = pts[i + 1];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx  = -dy / len;
    const ny  =  dx / len;
    const j   = turbulent ? (Math.random() - 0.5) * 2 : 0;

    ctx.beginPath();
    ctx.moveTo(a.x + nx * w + j, a.y + ny * w);
    ctx.lineTo(b.x + nx * w + j, b.y + ny * w);
    ctx.lineTo(b.x - nx * w + j, b.y - ny * w);
    ctx.lineTo(a.x - nx * w + j, a.y - ny * w);
    ctx.closePath();
    ctx.fillStyle = `rgba(${color},${Math.max(0, Math.min(1, alpha)).toFixed(3)})`;
    ctx.fill();
  }

  ctx.restore();
}

// ── Bezier helpers ────────────────────────────────────────────────────────────

function _sampleCubic(p0, cp1, cp2, p1, n) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t  = i / n;
    const mt = 1 - t;
    pts.push({
      x: mt*mt*mt*p0.x + 3*mt*mt*t*cp1.x + 3*mt*t*t*cp2.x + t*t*t*p1.x,
      y: mt*mt*mt*p0.y + 3*mt*mt*t*cp1.y + 3*mt*t*t*cp2.y + t*t*t*p1.y,
    });
  }
  return pts;
}

/** Sample a single point on a cubic Bezier at parameter t */
export function sampleAt(p0, cp1, cp2, p1, t) {
  const mt = 1 - t;
  return {
    x: mt*mt*mt*p0.x + 3*mt*mt*t*cp1.x + 3*mt*t*t*cp2.x + t*t*t*p1.x,
    y: mt*mt*mt*p0.y + 3*mt*mt*t*cp1.y + 3*mt*t*t*cp2.y + t*t*t*p1.y,
  };
}

/** Unit tangent vector at parameter t */
export function tangentAt(p0, cp1, cp2, p1, t) {
  const mt = 1 - t;
  const tx = 3*mt*mt*(cp1.x-p0.x) + 6*mt*t*(cp2.x-cp1.x) + 3*t*t*(p1.x-cp2.x);
  const ty = 3*mt*mt*(cp1.y-p0.y) + 6*mt*t*(cp2.y-cp1.y) + 3*t*t*(p1.y-cp2.y);
  const len = Math.hypot(tx, ty) || 1;
  return { x: tx/len, y: ty/len };
}