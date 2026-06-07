import usePageTitle from '../hooks/usePageTitle';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MdAdd, MdInventory, MdCheckCircle, MdNotifications, MdChat } from 'react-icons/md';
import { getProducts } from '../services/productService';
import { getNotifications } from '../services/notificationService';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { formatDate, formatPrice } from '../utils/helpers';

function StatCard({ icon, label, value, color }) {
  return (
    <div className="card p-6 flex items-center gap-4">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-gray-500 text-sm">{label}</p>
        <p className="text-3xl font-extrabold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  usePageTitle('Dashboard'); // L25
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const [myProducts, setMyProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    // fetch seller's own products — we get all and filter by sellerId client-side for now
    // In a full implementation this would be GET /api/v1/products?sellerId=me
    getProducts({ limit: 100 })
      .then((res) => {
        const all = res.data.products || [];
        const mine = all.filter((p) => {
          const sid = typeof p.sellerId === 'object' ? p.sellerId._id : p.sellerId;
          return sid === user._id;
        });
        setMyProducts(mine);
      })
      .catch(() => setMyProducts([]))
      .finally(() => setLoading(false));
  }, [user]);

  const total = myProducts.length;
  const active = myProducts.filter((p) => p.status === 'available').length;
  const sold = myProducts.filter((p) => p.status === 'sold').length;

  return (
    <div>
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 mt-1">Here's what's happening with your listings</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<MdInventory />} label="Total Listed" value={loading ? '—' : total} color="bg-amber-50 text-amber-500" />
        <StatCard icon={<MdAdd />} label="Active" value={loading ? '—' : active} color="bg-green-50 text-green-500" />
        <StatCard icon={<MdCheckCircle />} label="Sold" value={loading ? '—' : sold} color="bg-blue-50 text-blue-500" />
        <StatCard icon={<MdNotifications />} label="Unread Notifications" value={unreadCount} color="bg-purple-50 text-purple-500" />
      </div>

      {/* Quick Actions */}
      <div className="card p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/dashboard/add-product" className="btn-primary flex items-center gap-2">
            <MdAdd /> Add Product
          </Link>
          <Link to="/dashboard/chat" className="btn-secondary flex items-center gap-2">
            <MdChat /> Messages
          </Link>
          <Link to="/dashboard/notifications" className="btn-secondary flex items-center gap-2">
            <MdNotifications /> Notifications
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Recent Products */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Recent Listings</h2>
          <Link to="/dashboard/my-products" className="text-amber-500 text-sm font-medium hover:text-amber-600">
            View all
          </Link>
        </div>
        {loading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : myProducts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">No products listed yet</p>
            <Link to="/dashboard/add-product" className="btn-primary">Add Your First Product</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-100">
                  <th className="pb-3 font-medium">Product</th>
                  <th className="pb-3 font-medium">Price</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Listed</th>
                </tr>
              </thead>
              <tbody>
                {myProducts.slice(0, 5).map((p) => (
                  <tr key={p._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images?.[0] || 'https://via.placeholder.com/40?text=?'}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                        />
                        <span className="font-medium text-gray-800 truncate max-w-[150px]">{p.title}</span>
                      </div>
                    </td>
                    <td className="py-3 text-amber-500 font-semibold">{formatPrice(p.price)}</td>
                    <td className="py-3">
                      <span className={p.status === 'available' ? 'badge-available' : 'badge-sold'}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 text-gray-400">{formatDate(p.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
