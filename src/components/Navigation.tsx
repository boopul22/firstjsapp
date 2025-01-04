'use client';

import Link from 'next/link';

export default function Navigation() {
  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold">Hindi Rewriter</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
} 