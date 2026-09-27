"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Upload,
  CreditCard,
  BookOpen,
  GraduationCap,
  CalendarDays,
  FileCheck2,
  AlertCircle,
  ChevronRight,
  Activity,
  Banknote,
  UserCheck,
  Camera,
} from "lucide-react";
import { BatchDocumentationEmbed } from "@/components/BatchDocumentationEmbed";

// ─── Types ────────────────────────────────────────────────────────────────────

type RegistrationStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "DOKUMEN_REVIEW"
  | "DOKUMEN_APPROVED"
  | "PEMBAYARAN_PENDING"
  | "PEMBAYARAN_VERIFIED"
  | "AKTIF"
  | "SELESAI"
  | "DITOLAK";

interface DocumentStatus {
  type: string;
  label: string;
  status: "PENDING" | "UPLOADED" | "APPROVED" | "REJECTED";
  fileName?: string;
  notes?: string;
}

interface ActivityItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: "info" | "success" | "warning" | "error";
}

interface DashboardSummary {
  registration: {
    id: string;
    status: RegistrationStatus;
    program: string;
    batchName: string;
    batchStartDate: string;
    batchEndDate: string;
    documentationUrl?: string | null;
    documentationTitle?: string | null;
  } | null;
  payment: {
    status: "BELUM_BAYAR" | "MENUNGGU_VERIFIKASI" | "LUNAS";
    amount: number;
    paidAt?: string;
  } | null;
  attendance: {
    hadir: number;
    totalHari: number;
  };
  documents: DocumentStatus[];
  activities: ActivityItem[];
}

// ─── Status Config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  RegistrationStatus,
  { label: string; color: string; bg: string; icon: React.ElementType }
> = {
  DRAFT: {
    label: "Draft",
    color: "text-slate-600",
    bg: "bg-slate-100",
    icon: Clock,
  },
  SUBMITTED: {
    label: "Menunggu Review",
    color: "text-yellow-700",
    bg: "bg-yellow-100",
    icon: Clock,
  },
  DOKUMEN_REVIEW: {
    label: "Review Dokumen",
    color: "text-blue-700",
    bg: "bg-blue-100",
    icon: FileCheck2,
  },
  DOKUMEN_APPROVED: {
    label: "Dokumen Disetujui",
    color: "text-green-700",
    bg: "bg-green-100",
    icon: CheckCircle2,
  },
  PEMBAYARAN_PENDING: {
    label: "Menunggu Pembayaran",
    color: "text-orange-700",
    bg: "bg-orange-100",
    icon: Banknote,
  },
  PEMBAYARAN_VERIFIED: {
    label: "Pembayaran Terverifikasi",
    color: "text-green-700",
    bg: "bg-green-100",
    icon: CheckCircle2,
  },
  AKTIF: {
    label: "Aktif Training",
    color: "text-blue-700",
    bg: "bg-blue-100",
    icon: GraduationCap,
  },
  SELESAI: {
    label: "Selesai",
    color: "text-slate-700",
    bg: "bg-slate-100",
    icon: CheckCircle2,
  },
  DITOLAK: {
    label: "Ditolak",
    color: "text-red-700",
    bg: "bg-red-100",
    icon: XCircle,
  },
};

const DOC_STATUS_ICON: Record<DocumentStatus["status"], React.ReactNode> = {
  PENDING: <Clock className="h-4 w-4 text-slate-400" />,
  UPLOADED: <Clock className="h-4 w-4 text-yellow-500" />,
  APPROVED: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  REJECTED: <XCircle className="h-4 w-4 text-red-500" />,
};

const DOC_STATUS_BADGE: Record<
  DocumentStatus["status"],
  { label: string; className: string }
> = {
  PENDING: { label: "Belum Upload", className: "bg-slate-100 text-slate-600" },
  UPLOADED: {
    label: "Menunggu Review",
    className: "bg-yellow-100 text-yellow-700",
  },
  APPROVED: { label: "Disetujui", className: "bg-green-100 text-green-700" },
  REJECTED: { label: "Ditolak", className: "bg-red-100 text-red-700" },
};

const ACTIVITY_COLORS: Record<ActivityItem["type"], string> = {
  info: "bg-blue-500",
  success: "bg-green-500",
  warning: "bg-yellow-500",
  error: "bg-red-500",
};

// ─── Mock / Fallback Data ─────────────────────────────────────────────────────

