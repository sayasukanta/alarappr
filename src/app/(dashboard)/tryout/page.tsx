'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Clock,
  FileText,
  GraduationCap,
  PlayCircle,
  CheckCircle2,
  XCircle,
  Trophy,
  ChevronRight,
  Info,
  AlertCircle,
  Star,
  BarChart3,
  Loader2,
  Lock,
} from 'lucide-react'
import { toast } from 'sonner'

// ─── Types ────────────────────────────────────────────────────────────────────
interface TryoutPackage {
  id: string
  title: string
  description: string
  questionCount: number
  totalBankQuestions?: number
  timeLimitMin: number
  category: string
  difficulty: 'Mudah' | 'Menengah' | 'Sulit'
  passingGrade: number
  badge?: string
}

interface TryoutSchedule {
  isOpen: boolean
  startTime: string | null
  endTime: string | null
  durationMinutes: number
  questionCount?: number
  remainingMinutes: number
  statusMessage: string
  batchName: string | null
}

interface AttemptHistory {
  id: string
  packageId: string
  packageTitle: string
  score: number
  date: string
  duration: string
  status: 'lulus' | 'belum_lulus'
  rank?: string
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const TRYOUT_PACKAGES: TryoutPackage[] = [
  {
    id: 'pkg-1',
    title: 'Tryout Mandiri – PPR Analisis',
    description:
      'Latihan soal mandiri mencakup semua topik ujian BAPETEN: regulasi, fisika radiasi, efek biologi, alat ukur, proteksi spesifik, dan keadaan darurat.',
    questionCount: 60,
    timeLimitMin: 90,
    category: 'PPR Analisis',
    difficulty: 'Menengah',
    passingGrade: 70,
    badge: 'Populer',
  },
  {
    id: 'pkg-2',
    title: 'Simulasi Final BAPETEN',
    description:
      'Simulasi ujian akhir dengan tingkat kesulitan setara ujian BAPETEN sesungguhnya. Soal diacak dari bank soal tervalidasi.',
    questionCount: 100,
    timeLimitMin: 150,
    category: 'PPR Analisis',
    difficulty: 'Sulit',
    passingGrade: 70,
    badge: 'Rekomendasi',
  },
  {
    id: 'pkg-3',
    title: 'Kuis Regulasi BAPETEN',
    description: 'Fokus khusus pada regulasi dan peraturan BAPETEN. Cocok sebagai latihan cepat.',
    questionCount: 30,
    timeLimitMin: 40,
    category: 'Regulasi',
    difficulty: 'Mudah',
    passingGrade: 70,
  },
  {
    id: 'pkg-4',
    title: 'Latihan Fisika Radiasi & Dosimetri',
    description:
      'Soal-soal hitungan: peluruhan radioaktif, inverse square law, faktor atenuasi, dan kalkulasi dosis.',
    questionCount: 40,
    timeLimitMin: 60,
    category: 'Fisika & Dosimetri',
    difficulty: 'Sulit',
    passingGrade: 70,
  },
]

const ATTEMPT_HISTORY: AttemptHistory[] = [
  {
    id: 'att-001',
    packageId: 'pkg-1',
    packageTitle: 'Tryout Mandiri – PPR Analisis',
    score: 78,
    date: '20 Sep 2026',
    duration: '1j 12m',
    status: 'lulus',
  },
  {
    id: 'att-002',
    packageId: 'pkg-3',
    packageTitle: 'Kuis Regulasi BAPETEN',
    score: 83,
    date: '18 Sep 2026',
    duration: '32m',
    status: 'lulus',
  },
  {
    id: 'att-003',
    packageId: 'pkg-2',
    packageTitle: 'Simulasi Final BAPETEN',
    score: 62,
    date: '15 Sep 2026',
    duration: '2j 28m',
    status: 'belum_lulus',
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function difficultyColor(d: TryoutPackage['difficulty']) {
  return {
    Mudah: 'bg-emerald-100 text-emerald-700',
    Menengah: 'bg-amber-100 text-amber-700',
    Sulit: 'bg-red-100 text-red-700',
  }[d]
}

function scoreColor(score: number) {
  if (score >= 85) return 'text-emerald-600'
  if (score >= 70) return 'text-blue-600'
  return 'text-red-500'
}

// ─── Start Confirmation Dialog ────────────────────────────────────────────────
function StartDialog({
  pkg,
  open,
  onClose,
  onStart,
  starting = false,
  isLocked = false,
}: {
  pkg: TryoutPackage | null
  open: boolean
  onClose: () => void
  onStart: () => void
  starting?: boolean
  isLocked?: boolean
}) {
  if (!pkg) return null
  const rules = [
    `Jumlah soal: ${pkg.questionCount} butir pilihan ganda (diacak otomatis per peserta)`,
    `Waktu pengerjaan: ${pkg.timeLimitMin} menit`,
    `Nilai kelulusan: ${pkg.passingGrade}`,
    'Jawaban tersimpan otomatis saat dipilih',
    'Ujian dijalankan dalam mode layar penuh (fullscreen)',
    'Perpindahan tab akan dicatat; 3 kali perpindahan = ujian otomatis dikumpulkan',
    'Kalkulator saintifik tersedia selama ujian',
    'Soal dapat ditandai sebagai "ragu-ragu" untuk ditinjau kembali',
    'Klik "Kumpulkan" untuk mengakhiri ujian sebelum waktu habis',
  ]

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-blue-600" />
            {pkg.title}
          </DialogTitle>
          <DialogDescription>Baca ketentuan ujian sebelum memulai</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center rounded-lg bg-blue-50 p-3">
              <p className="text-lg font-bold text-blue-700">{pkg.questionCount}</p>
              <p className="text-xs text-blue-500">Soal</p>
            </div>
            <div className="text-center rounded-lg bg-amber-50 p-3">
              <p className="text-lg font-bold text-amber-700">{pkg.timeLimitMin}'</p>
              <p className="text-xs text-amber-500">Menit</p>
            </div>
            <div className="text-center rounded-lg bg-emerald-50 p-3">
              <p className="text-lg font-bold text-emerald-700">{pkg.passingGrade}</p>
              <p className="text-xs text-emerald-500">Min. Lulus</p>
            </div>
          </div>

          <Separator />

          {/* Rules */}
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              Ketentuan Ujian
            </p>
            <ul className="space-y-1.5">
              {rules.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                  <CheckCircle2 className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={starting}>
            Batal
          </Button>
          <Button
            onClick={onStart}
            disabled={starting || isLocked}
            className={cn("bg-blue-600 hover:bg-blue-700", isLocked && "bg-slate-300 hover:bg-slate-300 text-slate-600 cursor-not-allowed")}
          >
            {starting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Menyiapkan Ujian...
              </>
            ) : isLocked ? (
              <>
                <Lock className="h-4 w-4 mr-2" />
                Ujian Belum Dibuka
              </>
            ) : (
              <>
                <PlayCircle className="h-4 w-4 mr-2" />
                Mulai Sekarang
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Package Card ──────────────────────────────────────────────────────────────
function PackageCard({
  pkg,
  onStart,
  isLocked = false,
}: {
  pkg: TryoutPackage
  onStart: (p: TryoutPackage) => void
  isLocked?: boolean
}) {
  return (
    <Card className="p-5 hover:shadow-lg transition-shadow duration-200 relative overflow-hidden border-slate-200">
      {pkg.badge && (
        <div className="absolute top-4 right-4">
          <Badge className="bg-blue-600 text-white text-xs">
            <Star className="h-3 w-3 mr-1" />
            {pkg.badge}
          </Badge>
        </div>
      )}

      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0">
          <GraduationCap className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0 pr-16">
          <h3 className="font-semibold text-slate-800 text-sm leading-tight">{pkg.title}</h3>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{pkg.description}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <span className="flex items-center gap-1 text-slate-700 font-semibold bg-slate-100 px-2 py-0.5 rounded-md">
          <FileText className="h-3.5 w-3.5 text-blue-600" />
          {pkg.questionCount} soal acak
          {pkg.totalBankQuestions && pkg.totalBankQuestions > 0 && (
            <span className="text-slate-400 font-normal">
              (dari {pkg.totalBankQuestions})
            </span>
          )}
        </span>
        <span className="flex items-center gap-1 text-slate-500">
          <Clock className="h-3.5 w-3.5" />
          {pkg.timeLimitMin} menit
        </span>
        <span className="flex items-center gap-1 text-slate-500">
          <BarChart3 className="h-3.5 w-3.5" />
          {pkg.category}
        </span>
        <span className={cn('px-2 py-0.5 rounded-full font-medium', difficultyColor(pkg.difficulty))}>
          {pkg.difficulty}
        </span>
      </div>

      <Separator className="my-4" />

      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">
          Nilai lulus: <span className="font-semibold text-slate-700">{pkg.passingGrade}</span>
        </p>
        <Button
          size="sm"
          onClick={() => onStart(pkg)}
          disabled={isLocked}
          className={cn(
            "bg-blue-600 hover:bg-blue-700 text-white",
            isLocked && "bg-slate-200 hover:bg-slate-200 text-slate-500 border border-slate-300 cursor-not-allowed"
          )}
        >
          {isLocked ? (
            <>
              <Lock className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
              Terkunci
            </>
          ) : (
            <>
              <PlayCircle className="h-3.5 w-3.5 mr-1.5" />
              Mulai Tryout
            </>
          )}
        </Button>
      </div>
    </Card>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function TryoutPage() {
  const router = useRouter()
  const [packages, setPackages] = useState<TryoutPackage[]>(TRYOUT_PACKAGES)
  const [history, setHistory] = useState<AttemptHistory[]>([])
  const [schedule, setSchedule] = useState<TryoutSchedule | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPkg, setSelectedPkg] = useState<TryoutPackage | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [starting, setStarting] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/tryout')
        if (res.ok) {
          const data = await res.json()
          if (data.packages && data.packages.length > 0) setPackages(data.packages)
          if (data.history) setHistory(data.history)
          if (data.tryoutSchedule) setSchedule(data.tryoutSchedule)
        }
      } catch (err) {
        console.error("Error loading tryout data:", err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleStart = (pkg: TryoutPackage) => {
    if (schedule && !schedule.isOpen) {
      toast.error(schedule.statusMessage || "Sesi ujian tryout saat ini belum dibuka oleh Admin / Pengawas.")
      return
    }
    setSelectedPkg(pkg)
    setDialogOpen(true)
  }

  const handleConfirm = async () => {
    if (!selectedPkg) return
    try {
      setStarting(true)
      const res = await fetch('/api/tryout/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: selectedPkg.category,
          questionCount: selectedPkg.questionCount,
          durationMinutes: selectedPkg.timeLimitMin,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        if (data.attemptId) {
          toast.info("Melanjutkan sesi ujian Anda yang belum selesai...")
          setDialogOpen(false)
          router.push(`/tryout/${data.attemptId}`)
          return
        }
        throw new Error(data.error || "Gagal memulai tryout")
      }

      setDialogOpen(false)
      toast.success("Sesi tryout berhasil dibuat!")
      router.push(`/tryout/${data.attemptId}`)
    } catch (err: any) {
      toast.error(err.message || "Gagal memulai sesi ujian")
    } finally {
      setStarting(false)
    }
  }

  const isTryoutLocked = schedule ? !schedule.isOpen : false

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 md:px-8">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tryout & Latihan Soal</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Persiapkan diri Anda untuk ujian kompetensi BAPETEN
          </p>
        </div>

        {/* Timing Banner */}
        {schedule && (
          <div>
            {schedule.isOpen ? (
              <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-emerald-950 flex items-start gap-3.5 shadow-sm">
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
                  <Clock className="h-5 w-5 animate-pulse" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <p className="font-bold text-emerald-900 text-sm md:text-base flex items-center gap-2">
                      Sesi Ujian Tryout Sedang Dibuka
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-600 text-white animate-pulse">
                        LIVE
                      </span>
                    </p>
                    <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white font-mono text-xs">
                      Tersisa ~{schedule.remainingMinutes} Menit
                    </Badge>
                  </div>
                  <p className="text-xs text-emerald-800 mt-1">
                    {schedule.statusMessage}
                  </p>
                  {schedule.batchName && (
                    <p className="text-[11px] text-emerald-700/80 mt-1 font-medium">
                      Pelatihan: {schedule.batchName}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-950 flex items-start gap-3.5 shadow-sm">
                <div className="p-2 rounded-lg bg-amber-100 text-amber-700 shrink-0">
                  <Lock className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <p className="font-bold text-amber-900 text-sm md:text-base flex items-center gap-1.5">
                      Sesi Ujian Tryout Belum / Tidak Dibuka
                    </p>
                    <Badge variant="outline" className="border-amber-400 text-amber-800 bg-amber-100/60 text-xs">
                      Akses Terkunci
                    </Badge>
                  </div>
                  <p className="text-xs text-amber-800 mt-1">
                    {schedule.statusMessage}
                  </p>
                  {schedule.batchName && (
                    <p className="text-[11px] text-amber-700/80 mt-1 font-medium">
                      Pelatihan: {schedule.batchName} • Hubungi admin/pengawas jika jadwal ujian telah tiba.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-xl bg-white border border-slate-200 p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-blue-600">{history.length}</p>
            <p className="text-xs text-slate-500 mt-1">Percobaan</p>
          </div>
          <div className="rounded-xl bg-white border border-slate-200 p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-emerald-600">
              {history.filter((a) => a.status === 'lulus').length}
            </p>
            <p className="text-xs text-slate-500 mt-1">Lulus</p>
          </div>
          <div className="rounded-xl bg-white border border-slate-200 p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-slate-700">
              {history.length > 0
                ? Math.round(history.reduce((a, b) => a + b.score, 0) / history.length)
                : '-'}
            </p>
            <p className="text-xs text-slate-500 mt-1">Rata-rata Skor</p>
          </div>
        </div>

        {/* Packages Grid */}
        <div>
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Paket Tryout Tersedia</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {packages.map((pkg) => (
              <PackageCard
                key={pkg.id}
                pkg={pkg}
                onStart={handleStart}
                isLocked={isTryoutLocked}
              />
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
          <Info className="h-5 w-5 shrink-0 mt-0.5 text-blue-500" />
          <p>
            Soal tryout bersumber dari bank soal tervalidasi yang mencerminkan materi ujian kompetensi
            BAPETEN. Nilai <strong>70</strong> ke atas dianggap lulus. Kerjakan tryout secara mandiri untuk
            mendapatkan hasil yang akurat.
          </p>
        </div>

        {/* History */}
        <div>
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Riwayat Percobaan
          </h2>
          {history.length === 0 ? (
            <div className="text-center py-10 text-slate-400 bg-white rounded-xl border border-slate-200">
              Belum ada riwayat percobaan ujian. Pilih salah satu paket tryout di atas untuk memulai!
            </div>
          ) : (
            <div className="rounded-xl bg-white border border-slate-200 overflow-hidden shadow-sm">
              {history.map((att, idx) => (
                <div key={att.id}>
                  {idx > 0 && <Separator />}
                  <div className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors">
                    {/* Score badge */}
                    <div
                      className={cn(
                        'h-12 w-12 rounded-xl flex items-center justify-center font-bold text-lg shrink-0',
                        att.score >= 70 ? 'bg-emerald-50' : 'bg-red-50',
                        scoreColor(att.score),
                      )}
                    >
                      {att.score}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 text-sm truncate">{att.packageTitle}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {att.date}
                        </span>
                        <span>{att.duration}</span>
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded-full font-semibold',
                            att.status === 'lulus'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-red-100 text-red-600',
                          )}
                        >
                          {att.status === 'lulus' ? '✓ LULUS' : '✗ Belum Lulus'}
                        </span>
                      </div>
                    </div>

                    <Link
                      href={`/tryout/${att.id}/hasil`}
                      className="inline-flex items-center text-sm font-medium text-slate-700 hover:text-slate-900 shrink-0 px-3 py-1.5 rounded-md hover:bg-slate-100 transition-colors"
                    >
                      Lihat Hasil
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Start confirmation dialog */}
      <StartDialog
        pkg={selectedPkg}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onStart={handleConfirm}
        starting={starting}
        isLocked={isTryoutLocked}
      />
    </div>
  )
}
