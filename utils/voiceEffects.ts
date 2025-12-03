/**
 * Advanced Audio Effects for Synthetic Voice Processing
 * Creates a menacing robotic AI voice (think HAL 9000, GLaDOS, or Cyberdyne)
 *
 * Key improvements over previous version:
 * - Parallel formant bands instead of serial (preserves audio)
 * - Sine wave ring modulation (cleaner than sawtooth)
 * - Comb filter for metallic resonance
 * - Better distortion curve
 * - Proper effect chain ordering
 */

export interface VoiceEffectSettings {
    // Pitch shifting (lower = more menacing)
    pitchShift: number; // -12 to 12 semitones

    // Bitcrusher (lower = more digital/robotic)
    bitDepth: number; // 1-16 bits
    sampleRateReduction: number; // 1-16 (1 = no reduction, 16 = heavy reduction)

    // Formant shifting (robotic vocal characteristics)
    formantShift: number; // 0.5 to 2.0

    // Distortion (adds edge and menace)
    distortion: number; // 0-100

    // Ring modulation frequency (vocoder effect)
    ringModFrequency: number; // 30-300 Hz
    ringModMix: number; // 0-1

    // Comb filter (metallic resonance)
    combFilterDelay: number; // 1-50 ms
    combFilterFeedback: number; // 0-0.9

    // Resonant filter (robotic quality)
    filterFrequency: number; // 200-2000 Hz
    filterResonance: number; // 1-30

    // Reverb (presence and space)
    reverbAmount: number; // 0-1
    reverbDecay: number; // 0.5-5 seconds

    // Overall mix
    wetDryMix: number; // 0-1 (0 = original, 1 = fully processed)
}

export const DEFAULT_VOICE_EFFECTS: VoiceEffectSettings = {
    pitchShift: -3, // Slight lower pitch
    bitDepth: 10, // Moderate bitcrushing
    sampleRateReduction: 2, // Light sample rate reduction
    formantShift: 0.8, // Slight robotic formants
    distortion: 15, // Light distortion
    ringModFrequency: 60, // Subtle vocoder
    ringModMix: 0.3, // Light ring mod
    combFilterDelay: 8, // Metallic resonance
    combFilterFeedback: 0.4, // Moderate feedback
    filterFrequency: 1200, // Focus on vocal frequencies
    filterResonance: 4, // Moderate resonance
    reverbAmount: 0.2, // Light reverb
    reverbDecay: 1.5, // Medium tail
    wetDryMix: 0.75, // Mostly processed
};

/**
 * Creates a bitcrusher effect for digital/synthetic quality
 * Uses waveshaper for bit reduction
 */
const createBitcrusher = (
    ctx: AudioContext,
    bitDepth: number
): { input: GainNode; output: GainNode; processor: WaveShaperNode } => {
    const input = ctx.createGain();
    const output = ctx.createGain();
    const processor = ctx.createWaveShaper();

    // Clamp bit depth to valid range
    const bits = Math.max(2, Math.min(16, bitDepth));
    const step = Math.pow(0.5, bits);
    const samples = 65536;
    const curve = new Float32Array(samples);

    // Create quantization curve
    for (let i = 0; i < samples; i++) {
        const x = (i * 2) / samples - 1;
        // Quantize to step size
        curve[i] = Math.round(x / step) * step;
    }

    processor.curve = curve;
    processor.oversample = 'none';

    input.connect(processor);
    processor.connect(output);

    return { input, output, processor };
};

/**
 * Creates formant filter bank for robotic vocal characteristics
 * Uses PARALLEL bands mixed together (not serial which kills signal)
 */
