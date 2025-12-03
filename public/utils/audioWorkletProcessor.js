// Audio Worklet Processor for capturing microphone audio
// This replaces the deprecated ScriptProcessorNode

class AudioCaptureProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.port.onmessage = (event) => {
      // Can receive messages from main thread if needed
      if (event.data === 'stop') {
        this.stopped = true;
        // Flush remaining buffer
        if (this.buffer.length > 0) {
          const audioChunk = new Float32Array(this.buffer);
          this.port.postMessage({ audioData: audioChunk });
          this.buffer = [];
        }
      }
    };
    this.stopped = false;
    this.buffer = [];
    this.bufferSize = 800; // 50ms at 16kHz - smaller for responsiveness
    this.frameCount = 0;
  }

  process(inputs, outputs) {
    // inputs[0] will contain the audio from the microphone
    const input = inputs[0];
    
    if (input && input.length > 0 && !this.stopped) {
      const channelData = input[0]; // Get first channel
      
      // Add to buffer
      this.buffer.push(...channelData);
      this.frameCount++;
      
      // Send when buffer is full OR every 50 frames (whichever comes first)
      if (this.buffer.length >= this.bufferSize || this.frameCount >= 50) {
        if (this.buffer.length > 0) {
          const audioChunk = new Float32Array(this.buffer);
          this.port.postMessage({ audioData: audioChunk });
          this.buffer = [];
        }
        this.frameCount = 0;
      }
    }
    
    // Return true to keep the processor alive
    return !this.stopped;
  }
}

registerProcessor('audio-capture-processor', AudioCaptureProcessor);

