'use client';

import Navbar from './Navbar';

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  rightContent?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl';
}

const maxWidthClasses = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-screen-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
};

export default function PageLayout({ children, title, showBackButton = false, onBackClick, rightContent, maxWidth = '7xl' }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar title={title} showBackButton={showBackButton} onBackClick={onBackClick} rightContent={rightContent} />
      <main className={`${maxWidthClasses[maxWidth]} mx-auto py-6 sm:px-6 lg:px-8`}>
        <div className="px-4 py-6 sm:px-0">{children}</div>
      </main>
    </div>
  );
}
