import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/common/Navbar';
import { Sidebar } from '../components/common/Sidebar';
import { DashboardStats } from '../types';
import { api } from '../services/api';
import { Users, Package, AlertTriangle, FileSpreadsheet, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/stats');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="badge badge-success">CONFIRMED</span>;
      case 'DRAFT':
        return <span className="badge badge-warning">DRAFT</span>;
      case 'CANCELLED':
        return <span className="badge badge-danger">CANCELLED</span>;
      default:
        return <span className="badge badge-info">{status}</span>;
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-wrapper">
        <Navbar title="Operations Dashboard" />

        <main className="page-content">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
              Loading operational metrics...
            </div>
          ) : error ? (
            <div className="glass-panel" style={{ padding: '1.5rem', color: '#f87171' }}>
              {error}
            </div>
          ) : stats ? (
            <>
              {/* Stat Cards Row */}
              <div className="stats-grid">
                <div className="glass-panel stat-card">
                  <div>
                    <div className="stat-title">Total Customers</div>
                    <div className="stat-value">{stats.totalCustomers}</div>
                  </div>
                  <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
                    <Users size={24} />
                  </div>
                </div>

                <div className="glass-panel stat-card">
                  <div>
                    <div className="stat-title">Total Products</div>
                    <div className="stat-value">{stats.totalProducts}</div>
                  </div>
                  <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
                    <Package size={24} />
                  </div>
                </div>

                <div className="glass-panel stat-card">
                  <div>
                    <div className="stat-title">Low Stock Alerts</div>
                    <div className="stat-value" style={{ color: stats.lowStockCount > 0 ? '#f87171' : 'white' }}>
                      {stats.lowStockCount}
                    </div>
                  </div>
                  <div
                    className="stat-icon"
                    style={{
                      background: stats.lowStockCount > 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                      color: stats.lowStockCount > 0 ? '#f87171' : '#34d399',
                    }}
                  >
                    <AlertTriangle size={24} />
                  </div>
                </div>

                <div className="glass-panel stat-card">
                  <div>
                    <div className="stat-title">Recent Challans</div>
                    <div className="stat-value">{stats.recentChallans.length}</div>
                  </div>
                  <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                    <FileSpreadsheet size={24} />
                  </div>
                </div>
              </div>

              {/* Two Column Dashboard Layout */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
                {/* Low Stock Alerts Panel */}
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <AlertTriangle size={18} color="#f87171" /> Low Stock Inventory Alerts
                    </h3>
                    <Link to="/products?lowStock=true" style={{ color: '#3b82f6', fontSize: '0.85rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      View All <ArrowRight size={14} />
                    </Link>
                  </div>

                  {stats.lowStockProducts.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#34d399', fontSize: '0.9rem' }}>
                      ✅ All product inventory levels are healthy!
                    </div>
                  ) : (
                    <div className="table-container">
                      <table className="custom-table">
                        <thead>
                          <tr>
                            <th>SKU</th>
                            <th>Product Name</th>
                            <th>Current</th>
                            <th>Min Alert</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.lowStockProducts.map((p) => (
                            <tr key={p.id}>
                              <td style={{ fontWeight: 600, color: '#3b82f6' }}>{p.SKU}</td>
                              <td>{p.productName}</td>
                              <td style={{ color: '#f87171', fontWeight: 700 }}>{p.currentStock}</td>
                              <td style={{ color: '#9ca3af' }}>{p.minimumStockAlert}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Recent Challans Panel */}
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileSpreadsheet size={18} color="#34d399" /> Recent Sales Challans
                    </h3>
                    <Link to="/challans" style={{ color: '#3b82f6', fontSize: '0.85rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      View All <ArrowRight size={14} />
                    </Link>
                  </div>

                  {stats.recentChallans.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.9rem' }}>
                      No sales challans recorded yet.
                    </div>
                  ) : (
                    <div className="table-container">
                      <table className="custom-table">
                        <thead>
                          <tr>
                            <th>Challan #</th>
                            <th>Customer</th>
                            <th>Total Qty</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.recentChallans.map((c) => (
                            <tr key={c.id}>
                              <td style={{ fontWeight: 600, color: '#34d399' }}>{c.challanNumber}</td>
                              <td>{c.customer?.businessName || c.customer?.customerName}</td>
                              <td>{c.totalQuantity} items</td>
                              <td>{getStatusBadge(c.status)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : null}
        </main>
      </div>
    </div>
  );
};
