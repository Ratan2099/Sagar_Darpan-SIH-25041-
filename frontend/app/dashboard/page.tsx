'use client';
import { useAuth, getRedirectPath } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Navbar from '@/components/Navbar';

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) { router.replace('/login'); return; }
    if (user.role !== 'GENERAL') { router.replace(getRedirectPath(user.role)); }
  }, [user, router]);

  if (!user || user.role !== 'GENERAL') return null;

  const oceanNews = [
    { icon: '🌡️', title: 'Sea Surface Temp Rising', body: 'Arabian Sea SST hit 29.4°C this week — 1.2°C above the 30-year average, impacting local coral reef systems.', tag: 'Climate', tagColor: '#f87171' },
    { icon: '🐟', title: 'Mackerel Migration Shift', body: 'Indian Mackerel schools detected 40km further north than seasonal norm, likely due to altered thermocline depth.', tag: 'Fisheries', tagColor: '#60a5fa' },
    { icon: '🧬', title: 'New Coral Species', body: 'Researchers identified a heat-resistant coral variant off the Lakshadweep coast — potential climate resilience marker.', tag: 'Biodiversity', tagColor: '#4ade80' },
    { icon: '⚠️', title: 'Cyclone Advisory', body: 'Cyclone Tej developing in the Bay of Bengal. Wind speeds reaching 45 knots. Coastal advisories in effect.', tag: 'Alert', tagColor: '#fbbf24' },
    { icon: '🛸', title: 'IoT Buoy Network Expanded', body: '3 new smart buoys (B-103, B-104, B-105) deployed off the Konkan coast — monitoring pH, salinity, and temperature 24/7.', tag: 'Technology', tagColor: '#c084fc' },
    { icon: '🌊', title: 'Ocean Health Index: 68/100', body: 'This month\'s Integrated Ocean Health Score stands at 68/100, driven by dissolved oxygen decline and microplastic spread.', tag: 'Health', tagColor: '#3dd6c3' },
  ];

  const stats = [
    { val: '29.4°C', label: 'Avg SST', icon: '🌡️', delta: '+1.2°C', up: true },
    { val: '8.05', label: 'Avg Ocean pH', icon: '🧪', delta: '-0.07 pts', up: false },
    { val: '6.8 mg/L', label: 'Dissolved O₂', icon: '💧', delta: '-0.4 mg/L', up: false },
    { val: '34.8 PSU', label: 'Avg Salinity', icon: '🌊', delta: 'Stable', up: null },
  ];

  return (
    <div className="wave-bg min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black gradient-text mb-1">Ocean Health Dashboard</h1>
          <p className="text-blue-300/60">Public insights updated daily • March 2026</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map(s => (
            <div key={s.label} className="stat-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{s.icon}</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{
                  color: s.up === null ? '#7ee8d8' : s.up ? '#f87171' : '#4ade80',
                  background: s.up === null ? 'rgba(61,214,195,0.1)' : s.up ? 'rgba(248,113,113,0.1)' : 'rgba(74,222,128,0.1)',
                }}>
                  {s.delta}
                </span>
              </div>
              <p className="text-2xl font-black text-white">{s.val}</p>
              <p className="text-xs text-blue-300/60 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Ocean Health Gauge */}
        <div className="glass-card p-6 mb-8">
          <h2 className="text-lg font-bold text-white mb-4">Integrated Ocean Health Index — March 2026</h2>
          <div className="flex items-center gap-6">
            <div className="relative w-32 h-32 flex-shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(61,214,195,0.1)" strokeWidth="12" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="url(#gaugeGrad)" strokeWidth="12"
                  strokeDasharray={`${2 * Math.PI * 40 * 0.68} ${2 * Math.PI * 40}`} strokeLinecap="round" />
                <defs>
                  <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#0f7c7c" />
                    <stop offset="100%" stopColor="#3dd6c3" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black gradient-text">68</span>
                <span className="text-xs text-blue-300/60">/100</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 flex-1">
              {[
                { factor: 'Temperature', score: 62, color: '#f87171' },
                { factor: 'Dissolved O₂', score: 70, color: '#fbbf24' },
                { factor: 'Ocean pH', score: 65, color: '#fb923c' },
                { factor: 'Biodiversity', score: 73, color: '#4ade80' },
                { factor: 'Salinity Balance', score: 80, color: '#3dd6c3' },
                { factor: 'Microplastic Load', score: 45, color: '#f87171' },
              ].map(f => (
                <div key={f.factor}>
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: 'rgba(126,232,216,0.7)' }}>{f.factor}</span>
                    <span style={{ color: f.color }}>{f.score}</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: 'rgba(61,214,195,0.1)' }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${f.score}%`, background: f.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* News Grid */}
        <h2 className="text-xl font-bold text-white mb-4">Latest Ocean Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {oceanNews.map(n => (
            <div key={n.title} className="glass-card p-5 hover:border-teal-500/40 transition-all duration-300 cursor-pointer group">
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl group-hover:scale-110 transition-transform">{n.icon}</span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: `${n.tagColor}20`, color: n.tagColor, border: `1px solid ${n.tagColor}40` }}>
                  {n.tag}
                </span>
              </div>
              <h3 className="font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors">{n.title}</h3>
              <p className="text-sm text-blue-200/60 leading-relaxed">{n.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
