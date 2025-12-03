import React, { useState, useRef, useEffect, useCallback } from 'react';
import { VoiceSettings, User } from '../types';
import { playKeyPressSound, playSubmitSound, playSpacebarSound, playEnterSound, playSuccessSound } from '../utils/uiSfx';
import * as userService from '../services/userService';

type Phase = 'matrix' | 'name_prompt' | 'password_prompt';

interface LoginScreenProps {
  onLogin: (user: User) => void;
  voiceSettings: VoiceSettings;
}

// Hacker-style characters - hex, binary, symbols, and glyphs
const HACKER_CHARS = '0123456789ABCDEFabcdef!@#$%^&*(){}[]<>|/\\~`+=_-:;?░▒▓█▀▄▌▐├┤┬┴┼─│┌┐└┘◄►▲▼○●◘◙';

interface MatrixColumn {
  x: number;
  chars: string[];
  speed: number;
  offset: number;
  mutationRate: number; // How often chars change
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, voiceSettings }) => {
  const [phase, setPhase] = useState<Phase>('matrix');
  const [matrixColumns, setMatrixColumns] = useState<MatrixColumn[]>([]);
  const [hackerName, setHackerName] = useState('');
  const [password, setPassword] = useState('');
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  // Initialize matrix columns - scattered across screen
  useEffect(() => {
    const columns: MatrixColumn[] = [];
    const numColumns = Math.floor(window.innerWidth / 14); // More columns, tighter spacing

    for (let i = 0; i < numColumns; i++) {
      const chars: string[] = [];
      const length = Math.floor(Math.random() * 20) + 10;
      for (let j = 0; j < length; j++) {
        chars.push(HACKER_CHARS[Math.floor(Math.random() * HACKER_CHARS.length)]);
      }
      columns.push({
        x: i * 14,
        chars,
        speed: Math.random() * 4 + 3, // Fast falling
        offset: Math.random() * window.innerHeight * 2 - window.innerHeight, // Scattered start positions
        mutationRate: Math.random() * 0.3 + 0.1, // Each column mutates at different rate
      });
    }
    setMatrixColumns(columns);
  }, []);

  // Matrix rain animation - runs through all phases, always visible
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let frameCount = 0;
    const columnOffsets = matrixColumns.map(col => col.offset);
    // Create mutable copy of chars for each column
    const columnChars = matrixColumns.map(col => [...col.chars]);

    const animate = () => {
      frameCount++;

      // Clear with minimal fade - keeps characters sharp and visible
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = 'bold 12px monospace';

      matrixColumns.forEach((col, colIndex) => {
        // Move column down
        columnOffsets[colIndex] += col.speed;
        if (columnOffsets[colIndex] > canvas.height + col.chars.length * 16) {
          columnOffsets[colIndex] = -col.chars.length * 16;
        }

        // Randomly mutate characters - the hacker effect!
        if (Math.random() < col.mutationRate) {
          const mutateIndex = Math.floor(Math.random() * columnChars[colIndex].length);
          columnChars[colIndex][mutateIndex] = HACKER_CHARS[Math.floor(Math.random() * HACKER_CHARS.length)];
        }

        columnChars[colIndex].forEach((char, charIndex) => {
          const y = columnOffsets[colIndex] + charIndex * 16;
          if (y < -16 || y > canvas.height + 16) return;

          // Flicker effect - random brightness variation
          const flicker = 0.7 + Math.random() * 0.3;
          const brightness = charIndex === columnChars[colIndex].length - 1 ? 1 : 0.4 + (charIndex / columnChars[colIndex].length) * 0.4;

          if (charIndex === columnChars[colIndex].length - 1) {
            // Bright head character
            ctx.fillStyle = `rgba(200, 255, 200, ${flicker})`;
          } else if (charIndex >= columnChars[colIndex].length - 3) {
            // Near-head chars are brighter
            ctx.fillStyle = `rgba(0, 255, 65, ${brightness * flicker})`;
          } else {
            // Tail chars are dimmer green
            ctx.fillStyle = `rgba(0, ${Math.floor(150 + brightness * 80)}, ${Math.floor(30 + brightness * 20)}, ${brightness * flicker * 0.8})`;
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
  }, [matrixColumns]); // Removed phase dependency - always runs the same way

  // Phase transitions - simplified, no dissolve
  useEffect(() => {
    if (phase === 'matrix') {
      // Show matrix for 3 seconds then reveal login prompt
      const timer = setTimeout(() => {
        if (voiceSettings.uiSoundsEnabled) playSuccessSound();
        setPhase('name_prompt');
      }, 3000);
      return () => clearTimeout(timer);
    }
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
      {/* Matrix Rain Canvas - always visible behind content */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{
          opacity: phase === 'name_prompt' || phase === 'password_prompt' ? 0.6 : 1,
          transition: 'opacity 0.5s ease-out',
        }}
      />

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
            {/* Main prompt */}
            <div
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-primary/70 mb-6 tracking-wider font-bold"
              style={{
                textShadow: '0 0 20px rgba(0, 255, 65, 0.4), 0 0 40px rgba(0, 255, 65, 0.2)',
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
                className="relative mx-auto max-w-3xl border-2 border-cyan-400/50 bg-black/80 p-6 rounded"
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
        @keyframes grid-move {
          from { background-position: 0 0; }
          to { background-position: 50px 50px; }
        }
      `}</style>
    </div>
  );
};

export default LoginScreen;
