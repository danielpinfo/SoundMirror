import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Mic2, BookA, BarChart3, Bug, Activity } from 'lucide-react';

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/practice', label: 'Practice', icon: Mic2 },
  { path: '/letters', label: 'Letters', icon: BookA },
  { path: '/history', label: 'Progress', icon: BarChart3 },
  { path: '/report', label: 'Report', icon: Bug },
];

export default function Layout({ children }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex">
      {/* Sidebar Navigation */}
      <nav className="fixed left-0 top-0 h-full w-20 bg-slate-900/80 backdrop-blur-xl border-r border-slate-800 flex flex-col items-center py-6 z-20">
        {/* Logo */}
        <div className="mb-8">
          <div 
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center shadow-lg"
            style={{ boxShadow: '0 0 20px rgba(56, 189, 248, 0.4)' }}
          >
            <Activity className="w-6 h-6 text-slate-900" />
          </div>
        </div>

        {/* Nav Items */}
        <div className="flex-1 flex flex-col gap-2">
          {navItems.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path;
            return (
              <NavLink
                key={path}
                to={path}
                data-testid={`nav-${label.toLowerCase()}`}
                className={`
                  w-14 h-14 rounded-xl flex flex-col items-center justify-center gap-1
                  transition-all duration-200 group relative
                  ${isActive 
                    ? 'bg-sky-500/20 text-sky-400' 
                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'drop-shadow-[0_0_8px_rgba(56,189,248,0.6)]' : ''}`} />
                <span className="text-[10px] font-medium">{label}</span>
                
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-sky-400 rounded-r-full" />
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Offline indicator */}
        <div className="mt-auto">
          <div 
            className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center"
            title="Offline Ready"
            data-testid="offline-indicator"
          >
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 ml-20 min-h-screen">
        {children}
      </main>
    </div>
  );
}
