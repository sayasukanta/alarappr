'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ShieldCheck,
  CheckCircle2,
  User,
  Phone,
  CreditCard,
  Building2,
  BookOpen,
  CalendarDays,
  Loader2,
  AlertCircle,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

// ---------------------------------------------------------------------------
// Form Validation Schema
// ---------------------------------------------------------------------------
const ProfileSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Nama lengkap minimal 2 karakter')
    .max(100, 'Nama lengkap maksimal 100 karakter'),
  phoneNumber: z
    .string()
    .min(9, 'Nomor telepon minimal 9 digit')
    .max(20, 'Nomor telepon maksimal 20 digit')
    .regex(/^[0-9+\-\s()]+$/, 'Format nomor telepon tidak valid'),
  nik: z
    .string()
    .length(16, 'NIK KTP harus tepat 16 digit angka')
    .regex(/^[0-9]+$/, 'NIK hanya boleh berisi angka'),
  instansi: z.string().optional(),
  programCategory: z.string().min(1, 'Pilih program pelatihan'),
  batchId: z.string().min(1, 'Pilih jadwal batch pelatihan'),
});

type ProfileFormValues = z.infer<typeof ProfileSchema>;

interface BatchItem {
  id: number;
  batchNumber: number;
  startDate: string;
  endDate: string;
  quota: number;
  location: string | null;
  registeredCount: number;
  availableSlots: number;
  isFull: boolean;
  training: {
    id: number;
    title: string;
    category: string;
    price: string | number;
    durationDays: number;
  };
}

const PROGRAM_OPTIONS = [
  {
    category: 'PPR_ANALISIS',
    title: 'PPR Bidang Analisis / Teropong Radiasi',
    duration: '5 Hari (40 JPL)',
    price: 'Rp 7.000.000',
  },
  {
    category: 'PPR_BAGASI',
    title: 'PPR Bidang Pemindai Bagasi (X-Ray)',
    duration: '3 Hari (24 JPL)',
    price: 'Rp 4.000.000',
  },
  {
    category: 'PKR_PEKERJA',
    title: 'Pelatihan Keselamatan Radiasi (PKR) Pekerja',
    duration: '3 Hari (16 JPL)',
    price: 'Rp 3.500.000',
  },
];

