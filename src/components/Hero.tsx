import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { fetchSliderStudioProject } from '../api';
import type { Layer, SliderProject, Slide } from '../types';
import ParticleCanvas from './ParticleCanvas';

interface HeroProps {
  onNavigate: (section: string) => void;
}

// ── Shape Rendering Helpers ────────────────────────────────────────

/** Legacy CSS clip-path for each shape preset (kept for reference — all
 *  shapes now render through the inline-SVG templates below). */
const SHAPE_CLIP_PATHS: Record<string, string> = {
  rectangle: 'inset(0% 0% 0% 0%)',
  circle: 'circle(50% at 50% 50%)',
  ellipse: 'ellipse(50% 35% at 50% 50%)',
  triangle: 'polygon(50% 0%, 0% 100%, 100% 100%)',
  diamond: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
  pentagon: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
  hexagon: 'polygon(25% 5%, 75% 5%, 100% 50%, 75% 95%, 25% 95%, 0% 50%)',
  octagon: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
  star: 'polygon(50% 0%, 63% 38%, 100% 38%, 69% 61%, 81% 100%, 50% 75%, 19% 100%, 31% 61%, 0% 38%, 37% 38%)',
  heart: 'polygon(50% 30%, 61% 12%, 75% 8%, 92% 14%, 100% 30%, 97% 48%, 87% 63%, 50% 100%, 13% 63%, 3% 48%, 0% 30%, 8% 14%, 25% 8%, 39% 12%)',
  parallelogram: 'polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%)',
  trapezoid: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)',
  cross: 'polygon(20% 0%, 80% 0%, 80% 20%, 100% 20%, 100% 80%, 80% 80%, 80% 100%, 20% 100%, 20% 80%, 0% 80%, 0% 20%, 20% 20%)',
  arrowRight: 'polygon(0% 20%, 60% 20%, 60% 0%, 100% 50%, 60% 100%, 60% 80%, 0% 80%)',
  arrowLeft: 'polygon(40% 0%, 40% 20%, 100% 20%, 100% 80%, 40% 80%, 40% 100%, 0% 50%)',
  arrowUp: 'polygon(20% 40%, 0% 40%, 50% 0%, 100% 40%, 80% 40%, 80% 100%, 20% 100%)',
  arrowDown: 'polygon(20% 0%, 80% 0%, 80% 60%, 100% 60%, 50% 100%, 0% 60%, 20% 60%)',
  semicircle: 'circle(50% at 50% 0%)',
  quarterCircle: 'circle(50% at 100% 100%)',
  burst: 'polygon(50% 0%, 59.3% 21.5%, 79.4% 9.5%, 74.3% 32.4%, 97.6% 34.5%, 80% 50%, 97.6% 65.5%, 74.3% 67.6%, 79.4% 90.5%, 59.3% 78.5%, 50% 100%, 40.7% 78.5%, 20.6% 90.5%, 25.7% 67.6%, 2.4% 65.5%, 20% 50%, 2.4% 34.5%, 25.7% 32.4%, 20.6% 9.5%, 40.7% 21.5%)',
  blob: 'polygon(30% 0%, 70% 0%, 100% 20%, 100% 70%, 80% 100%, 20% 100%, 0% 70%, 0% 20%)',
  chevronRight: 'polygon(75% 0%, 100% 50%, 75% 100%, 0% 100%, 25% 50%, 0% 0%)',
  chevronLeft: 'polygon(25% 0%, 100% 0%, 75% 50%, 100% 100%, 25% 100%, 0% 50%)',
  chevronUp: 'polygon(0% 75%, 50% 0%, 100% 75%, 75% 75%, 50% 25%, 25% 75%)',
  chevronDown: 'polygon(0% 25%, 25% 25%, 50% 75%, 75% 25%, 100% 25%, 50% 100%)',
  cloud: 'polygon(22% 78%, 8% 78%, 4% 64%, 12% 56%, 8% 42%, 20% 30%, 34% 28%, 42% 16%, 58% 16%, 66% 28%, 80% 26%, 94% 36%, 100% 52%, 94% 62%, 100% 70%, 88% 78%)',
  lightningBolt: 'polygon(52% 0%, 8% 58%, 40% 58%, 30% 100%, 92% 38%, 58% 38%)',
  plus: 'polygon(38% 0%, 62% 0%, 62% 38%, 100% 38%, 100% 62%, 62% 62%, 62% 100%, 38% 100%, 38% 62%, 0% 62%, 0% 38%, 38% 38%)',
  minus: 'polygon(0% 42%, 100% 42%, 100% 58%, 0% 58%)',
  horizontalLine: 'inset(45% 0% 45% 0%)',
  verticalLine: 'inset(0% 45% 0% 45%)',
  multiply: 'polygon(39% 0%, 61% 0%, 100% 39%, 100% 61%, 61% 100%, 39% 100%, 0% 61%, 0% 39%)',
  speechBubble: 'polygon(6% 0%, 94% 0%, 100% 6%, 100% 70%, 52% 70%, 42% 88%, 36% 70%, 0% 70%, 0% 6%)',
  thoughtBubble: 'circle(50% 45% at 56% 40%)',
  smiley: 'circle(46% at 50% 50%)',
  notAllowed: 'circle(46% at 50% 50%)',
  divide: 'circle(11% at 50% 26%)',
  equals: 'inset(30% 0% 30% 0%)',
};

/** SVG stroke attribute — vector-effect keeps the border uniform (screen
 *  pixels) on every side, even when the viewBox is stretched non-uniformly. */
const SHAPE_STROKE = (color: string, width: number) =>
  width > 0 ? ` vector-effect="non-scaling-stroke" stroke="${color}" stroke-width="${width}"` : '';

