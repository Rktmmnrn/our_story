// src/components/ErrorBoundary.tsx
import { Component, ErrorInfo, ReactNode } from 'react';
import toast from 'react-hot-toast';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 Error Boundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Log vers un service d'erreur (Sentry, LogRocket, etc.) si configuré
    if (import.meta.env.PROD) {
      // TODO: Envoyer à Sentry
      // Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
    }

    // Notification utilisateur
    toast.error('Une erreur inattendue est survenue ♡', {
      duration: 5000,
    });
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  public render() {
    if (this.state.hasError) {
      // Fallback UI personnalisé ou par défaut
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--cream)',
            padding: '2rem',
          }}
        >
          <div
            style={{
              maxWidth: '500px',
              textAlign: 'center',
              background: 'white',
              padding: '3rem 2rem',
              borderRadius: '16px',
              boxShadow: '0 4px 24px rgba(212, 96, 122, 0.1)',
            }}
          >
            <div
              style={{
                fontSize: '4rem',
                marginBottom: '1rem',
              }}
            >
              💔
            </div>

            <h1
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: '2rem',
                color: 'var(--dark)',
                marginBottom: '1rem',
              }}
            >
              Oups, quelque chose s'est cassé
            </h1>

            <p
              style={{
                fontFamily: 'Jost, sans-serif',
                fontSize: '1rem',
                color: 'var(--muted)',
                marginBottom: '2rem',
                lineHeight: '1.6',
              }}
            >
              Une erreur inattendue s'est produite. Ne vous inquiétez pas, vos données sont en sécurité ♡
            </p>

            {import.meta.env.DEV && this.state.error && (
              <details
                style={{
                  marginBottom: '2rem',
                  textAlign: 'left',
                  background: 'var(--rose-pale)',
                  padding: '1rem',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontFamily: 'monospace',
                  maxHeight: '200px',
                  overflow: 'auto',
                }}
              >
                <summary style={{ cursor: 'pointer', marginBottom: '0.5rem', fontWeight: 600 }}>
                  Détails de l'erreur (dev)
                </summary>
                <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={this.handleReset}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'var(--rose)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontFamily: 'Jost, sans-serif',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = 'var(--rose-deep)')}
                onMouseOut={(e) => (e.currentTarget.style.background = 'var(--rose)')}
              >
                Réessayer
              </button>

              <button
                onClick={() => (window.location.href = '/')}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'transparent',
                  color: 'var(--rose-deep)',
                  border: '2px solid var(--rose)',
                  borderRadius: '8px',
                  fontFamily: 'Jost, sans-serif',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'var(--rose-pale)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                Retour à l'accueil
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}