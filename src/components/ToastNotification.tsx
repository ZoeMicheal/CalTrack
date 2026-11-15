import { useEffect, useState } from 'react';
import './ToastNotification.css';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

type ToastData = {
    id: number;
    message: string;
    type: ToastType;
};

let nextToastId = 0;

export function showToast(
    message: string,
    type: ToastType = 'info'
) {
    window.dispatchEvent(
        new CustomEvent('caltrack-toast', {
            detail: {
                id: ++nextToastId,
                message,
                type,
            },
        })
    );
}

export default function ToastNotification() {
    const [toasts, setToasts] = useState<ToastData[]>([]);

    useEffect(() => {
        const handleToast = (event: Event) => {
            const toast = (event as CustomEvent<ToastData>).detail;

            setToasts((current) => [...current, toast]);
        };

        window.addEventListener('caltrack-toast', handleToast);

        return () => {
            window.removeEventListener('caltrack-toast', handleToast);
        };
    }, []);

    const removeToast = (id: number) => {
        setToasts((current) =>
            current.filter((toast) => toast.id !== id)
        );
    };

    return (
        <div className="caltrack-toast-container">
            {toasts.map((toast) => (
                <ToastItem
                    key={toast.id}
                    toast={toast}
                    onClose={() => removeToast(toast.id)}
                />
            ))}
        </div>
    );
}

function ToastItem({
                       toast,
                       onClose,
                   }: {
    toast: ToastData;
    onClose: () => void;
}) {
    useEffect(() => {
        const timer = window.setTimeout(onClose, 4000);

        return () => window.clearTimeout(timer);
    }, [onClose]);

    return (
        <div
            className={`caltrack-toast caltrack-toast-${toast.type}`}
            role={toast.type === 'error' ? 'alert' : 'status'}
        >
            <span className="caltrack-toast-icon">
                {toast.type === 'success' ? '✓' :
                    toast.type === 'error' ? '!' :
                        toast.type === 'warning' ? '⚠' : 'i'}
            </span>

            <div className="caltrack-toast-content">
                <strong>
                    {toast.type === 'success' ? 'Success!' :
                        toast.type === 'error' ? 'Error' :
                            toast.type === 'warning' ? 'Warning' : 'Notice'}
                </strong>
                <p>{toast.message}</p>
            </div>

            <button
                type="button"
                className="caltrack-toast-close"
                onClick={onClose}
                aria-label="Close notification"
            >
                ×
            </button>
        </div>
    );
}
