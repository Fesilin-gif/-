/**
 * Генератор художественных плашек для фотослотов PROJECT AMB.
 *
 * Внешние фотостоки недоступны из сборочного окружения, поэтому каждый слот
 * получает стилизованную сцену в палитре проекта: арка, драпировка, флористика,
 * сервировка, свет. Формы намеренно обобщены — это арт-плашка, а не имитация фото.
 *
 * Замена на настоящие фотографии: положите файл с тем же именем в public/media/
 * (webp/jpg — тогда обновите путь в lib/media.ts) и больше не запускайте скрипт.
 */
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'media');

function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

const PALETTES = {
  sand:     { wall: ['#EFE7D8', '#D8C9AC'], floor: '#C4B192', form: '#F7F1E4', shade: '#B39B77', deep: '#8C7754', light: '#FFFBF2', vig: '#3B3325' },
  blush:    { wall: ['#F6EDE7', '#E2CEC5'], floor: '#D2B8AE', form: '#FCF5F1', shade: '#C4A297', deep: '#9C7C71', light: '#FFFCFA', vig: '#41332C' },
  powder:   { wall: ['#EDF1F2', '#CFD8DC'], floor: '#BCC8CD', form: '#FAFCFC', shade: '#A8B7BD', deep: '#7E9098', light: '#FFFFFF', vig: '#2C3538' },
  graphite: { wall: ['#2C2B27', '#141412'], floor: '#1B1A17', form: '#3A3830', shade: '#4C4638', deep: '#0B0B0A', light: '#C3A98A', vig: '#000000' },
  clay:     { wall: ['#EBE2D2', '#C6AE8D'], floor: '#B49775', form: '#F6EFE0', shade: '#A98D68', deep: '#7E6849', light: '#FFF9EC', vig: '#33291C' },
};

/* ——— мотивы ——————————————————————————————————————————————— */

function arch(w, h, p, r) {
  const cx = w * (0.36 + r() * 0.28);
  const aw = w * (0.4 + r() * 0.18);
  const top = h * (0.1 + r() * 0.08);
  const base = h * 0.78;
  const x0 = cx - aw / 2;
  const rad = aw / 2;
  const d = `M ${x0} ${base} L ${x0} ${top + rad} A ${rad} ${rad} 0 0 1 ${x0 + aw} ${top + rad} L ${x0 + aw} ${base} Z`;

  const garland = [];
  for (let i = 0; i <= 46; i++) {
    const t = i / 46;
    const ang = Math.PI * (1 - t);
    const gx = cx + Math.cos(ang) * rad;
    const gy = top + rad - Math.sin(ang) * rad;
    const rr = (0.012 + r() * 0.028) * w;
    garland.push(`<circle cx="${gx.toFixed(1)}" cy="${gy.toFixed(1)}" r="${rr.toFixed(1)}" fill="${r() > 0.55 ? p.form : p.shade}" opacity="${(0.5 + r() * 0.4).toFixed(2)}"/>`);
  }
  /* стойки вдоль арки */
  for (let i = 0; i < 22; i++) {
    const side = r() > 0.5 ? x0 : x0 + aw;
    const gy = top + rad + r() * (base - top - rad);
    const rr = (0.01 + r() * 0.026) * w;
    garland.push(`<circle cx="${(side + (r() - 0.5) * w * 0.05).toFixed(1)}" cy="${gy.toFixed(1)}" r="${rr.toFixed(1)}" fill="${p.shade}" opacity="${(0.35 + r() * 0.4).toFixed(2)}"/>`);
  }

  return `<path d="${d}" fill="url(#formGrad)" opacity="0.94"/>
    <path d="${d}" fill="none" stroke="${p.deep}" stroke-opacity="0.16" stroke-width="${w * 0.004}"/>
    <g>${garland.join('')}</g>`;
}

function drape(w, h, p, r) {
  const bands = [];
  let x = -w * 0.06;
  while (x < w * 1.04) {
    const bw = w * (0.05 + r() * 0.09);
    const sway = w * (0.01 + r() * 0.035);
    const d = `M ${x} ${-h * 0.05}
      C ${x + sway} ${h * 0.3}, ${x - sway} ${h * 0.62}, ${x + sway * 0.6} ${h * 1.05}
      L ${x + bw + sway * 0.4} ${h * 1.05}
      C ${x + bw - sway} ${h * 0.6}, ${x + bw + sway} ${h * 0.28}, ${x + bw} ${-h * 0.05} Z`;
    bands.push(`<path d="${d}" fill="${r() > 0.5 ? p.form : p.shade}" opacity="${(0.28 + r() * 0.4).toFixed(2)}"/>`);
    x += bw * (0.72 + r() * 0.5);
  }
  return `<g>${bands.join('')}</g>`;
}

