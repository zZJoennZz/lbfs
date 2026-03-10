import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// We'll set this up in a separate file to avoid circular dependencies
let showToast: ((message: string, type: 'success' | 'error' | 'info' | 'warning') => void) | null = null;

export const setToastFunction = (toastFn: typeof showToast) => {
  showToast = toastFn;
};

// Function to get CSRF token from cookie
const getCSRFToken = (): string | null => {
  if (typeof document === 'undefined') return null;

  const name = 'csrftoken';
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === name + '=') {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase() || '')) {
      const csrfToken = getCSRFToken();
      if (csrfToken) {
        config.headers['X-CSRFToken'] = csrfToken;
      }
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 [API] ${config.method?.toUpperCase()} ${config.url}`, config.data);
    }

    return config;
  },
  (error) => {
    if (showToast) {
      showToast('Request failed to send', 'error');
    }
    return Promise.reject(error);
  },
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ [API] ${response.status} ${response.config.url}`, response.data);
    }

    // Show success toast for mutating requests
    if (['post', 'put', 'patch', 'delete'].includes(response.config.method?.toLowerCase() || '')) {
      if (showToast) {
        const messages: Record<string, string> = {
          post: 'Created successfully',
          put: 'Updated successfully',
          patch: 'Updated successfully',
          delete: 'Deleted successfully',
        };
        showToast(messages[response.config.method?.toLowerCase() || ''] || 'Success', 'success');
      }
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle errors with toast
    if (showToast) {
      if (error.response?.status === 401) {
        showToast('Session expired. Please login again.', 'warning');
      } else if (error.response?.status === 403) {
        showToast('You do not have permission to perform this action', 'error');
      } else if (error.response?.status === 404) {
        showToast('Resource not found', 'error');
      } else if (error.response?.status === 400) {
        const errorData = error.response.data;
        let errorMessage = 'Validation error';

        if (typeof errorData === 'object') {
          const firstError = Object.values(errorData)[0];
          errorMessage = Array.isArray(firstError) ? firstError[0] : String(firstError);
        }

        showToast(errorMessage, 'error');
      } else if (error.response?.status >= 500) {
        showToast('Server error. Please try again later.', 'error');
      } else if (!error.response) {
        showToast('Network error. Please check your connection.', 'error');
      }
    }

    // Handle 401 Unauthorized (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await ensureCSRF();
        return api(originalRequest);
      } catch (refreshError) {
        if (typeof window !== 'undefined') {
          window.location.href = '/login?session=expired';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

// CSRF token initialization
export const ensureCSRF = async (retries = 3): Promise<boolean> => {
  for (let i = 0; i < retries; i++) {
    try {
      await axios.get(`${API_BASE_URL}/users/csrf/`, {
        withCredentials: true,
        timeout: 5000,
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      const token = getCSRFToken();
      if (token) {
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ CSRF Token initialized');
        }
        return true;
      }
    } catch (error) {
      console.error(`CSRF attempt ${i + 1} failed:`, error);
      if (i < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }
  return false;
};

// Rest of your interfaces and exports...
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar: string | null;
  bio: string;
}

export interface Folder {
  id: number;
  name: string;
  owner: number;
  owner_username: string;
  participants: number[];
  participants_count: number;
  parent_folder: number | null;
  files_count: number;
  created_at: string;
  updated_at: string;
}

export interface File {
  id: number;
  name: string;
  file: string;
  file_url: string;
  folder: number;
  uploaded_by: number;
  uploaded_by_username: string;
  size: number;
  mime_type: string;
  created_at: string;
  updated_at: string;
}

// Auth APIs
export const register = async (data: any) => {
  await ensureCSRF();
  return api.post('/users/register/', data);
};

export const login = async (username: string, password: string) => {
  await ensureCSRF();
  return api.post('/users/login/', { username, password });
};

export const logout = async () => {
  return api.post('/users/logout/');
};

export const getCurrentUser = () => api.get('/users/me/');
export const searchUsers = (query: string) => api.get(`/users/search/?q=${query}`);

// Folder APIs
export const getFolders = () => api.get('/files/folders/');
export const createFolder = async (data: Partial<Folder>) => {
  await ensureCSRF();
  return api.post('/files/folders/', { name: data.name });
};

export const getFolder = (id: number) => api.get(`/files/folders/${id}/`);
export const updateFolder = (id: number, data: Partial<Folder>) => api.put(`/files/folders/${id}/`, data);
export const deleteFolder = (id: number) => api.delete(`/files/folders/${id}/`);
export const getFolderParticipants = (id: number) => api.get(`/files/folders/${id}/participants/`);

// File APIs
export const getFiles = (folderId?: number) => {
  const url = folderId ? `/files/files/?folder=${folderId}` : '/files/files/';
  return api.get(url);
};

export const uploadFile = async (folderId: number, file: File) => {
  await ensureCSRF();
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folderId.toString());
  formData.append('name', file.name);
  return api.post('/files/files/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const deleteFile = (id: number) => api.delete(`/files/files/${id}/`);

// Share APIs
export const shareItem = async (shareType: 'FOLDER' | 'FILE', itemId: number, sharedWithId: number) => {
  await ensureCSRF();
  return api.post('/files/share/', {
    share_type: shareType,
    item_id: itemId,
    shared_with_id: sharedWithId,
  });
};

// Download file
export const downloadFile = async (fileId: number, fileName: string) => {
  try {
    const response = await api.get(`/files/download/${fileId}/`, {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return response;
  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
};

export default api;
