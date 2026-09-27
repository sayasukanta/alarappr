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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  Users,
  Award,
  TrendingUp,
  Calculator,
  Download,
  FileSpreadsheet,
  FilePlus2,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Batch {
  id: number;
  batchNumber: number;
  startDate: string;
  endDate: string;
  training: { title: string; category: string };
}

interface ResultRow {
  registrationId: number;
  fullName: string;
  nik: string | null;
  instansi: string | null;
  sponsorName: string | null;
  bapetenTheory: number | null;
  bapetenPractical: number | null;
  bapetenInterview: number | null;
  tryoutScore: number | null;
  finalStatus: string | null;
  certificateNumber: string | null;
}

interface ReportData {
  stats: {
    totalPeserta: number;
    lulusBapeten: number;
    tingkatKelulusan: number;
    rataRataSkor: number | null;
  };
  results: ResultRow[];
  batchPassRates: { batchLabel: string; passRate: number; total: number }[];
}

interface ExamScoreFormData {
  registrationId: number;
  bapetenTheory: number | null;
  bapetenPractical: number | null;
  bapetenInterview: number | null;
  finalStatus: "LULUS" | "TIDAK_LULUS" | "REMIDIAL";
}

const examScoreSchema = z.object({
  bapetenTheory: z
    .number({ invalid_type_error: "Harus angka" })
    .min(0)
    .max(100)
    .nullable(),
  bapetenPractical: z
    .number({ invalid_type_error: "Harus angka" })
    .min(0)
    .max(100)
    .nullable(),
  bapetenInterview: z
    .number({ invalid_type_error: "Harus angka" })
    .min(0)
    .max(100)
    .nullable(),
  finalStatus: z.enum(["LULUS", "TIDAK_LULUS", "REMIDIAL"]),
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(d: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(d));
}

function StatusBadge({ status }: { status: string | null }) {
  if (!status)
    return (
      <Badge className="bg-slate-100 text-slate-500 hover:bg-slate-100 text-xs">
        Menunggu
      </Badge>
    );
  return (
    <Badge
      className={cn(
        "text-xs",
        status === "LULUS"
          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
          : status === "REMIDIAL"
          ? "bg-amber-100 text-amber-700 hover:bg-amber-100"
          : "bg-red-100 text-red-700 hover:bg-red-100"
      )}
    >
      {status === "LULUS"
        ? "Lulus"
        : status === "TIDAK_LULUS"
        ? "Tidak Lulus"
        : "Remidial"}
    </Badge>
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

export default function LaporanPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>("all");
  const [selectedSponsor, setSelectedSponsor] = useState<string>("");
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [batchesLoading, setBatchesLoading] = useState(true);
  const [editingRow, setEditingRow] = useState<ResultRow | null>(null);
  const [savingScore, setSavingScore] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<z.infer<typeof examScoreSchema>>({
    resolver: zodResolver(examScoreSchema),
  });

  // Load batches for filter
  useEffect(() => {
    fetch("/api/batches")
      .then((r) => r.json())
      .then((d) => setBatches(Array.isArray(d) ? d : (d.data ?? [])))
      .catch(() => toast.error("Gagal memuat daftar batch"))
      .finally(() => setBatchesLoading(false));
  }, []);

  const loadReport = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedBatch !== "all") params.set("batchId", selectedBatch);
      if (selectedSponsor) params.set("sponsor", selectedSponsor);

      const res = await fetch(`/api/admin/reports?${params.toString()}`);
      if (!res.ok) throw new Error("Gagal memuat laporan");
      const data = await res.json();
      setReportData(data);
    } catch {
      toast.error("Gagal memuat data laporan");
    } finally {
      setLoading(false);
    }
  }, [selectedBatch, selectedSponsor]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const openEditDialog = (row: ResultRow) => {
    setEditingRow(row);
    reset({
      bapetenTheory: row.bapetenTheory,
      bapetenPractical: row.bapetenPractical,
      bapetenInterview: row.bapetenInterview,
      finalStatus: (row.finalStatus as ExamScoreFormData["finalStatus"]) ?? "LULUS",
    });
  };

  const saveExamScore = async (data: z.infer<typeof examScoreSchema>) => {
    if (!editingRow) return;
    setSavingScore(true);
    try {
      const res = await fetch(
        `/api/admin/exam-results/${editingRow.registrationId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Gagal menyimpan");
      }
      toast.success("Nilai BAPETEN berhasil disimpan");
      setEditingRow(null);
      loadReport();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan";
      toast.error(message);
    } finally {
      setSavingScore(false);
    }
  };

  const handleExportPDF = () => {
    const params = new URLSearchParams();
    if (selectedBatch !== "all") params.set("batchId", selectedBatch);
    window.open(`/api/admin/reports/export/pdf?${params}`, "_blank");
  };

  const handleExportExcel = () => {
    const params = new URLSearchParams();
    if (selectedBatch !== "all") params.set("batchId", selectedBatch);
    window.location.href = `/api/admin/reports/export/excel?${params}`;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Laporan & Analitik
          </h1>
          <p className="text-slate-500 mt-1">
            Rekap hasil pelatihan dan kelulusan BAPETEN
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleExportExcel}
          >
            <FileSpreadsheet className="w-4 h-4" />
            Export Excel
          </Button>
          <Button
            className="gap-2 bg-red-600 hover:bg-red-700 text-white"
            onClick={handleExportPDF}
          >
            <Download className="w-4 h-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="border border-slate-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-end gap-4">
            <Filter className="w-5 h-5 text-slate-400 mb-1 shrink-0" />
            <div className="flex-1 min-w-[200px]">
              <Label className="text-xs text-slate-500 mb-1.5 block">
                Filter Batch
              </Label>
              <Select value={selectedBatch} onValueChange={(val) => setSelectedBatch(val || "all")}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Semua Batch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Batch</SelectItem>
                  {batches.map((b) => (
                    <SelectItem key={b.id} value={String(b.id)}>
                      {b.training.title} – Batch #{b.batchNumber} (
                      {formatDate(b.startDate)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <Label className="text-xs text-slate-500 mb-1.5 block">
                Filter Sponsor / Instansi
              </Label>
              <Input
                placeholder="Nama sponsor atau instansi..."
                value={selectedSponsor}
                onChange={(e) => setSelectedSponsor(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

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
            title="Total Peserta"
            value={reportData?.stats.totalPeserta ?? 0}
            icon={Users}
            className="bg-blue-600 text-white"
          />
          <StatCard
            title="Lulus BAPETEN"
            value={reportData?.stats.lulusBapeten ?? 0}
            icon={Award}
            className="bg-emerald-600 text-white"
          />
          <StatCard
            title="Tingkat Kelulusan"
            value={`${reportData?.stats.tingkatKelulusan?.toFixed(1) ?? 0}%`}
            icon={TrendingUp}
            className="bg-purple-600 text-white"
          />
          <StatCard
            title="Rata-rata Skor"
            value={
              reportData?.stats.rataRataSkor != null
                ? reportData.stats.rataRataSkor.toFixed(1)
                : "–"
            }
            icon={Calculator}
            className="bg-amber-500 text-white"
            sub="Nilai teori + praktik"
          />
        </div>
      )}

      {/* Bar Chart */}
      {reportData && reportData.batchPassRates.length > 0 && (
        <Card className="border border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-slate-800">
              Tingkat Kelulusan per Batch
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={reportData.batchPassRates}
                margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="batchLabel"
                  tick={{ fontSize: 12 }}
                  stroke="#94a3b8"
                />
                <YAxis
                  domain={[0, 100]}
                  unit="%"
                  tick={{ fontSize: 12 }}
                  stroke="#94a3b8"
                />
                <Tooltip
                  formatter={(v: any) => [`${Number(v || 0).toFixed(1)}%`, "Kelulusan"]}
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    fontSize: 12,
                  }}
                />
                <ReferenceLine
                  y={70}
                  stroke="#ef4444"
                  strokeDasharray="4 4"
                  label={{
                    value: "70%",
                    position: "insideTopRight",
                    fill: "#ef4444",
                    fontSize: 11,
                  }}
                />
                <Bar dataKey="passRate" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Results Table */}
      <Card className="border border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base text-slate-800">
              Rekap Hasil Peserta
            </CardTitle>
            <span className="text-sm text-slate-400">
              {reportData?.results.length ?? 0} peserta
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !reportData || reportData.results.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Tidak ada data peserta</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="w-10">No</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Perusahaan</TableHead>
                    <TableHead className="text-center">Tryout</TableHead>
                    <TableHead className="text-center">Teori</TableHead>
                    <TableHead className="text-center">Praktik</TableHead>
                    <TableHead className="text-center">Wawancara</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead>Sertifikat</TableHead>
                    <TableHead className="w-16">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.results.map((row, idx) => (
                    <TableRow key={row.registrationId}>
                      <TableCell className="text-slate-400 text-sm">
                        {idx + 1}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-sm">{row.fullName}</div>
                        {row.nik && (
                          <div className="text-xs text-slate-400">{row.nik}</div>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {row.sponsorName ?? row.instansi ?? "–"}
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        {row.tryoutScore != null ? (
                          <span
                            className={cn(
                              "font-semibold",
                              row.tryoutScore >= 70
                                ? "text-emerald-600"
                                : "text-red-500"
                            )}
                          >
                            {row.tryoutScore}
                          </span>
                        ) : (
                          <span className="text-slate-300">–</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        {row.bapetenTheory != null ? (
                          <span
                            className={cn(
                              "font-semibold",
                              row.bapetenTheory >= 70
                                ? "text-emerald-600"
                                : "text-red-500"
                            )}
                          >
                            {row.bapetenTheory}
                          </span>
                        ) : (
                          <span className="text-slate-300">–</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        {row.bapetenPractical != null ? (
                          <span
                            className={cn(
                              "font-semibold",
                              row.bapetenPractical >= 70
                                ? "text-emerald-600"
                                : "text-red-500"
                            )}
                          >
                            {row.bapetenPractical}
                          </span>
                        ) : (
                          <span className="text-slate-300">–</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        {row.bapetenInterview != null ? (
                          <span className="font-semibold text-slate-700">
                            {row.bapetenInterview}
                          </span>
                        ) : (
                          <span className="text-slate-300">–</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <StatusBadge status={row.finalStatus} />
                      </TableCell>
                      <TableCell>
                        {row.certificateNumber ? (
                          <span className="font-mono text-xs text-blue-600">
                            {row.certificateNumber}
                          </span>
                        ) : (
                          <span className="text-slate-300 text-xs">–</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          title="Input Nilai BAPETEN"
                          onClick={() => openEditDialog(row)}
                        >
                          <FilePlus2 className="w-4 h-4 text-slate-500" />
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

      {/* Edit Exam Score Dialog */}
      <Dialog open={!!editingRow} onOpenChange={(o) => !o && setEditingRow(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Input Nilai BAPETEN</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(saveExamScore)}>
            <div className="space-y-4 py-2">
              <div className="bg-slate-50 rounded-lg p-3 text-sm">
                <p className="font-semibold text-slate-800">
                  {editingRow?.fullName}
                </p>
                <p className="text-slate-500 text-xs mt-0.5">
                  {editingRow?.instansi ?? editingRow?.sponsorName ?? "–"}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">Nilai Teori</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step={0.1}
                    placeholder="0–100"
                    className="mt-1"
                    {...register("bapetenTheory", { valueAsNumber: true })}
                  />
                  {errors.bapetenTheory && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.bapetenTheory.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label className="text-xs">Nilai Praktik</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step={0.1}
                    placeholder="0–100"
                    className="mt-1"
                    {...register("bapetenPractical", { valueAsNumber: true })}
                  />
                  {errors.bapetenPractical && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.bapetenPractical.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label className="text-xs">Nilai Wawancara</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step={0.1}
                    placeholder="0–100"
                    className="mt-1"
                    {...register("bapetenInterview", { valueAsNumber: true })}
                  />
                  {errors.bapetenInterview && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.bapetenInterview.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-xs">Status Kelulusan BAPETEN</Label>
                <Select
                  defaultValue={
                    (editingRow?.finalStatus as string) ?? "LULUS"
                  }
                  onValueChange={(v) =>
                    setValue(
                      "finalStatus",
                      v as "LULUS" | "TIDAK_LULUS" | "REMIDIAL"
                    )
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LULUS">Lulus</SelectItem>
                    <SelectItem value="TIDAK_LULUS">Tidak Lulus</SelectItem>
                    <SelectItem value="REMIDIAL">Remidial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingRow(null)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={savingScore}
              >
                {savingScore ? "Menyimpan..." : "Simpan Nilai"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