const MOCK_DATA: DashboardSummary = {
  registration: {
    id: "REG-2026-001",
    status: "DOKUMEN_REVIEW",
    program: "PPR Analisis",
    batchName: "Batch Oktober 2026",
    batchStartDate: "2026-10-06",
    batchEndDate: "2026-10-10",
  },
  payment: {
    status: "BELUM_BAYAR",
    amount: 7000000,
  },
  attendance: {
    hadir: 0,
    totalHari: 5,
  },
  documents: [
    { type: "KTP", label: "KTP / Identitas", status: "APPROVED", fileName: "ktp_john.pdf" },
    { type: "IJAZAH", label: "Ijazah Terakhir", status: "UPLOADED", fileName: "ijazah.pdf" },
    { type: "MCU", label: "Surat MCU", status: "REJECTED", fileName: "mcu.pdf", notes: "MCU lebih dari 6 bulan, harap perbarui." },
    { type: "SURAT_KERJA", label: "Surat Keterangan Kerja", status: "PENDING" },
    { type: "PASFOTO", label: "Pas Foto 3×4", status: "PENDING" },
    { type: "NPWP", label: "NPWP", status: "PENDING" },
  ],
  activities: [
    { id: "1", title: "Pendaftaran Diterima", description: "Formulir pendaftaran Anda telah diterima dan sedang direview.", timestamp: "2026-09-20T09:00:00Z", type: "info" },
    { id: "2", title: "KTP Disetujui", description: "Dokumen KTP Anda telah diverifikasi dan disetujui.", timestamp: "2026-09-21T14:30:00Z", type: "success" },
    { id: "3", title: "MCU Ditolak", description: "Dokumen MCU Anda ditolak. Harap upload ulang.", timestamp: "2026-09-22T10:00:00Z", type: "error" },
  ],
};

// ─── Helper ───────────────────────────────────────────────────────────────────

function formatRupiah(amount: number) {
  if (!amount || amount <= 0) return "Hubungi Admin";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string) {
  try {
    return format(new Date(dateStr), "d MMMM yyyy", { locale: localeId });
  } catch {
    return dateStr;
  }
}

function formatDateTime(dateStr: string) {
  try {
    return format(new Date(dateStr), "d MMM yyyy, HH:mm", { locale: localeId });
  } catch {
    return dateStr;
  }
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-28 w-full rounded-xl" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  );
}

