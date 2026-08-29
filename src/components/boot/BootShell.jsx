import React from 'react';

export default function BootShell({ steps = [], error = null }) {
  return (
    <div className="fixed inset-0 z-[999999] flex min-h-screen items-center justify-center bg-[#020617] px-6 text-white">
      <div className="w-full max-w-3xl rounded-2xl border-2 border-cyan-400 bg-black p-8 shadow-2xl">
        <p className="text-base font-bold uppercase tracking-[0.35em] text-cyan-300">SoundMirror Boot</p>
        <h1 className="mt-4 text-4xl font-black tracking-wide text-cyan-200">{error ? 'BOOT ERROR ACTIVE' : 'BOOT SHELL ACTIVE'}</h1>
        <p className="mt-3 text-base text-slate-200">
          {error ? 'The app hit an error before finishing startup.' : 'Booting SoundMirror...'}
        </p>

        <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Visible boot trace</p>
          <div className="space-y-2">
            {steps.map((step, index) => {
              const isLast = index === steps.length - 1;
              return (
                <div key={step} className={`rounded-lg px-3 py-2 text-sm ${isLast ? 'bg-cyan-400/15 text-cyan-200' : 'bg-white/5 text-slate-300'}`}>
                  {step}
                </div>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="mt-6 space-y-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-300">Error message</p>
              <p className="mt-2 break-words text-sm text-red-100">{error.message || 'Unknown boot error'}</p>
            </div>
            {error.stack && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-300">Stack</p>
                <pre className="mt-2 max-h-56 overflow-auto whitespace-pre-wrap rounded-lg bg-black/30 p-3 text-xs text-red-100">{error.stack}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}