'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { FolderIcon, DocumentIcon, UserGroupIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-blue-600">LBfs</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                Login
              </Link>
              <Link href="/register" className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
              File Management
              <span className="text-blue-600"> Inspired by Messenger</span>
            </h2>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-500">
              Share files and folders like you're adding people to a group chat. Simple, intuitive, and collaborative.
            </p>
            <div className="mt-10 flex justify-center space-x-4">
              <Link
                href="/register"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Get Started
              </Link>
              <Link
                href="#features"
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Learn More
              </Link>
            </div>
          </div>

          {/* Features */}
          <div id="features" className="mt-24">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-white overflow-hidden shadow rounded-lg p-6">
                <div className="flex items-center">
                  <FolderIcon className="h-8 w-8 text-blue-500" />
                  <h3 className="ml-3 text-lg font-medium text-gray-900">Chat-like Folders</h3>
                </div>
                <p className="mt-4 text-gray-500">Folders work like group chats. Share a folder and it's like adding someone to the conversation.</p>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg p-6">
                <div className="flex items-center">
                  <DocumentIcon className="h-8 w-8 text-green-500" />
                  <h3 className="ml-3 text-lg font-medium text-gray-900">Smart File Sharing</h3>
                </div>
                <p className="mt-4 text-gray-500">
                  Share a single file and it automatically creates a person-specific folder, just like a direct message.
                </p>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg p-6">
                <div className="flex items-center">
                  <UserGroupIcon className="h-8 w-8 text-purple-500" />
                  <h3 className="ml-3 text-lg font-medium text-gray-900">Collaborative</h3>
                </div>
                <p className="mt-4 text-gray-500">Work together seamlessly. Everyone in the folder can see and share files.</p>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg p-6">
                <div className="flex items-center">
                  <CloudArrowUpIcon className="h-8 w-8 text-yellow-500" />
                  <h3 className="ml-3 text-lg font-medium text-gray-900">Easy Upload</h3>
                </div>
                <p className="mt-4 text-gray-500">Drag and drop files directly into folders. Simple and fast.</p>
              </div>
            </div>
          </div>

          {/* How it works */}
          <div className="mt-24">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How It Works</h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-blue-600 mb-4">Sharing a Folder</h3>
                  <p className="text-gray-600 mb-4">
                    When you share a folder with someone, it's like adding them to a group chat. They get access to all files in that folder and can
                    participate.
                  </p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <code className="text-sm text-gray-800">folder.share(with: "username") → adds to participants</code>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-green-600 mb-4">Sharing a File</h3>
                  <p className="text-gray-600 mb-4">
                    Share a single file with someone, and it automatically creates a folder named after them. It's like sending a direct message with
                    an attachment.
                  </p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <code className="text-sm text-gray-800">file.share(with: "username") → creates personal folder</code>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-24 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to get started?</h2>
            <p className="text-xl text-gray-500 mb-8">Join thousands of users who organize their files the Messenger way.</p>
            <Link
              href="/register"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-500 text-sm">© {new Date().getFullYear()} Messenger Files. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
