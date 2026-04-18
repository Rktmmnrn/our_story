import { Component, ErrorInfo, ReactNode } from 'react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false, error: null };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => this.setState({ hasError: false, error: null });

  public render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: 'var(--cream)', padding: '2rem',
        fontFamily: "'Jost', sans-serif",
      }}>
        <div style={{
          maxWidth: 480, textAlign: 'center', background: 'white',
          padding: '3rem 2rem', border: '0.5px solid rgba(201,168,76,0.3)',
          boxShadow: '0 8px 40px rgba(42,26,32,0.1)',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💔</div>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem',
            fontWeight: 300, color: 'var(--dark)', marginBottom: '1rem',
          }}>
            Quelque chose s'est cassé
          </h1>
          <p style={{ color: 'var(--muted)', marginBottom: '2rem', lineHeight: 1.6, fontSize: '0.95rem' }}>
            Une erreur inattendue s'est produite. Vos données sont en sécurité ♡
          </p>
          {import.meta.env.DEV && this.state.error && (
            <details style={{
              textAlign: 'left', background: '#fdf0f4', padding: '1rem',
              marginBottom: '1.5rem', fontSize: '0.8rem', fontFamily: 'monospace',
              maxHeight: 150, overflow: 'auto',
            }}>
              <summary style={{ cursor: 'pointer', marginBottom: 8 }}>Détails (dev)</summary>
              <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{this.state.error.toString()}</pre>
            </details>
          )}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button onClick={this.handleReset} className="filled-btn">
              Réessayer
            </button>
            <button onClick={() => window.location.href = '/'} className="outline-btn">
              Accueil
            </button>
          </div>
        </div>
      </div>
    );
  }
}