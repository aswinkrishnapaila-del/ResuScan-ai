import React from 'react';
import ErrorPage from '../pages/ErrorPage';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ResuScan ErrorBoundary caught:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
          <ErrorPage
            code={500}
            title="Application Error Detected"
            message={this.state.error?.message || "A rendering error occurred. You can retry or reset local cache."}
            details={this.state.errorInfo?.componentStack || this.state.error?.stack}
            onReset={this.handleReset}
            onBackToDashboard={() => {
              window.location.href = '/';
            }}
          />
        </div>
      );
    }
    return this.props.children;
  }
}