/** Shapes that must keep their natural proportions — rendered with
 *  preserveAspectRatio="xMidYMid meet" (centered, letterboxed) so they
 *  never distort on non-square layers. Everything else stretches. */
const SHAPE_SYMMETRIC = new Set<string>([
  'circle', 'ellipse', 'triangle', 'diamond', 'pentagon',
  'hexagon', 'octagon', 'star', 'heart', 'semicircle',
  'quarterCircle', 'burst', 'blob', 'smiley', 'notAllowed',
  'thoughtBubble', 'divide', 'equals', 'minus', 'horizontalLine',
  'verticalLine', 'plus', 'cross', 'multiply',
]);

/** preserveAspectRatio value for a shape (mirrors editor constants). */
function getShapePreserveAspect(shape: string): string {
  return SHAPE_SYMMETRIC.has(shape) ? 'xMidYMid meet' : 'none';
}

/** Inline-SVG template for EVERY shape (mirrors the editor's
 *  constants/shapes.ts). Shared 0..100 coordinate system; direct port of
 *  the legacy clip-path percentages so shapes stay undistorted at any size. */
const SHAPE_SVG_TEMPLATES: Record<string, (fill: string, stroke: string, strokeWidth: number) => string> = {
  rectangle: (f, s, sw) => `<rect x="0" y="0" width="100" height="100" fill="${f}"${SHAPE_STROKE(s, sw)}/>`,
  circle: (f, s, sw) => `<circle cx="50" cy="50" r="50" fill="${f}"${SHAPE_STROKE(s, sw)}/>`,
  ellipse: (f, s, sw) => `<ellipse cx="50" cy="50" rx="50" ry="35" fill="${f}"${SHAPE_STROKE(s, sw)}/>`,
  triangle: (f, s, sw) => `<polygon points="50,0 100,100 0,100" fill="${f}"${SHAPE_STROKE(s, sw)}/>`,
  diamond: (f, s, sw) => `<polygon points="50,0 100,50 50,100 0,50" fill="${f}"${SHAPE_STROKE(s, sw)}/>`,
  pentagon: (f, s, sw) => `<polygon points="50,0 100,38 82,100 18,100 0,38" fill="${f}"${SHAPE_STROKE(s, sw)}/>`,
  hexagon: (f, s, sw) => `<polygon points="25,5 75,5 100,50 75,95 25,95 0,50" fill="${f}"${SHAPE_STROKE(s, sw)}/>`,
  octagon: (f, s, sw) => `<polygon points="30,0 70,0 100,30 100,70 70,100 30,100 0,70 0,30" fill="${f}"${SHAPE_STROKE(s, sw)}/>`,
  star: (f, s, sw) => `<polygon points="50,0 63,38 100,38 69,61 81,100 50,75 19,100 31,61 0,38 37,38" fill="${f}"${SHAPE_STROKE(s, sw)}/>`,
  heart: (f, s, sw) => `<path d="M50 90 C20 64 0 48 0 26 C0 10 12 0 26 0 C37 0 47 8 50 18 C53 8 63 0 74 0 C88 0 100 10 100 26 C100 48 80 64 50 90 Z" fill="${f}"${SHAPE_STROKE(s, sw)}/>`,
  parallelogram: (f, s, sw) => `<polygon points="25,0 100,0 75,100 0,100" fill="${f}"${SHAPE_STROKE(s, sw)}/>`,
  trapezoid: (f, s, sw) => `<polygon points="20,0 80,0 100,100 0,100" fill="${f}"${SHAPE_STROKE(s, sw)}/>`,
  cross: (f, s, sw) => `<path fill-rule="evenodd" d="M20 0 L80 0 L80 20 L100 20 L100 80 L80 80 L80 100 L20 100 L20 80 L0 80 L0 20 L20 20 Z" fill="${f}"${SHAPE_STROKE(s, sw)}/>`,
  arrowRight: (f, s, sw) => `<polygon points="0,20 60,20 60,0 100,50 60,100 60,80 0,80" fill="${f}"${SHAPE_STROKE(s, sw)}/>`,
  arrowLeft: (f, s, sw) => `<polygon points="40,0 40,20 100,20 100,80 40,80 40,100 0,50" fill="${f}"${SHAPE_STROKE(s, sw)}/>`,
  arrowUp: (f, s, sw) => `<polygon points="20,40 0,40 50,0 100,40 80,40 80,100 20,100" fill="${f}"${SHAPE_STROKE(s, sw)}/>`,
  arrowDown: (f, s, sw) => `<polygon points="20,0 80,0 80,60 100,60 50,100 0,60 20,60" fill="${f}"${SHAPE_STROKE(s, sw)}/>`,
  semicircle: (f, s, sw) => `<path d="M0 50 A50 50 0 0 1 100 50 Z" fill="${f}"${SHAPE_STROKE(s, sw)}/>`,
  quarterCircle: (f, s, sw) => `<path d="M100 100 L0 100 A100 100 0 0 1 100 0 Z" fill="${f}"${SHAPE_STROKE(s, sw)}/>`,
  burst: (f, s, sw) => `<polygon points="50,0 59.3,21.5 79.4,9.5 74.3,32.4 97.6,34.5 80,50 97.6,65.5 74.3,67.6 79.4,90.5 59.3,78.5 50,100 40.7,78.5 20.6,90.5 25.7,67.6 2.4,65.5 20,50 2.4,34.5 25.7,32.4 20.6,9.5 40.7,21.5" fill="${f}"${SHAPE_STROKE(s, sw)}/>`,
  blob: (f, s, sw) => `<polygon points="30,0 70,0 100,20 100,70 80,100 20,100 0,70 0,20" fill="${f}"${SHAPE_STROKE(s, sw)}/>`,
  chevronRight: (f, s, sw) => `<polygon points="75,0 100,50 75,100 0,100 25,50 0,0" fill="${f}"${SHAPE_STROKE(s, sw)}/>`,
  chevronLeft: (f, s, sw) => `<polygon points="25,0 100,0 75,50 100,100 25,100 0,50" fill="${f}"${SHAPE_STROKE(s, sw)}/>`,
  chevronUp: (f, s, sw) => `<polygon points="0,75 50,0 100,75 75,75 50,25 25,75" fill="${f}"${SHAPE_STROKE(s, sw)}/>`,
  chevronDown: (f, s, sw) => `<polygon points="0,25 25,25 50,75 75,25 100,25 50,100" fill="${f}"${SHAPE_STROKE(s, sw)}/>`,
  cloud: (f, s, sw) => {
    const o = SHAPE_STROKE(s, sw);
    return `<path d="
      M 15 78 
      C 5 78, 0 70, 4 60 
      C 6 54, 12 50, 18 50 
      C 14 42, 20 30, 32 28 
      C 40 26, 48 30, 52 36 
      C 56 26, 68 20, 78 26 
      C 88 32, 94 44, 90 54 
      C 96 56, 100 62, 96 70 
      C 92 78, 84 82, 76 82 
      L 24 82 
      C 18 82, 14 80, 15 78 Z" 
      fill="${f}"${o}
    />`;
  },
  lightningBolt: (f, s, sw) => `<polygon points="52,0 8,58 40,58 30,100 92,38 58,38" fill="${f}"${SHAPE_STROKE(s, sw)}/>`,
  plus: (f, s, sw) => `<path fill-rule="evenodd" d="M38 0 L62 0 L62 38 L100 38 L100 62 L62 62 L62 100 L38 100 L38 62 L0 62 L0 38 L38 38 Z" fill="${f}"${SHAPE_STROKE(s, sw)}/>`,
  minus: (f, s, sw) => `<rect x="0" y="42" width="100" height="16" fill="${f}"${SHAPE_STROKE(s, sw)}/>`,
  horizontalLine: (f, s, sw) => `<rect x="0" y="45" width="100" height="10" rx="5" fill="${f}"${SHAPE_STROKE(s, sw)}/>`,
  verticalLine: (f, s, sw) => `<rect x="45" y="0" width="10" height="100" rx="5" fill="${f}"${SHAPE_STROKE(s, sw)}/>`,
  multiply: (f, s, sw) => {
    const o = SHAPE_STROKE(s, sw);
    return (
      `<rect x="38" y="0" width="24" height="100" transform="rotate(45 50 50)" fill="${f}"${o}/>` +
      `<rect x="38" y="0" width="24" height="100" transform="rotate(-45 50 50)" fill="${f}"${o}/>`
    );
  },
  speechBubble: (f, s, sw) => `<path d="M10 4 L90 4 A6 6 0 0 1 96 10 L96 56 A6 6 0 0 1 90 62 L58 62 L38 84 L44 62 L10 62 A6 6 0 0 1 4 56 L4 10 A6 6 0 0 1 10 4 Z" fill="${f}"${SHAPE_STROKE(s, sw)}/>`,
  thoughtBubble: (f, s, sw) => {
    const o = SHAPE_STROKE(s, sw);
    return (
      `<path d="M50 8 C60 4 76 6 82 18 C92 17 98 28 94 38 C100 44 98 56 90 58 C90 66 80 72 68 70 C60 76 40 76 32 70 C22 72 12 66 12 58 C4 56 2 46 6 40 C4 30 10 20 20 20 C24 8 40 6 50 8 Z" fill="${f}"${o}/>` +
      `<circle cx="14" cy="78" r="4.5" fill="${f}"/>` +
      `<circle cx="26" cy="84" r="7" fill="${f}"/>` +
      `<circle cx="40" cy="86" r="9.5" fill="${f}"/>`
    );
  },
  smiley: (f, s, sw) => {
    const d = s !== 'transparent' ? s : '#1e293b';
    return (
      `<circle cx="50" cy="50" r="46" fill="${f}"${SHAPE_STROKE(s, sw)}/>` +
      `<circle cx="30" cy="38" r="6.5" fill="${d}"/>` +
      `<circle cx="70" cy="38" r="6.5" fill="${d}"/>` +
      `<path d="M26 62 Q50 84 74 62" fill="none" stroke="${d}" stroke-width="7" stroke-linecap="round"/>`
    );
  },
  notAllowed: (f, s, sw) => {
    // رنگ همانند سایر اشکال از fill لایه می‌آید (دایره توخالی — رنگ از پس‌زمینه لایه)
    const color = f && f !== 'transparent' && f !== 'undefined' ? f : '#ef4444';
    const thickness = sw > 0 ? sw : 10;

    return `
      <!-- دایره توخالی با حاشیه ضخیم -->
      <circle cx="50" cy="50" r="44" fill="none" stroke="${color}" stroke-width="${thickness}"/>
      <!-- خط مورب متصل به حاشیه دایره -->
      <line x1="18.9" y1="18.9" x2="81.1" y2="81.1" stroke="${color}" stroke-width="${thickness}" stroke-linecap="round"/>
    `;
  },
  divide: (f, s, sw) => {
    const o = SHAPE_STROKE(s, sw);
    return (
      `<circle cx="50" cy="24" r="11" fill="${f}"${o}/>` +
      `<rect x="14" y="42" width="72" height="16" rx="8" fill="${f}"${o}/>` +
      `<circle cx="50" cy="76" r="11" fill="${f}"${o}/>`
    );
  },
  equals: (f, s, sw) => {
    const o = SHAPE_STROKE(s, sw);
    return (
      `<rect x="14" y="28" width="72" height="14" rx="7" fill="${f}"${o}/>` +
      `<rect x="14" y="58" width="72" height="14" rx="7" fill="${f}"${o}/>`
    );
  },
};

