import usePageTitle from '../hooks/usePageTitle';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createProduct } from '../services/productService';
import ImageUpload from '../components/ImageUpload';
import { SIZES, CONDITIONS, DEPARTMENTS, PRODUCT_TYPES } from '../constants';

export default function AddProduct() {
  usePageTitle('Add Product');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const [imageFiles, setImageFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, val]) => {
        if (val !== undefined && val !== '') formData.append(key, val);
      });
      imageFiles.forEach((file) => formData.append('images', file));
      await createProduct(formData);
      toast.success('Product listed successfully!');
      navigate('/dashboard/my-products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[800px]">
      <div className="mb-10 pb-6 border-b border-gray-200">
        <h1 className="text-3xl font-bold uppercase tracking-tighter text-black mb-2">ADD NEW PRODUCT</h1>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-500">LIST YOUR COLLEGE FASHION ITEM</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
        {/* Images */}
        <div className="border border-black p-8 bg-white">
          <h2 className="text-xs font-bold uppercase tracking-widest text-black mb-6">PRODUCT IMAGES</h2>
          <ImageUpload onImagesChange={setImageFiles} />
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-4">
            UPLOAD UP TO 5 PHOTOS. FIRST PHOTO IS THE COVER.
          </p>
        </div>

        {/* Basic Info */}
        <div className="border border-black p-8 bg-white space-y-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-black mb-2">PRODUCT DETAILS</h2>

          <div>
            <input
              {...register('title', { required: 'Product name is required', minLength: { value: 3, message: 'Min 3 characters' } })}
              className="w-full border-b border-black py-3 px-0 text-sm focus:outline-none focus:border-[#E16E50] font-bold tracking-wider transition-colors bg-transparent"
              placeholder="PRODUCT NAME *"
            />
            {errors.title && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest mt-2">{errors.title.message}</p>}
          </div>

          <div>
            <textarea
              {...register('description', { required: 'Description is required', minLength: { value: 10, message: 'Min 10 characters' } })}
              rows={4}
              className="w-full border-b border-black py-3 px-0 text-sm focus:outline-none focus:border-[#E16E50] font-bold tracking-wider transition-colors bg-transparent resize-none"
              placeholder="DESCRIPTION (Condition, measurements, defects) *"
            />
            {errors.description && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest mt-2">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">PRICE (₹) *</p>
              <input
                type="number"
                min="0"
                {...register('price', { required: 'Price is required', min: { value: 0, message: 'Must be positive' } })}
                className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black font-bold tracking-wider transition-colors"
                placeholder="ENTER PRICE"
              />
              {errors.price && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest mt-2">{errors.price.message}</p>}
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">SIZE *</p>
              <select {...register('size', { required: 'Size is required' })} className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black font-bold tracking-wider transition-colors bg-white">
                <option value="">SELECT SIZE</option>
                {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.size && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest mt-2">{errors.size.message}</p>}
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">CONDITION *</p>
              <select {...register('condition', { required: 'Condition is required' })} className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black font-bold tracking-wider transition-colors bg-white">
                <option value="">SELECT CONDITION</option>
                {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.condition && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest mt-2">{errors.condition.message}</p>}
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">PRODUCT TYPE</p>
              <select {...register('type')} className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black font-bold tracking-wider transition-colors bg-white">
                <option value="">SELECT TYPE</option>
                {PRODUCT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* College Info */}
        <div className="border border-black p-8 bg-white space-y-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-black mb-2">COLLEGE INFO</h2>

          <div>
            <input
              {...register('collegeName', { required: 'College name is required' })}
              className="w-full border-b border-black py-3 px-0 text-sm focus:outline-none focus:border-[#E16E50] font-bold tracking-wider transition-colors bg-transparent"
              placeholder="COLLEGE NAME *"
            />
            {errors.collegeName && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest mt-2">{errors.collegeName.message}</p>}
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">DEPARTMENT</p>
            <select {...register('department')} className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black font-bold tracking-wider transition-colors bg-white">
              <option value="">SELECT DEPARTMENT</option>
              {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-5 text-sm tracking-widest"
        >
          {loading ? 'PUBLISHING...' : 'PUBLISH LISTING'}
        </button>
      </form>
    </div>
  );
}
