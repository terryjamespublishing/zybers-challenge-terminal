// Audio Worklet Processor for capturing microphone audio
// This replaces the deprecated ScriptProcessorNode

class AudioCaptureProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.port.onmessage = (event) => {
      // Can receive messages from main thread if needed
      if (event.data === 'stop') {
        this.stopped = true;
      }
    };
    this.stopped = false;
  }

  process(inputs, outputs) {
    // inputs[0] will contain the audio from the microphone
    const input = inputs[0];
    
    if (input && input.length > 0 && !this.stopped) {
      const channelData = input[0]; // Get first channel
      
      // Send the audio data to the main thread
      this.port.postMessage({
        audioData: channelData
      }, [channelData.buffer]); // Transfer ownership for efficiency
    }
    
    // Return true to keep the processor alive
    return !this.stopped;
  }
}

registerProcessor('audio-capture-processor', AudioCaptureProcessor);

