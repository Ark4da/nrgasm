import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  /** Shown instead of the children once they have thrown. */
  fallback: ReactNode;
  /** Called once when the children throw, for parents that change more than this spot. */
  onError?: () => void;
  children: ReactNode;
}

interface ErrorBoundaryState {
  failed: boolean;
}

// React still needs a class for this: there is no hook that catches render errors.
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Falling back after an error:', error, info.componentStack);
    this.props.onError?.();
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
