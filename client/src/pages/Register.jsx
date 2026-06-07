import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { GiGraduateCap } from 'react-icons/gi';
import { MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import clsx from 'clsx';
import usePageTitle from '../hooks/usePageTitle';

function PasswordStrength({ password }) {
  const checks = {
    length: password.length >= 6,
    number: /[0-9]/.test(password),
  };
  const passed = Object.values(checks).filter(Boolean).length;
  const strength = !password ? 0 : passed === 2 ? 3 : passed === 1 ? 2 : 1;
  const labels = ['', 'Weak', 'Fair', 'Strong'];
  const colors = ['bg-gray-200', 'bg-red-400', 'bg-yellow-400', 'bg-green-500'];

  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={clsx(
              'h-1 flex-1 rounded-full transition-all duration-300',
              i <= strength ? colors[strength] : 'bg-gray-200'
            )}
          />
        ))}
      </div>
      {password && (
        <p className={clsx('text-xs mt-1', strength <= 1 ? 'text-red-500' : strength === 2 ? 'text-yellow-600' : 'text-green-600')}>
          {labels[strength]} — needs 6+ characters and a number
        </p>
      )}
    </div>
  );
}

export default function Register() {
  usePageTitle('Register'); // L25
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('buyer');
  const [serverErrors, setServerErrors] = useState({});

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch('password', '');

  const onSubmit = async (data) => {
    setLoading(true);
    setServerErrors({});
    try {
      await registerUser({ ...data, role });
      toast.success('Account created! Welcome aboard 🎉');
      navigate('/dashboard');
    } catch (err) {
      const response = err.response?.data;
      if (response?.errors && Array.isArray(response.errors)) {
        // Map server field errors back to the form
        const fieldErrors = {};
        response.errors.forEach(({ field, message }) => {
          fieldErrors[field] = message;
        });
        setServerErrors(fieldErrors);
        toast.error('Please fix the errors below');
      } else if (err.response?.status === 429) {
        toast.error('Too many attempts. Please wait 1 minute and try again.');
      } else {
        const msg = response?.message || 'Registration failed. Please try again.';
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const fieldError = (field) =>
    errors[field]?.message || serverErrors[field];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50 py-12">
      <div className="w-full max-w-md">
        <div className="card p-8">
          {/* Logo */}
          <div className="flex flex-col items-center gap-2 mb-8">
            <GiGraduateCap className="text-amber-500 text-4xl" />
            <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
            <p className="text-gray-500 text-sm">Join thousands of students</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <input
                type="text"
                autoComplete="name"
                placeholder="Riya Sharma"
                className={`input ${fieldError('name') ? 'border-red-400 ring-2 ring-red-100' : ''}`}
                {...register('name', {
                  required: 'Name is required',
                  minLength: { value: 2, message: 'Name too short' },
                })}
              />
              {fieldError('name') && (
                <p className="text-red-500 text-xs mt-1">⚠ {fieldError('name')}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <input
                type="email"
                autoComplete="email"
                placeholder="you@college.edu"
                className={`input ${fieldError('email') ? 'border-red-400 ring-2 ring-red-100' : ''}`}
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' },
                })}
              />
              {fieldError('email') && (
                <p className="text-red-500 text-xs mt-1">⚠ {fieldError('email')}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Min 6 characters + a number"
                  className={`input pr-10 ${fieldError('password') ? 'border-red-400 ring-2 ring-red-100' : ''}`}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'At least 6 characters required' },
                    pattern: { value: /[0-9]/, message: 'Must include at least one number' },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
                </button>
              </div>
              <PasswordStrength password={password} />
              {fieldError('password') && (
                <p className="text-red-500 text-xs mt-1">⚠ {fieldError('password')}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
              <input
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                className={`input ${fieldError('confirmPassword') ? 'border-red-400 ring-2 ring-red-100' : ''}`}
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (val) => val === password || 'Passwords do not match',
                })}
              />
              {fieldError('confirmPassword') && (
                <p className="text-red-500 text-xs mt-1">⚠ {fieldError('confirmPassword')}</p>
              )}
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">I am a...</label>
              <div className="flex gap-2">
                {['buyer', 'seller'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={clsx(
                      'flex-1 py-2.5 rounded-xl font-semibold text-sm border-2 transition-all',
                      role === r
                        ? 'border-amber-500 bg-amber-50 text-amber-700'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    )}
                  >
                    {r === 'buyer' ? '🛒 Buyer' : '🏷️ Seller'}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1.5">
                {role === 'buyer'
                  ? 'Buyers can browse, search, and contact sellers.'
                  : 'Sellers can list products and receive buyer messages.'}
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base disabled:opacity-60"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-amber-500 font-semibold hover:text-amber-600">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
