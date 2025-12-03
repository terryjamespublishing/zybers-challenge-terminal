import React, { useState, useEffect, useCallback, useRef } from 'react';
import { VoiceSettings } from '../../types';
import CircuitPuzzle from './CircuitPuzzle';
import ChallengeTimer from '../ChallengeTimer';
import StreamingTypingEffect from '../StreamingTypingEffect';
import { speakAIResponse, stopSpeaking } from '../../utils/lowTechVoice';

interface GasLeakChallengeProps {
  onComplete: () => void;
  onExit: () => void;
  voiceSettings: VoiceSettings;
}

type Phase = 'intro' | 'puzzle' | 'valve_closing' | 'physical_challenge' | 'complete';

const GasLeakChallenge: React.FC<GasLeakChallengeProps> = ({
  onComplete,
  onExit,
  voiceSettings,
}) => {
  const [phase, setPhase] = useState<Phase>('intro');
  const [introStep, setIntroStep] = useState(0);
  const [valveRotation, setValveRotation] = useState(0);
  const [gasLevel, setGasLevel] = useState(45);
  const [showWarning, setShowWarning] = useState(true);

  // Speech-synced text display
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [speechComplete, setSpeechComplete] = useState(false);
  const isSpeakingRef = useRef(false);

  // Toxicity level increases over time until puzzle is solved
  useEffect(() => {
    if (phase === 'valve_closing' || phase === 'physical_challenge' || phase === 'complete') return;
    if (gasLevel >= 99) return;

    const interval = setInterval(() => {
      setGasLevel(prev => {
        const increase = 0.3 + Math.random() * 0.4; // Random increase for tension
        return Math.min(99, prev + increase);
      });
    }, 500);

    return () => clearInterval(interval);
  }, [phase, gasLevel]);

  const introMessages = [
    "[ALARM] CRITICAL ALERT DETECTED...",
    "[SINISTER] Well, well, well... look who decided to show up.",
    "[CALCULATING] I've detected a MASSIVE gas leak in Sector 7. Toxic fumes spreading rapidly.",
    "[MOCKING] The automatic shutoff? Oh, I disabled that. Seemed too... easy.",
    "[NEUTRAL] The only way to close the valve is through the manual override circuit.",
    "[CALCULATING] You'll need to reroute power through the mainframe grid to engage the valve motor.",
    "[MOCKING] Click the wire segments to rotate them. Connect POWER to VALVE. Simple, yes?",
    "[SINISTER] You have 30 minutes before the facility is... uninhabitable. Good luck, human.▋",
  ];

  // Flash warning effect
  useEffect(() => {
    const interval = setInterval(() => {
      setShowWarning(prev => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Speak intro messages with synchronized text display
  useEffect(() => {
    if (phase === 'intro' && introStep < introMessages.length && !isSpeakingRef.current) {
      isSpeakingRef.current = true;
      setCurrentCharIndex(0);
      setSpeechComplete(false);

      const speakMessage = async () => {
        try {
          await speakAIResponse(
            introMessages[introStep],
            voiceSettings.language,
            // Progress callback - syncs text display with speech
            (charIndex: number) => {
              setCurrentCharIndex(charIndex);
            }
          );
          // Mark speech complete so full text shows
          setSpeechComplete(true);
          isSpeakingRef.current = false;

          // Auto-advance after speech
          setTimeout(() => {
            if (introStep < introMessages.length - 1) {
              setIntroStep(prev => prev + 1);
            } else {
              setPhase('puzzle');
            }
          }, 500);
        } catch (e) {
          // If speech fails, show full text and advance
          setSpeechComplete(true);
          isSpeakingRef.current = false;
          setTimeout(() => {
            if (introStep < introMessages.length - 1) {
              setIntroStep(prev => prev + 1);
            } else {
              setPhase('puzzle');
            }
          }, 2000);
        }
      };
      speakMessage();
    }
  }, [phase, introStep, voiceSettings.language]);

  // Cleanup speech on unmount
  useEffect(() => {
    return () => stopSpeaking();
  }, []);

  // Valve closing animation
  useEffect(() => {
    if (phase === 'valve_closing') {
      const rotateInterval = setInterval(() => {
        setValveRotation(prev => {
          if (prev >= 360) {
            clearInterval(rotateInterval);
            return 360;
          }
          return prev + 10;
        });
      }, 50);

      const gasInterval = setInterval(() => {
        setGasLevel(prev => {
          if (prev <= 0) {
            clearInterval(gasInterval);
            setTimeout(() => setPhase('physical_challenge'), 1000);
            return 0;
          }
          return prev - 2;
        });
      }, 100);

      // Speak success
      speakAIResponse("[GRUDGING] You actually did it. The valve is closing...", voiceSettings.language);

      return () => {
        clearInterval(rotateInterval);
        clearInterval(gasInterval);
      };
    }
  }, [phase, voiceSettings.language]);

  const handlePuzzleSolved = useCallback(() => {
    setPhase('valve_closing');
  }, []);

  const handleTimeUp = useCallback(() => {
    speakAIResponse("[TRIUMPHANT] Time's up! The facility has been evacuated. You failed, human.", voiceSettings.language);
  }, [voiceSettings.language]);

  const skipIntro = () => {
    stopSpeaking();
    isSpeakingRef.current = false;
    setPhase('puzzle');
  };

  // Render gas leak visual effect
  const renderGasEffect = () => (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{
        background: `radial-gradient(ellipse at bottom, rgba(100, 255, 100, ${gasLevel * 0.002}) 0%, transparent 70%)`,
        transition: 'background 0.5s',
        zIndex: 0,
      }}
    >
      {/* Floating gas particles */}
      {gasLevel > 0 && [...Array(Math.floor(gasLevel / 10))].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-green-500/20"
          style={{
            width: Math.random() * 20 + 10,
            height: Math.random() * 20 + 10,
            left: `${Math.random() * 100}%`,
            bottom: `${Math.random() * 50}%`,
            animation: `float ${3 + Math.random() * 2}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 2}s`,
          }}
        />
      ))}
    </div>
  );

  // Render valve visual
  const renderValve = () => (
    <div className="relative w-24 h-24 mx-auto my-2">
      {/* Pipe */}
      <div className="absolute top-1/2 left-0 right-0 h-6 -translate-y-1/2 bg-gray-700 border-2 border-gray-600" />

      {/* Valve body */}
      <div
        className="absolute top-1/2 left-1/2 w-16 h-16 -translate-x-1/2 -translate-y-1/2 rounded-full border-4"
        style={{
          borderColor: gasLevel > 0 ? 'rgb(239, 68, 68)' : 'rgb(0, 255, 65)',
          background: 'rgba(0, 20, 0, 0.9)',
          boxShadow: gasLevel > 0
            ? '0 0 15px rgba(239, 68, 68, 0.5)'
            : '0 0 15px rgba(0, 255, 65, 0.5)',
        }}
      >
        {/* Valve handle */}
        <div
          className="absolute top-1/2 left-1/2 w-12 h-2 bg-gray-500 -translate-x-1/2 -translate-y-1/2 rounded"
          style={{
            transform: `translate(-50%, -50%) rotate(${valveRotation}deg)`,
            transition: 'transform 0.1s linear',
          }}
        >
          <div className="absolute left-0 top-1/2 w-3 h-3 bg-gray-400 rounded-full -translate-y-1/2" />
          <div className="absolute right-0 top-1/2 w-3 h-3 bg-gray-400 rounded-full -translate-y-1/2" />
        </div>
      </div>

      {/* Status text */}
      <div className={`absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-bold ${
        gasLevel > 0 ? 'text-red-500' : 'text-primary'
      }`}>
        {gasLevel > 0 ? 'OPEN' : 'CLOSED'}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen relative">
      {/* Full-screen timer background */}
      <ChallengeTimer
        durationMinutes={30}
        onTimeUp={handleTimeUp}
        isPaused={phase === 'complete'}
      />

      {/* Warning banner - at very top */}
      {gasLevel > 0 && (
        <div
          className={`fixed top-0 left-0 right-0 py-3 text-center font-bold z-50 ${
            showWarning ? 'opacity-100' : 'opacity-70'
          }`}
          style={{
            background: 'rgba(0, 0, 0, 0.85)',
            borderBottom: '2px solid rgb(255, 60, 60)',
            boxShadow: '0 4px 20px rgba(255, 0, 0, 0.3)',
          }}
        >
          <span
            className="text-lg md:text-xl tracking-wider font-mono"
            style={{
              color: '#ff5555',
              textShadow: '0 0 8px rgba(255, 50, 50, 0.6)',
            }}
          >
            ⚠ GAS LEAK DETECTED - SECTOR 7 - TOXICITY LEVEL: <span className="text-2xl md:text-3xl" style={{ color: '#ff3333' }}>{Math.floor(gasLevel)}%</span> ⚠
          </span>
        </div>
      )}

      {/* Gas effect */}
      {renderGasEffect()}

      {/* Main content */}
      <div className="relative z-10 pt-16 px-4 pb-24">
        {/* INTRO PHASE */}
        {phase === 'intro' && (
          <div className="max-w-4xl mx-auto px-4">
            <div className="font-mono text-xl md:text-2xl lg:text-3xl text-primary">
              {introMessages.slice(0, introStep + 1).map((msg, i) => (
                <div
                  key={i}
                  className="mb-4"
                  style={{ textShadow: '0 0 5px rgba(0, 255, 65, 0.7)' }}
                >
                  <StreamingTypingEffect
                    text={msg}
                    charIndex={i === introStep ? currentCharIndex : 9999}
                    isComplete={i < introStep || (i === introStep && speechComplete)}
                  />
                </div>
              ))}
            </div>

            <button
              onClick={skipIntro}
              className="mt-6 px-4 py-2 border border-primary/50 text-primary/70 hover:bg-primary/10 text-sm"
            >
              [SKIP INTRO]
            </button>
          </div>
        )}

        {/* PUZZLE PHASE */}
        {phase === 'puzzle' && (
          <div className="max-w-2xl mx-auto">
            {/* Circuit puzzle - full focus */}
            <CircuitPuzzle onSolved={handlePuzzleSolved} difficulty={2} />

            {/* Exit button */}
            <div className="text-center mt-6">
              <button
                onClick={onExit}
                className="px-4 py-2 border border-primary/30 text-primary/50 hover:bg-primary/10 text-sm"
              >
                [ABORT MISSION]
              </button>
            </div>
          </div>
        )}

        {/* VALVE CLOSING PHASE */}
        {phase === 'valve_closing' && (
          <div className="max-w-xl mx-auto text-center">
            <div className="text-primary text-3xl mb-4 animate-pulse">
              VALVE ENGAGING...
            </div>

            {renderValve()}

            {/* Gas level dropping */}
            <div className="max-w-md mx-auto my-8">
              <div className="flex justify-between text-sm mb-1">
                <span className={gasLevel > 20 ? 'text-red-500' : 'text-primary'}>
                  GAS LEVEL
                </span>
                <span className={gasLevel > 20 ? 'text-red-500' : 'text-primary'}>
                  {gasLevel}%
                </span>
              </div>
              <div className="h-4 bg-gray-800 border border-primary/50">
                <div
                  className="h-full transition-all"
                  style={{
                    width: `${gasLevel}%`,
                    background: gasLevel > 50 ? 'rgb(239, 68, 68)' :
                               gasLevel > 20 ? 'rgb(245, 158, 11)' : 'rgb(0, 255, 65)',
                  }}
                />
              </div>
            </div>

            <div className="text-accent text-xl">
              EVACUATING TOXIC FUMES...
            </div>
          </div>
        )}

        {/* PHYSICAL CHALLENGE PHASE */}
        {phase === 'physical_challenge' && (
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-8">
              <div
                className="text-primary text-4xl md:text-5xl mb-2"
                style={{ textShadow: '0 0 20px rgba(0, 255, 65, 0.8)' }}
              >
                VALVE SECURED
              </div>
              <div className="text-accent text-xl">Gas leak contained. Sector 7 is safe.</div>
            </div>

            <div className="font-mono text-xl md:text-2xl lg:text-3xl text-primary mb-8">
              <div style={{ textShadow: '0 0 5px rgba(0, 255, 65, 0.7)' }}>
                <StreamingTypingEffect
                  text="[CALCULATING] Impressive. But the gas leak damaged the chemical storage..."
                  charIndex={9999}
                  isComplete={true}
                />
              </div>
            </div>

            <div className="mt-8 p-6 border border-accent/50 bg-accent/5">
              <div className="text-accent font-bold text-2xl mb-4">PHYSICAL MISSION:</div>
              <div className="text-primary/90 text-lg mb-6">
                The pressure release valve requires a controlled chemical reaction.
                You must create a CO2 gas generator to safely release the pressure.
              </div>

              <div className="text-primary/70 mb-6">
                <div className="font-bold text-primary text-lg mb-3">MATERIALS NEEDED:</div>
                <ul className="list-disc list-inside space-y-2 text-base">
                  <li>Baking soda (sodium bicarbonate)</li>
                  <li>Vinegar (acetic acid)</li>
                  <li>A balloon</li>
                  <li>A small bottle</li>
                  <li>A funnel</li>
                </ul>
              </div>

              <div className="text-primary/70">
                <div className="font-bold text-primary text-lg mb-3">INSTRUCTIONS:</div>
                <ol className="list-decimal list-inside space-y-2 text-base">
                  <li>Pour 50ml of vinegar into the bottle</li>
                  <li>Use the funnel to put 2 tablespoons of baking soda into the balloon</li>
                  <li>Stretch the balloon opening over the bottle top (don't let the baking soda fall in yet)</li>
                  <li>Lift the balloon to drop the baking soda into the vinegar</li>
                  <li>Watch the chemical reaction inflate the balloon!</li>
                </ol>
              </div>
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={onComplete}
                className="px-8 py-4 border-2 border-primary text-primary text-2xl hover:bg-primary/20 transition-colors"
              >
                [MISSION COMPLETE]
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Floating animation keyframes */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
          50% { transform: translateY(-20px) translateX(10px); opacity: 0.6; }
        }
      `}</style>
    </div>
  );
};

export default GasLeakChallenge;
