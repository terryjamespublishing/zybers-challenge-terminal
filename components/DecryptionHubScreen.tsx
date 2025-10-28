import React from 'react';
import { VoiceSettings, User } from '../types';
import TerminalWindow from './TerminalWindow';
import TypingEffect from './TypingEffect';

interface DecryptionHubScreenProps {
    onExit: () => void;
    user: User;
    voiceSettings: VoiceSettings;
}

const DecryptionHubScreen: React.FC<DecryptionHubScreenProps> = ({
    onExit,
    user,
    voiceSettings
}) => {
    return (
        <TerminalWindow title="DECRYPTION_HUB" onExit={onExit}>
            <div className="p-4">
                <TypingEffect text="> Welcome to the Decryption Hub. Spend your Data Bits on terminal upgrades." playSound={voiceSettings.uiSoundsEnabled} />
                <div className="my-4 border border-primary p-2 text-2xl md:text-3xl">
                    AVAILABLE DATA BITS: {user.dataBits} DB
                </div>

                <h3 className="text-2xl md:text-3xl mt-6 mb-2 text-accent">:: TERMINAL UPGRADES ::</h3>
                <div className="border-2 border-primary/50 p-4 text-xl md:text-2xl">
                    <p className="opacity-70">More terminal upgrades will be available soon.</p>
                    <p className="opacity-70 animate-pulse">CHECKING FOR NEW MODULES...</p>
                </div>
            </div>
        </TerminalWindow>
    );
};

export default DecryptionHubScreen;