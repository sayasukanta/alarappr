'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Download,
  Users,
  ChevronDown,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Minus,
  HelpCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────
type AttendanceStatus = 'HADIR' | 'IZIN' | 'ALPA' | null;

interface Session {
  day: number;
  session: 'MORNING' | 'AFTERNOON';
  label: string;
}

interface Peserta {
  registrationId: number;
  name: string;
  instansi: string;
  attendance: Record<string, AttendanceStatus>; // key: "day_session"
}

interface BatchOption {
  id: number;
  label: string;
  startDate: string;
  endDate: string;
}

const SESSIONS: Session[] = [
  { day: 1, session: 'MORNING', label: 'Hari 1\nPagi' },
  { day: 1, session: 'AFTERNOON', label: 'Hari 1\nSiang' },
  { day: 2, session: 'MORNING', label: 'Hari 2\nPagi' },
  { day: 2, session: 'AFTERNOON', label: 'Hari 2\nSiang' },
  { day: 3, session: 'MORNING', label: 'Hari 3\nPagi' },
  { day: 3, session: 'AFTERNOON', label: 'Hari 3\nSiang' },
];

const STATUS_CYCLE: AttendanceStatus[] = ['HADIR', 'IZIN', 'ALPA', null];

const STATUS_STYLE: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  HADIR: {
    bg: 'bg-green-100 hover:bg-green-200 border-green-300',
    text: 'text-green-700',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  IZIN: {
    bg: 'bg-yellow-100 hover:bg-yellow-200 border-yellow-300',
    text: 'text-yellow-700',
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
  },
  ALPA: {
    bg: 'bg-red-100 hover:bg-red-200 border-red-300',
    text: 'text-red-700',
    icon: <Minus className="w-3.5 h-3.5" />,
  },
};

function sessionKey(day: number, session: string) {
  return `${day}_${session}`;
}

