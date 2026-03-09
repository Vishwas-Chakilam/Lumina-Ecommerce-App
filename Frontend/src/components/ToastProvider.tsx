import { createContext, useCallback, useContext, useRef, useState, ReactNode } from 'react';
import { X, CheckCircle2, Info, AlertTriangle } from 'lucide-react';

type ToastVariant = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  title?: string;
  message: string;
  variant: ToastVariant;
}

interface ShowToastOptions {
  title?: string;
  message: string;
  variant?: ToastVariant;
  durationMs?: number;
}

interface ToastContextValue {
  showToast: (options: ShowToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const removeToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    ({ title, message, variant = 'info', durationMs = 3500 }: ShowToastOptions) => {
      idRef.current += 1;
      const id = idRef.current;

      setToasts((current) => [...current, { id, title, message, variant }]);

      if (durationMs > 0) {
        window.setTimeout(() => {
          removeToast(id);
        }, durationMs);
      }
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full">
        {toasts.map((toast) => {
          const iconClasses = 'w-5 h-5';
          const baseClasses =
            'pointer-events-auto flex w-full items-start gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur bg-white/95';

          const variantClasses =
            toast.variant === 'success'
              ? 'border-emerald-200'
              : toast.variant === 'error'
              ? 'border-red-200'
              : 'border-sky-200';

          const accentClasses =
            toast.variant === 'success'
              ? 'bg-emerald-100 text-emerald-700'
              : toast.variant === 'error'
              ? 'bg-red-100 text-red-700'
              : 'bg-sky-100 text-sky-700';

          const titleText =
            toast.title ||
            (toast.variant === 'success'
              ? 'Success'
              : toast.variant === 'error'
              ? 'Something went wrong'
              : 'Notice');

          return (
            <div key={toast.id} className={`${baseClasses} ${variantClasses}`}>
              <div className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-full ${accentClasses}`}>
                {toast.variant === 'success' && <CheckCircle2 className={iconClasses} />}
                {toast.variant === 'error' && <AlertTriangle className={iconClasses} />}
                {toast.variant === 'info' && <Info className={iconClasses} />}
              </div>
              <div className="flex-1 space-y-0.5">
                <p className="text-sm font-semibold text-gray-900">{titleText}</p>
                <p className="text-xs text-gray-600">{toast.message}</p>
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="mt-0.5 text-gray-400 hover:text-gray-600"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

