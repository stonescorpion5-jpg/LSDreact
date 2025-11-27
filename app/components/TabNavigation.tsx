'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function TabNavigation() {
  const pathname = usePathname();

  const tabs = [
    { name: 'Simulate', href: '/simulate' },
    { name: 'Design', href: '/design' },
    { name: 'Driver', href: '/driver' },
  ];

  return (
    <nav className="bg-white border-t border-gray-200 fixed bottom-0 w-full">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex justify-around">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={`flex-1 flex flex-col items-center justify-center py-4 text-sm font-medium ${
                  isActive
                    ? 'text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.name}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}