import React from 'react';

const SettingsIcon: React.FC<{ onClick: () => void }> = ({ onClick }) => {
    return (
        <button 
            onClick={onClick} 
            className="absolute top-2 right-2 z-50 text-primary hover:text-accent focus:outline-none transition-colors text-sm opacity-70 hover:opacity-100"
            aria-label="System configuration"
        >
            [CONFIG]
        </button>
    );
};

export default SettingsIcon;