'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Search,
  CheckCircle2,
  XCircle,
  FileText,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Eye,
  ArrowLeft,
  ExternalLink,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { format, addMonths, isBefore } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Document {
  id: number;
  docType: string;
  filePath: string;
  isValid: boolean | null;
  notes: string | null;
  verifiedAt: string | null;
  mcuIssueDate: string | null;
  hasDarah: boolean | null;
  hasUrine: boolean | null;
}

interface RegistrationItem {
  id: number;
  pesertaName: string;
  email: string;
  nik: string;
  instansi: string;
  program: string;
  batch: string;
  batchId: number;
  registrationStatus: string;
  paymentStatus: string;
  createdAt: string;
  sponsorName: string | null;
  documents: Document[];
}

const DOC_TYPE_LABELS: Record<string, string> = {
  KTP: 'KTP / Kartu Identitas',
  IJAZAH: 'Ijazah Terakhir',
  MCU: 'Hasil MCU (Medical Check Up)',
  SURAT_KERJA: 'Surat Keterangan Kerja',
  PASFOTO: 'Pas Foto 3x4',
  NPWP: 'NPWP',
};

const STATUS_REG: Record<string, { label: string; cls: string }> = {
  DRAFT: { label: 'Draft', cls: 'bg-gray-100 text-gray-600' },
  MENUNGGU_VERIFIKASI: { label: 'Menunggu', cls: 'bg-yellow-100 text-yellow-700' },
  APPROVED: { label: 'Disetujui', cls: 'bg-green-100 text-green-700' },
  REJECTED: { label: 'Ditolak', cls: 'bg-red-100 text-red-700' },
};

const STATUS_PAY: Record<string, { label: string; cls: string }> = {
  UNPAID: { label: 'Belum Bayar', cls: 'bg-gray-100 text-gray-600' },
  PENDING_VERIFICATION: { label: 'Pending Verifikasi', cls: 'bg-blue-100 text-blue-700' },
  PAID: { label: 'Lunas', cls: 'bg-green-100 text-green-700' },
};

function Chip({ status, map }: { status: string; map: Record<string, { label: string; cls: string }> }) {
  const s = map[status] ?? { label: status, cls: 'bg-gray-100 text-gray-600' };
  return <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-medium', s.cls)}>{s.label}</span>;
}

