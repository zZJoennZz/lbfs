'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Folder, getFolders, createFolder } from '@/lib/api';
import { FolderIcon, PlusIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import PageLayout from '@/components/layout/PageLayout';
import { useToast } from '@/context/ToastContext';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadFolders();
    }
  }, [user]);

  const loadFolders = async () => {
    try {
      const response = await getFolders();
      setFolders(response.data);
    } catch (error) {
      showToast('Failed to load folders', 'error');
    }
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) {
      showToast('Please enter a folder name', 'warning');
      return;
    }

    setIsCreating(true);
    try {
      await createFolder({ name: newFolderName.trim() });
      showToast('Folder created successfully', 'success');
      setNewFolderName('');
      setShowNewFolder(false);
      loadFolders();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to create folder', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  if (loading) {
    return (
      <PageLayout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="text-xl text-gray-600">Loading...</div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Dashboard">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Your Folders</h2>
        <button
          onClick={() => setShowNewFolder(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          New Folder
        </button>
      </div>

      {showNewFolder && (
        <form onSubmit={handleCreateFolder} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Enter folder name"
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              autoFocus
              disabled={isCreating}
            />
            <button
              type="submit"
              disabled={isCreating}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {isCreating ? 'Creating...' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => setShowNewFolder(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {folders.map((folder) => (
          <Link key={folder.id} href={`/folder/${folder.id}`} className="block hover:shadow-lg transition-shadow duration-200">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <FolderIcon className="h-8 w-8 text-blue-500" />
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">{folder.name}</h3>
                    <p className="text-sm text-gray-500">
                      {folder.files_count} files • {folder.participants_count} participants
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {folders.length === 0 && (
        <div className="text-center py-12">
          <FolderIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No folders</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new folder.</p>
        </div>
      )}
    </PageLayout>
  );
}