const createFormantFilter = (
    ctx: AudioContext,
    shift: number,
    mix: number = 0.7
): { input: GainNode; output: GainNode; filters: BiquadFilterNode[] } => {
    const input = ctx.createGain();
    const output = ctx.createGain();
    const dryGain = ctx.createGain();
    const wetGain = ctx.createGain();
    const filterMix = ctx.createGain();

    // Dry/wet balance
    dryGain.gain.value = 1 - mix;
    wetGain.gain.value = mix;

    // Robotic formant frequencies (shifted from natural human formants)
    // These create the characteristic "robot voice" quality
    const formantBands = [
        { freq: 400, q: 10, gain: 1.0 },   // F1 - jaw/throat
        { freq: 1000, q: 12, gain: 0.8 },  // F2 - tongue position
        { freq: 2200, q: 10, gain: 0.6 },  // F3 - lip shape
        { freq: 3200, q: 8, gain: 0.4 },   // F4 - nasal
        { freq: 4500, q: 6, gain: 0.3 },   // F5 - brightness
    ];

    const filters: BiquadFilterNode[] = [];

    // Create parallel filter bank (each band processes input independently)
    formantBands.forEach(band => {
        const filter = ctx.createBiquadFilter();
        const bandGain = ctx.createGain();

        filter.type = 'bandpass';
        filter.frequency.value = band.freq * shift;
        filter.Q.value = band.q;
        bandGain.gain.value = band.gain / formantBands.length;

        input.connect(filter);
        filter.connect(bandGain);
        bandGain.connect(filterMix);
        filters.push(filter);
    });

    // Mix formant output with dry signal
    input.connect(dryGain);
    dryGain.connect(output);
    filterMix.connect(wetGain);
    wetGain.connect(output);

    return { input, output, filters };
};

/**
 * Creates a smooth distortion effect with tube-like warmth
 */
const createDistortion = (
    ctx: AudioContext,
    amount: number
): { input: GainNode; output: GainNode; shaper: WaveShaperNode } => {
    const input = ctx.createGain();
    const output = ctx.createGain();
    const shaper = ctx.createWaveShaper();

    // Create smooth saturation curve (soft clipping)
    const samples = 8192;
    const curve = new Float32Array(samples);
    const k = Math.max(0.01, amount / 100) * 50; // Scale amount

    for (let i = 0; i < samples; i++) {
        const x = (i * 2) / samples - 1;
        // Soft clipping using tanh-like curve
        curve[i] = (Math.PI + k) * x / (Math.PI + k * Math.abs(x));
    }

    shaper.curve = curve;
    shaper.oversample = '2x';

    // Pre-gain to drive into distortion
    const preGain = ctx.createGain();
    preGain.gain.value = 1 + (amount / 100) * 2;

    // Post-gain to compensate
    output.gain.value = 1 / (1 + amount / 100);

    input.connect(preGain);
    preGain.connect(shaper);
    shaper.connect(output);

    return { input, output, shaper };
};

/**
 * Creates ring modulation for vocoder-like effect
 * Uses SINE wave for cleaner, less harsh modulation
 */
const createRingModulator = (
    ctx: AudioContext,
    frequency: number,
    mix: number
): {
    input: GainNode;
    output: GainNode;
    oscillator: OscillatorNode;
    dryGain: GainNode;
    wetGain: GainNode;
} => {
    const input = ctx.createGain();
    const output = ctx.createGain();
    const dryGain = ctx.createGain();
    const wetGain = ctx.createGain();

    // Carrier oscillator - SINE for cleaner modulation
    const oscillator = ctx.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;

    // Ring modulation via gain node modulation
    const modulatorGain = ctx.createGain();
    modulatorGain.gain.value = 0; // Will be modulated by oscillator

    // Connect oscillator to control the gain
    oscillator.connect(modulatorGain.gain);

    // Set up dry/wet mix
    dryGain.gain.value = 1 - mix;
    wetGain.gain.value = mix;

    // Dry signal path
    input.connect(dryGain);
    dryGain.connect(output);

    // Wet signal path (modulated)
    input.connect(modulatorGain);
    modulatorGain.connect(wetGain);
    wetGain.connect(output);

    oscillator.start();

    return { input, output, oscillator, dryGain, wetGain };
};

