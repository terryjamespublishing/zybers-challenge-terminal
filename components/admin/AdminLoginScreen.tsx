import React, { useState, useRef, useEffect } from 'react';
import { adminLogin } from '../../services/questDataService';
import { playKeyPressSound, playEnterSound, playErrorSound, playSuccessSound } from '../../utils/uiSfx';

interface AdminLoginScreenProps {
    onLogin: () => void;
    onBack: () => void;
}

const AdminLoginScreen: React.FC<AdminLoginScreenProps> = ({ onLogin, onBack }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showCursor, setShowCursor] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const interval = setInterval(() => setShowCursor(prev => !prev), 530);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password.trim() || isProcessing) return;

        playEnterSound();
        setIsProcessing(true);
        setError('');

        // Simulate processing delay for effect
        await new Promise(r => setTimeout(r, 800));

        if (adminLogin(password)) {
            playSuccessSound();
            await new Promise(r => setTimeout(r, 300));
            onLogin();
        } else {
            playErrorSound();
            setError('ACCESS DENIED. INVALID CREDENTIALS.');
            setPassword('');
            setIsProcessing(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Escape') {
            onBack();
            return;
        }
        if (e.key === 'Enter') {
            playEnterSound();
        } else if (e.key.length === 1) {
            playKeyPressSound();
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <pre className="text-primary text-sm md:text-base mb-4" style={{ textShadow: '0 0 10px currentColor' }}>
{`
 █████╗ ██████╗ ███╗   ███╗██╗███╗   ██╗
██╔══██╗██╔══██╗████╗ ████║██║████╗  ██║
███████║██║  ██║██╔████╔██║██║██╔██╗ ██║
██╔══██║██║  ██║██║╚██╔╝██║██║██║╚██╗██║
██║  ██║██████╔╝██║ ╚═╝ ██║██║██║ ╚████║
╚═╝  ╚═╝╚═════╝ ╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝
`}
                    </pre>
                    <div className="text-xl md:text-2xl text-primary opacity-70">
                        RESTRICTED ACCESS TERMINAL
                    </div>
                    <div className="text-lg text-accent mt-2 opacity-50">
                        Authorization Required
                    </div>
                </div>

                {/* Login Form */}
                <div className="border border-primary/30 p-6 bg-black/50">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <label className="block text-primary text-lg mb-2 opacity-70">
                                ENTER ACCESS CODE:
                            </label>
                            <div
                                className="flex items-center text-2xl md:text-3xl cursor-text border-b border-primary/30 pb-2 bg-black/30 px-2 py-3"
                                onClick={() => inputRef.current?.focus()}
                            >
                                <span className="text-accent mr-2">$</span>
                                <span className="text-accent tracking-widest">
                                    {'•'.repeat(password.length)}
                                </span>
                                {showCursor && !isProcessing && (
                                    <span className="text-accent animate-pulse">▋</span>
                                )}
                                {isProcessing && (
                                    <span className="text-primary animate-pulse">...</span>
                                )}
                                <input
                                    ref={inputRef}
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    disabled={isProcessing}
                                    className="absolute -left-[9999px] opacity-0"
                                    autoFocus
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="text-red-500 text-lg mb-4 animate-pulse">
                                {error}
                            </div>
                        )}

                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={isProcessing}
                                className="flex-1 py-3 px-6 border border-primary/50 text-primary text-lg hover:bg-primary/10 hover:border-primary transition-all disabled:opacity-50"
                            >
                                {isProcessing ? 'AUTHENTICATING...' : 'AUTHENTICATE'}
                            </button>
                            <button
                                type="button"
                                onClick={onBack}
                                disabled={isProcessing}
                                className="py-3 px-6 border border-accent/50 text-accent text-lg hover:bg-accent/10 hover:border-accent transition-all disabled:opacity-50"
                            >
                                ABORT
                            </button>
                        </div>
                    </form>
                </div>

                {/* Footer hint */}
                <div className="text-center mt-6 text-primary/40 text-sm">
                    Press ESC to return to main terminal
                </div>
            </div>
        </div>
    );
};

export default AdminLoginScreen;
