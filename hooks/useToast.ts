import { useState, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  title: string;
  message: string;
  type: ToastType;
  duration: number;
}

// Simple implementation of useToast that logs to console
// In a real app, this would integrate with a toast notification system
export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((title: string, message: string, type: ToastType = 'info', duration: number = 5000) => {
    const id = Math.random().toString(36).substring(2, 9);
    
    // Console logging for simplicity
    const colorMap = {
      success: 'color: green',
      error: 'color: red',
      info: 'color: blue',
      warning: 'color: orange'
    };
    
    console.log(`%c${type.toUpperCase()}: ${title}`, colorMap[type], message);
    
    // Add toast to state (for potential UI rendering)
    const newToast = {
      id,
      title,
      message,
      type,
      duration
    };
    
    setToasts(current => [...current, newToast]);
    
    // Auto-remove toast after duration
    setTimeout(() => {
      setToasts(current => current.filter(toast => toast.id !== id));
    }, duration);
    
    return id;
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(current => current.filter(toast => toast.id !== id));
  }, []);

  return {
    toasts,
    showToast,
    dismissToast
  };
} 