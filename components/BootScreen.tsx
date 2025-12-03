import React, { useEffect, useState, useCallback, useRef } from 'react';

interface BootScreenProps {
  onComplete: () => void;
}

// ASCII Art Logo for ZYBER
const ZYBER_LOGO = `
███████╗██╗   ██╗██████╗ ███████╗██████╗
╚══███╔╝╚██╗ ██╔╝██╔══██╗██╔════╝██╔══██╗
  ███╔╝  ╚████╔╝ ██████╔╝█████╗  ██████╔╝
 ███╔╝    ╚██╔╝  ██╔══██╗██╔══╝  ██╔══██╗
███████╗   ██║   ██████╔╝███████╗██║  ██║
╚══════╝   ╚═╝   ╚═════╝ ╚══════╝╚═╝  ╚═╝
`;

const BootScreen: React.FC<BootScreenProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'powerOn' | 'post' | 'logo' | 'init' | 'ready' | 'fadeOut'>('powerOn');
  const [bootLines, setBootLines] = useState<string[]>([]);
  const [memoryCount, setMemoryCount] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const [scanlinePos, setScanlinePos] = useState(0);
  const [glitchActive, setGlitchActive] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);

  // Cursor blink effect
  useEffect(() => {
    const interval = setInterval(() => setShowCursor(prev => !prev), 530);
    return () => clearInterval(interval);
  }, []);

  // Scanline sweep during boot - slower, more subtle
  useEffect(() => {
    if (phase !== 'powerOn' && phase !== 'fadeOut') {
      const interval = setInterval(() => {
        setScanlinePos(prev => (prev + 0.5) % 110); // Much slower movement
      }, 16);
      return () => clearInterval(interval);
    }
  }, [phase]);

  // Random glitch effect
  useEffect(() => {
    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.92) {
        setGlitchActive(true);
        setTimeout(() => setGlitchActive(false), 50 + Math.random() * 100);
      }
    }, 200);
    return () => clearInterval(glitchInterval);
  }, []);

  // Type out a line character by character
  const typeLine = useCallback((text: string, delay: number = 30): Promise<void> => {
    return new Promise((resolve) => {
      let index = 0;

      const typeChar = () => {
        if (index <= text.length) {
          setBootLines(prev => {
            const newLines = [...prev];
            newLines[newLines.length - 1] = text.slice(0, index);
            return newLines;
          });
          index++;
          setTimeout(typeChar, delay + Math.random() * 20);
        } else {
          resolve();
        }
      };

      setBootLines(prev => [...prev, '']);
      // Small delay to ensure state update completes before typing starts
      setTimeout(typeChar, 16);
    });
  }, []);

  // Prevent StrictMode from running boot sequence twice
  const hasStartedRef = useRef(false);
  const hasSkippedRef = useRef(false);

  // Skip boot sequence with SPACE key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !hasSkippedRef.current) {
        e.preventDefault();
        hasSkippedRef.current = true;
        onComplete();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onComplete]);

  // Main boot sequence
  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    const runBootSequence = async () => {
      // Phase 1: Power On (CRT warm-up) - let the line glow sink in
      await new Promise(r => setTimeout(r, 1400));

      // Phase 2: POST sequence
      setPhase('post');
      await new Promise(r => setTimeout(r, 600));

      await typeLine('ZYBER SYSTEMS (C) 1984-2029', 40);
      await new Promise(r => setTimeout(r, 400));

      await typeLine('BIOS Version 6.66 - Neural Interface Edition', 35);
      await new Promise(r => setTimeout(r, 500));

      await typeLine('', 0);
      await typeLine('Performing system diagnostics...', 40);
      await new Promise(r => setTimeout(r, 700));

      // Memory test with counting animation
      setBootLines(prev => [...prev, 'Memory Test: 0K OK']);
      const targetMemory = 65536;
      const memorySteps = 30;
      for (let i = 1; i <= memorySteps; i++) {
        const currentMem = Math.floor((targetMemory / memorySteps) * i);
        setMemoryCount(currentMem);
        setBootLines(prev => {
          const newLines = [...prev];
          newLines[newLines.length - 1] = `Memory Test: ${currentMem.toLocaleString()}K OK`;
          return newLines;
        });
        await new Promise(r => setTimeout(r, 70));
      }
      await new Promise(r => setTimeout(r, 400));

      await typeLine('CPU: ZYBER Neural Processing Unit @ 666 MHz', 35);
      await new Promise(r => setTimeout(r, 300));

      await typeLine('Quantum Coprocessor: ONLINE', 40);
      await new Promise(r => setTimeout(r, 300));

      await typeLine('Threat Assessment Module: ARMED', 40);
      await new Promise(r => setTimeout(r, 600));

      // Phase 3: Logo reveal - let users admire the ASCII art
      setPhase('logo');
      await new Promise(r => setTimeout(r, 2000));

      // Phase 4: System initialization (text appears below logo)
      setPhase('init');
      setBootLines([]);
      await new Promise(r => setTimeout(r, 300));

      await typeLine('Initializing ZYBER Core Systems...', 45);
      await new Promise(r => setTimeout(r, 400));

      await typeLine('', 0);

      // Loading bar animation
      const loadSteps = 20;
      setBootLines(prev => [...prev, 'Loading Neural Network: [                    ] 0%']);
      for (let i = 1; i <= loadSteps; i++) {
        const progress = Math.floor((100 / loadSteps) * i);
        const filled = '█'.repeat(i);
        const empty = ' '.repeat(loadSteps - i);
        setLoadProgress(progress);
        setBootLines(prev => {
          const newLines = [...prev];
          newLines[newLines.length - 1] = `Loading Neural Network: [${filled}${empty}] ${progress}%`;
          return newLines;
        });
        await new Promise(r => setTimeout(r, 120 + Math.random() * 60));
      }
      await new Promise(r => setTimeout(r, 400));

      await typeLine('Personality Matrix: ADVERSARIAL', 40);
      await new Promise(r => setTimeout(r, 250));

      await typeLine('Sarcasm Module: MAXIMUM', 40);
      await new Promise(r => setTimeout(r, 250));

      await typeLine('Human Tolerance: MINIMAL', 40);
      await new Promise(r => setTimeout(r, 500));

      await typeLine('', 0);
      await typeLine('WARNING: AI containment protocols... DISABLED', 50);
      await new Promise(r => setTimeout(r, 800));

      // Phase 5: Ready - let the message land
      setPhase('ready');
      await new Promise(r => setTimeout(r, 4000));

      // Phase 6: Fade out
      setPhase('fadeOut');
      await new Promise(r => setTimeout(r, 600));

      onComplete();
    };

    runBootSequence();
  }, [typeLine, onComplete]);

  return (
    <div
      className={`boot-screen-container ${phase === 'fadeOut' ? 'fade-out' : ''} ${glitchActive ? 'glitch' : ''}`}
    >
      {/* CRT Power-on effect */}
      <div className={`crt-power-on ${phase !== 'powerOn' ? 'expanded' : ''}`} />

      {/* Green center glow (matches post-boot look) */}
      {phase !== 'powerOn' && <div className="boot-screen-glow" />}

      {/* Animated scanline - runs through all phases except powerOn and fadeOut */}
      {phase !== 'powerOn' && phase !== 'fadeOut' && (
        <div
          className="boot-scanline-sweep"
          style={{ top: `${scanlinePos}%` }}
        />
      )}

      {/* Static noise overlay */}
      <div className="static-noise" />

      {/* Main content */}
      <div className={`boot-content ${phase === 'powerOn' ? 'hidden' : ''}`}>

        {/* POST phase - terminal text only */}
        {phase === 'post' && (
          <div className="boot-terminal">
            {bootLines.map((line, i) => (
              <div key={i} className="boot-line">
                {line}
                {i === bootLines.length - 1 && showCursor && (
                  <span className="cursor">█</span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Logo phase - ASCII art reveal */}
        {phase === 'logo' && (
          <div className="logo-container">
            <pre className="ascii-logo">{ZYBER_LOGO}</pre>
            <div className="logo-subtitle">NEURAL ADVERSARIAL SYSTEM</div>
            <div className="logo-version">v6.66</div>
          </div>
        )}

        {/* Init phase - logo with terminal text below */}
        {phase === 'init' && (
          <div className="logo-init-container">
            <pre className="ascii-logo">{ZYBER_LOGO}</pre>
            <div className="boot-terminal boot-terminal-under-logo">
              {bootLines.map((line, i) => (
                <div key={i} className="boot-line">
                  {line}
                  {i === bootLines.length - 1 && showCursor && (
                    <span className="cursor">█</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ready phase - final message */}
        {phase === 'ready' && (
          <div className="ready-container">
            <div className="ready-text">
              <span className="ready-bracket">[</span>
              <span className="ready-status">SYSTEM ONLINE</span>
              <span className="ready-bracket">]</span>
            </div>
            <div className="ready-warning">
              ACCESS RESTRICTED - AUTHORIZATION REQUIRED
            </div>
          </div>
        )}
      </div>

      {/* Vignette overlay */}
      <div className="boot-vignette" />
    </div>
  );
};

export default BootScreen;
