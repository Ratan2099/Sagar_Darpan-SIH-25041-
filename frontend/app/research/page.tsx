'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ScatterChart, Scatter, BarChart, Bar, Cell
} from 'recharts';

// ─── Mock Data ───────────────────────────────────────────────────────────────
const SENSOR_DATA = [
  { sensorId: 'B-101', location: 'Lat 15.4, Lon 73.8', temp: '28°C', salinity: '35 PSU', pH: '8.1', dissolvedO2: '7.1 mg/L', depth: '52m', status: 'Active' },
  { sensorId: 'B-102', location: 'Lat 12.9, Lon 74.8', temp: '29°C', salinity: '34.5 PSU', pH: '8.0', dissolvedO2: '6.9 mg/L', depth: '48m', status: 'Active' },
  { sensorId: 'D-201', location: 'Lat 13.8, Lon 74.2', temp: '27.5°C', salinity: '35.5 PSU', pH: '8.15', dissolvedO2: '7.3 mg/L', depth: '65m', status: 'Maintenance' },
];

const weeks = ['Jan W1', 'Jan W2', 'Jan W3', 'Feb W1', 'Feb W2', 'Mar W1', 'Mar W2', 'Mar W3', 'Apr W1', 'Apr W2', 'May W1', 'May W2'];
const IOT_TIME_SERIES = weeks.map((w, i) => ({
  week: w,
  'B-101 pH': parseFloat((8.1 - i * 0.002).toFixed(3)),
  'B-102 pH': parseFloat((8.0 - i * 0.003).toFixed(3)),
  'B-101 Salinity': parseFloat((35 + Math.sin(i) * 0.2).toFixed(2)),
  'B-102 Salinity': parseFloat((34.5 + Math.cos(i) * 0.15).toFixed(2)),
  'B-101 DO': parseFloat((7.2 - i * 0.05).toFixed(2)),
  'B-102 DO': parseFloat((6.9 - i * 0.04).toFixed(2)),
}));

const CORAL_DATA = [2020, 2021, 2022, 2023, 2024, 2025].map((y, i) => ({
  year: String(y),
  'Coral Index': parseFloat((100 - i * 3).toFixed(1)),
  'SST (°C)': parseFloat((28.0 + i * 0.24).toFixed(2)),
}));

const SCATTER_DATA = Array.from({ length: 25 }, (_, i) => ({
  salinity: parseFloat((30 + Math.random() * 10).toFixed(2)),
  population: Math.round(800 + Math.random() * 400 - i * 8),
  name: ['Mackerel', 'Sardine', 'Tuna', 'Pomfret', 'Hilsa'][i % 5],
}));

const HEATMAP_DATA = [
  { region: 'Arabian Sea N', temp: 0.72, acid: 0.65, bio: 0.58 },
  { region: 'Arabian Sea S', temp: 0.68, acid: 0.71, bio: 0.62 },
  { region: 'Bay of Bengal N', temp: 0.80, acid: 0.55, bio: 0.75 },
  { region: 'Bay of Bengal S', temp: 0.74, acid: 0.60, bio: 0.68 },
  { region: 'Lakshadweep', temp: 0.65, acid: 0.80, bio: 0.72 },
  { region: 'Andaman Sea', temp: 0.70, acid: 0.68, bio: 0.66 },
];

const BIO_RECORDS = [
  { id: 'BIO-001', species: 'Indian Mackerel', geneMarker: '16S rRNA', lat: 15.4, lon: 73.8, date: '2025-02-14', status: 'Approved', researcher: 'Dr. Priya Menon' },
  { id: 'BIO-002', species: 'Silver Pomfret', geneMarker: 'COI', lat: 12.9, lon: 74.8, date: '2025-03-01', status: 'Approved', researcher: 'Dr. Priya Menon' },
  { id: 'BIO-003', species: 'Staghorn Coral', geneMarker: '28S rDNA', lat: 11.2, lon: 72.5, date: '2025-03-10', status: 'Pending', researcher: 'Dr. Priya Menon' },
  { id: 'BIO-004', species: 'Yellowfin Tuna', geneMarker: 'Cytochrome b', lat: 10.5, lon: 76.2, date: '2025-03-12', status: 'Approved', researcher: 'Dr. Arjun Nair' },
  { id: 'BIO-005', species: 'Green Sea Turtle', geneMarker: 'D-Loop', lat: 14.1, lon: 74.5, date: '2025-03-15', status: 'Pending', researcher: 'Dr. Priya Menon' },
];

// ─── Heatmap cell color ───────────────────────────────────────────────────────
const heatColor = (v: number) => {
  if (v < 0.5) return '#4ade80';
  if (v < 0.6) return '#a3e635';
  if (v < 0.7) return '#fbbf24';
  if (v < 0.8) return '#fb923c';
  return '#f87171';
};

