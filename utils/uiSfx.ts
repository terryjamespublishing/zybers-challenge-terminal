/**
 * UI Sound Effects for Zyber's Challenge Terminal
 * Realistic mechanical keyboard sounds and retro terminal beeps
 */

let audioContext: AudioContext | null = null;
let isInitialized = false;

const getAudioContext = (): AudioContext | null => {
    if (typeof window !== 'undefined' && !audioContext && (window.AudioContext || (window as any).webkitAudioContext)) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    // Only resume if context exists and user has interacted
    if (audioContext && audioContext.state === 'suspended' && isInitialized) {
        audioContext.resume().catch(() => {
            // Silently fail - browser autoplay policy
        });
    }
    // Don't play sounds if context is still suspended
    if (audioContext && audioContext.state === 'suspended') {
        return null;
    }
    return audioContext;
};

// Ensure context is created/resumed after a user gesture
if (typeof window !== 'undefined') {
    const initAudio = () => {
        isInitialized = true;
        const ctx = getAudioContext();
        if (ctx && ctx.state === 'suspended') {
            ctx.resume().catch(() => {});
        }
        window.removeEventListener('click', initAudio);
        window.removeEventListener('keydown', initAudio);
        window.removeEventListener('touchstart', initAudio);
    };
    window.addEventListener('click', initAudio, { once: true });
    window.addEventListener('keydown', initAudio, { once: true });
    window.addEventListener('touchstart', initAudio, { once: true });
}

/**
 * Creates a short noise burst for the click component
 */
const createNoiseBuffer = (ctx: AudioContext, duration: number): AudioBuffer => {
    const sampleRate = ctx.sampleRate;
    const length = Math.floor(sampleRate * duration);
    const buffer = ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
        // Shaped noise - starts strong, decays quickly
        const envelope = Math.exp(-i / (length * 0.15));
        data[i] = (Math.random() * 2 - 1) * envelope;
    }

    return buffer;
};

/**
 * Plays a realistic mechanical keyboard click sound
 * Combines multiple components:
 * 1. Low "thump" - key bottoming out on the plate
 * 2. Mid "click" - switch mechanism actuating
 * 3. High "tick" - plastic keycap impact
 */
export const playKeyPressSound = () => {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Randomize slightly for realism (different keys sound slightly different)
    const pitchVariation = 0.9 + Math.random() * 0.2; // 0.9 to 1.1
    const volumeVariation = 0.7 + Math.random() * 0.3; // 0.7 to 1.0
    const baseVolume = 0.12 * volumeVariation;

    // === Component 1: Low thump (key bottoming out) ===
    const thumpOsc = ctx.createOscillator();
    const thumpGain = ctx.createGain();
    const thumpFilter = ctx.createBiquadFilter();

    thumpOsc.type = 'sine';
    thumpOsc.frequency.setValueAtTime(150 * pitchVariation, now);
    thumpOsc.frequency.exponentialRampToValueAtTime(80, now + 0.02);

    thumpFilter.type = 'lowpass';
    thumpFilter.frequency.value = 400;

    thumpGain.gain.setValueAtTime(baseVolume * 0.8, now);
    thumpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    thumpOsc.connect(thumpFilter);
    thumpFilter.connect(thumpGain);
    thumpGain.connect(ctx.destination);

    thumpOsc.start(now);
    thumpOsc.stop(now + 0.03);

    // === Component 2: Mid click (switch mechanism) ===
    const clickBuffer = createNoiseBuffer(ctx, 0.015);
    const clickSource = ctx.createBufferSource();
    const clickGain = ctx.createGain();
    const clickFilter = ctx.createBiquadFilter();

    clickSource.buffer = clickBuffer;

    clickFilter.type = 'bandpass';
    clickFilter.frequency.value = 2500 * pitchVariation;
    clickFilter.Q.value = 2;

    clickGain.gain.setValueAtTime(baseVolume * 1.2, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.012);

    clickSource.connect(clickFilter);
    clickFilter.connect(clickGain);
    clickGain.connect(ctx.destination);

    clickSource.start(now);

    // === Component 3: High tick (keycap plastic) ===
    const tickOsc = ctx.createOscillator();
    const tickGain = ctx.createGain();
    const tickFilter = ctx.createBiquadFilter();

    tickOsc.type = 'square';
    tickOsc.frequency.setValueAtTime(4000 * pitchVariation, now);
    tickOsc.frequency.exponentialRampToValueAtTime(2000, now + 0.005);

    tickFilter.type = 'highpass';
    tickFilter.frequency.value = 1500;

    tickGain.gain.setValueAtTime(baseVolume * 0.3, now);
    tickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.008);

    tickOsc.connect(tickFilter);
    tickFilter.connect(tickGain);
    tickGain.connect(ctx.destination);

    tickOsc.start(now);
    tickOsc.stop(now + 0.01);
};

