import React, { useEffect, useState } from 'react';

interface BootScreenProps {
  onComplete: () => void;
}

const BootScreen: React.FC<BootScreenProps> = ({ onComplete }) => {
  const [stage, setStage] = useState(0);

  const bootMessages = [
    'ZYBER SYSTEMS v1.0',
    'BIOS CHECK... OK',
    'MEMORY TEST... 640K OK',
    'LOADING NEURAL NETWORK...',
    'INITIALIZING AI CORE...',
    'SYSTEM READY'
  ];

  useEffect(() => {
    const timings = [500, 1000, 1500, 2000, 2500, 3000];

    const timer = setTimeout(() => {
      if (stage < bootMessages.length - 1) {
        setStage(stage + 1);
      } else {
        setTimeout(() => {
          onComplete();
        }, 500);
      }
    }, timings[stage] || 500);

    return () => clearTimeout(timer);
  }, [stage, onComplete]);

  return (
    <div className="boot-screen">
      <div className="boot-scanline"></div>
      <div className="text-center text-2xl md:text-4xl px-6">
        {bootMessages.slice(0, stage + 1).map((msg, i) => (
          <div 
            key={i} 
            className="mb-2"
            style={{ 
              opacity: i === stage ? 1 : 0.5,
              animation: i === stage ? 'bootFlicker 0.1s infinite' : 'none'
            }}
          >
            &gt; {msg}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BootScreen;

