import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // 100 steps * 30ms = 3,000ms (3 seconds total duration)
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onFinish, 100);
          return 100;
        }
        return prev + 1;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [onFinish]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0d1114] overflow-hidden select-none"
    >
      {/* Background ambient neon green pulse matching the uploaded logo */}
      <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-[#15803d]/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#166534]/15 rounded-full blur-3xl pointer-events-none animate-pulse"
        style={{ animationDelay: '500ms' }}
      />

      {/* Animated 3D Neon Green T-Wave-Play App Icon Logo */}
      <div className="relative mb-6">
        {/* Outer Neon Green Halo */}
        <div className="absolute -inset-6 rounded-[40px] bg-[#15803d]/25 blur-2xl animate-pulse pointer-events-none" />

        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{
            scale: [0.96, 1.05, 0.98, 1],
            opacity: 1,
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          className="relative flex items-center justify-center"
        >
          <img
            src="/assets/aistudio/Screenshot_20261105_222028_Chrome_22ea8bca.jpg"
            alt="TokVibe Splash Logo"
            className="w-48 h-48 rounded-[36px] object-cover shadow-[0_0_45px_rgba(34,197,94,0.5)] border border-emerald-500/40"
          />
        </motion.div>
      </div>


    </motion.div>
  );
};

interface TikFlowLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  className?: string;
}

/**
 * Recreates the uploaded 3D Neon Green "T + Audio Pulse Wave + Play Triangle" logo
 * inside a matte dark slate rounded square with realistic neon tubing & glow.
 */
