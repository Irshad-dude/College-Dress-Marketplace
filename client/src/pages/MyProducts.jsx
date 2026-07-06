import usePageTitle from '../hooks/usePageTitle';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { MdEdit, MdDelete, MdCheckCircle, MdAdd } from 'react-icons/md';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { getProducts, updateProduct, deleteProduct, markAsSold } from '../services/productService';
import { useAuth } from '../context/AuthContext';
import { formatPrice, formatDate } from '../utils/helpers';
import Modal from '../components/Modal';
import { SIZES, CONDITIONS, DEPARTMENTS } from '../constants';

export default function MyProducts() {
  usePageTitle('My Products');
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 pb-6 border-b border-gray-200">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-3xl font-bold uppercase tracking-tighter text-black mb-1">MY PRODUCTS</h1>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500">{products.length} LISTING{products.length !== 1 ? 'S' : ''}</p>
        </div>
        <Link to="/dashboard/add-product" className="btn-primary text-xs flex items-center gap-2">
          <MdAdd size={16} /> ADD PRODUCT
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="border border-gray-200 p-4 animate-pulse">
              <div className="w-full h-[300px] bg-gray-100 mb-4" />
              <div className="h-4 bg-gray-100 w-3/4 mb-2" />
              <div className="h-4 bg-gray-100 w-1/2" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="border border-black bg-[#F5F5F5] p-16 text-center flex flex-col items-center">
          <span className="text-6xl opacity-20 mb-6">👗</span>
          <h2 className="text-2xl font-bold uppercase tracking-tighter mb-2">NO PRODUCTS YET</h2>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-8">START SELLING BY ADDING YOUR FIRST PRODUCT</p>
          <Link to="/dashboard/add-product" className="btn-primary">ADD PRODUCT</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
          {products.map((p) => (
            <div key={p._id} className="group flex flex-col">
              <div className="relative aspect-[3/4] bg-[#F5F5F5] mb-4">
                <img
                  src={p.images?.[0] || 'https://via.placeholder.com/300x400?text=No+Image'}
                  alt={p.title}
                  className="w-full h-full object-cover"
                />
                <span className={`absolute top-4 right-4 ${p.status === 'available' ? 'badge-available bg-black' : 'badge-sold'}`}>
                  {p.status}
                </span>
              </div>
              
              <div className="flex-1">
                <h3 className="text-sm font-bold uppercase tracking-widest text-black truncate mb-1">{p.title}</h3>
                <p className="text-sm font-bold text-black mb-4">{formatPrice(p.price)}</p>
                
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => openEdit(p)}
                    className="flex flex-col items-center justify-center gap-1 py-3 text-[10px] font-bold uppercase tracking-widest border border-gray-200 hover:border-black transition-colors"
                  >
                    <MdEdit size={16} /> EDIT
                  </button>
                  {p.status === 'available' ? (
                    <button
                      onClick={() => handleMarkSold(p._id)}
                      className="flex flex-col items-center justify-center gap-1 py-3 text-[10px] font-bold uppercase tracking-widest border border-gray-200 hover:border-black hover:bg-black hover:text-white transition-colors"
                    >
                      <MdCheckCircle size={16} /> SOLD
                    </button>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-1 py-3 text-[10px] font-bold uppercase tracking-widest border border-gray-200 text-gray-400 bg-gray-50">
                      <MdCheckCircle size={16} /> SOLD
                    </div>
                  )}
                  <button
                    onClick={() => setDeleteTarget(p)}
                    className="flex flex-col items-center justify-center gap-1 py-3 text-[10px] font-bold uppercase tracking-widest border border-gray-200 text-red-500 hover:border-red-500 hover:bg-red-50 transition-colors"
                  >
                    <MdDelete size={16} /> DELETE
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <Modal isOpen={!!editProduct} onClose={() => setEditProduct(null)} title="EDIT PRODUCT">
        {editProduct && (
          <form onSubmit={handleSubmit(handleEdit)} className="space-y-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">TITLE</p>
              <input {...register('title', { required: true })} className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black font-bold tracking-wider transition-colors bg-white" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">DESCRIPTION</p>
              <textarea {...register('description', { required: true })} rows={3} className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black font-bold tracking-wider transition-colors bg-white resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">PRICE (₹)</p>
                <input type="number" {...register('price', { required: true })} className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black font-bold tracking-wider transition-colors bg-white" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">SIZE</p>
                <select {...register('size')} className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black font-bold tracking-wider transition-colors bg-white">
                  {SIZES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">CONDITION</p>
                <select {...register('condition')} className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black font-bold tracking-wider transition-colors bg-white">
                  {CONDITIONS.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">DEPARTMENT</p>
                <select {...register('department')} className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black font-bold tracking-wider transition-colors bg-white">
                  <option value="">SELECT</option>
                  {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">COLLEGE NAME</p>
              <input {...register('collegeName', { required: true })} className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black font-bold tracking-wider transition-colors bg-white" />
            </div>
            <div className="flex gap-4 pt-4">
              <button type="submit" disabled={actionLoading} className="btn-primary flex-1">
                {actionLoading ? 'SAVING...' : 'SAVE CHANGES'}
              </button>
              <button type="button" onClick={() => setEditProduct(null)} className="btn-secondary flex-1">CANCEL</button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="DELETE PRODUCT">
        <p className="text-sm font-bold uppercase tracking-widest text-black mb-8 text-center leading-relaxed">
          ARE YOU SURE YOU WANT TO DELETE<br/>
          <span className="text-[#E16E50]">{deleteTarget?.title}</span>?
        </p>
        <div className="flex gap-4">
          <button
            onClick={handleDelete}
            disabled={actionLoading}
            className="flex-1 py-4 text-xs font-bold uppercase tracking-widest bg-red-500 text-white hover:bg-red-600 transition-colors"
          >
            {actionLoading ? 'DELETING...' : 'YES, DELETE'}
          </button>
          <button onClick={() => setDeleteTarget(null)} className="btn-secondary flex-1">CANCEL</button>
        </div>
      </Modal>
    </div>
  );
}