function floral(w, h, p, r) {
  const g = [];
  const clusters = 3 + Math.floor(r() * 2);
  for (let c = 0; c < clusters; c++) {
    const cx = w * (0.12 + r() * 0.76);
    const cy = h * (0.42 + r() * 0.42);
    const spread = Math.min(w, h) * (0.14 + r() * 0.2);
    /* стебли */
    for (let s = 0; s < 14; s++) {
      const ex = cx + (r() - 0.5) * spread * 1.6;
      const ey = cy + spread * (0.5 + r() * 0.9);
      g.push(`<path d="M ${cx.toFixed(1)} ${cy.toFixed(1)} Q ${((cx + ex) / 2).toFixed(1)} ${((cy + ey) / 2 + spread * 0.2).toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}" stroke="${p.deep}" stroke-opacity="0.2" stroke-width="${w * 0.0025}" fill="none"/>`);
    }
    for (let i = 0; i < 60; i++) {
      const a = r() * Math.PI * 2;
      const dist = Math.pow(r(), 0.55) * spread;
      const fx = cx + Math.cos(a) * dist * 1.25;
      const fy = cy + Math.sin(a) * dist;
      const rr = (0.008 + r() * 0.03) * Math.min(w, h);
      const tone = r();
      g.push(`<circle cx="${fx.toFixed(1)}" cy="${fy.toFixed(1)}" r="${rr.toFixed(1)}" fill="${tone > 0.66 ? p.light : tone > 0.33 ? p.form : p.shade}" opacity="${(0.45 + r() * 0.5).toFixed(2)}"/>`);
    }
  }
  return `<g>${g.join('')}</g>`;
}

function table(w, h, p, r) {
  const g = [];
  const ty = h * 0.62;
  g.push(`<rect x="${-w * 0.05}" y="${ty}" width="${w * 1.1}" height="${h * 0.5}" fill="${p.form}" opacity="0.9"/>`);
  g.push(`<rect x="${-w * 0.05}" y="${ty}" width="${w * 1.1}" height="${h * 0.012}" fill="${p.light}" opacity="0.7"/>`);
  /* свечи */
  for (let i = 0; i < 9; i++) {
    const cx = w * (0.06 + i * 0.11 + (r() - 0.5) * 0.03);
    const ch = h * (0.1 + r() * 0.14);
    g.push(`<rect x="${(cx - w * 0.006).toFixed(1)}" y="${(ty - ch).toFixed(1)}" width="${(w * 0.012).toFixed(1)}" height="${ch.toFixed(1)}" fill="${p.light}" opacity="0.82"/>`);
    g.push(`<circle cx="${cx.toFixed(1)}" cy="${(ty - ch - h * 0.018).toFixed(1)}" r="${(h * 0.016).toFixed(1)}" fill="${p.light}" opacity="0.9"/>`);
  }
  /* низкая флористика по центру стола */
  for (let i = 0; i < 90; i++) {
    const cx = w * (0.05 + r() * 0.9);
    const cy = ty - h * (r() * 0.05);
    const rr = (0.006 + r() * 0.022) * Math.min(w, h);
    g.push(`<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${rr.toFixed(1)}" fill="${r() > 0.5 ? p.shade : p.form}" opacity="${(0.4 + r() * 0.5).toFixed(2)}"/>`);
  }
  return `<g>${g.join('')}</g>`;
}

