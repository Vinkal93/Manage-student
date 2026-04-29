import React from 'react';

interface State { hasError: boolean; error?: Error }

export default class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError(error: Error): State { return { hasError: true, error }; }
  componentDidCatch(error: Error, info: React.ErrorInfo) { console.error('App error:', error, info); }
  reset = () => { this.setState({ hasError: false, error: undefined }); window.location.href = '/'; };
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-card border border-border rounded-xl p-6 shadow-lg text-center space-y-3">
            <div className="text-4xl">⚠️</div>
            <h1 className="text-lg font-bold text-foreground">Something went wrong</h1>
            <p className="text-sm text-muted-foreground">{this.state.error?.message || 'Unexpected error occurred. Please reload.'}</p>
            <div className="flex gap-2 justify-center">
              <button onClick={() => window.location.reload()} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">Reload</button>
              <button onClick={this.reset} className="px-4 py-2 rounded-lg border border-border text-sm font-medium">Go Home</button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}