/** Flat fill for SVG shapes: solid color, else first gradient stop. */
function shapeFlatFill(layer: Layer): string {
  if (layer.backgroundColor) return layer.backgroundColor;
  if (layer.backgroundGradient) {
    const m = layer.backgroundGradient.match(/#[0-9a-fA-F]{3,8}/g);
    if (m && m.length) return m[0];
  }
  return '#38bdf8';
}

/** Render a geometric shape from its inline-SVG template (all shapes).
 *  The template uses a shared 0..100 viewBox; the outline is a real SVG
 *  stroke kept uniform via vector-effect="non-scaling-stroke". */
function renderShapeContent(layer: Layer, scaleFactor: number) {
  const shape = layer.shape || 'circle';
  const bw = Math.max(0, (layer.borderWidth ?? 0) * scaleFactor);
  const borderColor =
    layer.borderColor && layer.borderColor !== 'transparent' ? layer.borderColor : null;
  const template = SHAPE_SVG_TEMPLATES[shape] ?? SHAPE_SVG_TEMPLATES.circle;

  return (
    <div className="w-full h-full" style={{ position: 'relative', pointerEvents: 'none' }}>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio={getShapePreserveAspect(shape)}
        className="w-full h-full absolute inset-0"
        style={{ opacity: (layer.backgroundOpacity ?? 100) / 100 }}
        dangerouslySetInnerHTML={{
          __html: template(
            shapeFlatFill(layer),
            borderColor ?? 'transparent',
            bw
          ),
        }}
      />
    </div>
  );
}

// ── Text Animation Helpers ─────────────────────────────────────────

/** Detect Persian/Arabic script characters */
const HAS_PERSIAN = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

/**
 * Split text into animatable units.
 * For Persian/Arabic: split by word (preserves joining forms).
 * For Latin: split by individual character.
 */
function splitTextUnits(text: string): string[] {
  if (HAS_PERSIAN.test(text)) {
    const parts = text.split(/(\s+)/).filter(Boolean);
    // Merge consecutive whitespace with their preceding word
    const merged: string[] = [];
    for (let i = 0; i < parts.length; i++) {
      if (/^\s+$/.test(parts[i]) && merged.length > 0) {
        merged[merged.length - 1] += parts[i];
      } else {
        merged.push(parts[i]);
      }
    }
    return merged;
  }
  return [...text];
}

// ── Text Animation Components ──────────────────────────────────────

function TypewriterText({ text, duration, delay }: { text: string; duration: number; delay: number }) {
  const [visibleCount, setVisibleCount] = useState(0);
  const totalChars = text.length;

  useEffect(() => {
    if (!text) return;
    setVisibleCount(0);
    const startTimer = setTimeout(() => {
      if (totalChars === 0) return;
      const charTime = Math.max((duration * 1000) / totalChars, 20);
      const interval = setInterval(() => {
        setVisibleCount(prev => {
          if (prev >= totalChars) { clearInterval(interval); return prev; }
          return prev + 1;
        });
      }, charTime);
      return () => clearInterval(interval);
    }, delay * 1000);
    return () => { clearTimeout(startTimer); };
  }, [text, duration, delay, totalChars]);

  return (
    <span dir="auto">
      <span>{text.slice(0, visibleCount)}</span>
      {visibleCount < totalChars && (
        <span className="inline-block w-[2px] h-[1em] bg-current animate-pulse mr-0.5 align-middle" />
      )}
    </span>
  );
}

function SplitWordText({ text, duration, delay }: { text: string; duration: number; delay: number }) {
  const words = text.split(' ');
  const stagger = words.length > 1 ? duration / words.length : duration;
  return (
    <span className="inline-flex flex-wrap" style={{ gap: '0.25em' }} dir="auto">
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: Math.min(stagger, 0.5), delay: delay + i * stagger, ease: 'easeOut' }}
          className="inline-block"
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

function SplitCharText({ text, duration, delay }: { text: string; duration: number; delay: number }) {
  const units = splitTextUnits(text);
  const stagger = units.length > 1 ? duration / units.length : duration;
  return (
    <span dir="auto">
      {units.map((unit, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 30, rotateX: -90 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: Math.min(stagger, 0.4), delay: delay + i * stagger, ease: 'easeOut' }}
          className="inline-block"
          style={{ whiteSpace: 'pre' as const }}
        >
          {unit}
        </motion.span>
      ))}
    </span>
  );
}