function stage(w, h, p, r) {
  const g = [];
  /* световые конусы */
  for (let i = 0; i < 5; i++) {
    const sx = w * (0.1 + i * 0.2 + (r() - 0.5) * 0.06);
    const spread = w * (0.07 + r() * 0.09);
    g.push(`<path d="M ${sx.toFixed(1)} ${-h * 0.02} L ${(sx + spread).toFixed(1)} ${(h * 0.95).toFixed(1)} L ${(sx - spread).toFixed(1)} ${(h * 0.95).toFixed(1)} Z" fill="url(#beam)" opacity="${(0.22 + r() * 0.26).toFixed(2)}"/>`);
  }
  /* горизонт сцены */
  g.push(`<rect x="0" y="${h * 0.7}" width="${w}" height="${h * 0.32}" fill="${p.deep}" opacity="0.72"/>`);
  /* портальные конструкции */
  for (let i = 0; i < 4; i++) {
    const x = w * (0.08 + i * 0.27 + (r() - 0.5) * 0.05);
    g.push(`<rect x="${x.toFixed(1)}" y="${(h * 0.14).toFixed(1)}" width="${(w * 0.008).toFixed(1)}" height="${(h * 0.58).toFixed(1)}" fill="${p.shade}" opacity="0.5"/>`);
  }
  /* подвесные кольца */
  for (let i = 0; i < 6; i++) {
    const cx = w * (0.14 + r() * 0.72);
    const cy = h * (0.16 + r() * 0.34);
    const rr = Math.min(w, h) * (0.05 + r() * 0.13);
    g.push(`<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${rr.toFixed(1)}" fill="none" stroke="${p.light}" stroke-opacity="${(0.16 + r() * 0.26).toFixed(2)}" stroke-width="${(w * 0.0022).toFixed(2)}"/>`);
  }
  return `<g>${g.join('')}</g>`;
}

function rings(w, h, p, r) {
  const g = [];
  for (let i = 0; i < 16; i++) {
    const cx = w * (0.08 + r() * 0.84);
    const cy = h * (0.06 + r() * 0.6);
    const rr = Math.min(w, h) * (0.04 + r() * 0.18);
    g.push(`<line x1="${cx.toFixed(1)}" y1="0" x2="${cx.toFixed(1)}" y2="${(cy - rr).toFixed(1)}" stroke="${p.deep}" stroke-opacity="0.14" stroke-width="${(w * 0.0016).toFixed(2)}"/>`);
    g.push(`<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${rr.toFixed(1)}" fill="none" stroke="${p.shade}" stroke-opacity="${(0.3 + r() * 0.45).toFixed(2)}" stroke-width="${(w * 0.003).toFixed(2)}"/>`);
    if (r() > 0.5) g.push(`<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${(rr * 0.62).toFixed(1)}" fill="none" stroke="${p.form}" stroke-opacity="0.4" stroke-width="${(w * 0.002).toFixed(2)}"/>`);
  }
  return `<g>${g.join('')}</g>`;
}

const MOTIFS = { arch, drape, floral, table, stage, rings };

/* ——— сборка сцены —————————————————————————————————————————— */

