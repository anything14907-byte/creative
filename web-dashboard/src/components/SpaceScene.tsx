import React, { useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export const SpaceScene: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Deterministic star field so it doesn't flicker or re-generate on render
  const stars = useMemo(() => {
    const starList = [];
    const count = 75;
    for (let i = 0; i < count; i++) {
      const top = Math.floor((i * 37) % 98) + Math.random() * 2;
      const left = Math.floor((i * 67) % 98) + Math.random() * 2;
      const size = (i % 5 === 0) ? 3 : (i % 2 === 0) ? 2 : 1.2;
      const duration = 2.5 + ((i % 7) * 0.7);
      const delay = (i % 11) * 0.4;
      const opacity = 0.35 + ((i % 4) * 0.2);
      const isCyan = i % 6 === 0;
      const isGold = i % 8 === 0;
      starList.push({ id: i, top, left, size, duration, delay, opacity, isCyan, isGold });
    }
    return starList;
  }, []);

  return (
    <div 
      aria-hidden="true" 
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none transition-colors duration-500"
      style={{
        background: isDark
          ? 'radial-gradient(ellipse 90% 60% at 80% 10%, #0D2040 0%, #070B19 55%, #03050C 100%)'
          : 'linear-gradient(135deg, #E2EEFF 0%, #F4F8FF 50%, #FFF9EB 100%)'
      }}
    >
      {/* 1. ATMOSPHERIC NEBULA HORIZON SPOTLIGHTS */}
      {isDark && (
        <>
          {/* Cyan Nebula Spotlight near top center */}
          <div 
            className="absolute -top-32 left-1/4 w-[650px] h-[450px] rounded-full pointer-events-none opacity-20 blur-[110px]"
            style={{ background: 'radial-gradient(circle, #38BDF8 0%, rgba(16, 185, 129, 0.4) 50%, transparent 70%)' }}
          />
          {/* Solar Amber Dust Cloud near bottom right */}
          <div 
            className="absolute bottom-10 right-10 w-[550px] h-[400px] rounded-full pointer-events-none opacity-15 blur-[120px]"
            style={{ background: 'radial-gradient(circle, #F59E0B 0%, rgba(248, 113, 113, 0.3) 50%, transparent 70%)' }}
          />
        </>
      )}

      {/* 2. TWINKLING STARFIELD */}
      <div className={`absolute inset-0 transition-opacity duration-500 ${isDark ? 'opacity-100' : 'opacity-30'}`}>
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full animate-twinkle"
            style={{
              top: `${star.top}%`,
              left: `${star.left}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              backgroundColor: star.isCyan ? '#38BDF8' : star.isGold ? '#FDE047' : '#FFFFFF',
              boxShadow: isDark && star.size >= 2 
                ? (star.isCyan ? '0 0 6px #38BDF8' : star.isGold ? '0 0 6px #FDE047' : '0 0 4px #FFFFFF') 
                : 'none',
              animationDuration: `${star.duration}s`,
              animationDelay: `${star.delay}s`,
              opacity: isDark ? star.opacity : star.opacity * 0.45
            }}
          />
        ))}
      </div>

      {/* 3. SHOOTING STARS */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="shooting-star shooting-star-1" />
        <div className="shooting-star shooting-star-2" />
      </div>

      {/* 4. THREE HIGH-DETAIL FLOATING SVG PLANETS */}

      {/* PLANET 1 (Top-Right Horizon): Ringed Gas Giant (Saturn-Style) */}
      <div 
        className="absolute top-12 sm:top-16 -right-12 sm:right-6 md:right-16 w-52 sm:w-64 md:w-72 h-52 sm:h-64 md:h-72 animate-float-orbit transition-all duration-700 pointer-events-none"
        style={{
          opacity: isDark ? 0.92 : 0.70,
          filter: isDark ? 'drop-shadow(0 0 35px rgba(245, 158, 11, 0.25))' : 'drop-shadow(0 10px 25px rgba(200, 160, 60, 0.20))'
        }}
      >
        <svg viewBox="0 0 300 300" className="w-full h-full">
          <defs>
            {/* Atmospheric Bands Gradient */}
            <linearGradient id="saturnBands" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={isDark ? '#FCD34D' : '#FDE68A'} />
              <stop offset="18%" stopColor={isDark ? '#F59E0B' : '#F59E0B'} />
              <stop offset="35%" stopColor={isDark ? '#D97706' : '#E5A54B'} />
              <stop offset="50%" stopColor={isDark ? '#0284C7' : '#38BDF8'} />
              <stop offset="68%" stopColor={isDark ? '#D97706' : '#F59E0B'} />
              <stop offset="85%" stopColor={isDark ? '#B45309' : '#D97706'} />
              <stop offset="100%" stopColor={isDark ? '#78350F' : '#92400E'} />
            </linearGradient>

            {/* 3D Spherical Shadow Gradient */}
            <radialGradient id="saturnSphereShadow" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity={isDark ? "0.35" : "0.55"} />
              <stop offset="45%" stopColor="#000000" stopOpacity="0" />
              <stop offset="85%" stopColor="#000000" stopOpacity={isDark ? "0.75" : "0.35"} />
              <stop offset="100%" stopColor="#000000" stopOpacity={isDark ? "0.95" : "0.55"} />
            </radialGradient>

            {/* Glowing Ring Gradient */}
            <linearGradient id="saturnRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FCD34D" stopOpacity="0.85" />
              <stop offset="25%" stopColor="#38BDF8" stopOpacity="0.75" />
              <stop offset="50%" stopColor="#F59E0B" stopOpacity="0.25" />
              <stop offset="75%" stopColor="#38BDF8" stopOpacity="0.80" />
              <stop offset="100%" stopColor="#FDE047" stopOpacity="0.90" />
            </linearGradient>

            {/* Planet Mask for Rings Passing Behind */}
            <clipPath id="saturnBackRingsClip">
              <rect x="0" y="0" width="300" height="150" />
            </clipPath>
            <clipPath id="saturnFrontRingsClip">
              <rect x="0" y="150" width="300" height="150" />
            </clipPath>
          </defs>

          {/* BACK HALF OF THE RINGS (passes behind upper sphere) */}
          <g clipPath="url(#saturnBackRingsClip)" transform="rotate(-22 150 150)">
            <ellipse cx="150" cy="150" rx="135" ry="38" fill="none" stroke="url(#saturnRingGrad)" strokeWidth="16" opacity="0.65" />
            <ellipse cx="150" cy="150" rx="146" ry="42" fill="none" stroke="#FDE68A" strokeWidth="2.5" opacity="0.7" />
            <ellipse cx="150" cy="150" rx="118" ry="32" fill="none" stroke="#38BDF8" strokeWidth="3" opacity="0.5" />
          </g>

          {/* PLANET BODY WITH ATMOSPHERIC STRIPES */}
          <circle cx="150" cy="150" r="74" fill="url(#saturnBands)" />
          {/* Spherical Shadow Overlay */}
          <circle cx="150" cy="150" r="74" fill="url(#saturnSphereShadow)" />

          {/* Subtle Polar Cap Highlights */}
          <ellipse cx="150" cy="82" rx="35" ry="8" fill="#FFFFFF" opacity={isDark ? "0.18" : "0.35"} />

          {/* FRONT HALF OF THE RINGS (passes in front of lower sphere) */}
          <g clipPath="url(#saturnFrontRingsClip)" transform="rotate(-22 150 150)">
            <ellipse cx="150" cy="150" rx="135" ry="38" fill="none" stroke="url(#saturnRingGrad)" strokeWidth="16" opacity="0.95" />
            <ellipse cx="150" cy="150" rx="146" ry="42" fill="none" stroke="#FDE68A" strokeWidth="3" opacity="0.85" />
            <ellipse cx="150" cy="150" rx="118" ry="32" fill="none" stroke="#38BDF8" strokeWidth="3.5" opacity="0.75" />
          </g>
        </svg>
      </div>

      {/* PLANET 2 (Bottom-Left Horizon): Blue-Teal Exoplanet with Orbiting Moon */}
      <div 
        className="absolute -bottom-10 sm:bottom-6 -left-10 sm:left-6 md:left-12 w-44 sm:w-56 md:w-64 h-44 sm:h-56 md:h-64 animate-float-slow pointer-events-none"
        style={{
          opacity: isDark ? 0.90 : 0.65,
          filter: isDark ? 'drop-shadow(0 0 35px rgba(56, 189, 248, 0.30))' : 'drop-shadow(0 8px 20px rgba(56, 189, 248, 0.20))'
        }}
      >
        <svg viewBox="0 0 240 240" className="w-full h-full">
          <defs>
            <radialGradient id="oceanExoGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#67E8F9" />
              <stop offset="30%" stopColor="#06B6D4" />
              <stop offset="70%" stopColor="#0369A1" />
              <stop offset="100%" stopColor={isDark ? '#082F49' : '#075985'} />
            </radialGradient>
            <radialGradient id="exoAtmosphereGlow" cx="50%" cy="50%" r="50%">
              <stop offset="85%" stopColor="#38BDF8" stopOpacity="0" />
              <stop offset="100%" stopColor="#38BDF8" stopOpacity={isDark ? "0.6" : "0.3"} />
            </radialGradient>
            <radialGradient id="moonShade" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#F8FAFC" />
              <stop offset="60%" stopColor="#94A3B8" />
              <stop offset="100%" stopColor="#334155" />
            </radialGradient>
          </defs>

          {/* Moon's Orbit Track */}
          <ellipse cx="120" cy="120" rx="96" ry="46" fill="none" stroke="#38BDF8" strokeWidth="1" strokeDasharray="4 6" opacity={isDark ? "0.4" : "0.25"} transform="rotate(28 120 120)" />

          {/* Planet Body */}
          <circle cx="120" cy="120" r="56" fill="url(#oceanExoGrad)" />
          {/* Swirl Continent Details */}
          <path d="M 85 110 Q 95 95, 115 105 T 145 100 Q 155 115, 140 130 Z" fill="#10B981" opacity="0.35" />
          <path d="M 100 135 Q 120 145, 135 135 T 155 145 Q 140 160, 110 150 Z" fill="#10B981" opacity="0.30" />
          {/* Atmosphere rim */}
          <circle cx="120" cy="120" r="58" fill="url(#exoAtmosphereGlow)" />

          {/* Orbiting Moon */}
          <g className="animate-moon-orbit" style={{ transformOrigin: '120px 120px' }}>
            <circle cx="216" cy="120" r="10" fill="url(#moonShade)" filter="drop-shadow(0 0 4px rgba(255, 255, 255, 0.4))" />
            <circle cx="214" cy="118" r="2" fill="#475569" opacity="0.6" />
            <circle cx="218" cy="122" r="1.5" fill="#475569" opacity="0.6" />
          </g>
        </svg>
      </div>

      {/* PLANET 3 (Center-Right / Mid-Accent): Warm Mars / Solar Sphere */}
      <div 
        className="absolute top-1/2 right-4 sm:right-24 md:right-36 -translate-y-1/2 w-28 sm:w-36 md:w-40 h-28 sm:h-36 md:h-40 animate-float-reverse pointer-events-none"
        style={{
          opacity: isDark ? 0.85 : 0.60,
          filter: isDark ? 'drop-shadow(0 0 25px rgba(248, 113, 113, 0.25))' : 'drop-shadow(0 6px 16px rgba(239, 68, 68, 0.15))'
        }}
      >
        <svg viewBox="0 0 160 160" className="w-full h-full">
          <defs>
            <radialGradient id="marsSphereGrad" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#FCA5A5" />
              <stop offset="25%" stopColor="#F87171" />
              <stop offset="65%" stopColor="#DC2626" />
              <stop offset="100%" stopColor={isDark ? '#450A0A' : '#7F1D1D'} />
            </radialGradient>
          </defs>
          <circle cx="80" cy="80" r="46" fill="url(#marsSphereGrad)" />
          {/* Craters & Terrain */}
          <circle cx="68" cy="65" r="7" fill="#991B1B" opacity="0.4" />
          <circle cx="95" cy="82" r="9" fill="#991B1B" opacity="0.35" />
          <circle cx="75" cy="98" r="6" fill="#991B1B" opacity="0.4" />
          <ellipse cx="80" cy="40" rx="16" ry="4" fill="#FFFFFF" opacity={isDark ? "0.35" : "0.5"} />
        </svg>
      </div>
    </div>
  );
};
