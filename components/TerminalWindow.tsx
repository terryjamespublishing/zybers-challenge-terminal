import React from 'react';

interface TerminalWindowProps {
  title: string;
  children: React.ReactNode;
  onExit?: () => void;
  solidBackground?: boolean;
}

const TerminalWindow: React.FC<TerminalWindowProps> = ({ title, children, onExit, solidBackground = false }) => {
  return (
    <div className="terminal-window">
      {title && (
        <div className="flex justify-between items-center mb-2 pb-1 border-b border-primary/30">
          <h2 className="text-xl md:text-2xl uppercase tracking-wider opacity-70">{title}</h2>
          {onExit && (
            <button 
              onClick={onExit} 
              className="text-xl hover:text-accent transition-colors"
              aria-label="Exit"
            >
              [EXIT]
            </button>
          )}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
};

export default TerminalWindow;