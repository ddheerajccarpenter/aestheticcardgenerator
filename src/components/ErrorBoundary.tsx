import React, { Component, type ReactNode } from 'react';
import { ErrorView } from '../views/TrustViews';

interface Props {
  children: ReactNode;
  theme?: 'dark' | 'light';
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log to console in dev; could pipe to an error reporting service here
    console.error('[ErrorBoundary] Uncaught error:', error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorView
          theme={this.props.theme ?? 'dark'}
          error={this.state.error}
          onRetry={this.handleRetry}
        />
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
