'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

type Role = 'ADMIN' | 'RESEARCHER' | 'FISHERMAN' | 'GENERAL';

interface User { id: string; name: string; email: string; role: Role; joined: string; records: number; }
interface Request { id: string; researcher: string; type: 'UPDATE' | 'DELETE'; target: string; reason: string; status: 'PENDING' | 'APPROVED' | 'REJECTED'; date: string; }

const INIT_USERS: User[] = [
  { id: 'admin-001', name: 'Dr. Arjun Nair', email: 'admin@sagardarpan.in', role: 'ADMIN', joined: '2024-01-01', records: 1 },
  { id: 'researcher-001', name: 'Dr. Priya Menon', email: 'researcher@sagardarpan.in', role: 'RESEARCHER', joined: '2024-03-15', records: 4 },
  { id: 'fisherman-001', name: 'Rajan Pillai', email: 'fisher@sagardarpan.in', role: 'FISHERMAN', joined: '2024-06-20', records: 0 },
  { id: 'general-001', name: 'Ananya Sharma', email: 'user@sagardarpan.in', role: 'GENERAL', joined: '2024-08-10', records: 0 },
  { id: 'researcher-002', name: 'Dr. Kiran Bhat', email: 'kiran@sagardarpan.in', role: 'RESEARCHER', joined: '2025-01-05', records: 2 },
  { id: 'fisherman-002', name: 'Selvam Kumar', email: 'selvam@sagardarpan.in', role: 'FISHERMAN', joined: '2025-02-12', records: 0 },
];

const INIT_REQUESTS: Request[] = [
  { id: 'REQ-001', researcher: 'Dr. Priya Menon', type: 'UPDATE', target: 'BIO-001', reason: 'The GC content value needs to be corrected from 42.3% to 43.1% based on repeat sequencing.', status: 'PENDING', date: '2026-03-14' },
  { id: 'REQ-002', researcher: 'Dr. Priya Menon', type: 'DELETE', target: 'BIO-002', reason: 'Duplicate entry. A more complete record was submitted under ID BIO-2025-003.', status: 'PENDING', date: '2026-03-15' },
  { id: 'REQ-003', researcher: 'Dr. Kiran Bhat', type: 'UPDATE', target: 'BIO-004', reason: 'Observation coordinates need correction: 10.52°N, 76.18°E (was 10.5°N, 76.2°E due to GPS drift).', status: 'APPROVED', date: '2026-03-10' },
];

