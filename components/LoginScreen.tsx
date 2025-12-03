import React, { useState, useRef, useEffect, useCallback } from 'react';
import { VoiceSettings, User } from '../types';
import { playKeyPressSound, playSubmitSound, playSpacebarSound, playEnterSound, playSuccessSound } from '../utils/uiSfx';
import * as userService from '../services/userService';

type Phase = 'matrix' | 'dissolve' | 'access_granted' | 'portal' | 'name_prompt' | 'password_prompt';

interface LoginScreenProps {
  onLogin: (user: User) => void;
  voiceSettings: VoiceSettings;
}

// Matrix characters - cyber aesthetic
const MATRIX_CHARS = '01ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ@#$%<>{}[]ΔΘΛΞΠΣΦΨΩαβγδ';

interface MatrixColumn {
  x: number;
  chars: string[];
  speed: number;
  offset: number;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, voiceSettings }) => {
  const [phase, setPhase] = useState<Phase>('matrix');
  const [matrixColumns, setMatrixColumns] = useState<MatrixColumn[]>([]);
  const [dissolveProgress, setDissolveProgress] = useState(0);
  const [accessGrantedFlash, setAccessGrantedFlash] = useState(0);
  const [portalScale, setPortalScale] = useState(0);
  const [hackerName, setHackerName] = useState('');
  const [password, setPassword] = useState('');
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [glitchText, setGlitchText] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  // Initialize matrix columns
  useEffect(() => {
    const columns: MatrixColumn[] = [];
    const numColumns = Math.floor(window.innerWidth / 20);

    for (let i = 0; i < numColumns; i++) {
      const chars: string[] = [];
      const length = Math.floor(Math.random() * 20) + 10;
      for (let j = 0; j < length; j++) {
        chars.push(MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)]);
      }
      columns.push({
        x: i * 20,
        chars,
        speed: Math.random() * 2 + 1,
        offset: Math.random() * window.innerHeight,
      });
    }
    setMatrixColumns(columns);
  }, []);

  // Matrix rain animation
  useEffect(() => {
    if (phase !== 'matrix' && phase !== 'dissolve') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let frameCount = 0;
    const columnOffsets = matrixColumns.map(col => col.offset);

    const animate = () => {
      frameCount++;

      // Clear with fade effect
      ctx.fillStyle = phase === 'dissolve'
        ? `rgba(0, 0, 0, ${0.1 + dissolveProgress * 0.3})`
        : 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = '16px monospace';

      matrixColumns.forEach((col, colIndex) => {
        if (phase === 'dissolve' && Math.random() < dissolveProgress * 0.1) return;

        columnOffsets[colIndex] += col.speed;
        if (columnOffsets[colIndex] > canvas.height + col.chars.length * 20) {
          columnOffsets[colIndex] = -col.chars.length * 20;
        }

        col.chars.forEach((char, charIndex) => {
          const y = columnOffsets[colIndex] + charIndex * 20;
          if (y < 0 || y > canvas.height) return;

          // Glitch effect during dissolve
          if (phase === 'dissolve' && Math.random() < dissolveProgress * 0.3) {
            char = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
          }

          // Color gradient - brighter at the head
          const brightness = charIndex === col.chars.length - 1 ? 1 : 0.3 + (charIndex / col.chars.length) * 0.5;
          const alpha = phase === 'dissolve' ? Math.max(0, 1 - dissolveProgress * 1.5) : 1;

          if (charIndex === col.chars.length - 1) {
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
          } else {
            ctx.fillStyle = `rgba(0, ${Math.floor(180 + brightness * 75)}, ${Math.floor(40 + brightness * 30)}, ${alpha * brightness})`;
          }

          ctx.fillText(char, col.x, y);
        });
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [phase, matrixColumns, dissolveProgress]);

  // Phase transitions
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    if (phase === 'matrix') {
      // Start dissolve after 2 seconds
      timers.push(setTimeout(() => setPhase('dissolve'), 2000));
    } else if (phase === 'dissolve') {
      // Animate dissolve
      let progress = 0;
      const dissolveInterval = setInterval(() => {
        progress += 0.02;
        setDissolveProgress(progress);
        if (progress >= 1) {
          clearInterval(dissolveInterval);
          setPhase('access_granted');
        }
      }, 30);
      timers.push(dissolveInterval as unknown as NodeJS.Timeout);
    } else if (phase === 'access_granted') {
      // Flash effect
      let flash = 0;
      const flashInterval = setInterval(() => {
        flash++;
        setAccessGrantedFlash(flash);
        if (flash >= 8) {
          clearInterval(flashInterval);
          if (voiceSettings.uiSoundsEnabled) playSuccessSound();
          timers.push(setTimeout(() => setPhase('portal'), 1500));
        }
      }, 100);
      timers.push(flashInterval as unknown as NodeJS.Timeout);
    } else if (phase === 'portal') {
      // Portal scale animation
      let scale = 0;
      const portalInterval = setInterval(() => {
        scale += 0.03;
        setPortalScale(Math.min(scale, 1));
        if (scale >= 1) {
          clearInterval(portalInterval);
          timers.push(setTimeout(() => {
            setPhase('name_prompt');
          }, 500));
        }
      }, 20);
      timers.push(portalInterval as unknown as NodeJS.Timeout);

      // Glitch text effect
      const glitchInterval = setInterval(() => {
        const glitchChars = 'ZYBER CHALLENGE PORTAL ACTIVATED';
        let result = '';
        for (let i = 0; i < glitchChars.length; i++) {
          if (Math.random() < 0.1) {
            result += MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
          } else {
            result += glitchChars[i];
          }
        }
        setGlitchText(result);
      }, 50);
      timers.push(glitchInterval as unknown as NodeJS.Timeout);
    }

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [phase, voiceSettings.uiSoundsEnabled]);

  // Focus input when shown
  useEffect(() => {
    if (phase === 'name_prompt' || phase === 'password_prompt') {
      const focusInput = () => {
        inputRef.current?.focus();
      };
      // Focus immediately and after a short delay to ensure it works
      focusInput();
      const timer1 = setTimeout(focusInput, 100);
      const timer2 = setTimeout(focusInput, 300);
      const timer3 = setTimeout(focusInput, 500);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [phase]);

  // Keep input focused - refocus on any click
  const handleContainerClick = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!voiceSettings.uiSoundsEnabled) return;
    if (e.key === ' ') playSpacebarSound();
    else if (e.key === 'Enter') playEnterSound();
    else if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Delete') playKeyPressSound();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (voiceSettings.uiSoundsEnabled) playSubmitSound();
    setError(null);

    if (phase === 'name_prompt') {
      if (!hackerName.trim()) return;
      const exists = userService.doesUserExist(hackerName.trim());
      setIsExistingUser(exists);
      setPhase('password_prompt');
    } else if (phase === 'password_prompt') {
      if (!password.trim()) return;

      if (isExistingUser) {
        const user = userService.authenticateUser(hackerName.trim(), password.trim());
        if (user) {
          onLogin(user);
        } else {
          setError('AUTHENTICATION FAILED. INVALID CREDENTIALS.');
          setPassword('');
        }
      } else {
        const user = userService.registerUser(hackerName.trim(), password.trim());
        onLogin(user);
      }
    }
  };

  // Render based on phase
  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* Matrix Rain Canvas */}
      {(phase === 'matrix' || phase === 'dissolve') && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
        />
      )}

      {/* ACCESS GRANTED */}
      {phase === 'access_granted' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="text-center"
            style={{
              animation: 'pulse 0.5s ease-in-out infinite',
            }}
          >
            <div
              className="text-6xl sm:text-8xl md:text-9xl font-bold tracking-widest"
              style={{
                color: accessGrantedFlash % 2 === 0 ? '#00ff41' : '#ffffff',
                textShadow: `
                  0 0 20px ${accessGrantedFlash % 2 === 0 ? '#00ff41' : '#ffffff'},
                  0 0 40px ${accessGrantedFlash % 2 === 0 ? '#00ff41' : '#00ffff'},
                  0 0 60px ${accessGrantedFlash % 2 === 0 ? '#00ff41' : '#00ffff'},
                  0 0 80px #00ff41
                `,
                transform: `scale(${1 + (accessGrantedFlash % 2) * 0.05})`,
              }}
            >
              ACCESS
            </div>
            <div
              className="text-6xl sm:text-8xl md:text-9xl font-bold tracking-widest mt-4"
              style={{
                color: accessGrantedFlash % 2 === 0 ? '#00ffff' : '#ffffff',
                textShadow: `
                  0 0 20px ${accessGrantedFlash % 2 === 0 ? '#00ffff' : '#ffffff'},
                  0 0 40px ${accessGrantedFlash % 2 === 0 ? '#00ffff' : '#00ff41'},
                  0 0 60px ${accessGrantedFlash % 2 === 0 ? '#00ffff' : '#00ff41'},
                  0 0 80px #00ffff
                `,
                transform: `scale(${1 + (accessGrantedFlash % 2) * 0.05})`,
              }}
            >
              GRANTED
            </div>
          </div>

          {/* Scanline effect */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.2) 0px, rgba(0,0,0,0.2) 1px, transparent 1px, transparent 2px)',
            }}
          />
        </div>
      )}

      {/* Portal Animation */}
      {phase === 'portal' && (
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Outer rings */}
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full border-2 border-cyan-400"
              style={{
                width: `${(i + 1) * 150 * portalScale}px`,
                height: `${(i + 1) * 150 * portalScale}px`,
                opacity: 0.8 - i * 0.15,
                animation: `spin ${3 + i}s linear infinite ${i % 2 === 0 ? '' : 'reverse'}`,
                boxShadow: `
                  0 0 20px rgba(0, 255, 255, 0.5),
                  inset 0 0 20px rgba(0, 255, 255, 0.3)
                `,
              }}
            />
          ))}

          {/* Center glow */}
          <div
            className="absolute rounded-full"
            style={{
              width: `${100 * portalScale}px`,
              height: `${100 * portalScale}px`,
              background: 'radial-gradient(circle, rgba(0,255,255,0.8) 0%, rgba(0,255,65,0.4) 50%, transparent 70%)',
              boxShadow: '0 0 60px rgba(0, 255, 255, 0.8), 0 0 100px rgba(0, 255, 65, 0.6)',
            }}
          />

          {/* Portal text */}
          <div
            className="absolute text-2xl sm:text-3xl md:text-4xl text-cyan-400 tracking-wider"
            style={{
              top: '20%',
              opacity: portalScale,
              textShadow: '0 0 20px rgba(0, 255, 255, 0.8)',
              fontFamily: 'monospace',
            }}
          >
            {glitchText || 'ZYBER CHALLENGE PORTAL ACTIVATED'}
          </div>

          {/* Bottom text */}
          <div
            className="absolute text-lg sm:text-xl md:text-2xl text-green-400"
            style={{
              bottom: '25%',
              opacity: portalScale,
              textShadow: '0 0 10px rgba(0, 255, 65, 0.8)',
            }}
          >
            INITIALIZING NEURAL INTERFACE...
          </div>
        </div>
      )}

      {/* Name/Password Prompt */}
      {(phase === 'name_prompt' || phase === 'password_prompt') && (
        <div
          className="absolute inset-0 flex items-center justify-center cursor-text"
          onClick={handleContainerClick}
        >
          {/* Background grid effect */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(rgba(0, 255, 65, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0, 255, 65, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
              animation: 'grid-move 20s linear infinite',
            }}
          />

          <div className="text-center z-10 px-4 max-w-2xl w-full">
            {/* Portal remnants - subtle rings */}
            <div className="relative mb-12">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="absolute left-1/2 -translate-x-1/2 rounded-full border border-cyan-400/30"
                  style={{
                    width: `${(i + 1) * 100}px`,
                    height: `${(i + 1) * 100}px`,
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    animation: `spin ${5 + i * 2}s linear infinite`,
                  }}
                />
              ))}
            </div>

            {/* Main prompt */}
            <div
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-cyan-400 mb-6 tracking-wider font-bold"
              style={{
                textShadow: '0 0 30px rgba(0, 255, 255, 0.8), 0 0 60px rgba(0, 255, 255, 0.4)',
              }}
            >
              {phase === 'name_prompt' ? 'IDENTIFY YOURSELF' : (isExistingUser ? 'WELCOME BACK' : 'CREATE ACCESS CODE')}
            </div>

            <div
              className="text-2xl sm:text-3xl md:text-4xl text-green-400 mb-10 opacity-90"
              style={{
                textShadow: '0 0 15px rgba(0, 255, 65, 0.7)',
              }}
            >
              {phase === 'name_prompt'
                ? 'ENTER YOUR HACKER ALIAS'
                : (isExistingUser
                    ? `ENTER PASSWORD FOR ${hackerName.toUpperCase()}`
                    : `SET PASSWORD FOR ${hackerName.toUpperCase()}`
                  )
              }
            </div>

            {/* Input form */}
            <form onSubmit={handleSubmit} className="relative">
              <div
                className="relative mx-auto max-w-3xl border-2 border-cyan-400/50 bg-black/50 p-6 rounded"
                style={{
                  boxShadow: '0 0 20px rgba(0, 255, 255, 0.3), inset 0 0 20px rgba(0, 255, 255, 0.1)',
                }}
              >
                <div className="flex items-center justify-center">
                  <span className="text-cyan-400 text-4xl sm:text-5xl md:text-6xl mr-4">&gt;</span>
                  <span
                    className="text-green-400 text-4xl sm:text-5xl md:text-6xl tracking-wider"
                    style={{ textShadow: '0 0 15px rgba(0, 255, 65, 0.8)' }}
                  >
                    {phase === 'name_prompt' ? hackerName.toUpperCase() : password.replace(/./g, '*')}
                  </span>
                  <span className="text-green-400 text-4xl sm:text-5xl md:text-6xl animate-pulse ml-1">▋</span>
                  <input
                    ref={inputRef}
                    type={phase === 'password_prompt' ? 'password' : 'text'}
                    value={phase === 'name_prompt' ? hackerName : password}
                    onChange={(e) => phase === 'name_prompt'
                      ? setHackerName(e.target.value.toUpperCase())
                      : setPassword(e.target.value)
                    }
                    onKeyDown={handleKeyDown}
                    className="absolute opacity-0 -left-[9999px]"
                    autoFocus
                    maxLength={20}
                    autoCapitalize="none"
                    autoComplete="off"
                  />
                </div>
              </div>

              {error && (
                <div
                  className="text-red-500 mt-4 text-lg sm:text-xl animate-pulse"
                  style={{ textShadow: '0 0 10px rgba(255, 0, 0, 0.5)' }}
                >
                  {error}
                </div>
              )}

              <div className="text-green-400/70 text-xl sm:text-2xl md:text-3xl mt-8 tracking-wide">
                PRESS [ENTER] TO CONFIRM
              </div>
            </form>
          </div>

          {/* Corner decorations */}
          <div className="absolute top-4 left-4 text-cyan-400/50 text-xs sm:text-sm font-mono">
            ZYBER://PORTAL/AUTH
          </div>
          <div className="absolute top-4 right-4 text-green-400/50 text-xs sm:text-sm font-mono">
            SYS.2029.ACTIVE
          </div>
          <div className="absolute bottom-4 left-4 text-cyan-400/50 text-xs sm:text-sm font-mono">
            NEURAL_LINK: ESTABLISHED
          </div>
          <div className="absolute bottom-4 right-4 text-green-400/50 text-xs sm:text-sm font-mono">
            ENCRYPTION: AES-256
          </div>
        </div>
      )}

      {/* Global scanlines */}
      <div className="crt-scanline-bar pointer-events-none" />
      <div className="crt-vignette pointer-events-none" />

      {/* CSS animations */}
      <style>{`
        @keyframes spin {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes grid-move {
          from { background-position: 0 0; }
          to { background-position: 50px 50px; }
        }
      `}</style>
    </div>
  );
};

export default LoginScreen;
