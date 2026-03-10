'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { PencilIcon, CameraIcon, FolderIcon, DocumentIcon, UserGroupIcon, EnvelopeIcon, CalendarIcon } from '@heroicons/react/24/outline';
import PageLayout from '@/components/layout/PageLayout';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    bio: '',
  });

  // Mock stats - in a real app, these would come from an API
  const stats = {
    totalFolders: 12,
    totalFiles: 48,
    sharedWithMe: 8,
    memberSince: 'January 2024',
  };

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
    setIsSaving(true);

    // Simulate API call
    setTimeout(() => {
      showToast('Profile updated successfully', 'success');
      setIsEditing(false);
      setIsSaving(false);
    }, 1000);
  };

  if (loading) {
    return (
      <PageLayout title="Profile">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-600"></div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Profile" showBackButton>
      <div className="max-w-4xl mx-auto">
        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
          {/* Cover Image */}
          <div className="h-32 bg-gradient-to-r from-lime-500 to-lime-600"></div>

          {/* Profile Info */}
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end -mt-12 mb-4">
              <div className="relative">
                <div className="h-24 w-24 rounded-2xl bg-white p-1 shadow-lg">
                  <div className="h-full w-full rounded-xl bg-lime-100 flex items-center justify-center">
                    <span className="text-3xl font-bold text-lime-700">{user?.username[0].toUpperCase()}</span>
                  </div>
                </div>
                <button className="absolute -bottom-2 -right-2 p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-100">
                  <CameraIcon className="h-4 w-4 text-gray-600" />
                </button>
              </div>

              <div className="mt-4 sm:mt-0 sm:ml-6 flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      {user?.first_name} {user?.last_name}
                    </h2>
                    <p className="text-gray-500">@{user?.username}</p>
                  </div>

                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="mt-3 sm:mt-0 inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:border-lime-300 hover:text-lime-600 transition-colors"
                    >
                      <PencilIcon className="h-4 w-4 mr-2" />
                      Edit Profile
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <div className="flex items-center">
                <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" />
                {user?.email}
              </div>
              <div className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                Member since {stats.memberSince}
              </div>
            </div>

            {/* Bio */}
            {user?.bio && !isEditing && (
              <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                <p className="text-gray-700">{user.bio}</p>
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Folders</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalFolders}</p>
              </div>
              <div className="w-12 h-12 bg-lime-100 rounded-xl flex items-center justify-center">
                <FolderIcon className="h-6 w-6 text-lime-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Files</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalFiles}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <DocumentIcon className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Shared With Me</p>
                <p className="text-3xl font-bold text-gray-800">{stats.sharedWithMe}</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                <UserGroupIcon className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile Form */}
        {isEditing && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-fadeIn">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Edit Profile</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  name="bio"
                  rows={4}
                  value={formData.bio}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all resize-none"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-lime-500 hover:bg-lime-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Activity Timeline (Optional) */}
        {!isEditing && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 mt-2 rounded-full bg-lime-500"></div>
                <div>
                  <p className="text-sm text-gray-800">
                    You uploaded <span className="font-medium">project-docs.pdf</span> to Work folder
                  </p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 mt-2 rounded-full bg-orange-500"></div>
                <div>
                  <p className="text-sm text-gray-800">
                    <span className="font-medium">johndoe</span> shared a folder with you
                  </p>
                  <p className="text-xs text-gray-500">Yesterday</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 mt-2 rounded-full bg-gray-300"></div>
                <div>
                  <p className="text-sm text-gray-800">
                    You created folder <span className="font-medium">Projects</span>
                  </p>
                  <p className="text-xs text-gray-500">3 days ago</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