/**
 * Creates a comb filter for metallic resonance
 * This adds the characteristic "robotic" metallic quality
 */
const createCombFilter = (
    ctx: AudioContext,
    delayMs: number,
    feedback: number
): {
    input: GainNode;
    output: GainNode;
    delay: DelayNode;
    feedbackGain: GainNode;
} => {
    const input = ctx.createGain();
    const output = ctx.createGain();
    const delay = ctx.createDelay(0.1); // Max 100ms
    const feedbackGain = ctx.createGain();

    delay.delayTime.value = delayMs / 1000; // Convert ms to seconds
    feedbackGain.gain.value = Math.min(0.9, Math.max(0, feedback)); // Clamp to prevent runaway

    // Comb filter topology: input -> delay -> feedback -> delay (loop)
    input.connect(output); // Direct path
    input.connect(delay);
    delay.connect(feedbackGain);
    feedbackGain.connect(delay); // Feedback loop
    delay.connect(output); // Delayed path

    return { input, output, delay, feedbackGain };
};

/**
 * Creates a lowpass filter to tame harshness
 */
const createLowpassFilter = (
    ctx: AudioContext,
    frequency: number,
    resonance: number
): { input: GainNode; output: GainNode; filter: BiquadFilterNode } => {
    const input = ctx.createGain();
    const output = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.value = frequency;
    filter.Q.value = resonance;

    input.connect(filter);
    filter.connect(output);

    return { input, output, filter };
};

/**
 * Creates a simple convolution reverb for presence
 */
const createReverb = (
    ctx: AudioContext,
    amount: number,
    decay: number
): {
    input: GainNode;
    output: GainNode;
    convolver: ConvolverNode;
    dryGain: GainNode;
    wetGain: GainNode;
} => {
    const input = ctx.createGain();
    const output = ctx.createGain();
    const convolver = ctx.createConvolver();
    const dryGain = ctx.createGain();
    const wetGain = ctx.createGain();

    // Create impulse response for reverb
    const sampleRate = ctx.sampleRate;
    const length = Math.floor(sampleRate * decay);
    const impulse = ctx.createBuffer(2, length, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
        const channelData = impulse.getChannelData(channel);
        for (let i = 0; i < length; i++) {
            // Exponential decay with filtered noise (less harsh)
            const envelope = Math.pow(1 - i / length, 2.5);
            // Low-pass filtered noise for smoother reverb
            channelData[i] = (Math.random() * 2 - 1) * envelope * 0.5;
        }
    }

    convolver.buffer = impulse;

    // Set up dry/wet mix
    dryGain.gain.value = 1 - amount;
    wetGain.gain.value = amount * 0.7; // Reduce reverb level

    // Connect dry signal
    input.connect(dryGain);
    dryGain.connect(output);

    // Connect wet signal (reverberated)
    input.connect(convolver);
    convolver.connect(wetGain);
    wetGain.connect(output);

    return { input, output, convolver, dryGain, wetGain };
};

/**
 * Main effect chain builder
 */
export interface VoiceEffectChain {
    input: GainNode;
    output: GainNode;
    nodes: {
        bitcrusher?: ReturnType<typeof createBitcrusher>;
        formantFilter?: ReturnType<typeof createFormantFilter>;
        distortion?: ReturnType<typeof createDistortion>;
        ringModulator?: ReturnType<typeof createRingModulator>;
        combFilter?: ReturnType<typeof createCombFilter>;
        lowpassFilter?: ReturnType<typeof createLowpassFilter>;
        reverb?: ReturnType<typeof createReverb>;
    };
    cleanup: () => void;
}

/**
 * Creates the complete voice effect chain
 * Order: Input -> Bitcrusher -> Ring Mod -> Comb -> Formant -> Distortion -> Lowpass -> Reverb -> Output
 */