export default function CompleteProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [batches, setBatches] = useState<BatchItem[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      fullName: '',
      phoneNumber: '',
      nik: '',
      instansi: '',
      programCategory: 'PPR_ANALISIS',
      batchId: '',
    },
  });

  const selectedCategory = form.watch('programCategory');

  // Populate default name from session when available
  useEffect(() => {
    if (session?.user?.name && !form.getValues('fullName')) {
      form.setValue('fullName', session.user.name);
    }
  }, [session, form]);

  // Fetch batches
  useEffect(() => {
    async function loadBatches() {
      try {
        const res = await fetch('/api/batches');
        if (res.ok) {
          const data = await res.json();
          setBatches(data);

          // Select first matching batch if available
          const firstMatch = data.find(
            (b: BatchItem) => b.training.category === selectedCategory && !b.isFull
          );
          if (firstMatch) {
            form.setValue('batchId', String(firstMatch.id));
          }
        }
      } catch (err) {
        console.error('Failed to load batches:', err);
      } finally {
        setLoadingBatches(false);
      }
    }
    loadBatches();
  }, [form, selectedCategory]);

  // When program category changes, auto-select corresponding batch
  const handleCategoryChange = (val: string | null) => {
    if (!val) return;
    form.setValue('programCategory', val);
    const match = batches.find(
      (b) => b.training.category === val && !b.isFull
    );
    form.setValue('batchId', match ? String(match.id) : '');
  };

  const filteredBatches = batches.filter(
    (b) => b.training.category === selectedCategory
  );

  async function onSubmit(values: ProfileFormValues) {
    setServerError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/complete-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: values.fullName,
          phoneNumber: values.phoneNumber,
          nik: values.nik,
          instansi: values.instansi || null,
          batchId: parseInt(values.batchId, 10),
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setServerError(json.error || 'Gagal menyimpan profil. Silakan coba lagi.');
        toast.error(json.error || 'Gagal menyimpan data profil.');
        return;
      }

      setIsSuccess(true);
      toast.success('Pendaftaran dan profil berhasil dilengkapi!');
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 1500);
    } catch {
      setServerError('Terjadi gangguan jaringan. Silakan coba kembali.');
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handle unauthenticated state
  if (status === 'unauthenticated') {
    return (
      <div className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-center text-white">
        <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold">Sesi Belum Terverifikasi</h2>
        <p className="text-sm text-blue-200/80 mt-1 mb-5">
          Silakan lakukan verifikasi menggunakan Akun Google terlebih dahulu.
        </p>
        <Button
          onClick={() => router.push('/register')}
          className="w-full bg-blue-500 hover:bg-blue-400 text-white font-semibold"
        >
          Kembali ke Halaman Registrasi
        </Button>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-10 text-center text-white shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Profil & Pendaftaran Berhasil!</h2>
        <p className="text-blue-200/80 text-sm mb-6">
          Selamat datang di ALARA Training System. Menyiapkan dashboard peserta Anda…
        </p>
        <div className="flex justify-center">
          <Loader2 className="w-6 h-6 text-blue-300 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 sm:p-9 text-white shadow-2xl">
        {/* Step Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              <CheckCircle2 className="w-3 h-3" /> Akun Google Terverifikasi
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-200 border border-blue-400/30">
              Langkah 2: Kelengkapan Profil
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Lengkapi Profil Peserta Pelatihan
          </h1>
          <p className="text-blue-200/80 text-xs sm:text-sm mt-1">
            Data ini diperlukan untuk registrasi resmi, penerbitan sertifikat BAPETEN, dan logbook pelatihan.
          </p>
        </div>

        {/* Verified Google Account Summary Card */}
        <div className="bg-white/5 border border-white/15 rounded-2xl p-4 mb-6 flex items-center gap-3.5">
          {(session?.user as any)?.image ? (
            <img
              src={(session?.user as any).image}
              alt="Google Avatar"
              className="w-11 h-11 rounded-full border border-white/30 shrink-0"
            />
          ) : (
            <div className="w-11 h-11 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 border border-blue-400/30">
              {session?.user?.name?.[0] || 'U'}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-white truncate">
                {session?.user?.name || 'Peserta Terverifikasi'}
              </p>
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-400/30 shrink-0">
                Verified Google
              </span>
            </div>
            <p className="text-xs text-blue-200/70 truncate">
              {session?.user?.email || 'email@google.com'}
            </p>
          </div>
        </div>

        {serverError && (
          <div className="flex items-start gap-3 p-4 mb-5 bg-red-500/15 border border-red-400/30 rounded-xl text-red-200 text-xs sm:text-sm">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-100 text-xs sm:text-sm font-medium">
                    Nama Lengkap (Sesuai KTP) <span className="text-red-400">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300/50" />
                      <Input
                        {...field}
                        placeholder="Contoh: Sukanta, S.T."
                        className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-blue-200/40 focus:border-blue-400 h-11 text-sm"
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-300 text-xs" />
                </FormItem>
              )}
            />

            {/* Phone & NIK Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* WhatsApp Phone */}
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-blue-100 text-xs sm:text-sm font-medium">
                      Nomor WhatsApp <span className="text-red-400">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300/50" />
                        <Input
                          {...field}
                          type="tel"
                          placeholder="08123456789"
                          className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-blue-200/40 focus:border-blue-400 h-11 text-sm"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-300 text-xs" />
                  </FormItem>
                )}
              />

              {/* NIK KTP */}
              <FormField
                control={form.control}
                name="nik"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-blue-100 text-xs sm:text-sm font-medium">
                      NIK KTP (16 Digit) <span className="text-red-400">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300/50" />
                        <Input
                          {...field}
                          maxLength={16}
                          placeholder="3201xxxxxxxxxxxx"
                          className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-blue-200/40 focus:border-blue-400 h-11 text-sm tracking-wider"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-300 text-xs" />
                  </FormItem>
                )}
              />
            </div>

            {/* Instansi / Perusahaan */}
            <FormField
              control={form.control}
              name="instansi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-100 text-xs sm:text-sm font-medium">
                    Instansi / Rumah Sakit / Perusahaan (Opsional)
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300/50" />
                      <Input
                        {...field}
                        placeholder="Contoh: RSUD Tangerang / Mandiri"
                        className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-blue-200/40 focus:border-blue-400 h-11 text-sm"
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-300 text-xs" />
                </FormItem>
              )}
            />

            {/* Program Pelatihan */}
            <FormField
              control={form.control}
              name="programCategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-100 text-xs sm:text-sm font-medium">
                    Program Pelatihan Pilihan <span className="text-red-400">*</span>
                  </FormLabel>
                  <Select onValueChange={handleCategoryChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white h-11 focus:ring-blue-400/30 text-sm">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-blue-300/60" />
                          <SelectValue placeholder="Pilih program..." />
                        </div>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PROGRAM_OPTIONS.map((p) => (
                        <SelectItem key={p.category} value={p.category}>
                          <div className="flex flex-col py-0.5">
                            <span className="font-semibold text-slate-800">{p.title}</span>
                            <span className="text-xs text-slate-500">
                              {p.price} &bull; {p.duration}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-300 text-xs" />
                </FormItem>
              )}
            />

            {/* Batch Pelatihan */}
            <FormField
              control={form.control}
              name="batchId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-100 text-xs sm:text-sm font-medium">
                    Jadwal Batch Pelatihan <span className="text-red-400">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white h-11 focus:ring-blue-400/30 text-sm">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="w-4 h-4 text-blue-300/60" />
                          <SelectValue
                            placeholder={
                              loadingBatches ? 'Memuat jadwal batch…' : 'Pilih jadwal batch…'
                            }
                          />
                        </div>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredBatches.length === 0 ? (
                        <div className="p-3 text-xs text-center text-slate-500">
                          Belum ada batch jadwal untuk program ini.
                        </div>
                      ) : (
                        filteredBatches.map((b) => {
                          const start = new Date(b.startDate).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          });
                          const end = new Date(b.endDate).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          });
                          return (
                            <SelectItem
                              key={b.id}
                              value={String(b.id)}
                              disabled={b.isFull}
                            >
                              <div className="flex flex-col py-0.5">
                                <span className="font-semibold text-slate-800">
                                  Batch {b.batchNumber} ({start} - {end})
                                </span>
                                <span className="text-xs text-slate-500">
                                  {b.location || 'CV. Hikmat Proteksi ALARA'} &bull;{' '}
                                  {b.isFull ? (
                                    <span className="text-red-600 font-semibold">Penuh</span>
                                  ) : (
                                    <span className="text-emerald-600 font-semibold">
                                      {b.availableSlots} kursi tersedia
                                    </span>
                                  )}
                                </span>
                              </div>
                            </SelectItem>
                          );
                        })
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-300 text-xs" />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-xl shadow-lg transition-all mt-4 text-base cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Menyimpan Profil & Pendaftaran…
                </>
              ) : (
                <>
                  Simpan & Masuk ke Dashboard
                  <ArrowRight className="w-5 h-5 ml-1.5" />
                </>
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
