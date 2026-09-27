'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  RefreshCw,
  Loader2,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  FileSignature,
  Building2,
  Award,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

interface SignatoryRecord {
  id: number;
  name: string;
  position: string;
  institution: string;
  nip: string | null;
  signatureUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    examResults: number;
  };
}

export default function AdminPenandatanganPage() {
  const [signatories, setSignatories] = useState<SignatoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [editId, setEditId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [institution, setInstitution] = useState('CV. HIKMAT PROTEKSI ALARA');
  const [nip, setNip] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Delete dialog state
  const [deleteTarget, setDeleteTarget] = useState<SignatoryRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Toggle status dialog state
  const [statusTarget, setStatusTarget] = useState<SignatoryRecord | null>(null);
  const [toggling, setToggling] = useState(false);

  const fetchSignatories = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/signatories');
      if (!res.ok) {
        throw new Error('Gagal mengambil data penandatangan');
      }
      const data: SignatoryRecord[] = await res.json();
      setSignatories(data);
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSignatories();
  }, [fetchSignatories]);

  const openCreateDialog = () => {
    setIsEditing(false);
    setEditId(null);
    setName('');
    setPosition('Kepala Lembaga Pelatihan Ketenaganukliran');
    setInstitution('CV. HIKMAT PROTEKSI ALARA');
    setNip('');
    setIsActive(true);
    setFormOpen(true);
  };

  const openEditDialog = (item: SignatoryRecord) => {
    setIsEditing(true);
    setEditId(item.id);
    setName(item.name);
    setPosition(item.position);
    setInstitution(item.institution);
    setNip(item.nip || '');
    setIsActive(item.isActive);
    setFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Nama lengkap penandatangan wajib diisi');
      return;
    }
    if (!position.trim()) {
      toast.error('Jabatan resmi penandatangan wajib diisi');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name: name.trim(),
        position: position.trim(),
        institution: institution.trim() || 'CV. HIKMAT PROTEKSI ALARA',
        nip: nip.trim() || null,
        isActive,
      };

      const url = isEditing
        ? `/api/admin/signatories/${editId}`
        : '/api/admin/signatories';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Gagal menyimpan penandatangan');
      }

      toast.success(
        isEditing
          ? 'Data penandatangan berhasil diperbarui'
          : 'Penandatangan baru berhasil ditambahkan'
      );
      setFormOpen(false);
      fetchSignatories();
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!statusTarget) return;
    try {
      setToggling(true);
      const newStatus = !statusTarget.isActive;
      const res = await fetch(`/api/admin/signatories/${statusTarget.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newStatus }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Gagal mengubah status penandatangan');
      }

      toast.success(
        newStatus
          ? `${statusTarget.name} sekarang aktif sebagai penandatangan sertifikat utama`
          : `Status ${statusTarget.name} diubah menjadi nonaktif`
      );
      setStatusTarget(null);
      fetchSignatories();
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan');
    } finally {
      setToggling(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      const res = await fetch(`/api/admin/signatories/${deleteTarget.id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Gagal menghapus penandatangan');
      }

      toast.success('Penandatangan berhasil dihapus');
      setDeleteTarget(null);
      fetchSignatories();
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan');
    } finally {
      setDeleting(false);
    }
  };

  const filteredSignatories = signatories.filter((item) => {
    const q = search.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.position.toLowerCase().includes(q) ||
      (item.nip && item.nip.toLowerCase().includes(q))
    );
  });

  const activeSignatory = signatories.find((s) => s.isActive);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileSignature className="w-7 h-7 text-blue-600" />
            Pengaturan Penandatangan Sertifikat
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola nama pejabat penandatangan e-sertifikat resmi. Pengurus lama cukup dinonaktifkan agar arsip sertifikat tetap valid.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSignatories}
            disabled={loading}
            className="gap-1.5"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={openCreateDialog} className="gap-1.5 bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4" />
            Tambah Penandatangan
          </Button>
        </div>
      </div>

      {/* Highlights: Active Signatory Banner */}
      {activeSignatory ? (
        <Card className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white shadow-md border-0">
          <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Penandatangan Aktif Saat Ini (Default Sistem)
              </span>
              <h2 className="text-xl font-bold">{activeSignatory.name}</h2>
              <p className="text-sm text-blue-200">
                {activeSignatory.position} &bull; {activeSignatory.institution}
                {activeSignatory.nip ? ` (NIP: ${activeSignatory.nip})` : ''}
              </p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 border border-white/10 text-xs space-y-1 md:text-right">
              <span className="text-blue-200 block">Sertifikat Resmi Diterbitkan:</span>
              <span className="text-lg font-bold text-white font-mono">
                {activeSignatory._count?.examResults || 0} Dokumen
              </span>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4 flex items-center gap-3 text-amber-800 text-sm">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-semibold">Belum ada penandatangan yang berstatus aktif!</span>{' '}
              Sertifikat yang diterbitkan akan menggunakan nama default sistem hingga Anda mengaktifkan salah satu pejabat.
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Table Card */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="py-4 px-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="text-base font-semibold text-slate-800">
            Daftar Pejabat Penandatangan ({signatories.length})
          </CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Cari nama atau jabatan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : filteredSignatories.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <FileSignature className="w-12 h-12 mx-auto text-slate-300" />
              <p className="font-medium text-slate-600">Tidak ada data penandatangan</p>
              <p className="text-xs">
                {search ? 'Tidak ada penandatangan yang cocok dengan pencarian Anda' : 'Klik tombol Tambah Penandatangan untuk membuat data baru'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3.5">Nama & Gelar</th>
                    <th className="px-6 py-3.5">Jabatan Resmi</th>
                    <th className="px-6 py-3.5 text-center">Status</th>
                    <th className="px-6 py-3.5 text-center">Sertifikat Terbit</th>
                    <th className="px-6 py-3.5 text-slate-500">Tanggal Ditambahkan</th>
                    <th className="px-6 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSignatories.map((item) => (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        item.isActive ? 'bg-blue-50/30' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          {item.name}
                          {item.isActive && (
                            <Badge className="bg-blue-600 text-white text-[10px] py-0 px-1.5 h-4">
                              Utama
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          {item.institution}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-800">{item.position}</div>
                        {item.nip ? (
                          <div className="text-xs text-slate-500 font-mono mt-0.5">
                            NIP/Reg: {item.nip}
                          </div>
                        ) : (
                          <div className="text-xs text-slate-400 italic">Tanpa NIP</div>
                        )}
                      </td>

                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => setStatusTarget(item)}
                          className="group focus:outline-none"
                          title="Klik untuk mengubah status aktif/nonaktif"
                        >
                          {item.isActive ? (
                            <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1 cursor-pointer transition-colors shadow-xs">
                              <CheckCircle2 className="w-3 h-3" />
                              Aktif
                            </Badge>
                          ) : (
                            <Badge
                              variant="secondary"
                              className="bg-slate-100 text-slate-600 hover:bg-slate-200 gap-1 cursor-pointer transition-colors border border-slate-200"
                            >
                              <XCircle className="w-3 h-3 text-slate-400" />
                              Nonaktif
                            </Badge>
                          )}
                        </button>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1 font-mono text-xs px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium">
                          <Award className="w-3.5 h-3.5 text-blue-600" />
                          {item._count?.examResults || 0}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-xs text-slate-500">
                        {item.createdAt ? (
                          format(new Date(item.createdAt), 'dd MMM yyyy', {
                            locale: localeId,
                          })
                        ) : (
                          '-'
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(item)}
                            className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                            title="Edit Data"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteTarget(item)}
                            className="h-8 w-8 text-red-600 hover:bg-red-50"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Modal (Create / Edit) */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSignature className="w-5 h-5 text-blue-600" />
              {isEditing ? 'Ubah Data Penandatangan' : 'Tambah Penandatangan Baru'}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Perbarui informasi pejabat penandatangan sertifikat resmi ALARA.'
                : 'Daftarkan pejabat baru untuk menandatangani e-sertifikat kelulusan pelatihan.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleFormSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="sigName" className="text-xs font-semibold text-slate-700">
                Nama Lengkap & Gelar <span className="text-red-500">*</span>
              </Label>
              <Input
                id="sigName"
                placeholder="Contoh: Dr. Ir. Ahmad Sudrajat, M.Si."
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sigPos" className="text-xs font-semibold text-slate-700">
                Jabatan Resmi <span className="text-red-500">*</span>
              </Label>
              <Input
                id="sigPos"
                placeholder="Contoh: Kepala Lembaga Pelatihan Ketenaganukliran"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="sigInst" className="text-xs font-semibold text-slate-700">
                  Lembaga / Institusi
                </Label>
                <Input
                  id="sigInst"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sigNip" className="text-xs font-semibold text-slate-700">
                  NIP / No. Registrasi (Opsional)
                </Label>
                <Input
                  id="sigNip"
                  placeholder="Contoh: 198205122005011003"
                  value={nip}
                  onChange={(e) => setNip(e.target.value)}
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-slate-800 block">
                  Jadikan Penandatangan Aktif
                </span>
                <span className="text-xs text-slate-500">
                  Jika aktif, penandatangan ini otomatis digunakan pada setiap sertifikat baru yang di-generate.
                </span>
              </div>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>

            <DialogFooter className="pt-3 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormOpen(false)}
                disabled={submitting}
              >
                Batal
              </Button>
              <Button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700">
                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isEditing ? 'Simpan Perubahan' : 'Simpan Penandatangan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmation Modal: Toggle Active / Inactive Status */}
      <Dialog open={!!statusTarget} onOpenChange={(open) => !open && setStatusTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Konfirmasi Ubah Status Penandatangan</DialogTitle>
            <DialogDescription>
              {statusTarget?.isActive ? (
                <span>
                  Apakah Anda yakin ingin menonaktifkan <strong>{statusTarget?.name}</strong>? Penandatangan nonaktif tidak akan digunakan untuk sertifikat baru, tetapi riwayat sertifikat terdahulu tetap terjaga.
                </span>
              ) : (
                <span>
                  Apakah Anda ingin mengaktifkan <strong>{statusTarget?.name}</strong> sebagai penandatangan utama? Pejabat yang sebelumnya aktif akan otomatis dinonaktifkan.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setStatusTarget(null)}
              disabled={toggling}
            >
              Batal
            </Button>
            <Button
              onClick={handleToggleStatus}
              disabled={toggling}
              className={
                statusTarget?.isActive
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }
            >
              {toggling && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {statusTarget?.isActive ? 'Ya, Nonaktifkan' : 'Ya, Aktifkan Pejabat Ini'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Modal: Delete Signatory */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Hapus Data Penandatangan?
            </DialogTitle>
            <DialogDescription>
              Anda akan menghapus data <strong>{deleteTarget?.name}</strong>. Tindakan ini hanya dapat dilakukan jika belum ada sertifikat resmi yang menautkan nama penandatangan ini.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              Batal
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Hapus Sekarang
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
