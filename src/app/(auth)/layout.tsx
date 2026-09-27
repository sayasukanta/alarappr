import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Autentikasi | ALARA Training System',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-indigo-900 to-blue-800 flex flex-col">
      {/* Top branding bar */}
      <header className="w-full py-4 px-6 flex items-center justify-center border-b border-white/10">
        <Link href="/" className="flex items-center gap-2.5 group">
          <img
            src="/logo.png"
            alt="ALARA Logo"
            className="w-10 h-10 object-contain rounded-lg shrink-0 bg-white p-1 shadow-sm"
          />
          <div className="flex flex-col leading-tight">
            <span className="text-white font-bold text-base tracking-wide">ALARA</span>
            <span className="text-blue-300 text-[10px] tracking-widest uppercase">
              Training System
            </span>
          </div>
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 py-10">{children}</main>

      {/* Footer */}
      <footer className="w-full py-4 px-6 text-center border-t border-white/10">
        <p className="text-blue-300/60 text-xs">
          &copy; {new Date().getFullYear()} CV. Hikmat Proteksi ALARA &mdash; KTUN BAPETEN No.{' '}
          07998.722.1.040726
        </p>
      </footer>
    </div>
  );
}
