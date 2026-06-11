'use client';

import { Book, Home, Search, Sparkle, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNavigation() {
  const pathname = usePathname();

  const navItems = [
    {
      id: 'home',
      label: '홈',
      icon: Home,
      path: '/',
    },
    {
      id: 'search',
      label: '검색',
      icon: Search,
      path: '/search',
    },
    {
      id: 'bible',
      label: '성경',
      icon: Book,
      path: '/bible',
    },
    {
      id: 'ai',
      label: '해설',
      icon: Sparkle,
      path: '/ai',
    },
    {
      id: 'my',
      label: '마이',
      icon: User,
      path: '/my',
    },
  ];

  return (
    <div
      className="fixed bottom-0 left-0 right-0 border-t safe-area-bottom"
      style={{
        backgroundColor: '#F0EEE7',
        borderColor: '#D2CFC8',
      }}
    >
      <div className="flex h-[101px] max-h-[13.47vh]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.id === 'bible'
              ? pathname === '/bible' || pathname.startsWith('/bible/')
              : item.id === 'search'
                ? pathname === '/search'
                : item.id === 'ai'
                  ? pathname === '/ai' || pathname.startsWith('/ai/')
                  : item.id === 'my'
                    ? pathname === '/my' || pathname.startsWith('/my/')
                    : pathname === item.path;

          return (
            <Link
              key={item.id}
              href={item.path}
              prefetch
              aria-current={isActive ? 'page' : undefined}
              className="flex flex-1 flex-col items-center justify-center px-4"
            >
              {item.id === 'home' ? (
                <Image
                  src={isActive ? '/icons/home-filled-active.svg' : '/icons/home-filled-inactive.svg'}
                  alt="홈"
                  width={24}
                  height={24}
                  className="mb-1"
                />
              ) : item.id === 'bible' ? (
                <Image
                  src={isActive ? '/icons/bible-active.svg' : '/icons/bible-inactive.svg'}
                  alt="성경"
                  width={24}
                  height={24}
                  className="mb-1"
                />
              ) : (
                <Icon
                  size={24}
                  className="mb-1"
                  style={{
                    color: isActive ? '#8D8881' : '#D2CFC8',
                    fill: isActive ? '#8D8881' : 'transparent',
                    stroke: isActive ? '#8D8881' : '#D2CFC8',
                  }}
                />
              )}
              <span className="text-xs font-medium" style={{ color: '#343434' }}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