const ROLE_OPTIONS: Role[] = ['ADMIN', 'RESEARCHER', 'FISHERMAN', 'GENERAL'];
const ROLE_ICONS: Record<Role, string> = { ADMIN: '⚡', RESEARCHER: '🔬', FISHERMAN: '🐟', GENERAL: '🌊' };

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'users' | 'requests'>('users');
  const [users, setUsers] = useState<User[]>(INIT_USERS);
  const [requests, setRequests] = useState<Request[]>(INIT_REQUESTS);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'GENERAL' as Role });

  useEffect(() => {
    if (!user) { router.replace('/login'); return; }
    if (user.role !== 'ADMIN') { router.replace('/dashboard'); }
  }, [user, router]);

  if (!user || user.role !== 'ADMIN') return null;

  const handleRoleChange = (userId: string, role: Role) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
  };

  const handleRemoveUser = (userId: string) => {
    if (userId === user.id) return;
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  const handleResolve = (reqId: string, action: 'APPROVED' | 'REJECTED') => {
    setRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: action } : r));
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    const u: User = { id: `user-${Date.now()}`, name: newUser.name, email: newUser.email, role: newUser.role, joined: new Date().toISOString().split('T')[0], records: 0 };
    setUsers(prev => [u, ...prev]);
    setNewUser({ name: '', email: '', role: 'GENERAL' });
    setShowAddUser(false);
  };

  const roleBg: Record<Role, string> = { ADMIN: 'rgba(168,85,247,0.15)', RESEARCHER: 'rgba(59,130,246,0.15)', FISHERMAN: 'rgba(20,184,166,0.15)', GENERAL: 'rgba(100,116,139,0.15)' };
  const roleColor: Record<Role, string> = { ADMIN: '#c084fc', RESEARCHER: '#93c5fd', FISHERMAN: '#5eead4', GENERAL: '#94a3b8' };

  const pendingCount = requests.filter(r => r.status === 'PENDING').length;

  return (
    <div className="wave-bg min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-black gradient-text">Admin Control Panel</h1>
          <p className="text-blue-300/60 text-sm">Full platform governance • {user.fullName}</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { val: users.length, label: 'Total Users', icon: '👥' },
            { val: users.filter(u => u.role === 'RESEARCHER').length, label: 'Researchers', icon: '🔬' },
            { val: users.filter(u => u.role === 'FISHERMAN').length, label: 'Fishermen', icon: '🐟' },
            { val: pendingCount, label: 'Pending Requests', icon: '⏳', highlight: pendingCount > 0 },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{s.icon}</span>
                <div>
                  <p className="text-2xl font-black" style={{ color: s.highlight ? '#fbbf24' : 'white' }}>{s.val}</p>
                  <p className="text-xs text-blue-300/60">{s.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: 'rgba(5,22,40,0.6)', border: '1px solid rgba(61,214,195,0.1)' }}>
          <button onClick={() => setActiveTab('users')} className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${activeTab === 'users' ? 'tab-active' : 'tab-inactive'}`}>
            👥 User Management
          </button>
          <button onClick={() => setActiveTab('requests')} className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${activeTab === 'requests' ? 'tab-active' : 'tab-inactive'}`}>
            📋 Data Governance
            {pendingCount > 0 && <span className="text-xs px-1.5 py-0.5 rounded-full font-bold" style={{ background: '#fbbf2420', color: '#fbbf24', border: '1px solid #fbbf2440' }}>{pendingCount}</span>}
          </button>
        </div>

        {/* ─── User Management ─────────────────────────────────────────────── */}
        {activeTab === 'users' && (
          <div className="glass-card overflow-hidden">
            <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid rgba(61,214,195,0.1)' }}>
              <h2 className="font-bold text-white">All Platform Users ({users.length})</h2>
              <button onClick={() => setShowAddUser(!showAddUser)} className="btn-primary text-sm">+ Add User</button>
            </div>

            {showAddUser && (
              <form onSubmit={handleAddUser} className="p-4 grid grid-cols-1 md:grid-cols-4 gap-3" style={{ borderBottom: '1px solid rgba(61,214,195,0.1)', background: 'rgba(61,214,195,0.03)' }}>
                <input className="ocean-input" placeholder="Full Name" value={newUser.name} onChange={e => setNewUser(p => ({ ...p, name: e.target.value }))} required />
                <input className="ocean-input" type="email" placeholder="Email" value={newUser.email} onChange={e => setNewUser(p => ({ ...p, email: e.target.value }))} required />
                <select className="ocean-input" value={newUser.role} onChange={e => setNewUser(p => ({ ...p, role: e.target.value as Role }))}>
                  {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <div className="flex gap-2">
                  <button type="submit" className="btn-primary flex-1 text-sm">Create</button>
                  <button type="button" onClick={() => setShowAddUser(false)} className="btn-secondary flex-1 text-sm">Cancel</button>
                </div>
              </form>
            )}

            <div className="overflow-x-auto">
              <table className="w-full ocean-table">
                <thead>
                  <tr><th>User</th><th>Email</th><th>Role</th><th>Joined</th><th>Records</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: roleBg[u.role], color: roleColor[u.role] }}>
                            {u.name.charAt(0)}
                          </div>
                          <span className="font-semibold text-white text-sm">{u.name}</span>
                        </div>
                      </td>
                      <td className="text-xs">{u.email}</td>
                      <td>
                        <select
                          value={u.role}
                          onChange={e => handleRoleChange(u.id, e.target.value as Role)}
                          disabled={u.id === user.id}
                          className="text-xs px-2 py-1 rounded-lg font-bold cursor-pointer border-0 outline-none"
                          style={{ background: roleBg[u.role], color: roleColor[u.role] }}
                        >
                          {ROLE_OPTIONS.map(r => (
                            <option key={r} value={r} style={{ background: '#051628', color: '#e2f4f4' }}>
                              {ROLE_ICONS[r]} {r}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="text-xs">{u.joined}</td>
                      <td><span className="badge-info">{u.records}</span></td>
                      <td>
                        <button
                          onClick={() => handleRemoveUser(u.id)}
                          disabled={u.id === user.id}
                          className="text-xs px-2.5 py-1 rounded-lg transition-all"
                          style={u.id === user.id
                            ? { color: 'rgba(248,113,113,0.3)', background: 'rgba(248,113,113,0.05)', cursor: 'not-allowed' }
                            : { color: '#f87171', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)' }}
                        >
                          {u.id === user.id ? 'Self' : 'Remove'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── Data Governance ─────────────────────────────────────────────── */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            <h2 className="font-bold text-white">Data Modification Requests</h2>
            {requests.map(r => (
              <div key={r.id} className="glass-card p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <code className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(61,214,195,0.1)', color: '#7ee8d8' }}>{r.id}</code>
                      <span className={r.type === 'DELETE' ? 'badge-danger' : 'badge-info'}>
                        {r.type === 'DELETE' ? '🗑️ DELETE' : '✏️ UPDATE'} — {r.target}
                      </span>
                      <span className={r.status === 'PENDING' ? 'badge-warning' : r.status === 'APPROVED' ? 'badge-active' : 'badge-danger'}>
                        {r.status}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-white mb-1">Requested by: {r.researcher}</p>
                    <p className="text-sm text-blue-200/70 leading-relaxed">{r.reason}</p>
                    <p className="text-xs text-blue-300/40 mt-2">Submitted: {r.date}</p>
                  </div>
                  {r.status === 'PENDING' && (
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => handleResolve(r.id, 'APPROVED')}
                        className="px-4 py-2 rounded-lg text-sm font-bold transition-all"
                        style={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.3)' }}>
                        ✓ Approve
                      </button>
                      <button onClick={() => handleResolve(r.id, 'REJECTED')}
                        className="px-4 py-2 rounded-lg text-sm font-bold transition-all"
                        style={{ background: 'rgba(248,113,113,0.15)', color: '#f87171', border: '1px solid rgba(248,113,113,0.3)' }}>
                        ✗ Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