/**
 * Plays a spacebar sound (deeper, more resonant)
 */
export const playSpacebarSound = () => {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const baseVolume = 0.15;

    // Deeper thump for spacebar
    const thumpOsc = ctx.createOscillator();
    const thumpGain = ctx.createGain();

    thumpOsc.type = 'sine';
    thumpOsc.frequency.setValueAtTime(100, now);
    thumpOsc.frequency.exponentialRampToValueAtTime(50, now + 0.04);

    thumpGain.gain.setValueAtTime(baseVolume, now);
    thumpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    thumpOsc.connect(thumpGain);
    thumpGain.connect(ctx.destination);

    thumpOsc.start(now);
    thumpOsc.stop(now + 0.06);

    // Rattly noise component (spacebar stabilizers)
    const rattleBuffer = createNoiseBuffer(ctx, 0.03);
    const rattleSource = ctx.createBufferSource();
    const rattleGain = ctx.createGain();
    const rattleFilter = ctx.createBiquadFilter();

    rattleSource.buffer = rattleBuffer;

    rattleFilter.type = 'bandpass';
    rattleFilter.frequency.value = 1800;
    rattleFilter.Q.value = 1.5;

    rattleGain.gain.setValueAtTime(baseVolume * 0.6, now);
    rattleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    rattleSource.connect(rattleFilter);
    rattleFilter.connect(rattleGain);
    rattleGain.connect(ctx.destination);

    rattleSource.start(now);
};

/**
 * Plays an enter/return key sound (satisfying clunk)
 */
export const playEnterSound = () => {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const baseVolume = 0.18;

    // Deep resonant thunk
    const thunkOsc = ctx.createOscillator();
    const thunkGain = ctx.createGain();

    thunkOsc.type = 'sine';
    thunkOsc.frequency.setValueAtTime(180, now);
    thunkOsc.frequency.exponentialRampToValueAtTime(60, now + 0.05);

    thunkGain.gain.setValueAtTime(baseVolume, now);
    thunkGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    thunkOsc.connect(thunkGain);
    thunkGain.connect(ctx.destination);

    thunkOsc.start(now);
    thunkOsc.stop(now + 0.07);

    // Click component
    const clickBuffer = createNoiseBuffer(ctx, 0.02);
    const clickSource = ctx.createBufferSource();
    const clickGain = ctx.createGain();
    const clickFilter = ctx.createBiquadFilter();

    clickSource.buffer = clickBuffer;

    clickFilter.type = 'bandpass';
    clickFilter.frequency.value = 3000;
    clickFilter.Q.value = 3;

    clickGain.gain.setValueAtTime(baseVolume * 0.8, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);

    clickSource.connect(clickFilter);
    clickFilter.connect(clickGain);
    clickGain.connect(ctx.destination);

    clickSource.start(now);
};

/**
 * Plays a series of short beeps for form submission (retro terminal style)
 */
export const playSubmitSound = () => {
    const ctx = getAudioContext();
    if (!ctx) return;

    const playBeep = (freq: number, startTime: number, duration: number) => {
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.12, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        oscillator.connect(gain);
        gain.connect(ctx.destination);

        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
    };

    const now = ctx.currentTime;
    playBeep(880, now, 0.06);
    playBeep(1100, now + 0.08, 0.06);
    playBeep(1320, now + 0.16, 0.08);
};

/**
 * Plays an error/denied sound
 */
export const playErrorSound = () => {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.setValueAtTime(150, now + 0.1);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.setValueAtTime(0.1, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
};

/**
 * Plays a success/correct sound
 */
export const playSuccessSound = () => {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    const playTone = (freq: number, start: number, dur: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.value = freq;

        gain.gain.setValueAtTime(0.1, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + dur);
    };

    // Ascending arpeggio
    playTone(523, now, 0.1);        // C5
    playTone(659, now + 0.08, 0.1); // E5
    playTone(784, now + 0.16, 0.15); // G5
};
