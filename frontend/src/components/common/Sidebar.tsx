import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Package,
  Boxes,
  FileSpreadsheet,
  LogOut,
  ShieldCheck,
  Layers,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="brand-icon">
          <Layers size={22} color="#ffffff" />
        </div>
        <div>
          <div className="brand-title">ManageX</div>
          <div className="brand-subtitle">Enterprise Operations</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink
          to="/"
          className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          end
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/customers"
          className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
        >
          <Users size={20} />
          <span>Customer CRM</span>
        </NavLink>

        <NavLink
          to="/products"
          className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
        >
          <Package size={20} />
          <span>Products</span>
        </NavLink>

        <NavLink
          to="/inventory"
          className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
        >
          <Boxes size={20} />
          <span>Stock History</span>
        </NavLink>

        <NavLink
          to="/challans"
          className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
        >
          <FileSpreadsheet size={20} />
          <span>Sales Challans</span>
        </NavLink>
      </nav>

      {user && (
        <div className="user-badge-footer">
          <div className="user-info">
            <span className="user-name">{user.fullName}</span>
            <span className="user-role" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={12} /> {user.role}
            </span>
          </div>
          <button
            onClick={logout}
            className="btn btn-secondary btn-sm"
            title="Log Out"
            style={{ padding: '0.4rem' }}
          >
            <LogOut size={16} />
          </button>
        </div>
      )}
    </aside>
  );
};
