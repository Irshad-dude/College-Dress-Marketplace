import usePageTitle from '../hooks/usePageTitle';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MdAdd, MdInventory, MdCheckCircle, MdNotifications, MdChat, MdStorefront, MdShoppingBag } from 'react-icons/md';
import { getProducts } from '../services/productService';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { formatDate, formatPrice } from '../utils/helpers';

function StatCard({ icon, label, value }) {
  return (
    <div className="border border-black p-6 flex flex-col justify-between min-h-[140px] bg-white hover:bg-[#F5F5F5] transition-colors">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{label}</p>
        <div className="text-black text-xl">{icon}</div>
      </div>
      <p className="text-4xl font-bold uppercase tracking-tighter text-black">{value}</p>
    </div>
  );
}

export default function Dashboard() {
  usePageTitle('Dashboard');
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const [myProducts, setMyProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const isSeller = user?.role === 'seller';

  useEffect(() => {
    if (!user || !isSeller) {
      setLoading(false);
      return;
    }
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
  }, [user, isSeller]);

  const total  = myProducts.length;
  const active = myProducts.filter((p) => p.status === 'available').length;
  const sold   = myProducts.filter((p) => p.status === 'sold').length;

  return (
    <div>
      {/* Banner */}
      <div className="w-full h-48 md:h-64 mb-8 overflow-hidden relative bg-black">
        <img 
          src="/images/banner.jpg" 
          alt="Dashboard Banner" 
          className="absolute inset-0 w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 flex items-end p-8 bg-gradient-to-t from-black/80 to-transparent">
          <h2 className="text-white text-3xl font-bold uppercase tracking-widest">YOUR DASHBOARD</h2>
        </div>
      </div>

      {/* Welcome */}
      <div className="mb-10 pb-6 border-b border-gray-200">
        <h1 className="text-3xl font-bold uppercase tracking-tighter text-black mb-2">
          WELCOME BACK, {user?.name?.split(' ')[0]}
        </h1>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
          {isSeller ? "HERE IS WHAT'S HAPPENING WITH YOUR LISTINGS" : "BROWSE AND DISCOVER COLLEGE FASHION"}
        </p>
      </div>

      {/* Stats */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-${isSeller ? 4 : 2} gap-4 mb-12`}>
        {isSeller && (
          <>
            <StatCard icon={<MdInventory />}    label="TOTAL LISTED" value={loading ? '—' : total} />
            <StatCard icon={<MdAdd />}          label="ACTIVE"       value={loading ? '—' : active} />
            <StatCard icon={<MdCheckCircle />}  label="SOLD"         value={loading ? '—' : sold} />
          </>
        )}
        <StatCard icon={<MdNotifications />} label="UNREAD NOTIFICATIONS" value={unreadCount} />
        {!isSeller && (
          <StatCard icon={<MdShoppingBag />} label="ROLE" value="BUYER" />
        )}
      </div>

      {/* Quick Actions */}
      <div className="mb-12">
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">QUICK ACTIONS</h2>
        <div className="flex flex-wrap gap-4">
          {isSeller && (
            <>
              <Link to="/dashboard/add-product" className="btn-primary text-xs flex items-center gap-2 px-6">
                <MdAdd size={16} /> ADD PRODUCT
              </Link>
              <Link to="/dashboard/my-products" className="btn-secondary text-xs flex items-center gap-2 px-6">
                <MdInventory size={16} /> MY PRODUCTS
              </Link>
            </>
          )}

          {!isSeller && (
            <Link to="/products" className="btn-primary text-xs flex items-center gap-2 px-6">
              <MdStorefront size={16} /> BROWSE LISTINGS
            </Link>
          )}

          <Link to="/dashboard/chat" className="btn-secondary text-xs flex items-center gap-2 px-6 border-black hover:bg-black hover:text-white">
            <MdChat size={16} /> MESSAGES
          </Link>
          
          <Link to="/dashboard/notifications" className="btn-secondary text-xs flex items-center gap-2 px-6 border-black hover:bg-black hover:text-white">
            <MdNotifications size={16} /> NOTIFICATIONS
            {unreadCount > 0 && (
              <span className="ml-2 bg-[#E16E50] text-white text-[10px] px-2 py-0.5">
                {unreadCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Recent Listings (Sellers) */}
      {isSeller && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500">RECENT LISTINGS</h2>
            <Link to="/dashboard/my-products" className="text-[10px] font-bold uppercase tracking-widest border-b border-black hover:text-[#E16E50] hover:border-[#E16E50] transition-colors pb-0.5">
              VIEW ALL
            </Link>
          </div>
          
          <div className="border border-black bg-white">
            {loading ? (
              <div className="p-8 text-center text-xs font-bold uppercase tracking-widest text-gray-400">LOADING...</div>
            ) : myProducts.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center">
                <span className="text-4xl opacity-20 mb-4">👗</span>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">NO PRODUCTS LISTED YET</p>
                <Link to="/dashboard/add-product" className="btn-primary text-xs">ADD YOUR FIRST PRODUCT</Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-200 bg-[#F5F5F5]">
                      <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-gray-500">PRODUCT</th>
                      <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-gray-500">PRICE</th>
                      <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-gray-500">STATUS</th>
                      <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-gray-500 hidden sm:table-cell">LISTED</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myProducts.slice(0, 5).map((p) => (
                      <tr key={p._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-4">
                            {p.images?.[0] ? (
                              <img src={p.images[0]} alt="" loading="lazy" className="w-12 h-16 object-cover bg-gray-100 flex-shrink-0" />
                            ) : (
                              <div className="w-12 h-16 bg-[#F5F5F5] flex items-center justify-center text-lg flex-shrink-0">👔</div>
                            )}
                            <span className="text-xs font-bold uppercase tracking-widest max-w-[200px] truncate">{p.title}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm font-bold">{formatPrice(p.price)}</td>
                        <td className="py-4 px-6">
                          <span className={p.status === 'available' ? 'badge-available bg-black' : 'badge-sold'}>
                            {p.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-gray-400 hidden sm:table-cell">
                          {formatDate(p.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Buyer CTA */}
      {!isSeller && (
        <div className="border border-black p-12 text-center bg-[#F5F5F5]">
          <h2 className="text-2xl font-bold uppercase tracking-tighter mb-4">FIND YOUR PERFECT COLLEGE OUTFIT</h2>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-8">Browse listings from sellers in your college or department</p>
          <Link to="/products" className="btn-primary inline-flex items-center gap-2">
            <MdStorefront size={18} /> BROWSE ALL LISTINGS
          </Link>
        </div>
      )}
    </div>
  );
}
