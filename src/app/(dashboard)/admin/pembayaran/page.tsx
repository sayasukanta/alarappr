'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  CheckCircle2,
  XCircle,
  CreditCard,
  Eye,
  Building2,
  RefreshCw,
  Loader2,
  Search,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────
interface PaymentRecord {
  id: number;
  pesertaName: string;
  program: string;
  amount: number;
  bankName: string;
  paymentDate: string;
  senderName: string;
  proofFilePath: string | null;
  invoiceNumber: string | null;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  rejectionNote: string | null;
  createdAt: string;
}

interface Stats {
  totalPending: number;
  totalVerified: number;
  totalRejected: number;
}

const STATUS_MAP = {
  PENDING: { label: 'Pending', cls: 'bg-yellow-100 text-yellow-700' },
  VERIFIED: { label: 'Terverifikasi', cls: 'bg-green-100 text-green-700' },
  REJECTED: { label: 'Ditolak', cls: 'bg-red-100 text-red-700' },
};

function formatRupiah(n: number) {
  if (!n || n <= 0) return 'Hubungi Admin';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PembayaranPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [stats, setStats] = useState<Stats>({ totalPending: 0, totalVerified: 0, totalRejected: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [proofModal, setProofModal] = useState<{ open: boolean; url: string | null; name: string }>({ open: false, url: null, name: '' });
  const [rejectModal, setRejectModal] = useState<{ open: boolean; paymentId: number | null }>({ open: false, paymentId: null });
  const [approveModal, setApproveModal] = useState<{ open: boolean; payment: PaymentRecord | null }>({ open: false, payment: null });
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/pembayaran');
      const json = await res.json();
      setPayments(json.data ?? []);
      setStats(json.stats ?? { totalPending: 0, totalVerified: 0, totalRejected: 0 });
    } catch {
      toast.error('Gagal memuat data pembayaran');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAction = async (paymentId: number, action: 'approve' | 'reject', reason?: string) => {
    setActionLoading(paymentId);
    try {
      const res = await fetch(`/api/admin/pembayaran/${paymentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, rejectionNote: reason }),
      });
      if (!res.ok) throw new Error();
      toast.success(action === 'approve' ? 'Pembayaran diverifikasi' : 'Pembayaran ditolak');
      await fetchData();
    } catch {
      toast.error('Gagal memperbarui status pembayaran');
    } finally {
      setActionLoading(null);
      setRejectModal({ open: false, paymentId: null });
      setRejectReason('');
      setApproveModal({ open: false, payment: null });
    }
  };

  const filtered = payments.filter((p) => {
    const matchStatus = filterStatus === 'ALL' || p.status === filterStatus;
    const matchSearch =
      !search ||
      p.pesertaName.toLowerCase().includes(search.toLowerCase()) ||
      p.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) ||
      p.senderName?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Pembayaran</h1>
          <p className="text-sm text-gray-500">Verifikasi bukti transfer peserta pelatihan</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Pending', value: stats.totalPending, cls: 'border-yellow-200 bg-yellow-50', textCls: 'text-yellow-700', status: 'PENDING' },
          { label: 'Total Terverifikasi', value: stats.totalVerified, cls: 'border-green-200 bg-green-50', textCls: 'text-green-700', status: 'VERIFIED' },
          { label: 'Total Ditolak', value: stats.totalRejected, cls: 'border-red-200 bg-red-50', textCls: 'text-red-700', status: 'REJECTED' },
        ].map((s) => (
          <button
            key={s.status}
            onClick={() => setFilterStatus(filterStatus === s.status ? 'ALL' : s.status)}
            className={cn(
              'text-left border-2 rounded-xl p-4 transition-all',
              filterStatus === s.status ? s.cls + ' ring-2 ring-offset-1 ring-blue-400' : 'border-gray-200 bg-white hover:' + s.cls
            )}
          >
            <p className="text-sm text-gray-500">{s.label}</p>
            {loading ? (
              <Skeleton className="h-8 w-12 mt-1" />
            ) : (
              <p className={cn('text-3xl font-bold mt-1', s.textCls)}>{s.value}</p>
            )}
          </button>
        ))}
      </div>

      {/* Bank Info Banner */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-600 shrink-0">
          <Building2 className="w-5 h-5 text-white" />
        </div>
        <div className="text-sm">
          <p className="font-semibold text-blue-900">Rekening Tujuan Pembayaran</p>
          <p className="text-blue-700 mt-0.5">
            Bank Mandiri · No. Rek: <span className="font-mono font-bold">166-00-0733926-0</span>
          </p>
          <p className="text-blue-600">a.n. CV Hikmat Proteksi ALARA</p>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-2">
          {['ALL', 'PENDING', 'VERIFIED', 'REJECTED'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border',
                filterStatus === s
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
              )}
            >
              {s === 'ALL' ? 'Semua' : STATUS_MAP[s as keyof typeof STATUS_MAP]?.label ?? s}
            </button>
          ))}
        </div>
        <div className="relative ml-auto w-full sm:w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Cari nama / invoice..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9 text-sm"
          />
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Peserta</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Program</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Jumlah</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Bank</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Tgl Bayar</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Bukti</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Status</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading
                  ? Array(5).fill(0).map((_, i) => (
                      <tr key={i}>
                        {Array(8).fill(0).map((_, j) => (
                          <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                        ))}
                      </tr>
                    ))
                  : filtered.map((p) => {
                      const statusMeta = STATUS_MAP[p.status];
                      const isLoading = actionLoading === p.id;
                      return (
                        <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-900">{p.pesertaName}</p>
                            {p.invoiceNumber && (
                              <p className="text-xs text-gray-400 font-mono">{p.invoiceNumber}</p>
                            )}
                            <p className="text-xs text-gray-400">a.n. {p.senderName ?? '-'}</p>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-600">{p.program}</td>
                          <td className="px-4 py-3 font-semibold text-gray-900">{formatRupiah(p.amount)}</td>
                          <td className="px-4 py-3 text-xs text-gray-600">{p.bankName}</td>
                          <td className="px-4 py-3 text-xs text-gray-500">
                            {p.paymentDate
                              ? format(new Date(p.paymentDate), 'd MMM yyyy', { locale: localeId })
                              : '-'}
                          </td>
                          <td className="px-4 py-3">
                            {p.proofFilePath ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs text-blue-600"
                                onClick={() => setProofModal({ open: true, url: p.proofFilePath, name: p.pesertaName })}
                              >
                                <Eye className="w-3.5 h-3.5 mr-1" /> Lihat
                              </Button>
                            ) : (
                              <span className="text-xs text-gray-400">Belum ada</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {p.status === 'PENDING' ? (
                              <button
                                type="button"
                                onClick={() => setApproveModal({ open: true, payment: p })}
                                className={cn(
                                  'px-2 py-0.5 rounded-full text-xs font-medium transition-all hover:opacity-80 hover:ring-1 hover:ring-yellow-400 cursor-pointer inline-flex items-center gap-1',
                                  statusMeta.cls
                                )}
                                title="Klik untuk verifikasi pembayaran"
                              >
                                {statusMeta.label}
                              </button>
                            ) : (
                              <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', statusMeta.cls)}>
                                {statusMeta.label}
                              </span>
                            )}
                            {p.status === 'REJECTED' && p.rejectionNote && (
                              <p className="text-xs text-red-500 mt-0.5">{p.rejectionNote}</p>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {p.status === 'PENDING' && (
                              <div className="flex gap-1.5 justify-center">
                                <Button
                                  size="sm"
                                  className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white"
                                  onClick={() => setApproveModal({ open: true, payment: p })}
                                  disabled={isLoading}
                                  title="Verifikasi Pembayaran"
                                >
                                  {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs border-red-300 text-red-600 hover:bg-red-50"
                                  onClick={() => setRejectModal({ open: true, paymentId: p.id })}
                                  disabled={isLoading}
                                  title="Tolak Pembayaran"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            )}
                            {p.status === 'VERIFIED' && (
                              <div className="flex justify-center">
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                              </div>
                            )}
                            {p.status === 'REJECTED' && (
                              <div className="flex justify-center">
                                <XCircle className="w-5 h-5 text-red-400" />
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                }
              </tbody>
            </table>
            {!loading && !filtered.length && (
              <div className="text-center py-12 text-gray-400 text-sm">Tidak ada data ditemukan</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Proof Image Modal */}
      <Dialog open={proofModal.open} onOpenChange={(open) => !open && setProofModal({ open: false, url: null, name: '' })}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bukti Transfer — {proofModal.name}</DialogTitle>
          </DialogHeader>
          <div className="bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center min-h-60">
            {proofModal.url ? (
              /\.(jpg|jpeg|png|gif|webp)$/i.test(proofModal.url) ? (
                <img src={proofModal.url} alt="Bukti Transfer" className="max-w-full max-h-[60vh] object-contain" />
              ) : (
                <iframe src={proofModal.url} className="w-full h-[60vh] border-0" title="Bukti Transfer" />
              )
            ) : (
              <p className="text-gray-400 text-sm">Tidak ada file</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={rejectModal.open} onOpenChange={(open) => !open && setRejectModal({ open: false, paymentId: null })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Alasan Penolakan Pembayaran</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Label>Mohon berikan alasan yang jelas:</Label>
            <Textarea
              placeholder="Contoh: Nominal tidak sesuai, bukti transfer tidak terbaca..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setRejectModal({ open: false, paymentId: null })}>
              Batal
            </Button>
            <Button
              variant="destructive"
              disabled={!rejectReason.trim() || !!actionLoading}
              onClick={() => rejectModal.paymentId && handleAction(rejectModal.paymentId, 'reject', rejectReason)}
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Konfirmasi Tolak'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Confirmation Modal */}
      <Dialog
        open={approveModal.open}
        onOpenChange={(open) => !open && setApproveModal({ open: false, payment: null })}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-600 shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <DialogTitle className="text-base font-semibold">
                Konfirmasi Verifikasi Pembayaran
              </DialogTitle>
            </div>
          </DialogHeader>

          {approveModal.payment && (
            <div className="space-y-4 py-2">
              <p className="text-sm text-gray-600">
                Apakah Anda yakin ingin memverifikasi pembayaran peserta ini? Status pembayaran akan berubah menjadi <span className="font-semibold text-green-600">Terverifikasi</span> dan status pendaftaran menjadi lunas.
              </p>

              <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Nama Peserta:</span>
                  <span className="font-medium text-gray-900">{approveModal.payment.pesertaName}</span>
                </div>
                {approveModal.payment.invoiceNumber && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">No. Invoice:</span>
                    <span className="font-mono font-medium text-gray-900">{approveModal.payment.invoiceNumber}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Program:</span>
                  <span className="font-medium text-gray-900 text-right max-w-[60%]">{approveModal.payment.program}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Jumlah Transfer:</span>
                  <span className="font-bold text-green-700">{formatRupiah(approveModal.payment.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Bank / Pengirim:</span>
                  <span className="text-gray-900">{approveModal.payment.bankName} (a.n. {approveModal.payment.senderName})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tanggal Bayar:</span>
                  <span className="text-gray-900">
                    {approveModal.payment.paymentDate
                      ? format(new Date(approveModal.payment.paymentDate), 'd MMMM yyyy', { locale: localeId })
                      : '-'}
                  </span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setApproveModal({ open: false, payment: null })}
              disabled={!!actionLoading}
            >
              Batal
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={!approveModal.payment || !!actionLoading}
              onClick={() =>
                approveModal.payment &&
                handleAction(approveModal.payment.id, 'approve')
              }
            >
              {actionLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  Ya, Verifikasi
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
