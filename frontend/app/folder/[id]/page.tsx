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
import { DocumentIcon, ArrowUpTrayIcon, UserPlusIcon, TrashIcon, XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
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

  const handleDeleteFile = async (fileId: number) => {
    if (confirm('Are you sure you want to delete this file?')) {
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

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎥';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('sheet')) return '📊';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📽️';
    if (mimeType.includes('zip') || mimeType.includes('compressed')) return '🗜️';
    return '📎';
  };

  if (loading) {
    return (
      <PageLayout title="Loading..." showBackButton>
        <div className="flex items-center justify-center h-64">
          <div className="text-xl text-gray-600">Loading folder...</div>
        </div>
      </PageLayout>
    );
  }

  if (!folder) {
    return (
      <PageLayout title="Not Found" showBackButton>
        <div className="flex items-center justify-center h-64">
          <div className="text-xl text-red-600">Folder not found</div>
        </div>
      </PageLayout>
    );
  }

  // Custom right content for folder page
  const folderRightContent = (
    <>
      <span className="text-sm text-gray-600">Owner: {folder.owner_username}</span>
      <button
        onClick={() => openShareModal('FOLDER')}
        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
      >
        <UserPlusIcon className="h-4 w-4 mr-1" />
        Share Folder
      </button>
    </>
  );

  return (
    <PageLayout title={folder.name} showBackButton rightContent={folderRightContent}>
      {/* Participants Section */}
      <div className="mb-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Participants ({participants.length})</h3>
            <div className="flex flex-wrap gap-2">
              {participants.map((participant) => (
                <div key={participant.id} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                  {participant.username}
                  {participant.id === folder.owner && <span className="ml-1 text-xs text-gray-500">(owner)</span>}
                </div>
              ))}
              {participants.length === 0 && <p className="text-sm text-gray-500">No participants yet</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      <div className="mb-6">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">{isDragActive ? 'Drop the files here...' : 'Drag & drop files here, or click to select'}</p>
          {uploading && <p className="mt-2 text-sm text-blue-600">Uploading...</p>}
        </div>
      </div>

      {/* Files List */}
      <div>
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {files.map((file) => (
              <li key={file.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center min-w-0 flex-1">
                    <div className="flex-shrink-0 text-2xl mr-3">{getFileIcon(file.mime_type)}</div>
                    <div className="min-w-0 flex-1">
                      <div>
                        <button
                          onClick={() => handleFileClick(file)}
                          className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline text-left"
                        >
                          {file.name}
                        </button>
                        <div className="mt-1 flex items-center text-xs text-gray-500 space-x-2">
                          <span>{formatFileSize(file.size)}</span>
                          <span>•</span>
                          <span>Uploaded by {file.uploaded_by_username}</span>
                          <span>•</span>
                          <span>{new Date(file.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="ml-5 flex-shrink-0 flex space-x-2">
                    <button
                      onClick={() => openShareModal('FILE', file)}
                      className="inline-flex items-center p-2 border border-gray-300 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
                      title="Share file"
                    >
                      <PaperAirplaneIcon className="h-4 w-4" />
                    </button>
                    {user?.id === file.uploaded_by && (
                      <button
                        onClick={() => handleDeleteFile(file.id)}
                        className="inline-flex items-center p-2 border border-gray-300 rounded-full text-red-400 hover:text-red-500 hover:bg-red-50 focus:outline-none"
                        title="Delete file"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
            {files.length === 0 && (
              <li className="px-4 py-8 text-center text-gray-500">No files in this folder yet. Upload some files to get started!</li>
            )}
          </ul>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold leading-6 text-gray-900">Share {shareType === 'FOLDER' ? 'Folder' : 'File'}</h3>
                        <button
                          onClick={() => {
                            setShowShareModal(false);
                            setSelectedFile(null);
                            setSearchQuery('');
                            setSearchResults([]);
                          }}
                          className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                        >
                          <XMarkIcon className="h-6 w-6" />
                        </button>
                      </div>

                      {shareType === 'FILE' && selectedFile && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-md">
                          <p className="text-sm text-gray-600">
                            Sharing file: <span className="font-medium text-gray-900">{selectedFile.name}</span>
                          </p>
                        </div>
                      )}

                      <div className="mt-2">
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => handleSearch(e.target.value)}
                          placeholder="Search users by username..."
                          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                          autoFocus
                        />
                      </div>

                      {searchQuery.length > 2 && (
                        <div className="mt-4">
                          {searchResults.length > 0 ? (
                            <div className="max-h-60 overflow-y-auto divide-y divide-gray-200">
                              {searchResults.map((result) => (
                                <div key={result.id} className="flex items-center justify-between py-3">
                                  <div className="flex items-center min-w-0">
                                    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium flex-shrink-0">
                                      {result.username[0].toUpperCase()}
                                    </div>
                                    <div className="ml-3 min-w-0">
                                      <p className="text-sm font-medium text-gray-900 truncate">{result.username}</p>
                                      <p className="text-xs text-gray-500 truncate">{result.email}</p>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => handleShare(result.id)}
                                    className="ml-4 inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
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
          </div>
        </div>
      )}
    </PageLayout>
  );
}
