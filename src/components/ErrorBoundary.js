import React, { Component } from 'react';
import { useNavigate } from 'react-router-dom';
import { withErrorHandling } from '../utils/errorHandling';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });

    withErrorHandling(() => {
      throw error;
    }, {
      context: this.props.componentName || 'ErrorBoundary',
      silent: true
    })();
  }

  goHome = () => {
    this.setState({ hasError: false });
    this.props.navigate('/', { replace: true });
  };

  render() {
    const { fallback, children } = this.props;

    if (this.state.hasError) {
      if (fallback) {
        return React.cloneElement(fallback, {
          error: this.state.error,
          resetError: () => this.setState({ hasError: false, error: null, errorInfo: null })
        });
      }

      return (
        <div className="error-boundary">
          <h2>Er is iets misgegaan</h2>
          <p>
            Er is een onverwachte fout opgetreden. Probeer de pagina te vernieuwen of
            ga terug naar de startpagina.
          </p>
          <div className="error-actions">
            <button
              onClick={() => window.location.reload()}
              className="button button--secondary"
            >
              Pagina vernieuwen
            </button>
            <button
              onClick={this.goHome}
              className="button"
            >
              Naar startpagina
            </button>
          </div>

          {import.meta.env.DEV && (
            <details className="error-details">
              <summary>Technische details</summary>
              <pre>{this.state.error && this.state.error.toString()}</pre>
              <pre>{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
            </details>
          )}
        </div>
      );
    }

    return children;
  }
}

const ErrorBoundaryWithNavigation = (props) => {
  const navigate = useNavigate();
  return <ErrorBoundary {...props} navigate={navigate} />;
};

export default ErrorBoundaryWithNavigation;