function RevealText({ text, duration, delay }: { text: string; duration: number; delay: number }) {
  return (
    <div className="overflow-hidden" style={{ display: 'inline-block' }}>
      <motion.div
        initial={{ clipPath: 'inset(0 100% 0 0)' }}
        animate={{ clipPath: 'inset(0 0% 0 0)' }}
        transition={{ duration, delay, ease: 'easeOut' }}
      >
        {text}
      </motion.div>
    </div>
  );
}

function WaveText({ text, duration, delay }: { text: string; duration: number; delay: number }) {
  const units = splitTextUnits(text);
  const stagger = units.length > 1 ? (duration * 0.6) / units.length : duration;
  return (
    <span dir="auto">
      {units.map((unit, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: [40, -15, 0] }}
          transition={{ duration: 0.6, delay: delay + i * stagger, ease: 'easeOut', times: [0, 0.6, 1] }}
          className="inline-block"
          style={{ whiteSpace: 'pre' as const }}
        >
          {unit}
        </motion.span>
      ))}
    </span>
  );
}

function FlickerText({ text, duration, delay }: { text: string; duration: number; delay: number }) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 0.2, 1, 0.3, 1] }}
      transition={{ duration: duration || 1.5, delay, ease: 'linear', times: [0, 0.15, 0.3, 0.5, 0.7, 1] }}
    >
      {text}
    </motion.span>
  );
}