export const createVoiceEffectChain = (
    ctx: AudioContext,
    settings: VoiceEffectSettings
): VoiceEffectChain => {
    const input = ctx.createGain();
    const output = ctx.createGain();
    const wetGain = ctx.createGain();
    const dryGain = ctx.createGain();

    wetGain.gain.value = settings.wetDryMix;
    dryGain.gain.value = 1 - settings.wetDryMix;

    // Dry signal path
    input.connect(dryGain);
    dryGain.connect(output);

    // Build wet effects chain
    let currentNode: AudioNode = input;
    const nodes: VoiceEffectChain['nodes'] = {};

    // 1. Bitcrusher (digital quality) - first to create initial digital character
    if (settings.bitDepth < 16) {
        nodes.bitcrusher = createBitcrusher(ctx, settings.bitDepth);
        currentNode.connect(nodes.bitcrusher.input);
        currentNode = nodes.bitcrusher.output;
    }

    // 2. Ring modulation (vocoder effect) - before filtering
    if (settings.ringModMix > 0) {
        nodes.ringModulator = createRingModulator(
            ctx,
            settings.ringModFrequency,
            settings.ringModMix
        );
        currentNode.connect(nodes.ringModulator.input);
        currentNode = nodes.ringModulator.output;
    }

    // 3. Comb filter (metallic resonance)
    if (settings.combFilterFeedback > 0) {
        nodes.combFilter = createCombFilter(
            ctx,
            settings.combFilterDelay,
            settings.combFilterFeedback
        );
        currentNode.connect(nodes.combFilter.input);
        currentNode = nodes.combFilter.output;
    }

    // 4. Formant filter (robotic vocal quality)
    if (settings.formantShift !== 1.0) {
        nodes.formantFilter = createFormantFilter(ctx, settings.formantShift, 0.5);
        currentNode.connect(nodes.formantFilter.input);
        currentNode = nodes.formantFilter.output;
    }

    // 5. Distortion (menacing edge)
    if (settings.distortion > 0) {
        nodes.distortion = createDistortion(ctx, settings.distortion);
        currentNode.connect(nodes.distortion.input);
        currentNode = nodes.distortion.output;
    }

    // 6. Lowpass filter (tame harshness)
    nodes.lowpassFilter = createLowpassFilter(
        ctx,
        settings.filterFrequency,
        settings.filterResonance
    );
    currentNode.connect(nodes.lowpassFilter.input);
    currentNode = nodes.lowpassFilter.output;

    // 7. Reverb (presence and space) - last in chain
    if (settings.reverbAmount > 0) {
        nodes.reverb = createReverb(ctx, settings.reverbAmount, settings.reverbDecay);
        currentNode.connect(nodes.reverb.input);
        currentNode = nodes.reverb.output;
    }

    // Final wet signal to output
    currentNode.connect(wetGain);
    wetGain.connect(output);

    // Cleanup function
    const cleanup = () => {
        if (nodes.bitcrusher) {
            nodes.bitcrusher.processor.disconnect();
        }
        if (nodes.ringModulator) {
            nodes.ringModulator.oscillator.stop();
        }
    };

    return { input, output, nodes, cleanup };
};

/**
 * Preset configurations optimized for menacing robotic AI
 */
