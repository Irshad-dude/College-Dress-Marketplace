import usePageTitle from '../hooks/usePageTitle';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { MdEdit, MdPerson, MdEmail, MdCalendarToday, MdSchool } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/authService';
import { getInitials, formatDate } from '../utils/helpers';

export default function Profile() {
  usePageTitle('Profile'); // L25
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { name: user?.name || '', profileImage: user?.profileImage || '' },
  });

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const res = await updateProfile(data);
      updateUser(res.data.user || res.data);
      toast.success('Profile updated!');
      setEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-500 mt-1">Manage your account information</p>
      </div>

      {/* Avatar card */}
      <div className="card p-8 mb-6 flex flex-col sm:flex-row items-center gap-6">
        <div className="w-24 h-24 rounded-full bg-amber-100 text-amber-700 font-extrabold text-3xl flex items-center justify-center flex-shrink-0 overflow-hidden">
          {user.profileImage
            ? <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
            : getInitials(user.name)}
        </div>
        <div className="text-center sm:text-left">
          <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
          <p className="text-gray-500">{user.email}</p>
          <span className="inline-flex items-center mt-2 px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 capitalize">
            {user.role}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Account Information</h3>
          {!editing && (
            <button onClick={() => setEditing(true)} className="btn-secondary text-sm flex items-center gap-1 py-1.5 px-3">
              <MdEdit size={16} /> Edit
            </button>
          )}
        </div>

        {editing ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Min 2 characters' } })}
                className="input"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image URL</label>
              <input
                {...register('profileImage')}
                className="input"
                placeholder="https://example.com/photo.jpg"
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary flex-1">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button type="button" onClick={() => setEditing(false)} className="btn-secondary flex-1">Cancel</button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            {[
              { icon: <MdPerson />, label: 'Full Name', value: user.name },
              { icon: <MdEmail />, label: 'Email', value: user.email },
              { icon: <MdSchool />, label: 'Role', value: user.role, capitalize: true },
              { icon: <MdCalendarToday />, label: 'Member Since', value: formatDate(user.createdAt) },
            ].map(({ icon, label, value, capitalize }) => (
              <div key={label} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                <span className="text-amber-500 text-lg flex-shrink-0">{icon}</span>
                <div>
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className={`font-medium text-gray-800 ${capitalize ? 'capitalize' : ''}`}>{value}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Security note */}
      <div className="card p-6 bg-amber-50/50 border-amber-100">
        <h3 className="font-semibold text-gray-800 mb-2">🔒 Security</h3>
        <p className="text-sm text-gray-500">
          Your account is secured with JWT authentication. Password changes will be available in a future update.
          If you suspect unauthorized access, please log out from all devices.
        </p>
      </div>
    </div>
  );
}
