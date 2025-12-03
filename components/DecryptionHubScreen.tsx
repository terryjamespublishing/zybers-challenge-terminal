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
        <TerminalWindow title="DECRYPTION HUB" onExit={onExit}>
            <div>
                <TypingEffect text="> Accessing system marketplace..." playSound={voiceSettings.uiSoundsEnabled} />
                <div className="my-6 text-3xl">
                    <div className="flex justify-between">
                        <span className="opacity-70">AVAILABLE_FUNDS:</span>
                        <span>{user.dataBits} DATA_BITS</span>
                    </div>
                </div>

                <div className="border-t border-primary/30 pt-4 mt-6">
                    <div className="text-3xl mb-4 opacity-70">&gt; AVAILABLE MODULES:</div>
                    <div className="text-2xl space-y-3">
                        <p className="opacity-50">&gt; System scanning for upgrades...</p>
                        <p className="opacity-50 animate-pulse">&gt; No modules currently available.</p>
                        <p className="opacity-40 text-xl mt-4">&gt; Check back soon for new terminal enhancements.</p>
                    </div>
                </div>
            </div>
        </TerminalWindow>
    );
};

export default DecryptionHubScreen;