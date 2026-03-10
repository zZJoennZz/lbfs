'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { UserGroupIcon, UserCircleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

interface NavbarProps {
  title?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  rightContent?: React.ReactNode;
}

export default function Navbar({ title = 'Messenger Files', showBackButton = false, onBackClick, rightContent }: NavbarProps) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleBack = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      router.back();
    }
  };

  // Don't show navbar on auth pages
  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {showBackButton && (
              <button onClick={handleBack} className="mr-4 text-gray-500 hover:text-gray-700">
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
            )}
            <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
          </div>

          <div className="flex items-center space-x-4">
            {rightContent
              ? rightContent
              : user && (
                  <>
                    <Link
                      href="/shared"
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200"
                    >
                      <UserGroupIcon className="h-5 w-5 mr-1" />
                      Shared
                    </Link>
                    <Link
                      href="/profile"
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200"
                    >
                      <UserCircleIcon className="h-5 w-5 mr-1" />
                      Profile
                    </Link>
                    <span className="text-gray-700">Welcome, {user?.username}</span>
                    <button onClick={() => router.push('/login')} className="text-gray-500 hover:text-gray-700">
                      Logout
                    </button>
                  </>
                )}
          </div>
        </div>
      </div>
    </nav>
  );
}
