import React, { useState } from 'react';
import { AdminScreen, VoiceSettings } from '../../types';
import GasLeakChallenge from '../puzzles/GasLeakChallenge';
import CircuitPuzzle from '../puzzles/CircuitPuzzle';

interface PuzzleTesterProps {
  onBack: () => void;
}

interface PuzzleInfo {
  id: string;
  name: string;
  description: string;
  component: 'gas-leak' | 'circuit';
  hasDifficulty: boolean;
}

const availablePuzzles: PuzzleInfo[] = [
  {
    id: 'gas-leak',
    name: 'Gas Leak Challenge',
    description: 'Full challenge with intro, circuit puzzle, valve animation, and physical activity phase',
    component: 'gas-leak',
    hasDifficulty: false,
  },
  {
    id: 'circuit',
    name: 'Circuit Puzzle (Standalone)',
    description: 'Wire routing puzzle - connect power to valve by rotating wire segments',
    component: 'circuit',
    hasDifficulty: true,
  },
];

// Default voice settings for testing
const testVoiceSettings: VoiceSettings = {
  gender: 'male',
  language: 'en',
  vocoderEnabled: true,
  vocoderFrequency: 50,
  uiSoundsEnabled: true,
  useAdvancedEffects: true,
  voicePreset: 'zyber',
};

const PuzzleTester: React.FC<PuzzleTesterProps> = ({ onBack }) => {
  const [activePuzzle, setActivePuzzle] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<1 | 2 | 3>(1);

  const handleLaunchPuzzle = (puzzleId: string) => {
    setActivePuzzle(puzzleId);
  };

  const handlePuzzleComplete = () => {
    setActivePuzzle(null);
  };

  const handlePuzzleExit = () => {
    setActivePuzzle(null);
  };

  // Render active puzzle in CRT environment
  if (activePuzzle) {
    return (
      <div className="crt-screen min-h-screen selection:bg-primary selection:text-bg">
        <div className="crt-vignette"></div>
        <div className="crt-scanline-bar"></div>
        <div className="terminal-text p-4">
          {/* Exit button */}
          <button
            onClick={handlePuzzleExit}
            className="fixed top-4 right-4 z-50 px-4 py-2 bg-red-900/80 text-red-400 border border-red-500 rounded hover:bg-red-800 transition-colors font-mono text-sm"
          >
            [ESC] EXIT TEST
          </button>

          {/* Render the selected puzzle */}
          {activePuzzle === 'gas-leak' && (
            <GasLeakChallenge
              onComplete={handlePuzzleComplete}
              onExit={handlePuzzleExit}
              voiceSettings={testVoiceSettings}
            />
          )}
          {activePuzzle === 'circuit' && (
            <div className="flex flex-col items-center justify-center min-h-screen">
              <CircuitPuzzle
                onSolved={handlePuzzleComplete}
                difficulty={difficulty}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Puzzle selection screen
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Puzzle Tester
            </h1>
            <p className="text-slate-500 text-base mt-1">
              Test terminal-based challenges and puzzles
            </p>
          </div>
          <button
            onClick={onBack}
            className="px-5 py-2.5 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors text-base font-medium"
          >
            &larr; Back to Dashboard
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Difficulty selector */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mb-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-3">Test Settings</h2>
          <div className="flex items-center gap-4">
            <label className="text-slate-600 font-medium">Difficulty:</label>
            <div className="flex gap-2">
              {([1, 2, 3] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    difficulty === d
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {d === 1 ? 'Easy' : d === 2 ? 'Medium' : 'Hard'}
                </button>
              ))}
            </div>
            <span className="text-slate-400 text-sm ml-2">
              (Grid: {difficulty === 1 ? '5x5' : difficulty === 2 ? '6x6' : '7x7'})
            </span>
          </div>
        </div>

        {/* Puzzle list */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-800">Available Puzzles</h2>

          {availablePuzzles.map((puzzle) => (
            <div
              key={puzzle.id}
              className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center text-xl">
                      {puzzle.component === 'gas-leak' ? '🧪' : '⚡'}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-800">
                        {puzzle.name}
                      </h3>
                      {puzzle.hasDifficulty && (
                        <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
                          Difficulty: {difficulty === 1 ? 'Easy' : difficulty === 2 ? 'Medium' : 'Hard'}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-slate-500 mt-3 text-base">
                    {puzzle.description}
                  </p>
                </div>
                <button
                  onClick={() => handleLaunchPuzzle(puzzle.id)}
                  className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-base flex items-center gap-2"
                >
                  <span>Launch</span>
                  <span>&rarr;</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Info box */}
        <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-6">
          <h3 className="text-amber-800 font-semibold mb-2">Developer Notes</h3>
          <ul className="text-amber-700 text-sm space-y-1">
            <li>* Puzzles launch in full CRT terminal mode</li>
            <li>* Use the [ESC] EXIT TEST button to return here</li>
            <li>* Voice synthesis is enabled with Zyber preset</li>
            <li>* Add new puzzles to <code className="bg-amber-100 px-1 rounded">components/puzzles/</code> and register them here</li>
          </ul>
        </div>
      </main>
    </div>
  );
};

export default PuzzleTester;
