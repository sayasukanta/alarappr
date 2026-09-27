'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Plus,
  CalendarDays,
  MapPin,
  Users,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  UserCheck,
  RefreshCw,
  Loader2,
  GraduationCap,
  Clock,
  Layers,
  Sparkles,
  Camera,
  Video,
  ExternalLink,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format, isFuture, isPast } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { toast } from 'sonner';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { BatchDocumentationEmbed } from '@/components/BatchDocumentationEmbed';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Batch {
  id: number;
  trainingId: number;
  batchNumber: number;
  startDate: string;
  endDate: string;
  quota: number;
  location: string | null;
  status: 'RENCANA' | 'PELAKSANAAN' | 'SELESAI';
  documentationUrl?: string | null;
  documentationTitle?: string | null;
  training: { title: string; category: string };
  _count: { registrations: number };
  instructorAssignments: {
    id: number;
    instructorId: number;
    sessionName: string;
    instructor: { user: { fullName: string } };
  }[];
}

interface Training {
  id: number;
  title: string;
  category: string;
  durationDays?: number;
  description?: string | null;
  batchesCount?: number;
}

interface Instructor {
  id: number;
  user: { fullName: string };
  specialization: string;
}

// ─── Form Schema ──────────────────────────────────────────────────────────────
const batchSchema = z.object({
  trainingId: z.string().min(1, 'Pilih program pelatihan'),
  batchNumber: z.coerce.number().min(1),
  startDate: z.string().min(1, 'Tanggal mulai diperlukan'),
  endDate: z.string().min(1, 'Tanggal selesai diperlukan'),
  quota: z.coerce.number().min(1).max(100),
  location: z.string().optional(),
  status: z.enum(['RENCANA', 'PELAKSANAAN', 'SELESAI']),
  documentationUrl: z.string().optional(),
  documentationTitle: z.string().optional(),
});
type BatchForm = z.infer<typeof batchSchema>;

