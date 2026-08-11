import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, LogOut } from 'lucide-react';

interface NavbarProps {
  title: string;
}

export const Navbar: React.FC<NavbarProps> = ({ title }) => {
  const { user, logout } = useAuth();

  return (
    <header className="header-navbar">
      <h1 className="page-title">{title}</h1>

      <div className="header-actions">
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#1f2937',
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#3b82f6',
              }}
            >
              <User size={18} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.fullName}</span>
              <span style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{user.email}</span>
            </div>
            <button
              onClick={logout}
              className="btn btn-secondary btn-sm"
              style={{ marginLeft: '1rem' }}
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