// ─── Quick Stat Card ──────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  iconClass,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  iconClass?: string;
}) {
  return (
    <Card className="border border-slate-200 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
              iconClass ?? "bg-blue-100"
            )}
          >
            <Icon className="h-4 w-4 text-blue-600" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-slate-500 leading-tight">{label}</p>
            <p className="mt-0.5 text-sm font-bold text-slate-900 leading-tight truncate">
              {value}
            </p>
            {sub && (
              <p className="mt-0.5 text-[11px] text-slate-400 leading-tight">
                {sub}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.role === "ADMIN") {
      router.replace("/admin/dashboard");
      return;
    }
    if (session?.user?.role === "INSTRUCTOR") {
      router.replace("/instructor/dashboard");
      return;
    }
    if (session?.user?.role === "SPONSOR") {
      router.replace("/sponsor/dashboard");
      return;
    }

    const fetchData = async () => {
      try {
        const res = await fetch("/api/dashboard/summary");
        if (res.ok) {
          const json = await res.json();

          // Jika NIK atau nomor telepon belum lengkap, arahkan ke /profil
          if (json.isProfileComplete === false) {
            router.replace("/profil");
            return;
          }
          // Normalize into DashboardSummary
          const normalized: DashboardSummary = {
            registration: json.registration
              ? {
                  id: String(json.registration.id),
                  status: (json.registration.status as RegistrationStatus) || "DRAFT",
                  program: json.registration.program || json.batch?.training?.title || "Pelatihan ALARA",
                  batchName: json.registration.batchName || (json.batch?.batchNumber ? `Batch ${json.batch.batchNumber}` : "Batch 1"),
                  batchStartDate: json.registration.batchStartDate || json.batch?.startDate || new Date().toISOString(),
                  batchEndDate: json.registration.batchEndDate || json.batch?.endDate || new Date().toISOString(),
                  documentationUrl: json.registration.documentationUrl || json.batch?.documentationUrl || null,
                  documentationTitle: json.registration.documentationTitle || json.batch?.documentationTitle || null,
                }
              : null,
            payment: json.payment
              ? {
                  status:
                    json.payment.status === "VERIFIED" || json.payment.status === "LUNAS"
                      ? "LUNAS"
                      : json.payment.status === "PENDING" || json.payment.status === "MENUNGGU_VERIFIKASI"
                      ? "MENUNGGU_VERIFIKASI"
                      : "BELUM_BAYAR",
                  amount: typeof json.payment.amount === "number" ? json.payment.amount : Number(json.payment.amount || 0),
                  paidAt: json.payment.paidAt || json.payment.paymentDate,
                }
              : null,
            attendance: json.attendance || {
              hadir: json.attendanceSummary?.hadir ?? 0,
              totalHari:
                json.batch?.training?.durationDays ??
                (json.attendanceSummary?.totalSessions ? Math.round(json.attendanceSummary.totalSessions / 2) : 5),
            },
            documents: Array.isArray(json.documents)
              ? json.documents
              : Array.isArray(json.documentChecklist)
              ? json.documentChecklist.map((d: any) => ({
                  type: d.docType,
                  label: d.label,
                  status: d.isValid === true ? "APPROVED" : d.isValid === false ? "REJECTED" : d.uploaded ? "UPLOADED" : "PENDING",
                  fileName: d.filePath ? d.filePath.split("/").pop() : undefined,
                  notes: d.notes ?? undefined,
                }))
              : [],
            activities: Array.isArray(json.activities) ? json.activities : [],
          };
          setData(normalized);
        } else {
          setData(MOCK_DATA);
        }
      } catch (err) {
        console.error("Dashboard summary fetch failed:", err);
        setData(MOCK_DATA);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 11) return "Selamat Pagi";
    if (h < 15) return "Selamat Siang";
    if (h < 18) return "Selamat Sore";
    return "Selamat Malam";
  };

  if (loading) return <DashboardSkeleton />;
  if (!data) return null;

  const registration = data.registration;
  const payment = data.payment;
  const attendance = data.attendance || { hadir: 0, totalHari: 0 };
  const documents = data.documents || [];
  const activities = data.activities || [];

  const statusCfg = registration
    ? STATUS_CONFIG[registration.status]
    : null;
  const StatusIcon = statusCfg?.icon ?? Clock;

  const approvedDocs = documents.filter((d) => d.status === "APPROVED").length;
  const totalDocs = documents.length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* ── Greeting Banner ── */}
      <div className="rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 p-5 text-white shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-blue-100 text-sm">{greeting()},</p>
            <h1 className="mt-0.5 text-xl font-bold leading-tight">
              {session?.user.name ?? "Peserta"}
            </h1>
            <p className="mt-1 text-blue-200 text-sm">
              Selamat datang di ALARA Training System.
            </p>
          </div>
          <GraduationCap className="h-12 w-12 text-blue-300 shrink-0 hidden sm:block" />
        </div>

        {registration && statusCfg && (
          <div className="mt-4 flex items-center gap-2">
            <div
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
                statusCfg.bg,
                statusCfg.color
              )}
            >
              <StatusIcon className="h-3.5 w-3.5" />
              {statusCfg.label}
            </div>
            <span className="text-blue-200 text-xs">
              {registration.program} • {registration.batchName}
            </span>
          </div>
        )}

        {!registration && (
          <div className="mt-4">
            <Button asChild size="sm" variant="secondary" className="gap-2">
              <Link href="/pendaftaran">
                <AlertCircle className="h-4 w-4" />
                Mulai Pendaftaran
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* ── Quick Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={GraduationCap}
          label="Program"
          value={registration?.program ?? "—"}
          sub={registration?.batchName}
          iconClass="bg-blue-100"
        />
        <StatCard
          icon={CalendarDays}
          label="Jadwal Training"
          value={
            registration
              ? `${formatDate(registration.batchStartDate)}`
              : "Belum terdaftar"
          }
          sub={
            registration
              ? `s/d ${formatDate(registration.batchEndDate)}`
              : undefined
          }
          iconClass="bg-indigo-100"
        />
        <StatCard
          icon={Banknote}
          label="Status Pembayaran"
          value={
            payment?.status === "LUNAS"
              ? "Lunas"
              : payment?.status === "MENUNGGU_VERIFIKASI"
              ? "Verifikasi"
              : "Belum Bayar"
          }
          sub={payment ? formatRupiah(payment.amount) : undefined}
          iconClass={
            payment?.status === "LUNAS"
              ? "bg-green-100"
              : "bg-orange-100"
          }
        />
        <StatCard
          icon={UserCheck}
          label="Kehadiran"
          value={`${attendance.hadir} / ${attendance.totalHari} hari`}
          sub={`${Math.round((attendance.hadir / Math.max(attendance.totalHari, 1)) * 100)}% hadir`}
          iconClass="bg-teal-100"
        />
      </div>

      {/* ── Middle Grid ── */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Document Checklist */}
        <Card className="border border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <FileCheck2 className="h-4 w-4 text-blue-600" />
                Checklist Dokumen
              </CardTitle>
              <span className="text-xs text-slate-500">
                {approvedDocs}/{totalDocs} disetujui
              </span>
            </div>
            {/* Progress bar */}
            <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-600 transition-all"
                style={{ width: `${totalDocs > 0 ? (approvedDocs / totalDocs) * 100 : 0}%` }}
              />
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {documents.map((doc) => {
              const badgeCfg = DOC_STATUS_BADGE[doc.status] || DOC_STATUS_BADGE.PENDING;
              return (
                <div
                  key={doc.type}
                  className="flex items-start gap-3 rounded-lg p-2 hover:bg-slate-50"
                >
                  <div className="mt-0.5 shrink-0">
                    {DOC_STATUS_ICON[doc.status] || DOC_STATUS_ICON.PENDING}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-slate-800 truncate">
                        {doc.label}
                      </p>
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                          badgeCfg.className
                        )}
                      >
                        {badgeCfg.label}
                      </span>
                    </div>
                    {doc.fileName && (
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {doc.fileName}
                      </p>
                    )}
                    {doc.notes && (
                      <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3 shrink-0" />
                        {doc.notes}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Activity Timeline */}
        <Card className="border border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-600" />
              Aktivitas Terbaru
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {activities.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">
                Belum ada aktivitas.
              </p>
            ) : (
              <div className="relative pl-5 space-y-5">
                {/* Timeline line */}
                <div className="absolute left-[7px] top-1.5 bottom-1.5 w-px bg-slate-200" />

                {activities.map((activity, idx) => (
                  <div key={activity.id} className="relative">
                    {/* Dot */}
                    <div
                      className={cn(
                        "absolute -left-5 mt-1 h-3 w-3 rounded-full border-2 border-white",
                        ACTIVITY_COLORS[activity.type]
                      )}
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-800 leading-tight">
                        {activity.title}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500 leading-snug">
                        {activity.description}
                      </p>
                      <p className="mt-1 text-[10px] text-slate-400">
                        {formatDateTime(activity.timestamp)}
                      </p>
                    </div>
                    {idx < activities.length - 1 && (
                      <Separator className="mt-4" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Dokumentasi Batch (Google Drive / YouTube) ── */}
      {data?.registration?.documentationUrl && (
        <Card className="border border-indigo-100 bg-white shadow-xs overflow-hidden">
          <CardHeader className="pb-3 border-b border-indigo-50 bg-gradient-to-r from-indigo-50/60 to-blue-50/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <CardTitle className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <Camera className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600" />
                {data.registration.documentationTitle || `Dokumentasi Kegiatan ${data.registration.batchName}`}
              </CardTitle>
              <Badge variant="outline" className="text-xs font-normal border-indigo-200 text-indigo-700 bg-white w-fit">
                Galeri &amp; Video Batch
              </Badge>
            </div>
            <CardDescription className="text-xs text-slate-500 mt-0.5">
              Dokumentasi foto dan video selama pelaksanaan batch pelatihan Anda dapat dilihat langsung di bawah ini.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-5">
            <BatchDocumentationEmbed
              url={data.registration.documentationUrl}
              title={data.registration.documentationTitle || `Dokumentasi ${data.registration.batchName}`}
            />
          </CardContent>
        </Card>
      )}

      {/* ── Quick Actions ── */}
      <Card className="border border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-800">
            Aksi Cepat
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button
              asChild
              variant="outline"
              className="h-auto flex-col gap-2 py-4 border-slate-200 hover:border-blue-300 hover:bg-blue-50 group"
            >
              <Link href="/dokumen">
                <Upload className="h-5 w-5 text-slate-500 group-hover:text-blue-600 transition-colors" />
                <span className="text-sm font-medium text-slate-700 group-hover:text-blue-700">
                  Upload Dokumen
                </span>
                <span className="text-xs text-slate-400">
                  {totalDocs - approvedDocs} dokumen menunggu
                </span>
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="h-auto flex-col gap-2 py-4 border-slate-200 hover:border-green-300 hover:bg-green-50 group"
            >
              <Link href="/pembayaran">
                <CreditCard className="h-5 w-5 text-slate-500 group-hover:text-green-600 transition-colors" />
                <span className="text-sm font-medium text-slate-700 group-hover:text-green-700">
                  Konfirmasi Bayar
                </span>
                <span className="text-xs text-slate-400">
                  {payment?.status === "LUNAS"
                    ? "Pembayaran lunas"
                    : "Upload bukti transfer"}
                </span>
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="h-auto flex-col gap-2 py-4 border-slate-200 hover:border-purple-300 hover:bg-purple-50 group"
            >
              <Link href="/lms">
                <BookOpen className="h-5 w-5 text-slate-500 group-hover:text-purple-600 transition-colors" />
                <span className="text-sm font-medium text-slate-700 group-hover:text-purple-700">
                  Akses Modul
                </span>
                <span className="text-xs text-slate-400">
                  Buka materi pelatihan
                </span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
