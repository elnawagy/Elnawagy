import React, { createContext, useState, useCallback, ReactNode } from 'react';
import type { ToastNotification, NotificationType } from '../types';
import { CheckCircleIcon, ErrorIcon, InfoIcon, WarningIcon, CloseIcon } from '../components/icons';

interface NotificationContextType {
  addNotification: (message: string, type?: NotificationType) => void;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const notificationIcons = {
  success: <CheckCircleIcon />,
  error: <ErrorIcon />,
  info: <InfoIcon />,
  warning: <WarningIcon />,
};

const notificationStyles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<ToastNotification[]>([]);

  const removeNotification = useCallback((id: number) => {
    setNotifications(currentNotifications => currentNotifications.filter(n => n.id !== id));
  }, []);

  const addNotification = useCallback((message: string, type: NotificationType = 'info') => {
    const id = Date.now();
    setNotifications(currentNotifications => [...currentNotifications, { id, message, type }]);
    setTimeout(() => {
      removeNotification(id);
    }, 5000); // Auto-dismiss after 5 seconds
  }, [removeNotification]);

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      <div className="fixed top-5 right-5 z-50 space-y-3 w-80">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`flex items-start p-4 border rounded-lg shadow-lg animate-fade-in-right ${notificationStyles[notification.type]}`}
            role="alert"
          >
            <div className="flex-shrink-0">{notificationIcons[notification.type]}</div>
            <div className="ms-3 flex-grow">
              <p className="text-sm font-medium">{notification.message}</p>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="ms-auto -mx-1.5 -my-1.5 p-1.5 rounded-lg inline-flex h-8 w-8 hover:bg-black/10 focus:ring-2"
              aria-label="Close"
            >
              <CloseIcon />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};
