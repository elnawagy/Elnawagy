import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import { LocalizationProvider } from './context/LocalizationContext';
import { NotificationProvider } from './context/NotificationContext';
import { SystemProvider } from './context/SystemContext';
import { AuthProvider } from './context/AuthContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <LocalizationProvider>
        <NotificationProvider>
          <SystemProvider>
            <AuthProvider>
              <App />
            </AuthProvider>
          </SystemProvider>
        </NotificationProvider>
      </LocalizationProvider>
    </ThemeProvider>
  </React.StrictMode>
);