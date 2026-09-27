'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Users,
  Calendar,
  MapPin,
  ArrowLeft,
  Search,
  RefreshCw,
  FilePlus2,
  Award,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Clock,
  GraduationCap,
  Eye,
  Loader2,
  ExternalLink,
  Upload,
  Download,
  Trash2,
  Printer,
  FileCheck,
  Timer,
  Play,
  Square,
  Settings2,
  FileQuestion,
  FileText,
  CheckSquare,
  ListChecks,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

interface BatchItem {
  id: number;
  trainingId: number;
  batchNumber: number;
  startDate: string;
  endDate: string;
  quota: number;
  location: string | null;
  status: 'RENCANA' | 'PELAKSANAAN' | 'SELESAI';
  training: {
    title: string;
    category: string;
  };
  _count: {
    registrations: number;
  };
  tryoutOpen?: boolean;
  tryoutStartTime?: string | null;
  tryoutEndTime?: string | null;
  tryoutDurationMinutes?: number | null;
  tryoutQuestionCount?: number | null;
  tryoutSelectionMode?: string;
  activeQuestionsAvailable?: number;
  isLiveOpen?: boolean;
  instructorAssignments?: {
    id: number;
    sessionName: string;
    instructor: {
      user: { fullName: string };
    };
  }[];
}

interface ParticipantItem {
  registrationId: number;
  fullName: string;
  nik: string | null;
  email: string;
  phoneNumber: string | null;
  instansi: string;
  sponsorName: string | null;
  paymentStatus: string;
  registrationStatus: string;
  tryoutScore: number | null;
  bapetenTheory: number | null;
  bapetenPractical: number | null;
  bapetenInterview: number | null;
  finalStatus: string | null;
  certificateNumber: string | null;
  examResultId: number | null;
  signedCertificateUrl?: string | null;
  signedCertificateName?: string | null;
  signedUploadedAt?: string | null;
}

interface BatchReportListViewProps {
  status: 'PELAKSANAAN' | 'SELESAI';
  pageTitle: string;
  pageSubtitle: string;
}

