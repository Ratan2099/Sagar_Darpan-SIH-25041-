'use client';
import { useAuth, Role } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';

const NAV_LINKS: Record<Role, { href: string; label: string; icon: string }[]> = {
  ADMIN: [
    { href: '/admin', label: 'Admin Panel', icon: '⚡' },
    { href: '/research', label: 'Research', icon: '🔬' },
    { href: '/dashboard', label: 'Public Dashboard', icon: '🌊' },
  ],
  RESEARCHER: [
    { href: '/research', label: 'Research Portal', icon: '🔬' },
    { href: '/dashboard', label: 'Public Dashboard', icon: '🌊' },
  ],
  FISHERMAN: [
    { href: '/fisherman', label: 'My Portal', icon: '🐟' },
  ],
  GENERAL: [
    { href: '/dashboard', label: 'Ocean Dashboard', icon: '🌊' },
  ],
};

const ROLE_BADGE: Record<Role, { label: string; style: React.CSSProperties }> = {
  ADMIN: { label: 'ADMIN', style: { background: 'rgba(168,85,247,0.2)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.4)' } },
  RESEARCHER: { label: 'RESEARCHER', style: { background: 'rgba(59,130,246,0.2)', color: '#93c5fd', border: '1px solid rgba(59,130,246,0.4)' } },
  FISHERMAN: { label: 'FISHERMAN', style: { background: 'rgba(20,184,166,0.2)', color: '#5eead4', border: '1px solid rgba(20,184,166,0.4)' } },
  GENERAL: { label: 'GENERAL USER', style: { background: 'rgba(100,116,139,0.2)', color: '#94a3b8', border: '1px solid rgba(100,116,139,0.4)' } },
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!user) return null;

  const links = NAV_LINKS[user.role];
  const badge = ROLE_BADGE[user.role];

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <nav style={{ background: 'rgba(5,22,40,0.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(61,214,195,0.15)', position: 'sticky', top: 0, zIndex: 50 }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button onClick={() => router.push(links[0].href)} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <span className="text-2xl">🌊</span>
            <div className="text-left">
              <p className="font-black text-base gradient-text leading-none">Sagar Darpan</p>
              <p className="text-xs" style={{ color: 'rgba(126,232,216,0.5)', letterSpacing: '0.1em' }}>MIRROR OF THE OCEAN</p>
            </div>
          </button>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map(link => (
              <button
                key={link.href}
                onClick={() => router.push(link.href)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2`}
                style={pathname.startsWith(link.href)
                  ? { background: 'rgba(61,214,195,0.15)', color: '#3dd6c3', border: '1px solid rgba(61,214,195,0.3)' }
                  : { color: 'rgba(126,232,216,0.6)', background: 'transparent', border: '1px solid transparent' }
                }
              >
                <span>{link.icon}</span>
                {link.label}
              </button>
            ))}
          </div>

          {/* User info & logout */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-semibold text-white">{user.fullName}</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={badge.style}>{badge.label}</span>
            </div>
            <button onClick={handleLogout} className="btn-secondary text-sm px-3 py-2">
              Sign Out
            </button>
            {/* Mobile menu toggle */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-seafoam-400 p-1" style={{color:'#3dd6c3'}}>
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden pb-3 space-y-1">
            {links.map(link => (
              <button
                key={link.href}
                onClick={() => { router.push(link.href); setMenuOpen(false); }}
                className="flex items-center gap-2 w-full px-4 py-3 rounded-lg text-sm font-semibold transition-all"
                style={pathname.startsWith(link.href)
                  ? { background: 'rgba(61,214,195,0.15)', color: '#3dd6c3' }
                  : { color: 'rgba(126,232,216,0.6)' }
                }
              >
                <span>{link.icon}</span>
                {link.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
