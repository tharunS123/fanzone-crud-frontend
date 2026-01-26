import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((toast) => {
        const id = Date.now();
        setToasts((prev) => [...prev, { ...toast, id }]);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 5000);

        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const success = useCallback((message, title = 'Success') => {
        return addToast({ type: 'success', title, message });
    }, [addToast]);

    const error = useCallback((message, title = 'Error') => {
        return addToast({ type: 'error', title, message });
    }, [addToast]);

    const warning = useCallback((message, title = 'Warning') => {
        return addToast({ type: 'warning', title, message });
    }, [addToast]);

    const info = useCallback((message, title = 'Info') => {
        return addToast({ type: 'info', title, message });
    }, [addToast]);

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, warning, info }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
}

function ToastContainer({ toasts, removeToast }) {
    if (toasts.length === 0) return null;

    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ',
    };

    return (
        <div className="toast-container">
            {toasts.map((toast) => (
                <div key={toast.id} className={`toast toast-${toast.type}`}>
                    <span className="toast-icon">{icons[toast.type]}</span>
                    <div className="toast-content">
                        <div className="toast-title">{toast.title}</div>
                        {toast.message && <div className="toast-message">{toast.message}</div>}
                    </div>
                    <button
                        onClick={() => removeToast(toast.id)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            padding: '4px',
                            fontSize: '1rem',
                        }}
                    >
                        ✕
                    </button>
                </div>
            ))}
        </div>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}
