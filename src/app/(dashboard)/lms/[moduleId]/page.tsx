'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import ScientificCalculator from '@/components/ScientificCalculator'
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Calculator,
  BookMarked,
  X,
  Menu,
  GraduationCap,
  FileText,
  Lock,
  PlayCircle,
  FileDown,
  Download,
  ExternalLink,
  Video,
  Paperclip,
  Check,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
interface ModuleNavItem {
  id: string
  title: string
  status: 'completed' | 'in_progress' | 'available' | 'locked'
  type: 'reading' | 'quiz'
}

interface PageContent {
  pageNumber: number
  title: string
  html: string
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_MODULE = {
  id: 'mod-1-1',
  title: 'Pengantar Proteksi Radiasi dan Regulasi BAPETEN',
  totalPages: 5,
  peserta: { name: 'Budi Santoso', nik: '3201xxxxxxxx0001' },
}

const NAV_ITEMS: ModuleNavItem[] = [
  { id: 'mod-1-1', title: 'Pengantar Proteksi Radiasi', status: 'in_progress', type: 'reading' },
  { id: 'mod-1-2', title: 'Fisika Radiasi', status: 'completed', type: 'reading' },
  { id: 'mod-1-3', title: 'Kuis Hari 1', status: 'available', type: 'quiz' },
  { id: 'mod-2-1', title: 'Efek Biologi Radiasi', status: 'locked', type: 'reading' },
  { id: 'mod-2-2', title: 'Alat Ukur Radiasi', status: 'locked', type: 'reading' },
]

const GLOSSARY: { term: string; def: string }[] = [
  { term: 'Dosis Serap', def: 'Energi radiasi yang diserap per satuan massa jaringan. Satuan: Gray (Gy).' },
  { term: 'Dosis Ekivalen', def: 'Dosis serap dikali faktor bobot radiasi. Satuan: Sievert (Sv).' },
  { term: 'Dosis Efektif', def: 'Dosis ekivalen dikali faktor bobot jaringan. Satuan: Sievert (Sv).' },
  { term: 'ALARA', def: 'As Low As Reasonably Achievable – prinsip minimisasi paparan radiasi.' },
  { term: 'BAPETEN', def: 'Badan Pengawas Tenaga Nuklir – regulator nuklir nasional Indonesia.' },
  { term: 'TLD', def: 'Thermoluminescent Dosimeter – alat ukur dosis radiasi personal.' },
  { term: 'NDT', def: 'Non-Destructive Testing – pengujian material tanpa merusak.' },
  { term: 'Half-life (T½)', def: 'Waktu yang diperlukan aktivitas radionuklida berkurang setengahnya.' },
]

function generatePageContent(page: number, moduleTitle: string): PageContent {
  const pages: Record<number, PageContent> = {
    1: {
      pageNumber: 1,
      title: 'Pendahuluan',
      html: `
        <h2 class="text-xl font-bold text-slate-800 mb-4">1. Pendahuluan Proteksi Radiasi</h2>
        <p class="text-slate-700 leading-relaxed mb-4">
          Proteksi radiasi adalah cabang ilmu yang mempelajari cara-cara melindungi manusia dan lingkungan
          dari efek berbahaya radiasi pengion. Di Indonesia, pengaturan keselamatan radiasi diatur oleh
          <strong>BAPETEN (Badan Pengawas Tenaga Nuklir)</strong> sesuai amanat Undang-Undang No. 10 Tahun 1997
          tentang Ketenaganukliran.
        </p>
        <div class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-4">
          <p class="text-blue-800 font-semibold mb-1">Prinsip Dasar Proteksi Radiasi (ICRP 103)</p>
          <ul class="text-blue-700 space-y-1 text-sm">
            <li>✓ <strong>Justifikasi</strong> – Manfaat harus melebihi risiko</li>
            <li>✓ <strong>Optimisasi (ALARA)</strong> – Paparan harus serendah mungkin</li>
            <li>✓ <strong>Limitasi Dosis</strong> – Tidak melampaui batas dosis yang ditetapkan</li>
          </ul>
        </div>
        <p class="text-slate-700 leading-relaxed mb-4">
          Setiap Petugas Proteksi Radiasi (PPR) wajib memiliki izin kompetensi yang dikeluarkan oleh BAPETEN.
          Pelatihan dan ujian kompetensi dilaksanakan oleh lembaga yang telah mendapat akreditasi, salah satunya
          adalah <strong>CV. Hikmat Proteksi ALARA</strong> (KTUN BAPETEN No. 07998.722.1.040726).
        </p>
        <h3 class="text-lg font-semibold text-slate-800 mb-3 mt-6">1.1 Sejarah Perkembangan Proteksi Radiasi</h3>
        <p class="text-slate-700 leading-relaxed mb-4">
          Sejak penemuan sinar-X oleh Wilhelm Conrad Röntgen pada tahun 1895 dan radioaktivitas oleh Henri Becquerel
          pada tahun 1896, umat manusia mulai menyadari manfaat sekaligus bahaya radiasi pengion. Korban pertama
          radiasi diketahui adalah para peneliti awal yang bekerja tanpa perlindungan memadai.
        </p>
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div class="bg-slate-50 rounded-lg p-3 border">
            <p class="font-semibold text-slate-700 text-sm mb-1">1895</p>
            <p class="text-xs text-slate-500">Penemuan Sinar-X oleh Röntgen</p>
          </div>
          <div class="bg-slate-50 rounded-lg p-3 border">
            <p class="font-semibold text-slate-700 text-sm mb-1">1928</p>
            <p class="text-xs text-slate-500">Pembentukan ICRP (International Commission on Radiological Protection)</p>
          </div>
          <div class="bg-slate-50 rounded-lg p-3 border">
            <p class="font-semibold text-slate-700 text-sm mb-1">1958</p>
            <p class="text-xs text-slate-500">IAEA didirikan di Vienna, Austria</p>
          </div>
          <div class="bg-slate-50 rounded-lg p-3 border">
            <p class="font-semibold text-slate-700 text-sm mb-1">1997</p>
            <p class="text-xs text-slate-500">UU No. 10/1997 – Ketenaganukliran Indonesia</p>
          </div>
        </div>
      `,
    },
    2: {
      pageNumber: 2,
      title: 'Regulasi BAPETEN',
      html: `
        <h2 class="text-xl font-bold text-slate-800 mb-4">2. Kerangka Regulasi BAPETEN</h2>
        <p class="text-slate-700 leading-relaxed mb-4">
          Regulasi keselamatan radiasi di Indonesia bersifat hirarkis, dimulai dari Undang-Undang hingga
          Peraturan Kepala BAPETEN (Perka BAPETEN). Setiap pengguna zat radioaktif dan sumber radiasi wajib
          memiliki izin yang dikeluarkan oleh BAPETEN.
        </p>
        <div class="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <p class="font-semibold text-amber-800 mb-2">⚠️ Regulasi Utama yang Wajib Dipahami PPR</p>
          <table class="w-full text-sm">
            <thead><tr class="text-amber-700"><th class="text-left pb-2">Regulasi</th><th class="text-left pb-2">Topik</th></tr></thead>
            <tbody class="text-amber-900 space-y-1">
              <tr><td class="py-1 pr-4 font-mono text-xs">Perka 4/2013</td><td>Proteksi dan Keselamatan Radiasi dalam Pemanfaatan Tenaga Nuklir</td></tr>
              <tr><td class="py-1 pr-4 font-mono text-xs">Perka 8/2011</td><td>Keselamatan Radiasi dalam Penggunaan Pesawat Sinar-X</td></tr>
              <tr><td class="py-1 pr-4 font-mono text-xs">Perka 17/2012</td><td>Keselamatan Radiasi dalam Kegiatan Impor, Ekspor, dan Pengangkutan Zat Radioaktif</td></tr>
              <tr><td class="py-1 pr-4 font-mono text-xs">PP 33/2007</td><td>Keselamatan Radiasi Pengion dan Keamanan Sumber Radioaktif</td></tr>
            </tbody>
          </table>
        </div>
        <h3 class="text-lg font-semibold text-slate-800 mb-3">2.1 Nilai Batas Dosis (NBD)</h3>
        <p class="text-slate-700 leading-relaxed mb-4">
          Sesuai Perka BAPETEN No. 4 Tahun 2013, Nilai Batas Dosis (NBD) ditetapkan sebagai berikut:
        </p>
        <div class="overflow-x-auto">
          <table class="w-full text-sm border-collapse border border-slate-200 rounded-lg overflow-hidden">
            <thead class="bg-slate-100">
              <tr>
                <th class="p-3 text-left border border-slate-200 text-slate-700">Kelompok</th>
                <th class="p-3 text-left border border-slate-200 text-slate-700">Dosis Efektif</th>
                <th class="p-3 text-left border border-slate-200 text-slate-700">Lensa Mata</th>
                <th class="p-3 text-left border border-slate-200 text-slate-700">Kulit / Tangan</th>
              </tr>
            </thead>
            <tbody>
              <tr class="hover:bg-slate-50">
                <td class="p-3 border border-slate-200 font-medium">Pekerja Radiasi</td>
                <td class="p-3 border border-slate-200">20 mSv/tahun</td>
                <td class="p-3 border border-slate-200">150 mSv/tahun</td>
                <td class="p-3 border border-slate-200">500 mSv/tahun</td>
              </tr>
              <tr class="hover:bg-slate-50">
                <td class="p-3 border border-slate-200 font-medium">Masyarakat Umum</td>
                <td class="p-3 border border-slate-200">1 mSv/tahun</td>
                <td class="p-3 border border-slate-200">15 mSv/tahun</td>
                <td class="p-3 border border-slate-200">50 mSv/tahun</td>
              </tr>
              <tr class="hover:bg-slate-50">
                <td class="p-3 border border-slate-200 font-medium">Ibu Hamil</td>
                <td class="p-3 border border-slate-200 text-red-600 font-medium">2 mSv (janin)</td>
                <td class="p-3 border border-slate-200">—</td>
                <td class="p-3 border border-slate-200">—</td>
              </tr>
            </tbody>
          </table>
        </div>
      `,
    },
    3: {
      pageNumber: 3,
      title: 'Rumus & Kalkulasi Dosis',
      html: `
        <h2 class="text-xl font-bold text-slate-800 mb-4">3. Kalkulasi Dosis Radiasi</h2>
        <p class="text-slate-700 leading-relaxed mb-4">
          Pemahaman terhadap kalkulasi dosis radiasi sangat penting bagi seorang PPR untuk mengevaluasi
          keselamatan pekerja dan memastikan paparan berada di bawah Nilai Batas Dosis.
        </p>
        <div class="bg-purple-50 border border-purple-200 rounded-xl p-5 mb-6">
          <p class="font-bold text-purple-900 mb-3">📐 Rumus Penting Proteksi Radiasi</p>
          <div class="space-y-3">
            <div class="bg-white rounded-lg p-3 border border-purple-100">
              <p class="text-xs text-purple-500 font-medium mb-1">Peluruhan Radioaktif</p>
              <p class="font-mono text-slate-800 text-sm">N(t) = N₀ × e<sup>−λt</sup></p>
              <p class="text-xs text-slate-500 mt-1">N₀ = jumlah awal, λ = konstanta peluruhan, t = waktu</p>
            </div>
            <div class="bg-white rounded-lg p-3 border border-purple-100">
              <p class="text-xs text-purple-500 font-medium mb-1">Waktu Paro (Half-life)</p>
              <p class="font-mono text-slate-800 text-sm">T½ = ln(2) / λ ≈ 0.693 / λ</p>
            </div>
            <div class="bg-white rounded-lg p-3 border border-purple-100">
              <p class="text-xs text-purple-500 font-medium mb-1">Hukum Kuadrat Terbalik (Inverse Square Law)</p>
              <p class="font-mono text-slate-800 text-sm">I₁/I₂ = (d₂)² / (d₁)²</p>
              <p class="text-xs text-slate-500 mt-1">Intensitas berbanding terbalik dengan kuadrat jarak</p>
            </div>
            <div class="bg-white rounded-lg p-3 border border-purple-100">
              <p class="text-xs text-purple-500 font-medium mb-1">Attenuasi Radiasi melalui Perisai</p>
              <p class="font-mono text-slate-800 text-sm">I = I₀ × e<sup>−μx</sup></p>
              <p class="text-xs text-slate-500 mt-1">μ = koefisien attenuasi linier, x = tebal perisai</p>
            </div>
          </div>
        </div>
        <h3 class="text-lg font-semibold text-slate-800 mb-3">3.1 Contoh Soal</h3>
        <div class="bg-green-50 border border-green-200 rounded-lg p-4">
          <p class="font-semibold text-green-800 mb-2">Soal:</p>
          <p class="text-green-700 text-sm mb-3">
            Sebuah sumber Ir-192 memiliki aktivitas awal 100 GBq. Jika T½ = 73,83 hari, berapa aktivitasnya
            setelah 30 hari?
          </p>
          <p class="font-semibold text-green-800 mb-2">Penyelesaian:</p>
          <div class="font-mono text-sm text-green-700 space-y-1">
            <p>λ = 0.693 / 73.83 = 0.00939 hari⁻¹</p>
            <p>A(t) = 100 × e<sup>−0.00939 × 30</sup></p>
            <p>A(t) = 100 × e<sup>−0.2817</sup></p>
            <p class="font-bold">A(t) ≈ 75.47 GBq</p>
          </div>
        </div>
      `,
    },
    4: {
      pageNumber: 4,
      title: 'Perizinan dan Sertifikasi',
      html: `
        <h2 class="text-xl font-bold text-slate-800 mb-4">4. Perizinan dan Sertifikasi PPR</h2>
        <p class="text-slate-700 leading-relaxed mb-4">
          Setiap fasilitas yang menggunakan sumber radiasi wajib menunjuk Petugas Proteksi Radiasi (PPR)
          yang telah bersertifikat dan diakui oleh BAPETEN. Proses perizinan PPR meliputi:
        </p>
        <div class="space-y-4 mb-6">
          <div class="flex gap-4 items-start">
            <div class="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold shrink-0">1</div>
            <div>
              <p class="font-semibold text-slate-800">Mengikuti Pelatihan Resmi</p>
              <p class="text-sm text-slate-500">Pelatihan diselenggarakan oleh lembaga yang telah mendapat akreditasi BAPETEN, seperti CV. Hikmat Proteksi ALARA.</p>
            </div>
          </div>
          <div class="flex gap-4 items-start">
            <div class="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold shrink-0">2</div>
            <div>
              <p class="font-semibold text-slate-800">Ujian Kompetensi BAPETEN</p>
              <p class="text-sm text-slate-500">Ujian teori dan praktik yang diselenggarakan oleh BAPETEN atau lembaga yang ditunjuk.</p>
            </div>
          </div>
          <div class="flex gap-4 items-start">
            <div class="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold shrink-0">3</div>
            <div>
              <p class="font-semibold text-slate-800">Penerbitan SIB (Surat Izin Bekerja)</p>
              <p class="text-sm text-slate-500">SIB diterbitkan oleh BAPETEN setelah lulus ujian kompetensi, berlaku 5 tahun.</p>
            </div>
          </div>
          <div class="flex gap-4 items-start">
            <div class="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold shrink-0">4</div>
            <div>
              <p class="font-semibold text-slate-800">Perpanjangan SIB</p>
              <p class="text-sm text-slate-500">Wajib mengikuti pelatihan penyegaran sebelum perpanjangan. SIB yang expired tidak sah digunakan.</p>
            </div>
          </div>
        </div>
        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
          <p class="font-semibold text-red-800 mb-1">⚠️ Sanksi Hukum</p>
          <p class="text-sm text-red-700">
            Pasal 44 UU No. 10/1997: Setiap orang yang dengan sengaja melakukan kegiatan pemanfaatan tenaga nuklir
            tanpa izin dapat dipidana dengan pidana penjara paling lama 5 tahun dan/atau denda paling banyak
            Rp 500.000.000.
          </p>
        </div>
      `,
    },
    5: {
      pageNumber: 5,
      title: 'Ringkasan & Referensi',
      html: `
        <h2 class="text-xl font-bold text-slate-800 mb-4">5. Ringkasan dan Referensi</h2>
        <div class="bg-emerald-50 border border-emerald-200 rounded-xl p-5 mb-6">
          <p class="font-bold text-emerald-800 mb-3">✅ Poin Kunci Modul Ini</p>
          <ul class="space-y-2 text-sm text-emerald-700">
            <li>• Proteksi radiasi didasarkan pada 3 prinsip: Justifikasi, Optimisasi (ALARA), dan Limitasi Dosis</li>
            <li>• BAPETEN adalah regulator nuklir nasional berdasarkan UU No. 10/1997</li>
            <li>• NBD pekerja radiasi: 20 mSv/tahun (dosis efektif)</li>
            <li>• PPR wajib memiliki SIB yang dikeluarkan BAPETEN, berlaku 5 tahun</li>
            <li>• Kalkulasi dosis menggunakan rumus peluruhan, inverse square law, dan attenuasi</li>
            <li>• Perka BAPETEN 4/2013 adalah regulasi proteksi radiasi utama saat ini</li>
          </ul>
        </div>
        <h3 class="text-lg font-semibold text-slate-800 mb-3">Referensi</h3>
        <div class="space-y-2 text-sm text-slate-600">
          <p>1. BAPETEN. (2013). <em>Peraturan Kepala BAPETEN No. 4 Tahun 2013 tentang Proteksi dan Keselamatan Radiasi.</em></p>
          <p>2. ICRP. (2007). <em>The 2007 Recommendations of the International Commission on Radiological Protection (Publication 103).</em> Oxford: Elsevier.</p>
          <p>3. IAEA. (2014). <em>Radiation Protection and Safety of Radiation Sources: International Basic Safety Standards (GSR Part 3).</em> Vienna: IAEA.</p>
          <p>4. Undang-Undang Republik Indonesia No. 10 Tahun 1997 tentang Ketenaganukliran.</p>
          <p>5. Peraturan Pemerintah No. 33 Tahun 2007 tentang Keselamatan Radiasi Pengion dan Keamanan Sumber Radioaktif.</p>
        </div>
        <div class="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100 text-center">
          <p class="text-blue-700 font-medium text-sm">🎉 Anda telah menyelesaikan modul ini!</p>
          <p class="text-xs text-blue-500 mt-1">Lanjutkan ke modul berikutnya atau kerjakan Kuis Hari 1</p>
        </div>
      `,
    },
  }
  return pages[page] || pages[1]
}

// ─── Watermark Component ──────────────────────────────────────────────────────
function Watermark({ name, nik }: { name: string; nik: string }) {
  const timestamp = new Date().toLocaleString('id-ID', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
  const text = `${name} | ${nik} | ${timestamp}`

  return (
    <div
      className="pointer-events-none select-none absolute inset-0 overflow-hidden z-10"
      aria-hidden="true"
    >
      {Array.from({ length: 8 }).map((_, row) =>
        Array.from({ length: 4 }).map((_, col) => (
          <div
            key={`${row}-${col}`}
            className="absolute text-[11px] font-medium text-slate-400/25 whitespace-nowrap"
            style={{
              top: `${row * 13 + 5}%`,
              left: `${col * 30 - 5}%`,
              transform: 'rotate(-35deg)',
            }}
          >
            {text}
          </div>
        )),
      )}
    </div>
  )
}

// ─── Sidebar Nav Item ─────────────────────────────────────────────────────────
function NavItem({ item, active }: { item: ModuleNavItem; active: boolean }) {
  const isLocked = item.status === 'locked'
  const icons: Record<string, React.ReactNode> = {
    completed: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
    in_progress: <PlayCircle className="h-4 w-4 text-blue-500" />,
    available: <BookOpen className="h-4 w-4 text-amber-500" />,
    locked: <Lock className="h-4 w-4 text-slate-300" />,
  }
  const inner = (
    <div
      className={cn(
        'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
        active && 'bg-blue-50 text-blue-700 font-medium',
        !active && !isLocked && 'hover:bg-slate-100 text-slate-700 cursor-pointer',
        isLocked && 'text-slate-400 cursor-not-allowed opacity-60',
      )}
    >
      {icons[item.status]}
      <span className="flex-1 leading-tight line-clamp-2 text-xs">{item.title}</span>
      {item.type === 'quiz' && (
        <GraduationCap className="h-3 w-3 text-purple-400 shrink-0" />
      )}
    </div>
  )
  if (isLocked) return <div>{inner}</div>
  return <Link href={`/lms/${item.id}`}>{inner}</Link>
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LMSModuleReaderPage() {
  const params = useParams()
  const moduleId = params?.moduleId as string

  const [currentPage, setCurrentPage] = useState(1)
  const [showCalculator, setShowCalculator] = useState(false)
  const [showGlossary, setShowGlossary] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [moduleData, setModuleData] = useState<any>(null)
  const [navItemsList, setNavItemsList] = useState<ModuleNavItem[]>(NAV_ITEMS)
  const [isCompleted, setIsCompleted] = useState(false)
  const [loading, setLoading] = useState(true)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function fetchModuleDetail() {
      if (!moduleId) return
      try {
        setLoading(true)
        const res = await fetch(`/api/lms/${moduleId}`)
        if (res.ok) {
          const data = await res.json()
          if (data.module) {
            setModuleData(data.module)
            setIsCompleted(data.isCompleted || false)
          }
          if (data.navItems && data.navItems.length > 0) {
            setNavItemsList(data.navItems)
          }
        }
      } catch (err) {
        console.error('Failed to load module details', err)
      } finally {
        setLoading(false)
      }
    }
    fetchModuleDetail()
  }, [moduleId])

  const handleMarkComplete = async () => {
    try {
      await fetch(`/api/lms/${moduleId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      })
      setIsCompleted(true)
    } catch (err) {
      console.error('Failed to mark complete', err)
    }
  }

  const moduleTitle = moduleData?.title || MOCK_MODULE.title
  const totalPages = moduleData?.pageCount || MOCK_MODULE.totalPages
  const pageContent = generatePageContent(currentPage, moduleTitle)

  // ── Security: disable context-menu and dangerous keyboard shortcuts ────────
  useEffect(() => {
    const preventContextMenu = (e: MouseEvent) => e.preventDefault()
    const preventKeyboard = (e: KeyboardEvent) => {
      // Block Ctrl+P (print), Ctrl+S (save), Ctrl+C (copy), Ctrl+U (view-source)
      if (e.ctrlKey && ['p', 's', 'c', 'u', 'a'].includes(e.key.toLowerCase())) {
        e.preventDefault()
        e.stopPropagation()
        return false
      }
      // Block F12 (devtools), PrintScreen
      if (['F12', 'PrintScreen'].includes(e.key)) {
        e.preventDefault()
      }
    }

    document.addEventListener('contextmenu', preventContextMenu)
    document.addEventListener('keydown', preventKeyboard, { capture: true })

    return () => {
      document.removeEventListener('contextmenu', preventContextMenu)
      document.removeEventListener('keydown', preventKeyboard, { capture: true })
    }
  }, [])

  const goToPage = useCallback(
    (p: number) => {
      const clamped = Math.max(1, Math.min(totalPages, p))
      setCurrentPage(clamped)
      contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    },
    [totalPages],
  )

  return (
    <div className="h-screen flex flex-col bg-slate-100 overflow-hidden select-none">
      {/* ── Top Toolbar ── */}
      <header className="h-12 bg-white border-b border-slate-200 flex items-center gap-3 px-4 shrink-0 z-20">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSidebarOpen((p) => !p)}>
          <Menu className="h-4 w-4" />
        </Button>
        <Link href="/lms" className="text-slate-400 hover:text-slate-700">
          <ChevronLeft className="h-4 w-4 inline" /> Materi
        </Link>
        <Separator orientation="vertical" className="h-5" />
        <span className="text-sm font-medium text-slate-700 truncate flex-1">{moduleTitle}</span>

        {/* Page controls */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="h-3 w-3" />
          </Button>
          <span className="text-xs text-slate-600 whitespace-nowrap">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="h-7 gap-1 text-xs"
          onClick={() => setShowCalculator((p) => !p)}
        >
          <Calculator className="h-3 w-3" />
          Kalkulator
        </Button>
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 z-10">
            <div className="p-3 border-b border-slate-100">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Daftar Modul</p>
            </div>
            <ScrollArea className="flex-1 p-2">
              <div className="space-y-0.5">
                {navItemsList.map((item) => (
                  <NavItem key={item.id} item={item} active={item.id === moduleId} />
                ))}
              </div>
            </ScrollArea>

            <Separator />

            {/* Sidebar extras */}
            <div className="p-2 space-y-1">
              <button
                onClick={() => setShowGlossary((p) => !p)}
                className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <BookMarked className="h-4 w-4 text-indigo-500" />
                Glosarium
                {showGlossary && <Badge variant="secondary" className="ml-auto text-[10px] py-0">Buka</Badge>}
              </button>
              <button
                onClick={() => setShowCalculator((p) => !p)}
                className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <Calculator className="h-4 w-4 text-purple-500" />
                Kalkulator Saintifik
              </button>
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 flex overflow-hidden">
          {/* Module Reader */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1" ref={contentRef as any}>
              <div className="relative min-h-full">
                {/* Watermark */}
                <Watermark name={MOCK_MODULE.peserta.name} nik={MOCK_MODULE.peserta.nik} />

                {/* Content */}
                <article className="relative z-0 max-w-3xl mx-auto px-8 py-10 space-y-6">
                  {/* Page title badge & completion */}
                  <div className="flex items-center justify-between gap-2 flex-wrap border-b pb-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        <FileText className="h-3 w-3 mr-1" />
                        Halaman {currentPage}
                      </Badge>
                      <span className="text-sm font-semibold text-slate-800">
                        {moduleData?.content ? moduleTitle : pageContent.title}
                      </span>
                    </div>

                    {isCompleted && (
                      <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200">
                        <Check className="h-3 w-3 mr-1" /> Selesai Dipelajari
                      </Badge>
                    )}
                  </div>

                  {/* Video Player if videoUrl is set */}
                  {moduleData?.videoUrl && (
                    <div className="rounded-xl overflow-hidden border border-slate-200 bg-black aspect-video flex items-center justify-center shadow-sm">
                      {moduleData.videoUrl.includes("youtube.com") || moduleData.videoUrl.includes("youtu.be") ? (
                        <iframe
                          src={
                            moduleData.videoUrl.includes("watch?v=")
                              ? moduleData.videoUrl.replace("watch?v=", "embed/")
                              : moduleData.videoUrl.replace("youtu.be/", "www.youtube.com/embed/")
                          }
                          title={moduleTitle}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <div className="p-6 text-center text-white">
                          <PlayCircle className="h-12 w-12 mx-auto mb-2 text-red-500" />
                          <p className="text-sm font-semibold">Tautan Video Pembelajaran</p>
                          <a
                            href={moduleData.videoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-blue-400 hover:underline mt-1 inline-block"
                          >
                            Buka Video di Tab Baru &rarr;
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Download File Card if fileUrl is set */}
                  {moduleData?.fileUrl && (
                    <div className="flex items-center justify-between p-4 bg-blue-50/80 border border-blue-200 rounded-xl shadow-xs">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                          <FileDown className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {moduleData.fileName || "Berkas Materi Pembelajaran"}
                          </p>
                          <p className="text-xs text-slate-500">
                            {moduleData.fileSize ? `Ukuran: ${moduleData.fileSize} · ` : ""}Format Dokumen / Slide
                          </p>
                        </div>
                      </div>

                      <a
                        href={moduleData.fileUrl}
                        download
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Unduh Berkas
                      </a>
                    </div>
                  )}

                  {/* Rendered HTML content */}
                  <div
                    className="prose prose-slate max-w-none text-slate-800 leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: moduleData?.content || pageContent.html,
                    }}
                  />

                  {/* Bottom navigation */}
                  <div className="mt-12 flex items-center justify-between border-t pt-6">
                    <Button
                      variant="outline"
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage <= 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" /> Sebelumnya
                    </Button>
                    {currentPage < totalPages ? (
                      <Button onClick={() => goToPage(currentPage + 1)}>
                        Berikutnya <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    ) : (
                      <Button
                        onClick={async () => {
                          await handleMarkComplete()
                          window.location.href = '/lms'
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1.5" /> Selesai & Simpan Progres
                      </Button>
                    )}
                  </div>
                </article>
              </div>
            </ScrollArea>
          </div>

          {/* Glossary Panel */}
          {showGlossary && (
            <aside className="w-72 bg-white border-l border-slate-200 flex flex-col shrink-0">
              <div className="flex items-center justify-between p-3 border-b">
                <p className="text-sm font-semibold text-slate-700">Glosarium</p>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowGlossary(false)}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <ScrollArea className="flex-1 p-3">
                <div className="space-y-3">
                  {GLOSSARY.map((g) => (
                    <div key={g.term} className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                      <p className="text-xs font-bold text-slate-800">{g.term}</p>
                      <p className="text-xs text-slate-500 mt-1">{g.def}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </aside>
          )}
        </main>
      </div>

      {/* ── Floating Calculator ── */}
      {showCalculator && (
        <div className="fixed bottom-6 right-6 z-50 shadow-2xl rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between bg-slate-800 px-4 py-2">
            <span className="text-white text-xs font-semibold">Kalkulator Saintifik</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-slate-400 hover:text-white"
              onClick={() => setShowCalculator(false)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <ScientificCalculator />
        </div>
      )}
    </div>
  )
}
