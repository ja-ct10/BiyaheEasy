'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Map, FolderOpen, Wallet, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/plan', label: 'Plan', icon: Map },
  { href: '/trips', label: 'Trips', icon: FolderOpen },
  { href: '/budget', label: 'Budget', icon: Wallet },
  { href: '/profile', label: 'Profile', icon: User },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden" role="tablist">
      <div className="bg-surface/95 backdrop-blur-xl border-t border-white/5 safe-area-pb">
        <div className="flex items-center justify-around px-1 py-1.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                role="tab"
                aria-selected={isActive}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all min-w-[56px]',
                  isActive
                    ? 'text-accent'
                    : 'text-muted active:scale-95'
                )}
              >
                <Icon className={cn('w-5 h-5', isActive && 'drop-shadow-[0_0_6px_rgba(232,240,0,0.4)]')} />
                <span className={cn('text-[10px] font-medium', isActive && 'font-semibold')}>
                  {tab.label}
                </span>
                {isActive && (
                  <div className="absolute -bottom-0.5 w-5 h-0.5 rounded-full bg-accent" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
