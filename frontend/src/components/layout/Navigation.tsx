'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MapPin, LogOut } from 'lucide-react';
import { NAV_LINKS } from '@/lib/constants';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

export function Navigation() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 hidden md:block bg-surface/90 backdrop-blur-xl border-b border-white/5">
      <nav className="mx-auto max-w-6xl px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <MapPin className="w-4.5 h-4.5 text-background" />
            </div>
            <span className="text-base font-bold text-white">BiyaheEasy</span>
          </Link>

          <div className="flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-3.5 py-2 rounded-btn text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'bg-accent/10 text-accent'
                    : 'text-muted hover:text-white hover:bg-white/5'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {user && (
              <>
                <span className="text-sm text-muted">{user.full_name?.split(' ')[0]}</span>
                <button
                  onClick={signOut}
                  className="p-2 rounded-btn text-muted hover:text-white hover:bg-white/5 transition-colors"
                  aria-label="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
