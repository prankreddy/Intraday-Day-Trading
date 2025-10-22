
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type ToastType = 'info' | 'success' | 'warning' | 'error';

interface ToastMessage {
    id: number;
    title: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    addToast: (toast: Omit<ToastMessage, 'id'>) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

const Toast: React.FC<{ toast: ToastMessage; onDismiss: (id: number) => void }> = ({ toast, onDismiss }) => {
    React.useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss(toast.id);
        }, 5000);
        return () => clearTimeout(timer);
    }, [toast, onDismiss]);

    const colors = {
        info: 'bg-blue-500',
        success: 'bg-green-500',
        warning: 'bg-yellow-500',
        error: 'bg-red-500',
    };

    return (
        <div
            className={`w-full max-w-sm p-4 text-white rounded-lg shadow-lg ${colors[toast.type]} transform transition-all duration-300 animate-fade-in-right`}
        >
            <div className="flex items-start">
                <div className="flex-1">
                    <p className="font-bold">{toast.title}</p>
                    <p className="text-sm">{toast.message}</p>
                </div>
                <button onClick={() => onDismiss(toast.id)} className="ml-2 text-xl font-bold">&times;</button>
            </div>
            <style>{`
                @keyframes fade-in-right {
                    from { opacity: 0; transform: translateX(100%); }
                    to { opacity: 1; transform: translateX(0); }
                }
                .animate-fade-in-right { animation: fade-in-right 0.5s ease-out forwards; }
            `}</style>
        </div>
    );
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
        setToasts((currentToasts) => [...currentToasts, { ...toast, id: Date.now() }]);
    }, []);

    const removeToast = useCallback((id: number) => {
        setToasts((currentToasts) => currentToasts.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="fixed top-4 right-4 z-50 space-y-2">
                {toasts.map((toast) => (
                    <Toast key={toast.id} toast={toast} onDismiss={removeToast} />
                ))}
            </div>
        </ToastContext.Provider>
    );
};
