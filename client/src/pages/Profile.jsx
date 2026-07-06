import usePageTitle from '../hooks/usePageTitle';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { MdPerson, MdEmail, MdCalendarToday, MdSchool } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/authService';
import { getInitials, formatDate } from '../utils/helpers';

export default function Profile() {
  usePageTitle('Profile');
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
    <div className="max-w-[800px]">
      <div className="mb-10 pb-6 border-b border-gray-200">
        <h1 className="text-3xl font-bold uppercase tracking-tighter text-black mb-2">PROFILE</h1>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-500">MANAGE YOUR ACCOUNT INFO</p>
      </div>

      {/* Avatar Card */}
      <div className="border border-black p-8 bg-[#F5F5F5] mb-8 flex flex-col sm:flex-row items-center gap-8">
        <div className="w-32 h-32 bg-black text-white font-bold text-4xl flex items-center justify-center flex-shrink-0">
          {user.profileImage
            ? <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
            : getInitials(user.name)}
        </div>
        <div className="text-center sm:text-left flex-1">
          <h2 className="text-3xl font-bold uppercase tracking-tighter text-black mb-1">{user.name}</h2>
          <p className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">{user.email}</p>
          <span className="inline-block px-4 py-1 border-2 border-black text-xs font-bold uppercase tracking-widest text-black bg-white">
            {user.role}
          </span>
        </div>
      </div>

      {/* Info Section */}
      <div className="border border-black p-8 bg-white mb-8">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
          <h3 className="text-xs font-bold uppercase tracking-widest text-black">ACCOUNT DETAILS</h3>
          {!editing && (
            <button onClick={() => setEditing(true)} className="text-[10px] font-bold uppercase tracking-widest border-b border-black hover:text-[#E16E50] hover:border-[#E16E50] transition-colors pb-0.5">
              EDIT PROFILE
            </button>
          )}
        </div>

        {editing ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <input
                {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Min 2 characters' } })}
                className="w-full border-b border-black py-3 px-0 text-sm focus:outline-none focus:border-[#E16E50] font-bold tracking-wider transition-colors bg-transparent"
                placeholder="FULL NAME *"
              />
              {errors.name && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest mt-2">{errors.name.message}</p>}
            </div>
            <div>
              <input
                {...register('profileImage')}
                className="w-full border-b border-black py-3 px-0 text-sm focus:outline-none focus:border-[#E16E50] font-bold tracking-wider transition-colors bg-transparent"
                placeholder="PROFILE IMAGE URL (OPTIONAL)"
              />
            </div>
            <div className="flex gap-4 pt-4">
              <button type="submit" disabled={saving} className="btn-primary flex-1">
                {saving ? 'SAVING...' : 'SAVE CHANGES'}
              </button>
              <button type="button" onClick={() => setEditing(false)} className="btn-secondary flex-1">CANCEL</button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12">
            {[
              { icon: <MdPerson />, label: 'FULL NAME', value: user.name },
              { icon: <MdEmail />, label: 'EMAIL', value: user.email },
              { icon: <MdSchool />, label: 'ROLE', value: user.role },
              { icon: <MdCalendarToday />, label: 'MEMBER SINCE', value: formatDate(user.createdAt) },
            ].map(({ icon, label, value }) => (
              <div key={label} className="flex gap-4">
                <span className="text-gray-400 mt-1">{icon}</span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">{label}</p>
                  <p className="text-sm font-bold uppercase tracking-widest text-black">{value}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Security Note */}
      <div className="border border-black p-8 bg-[#F5F5F5]">
        <h3 className="text-xs font-bold uppercase tracking-widest text-black mb-4">SECURITY</h3>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-500 leading-relaxed">
          YOUR ACCOUNT IS SECURED WITH JWT AUTHENTICATION. PASSWORD CHANGES WILL BE AVAILABLE IN A FUTURE UPDATE.
          IF YOU SUSPECT UNAUTHORIZED ACCESS, PLEASE LOG OUT FROM ALL DEVICES.
        </p>
      </div>
    </div>
  );
}
