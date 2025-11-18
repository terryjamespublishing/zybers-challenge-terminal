import React from 'react';

interface TerminalWindowProps {
  title: string;
  children: React.ReactNode;
  onExit?: () => void;
  solidBackground?: boolean;
}

const TerminalWindow: React.FC<TerminalWindowProps> = ({ title, children, onExit, solidBackground = false }) => {
  return (
    <div className="terminal-window h-full flex flex-col px-6">
      {title && (
        <div className="flex justify-between items-center mb-2 pb-1 border-b border-primary/30 flex-shrink-0">
          <h2 className="text-2xl md:text-4xl uppercase tracking-wider opacity-70">{title}</h2>
          {onExit && (
            <button
              onClick={onExit}
              className="text-2xl md:text-4xl hover:text-accent transition-colors"
              aria-label="Exit"
            >
              [EXIT]
            </button>
          )}
        </div>
      )}
      <div className="flex-grow flex flex-col overflow-hidden">{children}</div>
    </div>
  );
};

export default TerminalWindow;