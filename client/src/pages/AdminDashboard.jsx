import { useState, useEffect } from 'react';
import { MdDelete, MdWarning, MdShoppingBag, MdPeople } from 'react-icons/md';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Security check fallback
  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'products') {
        const { data } = await api.get('/products/admin/all');
        setProducts(data.products || []);
      } else {
        const { data } = await api.get('/auth/admin/users');
        setUsers(data.users || []);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to load ${activeTab}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('WARNING: Are you sure you want to permanently delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted successfully');
      setProducts(products.filter(p => p._id !== id));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete product');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('WARNING: Are you sure you want to permanently delete this user and ban their account?')) return;
    try {
      await api.delete(`/auth/admin/users/${id}`);
      toast.success('User deleted successfully');
      setUsers(users.filter(u => u._id !== id));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  return (
    <div className="bg-white">
      <div className="flex items-center justify-between mb-8 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-widest text-black flex items-center gap-3">
            <MdWarning className="text-red-600" /> Master Admin Panel
          </h1>
          <p className="text-sm text-gray-500 mt-2">Bypass filters to manage all platform data.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-6 py-3 text-xs font-bold tracking-widest uppercase transition-colors ${
            activeTab === 'products' ? 'bg-black text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          <MdShoppingBag size={16} /> All Products
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-6 py-3 text-xs font-bold tracking-widest uppercase transition-colors ${
            activeTab === 'users' ? 'bg-black text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          <MdPeople size={16} /> All Users
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-gray-500 text-xs font-bold uppercase tracking-widest animate-pulse">
          Loading Data...
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-200">
          {activeTab === 'products' ? (
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-100 text-xs uppercase tracking-widest text-black">
                <tr>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Seller</th>
                  <th className="px-6 py-4">College</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.length === 0 ? (
                  <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">No products found.</td></tr>
                ) : products.map(product => (
                  <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-black">{product.title}</td>
                    <td className="px-6 py-4">{product.sellerId?.name || 'Unknown'}</td>
                    <td className="px-6 py-4">{product.collegeName}</td>
                    <td className="px-6 py-4">₹{product.price}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteProduct(product._id)}
                        className="text-red-500 hover:text-red-700 transition-colors flex items-center gap-1 justify-end w-full font-bold text-[10px] tracking-widest uppercase"
                      >
                        <MdDelete size={16} /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-100 text-xs uppercase tracking-widest text-black">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">College</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.length === 0 ? (
                  <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">No users found.</td></tr>
                ) : users.map(u => (
                  <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-black flex items-center gap-3">
                      {u.name} {u._id === user.id && <span className="bg-black text-white text-[9px] px-2 py-0.5 rounded-full">YOU</span>}
                    </td>
                    <td className="px-6 py-4">{u.email}</td>
                    <td className="px-6 py-4 uppercase font-bold text-[10px] tracking-widest">{u.role}</td>
                    <td className="px-6 py-4">{u.collegeName}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteUser(u._id)}
                        disabled={u._id === user.id}
                        className={`transition-colors flex items-center gap-1 justify-end w-full font-bold text-[10px] tracking-widest uppercase ${u._id === user.id ? 'text-gray-300 cursor-not-allowed' : 'text-red-500 hover:text-red-700'}`}
                      >
                        <MdDelete size={16} /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
