import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  MdSchool, MdCategory, MdStraighten, MdStar, MdArrowBack,
  MdFavorite, MdFavoriteBorder, MdChat, MdCheckCircle, MdShare
} from 'react-icons/md';
import { getProductById, expressInterest, markAsSold } from '../services/productService';
import { createOrGetChat, sendMessage } from '../services/chatService';
import { useAuth } from '../context/AuthContext';
import { formatPrice, formatDate, getInitials } from '../utils/helpers';
import Loader from '../components/Loader';
import usePageTitle from '../hooks/usePageTitle';
import DraggableShowcase from '../components/DraggableShowcase';

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
  const [liked, setLiked] = useState(false);

  usePageTitle(product?.title || 'Product Details');

  useEffect(() => {
    getProductById(id)
      .then((res) => setProduct(res.data.product || res.data))
      .catch(() => toast.error('Product not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader />;
  if (!product) return (
    <div className="max-w-[1500px] mx-auto py-32 px-4 text-center">
      <h2 className="text-4xl font-bold uppercase tracking-tighter mb-4">PRODUCT NOT FOUND</h2>
      <p className="text-gray-500 uppercase tracking-widest text-sm mb-8">The item you are looking for does not exist or has been removed.</p>
      <Link to="/products" className="btn-primary">BACK TO SHOP</Link>
    </div>
  );

  const isSeller = user && product.sellerId && (product.sellerId._id === user._id || product.sellerId === user._id);
  const seller = product.sellerId;

  const handleInterest = async () => {
    if (!user) return navigate('/login');
    setInterestLoading(true);
    try {
      const sellerId = typeof seller === 'object' ? seller._id : seller;
      const chatRes = await createOrGetChat({ sellerId, productId: id });
      const chatId = chatRes.data?.chat?._id || chatRes.data?._id;
      
      if (chatId) {
        await sendMessage({
          chatId,
          message: `I am interested in your item: ${product.title}`
        });
      }
      
      await expressInterest(id);
      toast.success('Interest sent! The seller has been notified.');
      navigate('/dashboard/chat');
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

  const FALLBACK_IMG = null;
  const images = product.images?.length > 0 ? product.images : [FALLBACK_IMG];

  return (
    <div className="max-w-[1500px] mx-auto px-4 md:px-8 py-8 md:py-12">
      
      {/* ── Breadcrumb / Back ───────────────────────────────────── */}
      <div className="mb-8">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black transition-colors"
        >
          <MdArrowBack size={16} /> BACK
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
        
        {/* ── Images Column ────────────────────────────────────────── */}
        <div className="w-full lg:w-3/5">
          {/* Main Image */}
          <div className="relative bg-[#F5F5F5] aspect-[3/4] md:aspect-auto md:h-[80vh] w-full mb-4">
            {product.status === 'sold' && (
              <div className="absolute inset-0 bg-black/40 z-10 flex items-center justify-center">
                <span className="text-white text-3xl md:text-5xl font-bold uppercase tracking-[0.3em] border-2 border-white px-8 py-4 rotate-[-5deg]">
                  SOLD OUT
                </span>
              </div>
            )}
            {images[activeImg] ? (
              <img
                src={images[activeImg]}
                alt={product.title}
                loading="eager"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-8xl opacity-20">👔</span>
              </div>
            )}
            
            {/* Wishlist Heart Overlay */}
            <button
              onClick={() => setLiked(!liked)}
              className="absolute top-6 right-6 z-20 w-12 h-12 flex items-center justify-center bg-white rounded-full hover:scale-105 transition-transform shadow-lg"
            >
              {liked ? <MdFavorite size={24} className="text-[#E16E50]" /> : <MdFavoriteBorder size={24} className="text-black" />}
            </button>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`relative w-24 h-32 shrink-0 bg-[#F5F5F5] transition-all ${
                    activeImg === i ? 'ring-2 ring-black ring-offset-2' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Details Column ───────────────────────────────────────── */}
        <div className="w-full lg:w-2/5 flex flex-col pt-4">
          
          <div className="mb-8">
            <span className={product.status === 'available' ? 'badge-available' : 'badge-sold'}>
              {product.status === 'available' ? 'AVAILABLE NOW' : 'SOLD OUT'}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-black uppercase tracking-tighter mt-4 leading-[1.1]">
              {product.title}
            </h1>
            <p className="text-2xl font-bold text-black mt-4">
              {formatPrice(product.price)}
            </p>
          </div>

          {/* Product Details Grid */}
          <div className="grid grid-cols-2 gap-y-6 gap-x-8 mb-10 py-6 border-y border-gray-200">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">SIZE</p>
              <p className="text-sm font-bold uppercase tracking-widest text-black flex items-center gap-2">
                <MdStraighten className="text-gray-400" /> {product.size}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">CONDITION</p>
              <p className="text-sm font-bold uppercase tracking-widest text-black flex items-center gap-2">
                <MdStar className="text-gray-400" /> {product.condition}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">COLLEGE</p>
              <p className="text-sm font-bold uppercase tracking-widest text-black flex items-center gap-2">
                <MdSchool className="text-gray-400" /> {product.collegeName}
              </p>
            </div>
            {product.department && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">DEPARTMENT</p>
                <p className="text-sm font-bold uppercase tracking-widest text-black flex items-center gap-2">
                  <MdCategory className="text-gray-400" /> {product.department}
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mb-10">
            {isSeller ? (
              <div className="flex flex-col gap-4">
                {product.status === 'available' && (
                  <button
                    onClick={handleMarkSold}
                    disabled={soldLoading}
                    className="btn-primary w-full py-4 text-sm"
                  >
                    <MdCheckCircle size={18} /> {soldLoading ? 'UPDATING...' : 'MARK AS SOLD'}
                  </button>
                )}
                <Link to="/dashboard/my-products" className="btn-secondary w-full py-4 text-sm">
                  MANAGE MY PRODUCTS
                </Link>
              </div>
            ) : product.status === 'available' ? (
              <div className="flex flex-col gap-4">
                <button
                  onClick={handleInterest}
                  disabled={interestLoading}
                  className="btn-primary w-full py-4 text-sm"
                >
                  {interestLoading ? 'SENDING...' : 'NOTIFY SELLER OF INTEREST'}
                </button>
                <button
                  onClick={handleMessageSeller}
                  disabled={chatLoading}
                  className="btn-secondary w-full py-4 text-sm border-black hover:bg-black hover:text-white"
                >
                  <MdChat size={18} /> {chatLoading ? 'OPENING...' : 'MESSAGE SELLER'}
                </button>
              </div>
            ) : null}
          </div>

          {/* Description Panel */}
          <div className="mb-10">
            <h3 className="text-xs font-bold uppercase tracking-widest text-black mb-4 pb-2 border-b border-gray-200">
              PRODUCT DESCRIPTION
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Virtual Showcase Panel */}
          {images[activeImg] && (
            <div className="mb-10">
              <DraggableShowcase imageUrl={images[activeImg]} />
            </div>
          )}

          {/* Seller Info Panel */}
          {seller && typeof seller === 'object' && (
            <div className="bg-[#F5F5F5] p-6 mb-8 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-black text-white font-bold flex items-center justify-center text-sm flex-shrink-0">
                  {seller.profileImage
                    ? <img src={seller.profileImage} className="w-full h-full object-cover" alt="" />
                    : getInitials(seller.name)}
                </div>
                <div>
                  <p className="font-bold text-black uppercase tracking-widest text-sm">{seller.name}</p>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">SELLER</p>
                </div>
              </div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">
                LISTED ON<br/>{formatDate(product.createdAt)}
              </p>
            </div>
          )}

          {/* Share */}
          <button 
            onClick={handleShare} 
            className="flex items-center gap-2 text-[10px] font-bold text-black hover:text-[#E16E50] uppercase tracking-widest transition-colors w-fit"
          >
            <MdShare size={16} /> SHARE LISTING
          </button>
          
        </div>
      </div>
    </div>
  );
}