const ChartTooltipStyle = { contentStyle: { background: 'rgba(5,22,40,0.95)', border: '1px solid rgba(61,214,195,0.3)', borderRadius: '8px', color: '#e2f4f4', fontSize: '12px' } };

export default function ResearchPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'iot' | 'bio' | 'ai'>('iot');
  const [showAddForm, setShowAddForm] = useState(false);
  const [bioRecords, setBioRecords] = useState(BIO_RECORDS);
  const [form, setForm] = useState({ species: '', geneMarker: '', lat: '', lon: '', date: '' });

  useEffect(() => {
    if (!user) { router.replace('/login'); return; }
    if (user.role === 'FISHERMAN' || user.role === 'GENERAL') {
      router.replace(user.role === 'FISHERMAN' ? '/fisherman' : '/dashboard');
    }
  }, [user, router]);

  if (!user || user.role === 'FISHERMAN' || user.role === 'GENERAL') return null;

  const handleAddBio = (e: React.FormEvent) => {
    e.preventDefault();
    const newRec = { id: `BIO-00${bioRecords.length + 1}`, species: form.species, geneMarker: form.geneMarker, lat: parseFloat(form.lat), lon: parseFloat(form.lon), date: form.date, status: 'Pending', researcher: user.fullName };
    setBioRecords(prev => [newRec, ...prev]);
    setForm({ species: '', geneMarker: '', lat: '', lon: '', date: '' });
    setShowAddForm(false);
  };

  return (
    <div className="wave-bg min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-black gradient-text">Research Portal</h1>
          <p className="text-blue-300/60 text-sm">Restricted to Researchers &amp; Admins • {user.fullName}</p>
        </div>

        {/* Tab navigation */}
        <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: 'rgba(5,22,40,0.6)', border: '1px solid rgba(61,214,195,0.1)' }}>
          {[
            { key: 'iot', label: '📡 IoT Dashboard' },
            { key: 'bio', label: '🧬 Biodiversity DB' },
            { key: 'ai', label: '🤖 AI Analysis' },
          ].map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key as 'iot' | 'bio' | 'ai')}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-300 ${activeTab === t.key ? 'tab-active' : 'tab-inactive'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ─── IoT Dashboard ─────────────────────────────────────────────────── */}
        {activeTab === 'iot' && (
          <div className="space-y-5">
            {/* Sensor Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {SENSOR_DATA.map(s => (
                <div key={s.sensorId} className="glass-card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-white text-lg">{s.sensorId}</h3>
                    <span className={s.status === 'Active' ? 'badge-active' : 'badge-warning'}>{s.status}</span>
                  </div>
                  <p className="text-xs mb-3" style={{ color: 'rgba(126,232,216,0.5)' }}>📍 {s.location}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Temp', val: s.temp, icon: '🌡️' },
                      { label: 'Salinity', val: s.salinity, icon: '🧂' },
                      { label: 'pH', val: s.pH, icon: '🧪' },
                      { label: 'DO', val: s.dissolvedO2, icon: '💧' },
                    ].map(m => (
                      <div key={m.label} className="p-2 rounded-lg" style={{ background: 'rgba(61,214,195,0.05)', border: '1px solid rgba(61,214,195,0.1)' }}>
                        <p className="text-xs" style={{ color: 'rgba(126,232,216,0.5)' }}>{m.icon} {m.label}</p>
                        <p className="text-sm font-bold text-white">{m.val}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* pH Line Chart */}
            <div className="glass-card p-5">
              <h3 className="font-bold text-white mb-4">pH Level Trends — Buoy B-101 &amp; B-102 (Jan–May 2025)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={IOT_TIME_SERIES} {...ChartTooltipStyle}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(61,214,195,0.1)" />
                  <XAxis dataKey="week" tick={{ fill: 'rgba(126,232,216,0.6)', fontSize: 11 }} />
                  <YAxis domain={[7.9, 8.15]} tick={{ fill: 'rgba(126,232,216,0.6)', fontSize: 11 }} />
                  <Tooltip {...ChartTooltipStyle} />
                  <Legend wrapperStyle={{ color: 'rgba(126,232,216,0.7)', fontSize: 12 }} />
                  <Line type="monotone" dataKey="B-101 pH" stroke="#3dd6c3" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="B-102 pH" stroke="#60a5fa" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Salinity & DO side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="glass-card p-5">
                <h3 className="font-bold text-white mb-4">Salinity (PSU)</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={IOT_TIME_SERIES} {...ChartTooltipStyle}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(61,214,195,0.08)" />
                    <XAxis dataKey="week" tick={{ fill: 'rgba(126,232,216,0.5)', fontSize: 10 }} />
                    <YAxis tick={{ fill: 'rgba(126,232,216,0.5)', fontSize: 10 }} domain={[33, 36]} />
                    <Tooltip {...ChartTooltipStyle} />
                    <Line type="monotone" dataKey="B-101 Salinity" stroke="#38bdf8" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="B-102 Salinity" stroke="#818cf8" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="glass-card p-5">
                <h3 className="font-bold text-white mb-4">Dissolved Oxygen (mg/L)</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={IOT_TIME_SERIES.filter((_, i) => i % 2 === 0)} {...ChartTooltipStyle}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(61,214,195,0.08)" />
                    <XAxis dataKey="week" tick={{ fill: 'rgba(126,232,216,0.5)', fontSize: 10 }} />
                    <YAxis tick={{ fill: 'rgba(126,232,216,0.5)', fontSize: 10 }} domain={[5.5, 8]} />
                    <Tooltip {...ChartTooltipStyle} />
                    <Bar dataKey="B-101 DO" fill="#3dd6c3" radius={[4, 4, 0, 0]} opacity={0.8} />
                    <Bar dataKey="B-102 DO" fill="#60a5fa" radius={[4, 4, 0, 0]} opacity={0.8} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* ─── Biodiversity DB ────────────────────────────────────────────────── */}
        {activeTab === 'bio' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Molecular Biodiversity Records</h2>
              {(user.role === 'RESEARCHER' || user.role === 'ADMIN') && (
                <button onClick={() => setShowAddForm(true)} className="btn-primary text-sm">+ Add New Record</button>
              )}
            </div>

            {/* Add Form Modal */}
            {showAddForm && (
              <div className="glass-card p-6">
                <h3 className="font-bold text-white mb-4">New Biodiversity Record</h3>
                <form onSubmit={handleAddBio} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: '#7ee8d8' }}>Species Name</label>
                    <input className="ocean-input" placeholder="e.g. Thunnus albacares" value={form.species} onChange={e => setForm(f => ({ ...f, species: e.target.value }))} required />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: '#7ee8d8' }}>Gene Marker</label>
                    <select className="ocean-input" value={form.geneMarker} onChange={e => setForm(f => ({ ...f, geneMarker: e.target.value }))} required>
                      <option value="">Select marker...</option>
                      <option>16S rRNA</option><option>18S rRNA</option><option>COI</option>
                      <option>Cytochrome b</option><option>28S rDNA</option><option>D-Loop</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: '#7ee8d8' }}>Latitude</label>
                    <input className="ocean-input" type="number" step="0.0001" placeholder="e.g. 15.4000" value={form.lat} onChange={e => setForm(f => ({ ...f, lat: e.target.value }))} required />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: '#7ee8d8' }}>Longitude</label>
                    <input className="ocean-input" type="number" step="0.0001" placeholder="e.g. 73.8000" value={form.lon} onChange={e => setForm(f => ({ ...f, lon: e.target.value }))} required />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: '#7ee8d8' }}>Date Recorded</label>
                    <input className="ocean-input" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
                  </div>
                  <div className="flex items-end gap-3">
                    <button type="submit" className="btn-primary flex-1">Submit for Approval</button>
                    <button type="button" onClick={() => setShowAddForm(false)} className="btn-secondary flex-1">Cancel</button>
                  </div>
                </form>
              </div>
            )}

            {/* Table */}
            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full ocean-table">
                  <thead>
                    <tr>
                      <th>ID</th><th>Species Name</th><th>Gene Marker</th><th>Coordinates</th><th>Date</th><th>Researcher</th><th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bioRecords.map(r => (
                      <tr key={r.id}>
                        <td><code className="text-xs" style={{ color: '#7ee8d8' }}>{r.id}</code></td>
                        <td className="font-semibold text-white">{r.species}</td>
                        <td><span className="badge-info">{r.geneMarker}</span></td>
                        <td className="font-mono text-xs">{r.lat.toFixed ? r.lat.toFixed(1) : r.lat}, {r.lon.toFixed ? r.lon.toFixed(1) : r.lon}</td>
                        <td>{r.date}</td>
                        <td className="text-xs">{r.researcher}</td>
                        <td><span className={r.status === 'Approved' ? 'badge-active' : 'badge-warning'}>{r.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ─── AI Analysis ─────────────────────────────────────────────────────── */}
        {activeTab === 'ai' && (
          <div className="space-y-6">
            {/* Summary stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { val: '-15%', label: 'Coral Index Decline', color: '#f87171' },
                { val: '+1.2°C', label: 'SST Rise (5yr)', color: '#fb923c' },
                { val: '-0.07', label: 'pH Drop', color: '#fbbf24' },
                { val: '8 spp.', label: 'Species at Risk', color: '#f87171' },
              ].map(s => (
                <div key={s.label} className="stat-card text-center">
                  <p className="text-2xl font-black" style={{ color: s.color }}>{s.val}</p>
                  <p className="text-xs text-blue-300/60 mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Coral Reef Decline Line Graph */}
            <div className="glass-card p-5">
              <h3 className="font-bold text-white mb-1">Coral Reef Biodiversity Index vs. Sea Surface Temperature</h3>
              <p className="text-xs text-blue-300/50 mb-4">15% biodiversity decline correlating with 1.2°C SST rise over 5 years</p>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={CORAL_DATA} {...ChartTooltipStyle}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(61,214,195,0.1)" />
                  <XAxis dataKey="year" tick={{ fill: 'rgba(126,232,216,0.6)', fontSize: 12 }} />
                  <YAxis yAxisId="left" domain={[80, 105]} tick={{ fill: 'rgba(126,232,216,0.6)', fontSize: 11 }} tickFormatter={v => `${v}`} />
                  <YAxis yAxisId="right" orientation="right" domain={[27.5, 29.5]} tick={{ fill: '#fb923c', fontSize: 11 }} tickFormatter={v => `${v}°C`} />
                  <Tooltip {...ChartTooltipStyle} />
                  <Legend wrapperStyle={{ color: 'rgba(126,232,216,0.7)', fontSize: 12 }} />
                  <Line yAxisId="left" type="monotone" dataKey="Coral Index" stroke="#3dd6c3" strokeWidth={3} dot={{ fill: '#3dd6c3', r: 5 }} />
                  <Line yAxisId="right" type="monotone" dataKey="SST (°C)" stroke="#fb923c" strokeWidth={3} dot={{ fill: '#fb923c', r: 5 }} strokeDasharray="6 3" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Scatter Plot */}
            <div className="glass-card p-5">
              <h3 className="font-bold text-white mb-1">Fish Population Dynamics vs. Salinity</h3>
              <p className="text-xs text-blue-300/50 mb-4">Predictive scatter model — each point represents a survey reading</p>
              <ResponsiveContainer width="100%" height={220}>
                <ScatterChart {...ChartTooltipStyle}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(61,214,195,0.1)" />
                  <XAxis dataKey="salinity" name="Salinity (PSU)" tick={{ fill: 'rgba(126,232,216,0.6)', fontSize: 11 }} label={{ value: 'Salinity (PSU)', position: 'insideBottom', offset: -5, fill: 'rgba(126,232,216,0.5)', fontSize: 11 }} />
                  <YAxis dataKey="population" name="Population Index" tick={{ fill: 'rgba(126,232,216,0.6)', fontSize: 11 }} />
                  <Tooltip {...ChartTooltipStyle} />
                  <Scatter data={SCATTER_DATA} fill="#3dd6c3">
                    {SCATTER_DATA.map((_, i) => (
                      <Cell key={i} fill={['#3dd6c3', '#60a5fa', '#fbbf24', '#c084fc', '#4ade80'][i % 5]} opacity={0.8} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            {/* Climate Risk Heatmap */}
            <div className="glass-card p-5">
              <h3 className="font-bold text-white mb-1">Regional Climate Risk Index</h3>
              <p className="text-xs text-blue-300/50 mb-4">Heatmap of temperature stress, acidification risk, and biodiversity loss by ocean region</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className="text-left py-2 px-3 text-xs font-bold uppercase tracking-wider" style={{ color: '#7ee8d8' }}>Region</th>
                      <th className="text-center py-2 px-2 text-xs font-bold uppercase tracking-wider" style={{ color: '#f87171' }}>🌡️ Temperature</th>
                      <th className="text-center py-2 px-2 text-xs font-bold uppercase tracking-wider" style={{ color: '#fbbf24' }}>🧪 Acidification</th>
                      <th className="text-center py-2 px-2 text-xs font-bold uppercase tracking-wider" style={{ color: '#4ade80' }}>🌿 Bio Loss</th>
                    </tr>
                  </thead>
                  <tbody>
                    {HEATMAP_DATA.map(row => (
                      <tr key={row.region}>
                        <td className="py-2.5 px-3 font-semibold" style={{ color: '#c7e8e8' }}>{row.region}</td>
                        {[row.temp, row.acid, row.bio].map((v, i) => (
                          <td key={i} className="py-2.5 px-2 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-8 rounded-lg font-bold text-xs" style={{ background: `${heatColor(v)}20`, color: heatColor(v), border: `1px solid ${heatColor(v)}40` }}>
                              {(v * 100).toFixed(0)}%
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex items-center gap-3 mt-3 justify-end">
                  <span className="text-xs" style={{ color: 'rgba(126,232,216,0.5)' }}>Risk Scale:</span>
                  {[['#4ade80', 'Low'], ['#fbbf24', 'Medium'], ['#f87171', 'High']].map(([c, l]) => (
                    <span key={l} className="flex items-center gap-1 text-xs" style={{ color: c }}>
                      <span className="w-3 h-3 rounded" style={{ background: c }} />{l}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
