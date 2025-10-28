import React from 'react';

interface TerminalWindowProps {
  title: string;
  children: React.ReactNode;
  onExit?: () => void;
  solidBackground?: boolean;
}

const TerminalWindow: React.FC<TerminalWindowProps> = ({ title, children, onExit, solidBackground = false }) => {
  return (
    <div className={`border-2 border-primary shadow-primary ${solidBackground ? 'bg-background' : 'bg-background/80'}`}>
      <div className="relative flex justify-center items-center bg-primary text-bg px-4 py-1">
        <h2 className="text-2xl md:text-3xl font-bold uppercase">{title}</h2>
        {onExit && (
          <button 
            onClick={onExit} 
            className="absolute top-1/2 right-2 -translate-y-1/2 text-2xl font-bold hover:bg-black/20 px-2 transition-colors rounded-sm"
            aria-label="Close window"
          >
            X
          </button>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
};

export default TerminalWindow;