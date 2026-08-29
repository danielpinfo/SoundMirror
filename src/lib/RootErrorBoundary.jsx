import React from 'react';

export default class RootErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[boot] root error boundary caught', error, info);
    this.setState({ info });
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-black px-6 py-10 text-white">
          <div className="mx-auto max-w-3xl rounded-2xl border-2 border-red-500 bg-[#120303] p-6 shadow-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-red-300">SoundMirror Boot Error</p>
            <h1 className="mt-3 text-4xl font-black text-red-200">ROOT CRASH SCREEN</h1>
            <p className="mt-3 text-base text-red-100">The app crashed before it finished loading.</p>
            <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-300">Error message</p>
              <p className="mt-2 break-words text-sm text-red-100">{this.state.error?.message || 'Unknown error'}</p>
            </div>
            {this.state.error?.stack && (
              <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">Stack</p>
                <pre className="mt-2 max-h-60 overflow-auto whitespace-pre-wrap text-xs text-slate-200">{this.state.error.stack}</pre>
              </div>
            )}
            {this.state.info?.componentStack && (
              <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">Component stack</p>
                <pre className="mt-2 max-h-60 overflow-auto whitespace-pre-wrap text-xs text-slate-200">{this.state.info.componentStack}</pre>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}