// ─── Helper Functions ─────────────────────────────────────────────────────────
function getBatchStatus(status?: string, startDate?: string, endDate?: string) {
  if (status === 'PELAKSANAAN') {
    return { label: 'Pelaksanaan', cls: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold' };
  }
  if (status === 'SELESAI') {
    return { label: 'Selesai', cls: 'bg-slate-100 text-slate-700 border-slate-300' };
  }
  if (status === 'RENCANA') {
    return { label: 'Rencana', cls: 'bg-blue-100 text-blue-800 border-blue-300 font-medium' };
  }
  if (!startDate || !endDate) return { label: 'Rencana', cls: 'bg-blue-100 text-blue-800' };
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (isFuture(start)) return { label: 'Rencana', cls: 'bg-blue-100 text-blue-800' };
  if (isPast(end)) return { label: 'Selesai', cls: 'bg-slate-100 text-slate-700' };
  return { label: 'Pelaksanaan', cls: 'bg-emerald-100 text-emerald-800' };
}

const CATEGORY_LABELS: Record<string, string> = {
  PPR_BAGASI: 'PPR Bagasi',
  PPR_ANALISIS: 'PPR Analisis',
  PKR_PEKERJA: 'PKR Pekerja Radiasi',
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function BatchPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTrainingIds, setExpandedTrainingIds] = useState<number[]>([]);
  const [expandedBatchId, setExpandedBatchId] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editBatch, setEditBatch] = useState<Batch | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [docPreviewBatch, setDocPreviewBatch] = useState<Batch | null>(null);
  const [assignModal, setAssignModal] = useState<{ open: boolean; batchId: number | null }>({
    open: false,
    batchId: null,
  });
  const [selectedInstructor, setSelectedInstructor] = useState('');
  const [sessionName, setSessionName] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<BatchForm>({
    resolver: zodResolver(batchSchema),
    defaultValues: { quota: 20, batchNumber: 1, status: 'RENCANA', documentationUrl: '', documentationTitle: '' },
  });

  const watchedDocUrl = useWatch({ control, name: 'documentationUrl' });
  const watchedDocTitle = useWatch({ control, name: 'documentationTitle' });

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [bRes, tRes, iRes] = await Promise.all([
        fetch('/api/admin/batch'),
        fetch('/api/admin/trainings'),
        fetch('/api/admin/instructors'),
      ]);
      const bJson = await bRes.json();
      const tJson = await tRes.json();
      const iJson = await iRes.json();
      setBatches(bJson.data ?? []);
      setTrainings(tJson.data ?? []);
      setInstructors(iJson.data ?? []);
    } catch {
      toast.error('Gagal memuat data batch');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Toggle accordion item jenis pelatihan
  const toggleTraining = (trainingId: number) => {
    setExpandedTrainingIds((prev) =>
      prev.includes(trainingId) ? prev.filter((id) => id !== trainingId) : [...prev, trainingId]
    );
  };

  // Open modal create batch from generic button
  const openCreate = () => {
    setEditBatch(null);
    const defaultTrainingId = trainings[0]?.id?.toString() || '';
    reset({
      trainingId: defaultTrainingId,
      quota: 20,
      batchNumber: (batches.length ?? 0) + 1,
      status: 'RENCANA',
      location: '',
      documentationUrl: '',
      documentationTitle: '',
    });
    setFormOpen(true);
  };

  // Open modal create batch specifically for a selected training
  const openCreateForTraining = (trainingId: number) => {
    setEditBatch(null);
    const trainingBatches = batches.filter((b) => b.trainingId === trainingId);
    const nextNum =
      trainingBatches.length > 0 ? Math.max(...trainingBatches.map((b) => b.batchNumber)) + 1 : 1;

    reset({
      trainingId: trainingId.toString(),
      batchNumber: nextNum,
      quota: 20,
      status: 'RENCANA',
      location: '',
      documentationUrl: '',
      documentationTitle: '',
    });

    // Otomatis buka accordion jenis pelatihan tersebut
    if (!expandedTrainingIds.includes(trainingId)) {
      setExpandedTrainingIds((prev) => [...prev, trainingId]);
    }

    setFormOpen(true);
  };

  const openEdit = (batch: Batch) => {
    setEditBatch(batch);
    reset({
      trainingId: batch.trainingId.toString(),
      batchNumber: batch.batchNumber,
      startDate: batch.startDate.split('T')[0],
      endDate: batch.endDate.split('T')[0],
      quota: batch.quota,
      location: batch.location ?? '',
      status: batch.status || 'RENCANA',
      documentationUrl: batch.documentationUrl ?? '',
      documentationTitle: batch.documentationTitle ?? '',
    });
    setFormOpen(true);
  };

  const onSubmit = async (data: BatchForm) => {
    setActionLoading(true);
    try {
      const url = editBatch ? `/api/admin/batch/${editBatch.id}` : '/api/admin/batch';
      const method = editBatch ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, trainingId: parseInt(data.trainingId) }),
      });
      if (!res.ok) throw new Error();
      toast.success(editBatch ? 'Batch diperbarui' : 'Batch berhasil dibuat');
      setFormOpen(false);

      // Pastikan accordion pelatihan terbuka
      const targetTrainingId = parseInt(data.trainingId);
      if (!expandedTrainingIds.includes(targetTrainingId)) {
        setExpandedTrainingIds((prev) => [...prev, targetTrainingId]);
      }

      await fetchAll();
    } catch {
      toast.error('Gagal menyimpan batch');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/batch/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('Batch berhasil dihapus');
      setDeleteConfirm(null);
      await fetchAll();
    } catch {
      toast.error('Gagal menghapus batch');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignInstructor = async () => {
    if (!assignModal.batchId || !selectedInstructor || !sessionName) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/batch/${assignModal.batchId}/instructor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instructorId: parseInt(selectedInstructor), sessionName }),
      });
      if (!res.ok) throw new Error();
      toast.success('Instruktur ditugaskan');
      setAssignModal({ open: false, batchId: null });
      setSelectedInstructor('');
      setSessionName('');
      await fetchAll();
    } catch {
      toast.error('Gagal menugaskan instruktur');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-blue-600" />
            Manajemen Batch Pelatihan
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Pilih jenis pelatihan untuk melihat dan mengelola daftar batch, instruktur, dan kuota peserta
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchAll} disabled={loading} title="Muat ulang data">
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          </Button>
          <Button size="sm" onClick={openCreate} className="bg-blue-600 hover:bg-blue-700 text-white shadow-xs">
            <Plus className="w-4 h-4 mr-1.5" />
            Tambah Batch
          </Button>
        </div>
      </div>

      {/* Main Container: Daftar Jenis Pelatihan */}
      <div className="space-y-4">
        {loading ? (
          Array(3)
            .fill(0)
            .map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)
        ) : trainings.length === 0 ? (
          <div className="text-center py-16 text-gray-400 bg-white border border-dashed rounded-xl p-8">
            <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-semibold text-gray-700">Belum ada jenis pelatihan</p>
            <p className="text-xs text-gray-400 mt-1">Silakan tambahkan jenis pelatihan terlebih dahulu pada menu Jenis Pelatihan.</p>
          </div>
        ) : (
          trainings.map((training) => {
            const trainingBatches = batches.filter((b) => b.trainingId === training.id);
            const isExpanded = expandedTrainingIds.includes(training.id);
            const hasOngoing = trainingBatches.some((b) => b.status === 'PELAKSANAAN');

            return (
              <Card
                key={training.id}
                className={cn(
                  'overflow-hidden transition-all duration-200 border-slate-200',
                  isExpanded ? 'shadow-md ring-1 ring-blue-500/20' : 'hover:border-slate-300 hover:shadow-xs'
                )}
              >
                {/* ─── Training Header Item (Baris Jenis Pelatihan) ─── */}
                <div
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 cursor-pointer bg-white hover:bg-slate-50/80 transition-colors"
                  onClick={() => toggleTraining(training.id)}
                >
                  {/* Left: Icon & Info Pelatihan */}
                  <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-colors',
                        isExpanded
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-blue-50 text-blue-700 border-blue-100'
                      )}
                    >
                      <GraduationCap className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="font-bold text-gray-900 text-base leading-snug">
                          {training.title}
                        </h2>
                        <Badge variant="outline" className="text-[11px] font-medium border-slate-300 text-slate-700">
                          {CATEGORY_LABELS[training.category] || training.category}
                        </Badge>
                        {hasOngoing && (
                          <Badge className="bg-emerald-600 text-white text-[10px] gap-1 px-2 py-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            Pelaksanaan Aktif
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-1 flex-wrap">
                        <span className="flex items-center gap-1 font-medium text-slate-600">
                          <Layers className="w-3.5 h-3.5 text-blue-500" />
                          {trainingBatches.length} Batch terdaftar
                        </span>
                        {training.durationDays && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {training.durationDays} Hari Pelatihan
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Aksi Tambah Batch & Toggle Chevron */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0" onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="sm"
                      onClick={() => openCreateForTraining(training.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 gap-1.5 shadow-xs font-semibold px-3"
                      title={`Tambah Batch Baru untuk ${training.title}`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Batch</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleTraining(training.id)}
                      className="h-8 w-8 p-0 text-slate-400 hover:text-slate-700"
                      title={isExpanded ? 'Tutup Daftar Batch' : 'Buka Daftar Batch'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-blue-600" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                {/* ─── Expanded Section: Daftar Batch dari Jenis Pelatihan Tersebut ─── */}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/60 p-4 sm:p-5 space-y-3">
                    <div className="flex items-center justify-between pb-1">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Daftar Batch &bull; {trainingBatches.length} Batch
                      </span>
                      <span className="text-xs text-slate-400">
                        Klik pada kartu batch untuk melihat rincian instruktur
                      </span>
                    </div>

                    {trainingBatches.length === 0 ? (
                      <div className="text-center py-10 bg-white rounded-xl border border-dashed border-slate-200 p-6">
                        <CalendarDays className="w-9 h-9 mx-auto mb-2 text-slate-300" />
                        <p className="font-semibold text-slate-700 text-sm">Belum ada batch untuk jenis pelatihan ini</p>
                        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                          Mulai buka periode pelatihan baru dengan menambahkan batch pertama.
                        </p>
                        <Button
                          size="sm"
                          onClick={() => openCreateForTraining(training.id)}
                          className="mt-3.5 bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Tambah Batch #{trainingBatches.length + 1}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {trainingBatches.map((batch) => {
                          const status = getBatchStatus(batch.status, batch.startDate, batch.endDate);
                          const enrolled = batch._count.registrations;
                          const fillPct = Math.round((enrolled / batch.quota) * 100);
                          const batchExpanded = expandedBatchId === batch.id;

                          return (
                            <div
                              key={batch.id}
                              className={cn(
                                'bg-white rounded-xl border transition-all duration-150 overflow-hidden',
                                batchExpanded
                                  ? 'border-blue-300 shadow-sm'
                                  : 'border-slate-200 hover:border-slate-300 shadow-2xs'
                              )}
                            >
                              <div
                                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 cursor-pointer hover:bg-slate-50/70 transition-colors"
                                onClick={() => setExpandedBatchId(batchExpanded ? null : batch.id)}
                              >
                                {/* Info Utama Batch */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-bold text-gray-900 text-sm">
                                      Batch #{batch.batchNumber}
                                    </span>
                                    <span
                                      className={cn(
                                        'px-2 py-0.5 rounded-full text-xs border font-medium',
                                        status.cls
                                      )}
                                    >
                                      {status.label}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-500 flex-wrap">
                                    <span className="flex items-center gap-1">
                                      <CalendarDays className="w-3.5 h-3.5 text-blue-500" />
                                      {format(new Date(batch.startDate), 'd MMM', { locale: localeId })} –{' '}
                                      {format(new Date(batch.endDate), 'd MMM yyyy', { locale: localeId })}
                                    </span>
                                    {batch.location && (
                                      <span className="flex items-center gap-1">
                                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                        {batch.location}
                                      </span>
                                    )}
                                    <span className="flex items-center gap-1 font-medium text-slate-700">
                                      <Users className="w-3.5 h-3.5 text-slate-400" />
                                      {enrolled}/{batch.quota} Peserta
                                    </span>
                                  </div>

                                  {/* Kuota Progress Bar */}
                                  <div className="mt-2.5 flex items-center gap-2 max-w-xs">
                                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden border border-slate-200">
                                      <div
                                        className={cn(
                                          'h-full rounded-full transition-all',
                                          fillPct >= 90
                                            ? 'bg-red-500'
                                            : fillPct >= 70
                                            ? 'bg-amber-500'
                                            : 'bg-emerald-500'
                                        )}
                                        style={{ width: `${Math.min(fillPct, 100)}%` }}
                                      />
                                    </div>
                                    <span className="text-[10px] text-gray-500 font-mono font-medium">
                                      {fillPct}%
                                    </span>
                                  </div>
                                </div>

                                {/* ─── Ikon Aksi (Dokumentasi, Edit, Tambah Instruktur, Hapus) ─── */}
                                <div
                                  className="flex items-center gap-1.5 self-end sm:self-center shrink-0"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {/* Tombol Dokumentasi Preview */}
                                  {batch.documentationUrl && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-8 gap-1.5 text-xs text-indigo-700 bg-indigo-50 border-indigo-200 hover:bg-indigo-100 hover:border-indigo-300 px-2.5 font-medium"
                                      onClick={() => setDocPreviewBatch(batch)}
                                      title="Lihat Pratinjau Dokumentasi"
                                    >
                                      <Camera className="w-3.5 h-3.5 text-indigo-600" />
                                      <span className="hidden sm:inline">Dokumentasi</span>
                                    </Button>
                                  )}

                                  {/* 1. Edit */}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-slate-700 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/50"
                                    onClick={() => openEdit(batch)}
                                    title="Edit Batch"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </Button>

                                  {/* 2. Tambah / Tugaskan Instruktur */}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50 border-blue-200"
                                    onClick={() => setAssignModal({ open: true, batchId: batch.id })}
                                    title="Tugaskan Instruktur"
                                  >
                                    <UserCheck className="w-3.5 h-3.5" />
                                  </Button>

                                  {/* 3. Hapus */}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 border-red-200"
                                    onClick={() => setDeleteConfirm(batch.id)}
                                    title="Hapus Batch"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>

                                  {/* Chevron untuk expand rincian instruktur */}
                                  <div
                                    className="ml-1 text-slate-400 cursor-pointer p-1"
                                    onClick={() => setExpandedBatchId(batchExpanded ? null : batch.id)}
                                    title={batchExpanded ? 'Sembunyikan Rincian' : 'Lihat Rincian Instruktur'}
                                  >
                                    {batchExpanded ? (
                                      <ChevronUp className="w-4 h-4 text-blue-600" />
                                    ) : (
                                      <ChevronDown className="w-4 h-4" />
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Rincian Instruktur & Kuota Terperinci */}
                              {batchExpanded && (
                                <div className="border-t border-slate-100 px-5 py-4 bg-slate-50/70">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Instruktur yang Ditugaskan */}
                                    <div>
                                      <div className="flex items-center justify-between mb-2">
                                        <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                                          Instruktur Bertugas
                                        </p>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => setAssignModal({ open: true, batchId: batch.id })}
                                          className="h-6 text-[11px] text-blue-600 hover:bg-blue-50 px-2 font-medium"
                                        >
                                          + Tambah Sesi
                                        </Button>
                                      </div>

                                      {batch.instructorAssignments.length ? (
                                        <div className="space-y-1.5">
                                          {batch.instructorAssignments.map((a) => (
                                            <div
                                              key={a.id}
                                              className="flex items-center gap-2 text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-2xs"
                                            >
                                              <UserCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                              <span className="font-semibold text-gray-800">
                                                {a.instructor.user.fullName}
                                              </span>
                                              <span className="text-gray-400">&mdash;</span>
                                              <span className="text-gray-600">{a.sessionName}</span>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <div className="text-xs text-gray-400 bg-white border border-dashed border-slate-200 rounded-lg p-3 text-center">
                                          Belum ada instruktur yang ditugaskan pada batch ini
                                        </div>
                                      )}
                                    </div>

                                    {/* Ringkasan Kuota & Pendaftaran */}
                                    <div>
                                      <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                                        Status Pendaftaran
                                      </p>
                                      <div className="space-y-1.5 text-xs text-gray-600">
                                        <div className="flex justify-between bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-2xs">
                                          <span>Total Terdaftar</span>
                                          <span className="font-bold text-slate-900">{enrolled} Peserta</span>
                                        </div>
                                        <div className="flex justify-between bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-2xs">
                                          <span>Kapasitas Tersedia</span>
                                          <span
                                            className={cn(
                                              'font-bold',
                                              batch.quota - enrolled <= 5 ? 'text-red-600' : 'text-emerald-600'
                                            )}
                                          >
                                            {batch.quota - enrolled} Kursi Tersisa
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Dokumentasi Batch Link/Preview Box */}
                                  {batch.documentationUrl ? (
                                    <div className="mt-3.5 p-3 rounded-xl bg-indigo-50/70 border border-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                      <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                                          <Camera className="w-4 h-4" />
                                        </div>
                                        <div className="min-w-0">
                                          <p className="text-xs font-bold text-indigo-950 truncate">
                                            {batch.documentationTitle || 'Dokumentasi Kegiatan Batch'}
                                          </p>
                                          <p className="text-[11px] text-indigo-600 truncate max-w-md font-mono">
                                            {batch.documentationUrl}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2 shrink-0">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="h-7 text-xs bg-white text-indigo-700 border-indigo-300 hover:bg-indigo-50 font-medium gap-1"
                                          onClick={() => setDocPreviewBatch(batch)}
                                        >
                                          <Camera className="w-3 h-3" />
                                          Pratinjau Media
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="h-7 text-xs text-slate-600 hover:text-blue-600"
                                          onClick={() => openEdit(batch)}
                                          title="Ubah tautan dokumentasi"
                                        >
                                          <Edit2 className="w-3 h-3 mr-1" />
                                          Ubah
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="mt-3.5 p-2.5 rounded-xl bg-slate-50 border border-dashed border-slate-200 flex items-center justify-between text-xs text-slate-400">
                                      <span className="flex items-center gap-1.5">
                                        <Camera className="w-3.5 h-3.5 text-slate-400" />
                                        Belum ada tautan dokumentasi untuk batch ini
                                      </span>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 text-xs text-blue-600 hover:bg-blue-50 px-2 font-medium"
                                        onClick={() => openEdit(batch)}
                                      >
                                        + Tambah Link Dokumentasi
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>

      {/* ─── Modal Form Tambah / Edit Batch ─── */}
      <Dialog open={formOpen} onOpenChange={(open) => !open && setFormOpen(false)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              {editBatch ? 'Edit Batch Pelatihan' : 'Tambah Batch Pelatihan Baru'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Jenis Program Pelatihan *</Label>
              <Controller
                control={control}
                name="trainingId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className={cn('w-full h-10 text-left', errors.trainingId && 'border-red-500')}>
                      <SelectValue placeholder="Pilih program pelatihan..." />
                    </SelectTrigger>
                    <SelectContent className="w-[var(--anchor-width)] max-w-[calc(100vw-2rem)]">
                      {trainings.map((t) => (
                        <SelectItem key={t.id} value={t.id.toString()} className="whitespace-normal py-2 text-left cursor-pointer">
                          {t.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.trainingId && <p className="text-xs text-red-500">{errors.trainingId.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Nomor Batch *</Label>
                <Input
                  type="number"
                  min={1}
                  {...register('batchNumber')}
                  className={cn(errors.batchNumber && 'border-red-500')}
                />
              </div>
              <div className="space-y-2">
                <Label>Kapasitas (Kuota) *</Label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  {...register('quota')}
                  className={cn(errors.quota && 'border-red-500')}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Tanggal Mulai *</Label>
                <Input
                  type="date"
                  {...register('startDate')}
                  className={cn(errors.startDate && 'border-red-500')}
                />
              </div>
              <div className="space-y-2">
                <Label>Tanggal Selesai *</Label>
                <Input
                  type="date"
                  {...register('endDate')}
                  className={cn(errors.endDate && 'border-red-500')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Lokasi Pelatihan</Label>
              <Input placeholder="Contoh: Gedung Diklat ALARA, Jakarta" {...register('location')} />
            </div>

            <div className="space-y-2">
              <Label>Status Batch *</Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full h-10">
                      <SelectValue placeholder="Pilih status batch..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RENCANA">Rencana</SelectItem>
                      <SelectItem value="PELAKSANAAN">Pelaksanaan</SelectItem>
                      <SelectItem value="SELESAI">Selesai</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Field Dokumentasi Batch (Google Drive / YouTube) */}
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Dokumentasi Batch (Foto / Video)
                  </span>
                </div>
                <Badge variant="outline" className="text-[10px] text-indigo-700 border-indigo-200 bg-white">
                  Google Drive &amp; YouTube
                </Badge>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Sematkan tautan folder/file Google Drive atau video YouTube dokumentasi kegiatan. Media otomatis disematkan (embedded preview) tanpa membebani penyimpanan server ALARA.
              </p>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-700">Judul / Keterangan Dokumentasi (Opsional)</Label>
                <Input
                  placeholder="Contoh: Album Foto Kegiatan &amp; Praktikum Batch 1"
                  {...register('documentationTitle')}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-700">URL / Link Dokumentasi (Google Drive / YouTube)</Label>
                <Input
                  placeholder="https://drive.google.com/drive/folders/... atau https://youtu.be/..."
                  {...register('documentationUrl')}
                />
                <p className="text-[11px] text-slate-400">
                  * Untuk Google Drive, pastikan izin share diatur ke: &ldquo;Siapa saja yang memiliki link dapat melihat&rdquo;.
                </p>
              </div>

              {watchedDocUrl && (
                <div className="pt-2 border-t border-indigo-100">
                  <Label className="text-[11px] font-semibold text-slate-600 mb-1.5 block">
                    Pratinjau Langsung (Live Preview):
                  </Label>
                  <BatchDocumentationEmbed
                    url={watchedDocUrl}
                    title={watchedDocTitle || 'Pratinjau Dokumentasi'}
                  />
                </div>
              )}
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                Batal
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold" disabled={actionLoading}>
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : editBatch ? 'Simpan Perubahan' : 'Buat Batch'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── Modal Konfirmasi Hapus Batch ─── */}
      <Dialog open={deleteConfirm !== null} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-red-600">Hapus Batch Pelatihan?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 leading-relaxed">
            Tindakan ini tidak dapat dibatalkan. Data batch dan seluruh riwayat pendaftaran peserta terkait akan terhapus secara permanen.
          </p>
          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              disabled={actionLoading}
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Hapus Permanen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Modal Tugaskan Instruktur ─── */}
      <Dialog open={assignModal.open} onOpenChange={(open) => !open && setAssignModal({ open: false, batchId: null })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-blue-600" />
              Tugaskan Instruktur ke Batch
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Pilih Instruktur *</Label>
              <Select value={selectedInstructor} onValueChange={(val) => setSelectedInstructor(val || '')}>
                <SelectTrigger className="w-full h-10">
                  <SelectValue placeholder="Pilih nama instruktur..." />
                </SelectTrigger>
                <SelectContent className="w-[var(--anchor-width)]">
                  {instructors.map((i) => (
                    <SelectItem key={i.id} value={i.id.toString()}>
                      {i.user.fullName} &bull; {CATEGORY_LABELS[i.specialization] || i.specialization}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Nama Sesi / Topik Materi *</Label>
              <Input
                placeholder="Contoh: Fisika Radiasi, Regulasi BAPETEN, Praktikum..."
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" onClick={() => setAssignModal({ open: false, batchId: null })}>
              Batal
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              disabled={!selectedInstructor || !sessionName || actionLoading}
              onClick={handleAssignInstructor}
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Tugaskan Instruktur'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Modal Pratinjau Dokumentasi Batch ─── */}
      <Dialog open={!!docPreviewBatch} onOpenChange={(open) => !open && setDocPreviewBatch(null)}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-900">
              <Camera className="w-5 h-5 text-indigo-600" />
              {docPreviewBatch?.documentationTitle || `Dokumentasi Batch #${docPreviewBatch?.batchNumber}`}
            </DialogTitle>
          </DialogHeader>
          {docPreviewBatch?.documentationUrl && (
            <div className="pt-2">
              <BatchDocumentationEmbed
                url={docPreviewBatch.documentationUrl}
                title={docPreviewBatch.documentationTitle || undefined}
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDocPreviewBatch(null)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
