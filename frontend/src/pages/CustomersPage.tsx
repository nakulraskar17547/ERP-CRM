import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/common/Navbar';
import { Sidebar } from '../components/common/Sidebar';
import { Modal } from '../components/common/Modal';
import { Customer, CustomerType, CustomerStatus } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Search, Plus, Phone, Mail, Building, Edit, Trash2, Calendar, FileText } from 'lucide-react';

export const CustomersPage: React.FC = () => {
  const { hasRole } = useAuth();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    customerName: '',
    mobileNumber: '',
    email: '',
    businessName: '',
    gstNumber: '',
    customerType: 'WHOLESALE' as CustomerType,
    address: '',
    status: 'LEAD' as CustomerStatus,
    followUpDate: '',
    notes: '',
  });

  const [noteData, setNoteData] = useState({
    note: '',
    followUpDate: '',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, [search, statusFilter, typeFilter]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.customerType = typeFilter;

      const res = await api.get('/customers', { params });
      if (res.data.success) {
        setCustomers(res.data.data.customers);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (selectedCustomer) {
        await api.put(`/customers/${selectedCustomer.id}`, formData);
      } else {
        await api.post('/customers', formData);
      }
      setIsAddModalOpen(false);
      resetForm();
      fetchCustomers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save customer');
    } finally {
      setSaving(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    setSaving(true);
    setError('');

    try {
      await api.post(`/customers/${selectedCustomer.id}/notes`, noteData);
      setIsNoteModalOpen(false);
      setNoteData({ note: '', followUpDate: '' });
      fetchCustomers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add note');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this customer record?')) return;
    try {
      await api.delete(`/customers/${id}`);
      fetchCustomers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete customer');
    }
  };

  const openEditModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormData({
      customerName: customer.customerName,
      mobileNumber: customer.mobileNumber,
      email: customer.email || '',
      businessName: customer.businessName,
      gstNumber: customer.gstNumber || '',
      customerType: customer.customerType,
      address: customer.address,
      status: customer.status,
      followUpDate: customer.followUpDate ? customer.followUpDate.split('T')[0] : '',
      notes: customer.notes || '',
    });
    setIsAddModalOpen(true);
  };

  const openNoteModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setNoteData({
      note: '',
      followUpDate: customer.followUpDate ? customer.followUpDate.split('T')[0] : '',
    });
    setIsNoteModalOpen(true);
  };

  const resetForm = () => {
    setSelectedCustomer(null);
    setFormData({
      customerName: '',
      mobileNumber: '',
      email: '',
      businessName: '',
      gstNumber: '',
      customerType: 'WHOLESALE',
      address: '',
      status: 'LEAD',
      followUpDate: '',
      notes: '',
    });
  };

  const getStatusBadge = (status: CustomerStatus) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="badge badge-success">ACTIVE</span>;
      case 'LEAD':
        return <span className="badge badge-warning">LEAD</span>;
      case 'INACTIVE':
        return <span className="badge badge-danger">INACTIVE</span>;
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-wrapper">
        <Navbar title="Customer CRM Management" />

        <main className="page-content">
          {/* Header Action & Filter Bar */}
          <div className="filter-bar">
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <div className="search-input-group">
                <Search size={18} color="#9ca3af" />
                <input
                  type="text"
                  placeholder="Search name, phone, company..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <select
                className="form-select"
                style={{ width: '150px' }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="LEAD">LEAD</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>

              <select
                className="form-select"
                style={{ width: '160px' }}
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">All Types</option>
                <option value="RETAIL">RETAIL</option>
                <option value="WHOLESALE">WHOLESALE</option>
                <option value="DISTRIBUTOR">DISTRIBUTOR</option>
              </select>
            </div>

            {hasRole('ADMIN', 'SALES', 'ACCOUNTS') && (
              <button
                className="btn btn-primary"
                onClick={() => {
                  resetForm();
                  setIsAddModalOpen(true);
                }}
              >
                <Plus size={18} /> Add New Customer
              </button>
            )}
          </div>

          {/* Customer Data Table */}
          <div className="glass-panel" style={{ padding: '1rem' }}>
            {loading ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>
                Fetching customer list...
              </div>
            ) : customers.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>
                No customers found matching search filters.
              </div>
            ) : (
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Customer & Business</th>
                      <th>Contact Info</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Follow-Up Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((c) => (
                      <tr key={c.id}>
                        <td>
                          <div style={{ fontWeight: 700, color: 'white' }}>{c.customerName}</div>
                          <div style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Building size={12} /> {c.businessName}
                            {c.gstNumber && ` (GST: ${c.gstNumber})`}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Phone size={12} color="#3b82f6" /> {c.mobileNumber}
                          </div>
                          {c.email && (
                            <div style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Mail size={12} /> {c.email}
                            </div>
                          )}
                        </td>
                        <td>
                          <span className="badge badge-info">{c.customerType}</span>
                        </td>
                        <td>{getStatusBadge(c.status)}</td>
                        <td>
                          {c.followUpDate ? (
                            <span style={{ color: '#fbbf24', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Calendar size={12} /> {c.followUpDate.split('T')[0]}
                            </span>
                          ) : (
                            <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>None scheduled</span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              title="Add Follow-up Note"
                              onClick={() => openNoteModal(c)}
                            >
                              <FileText size={14} /> Note
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              title="Edit Customer"
                              onClick={() => openEditModal(c)}
                            >
                              <Edit size={14} />
                            </button>
                            {hasRole('ADMIN', 'SALES') && (
                              <button
                                className="btn btn-danger btn-sm"
                                title="Delete Customer"
                                onClick={() => handleDelete(c.id)}
                              >
                                <Trash2 size={14} />
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

          {/* Add / Edit Customer Modal */}
          <Modal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            title={selectedCustomer ? 'Edit Customer Information' : 'Add New CRM Customer'}
          >
            <form onSubmit={handleCreateCustomer}>
              {error && (
                <div style={{ color: '#f87171', marginBottom: '1rem', fontSize: '0.85rem' }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Customer Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Business Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Mobile Number *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.mobileNumber}
                    onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">GST Number</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="27AAAAA0000A1Z5"
                    value={formData.gstNumber}
                    onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Customer Type</label>
                  <select
                    className="form-select"
                    value={formData.customerType}
                    onChange={(e) =>
                      setFormData({ ...formData, customerType: e.target.value as CustomerType })
                    }
                  >
                    <option value="RETAIL">Retail</option>
                    <option value="WHOLESALE">Wholesale</option>
                    <option value="DISTRIBUTOR">Distributor</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Lead Status</label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as CustomerStatus })
                    }
                  >
                    <option value="LEAD">Lead</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Full Address *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Follow-Up Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.followUpDate}
                  onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : selectedCustomer ? 'Update Customer' : 'Create Customer'}
                </button>
              </div>
            </form>
          </Modal>

          {/* Add Follow-up Note Modal */}
          <Modal
            isOpen={isNoteModalOpen}
            onClose={() => setIsNoteModalOpen(false)}
            title={`Follow-up Notes: ${selectedCustomer?.customerName}`}
          >
            <form onSubmit={handleAddNote}>
              {selectedCustomer?.notes && (
                <div
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    padding: '0.85rem',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    marginBottom: '1rem',
                    maxHeight: '150px',
                    overflowY: 'auto',
                    whiteSpace: 'pre-line',
                    color: '#9ca3af',
                  }}
                >
                  <strong style={{ color: 'white' }}>Previous History:</strong>
                  <br />
                  {selectedCustomer.notes}
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Add New Note *</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="e.g. Spoke regarding bulk price quotation. Requested updated catalog."
                  value={noteData.note}
                  onChange={(e) => setNoteData({ ...noteData, note: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Next Follow-Up Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={noteData.followUpDate}
                  onChange={(e) => setNoteData({ ...noteData, followUpDate: e.target.value })}
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsNoteModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Note'}
                </button>
              </div>
            </form>
          </Modal>
        </main>
      </div>
    </div>
  );
};
