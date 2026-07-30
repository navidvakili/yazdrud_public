import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { fetchSliderStudioProject } from '../api';
import type { SliderProject, Slide } from '../types';
import ParticleCanvas from './ParticleCanvas';

interface HeroProps {
  onNavigate: (section: string) => void;
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

  // Calculate scale factor: fit project width into viewport
  const [scaleFactor, setScaleFactor] = useState(1);
  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      const vw = containerRef.current.clientWidth;
      const pWidth = project?.width || 1240;
      setScaleFactor(vw / pWidth);
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [project?.width]);

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
              const layerX = layer.x * scaleFactor;
              const layerY = layer.y * scaleFactor;
              const layerW = layer.width * scaleFactor;
              const layerH = layer.height * scaleFactor;
              const layerFontSize = layer.fontSize * scaleFactor;

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
                    width: `${layerW}px`,
                    height: `${layerH}px`,
                    fontSize: `${layerFontSize}px`,
                    fontFamily: layer.fontFamily,
                    fontWeight: layer.fontWeight,
                    color: layer.color,
                    borderRadius: `${layer.borderRadius * scaleFactor}px`,
                    borderWidth: layer.borderWidth ? `${layer.borderWidth}px` : undefined,
                    borderColor: layer.borderColor || undefined,
                    borderStyle: layer.borderWidth ? 'solid' : undefined,
                    padding: layer.padding && layer.padding !== '0px' ? layer.padding : undefined,
                    zIndex: layer.zIndex,
                    boxShadow: layer.shadow !== 'none' ? layer.shadow : undefined,
                    cursor: layer.interactions.length > 0 ? 'pointer' : 'default',
                    textAlign: layer.textAlign || undefined,
                  }}
                  className=""
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
                  {/* Layer Background */}
                  {(layer.backgroundColor !== 'transparent' || layer.backgroundGradient) && (
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
                    {layer.type === 'image' ? (
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
                          <div className="w-full h-full leading-snug overflow-hidden flex items-center" style={{ justifyContent: layer.textAlign === 'right' ? 'right' : layer.textAlign === 'left' ? 'left' : 'center' }}>
                            <TextAnimContent text={layer.content} preset={layer.animation.inPreset} duration={layer.animation.inDuration || 0.8} delay={layer.animation.inDelay || 0} />
                          </div>
                        ) : (
                          <div className="w-full h-full leading-snug overflow-hidden">{layer.content}</div>
                        )}
                      </div>
                    )}
                  </div>
                  </div>{/* end parallax */}
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

