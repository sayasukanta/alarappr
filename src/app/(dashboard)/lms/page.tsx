'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  CheckCircle2,
  Lock,
  PlayCircle,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Clock,
  FileText,
  GraduationCap,
  Info,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Module {
  id: string
  title: string
  description: string
  durationMin: number
  type: 'video' | 'reading' | 'quiz' | 'file'
  status: 'completed' | 'in_progress' | 'locked' | 'available'
  pageCount?: number
  fileUrl?: string
  fileName?: string
}

interface DaySection {
  day: number
  label: string
  date: string
  modules: Module[]
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const TRAINING_DATA: DaySection[] = [
  {
    day: 1,
    label: 'Hari 1',
    date: '25 Sep 2026',
    modules: [
      {
        id: 'mod-1-1',
        title: 'Pengantar Proteksi Radiasi dan Regulasi BAPETEN',
        description: 'Dasar-dasar proteksi radiasi dan kerangka regulasi BAPETEN yang berlaku di Indonesia.',
        durationMin: 45,
        type: 'reading',
        status: 'completed',
        pageCount: 32,
      },
      {
        id: 'mod-1-2',
        title: 'Fisika Radiasi: Jenis dan Sifat Radiasi',
        description: 'Jenis-jenis radiasi pengion, sifat fisika, dan interaksi dengan materi.',
        durationMin: 60,
        type: 'reading',
        status: 'completed',
        pageCount: 48,
      },
      {
        id: 'mod-1-3',
        title: 'Kuis Hari 1',
        description: 'Evaluasi pemahaman materi hari pertama.',
        durationMin: 20,
        type: 'quiz',
        status: 'in_progress',
      },
    ],
  },
  {
    day: 2,
    label: 'Hari 2',
    date: '26 Sep 2026',
    modules: [
      {
        id: 'mod-2-1',
        title: 'Efek Biologi Radiasi',
        description: 'Efek deterministik dan stokastik radiasi terhadap tubuh manusia.',
        durationMin: 50,
        type: 'reading',
        status: 'available',
        pageCount: 40,
      },
      {
        id: 'mod-2-2',
        title: 'Alat Ukur Radiasi dan Dosimetri',
        description: 'Jenis alat ukur, kalibrasi, dan teknik dosimetri personal.',
        durationMin: 55,
        type: 'reading',
        status: 'available',
        pageCount: 36,
      },
      {
        id: 'mod-2-3',
        title: 'Proteksi Radiasi Spesifik (Bidang Medis & Industri)',
        description: 'Penerapan proteksi radiasi pada lingkungan medis dan industri.',
        durationMin: 65,
        type: 'reading',
        status: 'locked',
        pageCount: 52,
      },
      {
        id: 'mod-2-4',
        title: 'Kuis Hari 2',
        description: 'Evaluasi pemahaman materi hari kedua.',
        durationMin: 20,
        type: 'quiz',
        status: 'locked',
      },
    ],
  },
  {
    day: 3,
    label: 'Hari 3',
    date: '27 Sep 2026',
    modules: [
      {
        id: 'mod-3-1',
        title: 'Penanganan Keadaan Darurat Radiasi',
        description: 'Prosedur tanggap darurat, evakuasi, dan dekontaminasi.',
        durationMin: 50,
        type: 'reading',
        status: 'locked',
        pageCount: 38,
      },
      {
        id: 'mod-3-2',
        title: 'Manajemen Limbah Radioaktif',
        description: 'Klasifikasi, pengelolaan, dan pembuangan limbah radioaktif sesuai regulasi.',
        durationMin: 40,
        type: 'reading',
        status: 'locked',
        pageCount: 28,
      },
      {
        id: 'mod-3-3',
        title: 'Simulasi Praktik Proteksi Radiasi',
        description: 'Studi kasus dan simulasi penerapan prosedur proteksi radiasi.',
        durationMin: 90,
        type: 'reading',
        status: 'locked',
        pageCount: 60,
      },
      {
        id: 'mod-3-4',
        title: 'Ujian Akhir (Pre-Test BAPETEN)',
        description: 'Simulasi ujian komprehensif sebagai persiapan ujian BAPETEN.',
        durationMin: 120,
        type: 'quiz',
        status: 'locked',
      },
    ],
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function calcProgress(sections: DaySection[]): { completed: number; total: number; pct: number } {
  let completed = 0
  let total = 0
  sections.forEach((s) =>
    s.modules.forEach((m) => {
      total++
      if (m.status === 'completed') completed++
    }),
  )
  return { completed, total, pct: total > 0 ? Math.round((completed / total) * 100) : 0 }
}

function StatusIcon({ status }: { status: Module['status'] }) {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
    case 'in_progress':
      return <PlayCircle className="h-5 w-5 text-blue-500 shrink-0 animate-pulse" />
    case 'available':
      return <BookOpen className="h-5 w-5 text-amber-500 shrink-0" />
    case 'locked':
    default:
      return <Lock className="h-5 w-5 text-slate-400 shrink-0" />
  }
}

function TypeIcon({ type }: { type: Module['type'] }) {
  switch (type) {
    case 'video':
      return <PlayCircle className="h-4 w-4 text-red-500" />
    case 'quiz':
      return <GraduationCap className="h-4 w-4 text-purple-500" />
    case 'file':
      return <BookOpen className="h-4 w-4 text-amber-500" />
    case 'reading':
    default:
      return <FileText className="h-4 w-4 text-slate-500" />
  }
}

function statusLabel(status: Module['status']) {
  switch (status) {
    case 'completed':
      return { label: 'Selesai', cls: 'bg-emerald-100 text-emerald-700' }
    case 'in_progress':
      return { label: 'Sedang Dibaca', cls: 'bg-blue-100 text-blue-700' }
    case 'available':
      return { label: 'Tersedia', cls: 'bg-amber-100 text-amber-700' }
    case 'locked':
    default:
      return { label: 'Terkunci', cls: 'bg-slate-100 text-slate-500' }
  }
}

// ─── ModuleCard ───────────────────────────────────────────────────────────────
function ModuleCard({ mod }: { mod: Module }) {
  const sl = statusLabel(mod.status)
  const isLocked = mod.status === 'locked'

  const inner = (
    <div
      className={cn(
        'flex items-start gap-4 rounded-xl border p-4 transition-all duration-200',
        isLocked
          ? 'border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed'
          : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-md cursor-pointer',
      )}
    >
      <StatusIcon status={mod.status} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <TypeIcon type={mod.type} />
          <span className="font-semibold text-slate-800 text-sm leading-tight">{mod.title}</span>
          <span className={cn('ml-auto text-xs font-medium px-2 py-0.5 rounded-full shrink-0', sl.cls)}>
            {sl.label}
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-500 line-clamp-2">{mod.description}</p>
        <div className="mt-2 flex items-center gap-3 text-xs text-slate-400 flex-wrap">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {mod.durationMin} menit
          </span>
          {mod.pageCount && (
            <span className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              {mod.pageCount} halaman
            </span>
          )}
          {mod.fileName && (
            <span className="flex items-center gap-1 text-blue-600 font-medium">
              <BookOpen className="h-3 w-3" />
              {mod.fileName}
            </span>
          )}
        </div>
      </div>
    </div>
  )

  if (isLocked) return <div>{inner}</div>
  return <Link href={`/lms/${mod.id}`}>{inner}</Link>
}

// ─── DayAccordion ─────────────────────────────────────────────────────────────
function DayAccordion({ section }: { section: DaySection }) {
  const [open, setOpen] = useState(section.day <= 2)
  const completed = section.modules.filter((m) => m.status === 'completed').length
  const total = section.modules.length
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center gap-4 p-5 hover:bg-slate-50 transition-colors text-left"
      >
        <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
          H{section.day}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">{section.label}</span>
            <span className="text-xs text-slate-400">· {section.date}</span>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <Progress value={pct} className="h-1.5 w-32" />
            <span className="text-xs text-slate-500">
              {completed}/{total} modul · {pct}%
            </span>
          </div>
        </div>
        {open ? (
          <ChevronDown className="h-5 w-5 text-slate-400 shrink-0" />
        ) : (
          <ChevronRight className="h-5 w-5 text-slate-400 shrink-0" />
        )}
      </button>

      {/* Modules */}
      {open && (
        <div className="border-t border-slate-100 px-5 py-4 space-y-3 bg-slate-50/50">
          {section.modules.map((mod) => (
            <ModuleCard key={mod.id} mod={mod} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LMSPage() {
  const [sections, setSections] = useState<DaySection[]>(TRAINING_DATA)
  const [categoryName, setCategoryName] = useState('PPR Analisis')
  const [stats, setStats] = useState({ total: 0, completed: 0, pct: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadLms() {
      try {
        const res = await fetch('/api/lms')
        if (res.ok) {
          const data = await res.json()
          if (data.sections && data.sections.length > 0) {
            setSections(data.sections)
            if (data.stats) setStats(data.stats)
            if (data.category) {
              const catMap: Record<string, string> = {
                PPR_ANALISIS: 'PPR Industri Tk. 1 (Analisis)',
                PPR_BAGASI: 'PPR Medik Tk. 2 (Bagasi)',
                PKR_PEKERJA: 'PKR Pekerja Radiasi',
              }
              setCategoryName(catMap[data.category] || data.category)
            }
          }
        }
      } catch (err) {
        console.error('Failed to load LMS data', err)
      } finally {
        setLoading(false)
      }
    }
    loadLms()
  }, [])

  const { completed, total, pct } = stats.total > 0 ? stats : calcProgress(sections)

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 md:px-8">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Materi Pembelajaran (LMS)</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Program: {categoryName}
          </p>
        </div>

        {/* Overall Progress Card */}
        <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-blue-200 text-sm">Progres Keseluruhan</p>
              <p className="text-4xl font-bold mt-1">{pct}%</p>
            </div>
            <div className="text-right">
              <p className="text-blue-200 text-xs">Modul Selesai</p>
              <p className="text-3xl font-semibold">
                {completed}
                <span className="text-blue-300 text-lg">/{total}</span>
              </p>
            </div>
          </div>
          <Progress value={pct} className="h-2 bg-blue-400/40 [&>div]:bg-white" />
          <p className="mt-2 text-xs text-blue-200">
            {total - completed > 0 ? `${total - completed} modul tersisa untuk diselesaikan` : 'Semua modul telah selesai dipelajari!'}
          </p>
        </div>

        {/* Info Banner */}
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <Info className="h-5 w-5 shrink-0 mt-0.5" />
          <p>
            Modul pembelajaran disusun sesuai silabus BAPETEN. Anda dapat mempelajari modul secara berurutan dan mengunduh berkas materi pendukung yang disediakan instruktur.
          </p>
        </div>

        {/* Day Sections */}
        <div className="space-y-4">
          {sections.map((section) => (
            <DayAccordion key={section.day} section={section} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center py-4">
          <Button asChild variant="outline" size="sm">
            <Link href="/tryout">
              <GraduationCap className="h-4 w-4 mr-2" />
              Latihan Soal (Tryout)
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
