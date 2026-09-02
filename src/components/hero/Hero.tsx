import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowDown, Sparkles, ArrowRight, Check } from 'lucide-react';
import { SiteSettings } from '../../types';

interface HeroProps {
  settings: SiteSettings;
  onExploreClick: () => void;
  onRevealTriggered: () => void;
  isRevealed: boolean;
}

export const Hero: React.FC<HeroProps> = ({
  settings,
  onExploreClick,
  onRevealTriggered,
  isRevealed,
}) => {
  // Interaction states: 'idle' | 'holding' | 'completed'
  const [interactionState, setInteractionState] = useState<'idle' | 'holding' | 'completed'>(
    isRevealed ? 'completed' : 'idle'
  );
  const [holdProgress, setHoldProgress] = useState(0); // 0 to 100
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [microCopy, setMicroCopy] = useState<'idle' | 'found' | 'reveal'>('idle');

  const holdIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const holdStartTimeRef = useRef<number>(0);
  const targetBtnRef = useRef<HTMLDivElement | null>(null);

  const HOLD_DURATION_MS = 1600; // 1.6 seconds hold

  // Magnetic proximity effect on desktop
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!targetBtnRef.current) return;
      const rect = targetBtnRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distX = e.clientX - centerX;
      const distY = e.clientY - centerY;
      const distance = Math.hypot(distX, distY);

      if (distance < 140) {
        // Subtle magnetic pull (damped)
        setMousePos({
          x: distX * 0.18,
          y: distY * 0.18,
        });
      } else {
        setMousePos({ x: 0, y: 0 });
      }
    },
    []
  );

  const handleMouseLeaveContainer = () => {
    setMousePos({ x: 0, y: 0 });
    setIsHovered(false);
    cancelHold();
  };

  // Start holding interaction
  const startHold = (e: React.MouseEvent | React.TouchEvent | React.KeyboardEvent) => {
    if (interactionState === 'completed') return;
    setInteractionState('holding');
    holdStartTimeRef.current = Date.now();

    if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);

    holdIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - holdStartTimeRef.current;
      const progress = Math.min(100, (elapsed / HOLD_DURATION_MS) * 100);
      setHoldProgress(progress);

      if (progress >= 100) {
        completeHold();
      }
    }, 20);
  };

  // Cancel hold if released early
  const cancelHold = () => {
    if (interactionState === 'completed') return;
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
    setInteractionState('idle');
    setHoldProgress(0);
  };

  // Trigger completion
  const completeHold = () => {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
    setInteractionState('completed');
    setHoldProgress(100);
    setMicroCopy('found');

    // Haptic feedback if supported on mobile
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([40, 60, 40]);
      } catch (e) {
        // Ignore vibration errors
      }
    }

    setTimeout(() => {
      setMicroCopy('reveal');
      onRevealTriggered();
    }, 600);
  };

  useEffect(() => {
    return () => {
      if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    };
  }, []);

  // Keyboard accessibility
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (interactionState === 'idle') {
        startHold(e);
      }
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (interactionState === 'holding' && holdProgress < 100) {
        cancelHold();
      }
    }
  };

  // SVG circular calculation
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (holdProgress / 100) * circumference;

  return (
    <section
      id="hero"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeaveContainer}
      className="relative min-h-[92vh] flex flex-col justify-between pt-28 sm:pt-36 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden select-none"
    >
      {/* Top Editorial Metadata Banner */}
      {/*
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E8E3DD] pb-4 text-xs uppercase tracking-widest text-[#6F6965] font-display font-medium">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#9B0F06]"></span>
          <span>{settings.metadata_label}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline-block">2024 — 2026</span>
          <span className="text-[#171514] font-semibold">Warm Precision</span>
        </div>
      </div>
      */}

      {/* Main Hero Typography & Interactive Content */}
      <div className="my-auto py-8 sm:py-12">
        <div className="max-w-6xl">
          {/* Main Grid: Left side text/CTA & Right side photo showcase */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Headline, Supporting Copy, Fallback CTA, and Mobile Interactive Card */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              {/* Main Headline */}
              <h1
                id="hero-headline"
                className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-[#171514] font-sans leading-[1.05] sm:leading-[1.02] text-balance mb-6"
              >
                I DESIGN <br className="hidden sm:inline" />
                <span className="relative inline-block text-[#171514]">
                  PRODUCTS
                  <span className="text-[#9B0F06]">.</span>
                </span>{' '}
                <br className="hidden sm:inline" />
                THAT MOVE<span className="text-[#9B0F06]">.</span>
              </h1>

              {/* Supporting Copy */}
              <p
                id="hero-subtext"
                className="text-base sm:text-lg md:text-xl text-[#6F6965] font-light max-w-xl leading-relaxed mb-8"
              >
                {settings.supporting_copy}
              </p>

              {/* Action Buttons Row */}
              <div className="flex flex-wrap items-center gap-4">
                <button
                  id="hero-explore-btn"
                  onClick={onExploreClick}
                  className="group inline-flex items-center gap-3 px-6 py-3.5 bg-[#171514] hover:bg-[#9B0F06] text-white rounded-md text-xs font-display font-semibold uppercase tracking-wider transition-all duration-200 shadow-sm cursor-pointer"
                >
                  <span>Explore Selected Work</span>
                  <ArrowDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                </button>

                {/* Mobile / Tablet Interactive Card (visible only below lg breakpoint) */}
                <div className="lg:hidden w-full sm:w-auto pt-2 sm:pt-0">
                  <div
                    tabIndex={0}
                    role="button"
                    aria-label="Hold to reveal full project archive"
                    onTouchStart={startHold}
                    onTouchEnd={cancelHold}
                    onMouseDown={startHold}
                    onMouseUp={cancelHold}
                    onKeyDown={handleKeyDown}
                    onKeyUp={handleKeyUp}
                    className={`flex items-center gap-3 p-2.5 sm:p-3 pr-5 rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#9B0F06] transition-all border shadow-sm ${
                      interactionState === 'completed'
                        ? 'bg-[#FAF8F5] border-[#9B0F06]/40 text-[#9B0F06]'
                        : interactionState === 'holding'
                        ? 'bg-[#F7F4F0] border-[#9B0F06]/30'
                        : 'bg-[#FAF8F5] border-[#E8E3DD]'
                    }`}
                  >
                    {/* Ring Progress */}
                    <div className="relative w-10 h-10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-10 h-10 -rotate-90" viewBox="0 0 68 68">
                        <circle cx="34" cy="34" r={radius} className="stroke-[#E8E3DD]" strokeWidth="3.5" fill="transparent" />
                        <circle
                          cx="34"
                          cy="34"
                          r={radius}
                          className="stroke-[#9B0F06] transition-all duration-75 ease-linear"
                          strokeWidth="3.5"
                          fill="transparent"
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeDashoffset}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div
                        className={`absolute inset-0 m-auto w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                          interactionState === 'completed'
                            ? 'bg-[#9B0F06] text-white'
                            : interactionState === 'holding'
                            ? 'bg-[#9B0F06]/15 text-[#9B0F06]'
                            : 'bg-[#24201E] text-white'
                        }`}
                      >
                        {interactionState === 'completed' ? (
                          <Check className="w-3 h-3 stroke-[3]" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-current"></span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col text-left font-display text-xs">
                      {interactionState === 'completed' ? (
                        <>
                          <span className="font-bold text-[#9B0F06] uppercase tracking-wider">
                            {microCopy === 'found' ? 'YOU FOUND IT.' : "LET'S SEE THE WORK."}
                          </span>
                          <span className="text-[10px] text-[#6F6965] uppercase font-medium">
                            Archive Unlocked
                          </span>
                        </>
                      ) : interactionState === 'holding' ? (
                        <>
                          <span className="font-bold text-[#9B0F06] uppercase tracking-wider animate-pulse">
                            Hold... ({Math.round(holdProgress)}%)
                          </span>
                          <span className="text-[10px] text-[#6F6965] uppercase font-medium">
                            Keep holding to reveal
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="font-bold text-[#171514] uppercase tracking-wider flex items-center gap-1">
                            <span>Hold to explore</span>                          
                          </span>
                          <span className="text-[10px] text-[#6F6965] uppercase font-medium">
                            Press & hold 1.6s
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Photo Showcase with Floating Bottom-Center Interactive Card (Desktop lg view) */}
            <div className="hidden lg:block lg:col-span-5">
              <div className="relative w-full max-w-md mx-auto pt-2 pb-8">
                {/* Photo Card Frame - No inner nor outer shadow as per revision */}
                <div className="relative w-full h-[360px] xl:h-[400px] rounded-3xl overflow-hidden border border-[#E8E3DD] bg-[#FAF8F5]">
                  <img
                    src={settings.hero_image || 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80'}
                    alt={settings.hero_image_alt || 'Product Design Studio & Interface Architecture'}
                    style={{
                      objectFit: (settings.hero_image_object_fit || 'cover') as any,
                      objectPosition:
                        settings.hero_image_object_position ||
                        `${settings.hero_image_crop_x ?? 50}% ${settings.hero_image_crop_y ?? 50}%`,
                      transform: `scale(${(settings.hero_image_crop_zoom || 100) / 100})`,
                      transformOrigin: `${settings.hero_image_crop_x ?? 50}% ${settings.hero_image_crop_y ?? 50}%`,
                    }}
                    className="w-full h-full"
                    loading="lazy"
                  />

                  {/* Top Tag */}
                  <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 bg-[#171514]/85 backdrop-blur-md border border-white/10 rounded-full text-white text-[11px] font-display uppercase tracking-widest font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#9B0F06]"></span>
                    <span>{settings.hero_image_tag || 'Warm Precision Studio'}</span>
                  </div>

                  {/* Top Right Coordinate Note */}
                  <div className="absolute top-4 right-4 text-[10px] font-mono text-white/80 px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded">
                    {settings.hero_image_badge || 'JKT · 2026'}
                  </div>
                </div>

                {/* Floating Interactive Card Overlapping Bottom Center of Photo */}
                <div
                  id="hero-interactive-target"
                  ref={targetBtnRef}
                  style={{
                    transform: `translate3d(calc(-50% + ${mousePos.x}px), ${mousePos.y}px, 0)`,
                    transition: interactionState === 'holding' ? 'none' : 'transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
                  }}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => {
                    setIsHovered(false);
                    cancelHold();
                  }}
                  onMouseDown={startHold}
                  onMouseUp={cancelHold}
                  onTouchStart={startHold}
                  onTouchEnd={cancelHold}
                  onKeyDown={handleKeyDown}
                  onKeyUp={handleKeyUp}
                  tabIndex={0}
                  role="button"
                  aria-label="Hold to reveal full project archive"
                  className={`absolute -bottom-1 left-1/2 z-20 whitespace-nowrap flex items-center gap-3.5 p-2.5 sm:p-3 pr-5 rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#9B0F06] transition-all duration-200 border shadow-lg hover:shadow-xl ${
                    interactionState === 'completed'
                      ? 'bg-[#FAF8F5] border-[#9B0F06]/50 shadow-[#9B0F06]/15'
                      : isHovered || interactionState === 'holding'
                      ? 'bg-[#FAF8F5] border-[#9B0F06]/40 shadow-[#171514]/15 scale-[1.03]'
                      : 'bg-[#FAF8F5] border-[#E8E3DD] hover:border-[#9B0F06]/40 shadow-[#171514]/10'
                  }`}
                >
                  {/* Circular Target with Progress Ring */}
                  <div className="relative w-12 h-12 flex items-center justify-center flex-shrink-0">
                    <svg className="w-12 h-12 -rotate-90" viewBox="0 0 68 68">
                      {/* Track ring */}
                      <circle
                        cx="34"
                        cy="34"
                        r={radius}
                        className="stroke-[#E8E3DD]"
                        strokeWidth="3.5"
                        fill="transparent"
                      />
                      {/* Active fill ring */}
                      <circle
                        cx="34"
                        cy="34"
                        r={radius}
                        className="stroke-[#9B0F06] transition-all duration-75 ease-linear"
                        strokeWidth="3.5"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                      />
                    </svg>

                    {/* Inner Icon */}
                    <div
                      className={`absolute inset-0 m-auto w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
                        interactionState === 'completed'
                          ? 'bg-[#9B0F06] text-white scale-110'
                          : interactionState === 'holding'
                          ? 'bg-[#9B0F06]/15 text-[#9B0F06]'
                          : isHovered
                          ? 'bg-[#9B0F06]/10 text-[#9B0F06]'
                          : 'bg-[#24201E] text-white'
                      }`}
                    >
                      {interactionState === 'completed' ? (
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-current transition-transform duration-200"></span>
                      )}
                    </div>
                  </div>

                  {/* Dynamic Microcopy Feedback */}
                  <div className="flex flex-col text-left font-display text-xs select-none">
                    {interactionState === 'completed' ? (
                      <>
                        <span className="font-bold text-[#9B0F06] uppercase tracking-wider">
                          {microCopy === 'found' ? 'YOU FOUND IT.' : "LET'S SEE THE WORK."}
                        </span>
                        <span className="text-[10px] text-[#6F6965] uppercase font-medium">
                          Archive Unlocked
                        </span>
                      </>
                    ) : interactionState === 'holding' ? (
                      <>
                        <span className="font-bold text-[#9B0F06] uppercase tracking-wider animate-pulse">
                          Hold tight... ({Math.round(holdProgress)}%)
                        </span>
                        <span className="text-[10px] text-[#6F6965] uppercase font-medium">
                          Keep holding to reveal
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="font-bold text-[#171514] uppercase tracking-wider flex items-center gap-1">
                          <span>Hold to explore</span>
                          <Sparkles className="w-3 h-3 text-[#9B0F06]" />
                        </span>
                        <span className="text-[10px] text-[#6F6965] uppercase font-medium">
                          Press & hold 1.6s
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Bottom Bar / Philosophy Quote */}
      <div className="border-t border-[#E8E3DD] pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-display text-[#6F6965]">
        <div className="flex items-center gap-3">
          <span className="text-[#171514] font-semibold">"Quiet on the surface. Curious underneath."</span>
        </div>
        <div className="flex items-center gap-6 font-medium">
          <span>Enterprise SaaS</span>
          <span>·</span>
          <span>Fintech & AI</span>
          <span>·</span>
          <span>Interaction Experiments</span>
        </div>
      </div>
    </section>
  );
};
