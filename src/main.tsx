import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { AuthProvider } from './auth/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Prevent Bearer tokens from being sent over plain HTTP in production builds
if (import.meta.env.PROD && import.meta.env.VITE_API_URL?.startsWith('http:')) {
  throw new Error('[Security] VITE_API_URL must use HTTPS in production');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </AuthProvider>
  </StrictMode>
);
