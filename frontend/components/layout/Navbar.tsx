'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { UserGroupIcon, UserCircleIcon, ArrowLeftIcon, FolderIcon, HomeIcon } from '@heroicons/react/24/outline';

interface NavbarProps {
  title?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  rightContent?: React.ReactNode;
}

export default function Navbar({ title = 'LBfs', showBackButton = false, onBackClick, rightContent }: NavbarProps) {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const pathname = usePathname();

  const handleBack = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      router.back();
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      showToast('Logged out successfully', 'success');
      router.push('/login');
    } catch (error) {
      showToast('Failed to logout', 'error');
    }
  };

  // Don't show navbar on auth pages
  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left Section - Logo and Back Button */}
          <div className="flex items-center">
            {showBackButton && (
              <button onClick={handleBack} className="mr-3 text-gray-400 hover:text-lime-600 transition-colors">
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
            )}

            {/* App Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-lime-100 rounded-lg flex items-center justify-center">
                <FolderIcon className="h-5 w-5 text-lime-600" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-lime-600 to-lime-500 bg-clip-text text-transparent">{title}</span>
            </div>
          </div>

          {/* Right Section - Navigation and User Info */}
          <div className="flex items-center space-x-2">
            {rightContent
              ? rightContent
              : user && (
                  <>
                    {/* Dashboard Link */}
                    <Link
                      href="/dashboard"
                      className={`p-2 rounded-lg transition-colors ${
                        pathname === '/dashboard' ? 'bg-lime-100 text-lime-600' : 'text-gray-400 hover:text-lime-600 hover:bg-gray-50'
                      }`}
                      title="Dashboard"
                    >
                      <HomeIcon className="h-5 w-5" />
                    </Link>

                    {/* Shared Link */}
                    <Link
                      href="/shared"
                      className={`p-2 rounded-lg transition-colors ${
                        pathname === '/shared' ? 'bg-lime-100 text-lime-600' : 'text-gray-400 hover:text-lime-600 hover:bg-gray-50'
                      }`}
                      title="Shared with me"
                    >
                      <UserGroupIcon className="h-5 w-5" />
                    </Link>

                    {/* Profile Link */}
                    <Link
                      href="/profile"
                      className={`p-2 rounded-lg transition-colors ${
                        pathname === '/profile' ? 'bg-lime-100 text-lime-600' : 'text-gray-400 hover:text-lime-600 hover:bg-gray-50'
                      }`}
                      title="Profile"
                    >
                      <UserCircleIcon className="h-5 w-5" />
                    </Link>

                    {/* Divider */}
                    <div className="h-6 w-px bg-gray-200 mx-2" />

                    {/* User Welcome */}
                    <div className="flex items-center space-x-1">
                      <span className="text-sm text-gray-600 hidden md:inline">Welcome,</span>
                      <span className="text-sm font-medium text-lime-700 hidden md:inline">{user?.username}</span>
                      {/* Mobile user initial */}
                      <div className="md:hidden w-8 h-8 bg-lime-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-lime-700">{user?.username[0].toUpperCase()}</span>
                      </div>
                    </div>

                    {/* Logout Button */}
                    <button
                      onClick={handleLogout}
                      className="ml-2 px-3 py-1.5 text-sm font-medium text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                    >
                      Logout
                    </button>
                  </>
                )}
          </div>
        </div>
      </div>

      {/* Optional: Page Title for Mobile */}
      {title !== 'LBfs' && (
        <div className="md:hidden bg-white px-4 py-2 border-t border-gray-100">
          <h2 className="text-sm font-medium text-gray-600">{title}</h2>
        </div>
      )}
    </nav>
  );
}
