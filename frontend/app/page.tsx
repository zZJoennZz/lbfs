'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
  FolderIcon,
  DocumentIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  BuildingOfficeIcon,
  LockClosedIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  return (
    <div className="min-h-screen bg-white">
      {/* Simple Internal Header */}
      <div className="bg-gray-900 text-white py-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs text-center">🔒 Internal Company Tool - Authorized Employees Only</p>
        </div>
      </div>

      {/* Navigation - Clean and simple */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-lime-100 rounded-lg flex items-center justify-center mr-3">
                <FolderIcon className="h-5 w-5 text-lime-600" />
              </div>
              <span className="text-xl font-semibold text-gray-900">LBfs</span>
              <span className="ml-3 text-sm text-gray-500">· Employee Portal</span>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                href="/login"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                Employee Login
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section - Internal focused */}
        <div className="bg-gradient-to-br from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="max-w-3xl">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-lime-50 border border-lime-200 mb-6">
                <BuildingOfficeIcon className="h-4 w-4 text-lime-600 mr-2" />
                <span className="text-sm font-medium text-lime-700">Internal Company Portal</span>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">Welcome to LBfs</h1>
              <p className="mt-4 text-xl text-gray-500">
                Your company's secure file management system. Access and share files with colleagues across departments.
              </p>

              {/* Quick Links for Employees */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                  <div className="w-10 h-10 bg-lime-100 rounded-lg flex items-center justify-center mb-3">
                    <FolderIcon className="h-5 w-5 text-lime-600" />
                  </div>
                  <h3 className="font-medium text-gray-900">Department Folders</h3>
                  <p className="text-sm text-gray-500 mt-1">Access your team's files</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mb-3">
                    <UserGroupIcon className="h-5 w-5 text-orange-600" />
                  </div>
                  <h3 className="font-medium text-gray-900">Team Collaboration</h3>
                  <p className="text-sm text-gray-500 mt-1">Share with colleagues</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                    <DocumentIcon className="h-5 w-5 text-gray-600" />
                  </div>
                  <h3 className="font-medium text-gray-900">Company Files</h3>
                  <p className="text-sm text-gray-500 mt-1">Central document hub</p>
                </div>
              </div>

              <div className="mt-8">
                <Link
                  href="/login"
                  className="inline-flex items-center px-6 py-3 bg-lime-600 text-white font-medium rounded-lg hover:bg-lime-700 transition-colors shadow-sm"
                >
                  Access Your Dashboard
                  <ArrowRightOnRectangleIcon className="h-5 w-5 ml-2" />
                </Link>
                <p className="mt-3 text-sm text-gray-500">Use your company credentials to log in</p>
              </div>
            </div>
          </div>
        </div>

        {/* Internal Info - For Employees */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column - How to Use */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">📋 Quick Start Guide</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-lime-100 rounded-full flex items-center justify-center text-sm font-medium text-lime-700 mr-3">1</div>
                  <div>
                    <p className="text-gray-800">
                      <span className="font-medium">Log in</span> with your company email
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-lime-100 rounded-full flex items-center justify-center text-sm font-medium text-lime-700 mr-3">2</div>
                  <div>
                    <p className="text-gray-800">
                      <span className="font-medium">Browse folders</span> by department or project
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-lime-100 rounded-full flex items-center justify-center text-sm font-medium text-lime-700 mr-3">3</div>
                  <div>
                    <p className="text-gray-800">
                      <span className="font-medium">Upload and share</span> files with team members
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-lime-100 rounded-full flex items-center justify-center text-sm font-medium text-lime-700 mr-3">4</div>
                  <div>
                    <p className="text-gray-800">
                      <span className="font-medium">Collaborate</span> in real-time with colleagues
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Company Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">🏢 Company Information</h2>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Department Folders:</span>
                  <span className="font-medium text-gray-900">12 active</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Active Employees:</span>
                  <span className="font-medium text-gray-900">247 users</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Total Files:</span>
                  <span className="font-medium text-gray-900">8.5K documents</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">Last Updated:</span>
                  <span className="font-medium text-gray-900">{new Date().toLocaleDateString()}</span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700 flex items-center">
                  <ShieldCheckIcon className="h-4 w-4 mr-2" />
                  For IT support, contact helpdesk@company.com
                </p>
              </div>
            </div>
          </div>

          {/* Important Notice */}
          <div className="mt-8 bg-gray-50 rounded-xl border border-gray-200 p-6">
            <div className="flex items-start">
              <LockClosedIcon className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Confidential Information</h3>
                <p className="text-sm text-gray-500">
                  This system contains confidential company information. By logging in, you agree to handle all data in accordance with company
                  policies. Unauthorized access or distribution is strictly prohibited.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Department Quick Access */}
        <div className="bg-gray-50 border-y border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Access by Department</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['Marketing', 'Engineering', 'Sales', 'HR', 'Finance', 'Operations', 'Legal', 'Product'].map((dept) => (
                <div key={dept} className="bg-white p-4 rounded-lg border border-gray-200 hover:border-lime-300 hover:shadow-sm transition-all">
                  <p className="font-medium text-gray-800">{dept}</p>
                  <p className="text-xs text-gray-400 mt-1">12 folders</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Simple Footer - Internal only */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-6 h-6 bg-lime-100 rounded flex items-center justify-center">
                <FolderIcon className="h-3 w-3 text-lime-600" />
              </div>
              <span className="text-sm text-gray-500">© {new Date().getFullYear()} LBfs - Internal Company Tool</span>
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="text-sm text-gray-500 hover:text-lime-600">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-gray-500 hover:text-lime-600">
                Terms of Use
              </Link>
              <Link href="/support" className="text-sm text-gray-500 hover:text-lime-600">
                IT Support
              </Link>
            </div>
          </div>
          <div className="mt-4 text-center text-xs text-gray-400">Authorized employees only. All activities are logged and monitored.</div>
        </div>
      </footer>
    </div>
  );
}
