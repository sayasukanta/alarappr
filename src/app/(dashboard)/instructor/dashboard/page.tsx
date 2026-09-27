"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CalendarDays,
  BookOpen,
  Clock,
  Star,
  PenLine,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Pen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ─── Types ───────────────────────────────────────────────────────────────────

interface InstructorData {
  instructor: {
    id: number;
    bapetenLicenseNo: string | null;
    licenseExpiryDate: string | null;
    specialization: string;
    status: string;
  };
  user: {
    fullName: string;
    email: string;
  };
}

interface Assignment {
  id: number;
  sessionName: string;
  teachingDate: string;
  startTime: string;
  endTime: string;
  sessionType: string;
  teachingHours: number;
  confirmed: boolean;
  batch: {
    id: number;
    batchNumber: number;
    location: string | null;
    training: { title: string; category: string };
  };
}

interface LogbookEntry {
  id: number;
  practiceDate: string;
  location: string;
  notes: string | null;
  signedOffAt: string | null;
  registrationId: number;
  participantName: string;
  dosisLaju: number | null;
}

interface DashboardStats {
  upcomingScheduleCount: number;
  pendingSignoffCount: number;
  totalTeachingHours: number;
  avgRating: number | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const SESSION_TYPE_LABELS: Record<string, string> = {
  THEORY: "Teori",
  PRACTICAL: "Praktikum",
  TRYOUT_REVIEW: "Review Tryout",
};

const CATEGORY_LABELS: Record<string, string> = {
  PPR_ANALISIS: "PPR Analisis",
  PPR_BAGASI: "PPR Bagasi",
  PKR_PEKERJA: "PKR Pekerja Radiasi",
};

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(dateStr));
}

function formatDateShort(dateStr: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(dateStr));
}

