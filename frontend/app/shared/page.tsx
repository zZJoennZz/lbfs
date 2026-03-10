'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Folder, File, getFolders, getFiles } from '@/lib/api';
import { FolderIcon, DocumentIcon, UserGroupIcon, ArrowDownTrayIcon, ClockIcon, UserIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import PageLayout from '@/components/layout/PageLayout';

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
  size?: number;
}

export default function SharedPage() {
  const { user, loading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [sharedItems, setSharedItems] = useState<SharedItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'folders' | 'files'>('all');
  const [isLoading, setIsLoading] = useState(true);

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
    setIsLoading(true);
    try {
      const [foldersRes, filesRes] = await Promise.all([getFolders(), getFiles()]);

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
          size: file.size,
        }));

      setSharedItems([...sharedFolders, ...sharedFiles]);
    } catch (error) {
      showToast('Failed to load shared items', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredItems = sharedItems.filter((item) => {
    if (filter === 'folders') return item.type === 'folder';
    if (filter === 'files') return item.type === 'file';
    return true;
  });

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const getFileIcon = (mimeType?: string) => {
    if (!mimeType) return <DocumentIcon className="h-8 w-8 text-gray-400" />;
    if (mimeType.startsWith('image/')) {
      return <div className="h-8 w-8 bg-orange-100 rounded-lg flex items-center justify-center">🖼️</div>;
    }
    if (mimeType.startsWith('video/')) {
      return <div className="h-8 w-8 bg-orange-100 rounded-lg flex items-center justify-center">🎥</div>;
    }
    if (mimeType.startsWith('audio/')) {
      return <div className="h-8 w-8 bg-orange-100 rounded-lg flex items-center justify-center">🎵</div>;
    }
    if (mimeType.includes('pdf')) {
      return <div className="h-8 w-8 bg-orange-100 rounded-lg flex items-center justify-center">📄</div>;
    }
    return <DocumentIcon className="h-8 w-8 text-gray-400" />;
  };

  // Custom right content for shared page
  const sharedRightContent = (
    <div className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-lg">
      <UserGroupIcon className="h-5 w-5 text-gray-400" />
      <span className="text-sm font-medium text-gray-600">
        {sharedItems.length} shared {sharedItems.length === 1 ? 'item' : 'items'}
      </span>
    </div>
  );

  if (loading || isLoading) {
    return (
      <PageLayout title="Shared With Me" showBackButton>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-600"></div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Shared With Me" showBackButton rightContent={sharedRightContent}>
      {/* Filters */}
      <div className="mb-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-2 inline-flex">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all' ? 'bg-lime-500 text-white' : 'text-gray-600 hover:text-lime-600 hover:bg-gray-50'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('folders')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'folders' ? 'bg-lime-500 text-white' : 'text-gray-600 hover:text-lime-600 hover:bg-gray-50'
            }`}
          >
            Folders
          </button>
          <button
            onClick={() => setFilter('files')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'files' ? 'bg-lime-500 text-white' : 'text-gray-600 hover:text-lime-600 hover:bg-gray-50'
            }`}
          >
            Files
          </button>
        </div>
      </div>

      {/* Shared Items List */}
      {filteredItems.length > 0 ? (
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <div
              key={`${item.type}-${item.id}`}
              className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
            >
              {item.type === 'folder' ? (
                <Link href={`/folder/${item.id}`} className="block p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 mr-4">
                      <div className="h-12 w-12 bg-lime-100 rounded-xl flex items-center justify-center">
                        <FolderIcon className="h-6 w-6 text-lime-600" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-base font-semibold text-gray-800 group-hover:text-lime-600 transition-colors">{item.name}</h3>
                          <div className="flex items-center mt-1 text-xs text-gray-500 space-x-3">
                            <span className="flex items-center">
                              <UserIcon className="h-3 w-3 mr-1" />
                              {item.shared_by}
                            </span>
                            <span className="flex items-center">
                              <ClockIcon className="h-3 w-3 mr-1" />
                              {formatDate(item.shared_at)}
                            </span>
                          </div>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-lime-50 text-lime-700">Folder</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ) : (
                <a href={item.file_url} target="_blank" rel="noopener noreferrer" className="block p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 mr-4">{getFileIcon(item.mime_type)}</div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-base font-semibold text-gray-800 group-hover:text-lime-600 transition-colors">{item.name}</h3>
                          <div className="flex items-center mt-1 text-xs text-gray-500 space-x-3">
                            <span className="flex items-center">
                              <UserIcon className="h-3 w-3 mr-1" />
                              {item.shared_by}
                            </span>
                            <span className="flex items-center">
                              <ClockIcon className="h-3 w-3 mr-1" />
                              {formatDate(item.shared_at)}
                            </span>
                            {item.size && (
                              <>
                                <span>•</span>
                                <span>{formatFileSize(item.size)}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700">
                            File
                          </span>
                          <button className="p-2 text-gray-400 hover:text-lime-600 hover:bg-gray-50 rounded-lg transition-colors">
                            <ArrowDownTrayIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </a>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserGroupIcon className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">No shared items</h3>
          <p className="text-gray-500 max-w-sm mx-auto">When someone shares a folder or file with you, it will appear here.</p>
        </div>
      )}
    </PageLayout>
  );
}
