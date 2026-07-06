import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import usePageTitle from '../hooks/usePageTitle';

export default function Login() {
  const { login } = useAuth();
  usePageTitle('Login');
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await login(data.email, data.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid credentials. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-white py-16">
      <div className="w-full max-w-[400px]">
        
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold uppercase tracking-tighter text-black mb-2">Login</h1>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email */}
          <div>
            <input
              type="email"
              autoComplete="email"
              placeholder="EMAIL ADDRESS"
              className={`w-full border-b border-black py-3 px-0 text-sm focus:outline-none focus:border-[#E16E50] font-bold tracking-wider transition-colors bg-transparent ${errors.email ? 'border-red-500 text-red-500' : ''}`}
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' },
              })}
            />
            {errors.email && (
              <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest mt-2">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="PASSWORD"
                className={`w-full border-b border-black py-3 px-0 pr-10 text-sm focus:outline-none focus:border-[#E16E50] font-bold tracking-wider transition-colors bg-transparent ${errors.password ? 'border-red-500 text-red-500' : ''}`}
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters' },
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-black hover:text-[#E16E50] p-2 transition-colors"
              >
                {showPassword ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest mt-2">{errors.password.message}</p>
            )}
            <div className="flex justify-end mt-3">
              <button
                type="button"
                className="text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-black transition-colors underline underline-offset-4 decoration-2"
              >
                FORGOT PASSWORD?
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full mt-8"
          >
            {loading ? 'SIGNING IN...' : 'SIGN IN'}
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">DON'T HAVE AN ACCOUNT?</p>
          <Link to="/register" className="btn-secondary w-full text-[10px] sm:text-[10px]">
            CREATE AN ACCOUNT
          </Link>
        </div>
      </div>
    </div>
  );
}
