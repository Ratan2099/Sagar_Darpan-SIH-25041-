'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, Role, MOCK_USERS, getRedirectPath } from '@/context/AuthContext';

const ROLE_COLORS: Record<Role, string> = {
  ADMIN: 'from-purple-600/30 to-purple-900/20 border-purple-500/40 hover:border-purple-400',
  RESEARCHER: 'from-blue-600/30 to-blue-900/20 border-blue-500/40 hover:border-blue-400',
  FISHERMAN: 'from-teal-600/30 to-teal-900/20 border-teal-500/40 hover:border-teal-400',
  GENERAL: 'from-slate-600/30 to-slate-900/20 border-slate-500/40 hover:border-slate-400',
};

const ROLE_ICONS: Record<Role, string> = {
  ADMIN: '⚡',
  RESEARCHER: '🔬',
  FISHERMAN: '🐟',
  GENERAL: '🌊',
};

export default function LoginPage() {
  const { login, loginMock, isLoading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      const user = JSON.parse(localStorage.getItem('sd_user') || '{}');
      router.replace(getRedirectPath(user.role));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    }
  };

  const handleDemoLogin = (role: Role) => {
    loginMock(role);
    router.replace(getRedirectPath(role));
  };

  return (
    <div className="wave-bg min-h-screen flex items-center justify-center p-4" style={{minHeight:'100dvh'}}>
      {/* Background particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="absolute rounded-full opacity-10" style={{
            background: 'radial-gradient(circle, #3dd6c3, transparent)',
            width: `${80 + i * 40}px`, height: `${80 + i * 40}px`,
            left: `${10 + i * 15}%`, top: `${5 + (i % 3) * 30}%`,
            animation: `float ${4 + i}s ease-in-out infinite`,
            animationDelay: `${i * 0.8}s`,
          }} />
        ))}
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
        {/* Left — Branding */}
        <div className="flex flex-col justify-center space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-5xl float-anim">🌊</span>
              <div>
                <h1 className="text-4xl font-black gradient-text">Sagar Darpan</h1>
                <p className="text-seafoam-300 text-sm font-medium tracking-widest uppercase" style={{color:'#7ee8d8'}}>Mirror of the Ocean</p>
              </div>
            </div>
            <p className="text-blue-200/70 text-lg leading-relaxed">
              AI-Driven Unified Data Platform for Oceanographic, Fisheries &amp; Molecular Biodiversity Insights.
            </p>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2">
            {['🛰️ Marine IoT', '🧬 Biodiversity DNA', '🤖 AI Analytics', '🐟 Matsya AI Chat'].map(tag => (
              <span key={tag} className="px-3 py-1.5 text-xs font-semibold rounded-full" style={{background:'rgba(61,214,195,0.1)', border:'1px solid rgba(61,214,195,0.25)', color:'#7ee8d8'}}>
                {tag}
              </span>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { val: '4+', label: 'IoT Buoys' },
              { val: '500+', label: 'Species' },
              { val: '15TB', label: 'Ocean Data' },
            ].map(s => (
              <div key={s.label} className="stat-card text-center">
                <p className="text-2xl font-black gradient-text">{s.val}</p>
                <p className="text-xs text-blue-300/60 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Login Form */}
        <div className="glass-card p-8 glow-seafoam">
          <h2 className="text-2xl font-bold text-white mb-1">Sign In</h2>
          <p className="text-blue-300/60 text-sm mb-6">Access your portal</p>

          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{color:'#7ee8d8'}}>Email Address</label>
              <input
                type="email"
                className="ocean-input"
                placeholder="you@sagardarpan.in"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{color:'#7ee8d8'}}>Password</label>
              <input
                type="password"
                className="ocean-input"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            {error && (
              <div className="p-3 rounded-lg text-sm" style={{background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', color:'#fca5a5'}}>
                {error}
              </div>
            )}
            <button type="submit" className="btn-primary w-full" disabled={isLoading}>
              {isLoading ? 'Signing In...' : 'Sign In →'}
            </button>
          </form>

          <div className="ocean-divider" />

          <p className="text-xs text-center mb-3" style={{color:'rgba(126,232,216,0.5)'}}>Quick Demo Access</p>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(MOCK_USERS) as Role[]).map(role => (
              <button
                key={role}
                onClick={() => handleDemoLogin(role)}
                className={`p-3 rounded-xl text-left transition-all duration-300 bg-gradient-to-br border ${ROLE_COLORS[role]}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{ROLE_ICONS[role]}</span>
                  <span className="text-xs font-bold text-white uppercase tracking-wider">{role}</span>
                </div>
                <p className="text-xs opacity-60 text-white">{MOCK_USERS[role].fullName}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
