import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { fetchSliderStudioProject } from '../api';
import type { SliderProject, Slide } from '../types';
import ParticleCanvas from './ParticleCanvas';

interface HeroProps {
  onNavigate: (section: string) => void;
}

export default function Hero({ onNavigate }: HeroProps) {
  const [project, setProject] = useState<SliderProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [keyCounter, setKeyCounter] = useState(0);
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
              fade:       { initial: { opacity: 0 },                animate: { opacity: 1 },                exit: { opacity: 0 } },
              slideLeft:  { initial: { opacity: 0, x: 200 },        animate: { opacity: 1, x: 0 },           exit: { opacity: 0, x: -200 } },
              slideRight: { initial: { opacity: 0, x: -200 },       animate: { opacity: 1, x: 0 },           exit: { opacity: 0, x: 200 } },
              zoomOut:    { initial: { opacity: 0, scale: 1.2 },    animate: { opacity: 1, scale: 1 },       exit: { opacity: 0, scale: 0.8 } },
              '3dCube':   { initial: { opacity: 0, rotateY: -45, scale: 0.9 }, animate: { opacity: 1, rotateY: 0, scale: 1 }, exit: { opacity: 0, rotateY: 45, scale: 0.9 } },
            };
            return variants[t] || variants.fade;
          })()}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            inset: 0,
            background: activeSlide.background.gradient || activeSlide.background.color || '#0f172a',
            perspective: activeSlide.transition === '3dCube' ? '1200px' : undefined,
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
                  case 'fadeIn':    return { ...base, opacity: 0 };
                  case 'slideUp':   return { ...base, opacity: 0, y: layerY + 60 };
                  case 'slideDown': return { ...base, opacity: 0, y: layerY - 60 };
                  case 'slideLeft': return { ...base, opacity: 0, x: layerX + 100 };
                  case 'slideRight':return { ...base, opacity: 0, x: layerX - 100 };
                  case 'zoomIn':    return { ...base, opacity: 0, scale: 0.4 };
                  case 'zoomOut':   return { ...base, opacity: 0, scale: 1.5 };
                  default:          return { ...base, opacity: 0 };
                }
              };

              return (
                <motion.div
                  key={layer.id}
                  initial={getInitial()}
                  animate={{ opacity: layer.opacity, x: 0, y: 0, scale: 1, rotate: layer.rotation }}
                  transition={{
                    duration: layer.animation.inDuration || 0.8,
                    delay: layer.animation.inDelay || 0,
                    ease: layer.animation.inEasing === 'bounce' ? [0.68, -0.55, 0.265, 1.55] as const : 'easeOut',
                  }}
                  whileHover={
                    layer.animation.hoverEffect === 'glow'
                      ? { boxShadow: '0 0 25px rgba(56, 189, 248, 0.8)' }
                      : layer.animation.hoverEffect === 'lift'
                      ? { y: -8 }
                      : layer.animation.hoverEffect === 'tilt'
                      ? { rotate: 3, scale: 1.03 }
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
                        window.open(int.targetUrl, '_blank');
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
                    backgroundColor: layer.backgroundColor,
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
                  className="flex items-center justify-center"
                >
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
                  ) : layer.type === 'button' ? (
                    <button className="w-full h-full font-black text-center flex items-center justify-center gap-2 cursor-pointer">
                      {layer.content}
                    </button>
                  ) : (
                    <div className="w-full h-full leading-snug flex items-center justify-center overflow-hidden">
                      {layer.content}
                    </div>
                  )}
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

