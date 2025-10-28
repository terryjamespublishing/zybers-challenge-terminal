import React, { useEffect } from 'react';

export type ToastType = 'error' | 'success' | 'info' | 'warning';

interface ToastProps {
    message: string;
    type: ToastType;
    onClose: () => void;
    duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 5000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const getColors = () => {
        switch (type) {
            case 'error':
                return 'border-red-500 text-red-500 bg-red-500/10';
            case 'success':
                return 'border-primary text-primary bg-primary/10';
            case 'warning':
                return 'border-yellow-500 text-yellow-500 bg-yellow-500/10';
            case 'info':
            default:
                return 'border-accent text-accent bg-accent/10';
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'error':
                return '✗';
            case 'success':
                return '✓';
            case 'warning':
                return '⚠';
            case 'info':
            default:
                return 'ℹ';
        }
    };

    return (
        <div 
            className={`fixed bottom-4 right-4 max-w-md p-4 border-2 ${getColors()} shadow-lg animate-slide-in z-50`}
            role="alert"
            aria-live="assertive"
        >
            <div className="flex items-start gap-3">
                <span className="text-2xl">{getIcon()}</span>
                <div className="flex-1">
                    <p className="text-xl md:text-2xl whitespace-pre-wrap">{message}</p>
                </div>
                <button 
                    onClick={onClose}
                    className="text-xl md:text-2xl hover:opacity-70 focus:outline-none"
                    aria-label="Close notification"
                >
                    ×
                </button>
            </div>
        </div>
    );
};

export default Toast;

