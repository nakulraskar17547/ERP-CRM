import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/common/Navbar';
import { Sidebar } from '../components/common/Sidebar';
import { StockMovement, MovementType } from '../types';
import { api } from '../services/api';
import { ArrowDownLeft, ArrowUpRight, History, Calendar, UserCheck } from 'lucide-react';

export const InventoryPage: React.FC = () => {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStockMovements();
  }, [typeFilter]);

  const fetchStockMovements = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (typeFilter) params.movementType = typeFilter;

      const res = await api.get('/stock-movement', { params });
      if (res.data.success) {
        setMovements(res.data.data.movements);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch stock movements');
    } finally {
      setLoading(false);
    }
  };

  const getMovementBadge = (type: MovementType) => {
    if (type === 'IN') {
      return (
        <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <ArrowDownLeft size={12} /> IN (+ STOCK)
        </span>
      );
    }
    return (
      <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
        <ArrowUpRight size={12} /> OUT (- STOCK)
      </span>
    );
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-wrapper">
        <Navbar title="Stock Movement Audit History" />

        <main className="page-content">
          <div className="filter-bar">
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9ca3af', fontSize: '0.9rem' }}>
                <History size={18} /> Audit Filter:
              </div>
              <select
                className="form-select"
                style={{ width: '180px' }}
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">All Movement Types</option>
                <option value="IN">Stock IN (+)</option>
                <option value="OUT">Stock OUT (-)</option>
              </select>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1rem' }}>
            {loading ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>
                Fetching inventory movement ledger...
              </div>
            ) : error ? (
              <div style={{ padding: '1.5rem', color: '#f87171' }}>{error}</div>
            ) : movements.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>
                No stock movement audit records found.
              </div>
            ) : (
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Product & SKU</th>
                      <th>Movement Type</th>
                      <th>Quantity</th>
                      <th>Reason / Ref</th>
                      <th>Created By</th>
                      <th>Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movements.map((m) => (
                      <tr key={m.id}>
                        <td>
                          <div style={{ fontWeight: 700, color: 'white' }}>{m.product?.productName}</div>
                          <div style={{ fontSize: '0.8rem', color: '#3b82f6' }}>{m.product?.SKU}</div>
                        </td>
                        <td>{getMovementBadge(m.movementType)}</td>
                        <td
                          style={{
                            fontWeight: 800,
                            fontSize: '1rem',
                            color: m.movementType === 'IN' ? '#34d399' : '#f87171',
                          }}
                        >
                          {m.movementType === 'IN' ? `+${m.quantityChanged}` : `-${m.quantityChanged}`}
                        </td>
                        <td>{m.reason}</td>
                        <td>
                          <div style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <UserCheck size={12} color="#8b5cf6" /> {m.createdBy?.fullName}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>({m.createdBy?.role})</div>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={12} /> {new Date(m.timestamp).toLocaleString()}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
