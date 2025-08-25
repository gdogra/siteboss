import React, { Component, ReactNode } from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import logger from '../../utils/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: any;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    logger.error('React Error Boundary caught an error', error, {
      errorInfo,
      componentStack: errorInfo.componentStack,
      errorBoundary: this.constructor.name,
    });

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Something went wrong
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              We're sorry, but something unexpected happened. Please try refreshing the page.
            </p>
            
            {process.env.REACT_APP_ENVIRONMENT === 'development' && (
              <details className="mt-4 p-4 bg-red-50 rounded-md">
                <summary className="text-sm font-medium text-red-800 cursor-pointer">
                  Error Details (Development Only)
                </summary>
                <pre className="mt-2 text-xs text-red-700 whitespace-pre-wrap">
                  {this.state.error?.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>

          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="space-y-4">
              <button
                onClick={this.handleReload}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Refresh Page
              </button>
              <button
                onClick={this.handleGoHome}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;