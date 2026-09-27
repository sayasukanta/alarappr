export const dynamic = 'force-dynamic';
export const revalidate = 0;

import Link from 'next/link';
import {
  ShieldCheck,
  Award,
  Users,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  Star,
  Clock,
  GraduationCap,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  Zap,
  BarChart3,
  ExternalLink,
} from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { DEFAULT_FOOTER_SETTINGS } from '@/lib/footer-constants';
import { HeroSlideCarousel } from '@/components/HeroSlideCarousel';

// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatRupiah(amount: number | string | any) {
  const num = Number(amount);
  if (!num || num <= 0) return 'Hubungi Admin';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(num);
}

function getProgramIcon(category?: string | null) {
  switch (category) {
    case 'PPR_ANALISIS':
      return BarChart3;
    case 'PPR_BAGASI':
      return ShieldCheck;
    case 'PKR_PEKERJA':
      return GraduationCap;
    default:
      return Award;
  }
}

function getProgramFeatures(category?: string | null) {
  switch (category) {
    case 'PPR_ANALISIS':
      return [
        'Materi sesuai standar BAPETEN',
        'Ujian sertifikasi & lisensi',
        'Modul digital & bank soal CBT',
        'Sertifikat resmi terakreditasi',
      ];
    case 'PPR_BAGASI':
      return [
        'Praktek & simulasi pemindai bagasi',
        'Ujian sertifikasi BAPETEN',
        'Modul digital & materi lengkap',
        'Sertifikat resmi pelatihan',
      ];
    case 'PKR_PEKERJA':
      return [
        'Kurikulum keselamatan kerja radiasi',
        'Bimbingan intensif instruktur',
        'Modul digital & studi kasus',
        'Sertifikat resmi kompetensi',
      ];
    case 'PPR_PENYEGARAN':
      return [
        'Penyegaran lisensi SIB BAPETEN',
        'Update regulasi & standar terbaru',
        'Evaluasi & studi kasus proteksi radiasi',
        'Sertifikat penyegaran resmi',
      ];
    default:
      return [
        'Materi standar kompetensi',
        'Ujian & evaluasi pemahaman',
        'Modul pembelajaran digital',
        'Sertifikat resmi pelatihan',
      ];
  }
}

function getBadgeStyle(badge: string, isHighlighted: boolean) {
  if (isHighlighted) {
    return 'bg-white/20 text-white border border-white/30 backdrop-blur-xs';
  }
  const upper = (badge || '').toUpperCase();
  if (upper.includes('BAPETEN')) {
    return 'bg-blue-100 text-blue-800 border border-blue-200';
  }
  if (upper.includes('INTERNAL')) {
    return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
  }
  return 'bg-purple-100 text-purple-800 border border-purple-200';
}

