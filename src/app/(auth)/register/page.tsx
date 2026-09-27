'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Loader2,
  Sparkles,
  UserCheck,
  FileCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RegisterPage() {
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  const handleGoogleSignUp = async () => {
    try {
      setLoadingGoogle(true);
      await signIn('google', {
        callbackUrl: '/profil',
      });
    } catch (error) {
      console.error('Google Sign In Error:', error);
      setLoadingGoogle(false);
    }
  };

  return (
    <div className="w-full max-w-lg">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 sm:p-10 shadow-2xl text-white">
        {/* Header Icon */}
        <div className="text-center mb-6">
          <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white p-2 mb-4 shadow-lg">
            <img src="/logo.png" alt="ALARA Logo" className="w-full h-full object-contain" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-slate-900"></span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Registrasi Peserta ALARA
          </h1>
          <p className="text-blue-200/80 text-sm mt-1.5 max-w-sm mx-auto">
            Sistem Pelatihan Proteksi & Keselamatan Radiasi Ketenaganukliran (BAPETEN)
          </p>
        </div>

        {/* Security & Anti-Bot Badge */}
        <div className="bg-blue-500/15 border border-blue-400/30 rounded-2xl p-4 mb-6 text-sm">
          <div className="flex items-center gap-2.5 font-semibold text-blue-100 mb-1.5">
            <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Verifikasi Keaslian Peserta</span>
          </div>
          <p className="text-blue-200/80 text-xs leading-relaxed">
            Untuk memastikan keamanan data, mencegah akun fiktif/bot, dan validasi sertifikasi resmi BAPETEN, pendaftaran akun baru wajib diawali dengan verifikasi Akun Google aktif Anda.
          </p>
        </div>

        {/* Workflow Steps */}
        <div className="space-y-3 mb-8">
          <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl p-3">
            <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-xs font-bold text-blue-300">1</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Verifikasi Akun Google</p>
              <p className="text-[11px] text-blue-200/70">
                Sistem memastikan identitas email Anda sah dan terverifikasi resmi oleh Google.
              </p>
            </div>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 ml-auto shrink-0 mt-1" />
          </div>

          <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl p-3">
            <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-xs font-bold text-blue-300">2</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Lengkapi Data Diri & NIK KTP</p>
              <p className="text-[11px] text-blue-200/70">
                Pengisian NIK, nomor WhatsApp, serta pilihan program dan jadwal batch pelatihan.
              </p>
            </div>
            <FileCheck className="w-4 h-4 text-blue-300/70 ml-auto shrink-0 mt-1" />
          </div>
        </div>

        {/* Action Button: Google Sign Up */}
        <div className="space-y-3">
          <Button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={loadingGoogle}
            className="w-full h-12 bg-white hover:bg-slate-100 text-slate-800 font-bold rounded-2xl shadow-xl transition-all duration-200 flex items-center justify-center gap-3 text-base group cursor-pointer"
          >
            {loadingGoogle ? (
              <>
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                <span>Menghubungkan ke Google…</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Daftar dengan Akun Google</span>
                <ArrowRight className="w-4 h-4 ml-1 opacity-70 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>

          <p className="text-center text-[11px] text-blue-200/50">
            Gratis • Verifikasi Instan • Terlindungi Enkripsi SSL
          </p>
        </div>

        {/* Existing account link */}
        <div className="mt-8 pt-6 border-t border-white/10 text-center">
          <p className="text-sm text-blue-200/80">
            Sudah memiliki akun terdaftar?{' '}
            <Link
              href="/login"
              className="text-blue-300 font-bold hover:text-white underline underline-offset-4 transition-colors"
            >
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>

      {/* Footer Info */}
      <p className="text-center text-blue-300/40 text-xs mt-6 leading-relaxed">
        CV Hikmat Proteksi ALARA &bull; Lembaga Pelatihan Ketenaganukliran Terakreditasi BAPETEN
      </p>
    </div>
  );
}
