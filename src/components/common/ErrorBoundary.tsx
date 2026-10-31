import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('KD Supermarket UI error caught by boundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-ivory flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 md:p-8 text-center space-y-4 border border-gray-200 shadow-card">
            <div className="w-16 h-16 bg-forest/10 text-forest rounded-2xl flex items-center justify-center mx-auto text-2xl font-black">
              KD
            </div>
            <h2 className="font-heading font-extrabold text-xl text-charcoal">
              Something went wrong
            </h2>
            <p className="text-xs text-charcoal-muted leading-relaxed">
              We encountered a temporary interface glitch. Please click below to reload and continue browsing smoothly.
            </p>
            <div className="flex gap-2 justify-center pt-2">
              <button
                type="button"
                onClick={() => {
                  this.setState({ hasError: false });
                  window.location.hash = '';
                  window.location.reload();
                }}
                className="px-6 py-2.5 bg-forest hover:bg-forest-dark text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
              >
                Reload KD Supermarket
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