export const TikFlowLogo: React.FC<TikFlowLogoProps> = ({
  size = 'md',
  animated = false,
  className = '',
}) => {
  const dimensions = {
    sm: 'w-8 h-8 rounded-lg',
    md: 'w-11 h-11 rounded-2xl',
    lg: 'w-16 h-16 rounded-2xl',
    xl: 'w-32 h-32 rounded-[28px]',
  }[size];

  return (
    <div
      className={`relative inline-flex items-center justify-center bg-[#12171A] border border-emerald-400/25 shadow-[0_0_25px_rgba(34,197,94,0.35),inset_0_1px_2px_rgba(255,255,255,0.08)] overflow-hidden shrink-0 ${dimensions} ${className}`}
    >
      {/* Subtle radial neon green reflection on the dark matte squircle */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(34, 197, 94, 0.18) 0%, rgba(18, 23, 26, 0.95) 72%)',
        }}
      />

      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 w-[84%] h-[84%] drop-shadow-[0_0_10px_rgba(34,197,94,0.85)]"
      >
        <defs>
          <filter id="neonGlowGreen" x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur stdDeviation="3.2" result="blur1" />
            <feGaussianBlur stdDeviation="7" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <linearGradient id="neonTubeOuter" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4ade80" />
            <stop offset="50%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#15803d" />
          </linearGradient>

          <linearGradient id="neonTubeCore" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#dcfce7" />
            <stop offset="50%" stopColor="#86efac" />
            <stop offset="100%" stopColor="#bbf7d0" />
          </linearGradient>
        </defs>

        {/* 3D Dark Extrusion Base Shadow (gives the 3D molded acrylic/glass tube depth) */}
        <g transform="translate(1.5, 3)" opacity="0.75">
          {/* Left top bar of T */}
          <rect
            x="16"
            y="28"
            width="28"
            height="11"
            rx="3.5"
            stroke="#052e16"
            strokeWidth="5"
            fill="#052e16"
          />
          {/* Curved right top bar & vertical stem of T */}
          <path
            d="M 68 28 H 56 C 45.5 28 39 34.5 39 45 V 88 C 39 90.5 41 92.5 43.5 92.5 H 46.5 C 49 92.5 51 90.5 51 88 V 46 C 51 41.5 54 39 58.5 39 H 68 C 70.5 39 72 37.5 72 35 V 32 C 72 29.5 70.5 28 68 28 Z"
            fill="#052e16"
            stroke="#052e16"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          {/* Audio Pulse Wave + Play Triangle */}
          <path
            d="M 51 64 H 55.5 C 57.5 64 58.5 62.5 59.5 59 L 61.5 53 C 62.5 50 64.5 50 65.2 53.5 L 69.5 76 C 70.2 79.5 72.5 79.5 73.2 76 L 78.5 46.5 C 79.2 43 81.5 43 82.2 46.5 L 86 68.5 C 86.7 72 88.8 72 89.8 68.5 L 92 61.5 C 92.8 59 94.5 59 95.5 61.5 L 96.5 65"
            stroke="#052e16"
            strokeWidth="6.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 96.5 51.5 C 96.5 49 99 47.8 101.2 49.2 L 111.5 56 C 113.5 57.3 113.5 60.2 111.5 61.5 L 101.2 68.3 C 99 69.7 96.5 68.5 96.5 66 Z"
            stroke="#052e16"
            strokeWidth="6"
            strokeLinejoin="round"
          />
        </g>

        {/* Main Glowing Neon Green 3D Tubes */}
        <g filter="url(#neonGlowGreen)">
          {/* 1. Left Horizontal Tube of 'T' */}
          <rect
            x="16"
            y="28"
            width="28"
            height="11"
            rx="3.5"
            fill="rgba(22, 163, 74, 0.22)"
            stroke="url(#neonTubeOuter)"
            strokeWidth="3.6"
          />
          <rect
            x="17.5"
            y="29.5"
            width="25"
            height="8"
            rx="2.2"
            stroke="url(#neonTubeCore)"
            strokeWidth="1.4"
            opacity="0.95"
          />

          {/* 2. Right Curved Top + Vertical Stem of 'T' (Double-walled neon tube) */}
          <path
            d="M 68 28 H 56 C 45.5 28 39 34.5 39 45 V 88 C 39 90.5 41 92.5 43.5 92.5 H 46.5 C 49 92.5 51 90.5 51 88 V 46 C 51 41.5 54 39 58.5 39 H 68 C 70.5 39 72 37.5 72 35 V 32 C 72 29.5 70.5 28 68 28 Z"
            fill="rgba(22, 163, 74, 0.22)"
            stroke="url(#neonTubeOuter)"
            strokeWidth="3.6"
            strokeLinejoin="round"
          />
          <path
            d="M 67.5 30 H 56 C 46.8 30 41 35.8 41 45 V 87.5 C 41 89.2 42.2 90.5 43.8 90.5 H 46.2 C 47.8 90.5 49 89.2 49 87.5 V 46 C 49 40.2 52.8 37 58.5 37 H 67.5 C 69.2 37 70 36 70 34.5 V 32.5 C 70 31 69.2 30 67.5 30 Z"
            stroke="url(#neonTubeCore)"
            strokeWidth="1.35"
            strokeLinejoin="round"
            opacity="0.95"
          />

          {/* 3. Audio Waveform Pulse Line coming out of T stem */}
          <path
            d="M 51 64 H 55.5 C 57.5 64 58.5 62.5 59.5 59 L 61.5 53 C 62.5 50 64.5 50 65.2 53.5 L 69.5 76 C 70.2 79.5 72.5 79.5 73.2 76 L 78.5 46.5 C 79.2 43 81.5 43 82.2 46.5 L 86 68.5 C 86.7 72 88.8 72 89.8 68.5 L 92 61.5 C 92.8 59 94.5 59 96.5 63"
            stroke="url(#neonTubeOuter)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={animated ? 'animate-pulse' : ''}
          />
          <path
            d="M 51 64 H 55.5 C 57.5 64 58.5 62.5 59.5 59 L 61.5 53 C 62.5 50 64.5 50 65.2 53.5 L 69.5 76 C 70.2 79.5 72.5 79.5 73.2 76 L 78.5 46.5 C 79.2 43 81.5 43 82.2 46.5 L 86 68.5 C 86.7 72 88.8 72 89.8 68.5 L 92 61.5 C 92.8 59 94.5 59 96.5 63"
            stroke="url(#neonTubeCore)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 4. Neon Play Triangle at the end of the wave */}
          <path
            d="M 96.5 51.5 C 96.5 49 99 47.8 101.2 49.2 L 111.5 56 C 113.5 57.3 113.5 60.2 111.5 61.5 L 101.2 68.3 C 99 69.7 96.5 68.5 96.5 66 Z"
            fill="rgba(22, 163, 74, 0.25)"
            stroke="url(#neonTubeOuter)"
            strokeWidth="4.6"
            strokeLinejoin="round"
          />
          <path
            d="M 96.5 51.5 C 96.5 49 99 47.8 101.2 49.2 L 111.5 56 C 113.5 57.3 113.5 60.2 111.5 61.5 L 101.2 68.3 C 99 69.7 96.5 68.5 96.5 66 Z"
            stroke="url(#neonTubeCore)"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    </div>
  );
};

export const TokVibeGlyph: React.FC<{ className?: string }> = ({ className = 'w-20 h-20' }) => (
  <TikFlowLogo size="lg" className={className} />
);
