import type { Metadata, Viewport } from 'next';
import { AuthProvider } from '@/context/AuthContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'BiyaheEasy - Smart Commute Planning',
  description: 'AI-assisted commuting and route-planning platform for Filipino commuters.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/icon.svg',
    apple: '/icons/icon.svg',
  },
};

export const viewport: Viewport = {
  themeColor: '#E8F000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