const whyAlara = [
  {
    icon: Award,
    title: 'Terakreditasi BAPETEN',
    desc: 'Lembaga resmi berlisensi BAPETEN dengan KTUN No. 07998.722.1.040726 untuk penyelenggaraan pelatihan proteksi radiasi.',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: Users,
    title: 'Instruktur Berpengalaman',
    desc: 'Tim instruktur bersertifikat dengan pengalaman bertahun-tahun di bidang proteksi radiasi dan keselamatan nuklir.',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
  },
  {
    icon: Zap,
    title: 'LMS Digital Terintegrasi',
    desc: 'Platform pembelajaran digital yang memudahkan peserta mengakses materi, mengikuti ujian, dan memantau perkembangan belajar.',
    color: 'text-violet-600',
    bg: 'bg-violet-50',
  },
  {
    icon: BarChart3,
    title: 'Tingkat Kelulusan Tinggi',
    desc: 'Dengan metode pembelajaran terstruktur dan bimbingan intensif, tingkat kelulusan peserta kami mencapai 89% ke atas.',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default async function HomePage() {
  let footer = DEFAULT_FOOTER_SETTINGS;
  let slides: any[] = [];
  let dbTrainings: any[] = [];

  try {
    const [dbSetting, dbSlides, rawTrainings] = await Promise.all([
      prisma.footerSetting.findFirst(),
      prisma.slide.findMany({
        where: { isTampil: 1 },
        orderBy: [{ orderIndex: "asc" }, { createdAt: "desc" }],
      }),
      prisma.training.findMany({
        orderBy: { id: "asc" },
      }),
    ]);

    if (dbSetting) {
      footer = {
        ...DEFAULT_FOOTER_SETTINGS,
        ...dbSetting,
      };
    }
    if (dbSlides) {
      slides = dbSlides;
    }
    if (rawTrainings && rawTrainings.length > 0) {
      dbTrainings = rawTrainings;
    }
  } catch (err) {
    console.warn("Could not fetch settings, slides or trainings, using defaults", err);
  }

  const trainingItems = dbTrainings.length > 0
    ? dbTrainings.map((t, idx) => ({
        id: t.id,
        category: t.category,
        title: t.title,
        badge: t.certBadge || (t.category === 'PKR_PEKERJA' ? 'Internal' : 'BAPETEN'),
        price: formatRupiah(t.price),
        duration: t.durationDays ? `${t.durationDays} Hari` : '3 Hari',
        description: t.description || 'Program pelatihan proteksi dan keselamatan radiasi resmi terstandar.',
        icon: getProgramIcon(t.category),
        features: getProgramFeatures(t.category),
        highlight: idx === 0,
      }))
    : [
        {
          id: 1,
          category: 'PPR_ANALISIS',
          title: 'Pelatihan Calon PPR Analisis Menggunakan Sumber Radiasi Pengion',
          badge: 'BAPETEN',
          price: 'Rp 7.000.000',
          duration: '3 Hari',
          description:
            'Pelatihan Petugas Proteksi Radiasi untuk bidang medis/industri dengan penggunaan sumber radiasi analisis.',
          icon: BarChart3,
          features: [
            'Materi sesuai standar BAPETEN',
            'Ujian sertifikasi lisensi',
            'Modul digital & bank soal CBT',
            'Sertifikat resmi terakreditasi',
          ],
          highlight: true,
        },
        {
          id: 2,
          category: 'PPR_BAGASI',
          title: 'Pelatihan Calon PPR Pemindai Bagasi atau Barang Lainnya Menggunakan Sumber Radiasi Pengion',
          badge: 'BAPETEN',
          price: 'Rp 4.000.000',
          duration: '3 Hari',
          description:
            'Pelatihan PPR untuk operator peralatan X-ray bagasi di bandara, pelabuhan, dan area keamanan.',
          icon: ShieldCheck,
          features: [
            'Praktek & simulasi pemindai bagasi',
            'Ujian sertifikasi BAPETEN',
            'Modul digital & materi lengkap',
            'Sertifikat resmi pelatihan',
          ],
          highlight: false,
        },
        {
          id: 3,
          category: 'PKR_PEKERJA',
          title: 'Pelatihan Proteksi dan Keselamatan Radiasi (PKR) Pekerja Radiasi',
          badge: 'Internal',
          price: 'Rp 3.500.000',
          duration: '3 Hari',
          description:
            'Pelatihan Keselamatan Radiasi bagi Pekerja Radiasi sesuai regulasi BAPETEN yang berlaku.',
          icon: GraduationCap,
          features: [
            'Kurikulum keselamatan kerja radiasi',
            'Bimbingan intensif instruktur',
            'Modul digital & studi kasus',
            'Sertifikat resmi kompetensi',
          ],
          highlight: false,
        },
      ];

  const stats = [
    { value: `${trainingItems.length}`, label: 'Program Pelatihan', icon: BookOpen },
    { value: '89%+', label: 'Tingkat Kelulusan', icon: Award },
    { value: '100%', label: 'Instruktur Berlisensi BAPETEN', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* ===================== NAVBAR ===================== */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <img
              src="/logo.png"
              alt="ALARA Logo"
              className="w-10 h-10 object-contain rounded-lg shrink-0"
            />
            <div className="flex flex-col leading-none">
              <span className="font-extrabold text-blue-700 text-lg tracking-tight">ALARA</span>
              <span className="text-slate-500 text-[9px] uppercase tracking-widest font-medium">
                Training System
              </span>
            </div>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link href="#hero" className="hover:text-blue-600 transition-colors">Beranda</Link>
            <Link href="#program" className="hover:text-blue-600 transition-colors">Program</Link>
            <Link href="#mengapa" className="hover:text-blue-600 transition-colors">Tentang</Link>
            <Link href="#kontak" className="hover:text-blue-600 transition-colors">Kontak</Link>
          </nav>

          {/* Auth buttons */}
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
            >
              Daftar
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ===================== HERO ===================== */}
        <section
          id="hero"
          className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-indigo-900 to-blue-800 text-white"
        >
          {/* Decorative blobs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
            <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-3xl" />
            <div className="absolute -bottom-40 -left-20 w-[500px] h-[500px] rounded-full bg-indigo-500/15 blur-3xl" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-28">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              {/* Kolom Kiri: Teks & Aksi */}
              <div className="lg:col-span-7 xl:col-span-7">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-400/20 border border-blue-300/30 text-blue-200 text-sm font-medium mb-6 backdrop-blur-sm">
                  <ShieldCheck className="w-4 h-4 text-cyan-300" />
                  <span>Terakreditasi Resmi BAPETEN</span>
                </div>

                {/* Headline */}
                <h1 className="text-3xl sm:text-5xl xl:text-6xl font-extrabold leading-[1.15] tracking-tight mb-6">
                  Wujudkan Karir{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-cyan-200 to-blue-100">
                    PPR Profesional
                  </span>{' '}
                  Bersama ALARA
                </h1>

                <p className="text-base sm:text-lg lg:text-xl text-blue-100/85 leading-relaxed mb-8 max-w-2xl">
                  Program pelatihan proteksi radiasi terstandar BAPETEN dengan instruktur bersertifikat,
                  kurikulum terkini, dan platform LMS digital untuk mempersiapkan Anda menjadi Petugas
                  Proteksi Radiasi (PPR) yang kompeten dan siap berkarir.
                </p>

                {/* CTAs */}
                <div className="flex flex-wrap items-center gap-4 mb-8">
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-all shadow-lg shadow-black/20 text-base"
                  >
                    Daftar Sekarang
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="#program"
                    className="inline-flex items-center gap-2 px-6 py-3.5 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 border border-white/20 transition-all text-base backdrop-blur-sm"
                  >
                    Lihat Program
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>

                {/* Trust Highlights */}
                <div className="pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-blue-200/80">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Lisensi Resmi BAPETEN</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Instruktur Senior</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Modul &amp; Tryout CBT</span>
                  </div>
                </div>
              </div>

              {/* Kolom Kanan: Slide Flyer Interaktif */}
              <div className="lg:col-span-5 xl:col-span-5 w-full flex justify-center">
                <HeroSlideCarousel initialSlides={slides} />
              </div>
            </div>
          </div>

          {/* Wave divider */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 60L1440 60L1440 0C1200 50 960 70 720 40C480 10 240 50 0 0L0 60Z" fill="white" />
            </svg>
          </div>
        </section>

        {/* ===================== STATS ===================== */}
        <section className="py-14 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {stats.map(({ value, label, icon: Icon }) => (
                <div
                  key={label}
                  className="flex flex-col items-center text-center p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 shadow-md shadow-blue-200 mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-4xl font-extrabold text-blue-700 mb-1">{value}</span>
                  <span className="text-slate-600 text-sm font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===================== PROGRAMS ===================== */}
        <section id="program" className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section header */}
            <div className="text-center mb-14">
              <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold uppercase tracking-widest mb-4">
                Program Pelatihan
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
                Pilih Program Sesuai Kebutuhan Anda
              </h2>
              <p className="text-slate-500 max-w-xl mx-auto">
                Semua program telah terstandar dan diakui oleh BAPETEN sebagai lembaga resmi
                pengawas tenaga nuklir di Indonesia.
              </p>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
              {trainingItems.map(({ id, title, badge, description, price, duration, icon: Icon, features, highlight }) => (
                <div
                  key={id}
                  className={`relative flex flex-col rounded-2xl border p-7 transition-all hover:shadow-xl ${
                    highlight
                      ? 'bg-gradient-to-br from-blue-700 to-indigo-700 border-blue-600 text-white shadow-lg shadow-blue-200'
                      : 'bg-white border-slate-200 text-slate-800'
                  }`}
                >
                  {/* Badge */}
                  <span
                    className={`absolute top-4 right-4 px-2.5 py-0.5 rounded-full text-xs font-semibold ${getBadgeStyle(
                      badge,
                      highlight
                    )}`}
                  >
                    {badge}
                  </span>

                  {/* Icon */}
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-xl mb-5 ${
                      highlight ? 'bg-white/20' : 'bg-blue-100'
                    }`}
                  >
                    <Icon className={`w-6 h-6 ${highlight ? 'text-white' : 'text-blue-600'}`} />
                  </div>

                  {/* Content */}
                  <h3 className={`text-lg font-bold mb-2 leading-snug ${highlight ? 'text-white' : 'text-slate-900'}`}>
                    {title}
                  </h3>
                  <p className={`text-sm leading-relaxed mb-5 ${highlight ? 'text-blue-100' : 'text-slate-500'}`}>
                    {description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-2 mb-6 flex-1">
                    {features.map((f: string) => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <CheckCircle2
                          className={`w-4 h-4 flex-shrink-0 ${highlight ? 'text-blue-200' : 'text-emerald-500'}`}
                        />
                        <span className={highlight ? 'text-blue-100' : 'text-slate-600'}>{f}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Price & duration */}
                  <div className={`border-t pt-5 mb-5 ${highlight ? 'border-white/20' : 'border-slate-100'}`}>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className={`text-xs font-medium mb-0.5 ${highlight ? 'text-blue-200' : 'text-slate-400'}`}>
                          Biaya Pelatihan
                        </p>
                        <p className={`text-2xl font-extrabold ${highlight ? 'text-white' : 'text-blue-700'}`}>
                          {price}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className={`w-4 h-4 ${highlight ? 'text-blue-200' : 'text-slate-400'}`} />
                        <span className={`text-sm font-medium ${highlight ? 'text-blue-100' : 'text-slate-500'}`}>
                          {duration}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* CTA */}
                  <Link
                    href={`/register?trainingId=${id}`}
                    className={`inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                      highlight
                        ? 'bg-white text-blue-700 hover:bg-blue-50 shadow-md'
                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-100'
                    }`}
                  >
                    Daftar Program
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===================== WHY ALARA ===================== */}
        <section id="mengapa" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <span className="inline-block px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold uppercase tracking-widest mb-4">
                Mengapa Memilih ALARA
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
                Keunggulan Kami
              </h2>
              <p className="text-slate-500 max-w-xl mx-auto">
                Kami berkomitmen memberikan pelatihan berkualitas tinggi yang memenuhi standar
                internasional dan regulasi BAPETEN.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {whyAlara.map(({ icon: Icon, title, desc, color, bg }) => (
                <div
                  key={title}
                  className="flex flex-col p-6 rounded-2xl border border-slate-100 hover:shadow-lg transition-all group"
                >
                  <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${bg} mb-5 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-6 h-6 ${color}`} />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===================== CTA BANNER ===================== */}
        <section className="py-16 bg-gradient-to-r from-blue-700 to-indigo-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Star className="w-10 h-10 text-blue-300 mx-auto mb-4" />
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Siap Menjadi PPR Profesional?
            </h2>
            <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
              Daftarkan diri Anda sekarang dan bergabunglah dengan ratusan peserta yang telah
              berhasil mendapatkan sertifikasi PPR.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-all shadow-xl text-base"
              >
                Daftar Sekarang — Gratis
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#kontak"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 border border-white/30 transition-all text-base"
              >
                Hubungi Kami
              </Link>
            </div>
          </div>
        </section>

        {/* ===================== CONTACT ===================== */}
        <section id="kontak" className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold text-slate-900 mb-3">Hubungi Kami</h2>
              <p className="text-slate-500">Ada pertanyaan? Tim kami siap membantu Anda.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {/* Telepon / WhatsApp */}
              <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl border border-slate-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-blue-100 mb-3">
                  <Phone className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-xs text-slate-400 mb-1">Telepon / WhatsApp</p>
                <p className="font-semibold text-slate-700">{footer.phone}</p>
                {footer.phone && (
                  <a
                    href={`https://wa.me/${footer.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-2 font-medium"
                  >
                    Kirim Pesan
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {/* Email */}
              <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl border border-slate-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-blue-100 mb-3">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-xs text-slate-400 mb-1">Email Resmi</p>
                <p className="font-semibold text-slate-700 break-all">{footer.email}</p>
                {footer.email && (
                  <a
                    href={`mailto:${footer.email}`}
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-2 font-medium"
                  >
                    Kirim Email
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {/* Lokasi / Peta */}
              <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl border border-slate-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-blue-100 mb-3">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-xs text-slate-400 mb-1">Lokasi Lembaga</p>
                <p className="font-semibold text-slate-700">{footer.address}</p>
                {footer.mapUrl && (
                  <a
                    href={footer.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-2 font-medium"
                  >
                    Buka Google Maps
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ===================== FOOTER ===================== */}
      <footer className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <img
                  src="/logo.png"
                  alt="ALARA Logo"
                  className="w-10 h-10 object-contain rounded-lg shrink-0 bg-white p-0.5"
                />
                <div>
                  <div className="font-extrabold text-white text-base">{footer.brandTitle}</div>
                  <div className="text-blue-400 text-xs">{footer.brandSubtitle}</div>
                </div>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                {footer.brandDescription}
              </p>
            </div>

            {/* Quick links */}
            <div>
              <h3 className="font-bold text-white mb-4">Tautan Cepat</h3>
              <ul className="space-y-2">
                {[
                  { label: 'Beranda', href: '#hero' },
                  { label: 'Program Pelatihan', href: '#program' },
                  { label: 'Tentang Kami', href: '#mengapa' },
                  { label: 'Kontak', href: '#kontak' },
                  { label: 'Login Peserta', href: '/login' },
                  { label: 'Pendaftaran Akun', href: '/register' },
                ].map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="text-slate-400 text-sm hover:text-blue-400 transition-colors flex items-center gap-1.5">
                      <ChevronRight className="w-3.5 h-3.5" />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-bold text-white mb-4">Informasi Lembaga</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <span className="text-slate-500 text-xs block">Nama Lembaga</span>
                  {footer.institutionName}
                </li>
                <li>
                  <span className="text-slate-500 text-xs block">KTUN BAPETEN</span>
                  {footer.ktunNumber}
                </li>
                <li>
                  <span className="text-slate-500 text-xs block">Bank Pembayaran</span>
                  {footer.bankName}
                </li>
                <li>
                  <span className="text-slate-500 text-xs block">Atas Nama</span>
                  {footer.bankAccountName}
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-xs">
              &copy; {new Date().getFullYear()} {footer.copyrightText}
            </p>
            <p className="text-slate-600 text-xs">
              {footer.footerKtunText}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
