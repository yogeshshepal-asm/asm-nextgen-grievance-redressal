import React, { useState } from 'react';
import { User } from '../types';

interface ProfileProps {
  user: User;
  onUpdateProfile: (updates: Partial<User>) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdateProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    department: user.department,
    studentClass: user.studentClass || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSave = () => {
    setError('');
    setSuccess('');

    if (formData.newPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        setError('New passwords do not match');
        return;
      }
      if (formData.newPassword.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
    }

    onUpdateProfile({
      name: formData.name,
      department: formData.department,
      studentClass: formData.studentClass,
      ...(formData.newPassword && { password: formData.newPassword })
    });

    setSuccess('Profile updated successfully!');
    setIsEditing(false);
    setFormData({ ...formData, currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-[#1a73b8] to-[#71bf44] p-8 text-white">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl font-black border-2 border-white/30">
              {user.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight">{user.name}</h2>
              <p className="text-sm font-bold text-white/80 mt-1">{user.email}</p>
              <div className="flex items-center space-x-2 mt-2">
                <span className="px-3 py-1 bg-white/20 backdrop-blur rounded-lg text-xs font-black uppercase tracking-widest">
                  {user.role}
                </span>
                <span className="px-3 py-1 bg-white/20 backdrop-blur rounded-lg text-xs font-bold">
                  {user.department}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-sm font-bold">
              {error}
            </div>
          )}
          
          {success && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-600 text-sm font-bold">
              {success}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#1a73b8] outline-none"
                />
              ) : (
                <p className="text-base font-bold text-slate-900">{user.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Email Address</label>
              <p className="text-base font-bold text-slate-900">{user.email}</p>
              <p className="text-xs text-slate-400">Email cannot be changed</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Department</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#1a73b8] outline-none"
                />
              ) : (
                <p className="text-base font-bold text-slate-900">{user.department}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Role</label>
              <p className="text-base font-bold text-slate-900">{user.role}</p>
              <p className="text-xs text-slate-400">Role cannot be changed</p>
            </div>

            {user.studentClass && (
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Class</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.studentClass}
                    onChange={(e) => setFormData({ ...formData, studentClass: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#1a73b8] outline-none"
                  />
                ) : (
                  <p className="text-base font-bold text-slate-900">{user.studentClass}</p>
                )}
              </div>
            )}

            {user.assignedCategory && (
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Assigned Cell</label>
                <p className="text-base font-bold text-slate-900">{user.assignedCategory}</p>
              </div>
            )}
          </div>

          {isEditing && (
            <div className="border-t border-slate-200 pt-6 mt-6">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Change Password</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Current Password</label>
                  <input
                    type="password"
                    value={formData.currentPassword}
                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#1a73b8] outline-none"
                    placeholder="••••••"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">New Password</label>
                  <input
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#1a73b8] outline-none"
                    placeholder="••••••"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Confirm Password</label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#1a73b8] outline-none"
                    placeholder="••••••"
                  />
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-2">Leave blank to keep current password</p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            {isEditing ? (
              <>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      name: user.name,
                      email: user.email,
                      department: user.department,
                      studentClass: user.studentClass || '',
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    });
                    setError('');
                  }}
                  className="px-6 py-3 bg-slate-100 text-slate-600 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-3 bg-[#1a73b8] text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-[#1a5da1] transition-all shadow-lg shadow-[#1a73b8]/20"
                >
                  Save Changes
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-3 bg-[#1a73b8] text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-[#1a5da1] transition-all shadow-lg shadow-[#1a73b8]/20"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-8">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Account Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">User ID</p>
            <p className="font-mono text-slate-600">{user.id}</p>
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Account Status</p>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-emerald-600 font-bold">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