const TEXT_ANIM_PRESETS = new Set(['typewriter', 'splitWord', 'splitChar', 'reveal', 'wave', 'flicker']);

function isTextAnimationPreset(preset: string): boolean {
  return TEXT_ANIM_PRESETS.has(preset);
}

/**
 * Scale every `Npx` value in a CSS shorthand (e.g. "8px 20px") by a factor so
 * layer padding stays proportional when the project is width-scaled.
 */
function scalePxValues(cssValue: string, factor: number): string {
  return cssValue.replace(/([\d.]+)px/g, (_, n: string) => `${(parseFloat(n) * factor).toFixed(1)}px`);
}

function TextAnimContent({ text, preset, duration, delay }: { text: string; preset: string; duration: number; delay: number }) {
  switch (preset) {
    case 'typewriter': return <TypewriterText text={text} duration={duration} delay={delay} />;
    case 'splitWord':  return <SplitWordText  text={text} duration={duration} delay={delay} />;
    case 'splitChar':  return <SplitCharText  text={text} duration={duration} delay={delay} />;
    case 'reveal':     return <RevealText     text={text} duration={duration} delay={delay} />;
    case 'wave':       return <WaveText       text={text} duration={duration} delay={delay} />;
    case 'flicker':    return <FlickerText    text={text} duration={duration} delay={delay} />;
    default:           return <>{text}</>;
  }
}