export const VOICE_PRESETS = {
    // Zyber Default - balanced menacing robotic AI
    zyber: {
        pitchShift: -3,
        bitDepth: 10,
        sampleRateReduction: 2,
        formantShift: 0.8,
        distortion: 15,
        ringModFrequency: 55,
        ringModMix: 0.25,
        combFilterDelay: 6,
        combFilterFeedback: 0.35,
        filterFrequency: 2500,
        filterResonance: 3,
        reverbAmount: 0.15,
        reverbDecay: 1.2,
        wetDryMix: 0.7,
    } as VoiceEffectSettings,

    // HAL 9000 style - calm, clear, slightly menacing
    hal: {
        pitchShift: -2,
        bitDepth: 12,
        sampleRateReduction: 1,
        formantShift: 0.85,
        distortion: 8,
        ringModFrequency: 40,
        ringModMix: 0.15,
        combFilterDelay: 4,
        combFilterFeedback: 0.25,
        filterFrequency: 3000,
        filterResonance: 2,
        reverbAmount: 0.2,
        reverbDecay: 1.5,
        wetDryMix: 0.6,
    } as VoiceEffectSettings,

    // GLaDOS style - more synthetic, slightly unhinged
    glados: {
        pitchShift: -1,
        bitDepth: 8,
        sampleRateReduction: 3,
        formantShift: 0.75,
        distortion: 12,
        ringModFrequency: 70,
        ringModMix: 0.35,
        combFilterDelay: 8,
        combFilterFeedback: 0.45,
        filterFrequency: 2800,
        filterResonance: 5,
        reverbAmount: 0.1,
        reverbDecay: 0.8,
        wetDryMix: 0.75,
    } as VoiceEffectSettings,

    // Menacing - dark, threatening, heavy processing
    menacing: {
        pitchShift: -5,
        bitDepth: 7,
        sampleRateReduction: 3,
        formantShift: 0.65,
        distortion: 25,
        ringModFrequency: 45,
        ringModMix: 0.4,
        combFilterDelay: 10,
        combFilterFeedback: 0.5,
        filterFrequency: 2000,
        filterResonance: 6,
        reverbAmount: 0.25,
        reverbDecay: 2.0,
        wetDryMix: 0.8,
    } as VoiceEffectSettings,

    // Glitchy - unstable, corrupted, aggressive
    glitchy: {
        pitchShift: -4,
        bitDepth: 5,
        sampleRateReduction: 5,
        formantShift: 0.55,
        distortion: 35,
        ringModFrequency: 90,
        ringModMix: 0.5,
        combFilterDelay: 12,
        combFilterFeedback: 0.6,
        filterFrequency: 2200,
        filterResonance: 8,
        reverbAmount: 0.15,
        reverbDecay: 1.0,
        wetDryMix: 0.85,
    } as VoiceEffectSettings,

    // Hawking style - clear synthetic, minimal distortion
    hawking: {
        pitchShift: -2,
        bitDepth: 12,
        sampleRateReduction: 1,
        formantShift: 0.9,
        distortion: 5,
        ringModFrequency: 50,
        ringModMix: 0.2,
        combFilterDelay: 5,
        combFilterFeedback: 0.2,
        filterFrequency: 3500,
        filterResonance: 2,
        reverbAmount: 0.1,
        reverbDecay: 1.0,
        wetDryMix: 0.5,
    } as VoiceEffectSettings,

    // Minimal (for debugging/comparison)
    minimal: {
        pitchShift: 0,
        bitDepth: 16,
        sampleRateReduction: 1,
        formantShift: 1.0,
        distortion: 0,
        ringModFrequency: 60,
        ringModMix: 0,
        combFilterDelay: 5,
        combFilterFeedback: 0,
        filterFrequency: 4000,
        filterResonance: 1,
        reverbAmount: 0,
        reverbDecay: 1.0,
        wetDryMix: 0,
    } as VoiceEffectSettings,
};

/**
 * Apply pitch shift to an AudioBuffer by creating a new source with modified playbackRate
 * Note: This changes tempo too - for true pitch shift without tempo change,
 * you'd need a phase vocoder or granular synthesis implementation
 */
export const applyPitchShift = (
    source: AudioBufferSourceNode,
    semitones: number
): void => {
    const ratio = Math.pow(2, semitones / 12);
    source.playbackRate.value = ratio;
};

/**
 * Get a preset by name with fallback to zyber
 */
export const getPreset = (name: string): VoiceEffectSettings => {
    const presetName = name.toLowerCase() as keyof typeof VOICE_PRESETS;
    return VOICE_PRESETS[presetName] || VOICE_PRESETS.zyber;
};