export function BatchReportListView({
  status,
  pageTitle,
  pageSubtitle,
}: BatchReportListViewProps) {
  const [batches, setBatches] = useState<BatchItem[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [searchBatch, setSearchBatch] = useState('');

  // Selected batch for "Lihat Peserta"
  const [selectedBatch, setSelectedBatch] = useState<BatchItem | null>(null);
  const [participants, setParticipants] = useState<ParticipantItem[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [searchParticipant, setSearchParticipant] = useState('');

  // Edit exam score dialog state
  const [editingParticipant, setEditingParticipant] = useState<ParticipantItem | null>(null);
  const [theoryScore, setTheoryScore] = useState<string>('');
  const [practicalScore, setPracticalScore] = useState<string>('');
  const [interviewScore, setInterviewScore] = useState<string>('');
  const [finalStatus, setFinalStatus] = useState<string>('LULUS');
  const [savingScore, setSavingScore] = useState(false);

  // Upload signed certificate dialog state
  const [uploadingParticipant, setUploadingParticipant] = useState<ParticipantItem | null>(null);
  const [signedFile, setSignedFile] = useState<File | null>(null);
  const [uploadingSignedCert, setUploadingSignedCert] = useState(false);
  const [deletingSignedCert, setDeletingSignedCert] = useState(false);

  const openUploadDialog = (p: ParticipantItem) => {
    setUploadingParticipant(p);
    setSignedFile(null);
  };

  const handleUploadSignedCert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadingParticipant || !signedFile) {
      toast.error('Silakan pilih berkas sertifikat yang telah ditandatangani');
      return;
    }

    try {
      setUploadingSignedCert(true);
      const formData = new FormData();
      formData.append('registrationId', String(uploadingParticipant.registrationId));
      formData.append('file', signedFile);

      const res = await fetch('/api/admin/certificates/upload-signed', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Gagal mengunggah berkas');

      toast.success(json.message || 'Sertifikat bertandatangan basah berhasil diunggah!');
      setUploadingParticipant(null);
      setSignedFile(null);

      if (selectedBatch) {
        loadParticipants(selectedBatch.id);
      }
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan saat mengunggah berkas');
    } finally {
      setUploadingSignedCert(false);
    }
  };

  const handleDeleteSignedCert = async (registrationId: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus berkas sertifikat bertandatangan basah ini? Peserta tidak akan dapat mengunduhnya lagi hingga diunggah ulang.')) {
      return;
    }

    try {
      setDeletingSignedCert(true);
      const res = await fetch(`/api/admin/certificates/upload-signed?registrationId=${registrationId}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Gagal menghapus berkas');

      toast.success(json.message || 'Berkas berhasil dihapus');
      setUploadingParticipant(null);
      setSignedFile(null);

      if (selectedBatch) {
        loadParticipants(selectedBatch.id);
      }
    } catch (err: any) {
      toast.error(err.message || 'Gagal menghapus berkas');
    } finally {
      setDeletingSignedCert(false);
    }
  };

  // Fetch batches with target status
  const fetchBatches = useCallback(async () => {
    try {
      setLoadingBatches(true);
      const res = await fetch(`/api/admin/batch?status=${status}`);
      if (!res.ok) throw new Error('Gagal memuat daftar batch');
      const json = await res.json();
      setBatches(json.data || []);
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan saat memuat batch');
    } finally {
      setLoadingBatches(false);
    }
  }, [status]);

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  // Fetch participants for selected batch
  const loadParticipants = useCallback(async (batchId: number) => {
    try {
      setLoadingParticipants(true);
      const res = await fetch(`/api/admin/reports/batch-participants/${batchId}`);
      if (!res.ok) throw new Error('Gagal memuat peserta batch');
      const json = await res.json();
      setParticipants(json.participants || []);
      if (json.batch) {
        setSelectedBatch((prev) => (prev ? { ...prev, ...json.batch } : json.batch));
      }
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan memuat data peserta');
    } finally {
      setLoadingParticipants(false);
    }
  }, []);

  // Tryout timing dialog state
  const [timingBatch, setTimingBatch] = useState<BatchItem | null>(null);
  const [isTimingOpen, setIsTimingOpen] = useState(false);
  const [timingMode, setTimingMode] = useState<'QUICK' | 'SCHEDULE'>('QUICK');
  const [quickMinutes, setQuickMinutes] = useState<number>(60);
  const [targetQuestionCount, setTargetQuestionCount] = useState<number>(20);
  const [schedStartTime, setSchedStartTime] = useState<string>('');
  const [schedEndTime, setSchedEndTime] = useState<string>('');
  const [savingTiming, setSavingTiming] = useState(false);

  const openTimingModal = (b: BatchItem) => {
    setTimingBatch(b);
    setQuickMinutes(b.tryoutDurationMinutes || 60);
    setTargetQuestionCount(b.tryoutQuestionCount || 20);
    const now = new Date();
    const startStr = b.tryoutStartTime
      ? new Date(new Date(b.tryoutStartTime).getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
      : new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    const endStr = b.tryoutEndTime
      ? new Date(new Date(b.tryoutEndTime).getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
      : new Date(now.getTime() - now.getTimezoneOffset() * 60000 + 60 * 60000).toISOString().slice(0, 16);
    setSchedStartTime(startStr);
    setSchedEndTime(endStr);
    setIsTimingOpen(true);
  };

  const handleUpdateTryoutTiming = async (action: 'OPEN_NOW' | 'CLOSE_NOW' | 'SCHEDULE', duration?: number) => {
    if (!timingBatch) return;
    try {
      setSavingTiming(true);
      const payload: any = { action, questionCount: targetQuestionCount };
      if (action === 'OPEN_NOW') {
        payload.durationMinutes = duration || quickMinutes;
      } else if (action === 'SCHEDULE') {
        payload.startTime = new Date(schedStartTime).toISOString();
        payload.endTime = new Date(schedEndTime).toISOString();
      }

      const res = await fetch(`/api/admin/batch/${timingBatch.id}/tryout-timing`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Gagal memperbarui waktu tryout');

      toast.success(json.message);
      setIsTimingOpen(false);
      fetchBatches();
      if (selectedBatch && selectedBatch.id === timingBatch.id) {
        loadParticipants(timingBatch.id);
      }
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan');
    } finally {
      setSavingTiming(false);
    }
  };

  const handleQuickCloseTryout = async (batch: BatchItem) => {
    try {
      const res = await fetch(`/api/admin/batch/${batch.id}/tryout-timing`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CLOSE_NOW' }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Gagal menutup sesi tryout');
      toast.success(json.message);
      fetchBatches();
      if (selectedBatch && selectedBatch.id === batch.id) {
        loadParticipants(batch.id);
      }
    } catch (err: any) {
      toast.error(err.message || 'Gagal menutup sesi tryout');
    }
  };

  const handleQuickOpenTryout = async (batch: BatchItem, minutes: number = 60) => {
    try {
      const res = await fetch(`/api/admin/batch/${batch.id}/tryout-timing`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'OPEN_NOW',
          durationMinutes: minutes,
          questionCount: batch.tryoutQuestionCount || 20,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Gagal membuka sesi tryout');
      toast.success(json.message);
      fetchBatches();
      if (selectedBatch && selectedBatch.id === batch.id) {
        loadParticipants(batch.id);
      }
    } catch (err: any) {
      toast.error(err.message || 'Gagal membuka sesi tryout');
    }
  };

  // Manual question selection state & handlers
  const [isQuestionSelectorOpen, setIsQuestionSelectorOpen] = useState(false);
  const [selectorBatch, setSelectorBatch] = useState<BatchItem | null>(null);
  const [availableQuestions, setAvailableQuestions] = useState<any[]>([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<number[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [savingQuestions, setSavingQuestions] = useState(false);
  const [searchQText, setSearchQText] = useState('');
  const [filterQTopic, setFilterQTopic] = useState('ALL');

  const openQuestionSelectorModal = async (batch: BatchItem) => {
    setSelectorBatch(batch);
    setIsQuestionSelectorOpen(true);
    setSearchQText('');
    setFilterQTopic('ALL');
    try {
      setLoadingQuestions(true);
      const res = await fetch(`/api/admin/batch/${batch.id}/tryout-questions`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Gagal memuat bank soal');
      setAvailableQuestions(json.questions || []);
      setSelectedQuestionIds(json.selectedQuestionIds || []);
    } catch (err: any) {
      toast.error(err.message || 'Gagal memuat bank soal batch');
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleToggleQuestion = (id: number) => {
    setSelectedQuestionIds((prev) =>
      prev.includes(id) ? prev.filter((qId) => qId !== id) : [...prev, id]
    );
  };

  const handleSelectTopNQuestions = (n: number) => {
    const ids = availableQuestions.slice(0, n).map((q) => q.id);
    setSelectedQuestionIds(ids);
  };

  const handleSelectAllFilteredQuestions = (filtered: any[]) => {
    const ids = filtered.map((q) => q.id);
    setSelectedQuestionIds((prev) => Array.from(new Set([...prev, ...ids])));
  };

  const handleClearSelectedQuestions = () => {
    setSelectedQuestionIds([]);
  };

  const handleSaveSelectedQuestions = async (mode: 'AUTOMATIC' | 'MANUAL') => {
    if (!selectorBatch) return;
    try {
      setSavingQuestions(true);
      const res = await fetch(`/api/admin/batch/${selectorBatch.id}/tryout-questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          questionIds: mode === 'MANUAL' ? selectedQuestionIds : [],
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Gagal menyimpan pilihan soal');

      toast.success(json.message);
      setIsQuestionSelectorOpen(false);
      fetchBatches();
      if (selectedBatch && selectedBatch.id === selectorBatch.id) {
        loadParticipants(selectorBatch.id);
      }
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan');
    } finally {
      setSavingQuestions(false);
    }
  };

  const handleDownloadTryoutPdf = (batchId: number) => {
    window.open(`/api/admin/batch/${batchId}/tryout-pdf`, '_blank');
  };

  const handleSelectBatch = (batch: BatchItem) => {
    setSelectedBatch(batch);
    setSearchParticipant('');
    loadParticipants(batch.id);
  };

  const handleBackToBatches = () => {
    setSelectedBatch(null);
    setParticipants([]);
    fetchBatches();
  };

  // Open Edit Exam Score Dialog
  const openScoreDialog = (p: ParticipantItem) => {
    setEditingParticipant(p);
    setTheoryScore(p.bapetenTheory != null ? String(p.bapetenTheory) : '');
    setPracticalScore(p.bapetenPractical != null ? String(p.bapetenPractical) : '');
    setInterviewScore(p.bapetenInterview != null ? String(p.bapetenInterview) : '');
    setFinalStatus(p.finalStatus || 'LULUS');
  };

  // Auto-calculate suggested finalStatus based on scores
  const handleScoreChange = (type: 'theory' | 'practical', val: string) => {
    const tVal = type === 'theory' ? parseFloat(val) : parseFloat(theoryScore);
    const pVal = type === 'practical' ? parseFloat(val) : parseFloat(practicalScore);

    if (type === 'theory') setTheoryScore(val);
    if (type === 'practical') setPracticalScore(val);

    if (!isNaN(tVal) && !isNaN(pVal)) {
      if (tVal >= 70 && pVal >= 70) {
        setFinalStatus('LULUS');
      } else if (tVal < 55 || pVal < 55) {
        setFinalStatus('TIDAK_LULUS');
      } else {
        setFinalStatus('REMIDIAL');
      }
    }
  };

  const handleSaveExamScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingParticipant) return;

    try {
      setSavingScore(true);
      const payload = {
        bapetenTheory: theoryScore !== '' ? parseFloat(theoryScore) : null,
        bapetenPractical: practicalScore !== '' ? parseFloat(practicalScore) : null,
        bapetenInterview: interviewScore !== '' ? parseFloat(interviewScore) : null,
        finalStatus,
      };

      const res = await fetch(`/api/admin/exam-results/${editingParticipant.registrationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Gagal menyimpan nilai');

      toast.success(`Nilai BAPETEN untuk ${editingParticipant.fullName} berhasil disimpan`);
      setEditingParticipant(null);

      // Refresh participant list
      if (selectedBatch) {
        loadParticipants(selectedBatch.id);
      }
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan saat menyimpan nilai');
    } finally {
      setSavingScore(false);
    }
  };

  const filteredBatches = batches.filter((b) => {
    const q = searchBatch.toLowerCase();
    return (
      b.training.title.toLowerCase().includes(q) ||
      `batch ${b.batchNumber}`.toLowerCase().includes(q) ||
      (b.location && b.location.toLowerCase().includes(q))
    );
  });

  const filteredParticipants = participants.filter((p) => {
    const q = searchParticipant.toLowerCase();
    return (
      p.fullName.toLowerCase().includes(q) ||
      (p.nik && p.nik.toLowerCase().includes(q)) ||
      p.instansi.toLowerCase().includes(q) ||
      (p.sponsorName && p.sponsorName.toLowerCase().includes(q))
    );
  });

  const totalRegisteredAll = batches.reduce((acc, b) => acc + (b._count?.registrations || 0), 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* ─── Top Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          {selectedBatch ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToBatches}
              className="gap-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-0 mb-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Daftar {pageTitle}
            </Button>
          ) : null}
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <GraduationCap className="w-7 h-7 text-blue-600" />
            {selectedBatch
              ? `Peserta: ${selectedBatch.training.title} (Batch ${selectedBatch.batchNumber})`
              : pageTitle}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {selectedBatch
              ? `Rekapitulasi kelulusan & penilaian BAPETEN peserta batch ${selectedBatch.batchNumber}`
              : pageSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedBatch ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadParticipants(selectedBatch.id)}
              disabled={loadingParticipants}
              className="gap-1.5"
            >
              <RefreshCw className={cn('w-4 h-4', loadingParticipants && 'animate-spin')} />
              Segarkan Peserta
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={fetchBatches}
              disabled={loadingBatches}
              className="gap-1.5"
            >
              <RefreshCw className={cn('w-4 h-4', loadingBatches && 'animate-spin')} />
              Segarkan
            </Button>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* VIEW 1: DAFTAR BATCH (JIKA BELUM MEMILIH LIHAT PESERTA)                 */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      {!selectedBatch ? (
        <div className="space-y-6">
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border border-slate-200 shadow-xs">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Total Batch {status === 'PELAKSANAAN' ? 'Pelaksanaan' : 'Arsip'}</p>
                  <p className="text-xl font-bold text-slate-900">{batches.length}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 shadow-xs">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Total Peserta Terdaftar</p>
                  <p className="text-xl font-bold text-slate-900">{totalRegisteredAll}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 shadow-xs">
              <CardContent className="p-4 flex items-center gap-3">
                <div
                  className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center',
                    status === 'PELAKSANAAN'
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-slate-100 text-slate-600'
                  )}
                >
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Status Modul</p>
                  <Badge
                    className={cn(
                      'text-xs mt-0.5',
                      status === 'PELAKSANAAN'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-600 text-white'
                    )}
                  >
                    {status === 'PELAKSANAAN' ? 'Sedang Berjalan (Pelaksanaan)' : 'Selesai (Arsip Lembaga)'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search bar */}
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Cari nama pelatihan atau batch..."
                value={searchBatch}
                onChange={(e) => setSearchBatch(e.target.value)}
                className="pl-9 text-sm"
              />
            </div>
            <div className="text-xs text-slate-500">
              Menampilkan {filteredBatches.length} dari {batches.length} batch
            </div>
          </div>

          {/* Batches Grid */}
          {loadingBatches ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-56 rounded-xl" />
              ))}
            </div>
          ) : filteredBatches.length === 0 ? (
            <Card className="p-12 text-center text-slate-400">
              <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-semibold text-slate-700">Tidak ada batch ditemukan</p>
              <p className="text-xs text-slate-500 mt-1">
                {status === 'PELAKSANAAN'
                  ? 'Belum ada batch dengan status Pelaksanaan di sistem'
                  : 'Belum ada batch dengan status Selesai yang diarsipkan'}
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredBatches.map((batch) => {
                const enrolled = batch._count.registrations;
                const fillPct = Math.min(100, Math.round((enrolled / (batch.quota || 1)) * 100));

                return (
                  <Card
                    key={batch.id}
                    className="border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
                  >
                    <div>
                      {/* Card Top */}
                      <div className="p-5 pb-3 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                            Batch {batch.batchNumber}
                          </Badge>
                          <Badge
                            className={cn(
                              'text-xs font-semibold',
                              batch.status === 'PELAKSANAAN'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            )}
                          >
                            {batch.status === 'PELAKSANAAN' ? 'Pelaksanaan' : 'Selesai'}
                          </Badge>
                        </div>

                        <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-2">
                          {batch.training.title}
                        </h3>

                        {/* Dates & Location */}
                        <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>
                              {format(new Date(batch.startDate), 'dd MMM yyyy', { locale: localeId })} -{' '}
                              {format(new Date(batch.endDate), 'dd MMM yyyy', { locale: localeId })}
                            </span>
                          </div>
                          {batch.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">{batch.location}</span>
                            </div>
                          )}
                        </div>

                        {/* Quota Progress */}
                        <div className="space-y-1 pt-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500 flex items-center gap-1">
                              <Users className="w-3 h-3" /> Peserta:
                            </span>
                            <span className="font-semibold text-slate-800">
                              {enrolled} / {batch.quota} orang ({fillPct}%)
                            </span>
                          </div>
                          <Progress value={fillPct} className="h-1.5" />
                        </div>
                        {/* Tryout Exam Status Badge */}
                        <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                          <span className="text-slate-500 flex items-center gap-1">
                            <Timer className="w-3.5 h-3.5 text-slate-400" /> Ujian Tryout:
                          </span>
                          {batch.isLiveOpen ? (
                            <Badge className="bg-emerald-100 text-emerald-800 border-none font-semibold text-[11px]">
                              🟢 Dibuka ({batch.tryoutQuestionCount || 20} Soal) s/d {batch.tryoutEndTime ? format(new Date(batch.tryoutEndTime), 'HH:mm', { locale: localeId }) : ''} WIB
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-slate-500 bg-slate-50 border-slate-200 text-[11px]">
                              🔴 Ditutup ({batch.tryoutQuestionCount || 20} Soal)
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Card Footer / Action */}
                    <div className="p-5 pt-3 border-t border-slate-100 bg-slate-50/50 flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openTimingModal(batch)}
                        className="text-xs text-slate-700 border-slate-200 hover:bg-white shrink-0"
                        title="Atur Waktu Ujian Tryout"
                      >
                        <Timer className="w-3.5 h-3.5 mr-1 text-blue-600" />
                        Atur Tryout
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadTryoutPdf(batch.id)}
                        className="text-xs text-emerald-700 border-emerald-200 hover:bg-emerald-50 shrink-0"
                        title="Unduh / Cetak Naskah Soal Ujian (PDF)"
                      >
                        <Download className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                        PDF Soal
                      </Button>
                      <Button
                        onClick={() => handleSelectBatch(batch)}
                        className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-xs text-xs"
                      >
                        <Eye className="w-4 h-4" />
                        Lihat Peserta ({enrolled})
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* ─────────────────────────────────────────────────────────────────── */
        /* VIEW 2: DETAIL PESERTA & REKAP NILAI BAPETEN (SEPERTI REKAP HASIL)   */
        /* ─────────────────────────────────────────────────────────────────── */
        <div className="space-y-6">
          {/* Batch Info Card */}
          <Card className="border border-slate-200 bg-gradient-to-r from-blue-900 to-indigo-900 text-white shadow-md">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-white/20 text-white border-0 text-xs">
                      Batch ke-{selectedBatch.batchNumber}
                    </Badge>
                    <Badge
                      className={cn(
                        'text-xs font-semibold',
                        selectedBatch.status === 'PELAKSANAAN'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-400 text-white'
                      )}
                    >
                      Status: {selectedBatch.status === 'PELAKSANAAN' ? 'Pelaksanaan' : 'Selesai'}
                    </Badge>
                  </div>
                  <h2 className="text-xl font-bold">{selectedBatch.training.title}</h2>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-blue-200 pt-1">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {format(new Date(selectedBatch.startDate), 'dd MMMM yyyy', { locale: localeId })} -{' '}
                      {format(new Date(selectedBatch.endDate), 'dd MMMM yyyy', { locale: localeId })}
                    </span>
                    {selectedBatch.location && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        {selectedBatch.location}
                      </span>
                    )}
                  </div>
                </div>

                <div className="bg-white/10 rounded-xl p-4 border border-white/10 text-center shrink-0">
                  <span className="text-xs text-blue-200 block">Total Peserta Terdaftar:</span>
                  <span className="text-2xl font-bold text-white font-mono">
                    {participants.length} / {selectedBatch.quota}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tryout Timing Control Banner */}
          <Card className="border border-slate-200 bg-white p-4.5 rounded-xl shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'p-3 rounded-xl shrink-0',
                    selectedBatch.isLiveOpen ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                  )}
                >
                  <Timer className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-slate-900">Sesi Ujian Tryout Peserta</span>
                    {selectedBatch.isLiveOpen ? (
                      <Badge className="bg-emerald-100 text-emerald-800 border-none font-semibold text-xs">
                        🟢 Sedang Dibuka (Aktif)
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200 font-semibold text-xs">
                        🔴 Ditutup (Default)
                      </Badge>
                    )}
                    {selectedBatch.tryoutSelectionMode === 'MANUAL' ? (
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 font-semibold text-xs flex items-center gap-1">
                        <ListChecks className="w-3 h-3 text-purple-600" />
                        Mode Manual ({selectedBatch.tryoutQuestionCount || 0} Soal Pilihan)
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-semibold text-xs flex items-center gap-1">
                        <FileQuestion className="w-3 h-3 text-blue-600" />
                        Mode Otomatis ({selectedBatch.tryoutQuestionCount || 20} Soal Acak)
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {selectedBatch.isLiveOpen && selectedBatch.tryoutEndTime ? (
                      <>
                        Akses ujian terbuka ({selectedBatch.tryoutQuestionCount || 20} butir soal{' '}
                        {selectedBatch.tryoutSelectionMode === 'MANUAL' ? 'pilihan admin' : 'diacak otomatis'}) hingga pukul{' '}
                        <strong>
                          {format(new Date(selectedBatch.tryoutEndTime), 'HH:mm', { locale: localeId })} WIB
                        </strong>{' '}
                        ({format(new Date(selectedBatch.tryoutEndTime), 'dd MMM yyyy', { locale: localeId })}). Sesi akan otomatis tertutup begitu batas waktu tercapai.
                      </>
                    ) : (
                      `Secara default akses ujian tryout ditutup (${selectedBatch.tryoutQuestionCount || 20} butir soal ${selectedBatch.tryoutSelectionMode === 'MANUAL' ? 'pilihan manual' : 'acak'}). Buka sesi ujian saat peserta siap memulai tryout kompetensi.`
                    )}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {selectedBatch.isLiveOpen ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickCloseTryout(selectedBatch)}
                    className="text-red-600 border-red-200 hover:bg-red-50 text-xs h-9"
                  >
                    <Square className="w-3.5 h-3.5 mr-1.5 fill-red-600" />
                    Tutup Ujian Sekarang
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleQuickOpenTryout(selectedBatch, 60)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 shadow-xs"
                  >
                    <Play className="w-3.5 h-3.5 mr-1.5 fill-white" />
                    Buka 60 Menit
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openQuestionSelectorModal(selectedBatch)}
                  className="text-purple-700 border-purple-200 hover:bg-purple-50 text-xs h-9"
                  title="Pilih Butir Soal Spesifik untuk Batch Ini"
                >
                  <ListChecks className="w-3.5 h-3.5 mr-1.5 text-purple-600" />
                  Pilih Butir Soal
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadTryoutPdf(selectedBatch.id)}
                  className="text-emerald-700 border-emerald-200 hover:bg-emerald-50 text-xs h-9"
                  title="Unduh / Cetak Naskah Soal Ujian (PDF)"
                >
                  <Download className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                  Naskah Soal (PDF)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openTimingModal(selectedBatch)}
                  className="text-slate-700 border-slate-200 hover:bg-slate-50 text-xs h-9"
                >
                  <Settings2 className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                  Atur Jadwal / Durasi...
                </Button>
              </div>
            </div>
          </Card>

          {/* Participants Table Card */}
          <Card className="border border-slate-200 shadow-sm">
            <CardHeader className="py-4 px-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base font-semibold text-slate-800">
                  Daftar Peserta Pelatihan & Rekap Nilai BAPETEN
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Klik tombol <FilePlus2 className="w-3.5 h-3.5 inline text-slate-500 mx-0.5" /> untuk menginput/memperbarui nilai ujian BAPETEN peserta.
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Cari nama atau NIK..."
                  value={searchParticipant}
                  onChange={(e) => setSearchParticipant(e.target.value)}
                  className="pl-9 h-9 text-sm"
                />
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {loadingParticipants ? (
                <div className="p-6 space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : filteredParticipants.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="font-semibold text-slate-700">Tidak ada peserta ditemukan</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {searchParticipant
                      ? 'Tidak ada peserta yang cocok dengan kata kunci pencarian Anda'
                      : 'Belum ada peserta yang terdaftar pada batch ini'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 text-xs uppercase">
                        <TableHead className="w-10 text-center">No</TableHead>
                        <TableHead>Nama Peserta</TableHead>
                        <TableHead>Perusahaan / Instansi</TableHead>
                        <TableHead className="text-center">Tryout</TableHead>
                        <TableHead className="text-center">Teori</TableHead>
                        <TableHead className="text-center">Praktik</TableHead>
                        <TableHead className="text-center">Wawancara</TableHead>
                        <TableHead className="text-center">Status Kelulusan</TableHead>
                        <TableHead>No. Sertifikat</TableHead>
                        <TableHead className="text-center w-56">
                          Aksi
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-slate-100">
                      {filteredParticipants.map((row, idx) => (
                        <TableRow key={row.registrationId} className="hover:bg-slate-50/70">
                          <TableCell className="text-center text-slate-400 text-xs">
                            {idx + 1}
                          </TableCell>

                          <TableCell>
                            <div className="font-semibold text-slate-900 text-sm">
                              {row.fullName}
                            </div>
                            {row.nik && (
                              <div className="text-xs text-slate-400 font-mono">
                                NIK: {row.nik}
                              </div>
                            )}
                          </TableCell>

                          <TableCell className="text-xs text-slate-600">
                            <div>{row.sponsorName || row.instansi || '-'}</div>
                          </TableCell>

                          {/* Tryout */}
                          <TableCell className="text-center text-sm font-mono">
                            {row.tryoutScore != null ? (
                              <span
                                className={cn(
                                  'font-bold',
                                  row.tryoutScore >= 70 ? 'text-emerald-600' : 'text-red-500'
                                )}
                              >
                                {row.tryoutScore}
                              </span>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </TableCell>

                          {/* Teori */}
                          <TableCell className="text-center text-sm font-mono">
                            {row.bapetenTheory != null ? (
                              <span
                                className={cn(
                                  'font-bold',
                                  row.bapetenTheory >= 70 ? 'text-emerald-600' : 'text-red-500'
                                )}
                              >
                                {row.bapetenTheory}
                              </span>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </TableCell>

                          {/* Praktik */}
                          <TableCell className="text-center text-sm font-mono">
                            {row.bapetenPractical != null ? (
                              <span
                                className={cn(
                                  'font-bold',
                                  row.bapetenPractical >= 70 ? 'text-emerald-600' : 'text-red-500'
                                )}
                              >
                                {row.bapetenPractical}
                              </span>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </TableCell>

                          {/* Wawancara */}
                          <TableCell className="text-center text-sm font-mono">
                            {row.bapetenInterview != null ? (
                              <span className="font-semibold text-slate-700">
                                {row.bapetenInterview}
                              </span>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </TableCell>

                          {/* Final Status */}
                          <TableCell className="text-center">
                            {row.finalStatus === 'LULUS' ? (
                              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-xs">
                                Lulus
                              </Badge>
                            ) : row.finalStatus === 'REMIDIAL' ? (
                              <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 text-xs">
                                Remidial
                              </Badge>
                            ) : row.finalStatus === 'TIDAK_LULUS' ? (
                              <Badge className="bg-red-100 text-red-700 hover:bg-red-100 text-xs">
                                Tidak Lulus
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-slate-500 text-xs">
                                Menunggu
                              </Badge>
                            )}
                          </TableCell>

                          {/* Certificate & TTD Basah Status */}
                          <TableCell className="text-xs">
                            {row.certificateNumber ? (
                              <div className="space-y-1">
                                <span className="font-mono text-blue-600 font-medium block">
                                  {row.certificateNumber}
                                </span>
                                {row.signedCertificateUrl ? (
                                  <a
                                    href={row.signedCertificateUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    download={row.signedCertificateName || 'Sertifikat_TTD_Basah.pdf'}
                                    className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-medium hover:bg-emerald-100 transition-colors"
                                    title="Klik untuk melihat/mengunduh berkas fisik tanda tangan basah"
                                  >
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    <span>TTD Basah Terupload</span>
                                  </a>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded font-medium">
                                    <Clock className="w-2.5 h-2.5 text-amber-600" />
                                    <span>Belum TTD Basah</span>
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </TableCell>

                          {/* Action: Input Nilai BAPETEN / Unduh / Upload Ulang Sertifikat TTD Basah */}
                          <TableCell className="text-center">
                            {status === 'SELESAI' ? (
                              <div className="flex items-center justify-center gap-1.5 flex-wrap">
                                {row.certificateNumber ? (
                                  <>
                                    <Link
                                      href={`/verify/${encodeURIComponent(row.certificateNumber)}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 gap-1 text-xs text-blue-700 bg-blue-50 border-blue-200 hover:bg-blue-100 hover:text-blue-800 font-medium"
                                        title={`Lihat / Unduh Dokumen Sertifikat: ${row.certificateNumber}`}
                                      >
                                        <Printer className="w-3.5 h-3.5 text-blue-600" />
                                        <span>Sertifikat</span>
                                      </Button>
                                    </Link>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => openUploadDialog(row)}
                                      className={cn(
                                        "h-8 gap-1 text-xs font-medium",
                                        row.signedCertificateUrl
                                          ? "text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
                                          : "text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100"
                                      )}
                                      title={row.signedCertificateUrl ? "Upload Ulang Berkas Sertifikat TTD Basah" : "Upload Berkas Sertifikat TTD Basah"}
                                    >
                                      <Upload className="w-3.5 h-3.5" />
                                      <span>{row.signedCertificateUrl ? "Upload Ulang" : "Upload TTD"}</span>
                                    </Button>
                                  </>
                                ) : (
                                  <span className="text-[11px] text-slate-400 italic">Belum terbit</span>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center justify-center gap-1.5 flex-wrap">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openScoreDialog(row)}
                                  className="h-8 gap-1.5 text-xs text-blue-600 border-blue-200 hover:bg-blue-50 font-medium"
                                  title="Input / Perbarui Nilai Ujian BAPETEN"
                                >
                                  <FilePlus2 className="w-3.5 h-3.5" />
                                  Nilai
                                </Button>

                                {row.certificateNumber && (
                                  <>
                                    <Link
                                      href={`/verify/${encodeURIComponent(row.certificateNumber)}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 gap-1 text-xs text-slate-700 bg-slate-50 border-slate-200 hover:bg-slate-100 font-medium"
                                        title="Unduh / Cetak Dokumen Sertifikat untuk Ditandatangani Basah"
                                      >
                                        <Printer className="w-3.5 h-3.5 text-slate-600" />
                                        <span>Unduh</span>
                                      </Button>
                                    </Link>

                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => openUploadDialog(row)}
                                      className={cn(
                                        "h-8 gap-1 text-xs font-medium",
                                        row.signedCertificateUrl
                                          ? "text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
                                          : "text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100"
                                      )}
                                      title={row.signedCertificateUrl ? "Upload Ulang Berkas Sertifikat TTD Basah" : "Upload Berkas Sertifikat TTD Basah"}
                                    >
                                      <Upload className="w-3.5 h-3.5" />
                                      <span>{row.signedCertificateUrl ? "Upload Ulang" : "Upload TTD"}</span>
                                    </Button>
                                  </>
                                )}
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ─── Modal Form Input Nilai BAPETEN ─── */}
      <Dialog
        open={!!editingParticipant}
        onOpenChange={(open) => !open && setEditingParticipant(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FilePlus2 className="w-5 h-5 text-blue-600" />
              Input Nilai Ujian BAPETEN
            </DialogTitle>
          </DialogHeader>

          {editingParticipant && (
            <form onSubmit={handleSaveExamScore} className="space-y-4 py-2">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-0.5">
                <p className="font-semibold text-slate-900 text-sm">
                  {editingParticipant.fullName}
                </p>
                <p className="text-xs text-slate-500">
                  {editingParticipant.instansi || editingParticipant.sponsorName || '-'}
                  {editingParticipant.nik ? ` (NIK: ${editingParticipant.nik})` : ''}
                </p>
                {editingParticipant.tryoutScore != null && (
                  <p className="text-xs text-emerald-600 font-medium pt-1">
                    Skor Tryout Mandiri: {editingParticipant.tryoutScore}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="theory" className="text-xs font-semibold text-slate-700">
                    Nilai Teori (BAPETEN) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="theory"
                    type="number"
                    min={0}
                    max={100}
                    step="0.1"
                    placeholder="0 - 100"
                    value={theoryScore}
                    onChange={(e) => handleScoreChange('theory', e.target.value)}
                    required
                  />
                  <span className="text-[10px] text-slate-400">Minimal kelulusan: 70.0</span>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="practical" className="text-xs font-semibold text-slate-700">
                    Nilai Praktik (BAPETEN) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="practical"
                    type="number"
                    min={0}
                    max={100}
                    step="0.1"
                    placeholder="0 - 100"
                    value={practicalScore}
                    onChange={(e) => handleScoreChange('practical', e.target.value)}
                    required
                  />
                  <span className="text-[10px] text-slate-400">Minimal kelulusan: 70.0</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="interview" className="text-xs font-semibold text-slate-700">
                  Nilai Wawancara (Opsional)
                </Label>
                <Input
                  id="interview"
                  type="number"
                  min={0}
                  max={100}
                  step="0.1"
                  placeholder="0 - 100"
                  value={interviewScore}
                  onChange={(e) => setInterviewScore(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">
                  Status Kelulusan Akhir <span className="text-red-500">*</span>
                </Label>
                <Select value={finalStatus} onValueChange={(val) => { if (val) setFinalStatus(val); }}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LULUS">
                      <span className="text-emerald-700 font-semibold">LULUS (Terbitkan Sertifikat)</span>
                    </SelectItem>
                    <SelectItem value="REMIDIAL">
                      <span className="text-amber-700 font-semibold">REMIDIAL (Perlu Ujian Ulang)</span>
                    </SelectItem>
                    <SelectItem value="TIDAK_LULUS">
                      <span className="text-red-700 font-semibold">TIDAK LULUS</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter className="gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingParticipant(null)}
                  disabled={savingScore}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={savingScore} className="bg-blue-600 hover:bg-blue-700">
                  {savingScore && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Simpan Nilai BAPETEN
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── Modal Upload / Upload Ulang Sertifikat TTD Basah ─── */}
      <Dialog
        open={!!uploadingParticipant}
        onOpenChange={(open) => !open && setUploadingParticipant(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
              <Upload className="w-5 h-5 text-blue-600" />
              {uploadingParticipant?.signedCertificateUrl ? 'Upload Ulang Sertifikat TTD Basah' : 'Upload Sertifikat TTD Basah'}
            </DialogTitle>
          </DialogHeader>

          {uploadingParticipant && (
            <form onSubmit={handleUploadSignedCert} className="space-y-4 py-2">
              {/* Info Peserta */}
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200/80 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Nama Peserta:</span>
                  <span className="font-semibold text-slate-900">{uploadingParticipant.fullName}</span>
                </div>
                {uploadingParticipant.nik && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">NIK:</span>
                    <span className="font-mono text-slate-700">{uploadingParticipant.nik}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">No. Sertifikat:</span>
                  <span className="font-mono font-bold text-blue-600">{uploadingParticipant.certificateNumber || '-'}</span>
                </div>
              </div>

              {/* Status File Saat Ini (Jika Ada) */}
              {uploadingParticipant.signedCertificateUrl && (
                <div className="p-3 bg-emerald-50/90 rounded-lg border border-emerald-200 text-xs flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      Berkas Saat Ini Tersimpan
                    </div>
                    <p className="text-[11px] text-emerald-700 truncate max-w-[200px]">
                      {uploadingParticipant.signedCertificateName || 'Sertifikat_TTD_Basah.pdf'}
                    </p>
                    {uploadingParticipant.signedUploadedAt && (
                      <p className="text-[10px] text-emerald-600">
                        Diunggah: {format(new Date(uploadingParticipant.signedUploadedAt), 'dd MMM yyyy, HH:mm', { locale: localeId })}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <a
                      href={uploadingParticipant.signedCertificateUrl}
                      download={uploadingParticipant.signedCertificateName || 'Sertifikat_TTD_Basah.pdf'}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button type="button" size="sm" variant="outline" className="h-7 text-xs bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-100">
                        <Download className="w-3 h-3 mr-1" /> Unduh
                      </Button>
                    </a>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteSignedCert(uploadingParticipant.registrationId)}
                      disabled={deletingSignedCert}
                      className="h-7 text-xs bg-white text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                      title="Hapus berkas sertifikat ini"
                    >
                      {deletingSignedCert ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                    </Button>
                  </div>
                </div>
              )}

              {/* Input File Baru */}
              <div className="space-y-1.5">
                <Label htmlFor="signedFile" className="text-xs font-semibold text-slate-700 block">
                  {uploadingParticipant.signedCertificateUrl ? 'Pilih Berkas Pengganti (PDF / Scan Gambar)' : 'Unggah Berkas Sertifikat Bertandatangan Basah (PDF / Gambar)'} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="signedFile"
                  type="file"
                  accept=".pdf,image/png,image/jpeg,image/jpg"
                  onChange={(e) => setSignedFile(e.target.files?.[0] || null)}
                  className="text-xs file:text-xs file:bg-blue-50 file:text-blue-700 file:border-0 file:rounded file:px-2 file:py-1 file:mr-2 cursor-pointer"
                  required
                />
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Format yang didukung: <strong>.PDF, .JPG, .PNG</strong> (Maksimal 20 MB). Berkas yang diunggah akan langsung dapat diunduh oleh peserta di laman sertifikat mereka.
                </p>
              </div>

              <DialogFooter className="gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setUploadingParticipant(null)}
                  disabled={uploadingSignedCert}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={uploadingSignedCert || !signedFile}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {uploadingSignedCert && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {uploadingParticipant.signedCertificateUrl ? 'Simpan & Ganti Berkas' : 'Unggah & Publikasikan ke Peserta'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* DIALOG 3: PENGATURAN WAKTU UJIAN TRYOUT                             */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <Dialog open={isTimingOpen} onOpenChange={setIsTimingOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
              <Timer className="w-5 h-5 text-blue-600" />
              Pengaturan Waktu Ujian Tryout
            </DialogTitle>
            <DialogDescription>
              {timingBatch ? `Batch ${timingBatch.batchNumber} - ${timingBatch.training.title}` : ''}
            </DialogDescription>
          </DialogHeader>

          {timingBatch && (
            <div className="space-y-4 py-2">
              {/* Status Box */}
              <div
                className={cn(
                  'p-3.5 rounded-xl border text-xs space-y-1.5',
                  timingBatch.isLiveOpen
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                )}
              >
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1.5">
                    {timingBatch.isLiveOpen ? (
                      <>
                        <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        Sesi Tryout Sedang Dibuka (Aktif)
                      </>
                    ) : (
                      <>
                        <span className="inline-block w-2.5 h-2.5 rounded-full bg-slate-400" />
                        Sesi Tryout Sedang Ditutup (Default)
                      </>
                    )}
                  </span>
                  {timingBatch.isLiveOpen && timingBatch.tryoutEndTime && (
                    <Badge variant="outline" className="text-emerald-700 bg-white border-emerald-300 font-mono text-[10px]">
                      Hingga {format(new Date(timingBatch.tryoutEndTime), 'HH:mm', { locale: localeId })} WIB
                    </Badge>
                  )}
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  {timingBatch.isLiveOpen && timingBatch.tryoutEndTime
                    ? `Peserta dapat memulai dan mengerjakan tryout hingga pukul ${format(new Date(timingBatch.tryoutEndTime), 'HH:mm')} WIB. Sistem otomatis menutup sesi ujian setelah waktu tersebut.`
                    : 'Peserta tidak dapat memulai ujian tryout sebelum sesi dibuka oleh pengawas/admin.'}
                </p>

                {timingBatch.isLiveOpen && (
                  <div className="pt-2">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      disabled={savingTiming}
                      onClick={() => handleUpdateTryoutTiming('CLOSE_NOW')}
                      className="w-full text-xs h-8"
                    >
                      <Square className="w-3.5 h-3.5 mr-1.5 fill-white" />
                      Tutup Ujian Sekarang
                    </Button>
                  </div>
                )}
              </div>

              {/* Question Count Setting (Random Sampling) */}
              <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                    <FileQuestion className="w-3.5 h-3.5 text-blue-600" />
                    Jumlah Soal yang Diujikan:
                  </Label>
                  <Badge variant="outline" className="text-blue-700 bg-blue-50 border-blue-200 font-bold text-xs">
                    {targetQuestionCount} Butir Soal
                  </Badge>
                </div>

                <div className="grid grid-cols-4 gap-1.5">
                  {[20, 30, 50, 100].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setTargetQuestionCount(count)}
                      className={cn(
                        'py-1.5 px-1 text-center rounded-lg text-xs font-bold border transition-all',
                        targetQuestionCount === count
                          ? 'bg-blue-600 text-white border-blue-600 ring-2 ring-blue-200 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      )}
                    >
                      {count} Soal
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between gap-2 pt-1 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-500 font-medium">Kustom:</span>
                    <Input
                      type="number"
                      min={5}
                      max={500}
                      value={targetQuestionCount}
                      onChange={(e) => setTargetQuestionCount(Math.max(1, parseInt(e.target.value) || 20))}
                      className="h-7 text-xs w-20 px-2 bg-white"
                    />
                    <span className="text-[11px] text-slate-500">butir</span>
                  </div>
                  <span className="text-[10px] text-slate-400 italic">
                    Diacak otomatis dari bank soal
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsTimingOpen(false);
                      if (timingBatch) openQuestionSelectorModal(timingBatch);
                    }}
                    className="text-purple-700 border-purple-200 hover:bg-purple-50 text-[11px] h-7 px-2"
                  >
                    <ListChecks className="w-3 h-3 mr-1 text-purple-600" />
                    Pilih Butir Soal Manual
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => timingBatch && handleDownloadTryoutPdf(timingBatch.id)}
                    className="text-emerald-700 border-emerald-200 hover:bg-emerald-50 text-[11px] h-7 px-2"
                  >
                    <Download className="w-3 h-3 mr-1 text-emerald-600" />
                    Naskah Soal (PDF)
                  </Button>
                </div>
              </div>

              {/* Mode Selection */}
              <div className="flex rounded-lg border border-slate-200 p-1 bg-slate-50 text-xs">
                <button
                  type="button"
                  onClick={() => setTimingMode('QUICK')}
                  className={cn(
                    'flex-1 py-1.5 rounded-md font-semibold transition-all',
                    timingMode === 'QUICK'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  )}
                >
                  Buka Sekarang (Durasi)
                </button>
                <button
                  type="button"
                  onClick={() => setTimingMode('SCHEDULE')}
                  className={cn(
                    'flex-1 py-1.5 rounded-md font-semibold transition-all',
                    timingMode === 'SCHEDULE'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  )}
                >
                  Jadwalkan Tanggal & Jam
                </button>
              </div>

              {timingMode === 'QUICK' ? (
                /* Mode 1: Quick Preset Minutes */
                <div className="space-y-3">
                  <Label className="text-xs font-semibold text-slate-700">Pilih Durasi Waktu Ujian:</Label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[30, 45, 60, 90, 120].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setQuickMinutes(mins)}
                        className={cn(
                          'py-2 px-1 text-center rounded-lg text-xs font-bold border transition-all',
                          quickMinutes === mins
                            ? 'bg-blue-600 text-white border-blue-600 ring-2 ring-blue-200'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        )}
                      >
                        {mins}m
                      </button>
                    ))}
                  </div>

                  <div className="pt-1 text-xs text-slate-500">
                    Sesi akan aktif selama <strong>{quickMinutes} menit</strong> ke depan dan otomatis tertutup setelah waktu tercapai. Soal akan ditarik <strong>{targetQuestionCount} butir</strong> secara acak.
                  </div>

                  <DialogFooter className="pt-2">
                    <Button type="button" variant="outline" onClick={() => setIsTimingOpen(false)} disabled={savingTiming}>
                      Batal
                    </Button>
                    <Button
                      type="button"
                      disabled={savingTiming}
                      onClick={() => handleUpdateTryoutTiming('OPEN_NOW')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      {savingTiming && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
                      <Play className="w-4 h-4 mr-1.5 fill-white" />
                      Buka Sekarang ({quickMinutes}m • {targetQuestionCount} Soal)
                    </Button>
                  </DialogFooter>
                </div>
              ) : (
                /* Mode 2: Custom Date and Time */
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="schedStart" className="text-xs font-semibold text-slate-700">
                      Waktu Dibuka (Mulai)
                    </Label>
                    <Input
                      id="schedStart"
                      type="datetime-local"
                      value={schedStartTime}
                      onChange={(e) => setSchedStartTime(e.target.value)}
                      className="text-xs"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="schedEnd" className="text-xs font-semibold text-slate-700">
                      Waktu Ditutup (Selesai Otomatis)
                    </Label>
                    <Input
                      id="schedEnd"
                      type="datetime-local"
                      value={schedEndTime}
                      onChange={(e) => setSchedEndTime(e.target.value)}
                      className="text-xs"
                      required
                    />
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Sistem akan otomatis membuka tryout ({targetQuestionCount} soal acak) saat waktu mulai tercapai dan menutupnya saat waktu selesai terlampaui.
                  </p>

                  <DialogFooter className="pt-2">
                    <Button type="button" variant="outline" onClick={() => setIsTimingOpen(false)} disabled={savingTiming}>
                      Batal
                    </Button>
                    <Button
                      type="button"
                      disabled={savingTiming}
                      onClick={() => handleUpdateTryoutTiming('SCHEDULE')}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {savingTiming && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
                      Simpan Jadwal ({targetQuestionCount} Soal)
                    </Button>
                  </DialogFooter>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* DIALOG 4: PILIH BUTIR SOAL UJIAN TRYOUT (MODE MANUAL)               */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <Dialog open={isQuestionSelectorOpen} onOpenChange={setIsQuestionSelectorOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <ListChecks className="w-5 h-5 text-purple-600" />
              Pilih Butir Soal Ujian Tryout (Mode Manual)
            </DialogTitle>
            <DialogDescription>
              {selectorBatch ? `Batch ${selectorBatch.batchNumber} - ${selectorBatch.training.title}` : ''} • Pilih secara spesifik butir soal yang ingin diujikan dari bank soal.
            </DialogDescription>
          </DialogHeader>

          {loadingQuestions ? (
            <div className="py-20 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" />
              <p className="text-sm text-slate-500">Memuat bank soal...</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-h-0 space-y-4 py-2">
              {/* Toolbar: Search, Filter, & Quick Selection */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 flex-1">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                      placeholder="Cari teks soal, topik, atau kata kunci..."
                      value={searchQText}
                      onChange={(e) => setSearchQText(e.target.value)}
                      className="pl-9 h-9 text-xs bg-white"
                    />
                  </div>
                  <Select value={filterQTopic} onValueChange={(val) => setFilterQTopic(val || 'ALL')}>
                    <SelectTrigger className="h-9 text-xs w-[160px] bg-white">
                      <SelectValue placeholder="Topik Materi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Semua Topik</SelectItem>
                      {Array.from(new Set(availableQuestions.map((q) => q.topic))).map((topic: any) => (
                        <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Quick Selection Buttons */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleSelectTopNQuestions(20)}
                    className="h-8 text-xs bg-white text-slate-700 hover:bg-slate-100"
                  >
                    Pilih 20 Teratas
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleSelectTopNQuestions(50)}
                    className="h-8 text-xs bg-white text-slate-700 hover:bg-slate-100"
                  >
                    Pilih 50 Teratas
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleSelectAllFilteredQuestions(availableQuestions)}
                    className="h-8 text-xs bg-white text-blue-700 hover:bg-blue-50"
                  >
                    Pilih Semua
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleClearSelectedQuestions}
                    className="h-8 text-xs text-red-600 hover:bg-red-50"
                  >
                    Kosongkan
                  </Button>
                </div>
              </div>

              {/* Status bar */}
              <div className="flex items-center justify-between text-xs px-1">
                <span className="text-slate-600">
                  Total Tersedia: <strong>{availableQuestions.length} Soal</strong> di Bank Soal
                </span>
                <span className="font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-200">
                  Terpilih: {selectedQuestionIds.length} Butir Soal
                </span>
              </div>

              {/* Questions Table */}
              <div className="flex-1 overflow-y-auto border border-slate-200 rounded-xl min-h-[300px]">
                <Table>
                  <TableHeader className="bg-slate-50 sticky top-0 z-10">
                    <TableRow>
                      <TableHead className="w-12 text-center">Pilih</TableHead>
                      <TableHead className="w-12 text-center">No</TableHead>
                      <TableHead className="w-36">Topik</TableHead>
                      <TableHead>Butir Pertanyaan & Pilihan</TableHead>
                      <TableHead className="w-20 text-center">Kunci</TableHead>
                      <TableHead className="w-24 text-center">Tingkat</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {availableQuestions
                      .filter((q) => {
                        const matchText =
                          searchQText === '' ||
                          q.questionText.toLowerCase().includes(searchQText.toLowerCase()) ||
                          q.topic.toLowerCase().includes(searchQText.toLowerCase());
                        const matchTopic = filterQTopic === 'ALL' || q.topic === filterQTopic;
                        return matchText && matchTopic;
                      })
                      .map((q, idx) => {
                        const isChecked = selectedQuestionIds.includes(q.id);
                        return (
                          <TableRow
                            key={q.id}
                            className={cn('cursor-pointer hover:bg-slate-50', isChecked && 'bg-purple-50/50')}
                            onClick={() => handleToggleQuestion(q.id)}
                          >
                            <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleQuestion(q.id)}
                                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                              />
                            </TableCell>
                            <TableCell className="text-center font-medium text-xs text-slate-500">{idx + 1}</TableCell>
                            <TableCell>
                              <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700">
                                {q.topic}
                              </span>
                            </TableCell>
                            <TableCell>
                              <p className="text-xs text-slate-800 font-medium line-clamp-2">{q.questionText}</p>
                              <div className="text-[11px] text-slate-500 mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
                                <span><strong>A:</strong> {q.optionA}</span>
                                <span><strong>B:</strong> {q.optionB}</span>
                                <span><strong>C:</strong> {q.optionC}</span>
                                <span><strong>D:</strong> {q.optionD}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge className="bg-emerald-100 text-emerald-800 border-none font-bold text-xs">
                                {q.correctAnswer}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center text-xs text-slate-500">
                              {q.difficulty === 1 ? 'Mudah' : q.difficulty === 2 ? 'Sedang' : 'Sulit'}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-3 border-t">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => selectorBatch && handleDownloadTryoutPdf(selectorBatch.id)}
                className="text-emerald-700 border-emerald-300 hover:bg-emerald-50 text-xs h-9"
              >
                <Download className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                Cetak / Unduh PDF
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleSaveSelectedQuestions('AUTOMATIC')}
                disabled={savingQuestions}
                className="text-slate-600 hover:text-slate-900 text-xs h-9"
                title="Kembalikan batch ke mode acak otomatis"
              >
                Reset ke Mode Acak
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsQuestionSelectorOpen(false)}
                disabled={savingQuestions}
                className="text-xs h-9"
              >
                Tutup
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => handleSaveSelectedQuestions('MANUAL')}
                disabled={savingQuestions || selectedQuestionIds.length === 0}
                className="bg-purple-600 hover:bg-purple-700 text-white text-xs h-9 font-semibold shadow-xs"
              >
                {savingQuestions && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
                <CheckSquare className="w-4 h-4 mr-1.5" />
                Terapkan {selectedQuestionIds.length} Soal Pilihan
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
