import type { Metadata } from 'next';
import { Geist, Geist_Mono, Great_Vibes, Playfair_Display } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { Providers } from '@/components/Providers';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });
const greatVibes = Great_Vibes({ weight: '400', variable: '--font-great-vibes', subsets: ['latin'] });
const playfairDisplay = Playfair_Display({ variable: '--font-playfair', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ALARA Training System | CV. Hikmat Proteksi ALARA',
  description:
    'Sistem Manajemen Pelatihan Proteksi Radiasi - Lembaga Pelatihan Ketenaganukliran Resmi BAPETEN',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={`${geistSans.variable} ${geistMono.variable} ${greatVibes.variable} ${playfairDisplay.variable} antialiased`}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
