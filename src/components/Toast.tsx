import React, { useEffect, useState } from 'react';
import { cn } from '../utils/cn';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 3000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for animation to complete
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-success-600';
      case 'error':
        return 'bg-danger-600';
      default:
        return 'bg-primary-600';
    }
  };

  return (
    <div
      className={cn(
        'fixed bottom-6 right-6 px-4 py-3 rounded-lg text-white text-sm font-medium z-50 max-w-sm shadow-lg transition-all duration-300',
        getBgColor(),
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      )}
    >
      {message}
    </div>
  );
};

interface ToastContainerProps {
  toasts: Array<{
    id: string;
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
  }>;
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onRemove,
}) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </div>
  );
};