function scene({ w, h, palette, motif, seed, glow = 0.2, horizon = 0.78 }) {
  const p = PALETTES[palette];
  const r = rng(seed);
  const bgBlur = Math.round(Math.min(w, h) * 0.05);
  const fgBlur = Math.max(1, Math.round(Math.min(w, h) * 0.006));

  /* мягкие пятна фона — глубина за основным объёмом */
  const haze = [];
  for (let i = 0; i < 5; i++) {
    haze.push(`<ellipse cx="${(r() * w).toFixed(1)}" cy="${(r() * h).toFixed(1)}" rx="${(w * (0.2 + r() * 0.3)).toFixed(1)}" ry="${(h * (0.18 + r() * 0.3)).toFixed(1)}" fill="${r() > 0.5 ? p.form : p.shade}" opacity="${(0.2 + r() * 0.3).toFixed(2)}"/>`);
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="wall" x1="0.1" y1="0" x2="0.5" y2="1">
      <stop offset="0" stop-color="${p.wall[0]}"/><stop offset="1" stop-color="${p.wall[1]}"/>
    </linearGradient>
    <linearGradient id="formGrad" x1="0" y1="0" x2="0.6" y2="1">
      <stop offset="0" stop-color="${p.light}"/><stop offset="1" stop-color="${p.shade}"/>
    </linearGradient>
    <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${p.light}" stop-opacity="0.85"/><stop offset="1" stop-color="${p.light}" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="shaft" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${p.light}" stop-opacity="0"/>
      <stop offset="0.5" stop-color="${p.light}" stop-opacity="1"/>
      <stop offset="1" stop-color="${p.light}" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="floorGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${p.floor}" stop-opacity="0.9"/><stop offset="1" stop-color="${p.deep}" stop-opacity="0.55"/>
    </linearGradient>
    <radialGradient id="vig" cx="0.5" cy="0.42" r="0.8">
      <stop offset="0.42" stop-color="${p.vig}" stop-opacity="0"/>
      <stop offset="1" stop-color="${p.vig}" stop-opacity="0.36"/>
    </radialGradient>
    <filter id="bg" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="${bgBlur}"/></filter>
    <filter id="fg" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="${fgBlur}"/></filter>
  </defs>

  <rect width="${w}" height="${h}" fill="url(#wall)"/>
  <g filter="url(#bg)">${haze.join('')}</g>
  <g filter="url(#fg)"><rect x="0" y="${(h * horizon).toFixed(1)}" width="${w}" height="${(h * (1 - horizon) + 2).toFixed(1)}" fill="url(#floorGrad)"/></g>
  <g filter="url(#fg)">${MOTIFS[motif](w, h, p, r)}</g>
  <g filter="url(#bg)" transform="rotate(-16 ${w * 0.5} ${h * 0.5})">
    <rect x="${w * 0.14}" y="${-h * 0.3}" width="${w * 0.22}" height="${h * 1.6}" fill="url(#shaft)" opacity="${glow}"/>
  </g>
  <rect width="${w}" height="${h}" fill="url(#vig)"/>
</svg>`;
}

async function render(name, opts) {
  const base = await sharp(Buffer.from(scene(opts)), { density: 96 }).png().toBuffer();
  const grain = await sharp({
    create: { width: opts.w, height: opts.h, channels: 3, noise: { type: 'gaussian', mean: 128, sigma: 24 } },
  }).greyscale().png().toBuffer();
  const grainLayer = await sharp(grain).ensureAlpha(0.06).png().toBuffer();

  await sharp(base)
    .composite([{ input: grainLayer, blend: 'overlay' }])
    .webp({ quality: 84, effort: 5 })
    .toFile(path.join(OUT, `${name}.webp`));
  console.log('  ✓', `${name}.webp`, `${opts.w}×${opts.h}`, `— ${opts.motif}`);
}

const SLOTS = [
  ['hero',       { w: 1700, h: 2200, palette: 'sand',     motif: 'arch',   seed: 1041, glow: 0.24 }],
  ['weddings',   { w: 1600, h: 2000, palette: 'blush',    motif: 'floral', seed: 2213, glow: 0.18 }],
  ['kids',       { w: 2200, h: 1500, palette: 'powder',   motif: 'rings',  seed: 3390, glow: 0.26, horizon: 0.82 }],
  ['show',       { w: 2200, h: 1500, palette: 'graphite', motif: 'stage',  seed: 4471, glow: 0.32, horizon: 0.72 }],
  ['project-01', { w: 2400, h: 1360, palette: 'sand',     motif: 'table',  seed: 5512, glow: 0.2,  horizon: 0.86 }],
  ['project-02', { w: 1400, h: 1860, palette: 'blush',    motif: 'drape',  seed: 6673, glow: 0.22 }],
  ['project-03', { w: 2400, h: 1040, palette: 'graphite', motif: 'stage',  seed: 7734, glow: 0.3,  horizon: 0.76 }],
  ['project-04', { w: 1700, h: 1280, palette: 'clay',     motif: 'arch',   seed: 8895, glow: 0.2,  horizon: 0.8 }],
  ['project-05', { w: 1500, h: 1500, palette: 'powder',   motif: 'floral', seed: 9906, glow: 0.18 }],
  ['statement',  { w: 2400, h: 1600, palette: 'clay',     motif: 'drape',  seed: 1117, glow: 0.26 }],
  ['approach',   { w: 1600, h: 2000, palette: 'sand',     motif: 'rings',  seed: 1228, glow: 0.18 }],
  /* Портретные слоты: разные мотивы, иначе четыре карточки читаются
     как одна повторённая заливка. */
  ['team-01',    { w: 1200, h: 1500, palette: 'sand',     motif: 'drape',  seed: 1339, glow: 0.14 }],
  ['team-02',    { w: 1200, h: 1500, palette: 'blush',    motif: 'floral', seed: 1447, glow: 0.14 }],
  ['team-03',    { w: 1200, h: 1500, palette: 'powder',   motif: 'rings',  seed: 1553, glow: 0.14 }],
  ['team-04',    { w: 1200, h: 1500, palette: 'clay',     motif: 'arch',   seed: 1669, glow: 0.14, horizon: 0.84 }],
];

await mkdir(OUT, { recursive: true });
console.log('Генерация медиа →', OUT);
for (const [name, opts] of SLOTS) await render(name, opts);
console.log('Готово:', SLOTS.length, 'файлов');