export default function Hero({ onNavigate }: HeroProps) {
  const [project, setProject] = useState<SliderProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [keyCounter, setKeyCounter] = useState(0);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const touchStartXRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSlides() {
      try {
        const ssRes = await fetchSliderStudioProject<{ data: SliderProject }>();
        if (cancelled) return;

        if (ssRes?.data?.slides && ssRes.data.slides.length > 0) {
          setProject(ssRes.data);
          setLoading(false);
          return;
        }

        setLoading(false);
      } catch (err: any) {
        if (cancelled) return;
        setError(err.message || 'خطا در دریافت اسلایدها');
        setLoading(false);
      }
    }

    loadSlides();
    return () => { cancelled = true; };
  }, []);

  const slides = project?.slides || [];
  const activeSlide: Slide | undefined = slides[currentSlide];

  // Auto advance slides based on slide duration
  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    const slideDuration = (activeSlide?.duration || 6) * 1000;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
      setKeyCounter((prev) => prev + 1);
    }, slideDuration);
    return () => clearInterval(timer);
  }, [isPaused, slides.length, activeSlide?.duration]);

  // Keyboard navigation
  useEffect(() => {
    if (slides.length === 0) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
        setKeyCounter((prev) => prev + 1);
      } else if (e.key === 'ArrowRight') {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
        setKeyCounter((prev) => prev + 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slides.length]);

  const handleNext = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setKeyCounter((prev) => prev + 1);
  }, [slides.length]);

  const handlePrev = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setKeyCounter((prev) => prev + 1);
  }, [slides.length]);

  // Touch Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchEndX - touchStartXRef.current;
    if (deltaX > 50) handlePrev();
    else if (deltaX < -50) handleNext();
    touchStartXRef.current = null;
  };

  // Scale factor: fit project width into viewport.
  // offsetY keeps slide content clear of the fixed header and vertically
  // centers the (width-scaled) canvas in the visible area below it.
  const [layout, setLayout] = useState({ scaleFactor: 1, offsetY: 0 });
  useEffect(() => {
    const updateScale = () => {
      const el = containerRef.current;
      if (!el) return;
      const vw = el.clientWidth;
      const vh = el.clientHeight;
      const pWidth = project?.width || 1240;
      const pHeight = project?.height || 720;
      const scale = vw / pWidth;
      const canvasH = pHeight * scale;
      const headerEl = document.querySelector('header');
      const headerH = headerEl ? headerEl.getBoundingClientRect().height : 0;
      const availH = vh - headerH;

      // Topmost non-full-bleed layer — content that must stay clear of the fixed header.
      const slideLayers = project?.slides?.flatMap((s) => s.layers) || [];
      const contentTopY = Math.min(
        ...slideLayers
          .filter(
            (l) =>
              l.visible &&
              !(
                l.x === 0 &&
                l.y === 0 &&
                Math.abs(l.width - pWidth) < 1 &&
                Math.abs(l.height - pHeight) < 1
              )
          )
          .map((l) => l.y)
      );
      const contentTopScreen = Number.isFinite(contentTopY) ? contentTopY * scale : 0;

      let offsetY: number;
      if (canvasH < availH) {
        // Canvas fits below the header → center it in the visible area.
        offsetY = headerH + (availH - canvasH) / 2;
      } else if (contentTopScreen < headerH) {
        // Canvas is taller than the visible area AND its top content would hide
        // under the fixed header → pin the canvas right below the header.
        offsetY = headerH;
      } else {
        // Top content already clears the header (wide desktop) → keep the
        // original top-pinned layout for the exact designed look.
        offsetY = 0;
      }
      setLayout({ scaleFactor: scale, offsetY });
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [project?.width, project?.height]);

  const { scaleFactor, offsetY } = layout;

  // Loading state
  if (loading) {
    return (
      <section id="hero" className="relative w-full h-screen min-h-[650px] flex items-center justify-center bg-[#0d1b2a] text-white pt-28 pb-12">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm font-bold text-gray-400">در حال بارگذاری...</p>
        </div>
      </section>
    );
  }

  // Error / Empty state
  if (error || slides.length === 0 || !activeSlide) {
    return (
      <section id="hero" className="relative w-full h-screen min-h-[650px] flex items-center justify-center bg-[#0d1b2a] text-white pt-28 pb-12">
        <div className="text-center px-4">
          <i className="fa-solid fa-image text-4xl text-gray-600 mb-4"></i>
          <p className="text-sm font-bold text-gray-400">
            {error ? 'خطا در بارگذاری اسلایدها' : 'اسلایدی برای نمایش وجود ندارد'}
          </p>
        </div>
      </section>
    );
  }

  const projectHeight = project?.height || 900;

  return (
    <section
      id="hero"
      ref={containerRef}
      className="relative w-full h-screen min-h-[650px] flex items-center justify-center overflow-hidden text-white select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* AnimatePresence for slide transitions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${activeSlide.id}-${keyCounter}`}
          {...(() => {
            const t = activeSlide.transition || 'fade';
            const variants: Record<string, any> = {
              fade:        { initial: { opacity: 0 },                          animate: { opacity: 1 },                     exit: { opacity: 0 } },
              slideLeft:   { initial: { opacity: 0, x: 200 },                  animate: { opacity: 1, x: 0 },               exit: { opacity: 0, x: -200 } },
              slideRight:  { initial: { opacity: 0, x: -200 },                 animate: { opacity: 1, x: 0 },               exit: { opacity: 0, x: 200 } },
              zoomOut:     { initial: { opacity: 0, scale: 1.2 },              animate: { opacity: 1, scale: 1 },           exit: { opacity: 0, scale: 0.8 } },
              '3dCube':    { initial: { opacity: 0, rotateY: -45, scale: 0.9 }, animate: { opacity: 1, rotateY: 0, scale: 1 }, exit: { opacity: 0, rotateY: 45, scale: 0.9 } },
              blinds:      { initial: { opacity: 0, clipPath: 'inset(100% 0% 0% 0%)' }, animate: { opacity: 1, clipPath: 'inset(0% 0% 0% 0%)' }, exit: { opacity: 0, clipPath: 'inset(0% 0% 100% 0%)' } },
              clipWipe:    { initial: { clipPath: 'inset(0 0 0 100%)' },       animate: { clipPath: 'inset(0 0 0 0%)' },     exit: { clipPath: 'inset(0 0 100% 0)' } },
              doors:       { initial: { opacity: 0, clipPath: 'inset(0 50% 0 50%)' }, animate: { opacity: 1, clipPath: 'inset(0 0% 0 0%)' }, exit: { opacity: 0, clipPath: 'inset(50% 0 50% 0)' } },
              iris:        { initial: { clipPath: 'circle(0% at 50% 50%)' },   animate: { clipPath: 'circle(100% at 50% 50%)' }, exit: { clipPath: 'circle(0% at 50% 50%)' } },
              irisClick:   { initial: { clipPath: 'circle(0% at 50% 50%)' },   animate: { clipPath: 'circle(100% at 50% 50%)' }, exit: { clipPath: 'circle(0% at 50% 50%)' } },
              mixed:       { initial: { opacity: 0, scale: 1.1, rotate: -5 },  animate: { opacity: 1, scale: 1, rotate: 0 },  exit: { opacity: 0, scale: 0.9, rotate: 5 } },
              pixels:      { initial: { opacity: 0, clipPath: 'inset(45% 45% 45% 45% round 20px)' }, animate: { opacity: 1, clipPath: 'inset(0% 0% 0% 0% round 0px)' }, exit: { opacity: 0, clipPath: 'inset(45% 45% 45% 45% round 20px)' } },
              scope:       { initial: { clipPath: 'circle(0% at 50% 50%)' },   animate: { clipPath: 'circle(100% at 50% 50%)' }, exit: { clipPath: 'circle(0% at 50% 50%)' } },
              shutter:     { initial: { clipPath: 'inset(50% 0% 50% 0%)' },    animate: { clipPath: 'inset(0% 0% 0% 0%)' },  exit: { clipPath: 'inset(50% 0% 50% 0%)' } },
              staggerWipe: { initial: { opacity: 0, clipPath: 'inset(0 100% 0 0)' }, animate: { opacity: 1, clipPath: 'inset(0 0 0 0)' }, exit: { opacity: 0, clipPath: 'inset(100% 0 0 0)' } },
              wipe:        { initial: { clipPath: 'inset(0 100% 0 0)' },       animate: { clipPath: 'inset(0 0% 0 0)' },     exit: { clipPath: 'inset(0 0 0 100%)' } },
            };
            return variants[t] || variants.fade;
          })()}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          onMouseMove={e => {
            const rect = e.currentTarget.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            setMousePos({
              x: Math.max(-1, Math.min(1, (e.clientX - cx) / (rect.width / 2))),
              y: Math.max(-1, Math.min(1, (e.clientY - cy) / (rect.height / 2))),
            });
          }}
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            inset: 0,
            background: activeSlide.background.gradient || activeSlide.background.color || '#0f172a',
            perspective: activeSlide.transition === '3dCube' || activeSlide.transition === 'doors' ? '1200px' : undefined,
          }}
          className="absolute inset-0"
        >
          {/* Background Image - when type is 'image' */}
          {activeSlide.background.imageUrl && activeSlide.background.type === 'image' && (
            <img
              src={activeSlide.background.imageUrl}
              alt=""
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            />
          )}

          {/* Particle Backdrop */}
          {(project?.addonParticles || activeSlide.background.type === 'particles') && (
            <ParticleCanvas preset={activeSlide.background.particlesPreset || 'stars'} opacity={0.6} />
          )}

          {/* Render Layers */}
          {activeSlide.layers
            .filter((l) => l.visible)
            .map((layer) => {
              // Full-bleed layers (created by «پر کردن اسلاید»: x=0, y=0, size = project size)
              // stretch to cover the whole hero container regardless of viewport aspect ratio.
              const isFullBleed =
                layer.x === 0 &&
                layer.y === 0 &&
                Math.abs(layer.width - (project?.width || 1240)) < 1 &&
                Math.abs(layer.height - (project?.height || 720)) < 1;
              const layerX = isFullBleed ? 0 : layer.x * scaleFactor;
              const layerY = isFullBleed ? 0 : layer.y * scaleFactor + offsetY;
              const layerW = isFullBleed ? '100%' : `${layer.width * scaleFactor}px`;
              const layerH = isFullBleed ? '100%' : `${layer.height * scaleFactor}px`;
              const layerFontSize = layer.fontSize * scaleFactor;

              // Custom motion path — the layer loops along a user-drawn polyline.
              // Chrome anchors offset-path at the element's OWN position, and the
              // wrapper sits at the layer's left/top, so the scaled layer-relative
              // points are used as-is (no +layerX/+layerY).
              const motionPath = layer.animation.motionPath;
              const pathPts =
                motionPath?.points && motionPath.points.length >= 2
                  ? motionPath.points.map(p => ({ x: p.x * scaleFactor, y: p.y * scaleFactor }))
                  : null;
              const pathString = pathPts
                ? `M ${pathPts[0].x} ${pathPts[0].y} ` + pathPts.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
                : null;
              const pathDuration = Math.max(0.1, motionPath?.duration ?? (layer.animation.inDuration || 0.8));

              // Animation variants
              const getInitial = () => {
                const base = { rotate: layer.rotation };
                switch (layer.animation.inPreset) {
                  case 'none':      return { ...base, opacity: layer.opacity };
                  case 'fadeIn':    return { ...base, opacity: 0 };
                  case 'slideUp':   return { ...base, opacity: 0, y: layerY + 60 };
                  case 'slideDown': return { ...base, opacity: 0, y: layerY - 60 };
                  case 'slideLeft': return { ...base, opacity: 0, x: layerX + 100 };
                  case 'slideRight':return { ...base, opacity: 0, x: layerX - 100 };
                  case 'zoomIn':    return { ...base, opacity: 0, scale: 0.4 };
                  case 'zoomOut':   return { ...base, opacity: 0, scale: 1.5 };
                  case 'bounceIn':  return { ...base, opacity: 0, scale: 0.6 };
                  case 'typewriter':
                  case 'splitWord':
                  case 'splitChar':
                  case 'reveal':
                  case 'wave':
                  case 'flicker':
                    return { ...base, opacity: 1 };
                  default:          return { ...base, opacity: 0 };
                }
              };

              return (
                <motion.div
                  key={layer.id}
                  initial={getInitial()}
                  animate={{ opacity: layer.opacity, x: 0, y: 0, scale: 1, rotate: layer.rotation }}
                  transition={{
                    duration: layer.animation.inPreset === 'none' ? 0 : (layer.animation.inDuration || 0.8),
                    delay: layer.animation.inPreset === 'none' ? 0 : (layer.animation.inDelay || 0),
                    ease: layer.animation.inPreset === 'none' ? 'linear'
                      : layer.animation.inEasing === 'elastic' ? [0.68, -0.6, 0.32, 1.55] as const
                      : layer.animation.inEasing === 'easeInOut' ? [0.42, 0, 0.58, 1] as const
                      : layer.animation.inEasing === 'easeIn' ? [0.4, 0, 1, 1] as const
                      : layer.animation.inEasing === 'linear' ? 'linear'
                      : 'easeOut',
                  }}
                  whileHover={
                    layer.animation.hoverEffect === 'glow'
                      ? { boxShadow: '0 0 25px rgba(56, 189, 248, 0.8)' }
                      : layer.animation.hoverEffect === 'lift'
                      ? { y: -8 }
                      : layer.animation.hoverEffect === 'tilt'
                      ? { rotate: 3, scale: 1.03 }
                      : layer.animation.hoverEffect === 'scale'
                      ? { scale: 1.08 }
                      : {}
                  }
                  onClick={() => {
                    layer.interactions.forEach((int) => {
                      if (int.action === 'jumpSlide' && int.targetSlideId) {
                        const targetIdx = slides.findIndex((s) => s.id === int.targetSlideId);
                        if (targetIdx !== -1) {
                          setCurrentSlide(targetIdx);
                          setKeyCounter((prev) => prev + 1);
                        }
                      } else if (int.action === 'link' && int.targetUrl) {
                        window.open(int.targetUrl, int.openInNewTab !== false ? '_blank' : '_self');
                      }
                    });
                  }}
                  style={{
                    position: 'absolute',
                    left: `${layerX}px`,
                    top: `${layerY}px`,
                    width: typeof layerW === 'string' ? layerW : `${layerW}px`,
                    height: typeof layerH === 'string' ? layerH : `${layerH}px`,
                    fontSize: `${layerFontSize}px`,
                    fontFamily: layer.fontFamily,
                    fontWeight: layer.fontWeight,
                    color: layer.color,
                    borderRadius: `${layer.borderRadius * scaleFactor}px`,
                    // Shapes draw their own outline inside the content (a CSS border
                    // here would stay rectangular and be clipped away by the polygon).
                    borderWidth: layer.type === 'shape' ? undefined : (layer.borderWidth ? `${layer.borderWidth}px` : undefined),
                    borderColor: layer.type === 'shape' ? undefined : (layer.borderColor || undefined),
                    borderStyle: layer.type === 'shape' ? undefined : (layer.borderWidth ? 'solid' : undefined),
                    padding: layer.padding && layer.padding !== '0px' ? scalePxValues(layer.padding, scaleFactor) : undefined,
                    zIndex: layer.zIndex,
                    boxShadow: layer.shadow !== 'none' ? layer.shadow : undefined,
                    cursor: layer.interactions.length > 0 ? 'pointer' : 'default',
                    textAlign: layer.textAlign || undefined,
                  }}
                  className=""
                >
                  {/* Motion path wrapper — loops the layer along the drawn path */}
                  <motion.div
                    style={{
                      width: '100%',
                      height: '100%',
                      offsetPath: pathString ? `path('${pathString}')` : undefined,
                      offsetAnchor: '0% 0%',
                      offsetRotate: '0deg',
                    }}
                    initial={pathString ? { offsetDistance: '0%' } : false}
                    animate={pathString ? { offsetDistance: '100%' } : undefined}
                    transition={pathString ? { duration: pathDuration, ease: 'linear', repeat: Infinity } : undefined}
                  >
                  {/* Parallax inner */}
                  <div style={{
                    width: '100%',
                    height: '100%',
                    ...(layer.animation.parallaxDepth ? {
                      transform: `translate(${mousePos.x * (layer.animation.parallaxDepth / 100) * 40}px, ${mousePos.y * (layer.animation.parallaxDepth / 100) * 40}px)`,
                      transition: 'transform 0.15s ease-out',
                    } : {}),
                  }}>
                  {/* Layer Background — for shapes the fill lives inside the shape
                      content (it must be clipped by the shape geometry) */}
                  {(layer.type !== 'shape' && (layer.backgroundColor !== 'transparent' || layer.backgroundGradient)) && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: layer.backgroundGradient || layer.backgroundColor,
                        borderRadius: `${layer.borderRadius * scaleFactor}px`,
                        opacity: layer.backgroundOpacity !== undefined ? layer.backgroundOpacity / 100 : 1,
                        pointerEvents: 'none',
                      }}
                    />
                  )}
                  {/* Layer Content */}
                  <div className="w-full h-full flex items-center justify-center relative z-[1]">
                    {layer.type === 'shape' ? (
                      renderShapeContent(layer, scaleFactor)
                    ) : layer.type === 'image' ? (
                      <img
                        src={layer.content}
                        alt={layer.name}
                        className="w-full h-full object-cover"
                        style={{ borderRadius: 'inherit' }}
                      />
                    ) : layer.type === 'video' ? (
                      <video
                        src={layer.content}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex relative z-[1]"
                        style={{
                          alignItems: layer.alignVertical === 'top' ? 'flex-start' : layer.alignVertical === 'bottom' ? 'flex-end' : 'center',
                          justifyContent: layer.textAlign === 'right' ? 'right' : layer.textAlign === 'left' ? 'left' : 'center',
                          textAlign: layer.textAlign || 'center',
                          ...(layer.type === 'button' ? { gap: '0.5rem' } : {}),
                        }}
                      >
                        {layer.type === 'button' ? (
                          <button className="w-full h-full cursor-pointer" style={{ background: 'none', border: 'none', color: 'inherit' }}>
                            {layer.content}
                          </button>
                        ) : isTextAnimationPreset(layer.animation.inPreset) ? (
                          <div className="w-full leading-snug flex" style={{ justifyContent: layer.textAlign === 'right' ? 'right' : layer.textAlign === 'left' ? 'left' : 'center' }}>
                            <TextAnimContent text={layer.content} preset={layer.animation.inPreset} duration={layer.animation.inDuration || 0.8} delay={layer.animation.inDelay || 0} />
                          </div>
                        ) : (
                          <div className="w-full leading-snug">{layer.content}</div>
                        )}
                      </div>
                    )}
                  </div>
                  </div>{/* end parallax */}
                  </motion.div>{/* end motion path wrapper */}
                </motion.div>
              );
            })}
        </motion.div>
      </AnimatePresence>

      {/* Slide Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={handleNext}
            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-30 bg-white/15 hover:bg-white/35 active:scale-90 text-white border border-white/30 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 transition-all duration-200 shadow-2xl cursor-pointer group"
            title="اسلاید بعدی"
            aria-label="اسلاید بعدی"
          >
            <i className="fa-solid fa-chevron-left text-lg sm:text-2xl group-hover:-translate-x-0.5 transition-transform"></i>
          </button>

          <button
            onClick={handlePrev}
            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-30 bg-white/15 hover:bg-white/35 active:scale-90 text-white border border-white/30 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 transition-all duration-200 shadow-2xl cursor-pointer group"
            title="اسلاید قبلی"
            aria-label="اسلاید قبلی"
          >
            <i className="fa-solid fa-chevron-right text-lg sm:text-2xl group-hover:translate-x-0.5 transition-transform"></i>
          </button>
        </>
      )}

      {/* Slide Pagination & Controls Bar */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 bg-black/40 backdrop-blur-xl px-5 py-2.5 rounded-full border border-white/25 shadow-2xl">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="text-white/80 hover:text-white transition-colors p-1 text-xs cursor-pointer"
            title={isPaused ? 'پخش اسلایدر' : 'توقف اسلایدر'}
            aria-label="کنترل پخش اسلایدر"
          >
            <i className={`fa-solid ${isPaused ? 'fa-play' : 'fa-pause'}`}></i>
          </button>

          <div className="w-[1px] h-4 bg-white/20 mx-1"></div>

          <div className="flex items-center gap-2">
            {slides.map((s, index) => (
              <button
                key={s.id}
                onClick={() => {
                  setCurrentSlide(index);
                  setKeyCounter((prev) => prev + 1);
                }}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  index === currentSlide
                    ? 'w-8 h-2.5 bg-[#2A9D8F] shadow-md'
                    : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/70'
                }`}
                title={s.title}
                aria-label={`اسلاید ${index + 1}`}
              />
            ))}
          </div>
        </div>
      )}

    </section>
  );
}

