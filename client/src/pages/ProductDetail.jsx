import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  MdSchool, MdCategory, MdStraighten, MdStar, MdArrowBack,
  MdFavorite, MdChat, MdCheckCircle, MdShare
} from 'react-icons/md';
import { getProductById, expressInterest, markAsSold } from '../services/productService';
import { createOrGetChat } from '../services/chatService';
import { useAuth } from '../context/AuthContext';
import { formatPrice, formatDate, getInitials } from '../utils/helpers';
import Loader from '../components/Loader';

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [interestLoading, setInterestLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [soldLoading, setSoldLoading] = useState(false);

  useEffect(() => {
    getProductById(id)
      .then((res) => setProduct(res.data.product || res.data))
      .catch(() => toast.error('Product not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader />;
  if (!product) return (
    <div className="max-w-2xl mx-auto py-24 text-center">
      <p className="text-gray-500 text-lg">Product not found.</p>
      <Link to="/products" className="btn-primary mt-4 inline-block">Back to listings</Link>
    </div>
  );

  const isSeller = user && product.sellerId && (product.sellerId._id === user._id || product.sellerId === user._id);
  const seller = product.sellerId;

  const handleInterest = async () => {
    if (!user) return navigate('/login');
    setInterestLoading(true);
    try {
      await expressInterest(id);
      toast.success('Interest sent! The seller has been notified.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send interest');
    } finally {
      setInterestLoading(false);
    }
  };

  const handleMessageSeller = async () => {
    if (!user) return navigate('/login');
    setChatLoading(true);
    try {
      const sellerId = typeof seller === 'object' ? seller._id : seller;
      await createOrGetChat({ sellerId, productId: id });
      navigate('/dashboard/chat');
    } catch {
      toast.error('Could not start chat');
    } finally {
      setChatLoading(false);
    }
  };

  const handleMarkSold = async () => {
    setSoldLoading(true);
    try {
      await markAsSold(id);
      setProduct((p) => ({ ...p, status: 'sold' }));
      toast.success('Product marked as sold!');
    } catch {
      toast.error('Failed to update status');
    } finally {
      setSoldLoading(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.info('Link copied to clipboard!');
  };

  const images = product.images?.length > 0
    ? product.images
    : ['https://via.placeholder.com/600x400?text=No+Image'];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-gray-500 hover:text-gray-800 mb-6 transition-colors">
        <MdArrowBack /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Images */}
        <div>
          <div className="rounded-2xl overflow-hidden bg-gray-100 aspect-square mb-3 relative">
            {product.status === 'sold' && (
              <div className="absolute inset-0 bg-black/40 z-10 flex items-center justify-center">
                <span className="text-white text-3xl font-extrabold tracking-widest bg-red-500 px-6 py-2 rounded-full">SOLD</span>
              </div>
            )}
            <img
              src={images[activeImg]}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 flex-wrap">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${activeImg === i ? 'border-amber-500 shadow-md' : 'border-transparent'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          {/* Status badge */}
          <span className={product.status === 'available' ? 'badge-available' : 'badge-sold'}>
            {product.status === 'available' ? '● Available' : '● Sold'}
          </span>

          <h1 className="text-3xl font-bold text-gray-900 mt-3 mb-2">{product.title}</h1>
          <p className="text-4xl font-extrabold text-amber-500 mb-5">{formatPrice(product.price)}</p>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-700">
              <MdStraighten /> Size: {product.size}
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-700">
              <MdStar /> {product.condition}
            </span>
            {product.department && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-700">
                <MdCategory /> {product.department}
              </span>
            )}
          </div>

          {/* College */}
          <div className="flex items-center gap-2 text-gray-600 mb-4">
            <MdSchool className="text-amber-500 text-xl" />
            <span className="font-medium">{product.collegeName}</span>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-2">Description</h3>
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          </div>

          {/* Posted date */}
          <p className="text-sm text-gray-400 mb-6">Listed on {formatDate(product.createdAt)}</p>

          {/* Seller card */}
          {seller && typeof seller === 'object' && (
            <div className="card p-4 flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center text-lg flex-shrink-0">
                {seller.profileImage
                  ? <img src={seller.profileImage} className="w-full h-full rounded-full object-cover" alt="" />
                  : getInitials(seller.name)}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{seller.name}</p>
                <p className="text-sm text-gray-500">Seller</p>
              </div>
            </div>
          )}

          {/* Actions */}
          {isSeller ? (
            <div className="flex flex-col gap-3">
              {product.status === 'available' && (
                <button
                  onClick={handleMarkSold}
                  disabled={soldLoading}
                  className="btn-primary flex items-center justify-center gap-2"
                >
                  <MdCheckCircle /> {soldLoading ? 'Updating...' : 'Mark as Sold'}
                </button>
              )}
              <Link to="/dashboard/my-products" className="btn-secondary text-center">
                Manage My Products
              </Link>
            </div>
          ) : product.status === 'available' ? (
            <div className="flex flex-col gap-3">
              <button
                onClick={handleInterest}
                disabled={interestLoading}
                className="btn-primary flex items-center justify-center gap-2"
              >
                <MdFavorite /> {interestLoading ? 'Sending...' : 'Interested in Buying'}
              </button>
              <button
                onClick={handleMessageSeller}
                disabled={chatLoading}
                className="btn-secondary flex items-center justify-center gap-2"
              >
                <MdChat /> {chatLoading ? 'Opening...' : 'Message Seller'}
              </button>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-center text-red-500 font-medium">
              This item has already been sold
            </div>
          )}

          {/* Share */}
          <button onClick={handleShare} className="mt-4 flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors">
            <MdShare /> Share listing
          </button>
        </div>
      </div>
    </div>
  );
}
