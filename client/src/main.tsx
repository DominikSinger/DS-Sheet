import { StrictMode, Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';
import App from './App.tsx';
import './index.css';

// React Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Error Boundary Component
class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#ffffff',
          color: '#333',
          padding: '20px'
        }}>
          <div style={{ textAlign: 'center', maxWidth: '500px' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>⚠️</div>
            <h1 style={{ fontSize: '24px', marginBottom: '16px', color: '#333' }}>Fehler beim Laden</h1>
            <p style={{ color: '#666', marginBottom: '24px' }}>
              {this.state.error?.message || 'Ein unbekannter Fehler ist aufgetreten'}
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '12px 24px',
                background: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              App neu laden
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Service Worker Registration (nur im Web)
if (!Capacitor.isNativePlatform() && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Silent fail - PWA ist optional
    });
  });
}

// Global Error Handler
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled rejection:', event.reason);
});

// Initialisiere die App
const initApp = async () => {
  try {
    // Verstecke den SplashScreen nachdem die App bereit ist
    if (Capacitor.isNativePlatform()) {
      console.log('Native Platform detected:', Capacitor.getPlatform());
      
      // Warte kurz damit das DOM vollständig geladen ist
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Rendere die App
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <ErrorBoundary>
          <QueryClientProvider client={queryClient}>
            <App />
          </QueryClientProvider>
        </ErrorBoundary>
      </StrictMode>
    );

    // Verstecke SplashScreen nach erfolgreichem Rendering
    // Warte länger, damit die App vollständig initialisiert ist
    if (Capacitor.isNativePlatform()) {
      setTimeout(async () => {
        try {
          await SplashScreen.hide({ fadeOutDuration: 300 });
          console.log('SplashScreen hidden');
        } catch (e) {
          console.error('Error hiding splash screen:', e);
        }
      }, 1500);
    }
  } catch (error) {
    console.error('Error initializing app:', error);
    
    // Zeige Fehler-UI
    const root = document.getElementById('root');
    if (root) {
      root.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #ffffff; color: #333; padding: 20px;">
          <div style="text-align: center; max-width: 500px;">
            <div style="font-size: 64px; margin-bottom: 20px;">⚠️</div>
            <h1 style="font-size: 24px; margin-bottom: 16px; color: #333;">Fehler beim Laden</h1>
            <p style="color: #666; margin-bottom: 24px;">${error}</p>
            <button onclick="window.location.reload()" style="padding: 12px 24px; background: #4CAF50; color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer;">
              App neu laden
            </button>
          </div>
        </div>
      `;
    }
    
    // Verstecke SplashScreen auch bei Fehler
    if (Capacitor.isNativePlatform()) {
      try {
        await SplashScreen.hide();
      } catch (e) {
        console.error('Error hiding splash screen after error:', e);
      }
    }
  }
};

// Starte die App wenn das DOM bereit ist
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