// ─── MCU Warning ─────────────────────────────────────────────────────────────
function mcuExpired(mcuIssueDate: string | null): boolean {
  if (!mcuIssueDate) return false;
  const expiryDate = addMonths(new Date(mcuIssueDate), 6);
  return isBefore(expiryDate, new Date());
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function VerifikasiPage() {
  const [items, setItems] = useState<RegistrationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<RegistrationItem | null>(null);
  const [rejectModal, setRejectModal] = useState<{ open: boolean; docId: number | null }>({ open: false, docId: null });
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [bulkSelected, setBulkSelected] = useState<number[]>([]);

  // MCU fields per doc
  const [mcuInputs, setMcuInputs] = useState<Record<number, { date: string; darah: boolean; urine: boolean }>>({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/verifikasi');
      const json = await res.json();
      setItems(json.data ?? []);
    } catch {
      toast.error('Gagal memuat data verifikasi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = items.filter((item) => {
    const matchTab =
      tab === 'all' ||
      (tab === 'pending' && item.registrationStatus === 'MENUNGGU_VERIFIKASI') ||
      (tab === 'approved' && item.registrationStatus === 'APPROVED') ||
      (tab === 'rejected' && item.registrationStatus === 'REJECTED');
    const matchSearch =
      !search ||
      item.pesertaName.toLowerCase().includes(search.toLowerCase()) ||
      item.instansi?.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const handleVerifyDoc = async (docId: number, isValid: boolean, notes?: string, mcuData?: object) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/verifikasi/${docId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isValid, notes, ...mcuData }),
      });
      if (!res.ok) throw new Error();
      toast.success(isValid ? 'Dokumen disetujui' : 'Dokumen ditolak');
      await fetchData();

      // Refresh selected item
      const updated = await fetch('/api/admin/verifikasi');
      const json = await updated.json();
      const updatedItems: RegistrationItem[] = json.data ?? [];
      setItems(updatedItems);
      if (selected) {
        const updatedSelected = updatedItems.find((i) => i.id === selected.id);
        if (updatedSelected) setSelected(updatedSelected);
      }
    } catch {
      toast.error('Gagal memperbarui status dokumen');
    } finally {
      setActionLoading(false);
      setRejectModal({ open: false, docId: null });
      setRejectReason('');
    }
  };

  const handleBulkApprove = async () => {
    if (!bulkSelected.length) return;
    setActionLoading(true);
    try {
      await Promise.all(
        bulkSelected.map((id) =>
          fetch(`/api/admin/verifikasi/registration/${id}/approve`, { method: 'PATCH' })
        )
      );
      toast.success(`${bulkSelected.length} pendaftaran disetujui`);
      setBulkSelected([]);
      await fetchData();
    } catch {
      toast.error('Gagal bulk approve');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveRegistration = async (registrationId: number) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/verifikasi/registration/${registrationId}/approve`, {
        method: 'PATCH',
      });
      if (!res.ok) throw new Error();
      toast.success('Pendaftaran dan seluruh berkas berhasil disetujui');
      await fetchData();

      // Refresh selected item
      const updated = await fetch('/api/admin/verifikasi');
      const json = await updated.json();
      const updatedItems: RegistrationItem[] = json.data ?? [];
      setItems(updatedItems);
      if (selected) {
        const updatedSelected = updatedItems.find((i) => i.id === selected.id);
        if (updatedSelected) setSelected(updatedSelected);
      }
    } catch {
      toast.error('Gagal menyetujui pendaftaran');
    } finally {
      setActionLoading(false);
    }
  };

  const counts = {
    all: items.length,
    pending: items.filter((i) => i.registrationStatus === 'MENUNGGU_VERIFIKASI').length,
    approved: items.filter((i) => i.registrationStatus === 'APPROVED').length,
    rejected: items.filter((i) => i.registrationStatus === 'REJECTED').length,
  };

  return (
    <div className="space-y-6">
      {/* ─────────────────── TAMPILAN DETAIL DOKUMEN ─────────────────── */}
      {selected ? (
        <div className="space-y-6">
          {/* Header Action & Navigasi Kembali */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelected(null)}
                className="gap-2 text-slate-700 hover:text-slate-900 border-slate-300 font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Kembali ke Daftar Verifikasi
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Chip status={selected.registrationStatus} map={STATUS_REG} />
              <Chip status={selected.paymentStatus} map={STATUS_PAY} />
              {selected.registrationStatus !== 'APPROVED' && (
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white ml-2 gap-1.5"
                  onClick={() => handleApproveRegistration(selected.id)}
                  disabled={actionLoading}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Setujui Semua Berkas
                </Button>
              )}
            </div>
          </div>

          {/* Informasi Header Peserta */}
          <Card className="border border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50/70 border-b border-slate-200 py-3.5 px-6">
              <CardTitle className="text-base text-slate-800 font-bold">
                Informasi Pendaftaran Peserta
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3.5 text-sm">
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 py-1.5 border-b border-slate-100">
                  <span className="w-36 shrink-0 font-semibold text-slate-600">
                    Program :
                  </span>
                  <span className="font-semibold text-slate-900 flex-1 leading-relaxed">
                    {selected.program}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 py-1.5 border-b border-slate-100">
                  <span className="w-36 shrink-0 font-semibold text-slate-600">
                    Batch :
                  </span>
                  <span className="font-bold text-blue-700 flex-1">
                    {selected.batch}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 py-1.5 border-b border-slate-100">
                  <span className="w-36 shrink-0 font-semibold text-slate-600">
                    Nama Peserta :
                  </span>
                  <div className="flex-1 flex flex-wrap items-baseline gap-x-2">
                    <span className="font-bold text-slate-900">{selected.pesertaName}</span>
                    <span className="text-slate-500 text-xs sm:text-sm">
                      (NIK: {selected.nik}{selected.email ? ` · ${selected.email}` : ''})
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 py-1.5">
                  <span className="w-36 shrink-0 font-semibold text-slate-600">
                    Tgl Daftar :
                  </span>
                  <div className="flex-1 flex flex-wrap items-baseline gap-x-2">
                    <span className="font-semibold text-slate-900">
                      {format(new Date(selected.createdAt), 'dd MMMM yyyy, HH:mm', { locale: localeId })}
                    </span>
                    {selected.instansi && (
                      <span className="text-slate-500 text-xs sm:text-sm">
                        (Instansi: {selected.instansi})
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dokumen yang diverifikasi (Full Width & Lapang) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Dokumen Persyaratan yang Diverifikasi
                </h2>
                <p className="text-xs text-slate-500">
                  Total {selected.documents.length} dokumen terlampir
                </p>
              </div>
            </div>

            {selected.documents.length === 0 ? (
              <Card className="p-12 text-center text-slate-400">
                <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p className="font-medium text-slate-600">Belum ada dokumen yang diunggah</p>
                <p className="text-xs mt-1">Peserta belum mengunggah dokumen persyaratan pendaftaran.</p>
              </Card>
            ) : (
              <div className="space-y-6">
                {selected.documents.map((doc) => {
                  const isMCU = doc.docType === 'MCU';
                  const mcu = mcuInputs[doc.id] ?? {
                    date: doc.mcuIssueDate ? doc.mcuIssueDate.split('T')[0] : '',
                    darah: doc.hasDarah ?? false,
                    urine: doc.hasUrine ?? false,
                  };
                  const expired = isMCU && mcuExpired(mcu.date || doc.mcuIssueDate);
                  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(doc.filePath);

                  return (
                    <Card key={doc.id} className="overflow-hidden border border-slate-200 shadow-sm">
                      {/* Document Card Header */}
                      <CardHeader className="bg-slate-50 border-b border-slate-200 py-3 px-5 flex flex-row items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-sm text-slate-900">
                              {DOC_TYPE_LABELS[doc.docType] ?? doc.docType}
                            </span>
                            <span className="text-xs text-slate-400 ml-2">({doc.docType})</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {doc.isValid === true && (
                            <span className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-100 px-3 py-1 rounded-full">
                              <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> Disetujui
                            </span>
                          )}
                          {doc.isValid === false && (
                            <span className="flex items-center gap-1.5 text-xs font-semibold text-red-700 bg-red-100 px-3 py-1 rounded-full">
                              <XCircle className="w-3.5 h-3.5 text-red-600" /> Ditolak
                            </span>
                          )}
                          {doc.isValid === null && (
                            <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
                              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" /> Menunggu Verifikasi
                            </span>
                          )}
                          {doc.filePath && (
                            <a
                              href={doc.filePath}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-white border border-slate-200 hover:border-slate-300 px-2.5 py-1 rounded-md shadow-xs font-medium"
                              title="Buka dokumen di tab baru"
                            >
                              <ExternalLink className="w-3 h-3" /> Buka Tab Baru
                            </a>
                          )}
                        </div>
                      </CardHeader>

                      <CardContent className="p-5">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                          {/* Kolom Kiri: Preview Dokumen Luas */}
                          <div className="lg:col-span-8 bg-slate-900/5 rounded-xl border border-slate-200/80 p-2 flex items-center justify-center min-h-[380px] max-h-[520px] overflow-hidden">
                            {doc.filePath ? (
                              isImage ? (
                                <img
                                  src={doc.filePath}
                                  alt={doc.docType}
                                  className="max-h-[500px] w-auto max-w-full object-contain mx-auto rounded"
                                />
                              ) : (
                                <iframe
                                  src={doc.filePath}
                                  className="w-full h-[500px] border-0 rounded bg-white"
                                  title={doc.docType}
                                />
                              )
                            ) : (
                              <p className="text-sm text-slate-400">File belum diunggah</p>
                            )}
                          </div>

                          {/* Kolom Kanan: Detail & Form Verifikasi */}
                          <div className="lg:col-span-4 flex flex-col justify-between space-y-4 bg-slate-50/70 p-5 rounded-xl border border-slate-200/60">
                            <div className="space-y-4">
                              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                                Verifikasi Kelengkapan
                              </h4>

                              {/* MCU Specific fields */}
                              {isMCU && (
                                <div className="p-3.5 bg-white border border-slate-200 rounded-lg space-y-3">
                                  {expired && (
                                    <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
                                      <AlertTriangle className="w-4 h-4 shrink-0" />
                                      <span>MCU kadaluarsa (lebih dari 6 bulan)!</span>
                                    </div>
                                  )}
                                  <div>
                                    <Label className="text-xs font-medium text-slate-700">Tanggal Terbit MCU</Label>
                                    <Input
                                      type="date"
                                      className="h-8 text-xs mt-1"
                                      value={mcu.date}
                                      onChange={(e) =>
                                        setMcuInputs((prev) => ({ ...prev, [doc.id]: { ...mcu, date: e.target.value } }))
                                      }
                                    />
                                  </div>
                                  <div className="flex gap-4 pt-1">
                                    <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                                      <Checkbox
                                        checked={mcu.darah}
                                        onCheckedChange={(v) =>
                                          setMcuInputs((prev) => ({ ...prev, [doc.id]: { ...mcu, darah: !!v } }))
                                        }
                                      />
                                      Lab Darah
                                    </label>
                                    <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                                      <Checkbox
                                        checked={mcu.urine}
                                        onCheckedChange={(v) =>
                                          setMcuInputs((prev) => ({ ...prev, [doc.id]: { ...mcu, urine: !!v } }))
                                        }
                                      />
                                      Lab Urine
                                    </label>
                                  </div>
                                </div>
                              )}

                              {/* Catatan Penolakan Sebelumnya */}
                              {doc.notes && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 space-y-1">
                                  <p className="font-semibold flex items-center gap-1">
                                    <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                                    Catatan Penolakan:
                                  </p>
                                  <p className="pl-4.5">{doc.notes}</p>
                                </div>
                              )}

                              {doc.verifiedAt && (
                                <p className="text-[11px] text-slate-400">
                                  Terakhir diverifikasi: {format(new Date(doc.verifiedAt), 'dd MMMM yyyy, HH:mm', { locale: localeId })}
                                </p>
                              )}
                            </div>

                            {/* Tombol Aksi Verifikasi Dokumen */}
                            <div className="flex flex-col gap-2.5 pt-4 border-t border-slate-200">
                              <Button
                                size="sm"
                                className="w-full h-9 bg-green-600 hover:bg-green-700 text-white font-medium gap-1.5 shadow-xs"
                                disabled={actionLoading}
                                onClick={() =>
                                  handleVerifyDoc(
                                    doc.id,
                                    true,
                                    undefined,
                                    isMCU
                                      ? {
                                          mcuIssueDate: mcu.date || undefined,
                                          hasDarah: mcu.darah,
                                          hasUrine: mcu.urine,
                                        }
                                      : undefined
                                  )
                                }
                              >
                                <CheckCircle2 className="w-4 h-4" /> Setujui Dokumen
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full h-9 border-red-300 text-red-600 hover:bg-red-50 font-medium gap-1.5"
                                disabled={actionLoading}
                                onClick={() => setRejectModal({ open: true, docId: doc.id })}
                              >
                                <XCircle className="w-4 h-4" /> Tolak Dokumen
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ─────────────────── TAMPILAN DAFTAR PESERTA ─────────────────── */
        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Verifikasi Dokumen</h1>
              <p className="text-sm text-gray-500">Kelola dan verifikasi dokumen pendaftaran peserta</p>
            </div>
            <div className="flex items-center gap-2">
              {bulkSelected.length > 0 && (
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleBulkApprove}
                  disabled={actionLoading}
                >
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  Approve {bulkSelected.length} Terpilih
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
                <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
              </Button>
            </div>
          </div>

          {/* Tabs + Search */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
              <TabsList className="h-9">
                <TabsTrigger value="all" className="text-xs">
                  Semua <span className="ml-1 bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded-full text-[10px]">{counts.all}</span>
                </TabsTrigger>
                <TabsTrigger value="pending" className="text-xs">
                  Pending <span className="ml-1 bg-yellow-200 text-yellow-700 px-1.5 py-0.5 rounded-full text-[10px]">{counts.pending}</span>
                </TabsTrigger>
                <TabsTrigger value="approved" className="text-xs">
                  Disetujui <span className="ml-1 bg-green-200 text-green-700 px-1.5 py-0.5 rounded-full text-[10px]">{counts.approved}</span>
                </TabsTrigger>
                <TabsTrigger value="rejected" className="text-xs">
                  Ditolak <span className="ml-1 bg-red-200 text-red-700 px-1.5 py-0.5 rounded-full text-[10px]">{counts.rejected}</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="relative ml-auto w-full sm:w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Cari nama / instansi..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-9 text-sm"
              />
            </div>
          </div>

          {/* Table Daftar Peserta */}
          <Card className="w-full">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="px-4 py-3 w-10">
                        <Checkbox
                          checked={bulkSelected.length === filtered.length && filtered.length > 0}
                          onCheckedChange={(checked) => setBulkSelected(checked ? filtered.map((i) => i.id) : [])}
                        />
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">No</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Nama Peserta</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Program</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Batch</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Status Dok</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Status Bayar</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Tgl Daftar</th>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {loading
                      ? Array(6)
                          .fill(0)
                          .map((_, i) => (
                            <tr key={i}>
                              {Array(9)
                                .fill(0)
                                .map((_, j) => (
                                  <td key={j} className="px-4 py-3">
                                    <Skeleton className="h-4 w-16" />
                                  </td>
                                ))}
                            </tr>
                          ))
                      : filtered.map((item, idx) => (
                          <tr
                            key={item.id}
                            className="hover:bg-blue-50/50 transition-colors cursor-pointer"
                            onClick={() => setSelected(item)}
                          >
                            <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                              <Checkbox
                                checked={bulkSelected.includes(item.id)}
                                onCheckedChange={(checked) =>
                                  setBulkSelected(
                                    checked
                                      ? [...bulkSelected, item.id]
                                      : bulkSelected.filter((id) => id !== item.id)
                                  )
                                }
                              />
                            </td>
                            <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                            <td className="px-4 py-3">
                              <div>
                                <p className="font-medium text-gray-900">{item.pesertaName}</p>
                                <p className="text-xs text-gray-400">{item.instansi}</p>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-600">{item.program}</td>
                            <td className="px-4 py-3 text-xs text-gray-600">{item.batch}</td>
                            <td className="px-4 py-3">
                              <Chip status={item.registrationStatus} map={STATUS_REG} />
                            </td>
                            <td className="px-4 py-3">
                              <Chip status={item.paymentStatus} map={STATUS_PAY} />
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-500">
                              {format(new Date(item.createdAt), 'd MMM yy', { locale: localeId })}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs text-blue-600 border-blue-200 hover:bg-blue-50"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelected(item);
                                }}
                              >
                                <Eye className="w-3.5 h-3.5 mr-1" /> Detail
                              </Button>
                            </td>
                          </tr>
                        ))}
                  </tbody>
                </table>
                {!loading && !filtered.length && (
                  <div className="text-center py-12 text-gray-400 text-sm">
                    Tidak ada data pendaftaran ditemukan
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal Alasan Penolakan Dokumen */}
      <Dialog open={rejectModal.open} onOpenChange={(open) => !open && setRejectModal({ open: false, docId: null })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Alasan Penolakan Dokumen</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label className="text-sm font-medium">Mohon berikan alasan penolakan yang jelas:</Label>
            <Textarea
              placeholder="Contoh: Foto dokumen buram, terpotong, atau tidak sesuai ketentuan..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              className="text-sm"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setRejectModal({ open: false, docId: null })}>
              Batal
            </Button>
            <Button
              variant="destructive"
              disabled={!rejectReason.trim() || actionLoading}
              onClick={() => rejectModal.docId && handleVerifyDoc(rejectModal.docId, false, rejectReason)}
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Konfirmasi Tolak'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
