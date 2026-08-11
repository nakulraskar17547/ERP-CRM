import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/common/Navbar';
import { Sidebar } from '../components/common/Sidebar';
import { Modal } from '../components/common/Modal';
import { Challan, Customer, Product, ChallanStatus } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Plus,
  Search,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  Building,
  Calendar,
  Printer,
} from 'lucide-react';

export const ChallansPage: React.FC = () => {
  const { hasRole } = useAuth();

  const [challans, setChallans] = useState<Challan[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedChallan, setSelectedChallan] = useState<Challan | null>(null);

  // Dynamic Sales Challan Builder Form state
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [challanStatus, setChallanStatus] = useState<ChallanStatus>('DRAFT');
  const [items, setItems] = useState<Array<{ productId: string; quantity: number }>>([
    { productId: '', quantity: 1 },
  ]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchChallans();
  }, [search, statusFilter]);

  const fetchChallans = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const res = await api.get('/challans', { params });
      if (res.data.success) {
        setChallans(res.data.data.challans);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch sales challans');
    } finally {
      setLoading(false);
    }
  };

  const loadDropdownData = async () => {
    try {
      const [custRes, prodRes] = await Promise.all([
        api.get('/customers?limit=100'),
        api.get('/products?limit=100'),
      ]);
      if (custRes.data.success) setCustomers(custRes.data.data.customers);
      if (prodRes.data.success) setProducts(prodRes.data.data.products);
    } catch (err) {
      console.error('Error loading dropdown data:', err);
    }
  };

  const handleOpenCreateModal = () => {
    loadDropdownData();
    setSelectedCustomerId('');
    setChallanStatus('DRAFT');
    setItems([{ productId: '', quantity: 1 }]);
    setError('');
    setIsCreateModalOpen(true);
  };

  const handleAddItemRow = () => {
    setItems([...items, { productId: '', quantity: 1 }]);
  };

  const handleRemoveItemRow = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: 'productId' | 'quantity', value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleCreateChallan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      setError('Please select a customer');
      return;
    }

    if (items.some((i) => !i.productId)) {
      setError('Please select a product for each line item');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await api.post('/challans', {
        customerId: selectedCustomerId,
        status: challanStatus,
        items,
      });
      setIsCreateModalOpen(false);
      fetchChallans();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate Sales Challan');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (challanId: string, newStatus: ChallanStatus) => {
    try {
      await api.put(`/challans/${challanId}/status`, { status: newStatus });
      fetchChallans();
      if (selectedChallan && selectedChallan.id === challanId) {
        setIsDetailModalOpen(false);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update challan status');
    }
  };

  const openDetailModal = async (id: string) => {
    try {
      const res = await api.get(`/challans/${id}`);
      if (res.data.success) {
        setSelectedChallan(res.data.data);
        setIsDetailModalOpen(true);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to load challan details');
    }
  };

  const getStatusBadge = (status: ChallanStatus) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="badge badge-success">CONFIRMED</span>;
      case 'DRAFT':
        return <span className="badge badge-warning">DRAFT</span>;
      case 'CANCELLED':
        return <span className="badge badge-danger">CANCELLED</span>;
    }
  };

  const calculateEstimatedTotal = () => {
    let grandTotal = 0;
    const prodMap = new Map(products.map((p) => [p.id, p]));
    for (const item of items) {
      const prod = prodMap.get(item.productId);
      if (prod) {
        grandTotal += prod.unitPrice * (item.quantity || 0);
      }
    }
    return grandTotal;
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-wrapper">
        <Navbar title="Sales Challan Workflow Management" />

        <main className="page-content">
          <div className="filter-bar">
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <div className="search-input-group">
                <Search size={18} color="#9ca3af" />
                <input
                  type="text"
                  placeholder="Search Challan # or Customer..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <select
                className="form-select"
                style={{ width: '160px' }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="DRAFT">DRAFT</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>

            {hasRole('ADMIN', 'SALES') && (
              <button className="btn btn-primary" onClick={handleOpenCreateModal}>
                <Plus size={18} /> Create Sales Challan
              </button>
            )}
          </div>

          <div className="glass-panel" style={{ padding: '1rem' }}>
            {loading ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>
                Fetching sales challan records...
              </div>
            ) : challans.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>
                No sales challans recorded yet.
              </div>
            ) : (
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Challan Number</th>
                      <th>Customer & Business</th>
                      <th>Total Items</th>
                      <th>Grand Total</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {challans.map((ch) => (
                      <tr key={ch.id}>
                        <td>
                          <div style={{ fontWeight: 800, color: '#34d399' }}>{ch.challanNumber}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: 'white' }}>{ch.customer?.customerName}</div>
                          <div style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Building size={12} /> {ch.customer?.businessName}
                          </div>
                        </td>
                        <td style={{ fontWeight: 600 }}>{ch.totalQuantity} units</td>
                        <td style={{ fontWeight: 700, color: '#3b82f6' }}>
                          ₹{ch.totalAmount.toLocaleString('en-IN')}
                        </td>
                        <td>{getStatusBadge(ch.status)}</td>
                        <td>
                          <div style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={12} /> {new Date(ch.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              title="View Invoice & Challan Details"
                              onClick={() => openDetailModal(ch.id)}
                            >
                              <Eye size={14} /> View
                            </button>

                            {ch.status === 'DRAFT' && (
                              <button
                                className="btn btn-primary btn-sm"
                                title="Confirm Challan & Deduct Inventory Stock"
                                onClick={() => handleUpdateStatus(ch.id, 'CONFIRMED')}
                              >
                                <CheckCircle size={14} /> Confirm
                              </button>
                            )}

                            {ch.status !== 'CANCELLED' && (
                              <button
                                className="btn btn-danger btn-sm"
                                title="Cancel Challan"
                                onClick={() => handleUpdateStatus(ch.id, 'CANCELLED')}
                              >
                                <XCircle size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <Modal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            title="Generate New Sales Challan"
          >
            <form onSubmit={handleCreateChallan}>
              {error && (
                <div
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    color: '#f87171',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    marginBottom: '1rem',
                    fontSize: '0.85rem',
                  }}
                >
                  {error}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Select Customer *</label>
                  <select
                    className="form-select"
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    required
                  >
                    <option value="">-- Choose Customer --</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.customerName} ({c.businessName})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Initial Status</label>
                  <select
                    className="form-select"
                    value={challanStatus}
                    onChange={(e) => setChallanStatus(e.target.value as ChallanStatus)}
                  >
                    <option value="DRAFT">Save as DRAFT</option>
                    <option value="CONFIRMED">CONFIRMED (Deduct Stock)</option>
                  </select>
                </div>
              </div>

              <div style={{ margin: '1.25rem 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <label className="form-label">Product Line Items *</label>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={handleAddItemRow}
                  >
                    <Plus size={14} /> Add Product Row
                  </button>
                </div>

                {items.map((item, index) => {
                  const selectedProd = products.find((p) => p.id === item.productId);
                  return (
                    <div
                      key={index}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '3fr 1fr 1fr auto',
                        gap: '0.75rem',
                        alignItems: 'center',
                        marginBottom: '0.75rem',
                        background: 'rgba(255,255,255,0.02)',
                        padding: '0.5rem',
                        borderRadius: '6px',
                      }}
                    >
                      <div>
                        <select
                          className="form-select"
                          value={item.productId}
                          onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                          required
                        >
                          <option value="">-- Select Product --</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.SKU} - {p.productName} (Avail: {p.currentStock} | ₹{p.unitPrice})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <input
                          type="number"
                          min="1"
                          className="form-input"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(index, 'quantity', Number(e.target.value))
                          }
                          required
                        />
                      </div>

                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#3b82f6' }}>
                        ₹{selectedProd ? (selectedProd.unitPrice * (item.quantity || 0)).toLocaleString('en-IN') : '0'}
                      </div>

                      <div>
                        {items.length > 1 && (
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => handleRemoveItemRow(index)}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div
                style={{
                  background: 'rgba(59, 130, 246, 0.1)',
                  padding: '1rem',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem',
                }}
              >
                <span style={{ fontSize: '0.9rem', color: '#9ca3af' }}>Estimated Grand Total:</span>
                <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#34d399' }}>
                  ₹{calculateEstimatedTotal().toLocaleString('en-IN')}
                </span>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Generating...' : 'Save & Generate Sales Challan'}
                </button>
              </div>
            </form>
          </Modal>

          <Modal
            isOpen={isDetailModalOpen}
            onClose={() => setIsDetailModalOpen(false)}
            title={`Sales Challan Invoice #${selectedChallan?.challanNumber}`}
          >
            {selectedChallan && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                  <div>
                    <h4 style={{ color: '#3b82f6', fontSize: '1.1rem' }}>{selectedChallan.customer?.businessName}</h4>
                    <p style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Customer: {selectedChallan.customer?.customerName}</p>
                    <p style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Mobile: {selectedChallan.customer?.mobileNumber}</p>
                    {selectedChallan.customer?.address && (
                      <p style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Address: {selectedChallan.customer.address}</p>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ marginBottom: '4px' }}>{getStatusBadge(selectedChallan.status)}</div>
                    <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                      Date: {new Date(selectedChallan.createdAt).toLocaleString()}
                    </p>
                    <p style={{ fontSize: '0.8rem', color: '#8b5cf6' }}>
                      Generated By: {selectedChallan.createdBy?.fullName}
                    </p>
                  </div>
                </div>

                <h5 style={{ marginBottom: '0.75rem', fontSize: '0.9rem', color: '#9ca3af' }}>Line Items Snapshot</h5>
                <div className="table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Product Name</th>
                        <th>Unit Price</th>
                        <th>Qty</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedChallan.items?.map((item) => (
                        <tr key={item.id}>
                          <td>{item.productName}</td>
                          <td>₹{item.unitPrice.toLocaleString('en-IN')}</td>
                          <td>{item.quantity}</td>
                          <td style={{ fontWeight: 700 }}>₹{item.subtotal.toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div
                  style={{
                    marginTop: '1.5rem',
                    padding: '1rem',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Total Items Quantity: </span>
                    <strong>{selectedChallan.totalQuantity} units</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Grand Total: </span>
                    <strong style={{ fontSize: '1.3rem', color: '#34d399' }}>
                      ₹{selectedChallan.totalAmount.toLocaleString('en-IN')}
                    </strong>
                  </div>
                </div>

                <div className="modal-footer" style={{ marginTop: '1.5rem' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => window.print()}
                  >
                    <Printer size={16} /> Print Challan
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setIsDetailModalOpen(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </Modal>
        </main>
      </div>
    </div>
  );
};
