'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function TabNavigation() {
  const pathname = usePathname();

  const tabs = [
    { name: 'Design', href: '/design', icon: '📐' },
    { name: 'Driver', href: '/driver', icon: '🔊' },
    { name: 'Simulate', href: '/simulate', icon: '📊' },
    { name: 'Settings', href: '/settings', icon: '⚙️' },
  ];

  return (
    <nav className="bg-white border-t border-gray-200 fixed bottom-0 w-full shadow-lg z-50">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex justify-around">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={`flex-1 flex flex-col items-center justify-center py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="text-lg sm:text-xl mb-0.5">{tab.icon}</span>
                <span className="hidden xs:block">{tab.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}