import * as React from 'react';
import { cn } from '../../lib/utils';
import { X } from 'lucide-react';

interface ToastProps {
  title: string;
  description?: string;
  type?: 'default' | 'success' | 'error' | 'warning';
  duration?: number;
  onClose: () => void;
}

const toastStyles = {
  default: 'bg-white border-gray-200',
  success: 'bg-green-50 border-green-200',
  error: 'bg-red-50 border-red-200',
  warning: 'bg-yellow-50 border-yellow-200',
};

function Toast({
  title,
  description,
  type = 'default',
  duration = 3000,
  onClose,
}: ToastProps) {
  React.useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 w-full max-w-sm rounded-lg border p-4 shadow-lg',
        'animate-in slide-in-from-bottom-5',
        toastStyles[type]
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h3 className="font-medium">{title}</h3>
          {description && (
            <p className="mt-1 text-sm text-gray-600">{description}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

interface ToastContextType {
  show: (props: Omit<ToastProps, 'onClose'>) => void;
}

const ToastContext = React.createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Array<ToastProps & { id: string }>>(
    []
  );

  const show = React.useCallback(
    (props: Omit<ToastProps, 'onClose'>) => {
      const id = Math.random().toString(36).substr(2, 9);
      setToasts((current) => [...current, { ...props, id, onClose: () => 
        setToasts((current) => current.filter((t) => t.id !== id))
      }]);
    },
    []
  );

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed bottom-0 right-0 z-50 p-4 space-y-4">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}