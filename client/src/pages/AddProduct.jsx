import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createProduct } from '../services/productService';
import ImageUpload from '../components/ImageUpload';
import { SIZES, CONDITIONS, DEPARTMENTS, PRODUCT_TYPES } from '../constants';

export default function AddProduct() {
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
      // Append image files (optional — product can be listed without photo)
      imageFiles.forEach((file) => formData.append('images', file));
      await createProduct(formData);
      toast.success('Product listed successfully! 🎉');
      navigate('/dashboard/my-products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
        <p className="text-gray-500 mt-1">List your college dress for sale</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Images */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Product Images</h2>
          <ImageUpload onImagesChange={setImageFiles} />
          <p className="text-xs text-gray-400 mt-2">Upload up to 5 photos. First photo will be the cover.</p>
        </div>

        {/* Basic Info */}
        <div className="card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">Product Details</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
            <input
              {...register('title', { required: 'Product name is required', minLength: { value: 3, message: 'Min 3 characters' } })}
              className="input"
              placeholder="e.g. Engineering Lab Coat - White"
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea
              {...register('description', { required: 'Description is required', minLength: { value: 10, message: 'Min 10 characters' } })}
              rows={4}
              className="input resize-none"
              placeholder="Describe the condition, any defects, measurements, etc."
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
              <input
                type="number"
                min="0"
                {...register('price', { required: 'Price is required', min: { value: 0, message: 'Must be positive' } })}
                className="input"
                placeholder="Enter price in INR"
              />
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Size *</label>
              <select {...register('size', { required: 'Size is required' })} className="input">
                <option value="">Select size</option>
                {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.size && <p className="text-red-500 text-xs mt-1">{errors.size.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Condition *</label>
              <select {...register('condition', { required: 'Condition is required' })} className="input">
                <option value="">Select condition</option>
                {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.condition && <p className="text-red-500 text-xs mt-1">{errors.condition.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Type</label>
              <select {...register('type')} className="input">
                <option value="">Select type</option>
                {PRODUCT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* College Info */}
        <div className="card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">College Information</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">College Name *</label>
            <input
              {...register('collegeName', { required: 'College name is required' })}
              className="input"
              placeholder="e.g. ABC Engineering College"
            />
            {errors.collegeName && <p className="text-red-500 text-xs mt-1">{errors.collegeName.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select {...register('department')} className="input">
              <option value="">Select department</option>
              {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-3 text-base"
        >
          {loading ? 'Publishing...' : 'Publish Listing'}
        </button>
      </form>
    </div>
  );
}