// ─── Attendance Cell ──────────────────────────────────────────────────────────
function AttendanceCell({
  status,
  onClick,
  loading,
}: {
  status: AttendanceStatus;
  onClick: () => void;
  loading: boolean;
}) {
  const style = status ? STATUS_STYLE[status] : null;

  return (
    <td className="px-1 py-1 text-center">
      <button
        onClick={onClick}
        disabled={loading}
        className={cn(
          'w-14 h-10 rounded-lg border text-xs font-medium transition-all flex items-center justify-center mx-auto gap-1',
          style ? `${style.bg} ${style.text}` : 'bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-400',
          loading && 'opacity-50 cursor-not-allowed'
        )}
        title={status ?? 'Belum diisi'}
      >
        {style ? style.icon : <HelpCircle className="w-3.5 h-3.5" />}
      </button>
    </td>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PresensiPage() {
  const [batches, setBatches] = useState<BatchOption[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>('');
  const [pesertaList, setPesertaList] = useState<Peserta[]>([]);
  const [loading, setLoading] = useState(false);
  const [batchLoading, setBatchLoading] = useState(true);
  const [cellLoading, setCellLoading] = useState<string | null>(null); // "regId_sessionKey"

  // Load batch options
  useEffect(() => {
    (async () => {
      setBatchLoading(true);
      try {
        const res = await fetch('/api/admin/batch');
        const json = await res.json();
        const opts: BatchOption[] = (json.data ?? []).map((b: any) => ({
          id: b.id,
          label: `${b.training.title} — Batch #${b.batchNumber} (${format(new Date(b.startDate), 'd MMM yy', { locale: localeId })} – ${format(new Date(b.endDate), 'd MMM yy', { locale: localeId })})`,
          startDate: b.startDate,
          endDate: b.endDate,
        }));
        setBatches(opts);
      } finally {
        setBatchLoading(false);
      }
    })();
  }, []);

  const fetchAttendance = useCallback(async (batchId: string) => {
    if (!batchId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/presensi?batchId=${batchId}`);
      const json = await res.json();
      setPesertaList(json.data ?? []);
    } catch {
      toast.error('Gagal memuat data presensi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedBatch) fetchAttendance(selectedBatch);
  }, [selectedBatch, fetchAttendance]);

  const handleCellClick = async (regId: number, day: number, session: string, currentStatus: AttendanceStatus) => {
    const key = `${regId}_${sessionKey(day, session)}`;
    const nextIndex = (STATUS_CYCLE.indexOf(currentStatus) + 1) % STATUS_CYCLE.length;
    const newStatus = STATUS_CYCLE[nextIndex];

    setCellLoading(key);
    try {
      await fetch('/api/admin/presensi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId: regId, dayNumber: day, sessionType: session, status: newStatus }),
      });
      // Optimistic update
      setPesertaList((prev) =>
        prev.map((p) =>
          p.registrationId === regId
            ? { ...p, attendance: { ...p.attendance, [sessionKey(day, session)]: newStatus } }
            : p
        )
      );
    } catch {
      toast.error('Gagal memperbarui presensi');
    } finally {
      setCellLoading(null);
    }
  };

  const exportToExcel = async () => {
    if (!selectedBatch) return;
    try {
      const res = await fetch(`/api/admin/presensi/export?batchId=${selectedBatch}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `presensi-batch-${selectedBatch}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Gagal mengunduh data presensi');
    }
  };

  // Summary stats
  const summary = pesertaList.reduce(
    (acc, p) => {
      SESSIONS.forEach(({ day, session }) => {
        const s = p.attendance[sessionKey(day, session)];
        if (s === 'HADIR') acc.hadir++;
        else if (s === 'IZIN') acc.izin++;
        else if (s === 'ALPA') acc.alpa++;
        else acc.belum++;
      });
      return acc;
    },
    { hadir: 0, izin: 0, alpa: 0, belum: 0 }
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Presensi</h1>
          <p className="text-sm text-gray-500">Rekap kehadiran peserta per sesi pelatihan</p>
        </div>
        {selectedBatch && pesertaList.length > 0 && (
          <Button size="sm" variant="outline" onClick={exportToExcel}>
            <Download className="w-4 h-4 mr-1.5" />
            Export CSV
          </Button>
        )}
      </div>

      {/* Batch Selector */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 shrink-0">
              <Users className="w-4 h-4 text-blue-600" />
              Pilih Batch:
            </div>
            {batchLoading ? (
              <Skeleton className="h-9 w-80" />
            ) : (
              <Select value={selectedBatch} onValueChange={(val) => setSelectedBatch(val || "")}>
                <SelectTrigger className="w-full sm:w-96">
                  <SelectValue placeholder="Pilih batch pelatihan..." />
                </SelectTrigger>
                <SelectContent>
                  {batches.map((b) => (
                    <SelectItem key={b.id} value={b.id.toString()}>
                      {b.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {selectedBatch && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fetchAttendance(selectedBatch)}
                disabled={loading}
              >
                <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      {selectedBatch && (
        <div className="flex items-center gap-4 text-xs">
          {[
            { status: 'HADIR', label: 'Hadir' },
            { status: 'IZIN', label: 'Izin' },
            { status: 'ALPA', label: 'Alpa' },
          ].map(({ status, label }) => {
            const s = STATUS_STYLE[status];
            return (
              <div key={status} className={cn('flex items-center gap-1.5 px-2 py-1 rounded-md border', s.bg, s.text)}>
                {s.icon}
                <span className="font-medium">{label}</span>
              </div>
            );
          })}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md border bg-gray-100 border-gray-200 text-gray-400">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Belum diisi</span>
          </div>
          <span className="text-gray-400 ml-2">Klik sel untuk mengubah status</span>
        </div>
      )}

      {/* Summary Stats */}
      {selectedBatch && pesertaList.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Hadir', value: summary.hadir, cls: 'bg-green-50 border-green-200 text-green-700' },
            { label: 'Izin', value: summary.izin, cls: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
            { label: 'Alpa', value: summary.alpa, cls: 'bg-red-50 border-red-200 text-red-700' },
            { label: 'Belum Diisi', value: summary.belum, cls: 'bg-gray-50 border-gray-200 text-gray-500' },
          ].map((s) => (
            <div key={s.label} className={cn('border rounded-xl px-4 py-3 text-sm', s.cls)}>
              <p className="text-xs opacity-70">{s.label}</p>
              <p className="text-2xl font-bold">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Attendance Grid */}
      {selectedBatch && (
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-3">
                {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : pesertaList.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 w-8">No</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 min-w-48">Peserta</th>
                      {SESSIONS.map(({ day, session, label }) => (
                        <th
                          key={sessionKey(day, session)}
                          className="px-1 py-2 text-center text-[10px] font-semibold text-gray-500 w-16"
                        >
                          {label.split('\n').map((l, i) => (
                            <span key={i} className={cn('block', i === 1 && 'text-gray-400 font-normal')}>{l}</span>
                          ))}
                        </th>
                      ))}
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">%</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {pesertaList.map((p, idx) => {
                      const hadirCount = SESSIONS.filter(
                        ({ day, session }) => p.attendance[sessionKey(day, session)] === 'HADIR'
                      ).length;
                      const pct = Math.round((hadirCount / SESSIONS.length) * 100);

                      return (
                        <tr key={p.registrationId} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-2 text-xs text-gray-500">{idx + 1}</td>
                          <td className="px-4 py-2">
                            <p className="font-medium text-gray-900 text-sm">{p.name}</p>
                            <p className="text-xs text-gray-400">{p.instansi}</p>
                          </td>
                          {SESSIONS.map(({ day, session }) => {
                            const key = sessionKey(day, session);
                            const cellKey = `${p.registrationId}_${key}`;
                            return (
                              <AttendanceCell
                                key={key}
                                status={p.attendance[key] ?? null}
                                loading={cellLoading === cellKey}
                                onClick={() => handleCellClick(p.registrationId, day, session, p.attendance[key] ?? null)}
                              />
                            );
                          })}
                          <td className="px-4 py-2 text-center">
                            <span
                              className={cn(
                                'text-xs font-semibold',
                                pct >= 80 ? 'text-green-600' : pct >= 60 ? 'text-yellow-600' : 'text-red-600'
                              )}
                            >
                              {pct}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16 text-gray-400">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Tidak ada peserta terdaftar di batch ini</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!selectedBatch && (
        <div className="text-center py-16 text-gray-400">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Pilih batch untuk melihat data presensi</p>
        </div>
      )}
    </div>
  );
}
