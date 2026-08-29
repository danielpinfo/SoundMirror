import React from 'react';

export default class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[boot:error-boundary]', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a1628] px-6 text-center">
          <div>
            <h1 className="text-2xl font-bold text-cyan-400 mb-3">SoundMirror</h1>
            <p className="text-white mb-2">The app hit a startup error.</p>
            <p className="text-white/70 text-sm">{this.state.error?.message || 'Unknown error'}</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}