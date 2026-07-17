import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
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
  const labels = ['', 'WEAK', 'FAIR', 'STRONG'];
  const colors = ['bg-gray-200', 'bg-[#E16E50]', 'bg-yellow-500', 'bg-black'];

  return (
    <div className="mt-3">
      <div className="flex gap-1">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={clsx(
              'h-1 flex-1 transition-all duration-300',
              i <= strength ? colors[strength] : 'bg-gray-200'
            )}
          />
        ))}
      </div>
      {password && (
        <p className={clsx('text-[10px] font-bold uppercase tracking-widest mt-2', strength <= 1 ? 'text-[#E16E50]' : strength === 2 ? 'text-yellow-600' : 'text-black')}>
          {labels[strength]} — NEEDS 6+ CHARACTERS AND A NUMBER
        </p>
      )}
    </div>
  );
}

const INDIAN_COLLEGES = [
  'IIT Bombay',
  'IIT Delhi',
  'NIT Trichy',
  'BITS Pilani',
  'Delhi University',
  'Anna University',
  'Jadavpur University',
  'VIT Vellore',
  'SRCC Delhi',
  'NID Ahmedabad'
];

export default function Register() {
  usePageTitle('Register');
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
      toast.success('Account created! Welcome aboard');
      navigate('/dashboard');
    } catch (err) {
      const response = err.response?.data;
      if (response?.errors && Array.isArray(response.errors)) {
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

  const fieldError = (field) => errors[field]?.message || serverErrors[field];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-white py-16">
      <div className="w-full max-w-[450px]">
        
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold uppercase tracking-tighter text-black mb-2">Create Account</h1>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Join thousands of students</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name */}
          <div>
            <input
              type="text"
              autoComplete="name"
              placeholder="FULL NAME"
              className={`w-full border-b border-black py-3 px-0 text-sm focus:outline-none focus:border-[#E16E50] font-bold tracking-wider transition-colors bg-transparent ${fieldError('name') ? 'border-red-500 text-red-500' : ''}`}
              {...register('name', {
                required: 'Name is required',
                minLength: { value: 2, message: 'Name too short' },
              })}
            />
            {fieldError('name') && (
              <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest mt-2">⚠ {fieldError('name')}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <input
              type="email"
              autoComplete="email"
              placeholder="EMAIL ADDRESS (you@college.edu)"
              className={`w-full border-b border-black py-3 px-0 text-sm focus:outline-none focus:border-[#E16E50] font-bold tracking-wider transition-colors bg-transparent ${fieldError('email') ? 'border-red-500 text-red-500' : ''}`}
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' },
              })}
            />
            {fieldError('email') && (
              <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest mt-2">⚠ {fieldError('email')}</p>
            )}
          </div>

          {/* College Dropdown */}
          <div className="relative">
            <select
              className={`w-full border-b border-black py-3 px-0 text-sm focus:outline-none focus:border-[#E16E50] font-bold tracking-wider transition-colors bg-transparent appearance-none rounded-none cursor-pointer ${fieldError('collegeName') ? 'border-red-500 text-red-500' : 'text-black'}`}
              {...register('collegeName', {
                required: 'Please select your college',
              })}
              defaultValue=""
            >
              <option value="" disabled className="text-gray-400">SELECT YOUR COLLEGE</option>
              {INDIAN_COLLEGES.map(college => (
                <option key={college} value={college} className="text-black">
                  {college}
                </option>
              ))}
            </select>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-black">
              ▼
            </div>
            {fieldError('collegeName') && (
              <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest mt-2">⚠ {fieldError('collegeName')}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="PASSWORD (Min 6 chars + number)"
                className={`w-full border-b border-black py-3 px-0 pr-10 text-sm focus:outline-none focus:border-[#E16E50] font-bold tracking-wider transition-colors bg-transparent ${fieldError('password') ? 'border-red-500 text-red-500' : ''}`}
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 6, message: 'At least 6 characters required' },
                  pattern: { value: /[0-9]/, message: 'Must include at least one number' },
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
            <PasswordStrength password={password} />
            {fieldError('password') && (
              <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest mt-2">⚠ {fieldError('password')}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <input
              type="password"
              autoComplete="new-password"
              placeholder="CONFIRM PASSWORD"
              className={`w-full border-b border-black py-3 px-0 text-sm focus:outline-none focus:border-[#E16E50] font-bold tracking-wider transition-colors bg-transparent ${fieldError('confirmPassword') ? 'border-red-500 text-red-500' : ''}`}
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (val) => val === password || 'Passwords do not match',
              })}
            />
            {fieldError('confirmPassword') && (
              <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest mt-2">⚠ {fieldError('confirmPassword')}</p>
            )}
          </div>

          {/* Role */}
          <div className="pt-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">I AM A...</p>
            <div className="flex gap-4">
              {['buyer', 'seller'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={clsx(
                    'flex-1 py-3 text-xs font-bold uppercase tracking-widest border transition-colors',
                    role === r
                      ? 'border-black bg-black text-white'
                      : 'border-gray-200 bg-white text-gray-400 hover:border-black hover:text-black'
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-4">
              {role === 'buyer'
                ? 'Buyers can browse, search, and contact sellers.'
                : 'Sellers can list products and receive buyer messages.'}
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full mt-4"
          >
            {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">ALREADY HAVE AN ACCOUNT?</p>
          <Link to="/login" className="btn-secondary w-full text-[10px] sm:text-[10px]">
            SIGN IN INSTEAD
          </Link>
        </div>
      </div>
    </div>
  );
}
