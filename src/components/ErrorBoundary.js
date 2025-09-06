import React, { Component } from 'react';
import { withErrorHandling } from '../utils/errorHandling';

/**
 * ErrorBoundary - Vangt fouten in componenten op en toont een fallback UI
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log naar error tracking service of console
    console.error('ErrorBoundary caught error:', error, errorInfo);
    
    // Gebruik onze error handling utility
    withErrorHandling(() => {
      throw error;
    }, { 
      context: this.props.componentName || 'ErrorBoundary',
      silent: true // We laten de ErrorBoundary de UI afhandelen
    })();
  }

  render() {
    const { fallback, children } = this.props;
    
    if (this.state.hasError) {
      // Toon aangepaste fallback component indien aanwezig
      if (fallback) {
        return React.cloneElement(fallback, { 
          error: this.state.error,
          resetError: () => this.setState({ hasError: false, error: null, errorInfo: null })
        });
      }
      
      // Standaard error UI
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
              onClick={() => {
                this.setState({ hasError: false });
                window.location.href = '/';
              }}
              className="button"
            >
              Naar startpagina
            </button>
          </div>
          
          {process.env.NODE_ENV === 'development' && (
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

export default ErrorBoundary;