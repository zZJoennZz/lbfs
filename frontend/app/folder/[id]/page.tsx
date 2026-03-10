'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
  Folder,
  File,
  User,
  getFolder,
  getFiles,
  uploadFile,
  deleteFile,
  getFolderParticipants,
  searchUsers,
  shareItem,
  downloadFile,
} from '@/lib/api';
import {
  DocumentIcon,
  ArrowUpTrayIcon,
  UserPlusIcon,
  TrashIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  UsersIcon,
  PhotoIcon,
  MusicalNoteIcon,
  VideoCameraIcon,
  ChevronLeftIcon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ClockIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import { useDropzone } from 'react-dropzone';
import PageLayout from '@/components/layout/PageLayout';

export default function FolderPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [folder, setFolder] = useState<Folder | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [participants, setParticipants] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [shareType, setShareType] = useState<'FOLDER' | 'FILE'>('FOLDER');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [fileSearch, setFileSearch] = useState('');

  useEffect(() => {
    if (id) {
      loadFolderData();
    }
  }, [id]);

  const loadFolderData = async () => {
    try {
      const [folderRes, filesRes, participantsRes] = await Promise.all([
        getFolder(Number(id)),
        getFiles(Number(id)),
        getFolderParticipants(Number(id)),
      ]);
      setFolder(folderRes.data);
      setFiles(filesRes.data);
      setParticipants(participantsRes.data);
    } catch (error) {
      showToast('Failed to load folder data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const onDrop = async (acceptedFiles: File[]) => {
    setUploading(true);
    try {
      for (const file of acceptedFiles) {
        await uploadFile(Number(id), file);
      }
      showToast('Files uploaded successfully', 'success');
      loadFolderData();
    } catch (error) {
      showToast('Failed to upload files', 'error');
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleDeleteFile = async (fileId: number, fileName: string) => {
    if (confirm(`Are you sure you want to delete "${fileName}"?`)) {
      try {
        await deleteFile(fileId);
        showToast('File deleted successfully', 'success');
        loadFolderData();
      } catch (error) {
        showToast('Failed to delete file', 'error');
      }
    }
  };

  const handleFileClick = async (file: File) => {
    try {
      await downloadFile(file.id, file.name);
    } catch (error) {
      showToast('Failed to download file', 'error');
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length > 2) {
      try {
        const response = await searchUsers(query);
        setSearchResults(response.data);
      } catch (error) {
        showToast('Failed to search users', 'error');
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleShare = async (userId: number) => {
    try {
      if (shareType === 'FOLDER') {
        await shareItem('FOLDER', Number(id), userId);
        showToast('Folder shared successfully', 'success');
      } else if (selectedFile) {
        await shareItem('FILE', selectedFile.id, userId);
        showToast('File shared successfully', 'success');
      }
      setShowShareModal(false);
      setSelectedFile(null);
      setSearchQuery('');
      setSearchResults([]);
      loadFolderData();
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Failed to share item', 'error');
    }
  };

  const openShareModal = (type: 'FOLDER' | 'FILE', file?: File) => {
    setShareType(type);
    if (file) {
      setSelectedFile(file);
    }
    setShowShareModal(true);
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
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
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

  // Filter files based on search
  const filteredFiles = files.filter((file) => file.name.toLowerCase().includes(fileSearch.toLowerCase()));

  // Custom right content for folder page
  const folderRightContent = (
    <div className="flex items-center space-x-3">
      <div className="flex items-center space-x-1 bg-gray-50 px-3 py-1.5 rounded-lg">
        <UsersIcon className="h-4 w-4 text-gray-400" />
        <span className="text-sm font-medium text-gray-600">{participants.length}</span>
      </div>
      <button
        onClick={() => openShareModal('FOLDER')}
        className="inline-flex items-center px-3 py-1.5 bg-lime-500 hover:bg-lime-600 text-white text-sm font-medium rounded-lg transition-colors"
      >
        <UserPlusIcon className="h-4 w-4 mr-1" />
        Share
      </button>
    </div>
  );

  if (loading) {
    return (
      <PageLayout title="Loading..." showBackButton>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-600"></div>
        </div>
      </PageLayout>
    );
  }

  if (!folder) {
    return (
      <PageLayout title="Not Found" showBackButton>
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <DocumentIcon className="h-10 w-10 text-orange-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-800">Folder not found</h3>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={folder.name} showBackButton rightContent={folderRightContent}>
      {/* Folder Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Total Files</span>
            <div className="w-8 h-8 bg-lime-100 rounded-lg flex items-center justify-center">
              <DocumentIcon className="h-4 w-4 text-lime-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800">{files.length}</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Participants</span>
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <UsersIcon className="h-4 w-4 text-orange-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800">{participants.length}</p>
          {participants.length > 0 && <p className="mt-1 text-xs text-gray-500">{participants.map((p) => p.username).join(', ')}</p>}
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Total Size</span>
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <ClockIcon className="h-4 w-4 text-gray-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800">{formatFileSize(files.reduce((acc, file) => acc + file.size, 0))}</p>
        </div>
      </div>

      {/* Upload Area */}
      <div className="mb-6">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            isDragActive ? 'border-lime-500 bg-lime-50' : 'border-gray-200 hover:border-lime-300 hover:bg-gray-50'
          }`}
        >
          <input {...getInputProps()} />
          <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <p className="text-gray-600 font-medium mb-1">{isDragActive ? 'Drop the files here...' : 'Drag & drop files here'}</p>
          <p className="text-sm text-gray-500">or click to select files</p>
          {uploading && (
            <div className="mt-4 flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-lime-600 mr-2"></div>
              <span className="text-sm text-gray-600">Uploading...</span>
            </div>
          )}
        </div>
      </div>

      {/* Files Header */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h3 className="font-semibold text-gray-800">Files ({files.length})</h3>

            <div className="flex items-center space-x-3">
              {/* Search */}
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search files..."
                  value={fileSearch}
                  onChange={(e) => setFileSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                />
              </div>

              {/* View Toggle */}
              <div className="flex items-center border border-gray-200 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' ? 'bg-lime-100 text-lime-600' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Squares2X2Icon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' ? 'bg-lime-100 text-lime-600' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <ListBulletIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Files Display */}
        {filteredFiles.length > 0 ? (
          viewMode === 'grid' ? (
            // Grid View
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className="group relative bg-white border border-gray-100 rounded-xl hover:shadow-md transition-all duration-200 overflow-hidden"
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">{getFileIcon(file.mime_type)}</div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => openShareModal('FILE', file)}
                          className="p-1.5 text-gray-400 hover:text-lime-600 hover:bg-lime-50 rounded-lg transition-colors"
                          title="Share file"
                        >
                          <PaperAirplaneIcon className="h-4 w-4" />
                        </button>
                        {user?.id === file.uploaded_by && (
                          <button
                            onClick={() => handleDeleteFile(file.id, file.name)}
                            className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            title="Delete file"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <button onClick={() => handleFileClick(file)} className="text-left w-full">
                      <h4 className="font-medium text-gray-800 mb-1 truncate hover:text-lime-600">{file.name}</h4>
                      <div className="flex items-center text-xs text-gray-500 space-x-2">
                        <span>{formatFileSize(file.size)}</span>
                        <span>•</span>
                        <span>{formatDate(file.created_at)}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">by {file.uploaded_by_username}</p>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // List View
            <div className="divide-y divide-gray-100">
              {filteredFiles.map((file) => (
                <div key={file.id} className="group hover:bg-gray-50 transition-colors">
                  <div className="px-4 py-3 flex items-center">
                    <div className="flex-shrink-0 mr-4">{getFileIcon(file.mime_type)}</div>

                    <div className="flex-1 min-w-0">
                      <button onClick={() => handleFileClick(file)} className="text-left w-full">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-800 group-hover:text-lime-600">{file.name}</h4>
                            <div className="flex items-center text-xs text-gray-500 space-x-3 mt-1">
                              <span>{formatFileSize(file.size)}</span>
                              <span>•</span>
                              <span>Uploaded by {file.uploaded_by_username}</span>
                              <span>•</span>
                              <span>{formatDate(file.created_at)}</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => openShareModal('FILE', file)}
                        className="p-2 text-gray-400 hover:text-lime-600 hover:bg-lime-50 rounded-lg transition-colors"
                        title="Share file"
                      >
                        <PaperAirplaneIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleFileClick(file)}
                        className="p-2 text-gray-400 hover:text-lime-600 hover:bg-lime-50 rounded-lg transition-colors"
                        title="Download file"
                      >
                        <ArrowDownTrayIcon className="h-5 w-5" />
                      </button>
                      {user?.id === file.uploaded_by && (
                        <button
                          onClick={() => handleDeleteFile(file.id, file.name)}
                          className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Delete file"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          // Empty State
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <DocumentIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-800 mb-1">No files found</h3>
            <p className="text-sm text-gray-500 mb-4">{fileSearch ? 'No files match your search' : 'Upload files to get started'}</p>
            {fileSearch ? (
              <button
                onClick={() => setFileSearch('')}
                className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                Clear search
              </button>
            ) : (
              <div {...getRootProps()} className="inline-block">
                <input {...getInputProps()} />
                <button className="inline-flex items-center px-4 py-2 bg-lime-500 hover:bg-lime-600 text-white rounded-lg transition-colors text-sm">
                  <ArrowUpTrayIcon className="h-4 w-4 mr-2" />
                  Upload Files
                </button>
              </div>
            )}
          </div>
        )}
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
                    <h3 className="text-lg font-semibold text-gray-800">Share {shareType === 'FOLDER' ? 'Folder' : 'File'}</h3>
                    <button
                      onClick={() => {
                        setShowShareModal(false);
                        setSelectedFile(null);
                        setSearchQuery('');
                        setSearchResults([]);
                      }}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>

                  {shareType === 'FILE' && selectedFile && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">
                        Sharing: <span className="font-medium text-gray-800">{selectedFile.name}</span>
                      </p>
                    </div>
                  )}

                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      placeholder="Search users by username..."
                      className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                      autoFocus
                    />
                  </div>

                  {searchQuery.length > 2 && (
                    <div className="mt-4 max-h-60 overflow-y-auto">
                      {searchResults.length > 0 ? (
                        <div className="space-y-2">
                          {searchResults.map((result) => (
                            <div key={result.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                              <div className="flex items-center min-w-0">
                                <div className="h-10 w-10 rounded-full bg-lime-100 flex items-center justify-center text-lime-700 font-medium flex-shrink-0">
                                  {result.username[0].toUpperCase()}
                                </div>
                                <div className="ml-3 min-w-0">
                                  <p className="text-sm font-medium text-gray-800 truncate">{result.username}</p>
                                  <p className="text-xs text-gray-500 truncate">{result.email}</p>
                                </div>
                              </div>
                              <button
                                onClick={() => handleShare(result.id)}
                                className="ml-4 px-3 py-1.5 bg-lime-500 hover:bg-lime-600 text-white text-sm font-medium rounded-lg transition-colors"
                              >
                                Share
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-4">No users found matching "{searchQuery}"</p>
                      )}
                    </div>
                  )}

                  {searchQuery.length > 0 && searchQuery.length <= 2 && (
                    <p className="mt-4 text-sm text-gray-500 text-center">Type at least 3 characters to search</p>
                  )}

                  {searchQuery.length === 0 && <p className="mt-4 text-sm text-gray-500 text-center">Search for users to share with</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
