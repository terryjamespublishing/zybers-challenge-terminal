import React, { useState, useEffect, useRef, useCallback } from 'react';

interface ZyberEyeProps {
  onClick: () => void;
  isWatching?: boolean;
  size?: number;
}

const ZyberEye: React.FC<ZyberEyeProps> = ({ onClick, isWatching = true, size = 300 }) => {
  const [pupilPosition, setPupilPosition] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);
  const [glitchActive, setGlitchActive] = useState(false);
  const [pulseIntensity, setPulseIntensity] = useState(1);
  const eyeRef = useRef<HTMLDivElement>(null);

  // Track mouse movement for pupil following
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!eyeRef.current || !isWatching) return;

    const rect = eyeRef.current.getBoundingClientRect();
    const eyeCenterX = rect.left + rect.width / 2;
    const eyeCenterY = rect.top + rect.height / 2;

    const angle = Math.atan2(e.clientY - eyeCenterY, e.clientX - eyeCenterX);
    const distance = Math.min(
      Math.hypot(e.clientX - eyeCenterX, e.clientY - eyeCenterY) / 10,
      size * 0.12
    );

    setPupilPosition({
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance
    });
  }, [isWatching, size]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  // Random blinking
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 150);
      }
    }, 2000);

    return () => clearInterval(blinkInterval);
  }, []);

  // Random glitch effect
  useEffect(() => {
    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.85) {
        setGlitchActive(true);
        setTimeout(() => setGlitchActive(false), 100 + Math.random() * 200);
      }
    }, 3000);

    return () => clearInterval(glitchInterval);
  }, []);

  // Pulse animation
  useEffect(() => {
    const pulseInterval = setInterval(() => {
      setPulseIntensity(0.7 + Math.random() * 0.5);
    }, 100);

    return () => clearInterval(pulseInterval);
  }, []);

  const irisSize = size * 0.45;
  const pupilSize = size * 0.2;

  return (
    <div className="relative flex flex-col items-center">
      {/* Main eye container */}
      <div
        ref={eyeRef}
        onClick={onClick}
        className="relative cursor-pointer group"
        style={{
          width: size,
          height: size * 0.6,
          filter: glitchActive
            ? `hue-rotate(${Math.random() * 30}deg) brightness(1.5)`
            : 'none',
          transition: glitchActive ? 'none' : 'filter 0.3s'
        }}
      >
        {/* Outer glow */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(ellipse, rgba(0, 255, 65, ${0.15 * pulseIntensity}) 0%, transparent 70%)`,
            filter: `blur(${size * 0.1}px)`,
            transform: 'scale(1.5)',
          }}
        />

        {/* Eye socket/outline */}
        <div
          className="absolute inset-0 border-2 border-primary overflow-hidden"
          style={{
            borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
            boxShadow: `
              0 0 ${size * 0.1}px rgba(0, 255, 65, ${0.5 * pulseIntensity}),
              inset 0 0 ${size * 0.15}px rgba(0, 255, 65, 0.3),
              0 0 ${size * 0.05}px rgba(0, 255, 65, 0.8)
            `,
            background: 'linear-gradient(180deg, rgba(0, 10, 0, 0.95) 0%, rgba(0, 20, 5, 0.9) 100%)',
            transform: isBlinking ? 'scaleY(0.1)' : 'scaleY(1)',
            transition: isBlinking ? 'transform 0.08s ease-in' : 'transform 0.15s ease-out',
          }}
        >
          {/* Scanlines overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.3) 2px, rgba(0, 0, 0, 0.3) 4px)',
              zIndex: 10,
            }}
          />

          {/* Iris */}
          <div
            className="absolute"
            style={{
              width: irisSize,
              height: irisSize,
              left: '50%',
              top: '50%',
              transform: `translate(calc(-50% + ${pupilPosition.x}px), calc(-50% + ${pupilPosition.y}px))`,
              transition: 'transform 0.1s ease-out',
            }}
          >
            {/* Iris outer ring */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `
                  radial-gradient(circle at 30% 30%,
                    rgba(0, 255, 65, 0.8) 0%,
                    rgba(0, 180, 45, 0.6) 30%,
                    rgba(0, 100, 25, 0.4) 60%,
                    rgba(0, 50, 15, 0.3) 100%
                  )
                `,
                boxShadow: `
                  0 0 ${size * 0.05}px rgba(0, 255, 65, ${0.6 * pulseIntensity}),
                  inset 0 0 ${size * 0.03}px rgba(0, 255, 65, 0.5)
                `,
              }}
            />

            {/* Iris circuit pattern */}
            <svg
              className="absolute inset-0"
              viewBox="0 0 100 100"
              style={{ opacity: 0.4 }}
            >
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary" />
              <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary" />
              <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary" />
              {/* Radial lines */}
              {[...Array(12)].map((_, i) => (
                <line
                  key={i}
                  x1="50"
                  y1="50"
                  x2={50 + 45 * Math.cos((i * 30 * Math.PI) / 180)}
                  y2={50 + 45 * Math.sin((i * 30 * Math.PI) / 180)}
                  stroke="currentColor"
                  strokeWidth="0.3"
                  className="text-primary"
                />
              ))}
            </svg>

            {/* Pupil */}
            <div
              className="absolute rounded-full"
              style={{
                width: pupilSize,
                height: pupilSize,
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                background: `
                  radial-gradient(circle at 30% 30%,
                    rgba(0, 50, 0, 1) 0%,
                    rgba(0, 0, 0, 1) 60%
                  )
                `,
                boxShadow: `
                  0 0 ${size * 0.02}px rgba(0, 255, 65, 0.8),
                  inset 0 0 ${size * 0.03}px rgba(0, 255, 65, 0.3)
                `,
              }}
            >
              {/* Pupil reflection */}
              <div
                className="absolute rounded-full bg-primary/40"
                style={{
                  width: pupilSize * 0.3,
                  height: pupilSize * 0.3,
                  top: '20%',
                  left: '20%',
                }}
              />
            </div>
          </div>

          {/* Top eyelid shadow */}
          <div
            className="absolute top-0 left-0 right-0"
            style={{
              height: '40%',
              background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.6) 0%, transparent 100%)',
            }}
          />

          {/* Bottom eyelid shadow */}
          <div
            className="absolute bottom-0 left-0 right-0"
            style={{
              height: '30%',
              background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.4) 0%, transparent 100%)',
            }}
          />
        </div>

        {/* Hover effect - outer ring */}
        <div
          className="absolute inset-0 border border-primary/0 group-hover:border-primary/50 transition-all duration-300"
          style={{
            borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
            transform: 'scale(1.1)',
          }}
        />
      </div>

      {/* Text prompt below eye */}
      <div className="mt-8 text-center">
        <div
          className="text-primary text-2xl tracking-widest animate-pulse cursor-pointer"
          onClick={onClick}
          style={{
            textShadow: `0 0 10px rgba(0, 255, 65, ${pulseIntensity * 0.8})`,
          }}
        >
          [ INITIATE CHALLENGE ]
        </div>
      </div>

      {/* Decorative circuit lines */}
      <svg
        className="absolute pointer-events-none"
        style={{
          width: size * 1.5,
          height: size * 1.2,
          top: -size * 0.15,
          left: '50%',
          transform: 'translateX(-50%)',
          opacity: 0.3,
        }}
        viewBox="0 0 300 200"
      >
        {/* Left circuit */}
        <path
          d="M 0 100 L 30 100 L 40 90 L 60 90"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          className="text-primary"
        />
        <circle cx="60" cy="90" r="3" className="fill-primary" />
        <path
          d="M 0 120 L 20 120 L 30 110 L 50 110"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          className="text-primary"
        />
        <circle cx="50" cy="110" r="2" className="fill-primary" />

        {/* Right circuit */}
        <path
          d="M 300 100 L 270 100 L 260 90 L 240 90"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          className="text-primary"
        />
        <circle cx="240" cy="90" r="3" className="fill-primary" />
        <path
          d="M 300 120 L 280 120 L 270 110 L 250 110"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          className="text-primary"
        />
        <circle cx="250" cy="110" r="2" className="fill-primary" />

        {/* Bottom circuits */}
        <path
          d="M 150 180 L 150 200"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          className="text-primary"
        />
        <path
          d="M 130 175 L 130 195 L 120 200"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          className="text-primary"
        />
        <path
          d="M 170 175 L 170 195 L 180 200"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          className="text-primary"
        />
      </svg>
    </div>
  );
};

export default ZyberEye;