function daysUntil(dateStr: string): number {
  return Math.ceil(
    (new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  title,
  value,
  icon: Icon,
  className,
  sub,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  className?: string;
  sub?: string;
}) {
  return (
    <Card className={cn("border-0 shadow-sm", className)}>
      <CardContent className="p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-white/30 flex items-center justify-center shrink-0">
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {sub && <p className="text-xs opacity-70 mt-0.5">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function InstructorDashboardPage() {
  const [instructorData, setInstructorData] = useState<InstructorData | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [logbooks, setLogbooks] = useState<LogbookEntry[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingOff, setSigningOff] = useState<number | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<LogbookEntry | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [instructorRes, assignmentsRes, logbooksRes] = await Promise.all([
        fetch("/api/instructor/profile"),
        fetch("/api/instructor/assignments?upcoming=true"),
        fetch("/api/instructor/logbooks?signed=false"),
      ]);

      if (instructorRes.ok) {
        const d = await instructorRes.json();
        setInstructorData(d);
      }
      if (assignmentsRes.ok) {
        const d = await assignmentsRes.json();
        setAssignments(d.data ?? []);
        setStats(d.stats ?? null);
      }
      if (logbooksRes.ok) {
        const d = await logbooksRes.json();
        setLogbooks(d.data ?? []);
      }
    } catch {
      toast.error("Gagal memuat data dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSignOff = async (logbookId: number) => {
    setSigningOff(logbookId);
    try {
      const res = await fetch(`/api/logbook/${logbookId}/signoff`, {
        method: "PATCH",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal");
      toast.success("Logbook berhasil ditandatangani secara digital");
      setLogbooks((prev) => prev.filter((l) => l.id !== logbookId));
      setConfirmDialog(null);
      // Update stats
      if (stats) {
        setStats((s) =>
          s ? { ...s, pendingSignoffCount: s.pendingSignoffCount - 1 } : s
        );
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan";
      toast.error(message);
    } finally {
      setSigningOff(null);
    }
  };

  // License expiry warning
  const licenseExpiry = instructorData?.instructor.licenseExpiryDate;
  const daysToExpiry = licenseExpiry ? daysUntil(licenseExpiry) : null;
  const showExpiryWarning =
    daysToExpiry !== null && daysToExpiry >= 0 && daysToExpiry <= 60;
  const isExpired = daysToExpiry !== null && daysToExpiry < 0;

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Dashboard Instruktur
          </h1>
          {loading ? (
            <Skeleton className="h-4 w-48 mt-1" />
          ) : (
            <p className="text-slate-500 mt-1">
              Selamat datang,{" "}
              <span className="font-medium text-slate-700">
                {instructorData?.user.fullName ?? "Instruktur"}
              </span>{" "}
              &mdash;{" "}
              {CATEGORY_LABELS[
                instructorData?.instructor.specialization ?? ""
              ] ?? ""}
            </p>
          )}
        </div>
      </div>

      {/* License Warning */}
      {(showExpiryWarning || isExpired) && (
        <div
          className={cn(
            "flex items-start gap-3 rounded-xl p-4 border",
            isExpired
              ? "bg-red-50 border-red-200 text-red-800"
              : "bg-amber-50 border-amber-200 text-amber-800"
          )}
        >
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">
              {isExpired
                ? "Lisensi BAPETEN Anda Telah Kedaluwarsa"
                : `Lisensi BAPETEN Akan Berakhir dalam ${daysToExpiry} Hari`}
            </p>
            <p className="text-sm mt-0.5 opacity-80">
              No. Lisensi: {instructorData?.instructor.bapetenLicenseNo ?? "-"}{" "}
              &mdash; Tanggal Berakhir:{" "}
              {licenseExpiry ? formatDate(licenseExpiry) : "-"}
            </p>
          </div>
        </div>
      )}

      {/* Stat Cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Jadwal Mengajar"
            value={stats?.upcomingScheduleCount ?? assignments.length}
            icon={CalendarDays}
            className="bg-blue-600 text-white"
            sub="Sesi mendatang"
          />
          <StatCard
            title="Pending Sign-off"
            value={stats?.pendingSignoffCount ?? logbooks.length}
            icon={PenLine}
            className="bg-amber-500 text-white"
            sub="Logbook menunggu"
          />
          <StatCard
            title="Total Jam Batch"
            value={`${stats?.totalTeachingHours?.toFixed(1) ?? "0"} Jam`}
            icon={Clock}
            className="bg-emerald-600 text-white"
            sub="Jam mengajar aktif"
          />
          <StatCard
            title="Rating Evaluasi"
            value={
              stats?.avgRating != null
                ? `${stats.avgRating.toFixed(1)} / 5`
                : "–"
            }
            icon={Star}
            className="bg-purple-600 text-white"
            sub="Rata-rata peserta"
          />
        </div>
      )}

      {/* License Info Strip */}
      {!loading && instructorData?.instructor.bapetenLicenseNo && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-wrap gap-6 text-sm">
          <div>
            <span className="text-slate-500">No. Lisensi BAPETEN</span>
            <p className="font-mono font-semibold text-slate-800 mt-0.5">
              {instructorData.instructor.bapetenLicenseNo}
            </p>
          </div>
          <div>
            <span className="text-slate-500">Masa Berlaku</span>
            <p className="font-semibold text-slate-800 mt-0.5">
              {licenseExpiry ? formatDate(licenseExpiry) : "–"}
            </p>
          </div>
          <div>
            <span className="text-slate-500">Spesialisasi</span>
            <p className="font-semibold text-slate-800 mt-0.5">
              {CATEGORY_LABELS[
                instructorData.instructor.specialization
              ] ?? instructorData.instructor.specialization}
            </p>
          </div>
          <div>
            <span className="text-slate-500">Status</span>
            <div className="mt-0.5">
              <Badge
                className={
                  instructorData.instructor.status === "ACTIVE"
                    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                    : "bg-slate-200 text-slate-600"
                }
              >
                {instructorData.instructor.status === "ACTIVE" ? "Aktif" : "Tidak Aktif"}
              </Badge>
            </div>
          </div>
        </div>
      )}

      {/* Main Tabs */}
      <Tabs defaultValue="schedule">
        <TabsList className="bg-slate-100">
          <TabsTrigger value="schedule" className="gap-2">
            <CalendarDays className="w-4 h-4" />
            Jadwal Mengajar
          </TabsTrigger>
          <TabsTrigger value="logbooks" className="gap-2">
            <BookOpen className="w-4 h-4" />
            Sign-off Logbook
            {logbooks.length > 0 && (
              <span className="ml-1 bg-amber-500 text-white text-xs rounded-full w-5 h-5 inline-flex items-center justify-center">
                {logbooks.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="mt-4">
          <Card className="border border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-slate-800">
                Jadwal Mengajar Mendatang
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : assignments.length === 0 ? (
                <div className="text-center py-12">
                  <CalendarDays className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">Belum ada jadwal mengajar</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Program</TableHead>
                        <TableHead>Materi / Sesi</TableHead>
                        <TableHead>Waktu</TableHead>
                        <TableHead>Tipe</TableHead>
                        <TableHead>Lokasi</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assignments.map((a) => {
                        const isPast = new Date(a.teachingDate) < new Date();
                        return (
                          <TableRow key={a.id}>
                            <TableCell className="font-medium whitespace-nowrap">
                              {formatDateShort(a.teachingDate)}
                            </TableCell>
                            <TableCell>
                              <div className="font-medium text-sm">
                                {a.batch.training.title}
                              </div>
                              <div className="text-xs text-slate-400">
                                Batch #{a.batch.batchNumber}
                              </div>
                            </TableCell>
                            <TableCell className="max-w-xs">
                              <span className="text-sm">{a.sessionName}</span>
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-sm">
                              {a.startTime} – {a.endTime}
                              <div className="text-xs text-slate-400">
                                {a.teachingHours} jam
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={cn(
                                  "text-xs",
                                  a.sessionType === "THEORY"
                                    ? "bg-blue-100 text-blue-700 hover:bg-blue-100"
                                    : a.sessionType === "PRACTICAL"
                                    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                                    : "bg-purple-100 text-purple-700 hover:bg-purple-100"
                                )}
                              >
                                {SESSION_TYPE_LABELS[a.sessionType] ?? a.sessionType}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-slate-600">
                              {a.batch.location ?? "–"}
                            </TableCell>
                            <TableCell>
                              {isPast ? (
                                <Badge className="bg-slate-100 text-slate-500 hover:bg-slate-100 text-xs">
                                  Selesai
                                </Badge>
                              ) : a.confirmed ? (
                                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-xs">
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Dikonfirmasi
                                </Badge>
                              ) : (
                                <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 text-xs">
                                  <AlertCircle className="w-3 h-3 mr-1" />
                                  Menunggu
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logbook Sign-off Tab */}
        <TabsContent value="logbooks" className="mt-4">
          <Card className="border border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-slate-800">
                Logbook Pending Tanda Tangan Digital
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : logbooks.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">
                    Semua logbook sudah ditandatangani
                  </p>
                  <p className="text-sm text-slate-400 mt-1">
                    Tidak ada logbook yang menunggu tanda tangan
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead>Tanggal Praktik</TableHead>
                        <TableHead>Peserta</TableHead>
                        <TableHead>Lokasi</TableHead>
                        <TableHead>Dosis Laju (μSv/h)</TableHead>
                        <TableHead>Catatan</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logbooks.map((lb) => (
                        <TableRow key={lb.id}>
                          <TableCell className="whitespace-nowrap font-medium">
                            {formatDateShort(lb.practiceDate)}
                          </TableCell>
                          <TableCell>
                            <span className="font-medium text-sm">
                              {lb.participantName}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-slate-600">
                            {lb.location}
                          </TableCell>
                          <TableCell className="text-sm">
                            {lb.dosisLaju != null ? lb.dosisLaju : "–"}
                          </TableCell>
                          <TableCell className="text-sm text-slate-500 max-w-xs truncate">
                            {lb.notes ?? "–"}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                              onClick={() => setConfirmDialog(lb)}
                            >
                              <Pen className="w-3.5 h-3.5" />
                              Tanda Tangani
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Sign-off Confirm Dialog */}
      <Dialog
        open={!!confirmDialog}
        onOpenChange={(open) => !open && setConfirmDialog(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Tanda Tangan Digital</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-slate-600">
              Anda akan menandatangani secara digital logbook berikut:
            </p>
            <div className="bg-slate-50 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Peserta</span>
                <span className="font-semibold">{confirmDialog?.participantName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tanggal Praktik</span>
                <span className="font-semibold">
                  {confirmDialog?.practiceDate
                    ? formatDate(confirmDialog.practiceDate)
                    : "–"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Lokasi</span>
                <span className="font-semibold">{confirmDialog?.location}</span>
              </div>
            </div>
            <p className="text-xs text-amber-700 bg-amber-50 rounded-lg p-3">
              ⚠️ Tanda tangan digital ini bersifat permanen dan tidak dapat dibatalkan.
              Pastikan data logbook sudah benar sebelum menandatangani.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog(null)}>
              Batal
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
              onClick={() => confirmDialog && handleSignOff(confirmDialog.id)}
              disabled={signingOff !== null}
            >
              <Pen className="w-4 h-4" />
              {signingOff === confirmDialog?.id
                ? "Memproses..."
                : "Tandatangani Sekarang"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
