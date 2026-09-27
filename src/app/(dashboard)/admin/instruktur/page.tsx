'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  UserCheck,
  Search,
  RefreshCw,
  Loader2,
  AlertCircle,
  Award,
  ShieldCheck,
  Phone,
  Mail,
  FileBadge,
  Calendar,
} from 'lucide-react';
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
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

type TrainingCategory = 'PPR_ANALISIS' | 'PPR_BAGASI' | 'PKR_PEKERJA' | 'PPR_PENYEGARAN';
type InstructorStatus = 'ACTIVE' | 'INACTIVE';

interface InstructorRecord {
  id: number;
  userId: number;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  bapetenLicenseNo: string | null;
  licenseExpiryDate: string | null;
  iaeaCertification: boolean;
  specialization: TrainingCategory;
  status: InstructorStatus;
  bioSummary: string | null;
  createdAt: string;
  assignmentsCount: number;
  evaluationsCount: number;
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
    label: 'PKR Pekerja',
    badgeCls: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  PPR_PENYEGARAN: {
    label: 'PPR Penyegaran',
    badgeCls: 'bg-teal-100 text-teal-800 border-teal-200',
  },
};

export default function InstrukturPage() {
  const [instructors, setInstructors] = useState<InstructorRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Modal states
  const [formOpen, setFormOpen] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState<InstructorRecord | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<InstructorRecord | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [bapetenLicenseNo, setBapetenLicenseNo] = useState('');
  const [licenseExpiryDate, setLicenseExpiryDate] = useState('');
  const [iaeaCertification, setIaeaCertification] = useState(false);
  const [specialization, setSpecialization] = useState<TrainingCategory>('PPR_ANALISIS');
  const [status, setStatus] = useState<InstructorStatus>('ACTIVE');
  const [bioSummary, setBioSummary] = useState('');

  const fetchInstructors = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/instructors');
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Gagal memuat data');
      setInstructors(json.data ?? []);
    } catch {
      toast.error('Gagal memuat data instruktur');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInstructors();
  }, [fetchInstructors]);

  const handleOpenCreate = () => {
    setEditingInstructor(null);
    setFullName('');
    setEmail('');
    setPhoneNumber('');
    setPassword('');
    setBapetenLicenseNo('');
    setLicenseExpiryDate('');
    setIaeaCertification(false);
    setSpecialization('PPR_ANALISIS');
    setStatus('ACTIVE');
    setBioSummary('');
    setFormOpen(true);
  };

  const handleOpenEdit = (inst: InstructorRecord) => {
    setEditingInstructor(inst);
    setFullName(inst.fullName);
    setEmail(inst.email);
    setPhoneNumber(inst.phoneNumber || '');
    setPassword('');
    setBapetenLicenseNo(inst.bapetenLicenseNo || '');
    setLicenseExpiryDate(inst.licenseExpiryDate ? inst.licenseExpiryDate.split('T')[0] : '');
    setIaeaCertification(inst.iaeaCertification);
    setSpecialization(inst.specialization);
    setStatus(inst.status);
    setBioSummary(inst.bioSummary || '');
    setFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast.error('Nama lengkap instruktur wajib diisi');
      return;
    }
    if (!email.trim()) {
      toast.error('Email instruktur wajib diisi');
      return;
    }

    setActionLoading(true);
    try {
      const url = editingInstructor
        ? `/api/admin/instructors/${editingInstructor.id}`
        : '/api/admin/instructors';
      const method = editingInstructor ? 'PUT' : 'POST';

      const payload: any = {
        fullName: fullName.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim() || null,
        bapetenLicenseNo: bapetenLicenseNo.trim() || null,
        licenseExpiryDate: licenseExpiryDate || null,
        iaeaCertification,
        specialization,
        status,
        bioSummary: bioSummary.trim() || null,
      };

      if (password.trim()) {
        payload.password = password.trim();
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Gagal menyimpan instruktur');

      toast.success(
        editingInstructor
          ? 'Data instruktur berhasil diperbarui'
          : 'Instruktur baru berhasil ditambahkan'
      );
      setFormOpen(false);
      await fetchInstructors();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menyimpan data instruktur');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (inst: InstructorRecord) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/instructors/${inst.id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Gagal menghapus instruktur');

      toast.success('Instruktur berhasil dihapus');
      setDeleteConfirm(null);
      await fetchInstructors();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menghapus instruktur');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredInstructors = instructors.filter((i) => {
    const matchCat = filterCategory === 'ALL' || i.specialization === filterCategory;
    const matchStatus = filterStatus === 'ALL' || i.status === filterStatus;
    const matchSearch =
      !search ||
      i.fullName.toLowerCase().includes(search.toLowerCase()) ||
      i.email.toLowerCase().includes(search.toLowerCase()) ||
      (i.bapetenLicenseNo && i.bapetenLicenseNo.toLowerCase().includes(search.toLowerCase())) ||
      (i.phoneNumber && i.phoneNumber.includes(search));
    return matchCat && matchStatus && matchSearch;
  });

  const activeCount = instructors.filter((i) => i.status === 'ACTIVE').length;
  const iaeaCount = instructors.filter((i) => i.iaeaCertification).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Instruktur</h1>
          <p className="text-sm text-gray-500">
            Master data instruktur, lisensi pengajar BAPETEN, dan sertifikasi ahli proteksi radiasi
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchInstructors}
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
            Tambah Instruktur
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 font-medium">Total Instruktur</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          {loading ? (
            <Skeleton className="h-8 w-16 mt-2" />
          ) : (
            <p className="text-2xl font-bold text-gray-900 mt-2">{instructors.length}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">Tenaga ahli pengajar terdaftar</p>
        </div>

        <div className="bg-white border rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 font-medium">Instruktur Aktif</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          {loading ? (
            <Skeleton className="h-8 w-16 mt-2" />
          ) : (
            <p className="text-2xl font-bold text-emerald-700 mt-2">{activeCount}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">Siap ditugaskan mengajar</p>
        </div>

        <div className="bg-white border rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 font-medium">Sertifikasi IAEA</span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <Award className="w-5 h-5" />
            </div>
          </div>
          {loading ? (
            <Skeleton className="h-8 w-16 mt-2" />
          ) : (
            <p className="text-2xl font-bold text-purple-700 mt-2">{iaeaCount}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">Standar internasional IAEA</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'ALL', label: 'Semua Bidang' },
            { id: 'PPR_ANALISIS', label: 'PPR Analisis' },
            { id: 'PPR_BAGASI', label: 'PPR Bagasi' },
            { id: 'PKR_PEKERJA', label: 'PKR Pekerja' },
            { id: 'PPR_PENYEGARAN', label: 'PPR Penyegaran' },
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
          <div className="h-6 w-px bg-gray-200 my-auto mx-1 hidden sm:block" />
          {[
            { id: 'ALL', label: 'Semua Status' },
            { id: 'ACTIVE', label: 'Aktif' },
            { id: 'INACTIVE', label: 'Nonaktif' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setFilterStatus(st.id)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border',
                filterStatus === st.id
                  ? 'bg-slate-800 text-white border-slate-800 shadow-xs'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-slate-300'
              )}
            >
              {st.label}
            </button>
          ))}
        </div>
        <div className="relative ml-auto w-full sm:w-72">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Cari nama, email, lisensi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9 text-sm"
          />
        </div>
      </div>

      {/* Instructors Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/75">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">
                    Instruktur & Kontak
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">
                    Spesialisasi
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">
                    Lisensi BAPETEN
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500">
                    Status
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500">
                    Sesi Mengajar
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
                          <Skeleton className="h-5 w-48 mb-1.5" />
                          <Skeleton className="h-3 w-64" />
                        </td>
                        <td className="px-4 py-4">
                          <Skeleton className="h-5 w-24" />
                        </td>
                        <td className="px-4 py-4">
                          <Skeleton className="h-5 w-32" />
                        </td>
                        <td className="px-4 py-4 text-center">
                          <Skeleton className="h-5 w-16 mx-auto" />
                        </td>
                        <td className="px-4 py-4 text-center">
                          <Skeleton className="h-5 w-8 mx-auto" />
                        </td>
                        <td className="px-4 py-4 text-center">
                          <Skeleton className="h-7 w-16 mx-auto" />
                        </td>
                      </tr>
                    ))
                ) : filteredInstructors.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-400 text-sm">
                      Tidak ada data instruktur yang cocok dengan filter pencarian
                    </td>
                  </tr>
                ) : (
                  filteredInstructors.map((inst) => {
                    const catMeta = CATEGORY_MAP[inst.specialization] || {
                      label: inst.specialization,
                      badgeCls: 'bg-gray-100 text-gray-700',
                    };

                    return (
                      <tr key={inst.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="flex items-start gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                              {inst.fullName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 leading-snug">
                                {inst.fullName}
                              </p>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs text-gray-500 mt-0.5">
                                <span className="flex items-center gap-1">
                                  <Mail className="w-3 h-3 text-gray-400" />
                                  {inst.email}
                                </span>
                                {inst.phoneNumber && (
                                  <span className="flex items-center gap-1">
                                    <Phone className="w-3 h-3 text-gray-400" />
                                    {inst.phoneNumber}
                                  </span>
                                )}
                              </div>
                              {inst.bioSummary && (
                                <p className="text-[11px] text-gray-400 mt-1 line-clamp-1 max-w-sm">
                                  {inst.bioSummary}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="space-y-1">
                            <Badge
                              variant="outline"
                              className={cn('text-xs font-medium border px-2.5 py-0.5', catMeta.badgeCls)}
                            >
                              {catMeta.label}
                            </Badge>
                            {inst.iaeaCertification && (
                              <div className="flex items-center gap-1 text-[11px] text-purple-700 font-medium">
                                <Award className="w-3 h-3 text-purple-600" />
                                IAEA Certified
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-3.5 whitespace-nowrap text-xs">
                          {inst.bapetenLicenseNo ? (
                            <div>
                              <p className="font-mono font-medium text-gray-800 flex items-center gap-1">
                                <FileBadge className="w-3.5 h-3.5 text-blue-500" />
                                {inst.bapetenLicenseNo}
                              </p>
                              {inst.licenseExpiryDate && (
                                <p className="text-gray-400 text-[11px] mt-0.5 flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  Exp: {format(new Date(inst.licenseExpiryDate), 'd MMM yyyy', { locale: localeId })}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>

                        <td className="px-4 py-3.5 text-center whitespace-nowrap">
                          <span
                            className={cn(
                              'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                              inst.status === 'ACTIVE'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-gray-100 text-gray-600 border border-gray-200'
                            )}
                          >
                            {inst.status === 'ACTIVE' ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 text-center whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {inst.assignmentsCount} Sesi
                          </span>
                        </td>

                        <td className="px-4 py-3.5 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              onClick={() => handleOpenEdit(inst)}
                              title="Edit data instruktur"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => setDeleteConfirm(inst)}
                              title="Hapus instruktur"
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
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingInstructor ? 'Edit Data Instruktur' : 'Tambah Instruktur Baru'}
            </DialogTitle>
            <DialogDescription>
              Isikan data instruktur pengajar proteksi radiasi dan lisensi kompetensinya.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="inst-name">Nama Lengkap & Gelar *</Label>
                <Input
                  id="inst-name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Contoh: Ir. H. Expert Proteksi, M.Si."
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="inst-email">Email Login *</Label>
                <Input
                  id="inst-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="instruktur@alara.co.id"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="inst-phone">No. WhatsApp / Telepon</Label>
                <Input
                  id="inst-phone"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Contoh: 081234567890"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="inst-password">
                  {editingInstructor ? 'Password Baru (Kosongkan jika tidak diubah)' : 'Password Awal'}
                </Label>
                <Input
                  id="inst-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={editingInstructor ? '••••••••' : 'Default: InstrukturALARA2026!'}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="inst-license">No. Lisensi BAPETEN</Label>
                <Input
                  id="inst-license"
                  value={bapetenLicenseNo}
                  onChange={(e) => setBapetenLicenseNo(e.target.value)}
                  placeholder="Contoh: PPR-INSP-2024-009"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="inst-expiry">Masa Berlaku Lisensi</Label>
                <Input
                  id="inst-expiry"
                  type="date"
                  value={licenseExpiryDate}
                  onChange={(e) => setLicenseExpiryDate(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Bidang Spesialisasi *</Label>
                <Select
                  value={specialization}
                  onValueChange={(val) => setSpecialization(val as TrainingCategory)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih spesialisasi" />
                  </SelectTrigger>
                  <SelectContent className="w-[var(--anchor-width)]">
                    <SelectItem value="PPR_ANALISIS">PPR Analisis</SelectItem>
                    <SelectItem value="PPR_BAGASI">PPR X-Ray Bagasi</SelectItem>
                    <SelectItem value="PKR_PEKERJA">PKR Pekerja</SelectItem>
                    <SelectItem value="PPR_PENYEGARAN">PPR Penyegaran</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Status Instruktur *</Label>
                <Select
                  value={status}
                  onValueChange={(val) => setStatus(val as InstructorStatus)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent className="w-[var(--anchor-width)]">
                    <SelectItem value="ACTIVE">Aktif (Dapat Mengajar)</SelectItem>
                    <SelectItem value="INACTIVE">Nonaktif (Cuti / Istirahat)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1 pb-1">
              <input
                type="checkbox"
                id="inst-iaea"
                checked={iaeaCertification}
                onChange={(e) => setIaeaCertification(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="inst-iaea" className="text-xs text-gray-700 cursor-pointer font-medium">
                Memiliki Sertifikasi Internasional IAEA (International Atomic Energy Agency)
              </Label>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="inst-bio">Ringkasan Pengalaman / Profil Singkat</Label>
              <Textarea
                id="inst-bio"
                rows={3}
                value={bioSummary}
                onChange={(e) => setBioSummary(e.target.value)}
                placeholder="Pengalaman inspeksi radiasi, riwayat jabatan, atau sertifikasi keahlian khusus..."
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
                ) : editingInstructor ? (
                  'Simpan Perubahan'
                ) : (
                  'Tambah Instruktur'
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
                Hapus Data Instruktur?
              </DialogTitle>
            </div>
          </DialogHeader>

          {deleteConfirm && (
            <div className="space-y-3 py-2 text-sm text-gray-600">
              <p>
                Apakah Anda yakin ingin menghapus instruktur{' '}
                <span className="font-semibold text-gray-900">{deleteConfirm.fullName}</span>?
              </p>

              {deleteConfirm.assignmentsCount > 0 ? (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 space-y-1">
                  <p className="font-semibold">Peringatan:</p>
                  <p>
                    Instruktur ini memiliki {deleteConfirm.assignmentsCount} jadwal sesi mengajar aktif.
                    Hapus atau alihkan penugasan sesi terlebih dahulu pada menu Kelola Batch sebelum menghapus instruktur ini.
                  </p>
                </div>
              ) : (
                <p className="text-xs text-gray-500">
                  Tindakan ini permanen dan profil instruktur akan dihapus dari sistem.
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
                deleteConfirm.assignmentsCount > 0 ||
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
    </div>
  );
}
