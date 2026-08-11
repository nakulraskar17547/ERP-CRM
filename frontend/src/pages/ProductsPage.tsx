import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/common/Navbar';
import { Sidebar } from '../components/common/Sidebar';
import { Modal } from '../components/common/Modal';
import { Product, MovementType } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Search, Plus, Edit, Trash2, ArrowUpDown, AlertTriangle, MapPin, Tag } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

export const ProductsPage: React.FC = () => {
  const { hasRole } = useAuth();
  const [searchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(searchParams.get('lowStock') === 'true');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Forms
  const [formData, setFormData] = useState({
    productName: '',
    SKU: '',
    category: '',
    unitPrice: 0,
    currentStock: 0,
    minimumStockAlert: 10,
    warehouseLocation: '',
  });

  const [stockData, setStockData] = useState({
    quantityChanged: 1,
    movementType: 'IN' as MovementType,
    reason: '',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts();
  }, [search, categoryFilter, lowStockOnly]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;
      if (lowStockOnly) params.lowStockOnly = true;

      const res = await api.get('/products', { params });
      if (res.data.success) {
        setProducts(res.data.data.products);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (selectedProduct) {
        await api.put(`/products/${selectedProduct.id}`, formData);
      } else {
        await api.post('/products', formData);
      }
      setIsAddModalOpen(false);
      resetForm();
      fetchProducts();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setSaving(true);
    setError('');

    try {
      await api.post(`/products/${selectedProduct.id}/adjust-stock`, stockData);
      setIsStockModalOpen(false);
      setStockData({ quantityChanged: 1, movementType: 'IN', reason: '' });
      fetchProducts();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to adjust stock');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      productName: product.productName,
      SKU: product.SKU,
      category: product.category,
      unitPrice: product.unitPrice,
      currentStock: product.currentStock,
      minimumStockAlert: product.minimumStockAlert,
      warehouseLocation: product.warehouseLocation,
    });
    setIsAddModalOpen(true);
  };

  const openStockModal = (product: Product) => {
    setSelectedProduct(product);
    setStockData({
      quantityChanged: 1,
      movementType: 'IN',
      reason: 'Regular Warehouse Stock Restock',
    });
    setIsStockModalOpen(true);
  };

  const resetForm = () => {
    setSelectedProduct(null);
    setFormData({
      productName: '',
      SKU: '',
      category: '',
      unitPrice: 0,
      currentStock: 0,
      minimumStockAlert: 10,
      warehouseLocation: '',
    });
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-wrapper">
        <Navbar title="Products & Inventory Management" />

        <main className="page-content">
          {/* Action & Filter Bar */}
          <div className="filter-bar">
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <div className="search-input-group">
                <Search size={18} color="#9ca3af" />
                <input
                  type="text"
                  placeholder="Search SKU or product name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <input
                type="text"
                className="form-input"
                style={{ width: '180px' }}
                placeholder="Filter Category..."
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              />

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.85rem',
                  color: lowStockOnly ? '#f87171' : '#9ca3af',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                <input
                  type="checkbox"
                  checked={lowStockOnly}
                  onChange={(e) => setLowStockOnly(e.target.checked)}
                />
                <AlertTriangle size={14} /> Show Low Stock Only
              </label>
            </div>

            {hasRole('ADMIN', 'WAREHOUSE') && (
              <button
                className="btn btn-primary"
                onClick={() => {
                  resetForm();
                  setIsAddModalOpen(true);
                }}
              >
                <Plus size={18} /> Add New Product
              </button>
            )}
          </div>

          {/* Products Data Table */}
          <div className="glass-panel" style={{ padding: '1rem' }}>
            {loading ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>
                Loading product catalog...
              </div>
            ) : products.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>
                No products found matching criteria.
              </div>
            ) : (
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>SKU & Product Name</th>
                      <th>Category</th>
                      <th>Unit Price</th>
                      <th>Current Stock</th>
                      <th>Warehouse Location</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => {
                      const isLowStock = p.currentStock <= p.minimumStockAlert;
                      return (
                        <tr key={p.id}>
                          <td>
                            <div style={{ fontWeight: 700, color: '#3b82f6' }}>{p.SKU}</div>
                            <div style={{ fontSize: '0.9rem', color: 'white' }}>{p.productName}</div>
                          </td>
                          <td>
                            <span className="badge badge-info" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <Tag size={10} /> {p.category}
                            </span>
                          </td>
                          <td style={{ fontWeight: 700 }}>₹{p.unitPrice.toLocaleString('en-IN')}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span
                                style={{
                                  fontWeight: 800,
                                  fontSize: '1rem',
                                  color: isLowStock ? '#f87171' : '#34d399',
                                }}
                              >
                                {p.currentStock}
                              </span>
                              {isLowStock && (
                                <span className="badge badge-danger" title={`Min threshold: ${p.minimumStockAlert}`}>
                                  LOW STOCK
                                </span>
                              )}
                            </div>
                          </td>
                          <td>
                            <div style={{ fontSize: '0.85rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <MapPin size={12} /> {p.warehouseLocation}
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              {hasRole('ADMIN', 'WAREHOUSE') && (
                                <button
                                  className="btn btn-secondary btn-sm"
                                  title="Adjust Stock IN/OUT"
                                  onClick={() => openStockModal(p)}
                                >
                                  <ArrowUpDown size={14} /> Stock
                                </button>
                              )}
                              {hasRole('ADMIN', 'WAREHOUSE') && (
                                <button
                                  className="btn btn-secondary btn-sm"
                                  title="Edit Product"
                                  onClick={() => openEditModal(p)}
                                >
                                  <Edit size={14} />
                                </button>
                              )}
                              {hasRole('ADMIN', 'WAREHOUSE') && (
                                <button
                                  className="btn btn-danger btn-sm"
                                  title="Delete Product"
                                  onClick={() => handleDelete(p.id)}
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Add / Edit Product Modal */}
          <Modal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            title={selectedProduct ? 'Edit Product Details' : 'Add New Product to Catalog'}
          >
            <form onSubmit={handleCreateOrUpdateProduct}>
              {error && (
                <div style={{ color: '#f87171', marginBottom: '1rem', fontSize: '0.85rem' }}>
                  {error}
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">SKU Code *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. ELEC-001"
                    value={formData.SKU}
                    onChange={(e) => setFormData({ ...formData, SKU: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Electrical Components"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Unit Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
                    required
                  />
                </div>
                {!selectedProduct && (
                  <div className="form-group">
                    <label className="form-label">Initial Stock</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.currentStock}
                      onChange={(e) =>
                        setFormData({ ...formData, currentStock: Number(e.target.value) })
                      }
                    />
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Min Stock Alert</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.minimumStockAlert}
                    onChange={(e) =>
                      setFormData({ ...formData, minimumStockAlert: Number(e.target.value) })
                    }
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Warehouse Location *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Rack A-04, Sector 2"
                  value={formData.warehouseLocation}
                  onChange={(e) => setFormData({ ...formData, warehouseLocation: e.target.value })}
                  required
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
                  {saving ? 'Saving...' : selectedProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </Modal>

          {/* Adjust Stock Modal */}
          <Modal
            isOpen={isStockModalOpen}
            onClose={() => setIsStockModalOpen(false)}
            title={`Stock Adjustment: ${selectedProduct?.productName}`}
          >
            <form onSubmit={handleAdjustStock}>
              {error && (
                <div style={{ color: '#f87171', marginBottom: '1rem', fontSize: '0.85rem' }}>
                  {error}
                </div>
              )}

              <div
                style={{
                  background: 'rgba(59, 130, 246, 0.1)',
                  padding: '0.85rem',
                  borderRadius: '6px',
                  marginBottom: '1rem',
                  fontSize: '0.85rem',
                }}
              >
                Current Available Stock: <strong>{selectedProduct?.currentStock} units</strong>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Movement Type</label>
                  <select
                    className="form-select"
                    value={stockData.movementType}
                    onChange={(e) =>
                      setStockData({ ...stockData, movementType: e.target.value as MovementType })
                    }
                  >
                    <option value="IN">IN (+ Stock Restock)</option>
                    <option value="OUT">OUT (- Stock Audit / Damage)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    className="form-input"
                    value={stockData.quantityChanged}
                    onChange={(e) =>
                      setStockData({ ...stockData, quantityChanged: Number(e.target.value) })
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Audit Reason *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Shipment arrival from supplier / Stock Audit correction"
                  value={stockData.reason}
                  onChange={(e) => setStockData({ ...stockData, reason: e.target.value })}
                  required
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsStockModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Processing...' : 'Confirm Stock Adjustment'}
                </button>
              </div>
            </form>
          </Modal>
        </main>
      </div>
    </div>
  );
};
