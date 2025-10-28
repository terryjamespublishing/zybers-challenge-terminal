let audioContext: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
    if (typeof window !== 'undefined' && !audioContext && (window.AudioContext || (window as any).webkitAudioContext)) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    // Resume context on first user gesture if it's suspended
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
    }
    return audioContext;
};

// Ensure context is created/resumed after a user gesture
if (typeof window !== 'undefined') {
    const initAudio = () => {
        getAudioContext();
        window.removeEventListener('click', initAudio);
        window.removeEventListener('keydown', initAudio);
    };
    window.addEventListener('click', initAudio);
    window.addEventListener('keydown', initAudio);
}


/**
 * Plays a subtle, retro keyboard click sound with varying pitch.
 */
export const playKeyPressSound = () => {
    const ctx = getAudioContext();
    if (!ctx) return;

    // White noise source
    const bufferSize = ctx.sampleRate * 0.05; // 50ms is enough for a click
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1; // Generate white noise
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    // Filter to shape the noise into a "click"
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    // A resonant frequency that sounds like a mechanical switch
    filter.frequency.value = 3000 + Math.random() * 1000; // Vary between 3k-4k Hz
    filter.Q.value = 15; // A high Q makes it more 'tick' like

    // Gain envelope for a very short, sharp sound
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.03);

    // Connect the audio graph
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    // Play the sound
    noise.start(ctx.currentTime);
    noise.stop(ctx.currentTime + 0.03);
};


/**
 * Plays a series of short beeps for form submission.
 */
export const playSubmitSound = () => {
    const ctx = getAudioContext();
    if (!ctx) return;

    const playBeep = (freq: number, startTime: number, duration: number) => {
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.15, startTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
        
        oscillator.connect(gain);
        gain.connect(ctx.destination);

        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
    };

    const now = ctx.currentTime;
    playBeep(1200, now, 0.05);
    playBeep(1500, now + 0.08, 0.05);
};
