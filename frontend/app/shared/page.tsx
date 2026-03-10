'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Folder, File, getFolders, getFiles } from '@/lib/api';
import { FolderIcon, DocumentIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface SharedItem {
  id: number;
  name: string;
  type: 'folder' | 'file';
  owner: string;
  shared_by: string;
  shared_at: string;
  folder_id?: number;
  file_url?: string;
  mime_type?: string;
}

export default function SharedPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sharedItems, setSharedItems] = useState<SharedItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'folders' | 'files'>('all');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadSharedItems();
    }
  }, [user]);

  const loadSharedItems = async () => {
    try {
      // Get all folders and files shared with user
      const [foldersRes, filesRes] = await Promise.all([getFolders(), getFiles()]);

      // Filter items where user is not the owner
      const sharedFolders = foldersRes.data
        .filter((folder: Folder) => folder.owner !== user?.id)
        .map((folder: Folder) => ({
          id: folder.id,
          name: folder.name,
          type: 'folder' as const,
          owner: folder.owner_username,
          shared_by: folder.owner_username,
          shared_at: folder.created_at,
        }));

      const sharedFiles = filesRes.data
        .filter((file: File) => file.uploaded_by !== user?.id)
        .map((file: File) => ({
          id: file.id,
          name: file.name,
          type: 'file' as const,
          owner: file.uploaded_by_username,
          shared_by: file.uploaded_by_username,
          shared_at: file.created_at,
          folder_id: file.folder,
          file_url: file.file_url,
          mime_type: file.mime_type,
        }));

      setSharedItems([...sharedFolders, ...sharedFiles]);
    } catch (error) {
      console.error('Failed to load shared items', error);
    }
  };

  const filteredItems = sharedItems.filter((item) => {
    if (filter === 'folders') return item.type === 'folder';
    if (filter === 'files') return item.type === 'file';
    return true;
  });

  const getFileIcon = (mimeType?: string) => {
    if (!mimeType) return '📎';
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎥';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType.includes('pdf')) return '📄';
    return '📎';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button onClick={() => router.push('/dashboard')} className="text-gray-500 hover:text-gray-700 mr-4">
                ← Back
              </button>
              <h1 className="text-xl font-semibold">Shared With Me</h1>
            </div>
            <div className="flex items-center">
              <UserGroupIcon className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-sm text-gray-600">{sharedItems.length} shared items</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Filters */}
        <div className="px-4 sm:px-0 mb-6">
          <div className="bg-white shadow rounded-lg p-4">
            <div className="flex space-x-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('folders')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  filter === 'folders' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Folders
              </button>
              <button
                onClick={() => setFilter('files')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  filter === 'files' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Files
              </button>
            </div>
          </div>
        </div>

        {/* Shared Items List */}
        <div className="px-4 sm:px-0">
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {filteredItems.map((item) => (
                <li key={`${item.type}-${item.id}`} className="px-4 py-4 sm:px-6">
                  {item.type === 'folder' ? (
                    <Link href={`/folder/${item.id}`} className="block hover:bg-gray-50">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <FolderIcon className="h-8 w-8 text-blue-500" />
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-blue-600">{item.name}</p>
                              <div className="mt-1 flex items-center text-xs text-gray-500 space-x-2">
                                <span>Shared by {item.shared_by}</span>
                                <span>•</span>
                                <span>Owner: {item.owner}</span>
                                <span>•</span>
                                <span>{new Date(item.shared_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Folder
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <a href={item.file_url} target="_blank" rel="noopener noreferrer" className="block hover:bg-gray-50">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 text-2xl">{getFileIcon(item.mime_type)}</div>
                        <div className="ml-4 flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-blue-600">{item.name}</p>
                              <div className="mt-1 flex items-center text-xs text-gray-500 space-x-2">
                                <span>Shared by {item.shared_by}</span>
                                <span>•</span>
                                <span>Owner: {item.owner}</span>
                                <span>•</span>
                                <span>{new Date(item.shared_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              File
                            </span>
                          </div>
                        </div>
                      </div>
                    </a>
                  )}
                </li>
              ))}

              {filteredItems.length === 0 && (
                <li className="px-4 py-12 text-center">
                  <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No shared items</h3>
                  <p className="mt-1 text-sm text-gray-500">Items shared with you will appear here.</p>
                </li>
              )}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
