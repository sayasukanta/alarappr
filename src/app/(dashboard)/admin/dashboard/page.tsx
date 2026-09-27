'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Users,
  ClipboardList,
  CreditCard,
  CalendarDays,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { format, differenceInDays } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// ─── Types ────────────────────────────────────────────────────────────────────
interface DashboardStats {
  totalPeserta: number;
  pendingVerifikasi: number;
  pendingPembayaran: number;
  batchAktif: number;
}

interface RecentRegistration {
  id: number;
  pesertaName: string;
  program: string;
  batch: string;
  registrationStatus: string;
  paymentStatus: string;
  createdAt: string;
}

interface PendingPayment {
  id: number;
  pesertaName: string;
  program: string;
  amount: number;
  bankName: string;
  paymentDate: string;
  senderName: string;
}

interface BatchOverview {
  name: string;
  enrolled: number;
  quota: number;
}

interface InstructorAlert {
  id: number;
  name: string;
  licenseNo: string;
  expiryDate: string;
  daysLeft: number;
}

interface DashboardData {
  stats: DashboardStats;
  recentRegistrations: RecentRegistration[];
  pendingPayments: PendingPayment[];
  batchOverview: BatchOverview[];
  instructorAlerts: InstructorAlert[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function statusBadge(status: string) {
  const map: Record<string, { label: string; className: string }> = {
    DRAFT: { label: 'Draft', className: 'bg-gray-100 text-gray-600' },
    MENUNGGU_VERIFIKASI: { label: 'Menunggu', className: 'bg-yellow-100 text-yellow-700' },
    APPROVED: { label: 'Disetujui', className: 'bg-green-100 text-green-700' },
    REJECTED: { label: 'Ditolak', className: 'bg-red-100 text-red-700' },
    UNPAID: { label: 'Belum Bayar', className: 'bg-gray-100 text-gray-600' },
    PENDING_VERIFICATION: { label: 'Verifikasi', className: 'bg-blue-100 text-blue-700' },
    PAID: { label: 'Lunas', className: 'bg-green-100 text-green-700' },
  };
  const s = map[status] ?? { label: status, className: 'bg-gray-100 text-gray-600' };
  return <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', s.className)}>{s.label}</span>;
}

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  title,
  value,
  icon: Icon,
  color,
  loading,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  loading: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-4">
          <div className={cn('flex items-center justify-center w-12 h-12 rounded-xl', color)}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-500">{title}</p>
            {loading ? (
              <Skeleton className="h-8 w-16 mt-1" />
            ) : (
              <p className="text-2xl font-bold text-gray-900">{value.toLocaleString('id-ID')}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentActionLoading, setPaymentActionLoading] = useState<number | null>(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/dashboard');
      if (!res.ok) throw new Error('Gagal memuat data dashboard');
      const json = await res.json();
      setData(json);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handlePaymentAction = async (paymentId: number, action: 'approve' | 'reject') => {
    setPaymentActionLoading(paymentId);
    try {
      await fetch(`/api/admin/pembayaran/${paymentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      await fetchDashboard();
    } finally {
      setPaymentActionLoading(null);
    }
  };

  const stats = data?.stats ?? { totalPeserta: 0, pendingVerifikasi: 0, pendingPembayaran: 0, batchAktif: 0 };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {format(new Date(), "EEEE, d MMMM yyyy", { locale: localeId })}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchDashboard} disabled={loading}>
          <RefreshCw className={cn('w-4 h-4 mr-2', loading && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error}
          <Button variant="ghost" size="sm" onClick={fetchDashboard} className="ml-auto text-red-700">
            Coba Lagi
          </Button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total Peserta" value={stats.totalPeserta} icon={Users} color="bg-blue-600" loading={loading} />
        <StatCard title="Pending Verifikasi" value={stats.pendingVerifikasi} icon={ClipboardList} color="bg-yellow-500" loading={loading} />
        <StatCard title="Pembayaran Pending" value={stats.pendingPembayaran} icon={CreditCard} color="bg-orange-500" loading={loading} />
        <StatCard title="Batch Aktif" value={stats.batchAktif} icon={CalendarDays} color="bg-green-600" loading={loading} />
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Batch Overview Chart */}
        <Card className="xl:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              Kapasitas Batch Aktif
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : data?.batchOverview?.length ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.batchOverview} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(val, name) => [val, name === 'enrolled' ? 'Terdaftar' : 'Kuota']}
                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  />
                  <Bar dataKey="quota" fill="#e2e8f0" name="quota" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="enrolled" fill="#007AFF" name="enrolled" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
                Belum ada data batch
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructor License Alerts */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Peringatan Izin Instruktur
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              [1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full" />)
            ) : data?.instructorAlerts?.length ? (
              data.instructorAlerts.map((a) => (
                <div
                  key={a.id}
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-lg border text-sm',
                    a.daysLeft <= 30
                      ? 'border-red-200 bg-red-50'
                      : 'border-yellow-200 bg-yellow-50'
                  )}
                >
                  <AlertTriangle
                    className={cn('w-4 h-4 mt-0.5 shrink-0', a.daysLeft <= 30 ? 'text-red-500' : 'text-yellow-500')}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{a.name}</p>
                    <p className="text-xs text-gray-500">{a.licenseNo}</p>
                    <p className={cn('text-xs font-semibold mt-0.5', a.daysLeft <= 30 ? 'text-red-600' : 'text-yellow-700')}>
                      Kadaluarsa {a.daysLeft} hari lagi ({format(new Date(a.expiryDate), 'd MMM yyyy', { locale: localeId })})
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-24 text-gray-400 text-sm">
                <div className="text-center">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-400" />
                  Semua izin masih berlaku
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Registrations */}
        <Card>
          <CardHeader className="pb-2 flex-row items-center justify-between">
            <CardTitle className="text-base">Pendaftaran Terbaru</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <a href="/admin/verifikasi" className="text-xs text-blue-600">Lihat Semua</a>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Peserta</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Program</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Status</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Bayar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading
                    ? Array(5).fill(0).map((_, i) => (
                        <tr key={i}>
                          {[1, 2, 3, 4].map((j) => (
                            <td key={j} className="px-4 py-3">
                              <Skeleton className="h-4 w-20" />
                            </td>
                          ))}
                        </tr>
                      ))
                    : data?.recentRegistrations?.map((r) => (
                        <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-900">{r.pesertaName}</p>
                            <p className="text-xs text-gray-400">
                              {format(new Date(r.createdAt), 'd MMM yyyy', { locale: localeId })}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-gray-600 text-xs">{r.program}</td>
                          <td className="px-4 py-3">{statusBadge(r.registrationStatus)}</td>
                          <td className="px-4 py-3">{statusBadge(r.paymentStatus)}</td>
                        </tr>
                      ))}
                </tbody>
              </table>
              {!loading && !data?.recentRegistrations?.length && (
                <div className="text-center py-8 text-gray-400 text-sm">Belum ada pendaftaran</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payment Verification Queue */}
        <Card>
          <CardHeader className="pb-2 flex-row items-center justify-between">
            <CardTitle className="text-base">Antrian Verifikasi Pembayaran</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <a href="/admin/pembayaran" className="text-xs text-blue-600">Lihat Semua</a>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              [1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />)
            ) : data?.pendingPayments?.length ? (
              data.pendingPayments.slice(0, 4).map((p) => (
                <div key={p.id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 shrink-0">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">{p.pesertaName}</p>
                    <p className="text-xs text-gray-500">
                      {p.program} · {formatRupiah(p.amount)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {p.senderName} — {format(new Date(p.paymentDate), 'd MMM yyyy', { locale: localeId })}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <Button
                      size="sm"
                      className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handlePaymentAction(p.id, 'approve')}
                      disabled={paymentActionLoading === p.id}
                    >
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      ACC
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs border-red-300 text-red-600 hover:bg-red-50"
                      onClick={() => handlePaymentAction(p.id, 'reject')}
                      disabled={paymentActionLoading === p.id}
                    >
                      <XCircle className="w-3 h-3 mr-1" />
                      Tolak
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
                <div className="text-center">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-400" />
                  Tidak ada pembayaran pending
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
