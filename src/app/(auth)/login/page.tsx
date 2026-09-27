'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ShieldCheck, Mail, Lock, Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
const LoginSchema = z.object({
  email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
});

type LoginValues = z.infer<typeof LoginSchema>;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<LoginValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: '', password: '' },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: LoginValues) {
    setServerError(null);

    const result = await signIn('credentials', {
      email: values.email,
      password: values.password,
      redirect: false,
    });

    if (result?.error) {
      // Map NextAuth error codes to human-readable Indonesian messages
      const errorMap: Record<string, string> = {
        CredentialsSignin: 'Email atau password salah. Silakan periksa kembali.',
        Configuration: 'Terjadi kesalahan konfigurasi. Hubungi administrator.',
      };
      setServerError(errorMap[result.error] ?? 'Terjadi kesalahan. Silakan coba lagi.');
      return;
    }

    if (result?.ok) {
      router.push('/dashboard');
      router.refresh();
    }
  }

  return (
    <div className="w-full max-w-md">
      {/* Card */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white p-2 shadow-lg mb-4">
            <img src="/logo.png" alt="ALARA Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-extrabold text-white mb-1">Masuk ke ALARA</h1>
          <p className="text-blue-200/70 text-sm">
            Masukkan kredensial Anda untuk melanjutkan
          </p>
        </div>

        {/* Server error */}
        {serverError && (
          <div className="flex items-start gap-3 p-4 mb-6 bg-red-500/10 border border-red-400/30 rounded-xl text-red-200 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-100 text-sm font-medium">Alamat Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300/60" />
                      <Input
                        {...field}
                        type="email"
                        placeholder="nama@email.com"
                        autoComplete="email"
                        disabled={isSubmitting}
                        className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-blue-200/40 focus:border-blue-400 focus:ring-blue-400/30 h-11"
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-300 text-xs" />
                </FormItem>
              )}
            />

            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between mb-1">
                    <FormLabel className="text-blue-100 text-sm font-medium">Password</FormLabel>
                    <Link
                      href="/forgot-password"
                      className="text-blue-300 text-xs hover:text-blue-200 transition-colors"
                    >
                      Lupa password?
                    </Link>
                  </div>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300/60" />
                      <Input
                        {...field}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        disabled={isSubmitting}
                        className="pl-10 pr-11 bg-white/10 border-white/20 text-white placeholder:text-blue-200/40 focus:border-blue-400 focus:ring-blue-400/30 h-11"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((p) => !p)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-blue-300/60 hover:text-blue-200 transition-colors"
                        aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-300 text-xs" />
                </FormItem>
              )}
            />

            {/* Submit */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 bg-blue-500 hover:bg-blue-400 text-white font-semibold rounded-xl shadow-lg shadow-blue-900/30 transition-all mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Memproses…
                </>
              ) : (
                'Masuk'
              )}
            </Button>
          </form>
        </Form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-blue-300/50 text-xs">ATAU</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Google Login Button */}
        <Button
          type="button"
          onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
          className="w-full h-11 bg-white hover:bg-slate-100 text-slate-800 font-semibold rounded-xl shadow transition-all flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
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
          Masuk dengan Google
        </Button>

        {/* Register link */}
        <p className="text-center text-sm text-blue-200/70 mt-5">
          Belum punya akun?{' '}
          <Link
            href="/register"
            className="text-blue-300 font-semibold hover:text-white underline underline-offset-2 transition-colors"
          >
            Daftar Sekarang
          </Link>
        </p>
      </div>

      {/* Bottom note */}
      <p className="text-center text-blue-300/40 text-xs mt-5">
        Dengan masuk, Anda menyetujui syarat dan ketentuan ALARA Training System.
      </p>
    </div>
  );
}
