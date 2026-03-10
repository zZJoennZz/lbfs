'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { PencilIcon, CameraIcon } from '@heroicons/react/24/outline';
import PageLayout from '@/components/layout/PageLayout';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    bio: '',
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        bio: user.bio || '',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement profile update API
    showToast('Profile updated successfully', 'success');
    setIsEditing(false);
  };

  if (loading) {
    return (
      <PageLayout title="Profile" showBackButton>
        <div className="flex items-center justify-center h-64">
          <div className="text-xl text-gray-600">Loading...</div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Profile" showBackButton>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {/* Profile Header */}
        <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-blue-500 to-blue-600">
          <div className="flex items-center">
            <div className="relative">
              <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center text-3xl font-bold text-blue-600">
                {user?.username[0].toUpperCase()}
              </div>
              <button className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-lg hover:bg-gray-100">
                <CameraIcon className="h-4 w-4 text-gray-600" />
              </button>
            </div>
            <div className="ml-4">
              <h2 className="text-2xl font-bold text-white">
                {user?.first_name} {user?.last_name}
              </h2>
              <p className="text-blue-100">@{user?.username}</p>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="border-t border-gray-200">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Bio</label>
                  <textarea
                    name="bio"
                    rows={3}
                    value={formData.bio}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <PencilIcon className="h-4 w-4 mr-1" />
                  Edit Profile
                </button>
              </div>

              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Username</dt>
                  <dd className="mt-1 text-sm text-gray-900">{user?.username}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">{user?.email}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">First Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{user?.first_name || 'Not set'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Last Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{user?.last_name || 'Not set'}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Bio</dt>
                  <dd className="mt-1 text-sm text-gray-900">{user?.bio || 'No bio provided'}</dd>
                </div>
              </dl>
            </div>
          )}
        </div>

        {/* Account Statistics */}
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Account Statistics</h3>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="bg-gray-50 px-4 py-5 rounded-lg">
              <dt className="text-sm font-medium text-gray-500 truncate">Total Folders</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">0</dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 rounded-lg">
              <dt className="text-sm font-medium text-gray-500 truncate">Total Files</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">0</dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 rounded-lg">
              <dt className="text-sm font-medium text-gray-500 truncate">Shared With Me</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">0</dd>
            </div>
          </dl>
        </div>

        {/* Member Since */}
        <div className="border-t border-gray-200 px-4 py-4 sm:px-6">
          <p className="text-sm text-gray-500">Member since {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </PageLayout>
  );
}
