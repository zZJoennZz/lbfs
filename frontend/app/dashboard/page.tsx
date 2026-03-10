'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Folder, File, getFolders, getFiles, createFolder, deleteFolder, deleteFile, uploadFile, searchUsers, shareItem, User } from '@/lib/api';
import {
  FolderIcon,
  PlusIcon,
  TrashIcon,
  DocumentIcon,
  UsersIcon,
  ClockIcon,
  ShareIcon,
  MagnifyingGlassIcon,
  PhotoIcon,
  MusicalNoteIcon,
  VideoCameraIcon,
  ArrowUpTrayIcon,
  XMarkIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/24/outline';
import PageLayout from '@/components/layout/PageLayout';
import { useDropzone } from 'react-dropzone';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [deletingFolderId, setDeletingFolderId] = useState<number | null>(null);
  const [folderSearch, setFolderSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareSearchQuery, setShareSearchQuery] = useState('');
  const [shareSearchResults, setShareSearchResults] = useState<User[]>([]);
  const [selectedFileForShare, setSelectedFileForShare] = useState<File | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

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

  useEffect(() => {
    if (selectedFolder) {
      loadFiles(selectedFolder.id);
    }
  }, [selectedFolder]);

  const loadFolders = async () => {
    try {
      const response = await getFolders();
      setFolders(response.data);
      // Auto-select first folder if none selected
      if (response.data.length > 0 && !selectedFolder) {
        setSelectedFolder(response.data[0]);
      }
    } catch (error) {
      showToast('Failed to load folders', 'error');
    }
  };

  const loadFiles = async (folderId: number) => {
    try {
      const response = await getFiles(folderId);
      setFiles(response.data);
    } catch (error) {
      showToast('Failed to load files', 'error');
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

  const handleDeleteFolder = async (folderId: number, folderName: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm(`Are you sure you want to delete "${folderName}"? This will permanently delete all files inside it.`)) {
      return;
    }

    setDeletingFolderId(folderId);
    try {
      await deleteFolder(folderId);
      showToast('Folder deleted successfully', 'success');

      // If deleted folder was selected, clear selection
      if (selectedFolder?.id === folderId) {
        setSelectedFolder(null);
        setFiles([]);
      }

      loadFolders();
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Failed to delete folder', 'error');
    } finally {
      setDeletingFolderId(null);
    }
  };

  // Filter folders based on search
  const filteredFolders = folders.filter((folder) => folder.name.toLowerCase().includes(folderSearch.toLowerCase()));

  // File upload for selected folder
  const onDrop = async (acceptedFiles: File[]) => {
    if (!selectedFolder) {
      showToast('Please select a folder first', 'warning');
      return;
    }

    setUploading(true);
    try {
      for (const file of acceptedFiles) {
        await uploadFile(selectedFolder.id, file);
      }
      showToast('Files uploaded successfully', 'success');
      loadFiles(selectedFolder.id);
    } catch (error) {
      showToast('Failed to upload files', 'error');
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: !selectedFolder,
  });

  const handleDeleteFile = async (fileId: number, fileName: string) => {
    if (confirm(`Are you sure you want to delete "${fileName}"?`)) {
      try {
        await deleteFile(fileId);
        showToast('File deleted successfully', 'success');
        if (selectedFolder) {
          loadFiles(selectedFolder.id);
        }
      } catch (error) {
        showToast('Failed to delete file', 'error');
      }
    }
  };

  // Handle user search for sharing
  const handleShareSearch = async (query: string) => {
    setShareSearchQuery(query);

    if (query.length < 2) {
      setShareSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await searchUsers(query);
      // Filter out current user
      const filteredResults = response.data.filter((u: User) => u.id !== user?.id);
      setShareSearchResults(filteredResults);
    } catch (error) {
      console.error('Failed to search users:', error);
      showToast('Failed to search users', 'error');
    } finally {
      setIsSearching(false);
    }
  };

  // Handle share action
  const handleShare = async (targetUserId: number) => {
    setIsSharing(true);
    try {
      if (selectedFileForShare) {
        // Share specific file
        await shareItem('FILE', selectedFileForShare.id, targetUserId);
        showToast(`File shared successfully`, 'success');
      } else if (selectedFolder) {
        // Share entire folder
        await shareItem('FOLDER', selectedFolder.id, targetUserId);
        showToast(`Folder shared successfully`, 'success');

        // Refresh folder data to show new participant
        loadFolders();
        if (selectedFolder) {
          loadFiles(selectedFolder.id);
        }
      }

      // Close modal
      setShowShareModal(false);
      setSelectedFileForShare(null);
      setShareSearchQuery('');
      setShareSearchResults([]);
    } catch (error: any) {
      console.error('Share failed:', error);
      showToast(error.response?.data?.error || 'Failed to share item', 'error');
    } finally {
      setIsSharing(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();

    // Reset time part for accurate day comparison
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const dateToCompare = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    // Compare dates without time
    if (dateToCompare.getTime() === today.getTime()) {
      return 'Today';
    } else if (dateToCompare.getTime() === yesterday.getTime()) {
      return 'Yesterday';
    } else {
      // For older dates, return formatted date
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <PhotoIcon className="h-8 w-8 text-orange-500" />;
    }
    if (mimeType.startsWith('video/')) {
      return <VideoCameraIcon className="h-8 w-8 text-orange-500" />;
    }
    if (mimeType.startsWith('audio/')) {
      return <MusicalNoteIcon className="h-8 w-8 text-orange-500" />;
    }
    return <DocumentIcon className="h-8 w-8 text-gray-400" />;
  };

  if (loading) {
    return (
      <PageLayout title="LBfs - Loading...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-600"></div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="LBfs - Dashboard">
      <div className="flex h-[calc(100vh-4rem)] -mt-6 -mx-4 sm:-mx-6 lg:-mx-8">
        {/* Left Sidebar - Folders List */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-800">Folders</h2>
              <button
                onClick={() => setShowNewFolder(true)}
                className="p-2 bg-lime-500 hover:bg-lime-600 text-white rounded-lg transition-colors"
                title="New Folder"
              >
                <PlusIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Search Folders */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search folders..."
                value={folderSearch}
                onChange={(e) => setFolderSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-100 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
              />
            </div>
          </div>

          {/* New Folder Form */}
          {showNewFolder && (
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <form onSubmit={handleCreateFolder}>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Folder name"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg mb-2 text-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="flex-1 px-3 py-1.5 bg-lime-500 text-white text-sm rounded-lg hover:bg-lime-600 transition-colors"
                  >
                    {isCreating ? 'Creating...' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewFolder(false)}
                    className="px-3 py-1.5 bg-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Folders List */}
          <div className="flex-1 overflow-y-auto py-2">
            {filteredFolders.length > 0 ? (
              filteredFolders.map((folder) => (
                <div
                  key={folder.id}
                  onClick={() => setSelectedFolder(folder)}
                  className={`relative group px-4 py-3 cursor-pointer transition-colors ${
                    selectedFolder?.id === folder.id ? 'bg-lime-50 border-l-4 border-lime-500' : 'hover:bg-gray-50 border-l-4 border-transparent'
                  }`}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          selectedFolder?.id === folder.id ? 'bg-lime-200' : 'bg-gray-100'
                        }`}
                      >
                        <FolderIcon className={`h-5 w-5 ${selectedFolder?.id === folder.id ? 'text-lime-700' : 'text-gray-500'}`} />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`font-medium truncate ${selectedFolder?.id === folder.id ? 'text-lime-700' : 'text-gray-800'}`}>
                          {folder.name}
                        </h3>
                        <span className="text-xs text-gray-400">{folder.files_count}</span>
                      </div>

                      <div className="flex items-center text-xs text-gray-500 space-x-2">
                        <span className="flex items-center">
                          <ClockIcon className="h-3 w-3 mr-1" />
                          {formatDate(folder.updated_at)}
                        </span>
                        {folder.participants_count > 0 && (
                          <>
                            <span>•</span>
                            <span className="flex items-center">
                              <UsersIcon className="h-3 w-3 mr-1" />
                              {folder.participants_count}
                            </span>
                          </>
                        )}
                      </div>

                      {folder.owner !== user?.id && (
                        <div className="mt-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-700">
                            Shared by {folder.owner_username}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Delete button (only for owner) */}
                    {folder.owner === user?.id && (
                      <button
                        onClick={(e) => handleDeleteFolder(folder.id, folder.name, e)}
                        disabled={deletingFolderId === folder.id}
                        className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1.5 bg-white rounded-lg shadow-sm hover:bg-orange-50 transition-all"
                      >
                        <TrashIcon className="h-4 w-4 text-gray-400 hover:text-orange-600" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 px-4">
                <FolderIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-2">No folders found</p>
                {folderSearch ? (
                  <button onClick={() => setFolderSearch('')} className="text-sm text-lime-600 hover:text-lime-700">
                    Clear search
                  </button>
                ) : (
                  <button onClick={() => setShowNewFolder(true)} className="text-sm text-lime-600 hover:text-lime-700">
                    Create your first folder
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{folders.length} folders</span>
              <span>{files.length} files in selected</span>
            </div>
          </div>
        </div>

        {/* Right Content - Files Area */}
        <div className="flex-1 bg-gray-50 flex flex-col">
          {selectedFolder ? (
            <>
              {/* Folder Header */}
              <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-1">{selectedFolder.name}</h2>
                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                      <span className="flex items-center">
                        <DocumentIcon className="h-4 w-4 mr-1" />
                        {selectedFolder.files_count} files
                      </span>
                      <span className="flex items-center">
                        <UsersIcon className="h-4 w-4 mr-1" />
                        {selectedFolder.participants_count} participants
                      </span>
                      <span className="flex items-center">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        Updated {formatDate(selectedFolder.updated_at)}
                      </span>
                    </div>
                  </div>

                  {/* Share Button */}
                  <button
                    onClick={() => {
                      setSelectedFileForShare(null);
                      setShowShareModal(true);
                    }}
                    className="inline-flex items-center px-4 py-2 bg-lime-500 hover:bg-lime-600 text-white rounded-lg transition-colors"
                  >
                    <ShareIcon className="h-4 w-4 mr-2" />
                    Share Folder
                  </button>
                </div>
              </div>

              {/* Upload Area */}
              <div
                {...getRootProps()}
                className={`mx-6 mt-4 p-4 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all ${
                  isDragActive ? 'border-lime-500 bg-lime-50' : 'border-gray-200 hover:border-lime-300 hover:bg-white'
                }`}
              >
                <input {...getInputProps()} />
                <ArrowUpTrayIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 font-medium">{isDragActive ? 'Drop files here' : 'Drag & drop files or click to upload'}</p>
                {uploading && (
                  <div className="mt-2 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-lime-600 mr-2"></div>
                    <span className="text-xs text-gray-500">Uploading...</span>
                  </div>
                )}
              </div>

              {/* Files Grid */}
              <div className="flex-1 overflow-y-auto p-6">
                {files.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {files.map((file) => (
                      <div
                        key={file.id}
                        className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
                      >
                        <div className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">{getFileIcon(file.mime_type)}</div>
                            <button
                              onClick={() => {
                                setSelectedFileForShare(file);
                                setShowShareModal(true);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-lime-600 hover:bg-lime-50 rounded-lg transition-all"
                            >
                              <PaperAirplaneIcon className="h-4 w-4" />
                            </button>
                          </div>

                          <h3 className="font-medium text-gray-800 mb-1 truncate">{file.name}</h3>

                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">{formatFileSize(file.size)}</span>
                            <span className="text-gray-400">{formatDate(file.created_at)}</span>
                          </div>

                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-xs text-gray-400">by {file.uploaded_by_username}</span>
                            {user?.id === file.uploaded_by && (
                              <button
                                onClick={() => handleDeleteFile(file.id, file.name)}
                                className="p-1 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <DocumentIcon className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-sm font-medium text-gray-800 mb-1">No files yet</h3>
                    <p className="text-sm text-gray-500">Upload files to this folder to get started</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            // No folder selected state
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FolderIcon className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">No folder selected</h3>
                <p className="text-gray-500 mb-4">Select a folder from the sidebar to view its files</p>
                {folders.length === 0 && (
                  <button
                    onClick={() => setShowNewFolder(true)}
                    className="inline-flex items-center px-4 py-2 bg-lime-500 hover:bg-lime-600 text-white rounded-lg transition-colors"
                  >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Create your first folder
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm transition-opacity" />

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-xl bg-white shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <div className="bg-white px-6 py-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Share {selectedFileForShare ? 'File' : 'Folder'}</h3>
                    <button
                      onClick={() => {
                        setShowShareModal(false);
                        setSelectedFileForShare(null);
                        setShareSearchQuery('');
                        setShareSearchResults([]);
                      }}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>

                  {selectedFileForShare && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">
                        Sharing: <span className="font-medium text-gray-800">{selectedFileForShare.name}</span>
                      </p>
                    </div>
                  )}

                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={shareSearchQuery}
                      onChange={(e) => handleShareSearch(e.target.value)}
                      placeholder="Search users to share with..."
                      className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                      autoFocus
                    />
                  </div>

                  {isSearching && (
                    <div className="mt-4 flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-lime-600"></div>
                    </div>
                  )}

                  {shareSearchQuery.length > 2 && !isSearching && (
                    <div className="mt-4 max-h-60 overflow-y-auto">
                      {shareSearchResults.length > 0 ? (
                        <div className="space-y-2">
                          {shareSearchResults.map((result) => (
                            <div key={result.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                              <div className="flex items-center">
                                <div className="h-10 w-10 rounded-full bg-lime-100 flex items-center justify-center text-lime-700 font-medium">
                                  {result.username[0].toUpperCase()}
                                </div>
                                <div className="ml-3">
                                  <p className="text-sm font-medium text-gray-800">{result.username}</p>
                                  <p className="text-xs text-gray-500">{result.email}</p>
                                </div>
                              </div>
                              <button
                                onClick={() => handleShare(result.id)}
                                disabled={isSharing}
                                className="px-3 py-1.5 bg-lime-500 hover:bg-lime-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                              >
                                {isSharing ? 'Sharing...' : 'Share'}
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-4">No users found matching "{shareSearchQuery}"</p>
                      )}
                    </div>
                  )}

                  {shareSearchQuery.length > 0 && shareSearchQuery.length <= 2 && (
                    <p className="mt-4 text-sm text-gray-500 text-center">Type at least 3 characters to search</p>
                  )}

                  {shareSearchQuery.length === 0 && <p className="mt-4 text-sm text-gray-500 text-center">Search for users to share with</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
