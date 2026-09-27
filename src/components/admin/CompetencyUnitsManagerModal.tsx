'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Plus,
  Edit2,
  Trash2,
  BookOpen,
  Award,
  Layers,
  Save,
  Loader2,
  FileText,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

export interface CompetencyUnit {
  id: number;
  trainingId: number;
  sectionCode: string;
  sectionTitle: string;
  unitNo: string;
  mataAjar: string;
  kode: string;
  kodeKompetensi: string | null;
  jp: number;
  orderIndex: number;
}

export interface TrainingCertHeader {
  id: number;
  title: string;
  category: string;
  titleEn: string | null;
  certHeaderId: string | null;
  certSubtitleId: string | null;
  certHeaderEn: string | null;
}

interface CompetencyUnitsManagerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trainingId: number | null;
  trainingTitle?: string;
}

const SECTION_OPTIONS = [
  { code: 'A', title: 'MATERI PELATIHAN KOMPETENSI DASAR' },
  { code: 'B', title: 'MATERI PELATIHAN UTAMA: KOMPETENSI INTI' },
  { code: 'C', title: 'MATERI PELATIHAN UTAMA: KOMPETENSI PILIHAN' },
  { code: 'D', title: 'MATERI PENDUKUNG' },
];

export default function CompetencyUnitsManagerModal({
  open,
  onOpenChange,
  trainingId,
  trainingTitle,
}: CompetencyUnitsManagerModalProps) {
  const [activeTab, setActiveTab] = useState<'units' | 'headers'>('units');
  const [loading, setLoading] = useState(false);
  const [training, setTraining] = useState<TrainingCertHeader | null>(null);
  const [units, setUnits] = useState<CompetencyUnit[]>([]);

  // Sub-modal state for Create/Edit Unit
  const [unitFormOpen, setUnitFormOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<CompetencyUnit | null>(null);
  const [deleteConfirmUnit, setDeleteConfirmUnit] = useState<CompetencyUnit | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Unit Form fields
  const [sectionCode, setSectionCode] = useState('A');
  const [unitNo, setUnitNo] = useState('1.');
  const [mataAjar, setMataAjar] = useState('');
  const [kode, setKode] = useState('');
  const [kodeKompetensi, setKodeKompetensi] = useState('');
  const [jp, setJp] = useState(2);

  // Header form fields
  const [titleEn, setTitleEn] = useState('');
  const [certHeaderId, setCertHeaderId] = useState('');
  const [certSubtitleId, setCertSubtitleId] = useState('');
  const [certHeaderEn, setCertHeaderEn] = useState('');

  const fetchUnits = useCallback(async () => {
    if (!trainingId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/trainings/${trainingId}/competency-units`);
      if (!res.ok) throw new Error();
      const resData = await res.json();
      setTraining(resData.data.training);
      setUnits(resData.data.units || []);

      // Pre-fill header settings
      setTitleEn(resData.data.training.titleEn || '');
      setCertHeaderId(resData.data.training.certHeaderId || '');
      setCertSubtitleId(resData.data.training.certSubtitleId || '');
      setCertHeaderEn(resData.data.training.certHeaderEn || '');
    } catch {
      toast.error('Gagal memuat data kurikulum unit kompetensi');
    } finally {
      setLoading(false);
    }
  }, [trainingId]);

  useEffect(() => {
    if (open && trainingId) {
      fetchUnits();
    }
  }, [open, trainingId, fetchUnits]);

  // Open Form to Add Unit
  const handleOpenAddUnit = (defaultSection = 'A') => {
    setEditingUnit(null);
    setSectionCode(defaultSection);
    // Find next unit number in that section
    const secUnits = units.filter((u) => u.sectionCode === defaultSection);
    setUnitNo(`${secUnits.length + 1}.`);
    setMataAjar('');
    setKode('');
    setKodeKompetensi('-');
    setJp(2);
    setUnitFormOpen(true);
  };

  // Open Form to Edit Unit
  const handleOpenEditUnit = (unit: CompetencyUnit) => {
    setEditingUnit(unit);
    setSectionCode(unit.sectionCode);
    setUnitNo(unit.unitNo);
    setMataAjar(unit.mataAjar);
    setKode(unit.kode);
    setKodeKompetensi(unit.kodeKompetensi || '-');
    setJp(unit.jp);
    setUnitFormOpen(true);
  };

  // Submit Unit Create/Update
  const handleSubmitUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trainingId || !mataAjar.trim() || !kode.trim()) {
      toast.error('Mohon isi nama mata ajar dan kode silabus');
      return;
    }

    const secObj = SECTION_OPTIONS.find((s) => s.code === sectionCode) || {
      code: sectionCode,
      title: `MATERI KELOMPOK ${sectionCode}`,
    };

    setActionLoading(true);
    try {
      const url = editingUnit
        ? `/api/admin/trainings/${trainingId}/competency-units/${editingUnit.id}`
        : `/api/admin/trainings/${trainingId}/competency-units`;
      const method = editingUnit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionCode: secObj.code,
          sectionTitle: secObj.title,
          unitNo,
          mataAjar,
          kode,
          kodeKompetensi: kodeKompetensi.trim() || '-',
          jp,
        }),
      });

      if (!res.ok) throw new Error();
      toast.success(editingUnit ? 'Mata ajar diperbarui' : 'Mata ajar berhasil ditambahkan');
      setUnitFormOpen(false);
      await fetchUnits();
    } catch {
      toast.error('Gagal menyimpan unit kompetensi');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Unit
  const handleDeleteUnit = async () => {
    if (!trainingId || !deleteConfirmUnit) return;
    setActionLoading(true);
    try {
      const res = await fetch(
        `/api/admin/trainings/${trainingId}/competency-units/${deleteConfirmUnit.id}`,
        { method: 'DELETE' }
      );
      if (!res.ok) throw new Error();
      toast.success('Mata ajar berhasil dihapus');
      setDeleteConfirmUnit(null);
      await fetchUnits();
    } catch {
      toast.error('Gagal menghapus mata ajar');
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Header Info
  const handleSaveHeaders = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trainingId) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/trainings/${trainingId}/competency-units/headers`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titleEn,
          certHeaderId,
          certSubtitleId,
          certHeaderEn,
        }),
      });

      if (!res.ok) throw new Error();
      toast.success('Pengaturan judul dan header sertifikat berhasil disimpan');
      await fetchUnits();
    } catch {
      toast.error('Gagal menyimpan header sertifikat');
    } finally {
      setActionLoading(false);
    }
  };

  // Calculate total JP
  const totalJp = units.reduce((acc, u) => acc + u.jp, 0);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
          {/* Header */}
          <DialogHeader className="p-6 pb-4 border-b bg-slate-50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-blue-600" />
                  Kurikulum & Unit Kompetensi (Halaman 2 Sertifikat)
                </DialogTitle>
                <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                  {trainingTitle || training?.title}
                </p>
              </div>

              {/* Tab Selector */}
              <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 text-xs shadow-2xs self-start sm:self-center shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveTab('units')}
                  className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                    activeTab === 'units'
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Daftar Mata Ajar ({units.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('headers')}
                  className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                    activeTab === 'headers'
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Header & Bahasa Inggris
                </button>
              </div>
            </div>
          </DialogHeader>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-lg" />
                ))}
              </div>
            ) : activeTab === 'units' ? (
              /* TAB 1: DAFTAR MATA AJAR */
              <div className="space-y-6">
                {/* Top Action Bar */}
                <div className="flex items-center justify-between pb-2 border-b">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <span className="font-semibold text-slate-900">Total Durasi:</span>
                    <Badge variant="secondary" className="font-mono font-bold text-xs bg-blue-50 text-blue-700">
                      {totalJp} Jam Pelajaran (JP)
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleOpenAddUnit('A')}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5 h-8 font-medium shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Tambah Mata Ajar
                  </Button>
                </div>

                {/* Grouped by Section (A, B, C, D) */}
                {SECTION_OPTIONS.map((sec) => {
                  const sectionUnits = units.filter((u) => u.sectionCode === sec.code);

                  return (
                    <div key={sec.code} className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                      {/* Section Title Banner */}
                      <div className="bg-slate-100/80 px-4 py-2.5 flex items-center justify-between border-b border-slate-200">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-md bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                            {sec.code}
                          </span>
                          <span className="font-bold text-xs text-slate-800 tracking-wide uppercase">
                            {sec.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-500 font-medium">
                            {sectionUnits.length} Materi &bull; {sectionUnits.reduce((a, b) => a + b.jp, 0)} JP
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenAddUnit(sec.code)}
                            className="h-6 text-[11px] text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2"
                          >
                            + Tambah
                          </Button>
                        </div>
                      </div>

                      {/* Units Table */}
                      {sectionUnits.length === 0 ? (
                        <div className="p-4 text-center text-slate-400 text-xs italic bg-white">
                          Belum ada materi pada kelompok ini.{' '}
                          <button
                            type="button"
                            onClick={() => handleOpenAddUnit(sec.code)}
                            className="text-blue-600 hover:underline font-medium not-italic"
                          >
                            Tambah sekarang
                          </button>
                        </div>
                      ) : (
                        <div className="overflow-x-auto bg-white">
                          <table className="w-full text-xs text-left border-collapse">
                            <thead>
                              <tr className="border-b bg-slate-50/50 text-[11px] text-slate-500 font-semibold">
                                <th className="py-2 px-3 w-10 text-center">No</th>
                                <th className="py-2 px-3">Mata Ajar</th>
                                <th className="py-2 px-3 w-44">Kode Silabus</th>
                                <th className="py-2 px-3 w-52">Kode Kompetensi</th>
                                <th className="py-2 px-2 w-14 text-center">JP</th>
                                <th className="py-2 px-3 w-20 text-center">Aksi</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {sectionUnits.map((u) => (
                                <tr key={u.id} className="hover:bg-slate-50/80">
                                  <td className="py-2.5 px-3 text-center font-medium text-slate-500">
                                    {u.unitNo}
                                  </td>
                                  <td className="py-2.5 px-3 font-semibold text-slate-900 leading-snug">
                                    {u.mataAjar}
                                  </td>
                                  <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">
                                    {u.kode}
                                  </td>
                                  <td className="py-2.5 px-3 font-mono text-[10.5px] text-slate-600 whitespace-pre-line leading-tight">
                                    {u.kodeKompetensi || '-'}
                                  </td>
                                  <td className="py-2.5 px-2 text-center font-bold text-slate-800">
                                    {u.jp}
                                  </td>
                                  <td className="py-2.5 px-3 text-center">
                                    <div className="flex items-center justify-center gap-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 w-7 p-0 text-blue-600 hover:bg-blue-50"
                                        onClick={() => handleOpenEditUnit(u)}
                                        title="Edit mata ajar"
                                      >
                                        <Edit2 className="w-3.5 h-3.5" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 w-7 p-0 text-red-600 hover:bg-red-50"
                                        onClick={() => setDeleteConfirmUnit(u)}
                                        title="Hapus mata ajar"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              /* TAB 2: PENGATURAN HEADER & BAHASA INGGRIS */
              <form onSubmit={handleSaveHeaders} className="space-y-4 max-w-2xl mx-auto">
                <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-4 text-xs text-blue-900 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-blue-600" />
                    Penyesuaian Header Sertifikat (Halaman 1 & Halaman 2)
                  </p>
                  <p className="text-blue-700 leading-relaxed">
                    Teks ini akan tertera pada bagian judul sertifikat dalam Bahasa Indonesia dan Bahasa Inggris
                    secara resmi.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Judul Pelatihan Bahasa Inggris (Halaman 1)</Label>
                  <Input
                    placeholder="Contoh: RPO Baggage Scanners or Other Items Using Ionizing Radiation Sources"
                    value={titleEn}
                    onChange={(e) => setTitleEn(e.target.value)}
                    className="text-xs font-medium"
                  />
                  <p className="text-[11px] text-slate-400">
                    Ditampilkan miring (*italic*) di bawah nama program pelatihan pada Halaman Depan.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Header Judul Halaman 2 (Indonesia)</Label>
                  <Input
                    placeholder="Contoh: DAFTAR UNIT KOMPETENSI PELATIHAN PETUGAS PPR"
                    value={certHeaderId}
                    onChange={(e) => setCertHeaderId(e.target.value)}
                    className="text-xs font-medium uppercase"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Subtitle Program Halaman 2 (Indonesia)</Label>
                  <Input
                    placeholder="Contoh: PEMINDAI BAGASI ATAU BARANG LAINNYA MENGGUNAKAN SRP"
                    value={certSubtitleId}
                    onChange={(e) => setCertSubtitleId(e.target.value)}
                    className="text-xs font-medium uppercase"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Header Judul Halaman 2 (English)</Label>
                  <Input
                    placeholder="Contoh: LIST OF COMPETENCY UNITS FOR TRAINING OF RADIATION PROTECTION OFFICER IN BAGGAGE SCANNER..."
                    value={certHeaderEn}
                    onChange={(e) => setCertHeaderEn(e.target.value)}
                    className="text-xs font-medium uppercase"
                  />
                  <p className="text-[11px] text-slate-400">
                    Ditampilkan dalam tanda kurung miring di bagian atas tabel unit kompetensi.
                  </p>
                </div>

                <div className="pt-3 flex justify-end">
                  <Button
                    type="submit"
                    disabled={actionLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5 font-semibold"
                  >
                    {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    Simpan Pengaturan Judul
                  </Button>
                </div>
              </form>
            )}
          </div>

          {/* Footer */}
          <DialogFooter className="p-4 border-t bg-slate-50 flex justify-end">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Sub-modal: Form Tambah / Edit Mata Ajar ─── */}
      <Dialog open={unitFormOpen} onOpenChange={(open) => !open && setUnitFormOpen(false)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              {editingUnit ? 'Edit Mata Ajar / Unit Kompetensi' : 'Tambah Mata Ajar Baru'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmitUnit} className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label className="text-xs">Kelompok Materi *</Label>
                <select
                  value={sectionCode}
                  onChange={(e) => setSectionCode(e.target.value)}
                  className="w-full text-xs h-9 rounded-md border border-slate-300 px-2.5 bg-white font-medium focus:ring-2 focus:ring-blue-500"
                >
                  {SECTION_OPTIONS.map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.code}. {s.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">No. Urut *</Label>
                <Input
                  value={unitNo}
                  onChange={(e) => setUnitNo(e.target.value)}
                  placeholder="Contoh: 1."
                  className="text-xs font-mono h-9"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Nama Mata Ajar *</Label>
              <Textarea
                value={mataAjar}
                onChange={(e) => setMataAjar(e.target.value)}
                placeholder="Contoh: Fundamental Radioaktivitas: Peluruhan, Sifat & Dosimetri..."
                className="text-xs leading-relaxed min-h-[70px]"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label className="text-xs">Kode Silabus *</Label>
                <Input
                  value={kode}
                  onChange={(e) => setKode(e.target.value)}
                  placeholder="Contoh: SI-PPR-PEMINDAI-HP-ALARA-01"
                  className="text-xs font-mono h-9"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Jam Pelajaran (JP) *</Label>
                <Input
                  type="number"
                  min={1}
                  max={40}
                  value={jp}
                  onChange={(e) => setJp(parseInt(e.target.value) || 2)}
                  className="text-xs font-bold text-center h-9"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">
                Kode Unit Kompetensi SKKNI/BAPETEN{' '}
                <span className="text-slate-400 font-normal">(Opsional, pisahkan baris jika lebih dari satu)</span>
              </Label>
              <Textarea
                value={kodeKompetensi}
                onChange={(e) => setKodeKompetensi(e.target.value)}
                placeholder={'Contoh:\nC.26PPR00.035.1\nC.26PPR00.001.1'}
                className="text-xs font-mono min-h-[65px] leading-tight"
              />
              <p className="text-[10px] text-slate-400">Gunakan tanda hubung (-) jika materi dasar tanpa unit kompetensi khusus.</p>
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setUnitFormOpen(false)}>
                Batal
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                disabled={actionLoading}
              >
                {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : editingUnit ? 'Simpan' : 'Tambahkan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── Sub-modal: Konfirmasi Hapus Mata Ajar ─── */}
      <Dialog open={deleteConfirmUnit !== null} onOpenChange={(open) => !open && setDeleteConfirmUnit(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-red-600 text-base font-bold">Hapus Mata Ajar?</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-slate-600 leading-relaxed">
            Apakah Anda yakin ingin menghapus materi <strong>"{deleteConfirmUnit?.mataAjar}"</strong> dari
            silabus sertifikat pelatihan ini?
          </p>
          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setDeleteConfirmUnit(null)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={actionLoading}
              onClick={handleDeleteUnit}
            >
              {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Hapus Mata Ajar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
