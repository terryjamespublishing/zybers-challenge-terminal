// Terminal sound effects for authentic retro feel

let audioContext: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
    if (typeof window !== 'undefined' && !audioContext) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
    }
    return audioContext;
};

/**
 * Classic terminal beep - single tone
 */
export const playBeep = (frequency: number = 800, duration: number = 0.1) => {
    const ctx = getAudioContext();
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
};

/**
 * Terminal startup sound - ascending tones
 */
export const playStartupSound = () => {
    const ctx = getAudioContext();
    if (!ctx) return;

    const frequencies = [400, 600, 800];
    frequencies.forEach((freq, index) => {
        setTimeout(() => playBeep(freq, 0.15), index * 100);
    });
};

/**
 * Error beep - lower, harsher tone
 */
export const playErrorBeep = () => {
    const ctx = getAudioContext();
    if (!ctx) return;

    playBeep(200, 0.3);
    setTimeout(() => playBeep(180, 0.3), 150);
};

/**
 * Success chime - ascending pleasant tones
 */
export const playSuccessSound = () => {
    const ctx = getAudioContext();
    if (!ctx) return;

    const frequencies = [600, 800, 1000];
    frequencies.forEach((freq, index) => {
        setTimeout(() => playBeep(freq, 0.1), index * 80);
    });
};

/**
 * Typing sound - very subtle click
 */
export const playTypingSound = () => {
    const ctx = getAudioContext();
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = 1200 + Math.random() * 400;
    oscillator.type = 'square';

    gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.03);
};

/**
 * Menu navigation sound
 */
export const playNavigationSound = () => {
    playBeep(600, 0.05);
};

/**
 * Data processing sound - series of blips
 */
export const playProcessingSound = () => {
    const ctx = getAudioContext();
    if (!ctx) return;

    for (let i = 0; i < 3; i++) {
        setTimeout(() => playBeep(800 + i * 100, 0.05), i * 100);
    }
};

/**
 * Keystroke sound - mechanical key press for boot sequences
 */
export const playKeystroke = () => {
    const ctx = getAudioContext();
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = 100 + Math.random() * 50;
    oscillator.type = 'square';

    gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.02);
};

