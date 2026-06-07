import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { MdEdit, MdDelete, MdCheckCircle, MdAdd } from 'react-icons/md';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { getProducts, updateProduct, deleteProduct, markAsSold } from '../services/productService';
import { useAuth } from '../context/AuthContext';
import { formatPrice, formatDate } from '../utils/helpers';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import { SIZES, CONDITIONS, DEPARTMENTS } from '../constants';

export default function MyProducts() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchMyProducts = async () => {
    try {
      const res = await getProducts({ limit: 100 });
      const all = res.data.products || [];
      const mine = all.filter((p) => {
        const sid = typeof p.sellerId === 'object' ? p.sellerId._id : p.sellerId;
        return sid === user._id;
      });
      setProducts(mine);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchMyProducts();
  }, [user]);

  const openEdit = (product) => {
    setEditProduct(product);
    reset({
      title: product.title,
      description: product.description,
      price: product.price,
      size: product.size,
      condition: product.condition,
      collegeName: product.collegeName,
      department: product.department || '',
    });
  };

  const handleEdit = async (data) => {
    setActionLoading(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([k, v]) => formData.append(k, v));
      await updateProduct(editProduct._id, formData);
      toast.success('Product updated!');
      setEditProduct(null);
      fetchMyProducts();
    } catch {
      toast.error('Update failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      await deleteProduct(deleteTarget._id);
      toast.success('Product deleted');
      setDeleteTarget(null);
      fetchMyProducts();
    } catch {
      toast.error('Delete failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkSold = async (id) => {
    try {
      await markAsSold(id);
      toast.success('Marked as sold!');
      fetchMyProducts();
    } catch {
      toast.error('Failed to update');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Products</h1>
          <p className="text-gray-500 mt-1">{products.length} listing{products.length !== 1 ? 's' : ''}</p>
        </div>
        <Link to="/dashboard/add-product" className="btn-primary flex items-center gap-2">
          <MdAdd /> Add Product
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="w-full h-48 bg-gray-100 rounded-xl mb-4" />
              <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          icon={<MdAdd className="text-5xl text-gray-300" />}
          title="No products yet"
          message="Start selling by adding your first product"
          actionLabel="Add Product"
          onAction={() => {}}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {products.map((p) => (
            <div key={p._id} className="card overflow-hidden group">
              <div className="relative">
                <img
                  src={p.images?.[0] || 'https://via.placeholder.com/300x200?text=No+Image'}
                  alt={p.title}
                  className="w-full h-48 object-cover"
                />
                <span className={`absolute top-2 right-2 ${p.status === 'available' ? 'badge-available' : 'badge-sold'}`}>
                  {p.status}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 truncate mb-1">{p.title}</h3>
                <p className="text-amber-500 font-bold mb-1">{formatPrice(p.price)}</p>
                <p className="text-xs text-gray-400 mb-4">{formatDate(p.createdAt)}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(p)}
                    className="flex-1 flex items-center justify-center gap-1 text-sm py-2 px-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                  >
                    <MdEdit /> Edit
                  </button>
                  {p.status === 'available' && (
                    <button
                      onClick={() => handleMarkSold(p._id)}
                      className="flex-1 flex items-center justify-center gap-1 text-sm py-2 px-3 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 transition-colors"
                    >
                      <MdCheckCircle /> Sold
                    </button>
                  )}
                  <button
                    onClick={() => setDeleteTarget(p)}
                    className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors"
                  >
                    <MdDelete />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <Modal isOpen={!!editProduct} onClose={() => setEditProduct(null)} title="Edit Product">
        {editProduct && (
          <form onSubmit={handleSubmit(handleEdit)} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input {...register('title', { required: true })} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea {...register('description', { required: true })} rows={3} className="input resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                <input type="number" {...register('price', { required: true })} className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                <select {...register('size')} className="input">
                  {SIZES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                <select {...register('condition')} className="input">
                  {CONDITIONS.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select {...register('department')} className="input">
                  <option value="">Select</option>
                  {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">College Name</label>
              <input {...register('collegeName', { required: true })} className="input" />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={actionLoading} className="btn-primary flex-1">
                {actionLoading ? 'Saving...' : 'Save Changes'}
              </button>
              <button type="button" onClick={() => setEditProduct(null)} className="btn-secondary flex-1">Cancel</button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Product">
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete <strong>"{deleteTarget?.title}"</strong>? This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={handleDelete}
            disabled={actionLoading}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-xl transition-colors"
          >
            {actionLoading ? 'Deleting...' : 'Delete'}
          </button>
          <button onClick={() => setDeleteTarget(null)} className="btn-secondary flex-1">Cancel</button>
        </div>
      </Modal>
    </div>
  );
}
