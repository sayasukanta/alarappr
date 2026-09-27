'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  BookOpen,
  Layers,
  Clock,
  Search,
  RefreshCw,
  Loader2,
  AlertCircle,
  GraduationCap,
  Award,
} from 'lucide-react';
import CompetencyUnitsManagerModal from '@/components/admin/CompetencyUnitsManagerModal';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

type TrainingCategory = 'PPR_ANALISIS' | 'PPR_BAGASI' | 'PKR_PEKERJA';

interface TrainingRecord {
  id: number;
  category: TrainingCategory;
  title: string;
  certBadge?: string | null;
  price: number;
  durationDays: number;
  description: string | null;
  createdAt: string;
  batchesCount: number;
}

const CATEGORY_MAP: Record<TrainingCategory, { label: string; badgeCls: string }> = {
  PPR_ANALISIS: {
    label: 'PPR Analisis',
    badgeCls: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  PPR_BAGASI: {
    label: 'PPR X-Ray Bagasi',
    badgeCls: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  PKR_PEKERJA: {
    label: 'PKR Pekerja Radiasi',
    badgeCls: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
};

function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function JenisPelatihanPage() {
  const [trainings, setTrainings] = useState<TrainingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  // Modal states
  const [formOpen, setFormOpen] = useState(false);
  const [editingTraining, setEditingTraining] = useState<TrainingRecord | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<TrainingRecord | null>(null);
  const [curriculumModal, setCurriculumModal] = useState<{
    open: boolean;
    trainingId: number | null;
    trainingTitle: string;
  }>({
    open: false,
    trainingId: null,
    trainingTitle: '',
  });
  const [actionLoading, setActionLoading] = useState(false);

  // Form fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TrainingCategory>('PPR_ANALISIS');
  const [certBadge, setCertBadge] = useState('BAPETEN');
  const [price, setPrice] = useState('');
  const [durationDays, setDurationDays] = useState('3');
  const [description, setDescription] = useState('');

  const fetchTrainings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/trainings');
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Gagal memuat data');
      setTrainings(json.data ?? []);
    } catch {
      toast.error('Gagal memuat data jenis pelatihan');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrainings();
  }, [fetchTrainings]);

  const handleOpenCreate = () => {
    setEditingTraining(null);
    setTitle('');
    setCategory('PPR_ANALISIS');
    setCertBadge('BAPETEN');
    setPrice('');
    setDurationDays('3');
    setDescription('');
    setFormOpen(true);
  };

  const handleOpenEdit = (t: TrainingRecord) => {
    setEditingTraining(t);
    setTitle(t.title);
    setCategory(t.category);
    setCertBadge(t.certBadge || (t.category === 'PKR_PEKERJA' ? 'Internal' : 'BAPETEN'));
    setPrice(t.price.toString());
    setDurationDays(t.durationDays.toString());
    setDescription(t.description || '');
    setFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Judul/Nama program pelatihan wajib diisi');
      return;
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      toast.error('Biaya pelatihan harus berupa angka valid');
      return;
    }

    const parsedDuration = parseInt(durationDays, 10);
    if (isNaN(parsedDuration) || parsedDuration < 1) {
      toast.error('Durasi pelatihan minimal 1 hari');
      return;
    }

    setActionLoading(true);
    try {
      const url = editingTraining
        ? `/api/admin/trainings/${editingTraining.id}`
        : '/api/admin/trainings';
      const method = editingTraining ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          category,
          certBadge: certBadge.trim() || 'BAPETEN',
          price: parsedPrice,
          durationDays: parsedDuration,
          description: description.trim() || null,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Gagal menyimpan pelatihan');

      toast.success(
        editingTraining
          ? 'Jenis pelatihan berhasil diperbarui'
          : 'Jenis pelatihan baru berhasil ditambahkan'
      );
      setFormOpen(false);
      await fetchTrainings();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menyimpan jenis pelatihan');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (t: TrainingRecord) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/trainings/${t.id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Gagal menghapus jenis pelatihan');

      toast.success('Jenis pelatihan berhasil dihapus');
      setDeleteConfirm(null);
      await fetchTrainings();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menghapus jenis pelatihan');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredTrainings = trainings.filter((t) => {
    const matchCategory = filterCategory === 'ALL' || t.category === filterCategory;
    const matchSearch =
      !search ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(search.toLowerCase()));
    return matchCategory && matchSearch;
  });

  const totalBatches = trainings.reduce((acc, t) => acc + (t.batchesCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jenis Pelatihan</h1>
          <p className="text-sm text-gray-500">
            Kelola master data program dan klasifikasi pelatihan proteksi radiasi
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTrainings}
            disabled={loading}
            title="Muat ulang data"
          >
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          </Button>
          <Button
            onClick={handleOpenCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Tambah Jenis Pelatihan
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 font-medium">Total Program</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          {loading ? (
            <Skeleton className="h-8 w-16 mt-2" />
          ) : (
            <p className="text-2xl font-bold text-gray-900 mt-2">{trainings.length}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">Program pelatihan terdaftar</p>
        </div>

        <div className="bg-white border rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 font-medium">Total Batch Terkait</span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          {loading ? (
            <Skeleton className="h-8 w-16 mt-2" />
          ) : (
            <p className="text-2xl font-bold text-purple-700 mt-2">{totalBatches}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">Batch pelatihan aktif & selesai</p>
        </div>

        <div className="bg-white border rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 font-medium">Standar Durasi</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          {loading ? (
            <Skeleton className="h-8 w-16 mt-2" />
          ) : (
            <p className="text-2xl font-bold text-emerald-700 mt-2">
              {trainings.length
                ? Math.round(
                    trainings.reduce((acc, t) => acc + t.durationDays, 0) / trainings.length
                  )
                : 3}{' '}
              Hari
            </p>
          )}
          <p className="text-xs text-gray-400 mt-1">Rata-rata lama kurikulum</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'ALL', label: 'Semua Kategori' },
            { id: 'PPR_ANALISIS', label: 'PPR Analisis' },
            { id: 'PPR_BAGASI', label: 'PPR X-Ray Bagasi' },
            { id: 'PKR_PEKERJA', label: 'PKR Pekerja' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border',
                filterCategory === cat.id
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <div className="relative ml-auto w-full sm:w-72">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Cari program pelatihan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9 text-sm"
          />
        </div>
      </div>

      {/* Training Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/75">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">
                    Program Pelatihan
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">
                    Kategori
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">
                    Biaya
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">
                    Durasi
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500">
                    Jml Batch
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  Array(3)
                    .fill(0)
                    .map((_, i) => (
                      <tr key={i}>
                        <td className="px-4 py-4">
                          <Skeleton className="h-5 w-64 mb-1.5" />
                          <Skeleton className="h-3 w-96" />
                        </td>
                        <td className="px-4 py-4">
                          <Skeleton className="h-5 w-24" />
                        </td>
                        <td className="px-4 py-4">
                          <Skeleton className="h-5 w-24" />
                        </td>
                        <td className="px-4 py-4">
                          <Skeleton className="h-5 w-16" />
                        </td>
                        <td className="px-4 py-4 text-center">
                          <Skeleton className="h-5 w-8 mx-auto" />
                        </td>
                        <td className="px-4 py-4 text-center">
                          <Skeleton className="h-7 w-16 mx-auto" />
                        </td>
                      </tr>
                    ))
                ) : filteredTrainings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-400 text-sm">
                      Tidak ada jenis pelatihan yang sesuai dengan kriteria pencarian
                    </td>
                  </tr>
                ) : (
                  filteredTrainings.map((t) => {
                    const catMeta = CATEGORY_MAP[t.category] || {
                      label: t.category,
                      badgeCls: 'bg-gray-100 text-gray-700',
                    };
                    return (
                      <tr key={t.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="px-4 py-3.5 max-w-md">
                          <p className="font-semibold text-gray-900 leading-snug">{t.title}</p>
                          {t.description && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                              {t.description}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            <Badge
                              variant="outline"
                              className={cn('text-xs font-medium border px-2 py-0.5 w-fit', catMeta.badgeCls)}
                            >
                              {catMeta.label}
                            </Badge>
                            {t.certBadge && (
                              <Badge
                                variant="secondary"
                                className={cn(
                                  'text-[10px] font-semibold px-2 py-0.5 w-fit',
                                  t.certBadge === 'BAPETEN'
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                    : t.certBadge === 'Internal'
                                    ? 'bg-slate-100 text-slate-700 border-slate-200'
                                    : 'bg-amber-100 text-amber-800 border-amber-200'
                                )}
                              >
                                {t.certBadge}
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-gray-900 whitespace-nowrap">
                          {formatRupiah(t.price)}
                        </td>
                        <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap text-xs">
                          {t.durationDays} Hari
                        </td>
                        <td className="px-4 py-3.5 text-center whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {t.batchesCount}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 gap-1 text-xs text-purple-700 bg-purple-50 hover:bg-purple-100 hover:text-purple-800 border-purple-200"
                              onClick={() =>
                                setCurriculumModal({
                                  open: true,
                                  trainingId: t.id,
                                  trainingTitle: t.title,
                                })
                              }
                              title="Kelola Kurikulum & Unit Kompetensi (Hal 2 Sertifikat)"
                            >
                              <Award className="w-3.5 h-3.5 text-purple-600" />
                              <span>Kurikulum</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              onClick={() => handleOpenEdit(t)}
                              title="Edit jenis pelatihan"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => setDeleteConfirm(t)}
                              title="Hapus jenis pelatihan"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={(open) => !open && setFormOpen(false)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editingTraining ? 'Edit Jenis Pelatihan' : 'Tambah Jenis Pelatihan Baru'}
            </DialogTitle>
            <DialogDescription>
              Lengkapi formulir di bawah ini untuk mengelola data program pelatihan.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="train-title">Judul / Nama Program Pelatihan *</Label>
              <Input
                id="train-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Pelatihan Calon PPR Industri Tingkat 1"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Kategori *</Label>
                <Select
                  value={category}
                  onValueChange={(val) => {
                    const newCat = val as TrainingCategory;
                    setCategory(newCat);
                    if (!editingTraining) {
                      setCertBadge(newCat === 'PKR_PEKERJA' ? 'Internal' : 'BAPETEN');
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent className="w-[var(--anchor-width)]">
                    <SelectItem value="PPR_ANALISIS">PPR Analisis</SelectItem>
                    <SelectItem value="PPR_BAGASI">PPR X-Ray Bagasi</SelectItem>
                    <SelectItem value="PKR_PEKERJA">PKR Pekerja</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="train-badge">Badge Lembaga / Sertifikasi *</Label>
                <div className="flex gap-2">
                  <Input
                    id="train-badge"
                    value={certBadge}
                    onChange={(e) => setCertBadge(e.target.value)}
                    placeholder="BAPETEN, Internal, dll."
                    required
                  />
                  <Select
                    value={['BAPETEN', 'Internal', 'BNSP', 'Kemenaker'].includes(certBadge) ? certBadge : 'CUSTOM'}
                    onValueChange={(val) => {
                      if (val && val !== 'CUSTOM') setCertBadge(val);
                    }}
                  >
                    <SelectTrigger className="w-28 shrink-0">
                      <SelectValue placeholder="Pilih" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BAPETEN">BAPETEN</SelectItem>
                      <SelectItem value="Internal">Internal</SelectItem>
                      <SelectItem value="BNSP">BNSP</SelectItem>
                      <SelectItem value="Kemenaker">Kemenaker</SelectItem>
                      <SelectItem value="CUSTOM">Lainnya...</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="train-price">Biaya (Rp) *</Label>
                <Input
                  id="train-price"
                  type="number"
                  min="0"
                  step="50000"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Contoh: 5000000"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="train-duration">Durasi (Hari) *</Label>
                <Input
                  id="train-duration"
                  type="number"
                  min="1"
                  max="30"
                  value={durationDays}
                  onChange={(e) => setDurationDays(e.target.value)}
                  placeholder="Contoh: 3"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="train-desc">Deskripsi & Prasyarat Pelatihan</Label>
              <Textarea
                id="train-desc"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tuliskan kurikulum ringkas, sasaran peserta, atau prasyarat ijazah/kompetensi..."
              />
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormOpen(false)}
                disabled={actionLoading}
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    Menyimpan...
                  </>
                ) : editingTraining ? (
                  'Simpan Perubahan'
                ) : (
                  'Buat Pelatihan'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={deleteConfirm !== null}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <DialogTitle className="text-base font-semibold">
                Hapus Jenis Pelatihan?
              </DialogTitle>
            </div>
          </DialogHeader>

          {deleteConfirm && (
            <div className="space-y-3 py-2 text-sm text-gray-600">
              <p>
                Apakah Anda yakin ingin menghapus program pelatihan{' '}
                <span className="font-semibold text-gray-900">{deleteConfirm.title}</span>?
              </p>

              {deleteConfirm.batchesCount > 0 ? (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 space-y-1">
                  <p className="font-semibold">Peringatan:</p>
                  <p>
                    Program ini masih memiliki {deleteConfirm.batchesCount} batch pelatihan aktif.
                    Anda harus menghapus atau memindahkan batch terkait terlebih dahulu sebelum
                    dapat menghapus jenis pelatihan ini.
                  </p>
                </div>
              ) : (
                <p className="text-xs text-gray-500">
                  Tindakan ini permanen dan data jenis pelatihan akan dihapus dari sistem.
                </p>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm(null)}
              disabled={actionLoading}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              disabled={
                !deleteConfirm ||
                deleteConfirm.batchesCount > 0 ||
                actionLoading
              }
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            >
              {actionLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  Menghapus...
                </>
              ) : (
                'Hapus Permanen'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Modal Kelola Kurikulum & Unit Kompetensi ─── */}
      <CompetencyUnitsManagerModal
        open={curriculumModal.open}
        onOpenChange={(open) => setCurriculumModal((prev) => ({ ...prev, open }))}
        trainingId={curriculumModal.trainingId}
        trainingTitle={curriculumModal.trainingTitle}
      />
    </div>
  );
}
