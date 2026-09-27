'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import {
  User,
  Mail,
  Phone,
  CreditCard,
  Building2,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  LogOut,
  Save,
  Loader2,
  AlertCircle,
  GraduationCap,
  Lock,
  Eye,
  EyeOff,
  Info,
  KeyRound,
  ArrowRight,
  Camera,
  Award,
  Upload,
  X,
  ZoomIn,
  MapPin,
  Home,
  Briefcase,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [userData, setUserData] = useState<{
    id: number;
    email: string;
    fullName: string;
    phoneNumber: string | null;
    nik: string | null;
    tempat_lahir: string | null;
    tanggal_lahir: string | null;
    alamat_domisili: string | null;
    instansi: string | null;
    alamat_instansi: string | null;
    image: string | null;
    role: string;
    hasPassword: boolean;
    isProfileComplete: boolean;
    registrations: any[];
  } | null>(null);

  // Form states
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [nik, setNik] = useState('');
  const [tempatLahir, setTempatLahir] = useState('');
  const [tanggalLahir, setTanggalLahir] = useState('');
  const [alamatDomisili, setAlamatDomisili] = useState('');
  const [instansi, setInstansi] = useState('');
  const [alamatInstansi, setAlamatInstansi] = useState('');

  // Password states
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Photo upload states
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.type)) {
      toast.error('Format foto harus berupa file gambar JPG atau PNG');
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      toast.error('Ukuran file foto maksimal 4MB');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploadingPhoto(true);
      const res = await fetch('/api/user/avatar', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.error || 'Gagal mengunggah foto profil');
        return;
      }

      const cacheBusted = `${json.image}?t=${Date.now()}`;
      setUserData((prev) => (prev ? { ...prev, image: cacheBusted } : prev));
      if (update) {
        await update({ image: json.image });
      }

      toast.success('Foto profil resmi berhasil diperbarui!');
      router.refresh();
    } catch {
      toast.error('Terjadi kesalahan jaringan saat mengunggah foto');
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch('/api/auth/complete-profile');
        if (res.ok) {
          const json = await res.json();
          if (json.user) {
            setUserData(json.user);
            setFullName(json.user.fullName || '');
            setPhoneNumber(json.user.phoneNumber || '');
            setNik(json.user.nik || '');
            setTempatLahir(json.user.tempat_lahir || '');
            if (json.user.tanggal_lahir) {
              try {
                setTanggalLahir(format(new Date(json.user.tanggal_lahir), 'yyyy-MM-dd'));
              } catch {
                setTanggalLahir(json.user.tanggal_lahir.split('T')[0] || '');
              }
            } else {
              setTanggalLahir('');
            }
            setAlamatDomisili(json.user.alamat_domisili || '');
            setInstansi(
              json.user.instansi || json.user.registrations?.[0]?.instansi || ''
            );
            setAlamatInstansi(json.user.alamat_instansi || '');
          }
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  const isProfileIncomplete = !userData?.nik || !userData?.phoneNumber;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast.error('Nama lengkap tidak boleh kosong');
      return;
    }
    if (!nik.trim() || nik.trim().length !== 16) {
      toast.error('NIK KTP wajib diisi dan harus tepat 16 digit angka');
      return;
    }
    if (!phoneNumber.trim()) {
      toast.error('Nomor telepon / WhatsApp wajib diisi');
      return;
    }

    // Password validation if entered
    if (newPassword.trim()) {
      if (newPassword.trim().length < 6) {
        toast.error('Password baru minimal 6 karakter');
        return;
      }
      if (newPassword !== confirmPassword) {
        toast.error('Konfirmasi password tidak cocok');
        return;
      }
    }

    try {
      setSaving(true);
      const res = await fetch('/api/auth/complete-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          phoneNumber: phoneNumber.trim(),
          nik: nik.trim(),
          tempat_lahir: tempatLahir.trim() || null,
          tanggal_lahir: tanggalLahir || null,
          alamat_domisili: alamatDomisili.trim() || null,
          instansi: instansi.trim() || null,
          alamat_instansi: alamatInstansi.trim() || null,
          password: newPassword.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error || 'Gagal menyimpan perubahan');
        return;
      }

      // Update state
      setUserData((prev) =>
        prev
          ? {
              ...prev,
              fullName: fullName.trim(),
              phoneNumber: phoneNumber.trim(),
              nik: nik.trim(),
              tempat_lahir: tempatLahir.trim() || null,
              tanggal_lahir: tanggalLahir || null,
              alamat_domisili: alamatDomisili.trim() || null,
              instansi: instansi.trim() || null,
              alamat_instansi: alamatInstansi.trim() || null,
              hasPassword: !!(newPassword.trim() || prev.hasPassword),
              isProfileComplete: true,
            }
          : prev
      );

      // Update NextAuth session state so middleware knows profile is complete
      if (update) {
        await update({ isProfileComplete: true });
      }

      toast.success(
        isProfileIncomplete
          ? 'Data profil berhasil dilengkapi! Mengalihkan ke dashboard…'
          : 'Profil dan data pengguna berhasil diperbarui'
      );

      // Reset password input
      setNewPassword('');
      setConfirmPassword('');

      if (isProfileIncomplete) {
        setTimeout(() => {
          router.push('/dashboard');
          router.refresh();
        }, 1200);
      } else {
        router.refresh();
      }
    } catch {
      toast.error('Terjadi kesalahan jaringan saat menyimpan profil');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-slate-500">Memuat data profil pengguna…</p>
        </div>
      </div>
    );
  }

  const latestRegistration = userData?.registrations?.[0];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Attention banner if NIK or Phone is missing */}
      {isProfileIncomplete && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 sm:p-5 shadow-sm text-amber-900 flex items-start gap-3.5">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm">
            <p className="font-bold text-amber-900 text-sm">Lengkapi Data Profil Anda</p>
            <p className="text-amber-800/90 mt-1 leading-relaxed">
              Akun Anda telah terhubung melalui Google. Sesuai ketentuan sertifikasi BAPETEN, mohon lengkapi <strong>NIK KTP (16 digit)</strong> dan <strong>Nomor WhatsApp</strong> aktif Anda di bawah ini sebelum dapat melanjutkan ke dashboard dan materi pelatihan.
            </p>
          </div>
        </div>
      )}

      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">User Profile</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Kelola informasi profil akun Anda, data identitas, instansi, dan kredensial login.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={handleLogout}
          className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 gap-2 w-fit cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          Logout Akun
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Account Overview Card */}
        <div className="space-y-6">
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <div className="h-20 bg-gradient-to-r from-blue-600 to-indigo-600 relative" />
            <CardContent className="pt-0 text-center pb-6">
              {/* Avatar with upload action & popup preview */}
              <div className="-mt-12 mb-3 flex flex-col items-center">
                <div className="relative group">
                  {/* Clickable Avatar to view in popup */}
                  <div
                    onClick={() => setShowPhotoModal(true)}
                    className="relative cursor-pointer rounded-full overflow-hidden transition-all duration-200 group-hover:ring-4 group-hover:ring-blue-400/40"
                    title="Klik untuk melihat foto profil dalam ukuran penuh"
                  >
                    {userData?.image ? (
                      <img
                        src={userData.image}
                        alt={userData.fullName}
                        className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover bg-white group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-blue-600 text-white text-3xl font-bold flex items-center justify-center">
                        {userData?.fullName?.[0] || 'U'}
                      </div>
                    )}
                    {/* Hover zoom indicator overlay */}
                    <div className="absolute inset-0 bg-black/35 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <ZoomIn className="w-6 h-6 text-white drop-shadow" />
                      <span className="text-[9px] text-white font-medium mt-0.5">Lihat</span>
                    </div>
                  </div>

                  {/* Camera overlay button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    disabled={uploadingPhoto}
                    className="absolute bottom-0 right-0 p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white border-2 border-white shadow-md transition-all cursor-pointer hover:scale-110 z-10"
                    title="Ganti Foto Resmi"
                    aria-label="Ganti Foto Resmi"
                  >
                    {uploadingPhoto ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />

                <div className="flex items-center gap-2 mt-2.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPhotoModal(true)}
                    className="text-xs text-slate-700 border-slate-200 hover:text-slate-900 hover:bg-slate-50 font-medium h-7 gap-1.5 cursor-pointer rounded-lg px-2.5"
                  >
                    <ZoomIn className="w-3.5 h-3.5 text-slate-500" />
                    Lihat Foto
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingPhoto}
                    className="text-xs text-blue-600 border-blue-200 hover:text-blue-700 hover:bg-blue-50 font-medium h-7 gap-1.5 cursor-pointer rounded-lg px-2.5"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    {uploadingPhoto ? 'Mengunggah…' : 'Ganti Foto'}
                  </Button>
                </div>
              </div>

              {/* Official Photo Notice */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3 text-left">
                <p className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-600 shrink-0" />
                  Foto Profile akan digunakan sebagai foto di sertifikat
                </p>
                <p className="text-[11px] text-amber-800/80 mt-1 leading-relaxed">
                  Gunakan pas foto resmi (pakaian berkerah/jas, latar belakang polos, wajah tampak jelas). Maksimal 4 MB (JPG/PNG).
                </p>
              </div>

              <h2 className="text-base font-bold text-slate-900 leading-tight">
                {userData?.fullName || 'Peserta ALARA'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">{userData?.email}</p>

              <div className="mt-3 flex items-center justify-center gap-2">
                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 font-semibold text-[11px]">
                  {userData?.role || 'PESERTA'}
                </Badge>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Google Verified
                </span>
              </div>

              <Separator className="my-4" />

              <div className="space-y-2.5 text-left text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">ID Peserta</span>
                  <span className="font-mono font-medium text-slate-800">
                    USR-{String(userData?.id || 0).padStart(4, '0')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Metode Login</span>
                  <span className="font-medium text-slate-800">
                    Google OAuth &bull; Sandi
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Status Profil</span>
                  <span
                    className={
                      isProfileIncomplete
                        ? 'font-semibold text-amber-600'
                        : 'font-semibold text-emerald-600'
                    }
                  >
                    {isProfileIncomplete ? 'Belum Lengkap' : 'Lengkap & Aktif'}
                  </span>
                </div>

                {/* Additional Overview Attributes */}
                {(userData?.tempat_lahir || userData?.tanggal_lahir) && (
                  <div className="flex items-start justify-between gap-2 pt-1 border-t border-slate-100">
                    <span className="text-slate-400 shrink-0">Tempat, Tgl Lahir</span>
                    <span className="font-medium text-slate-800 text-right">
                      {userData?.tempat_lahir || '-'}
                      {userData?.tanggal_lahir
                        ? `, ${format(new Date(userData.tanggal_lahir), 'd MMM yyyy', { locale: localeId })}`
                        : ''}
                    </span>
                  </div>
                )}

                {userData?.instansi && (
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-slate-400 shrink-0">Instansi</span>
                    <span className="font-medium text-slate-800 text-right truncate max-w-[150px]" title={userData.instansi}>
                      {userData.instansi}
                    </span>
                  </div>
                )}

                {userData?.alamat_domisili && (
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-slate-400 shrink-0">Domisili</span>
                    <span className="font-medium text-slate-800 text-right truncate max-w-[150px]" title={userData.alamat_domisili}>
                      {userData.alamat_domisili}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Active Training Status */}
          {latestRegistration && (
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-blue-600" />
                  Pelatihan Terdaftar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0 text-xs">
                <div>
                  <p className="font-semibold text-slate-900 leading-tight">
                    {latestRegistration.batch?.training?.title || 'Program ALARA'}
                  </p>
                  <p className="text-slate-500 mt-0.5">
                    Batch {latestRegistration.batch?.batchNumber} &bull;{' '}
                    {latestRegistration.batch?.location || 'CV. Hikmat Proteksi ALARA'}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-slate-500">Status Pendaftaran</span>
                  <Badge variant="secondary" className="font-semibold">
                    {latestRegistration.registrationStatus}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Status Pembayaran</span>
                  <Badge
                    variant="outline"
                    className={
                      latestRegistration.paymentStatus === 'PAID'
                        ? 'border-emerald-300 text-emerald-700 bg-emerald-50'
                        : 'border-amber-300 text-amber-700 bg-amber-50'
                    }
                  >
                    {latestRegistration.paymentStatus}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Edit Profile & Password Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Card 1: Data Identitas Pribadi */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-4 border-b border-slate-100">
                <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-600" />
                  Informasi Data Pribadi
                </CardTitle>
                <CardDescription className="text-xs font-bold text-slate-700">
                  Lengkapi data pribadi ini dengan benar, karena akan digunakan untuk SERTIFIKAT
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-6 space-y-4">
                {/* Email (Readonly) */}
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-semibold text-slate-700">
                    Alamat Email (Akun Google Terverifikasi)
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="email"
                      value={userData?.email || ''}
                      disabled
                      className="pl-9 bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed text-sm"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Email ditautkan dengan autentikasi Google dan tidak dapat diubah secara manual.
                  </p>
                </div>

                {/* Full Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs font-semibold text-slate-700">
                    Nama Lengkap (Sesuai KTP / Ijazah) <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nama lengkap beserta gelar jika ada"
                      required
                      className="pl-9 text-sm"
                    />
                  </div>
                </div>

                {/* NIK & Phone Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="nik" className="text-xs font-semibold text-slate-700">
                      NIK KTP (16 Digit) <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="nik"
                        maxLength={16}
                        value={nik}
                        onChange={(e) => setNik(e.target.value)}
                        placeholder="3201xxxxxxxxxxxx"
                        required
                        className="pl-9 font-mono tracking-wider text-sm"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Wajib 16 digit angka sesuai KTP Anda.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-xs font-semibold text-slate-700">
                      Nomor WhatsApp / HP <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="phone"
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="08123456789"
                        required
                        className="pl-9 text-sm"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Digunakan untuk grup koordinasi pelatihan & materi.
                    </p>
                  </div>
                </div>

                {/* Tempat Lahir & Tanggal Lahir Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="tempatLahir" className="text-xs font-semibold text-slate-700">
                      Tempat Lahir
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="tempatLahir"
                        value={tempatLahir}
                        onChange={(e) => setTempatLahir(e.target.value)}
                        placeholder="Contoh: Jakarta"
                        className="pl-9 text-sm"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Kota atau kabupaten tempat kelahiran sesuai KTP.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="tanggalLahir" className="text-xs font-semibold text-slate-700">
                      Tanggal Lahir
                    </Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                      <Input
                        id="tanggalLahir"
                        type="date"
                        value={tanggalLahir}
                        onChange={(e) => setTanggalLahir(e.target.value)}
                        max={format(new Date(), 'yyyy-MM-dd')}
                        className="pl-9 text-sm"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Tanggal lahir resmi sesuai dokumen identitas.
                    </p>
                  </div>
                </div>

                {/* Alamat Domisili */}
                <div className="space-y-1.5">
                  <Label htmlFor="alamatDomisili" className="text-xs font-semibold text-slate-700">
                    Alamat Domisili (Tempat Tinggal Saat Ini)
                  </Label>
                  <div className="relative">
                    <Textarea
                      id="alamatDomisili"
                      value={alamatDomisili}
                      onChange={(e) => setAlamatDomisili(e.target.value)}
                      placeholder="Contoh: Jl. Merdeka No. 10, RT 01/RW 02, Kel. Menteng, Kec. Menteng, Jakarta Pusat"
                      rows={2}
                      className="text-sm resize-none"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Alamat surat-menyurat dan pengiriman sertifikat fisik (jika ada).
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Card 2: Informasi Instansi & Pekerjaan */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-4 border-b border-slate-100">
                <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-blue-600" />
                  Informasi Instansi & Pekerjaan
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Data instansi, rumah sakit, laboratorium, atau perusahaan pengirim peserta.
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-6 space-y-4">
                {/* Nama Instansi */}
                <div className="space-y-1.5">
                  <Label htmlFor="instansi" className="text-xs font-semibold text-slate-700">
                    Nama Instansi / Rumah Sakit / Perusahaan
                  </Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="instansi"
                      value={instansi}
                      onChange={(e) => setInstansi(e.target.value)}
                      placeholder="Contoh: RSUD Tangerang, PT Radiasi Bersama, dsb."
                      className="pl-9 text-sm"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Nama perusahaan atau lembaga tempat Anda bertugas saat ini.
                  </p>
                </div>

                {/* Alamat Instansi */}
                <div className="space-y-1.5">
                  <Label htmlFor="alamatInstansi" className="text-xs font-semibold text-slate-700">
                    Alamat Instansi / Kantor
                  </Label>
                  <div className="relative">
                    <Textarea
                      id="alamatInstansi"
                      value={alamatInstansi}
                      onChange={(e) => setAlamatInstansi(e.target.value)}
                      placeholder="Contoh: Gedung Menara Hijau Lt. 5, Jl. MT Haryono Kav. 33, Jakarta Selatan"
                      rows={2}
                      className="text-sm resize-none"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Alamat lengkap lokasi kantor / instansi tempat Anda bekerja.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Card 3: Keamanan & Password Login Langsung */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-4 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <KeyRound className="h-4 w-4 text-blue-600" />
                    Keamanan & Password Akun
                  </CardTitle>
                  <Badge
                    variant="outline"
                    className={
                      userData?.hasPassword
                        ? 'border-emerald-300 text-emerald-700 bg-emerald-50 text-[10px]'
                        : 'border-amber-300 text-amber-700 bg-amber-50 text-[10px]'
                    }
                  >
                    {userData?.hasPassword ? 'Password Tersedia' : 'Belum Ada Password'}
                  </Badge>
                </div>
                <CardDescription className="text-xs text-slate-500">
                  Buat atau perbarui password untuk login menggunakan email dan password secara langsung.
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-6 space-y-4">
                {/* Specific Informative Notice as requested */}
                <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-900 flex items-start gap-3">
                  <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold text-blue-950">Informasi Login Langsung Aplikasi:</p>
                    <p className="text-blue-800 leading-relaxed">
                      Silakan buat password untuk login langsung ke aplikasi dengan user yang sama ({userData?.email || 'email user'}). Disarankan agar password ini berbeda dengan password email google anda.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  {/* Password Baru */}
                  <div className="space-y-1.5">
                    <Label htmlFor="newPassword" className="text-xs font-semibold text-slate-700">
                      {userData?.hasPassword ? 'Ganti Password Baru' : 'Buat Password Baru'}
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="newPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Minimal 6 karakter"
                        className="pl-9 pr-9 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        aria-label="Toggle password"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Konfirmasi Password */}
                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword" className="text-xs font-semibold text-slate-700">
                      Konfirmasi Password Baru
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Ulangi password baru"
                        className="pl-9 pr-9 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        aria-label="Toggle confirm password"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400">
                  Kosongkan kolom password di atas jika Anda tidak ingin mengubah atau hanya ingin login menggunakan Akun Google.
                </p>
              </CardContent>
            </Card>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="submit"
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-md gap-2 cursor-pointer text-sm"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Menyimpan Data…
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {isProfileIncomplete ? 'Simpan & Lanjutkan ke Dashboard' : 'Simpan Perubahan Profil'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Lightbox / Popup Window for Official Photo */}
      {showPhotoModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowPhotoModal(false)}
        >
          <div
            className="relative bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Foto Resmi Profil</h3>
                  <p className="text-[11px] text-slate-500">Pratinjau foto untuk sertifikat</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPhotoModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                aria-label="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 flex flex-col items-center bg-slate-50/50">
              <div className="relative rounded-2xl overflow-hidden shadow-lg border-4 border-white max-h-[380px] flex items-center justify-center bg-slate-100">
                {userData?.image ? (
                  <img
                    src={userData.image}
                    alt={userData.fullName}
                    className="max-h-[360px] w-auto object-contain rounded-xl"
                  />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center bg-blue-600 text-white text-5xl font-bold">
                    {userData?.fullName?.[0] || 'U'}
                  </div>
                )}
              </div>

              {/* Informative Certificate Notice in Modal */}
              <div className="mt-4 w-full bg-amber-50 border border-amber-200/90 rounded-xl p-3 text-left">
                <p className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-600 shrink-0" />
                  Foto Profile akan digunakan sebagai foto di sertifikat
                </p>
                <p className="text-[11px] text-amber-800/85 mt-1 leading-relaxed">
                  Pastikan foto berlatar belakang polos, pakaian resmi / berkerah, dan wajah terlihat jelas sesuai standar resmi BAPETEN.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 bg-white">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowPhotoModal(false);
                  fileInputRef.current?.click();
                }}
                className="text-xs border-blue-200 text-blue-600 hover:bg-blue-50 gap-1.5 cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                Ganti Foto Lain
              </Button>

              <Button
                type="button"
                size="sm"
                onClick={() => setShowPhotoModal(false)}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs px-4 cursor-pointer rounded-lg"
              >
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
