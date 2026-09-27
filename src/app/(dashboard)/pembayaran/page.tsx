"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Upload,
  FileText,
  Download,
  Copy,
  Banknote,
  Shield,
  AlertCircle,
  X,
  RefreshCw,
  CheckCheck,
  Loader2,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import { generateInvoicePdf } from "@/lib/invoice-pdf";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// ─── Types ────────────────────────────────────────────────────────────────────

type PaymentStatus = "BELUM_BAYAR" | "MENUNGGU_VERIFIKASI" | "LUNAS" | "DITOLAK";

interface PaymentTimeline {
  label: string;
  timestamp?: string;
  done: boolean;
  current: boolean;
}

interface BankInfo {
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
  institutionName: string;
  ktunNumber: string;
}

interface TrainingProgram {
  id: number;
  category: string;
  title: string;
  price: number;
  durationDays: number;
  certBadge: string | null;
}

interface RegistrationOption {
  id: number;
  batchNumber: number;
  trainingId: number;
  trainingTitle: string;
  category: string;
  price: number;
  paymentStatus: string;
  startDate: string;
  endDate: string;
}

interface PaymentData {
  registrationId?: number;
  category?: string;
  invoiceNo: string;
  program: string;
  batch: string;
  amount: number;
  dueDate: string;
  paymentStatus: PaymentStatus;
  buktiFileName?: string;
  buktiUploadedAt?: string;
  verifiedAt?: string;
  rejectedReason?: string;
  paidAt?: string;
  paidBy?: string;
  pesertaName?: string;
  pesertaNik?: string;
  instansi?: string;
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const buktiSchema = z.object({
  namaPengirim: z.string().min(2, "Nama pengirim wajib diisi"),
  tanggalBayar: z.string().min(1, "Tanggal bayar wajib diisi"),
});

type BuktiFormData = z.infer<typeof buktiSchema>;

// ─── Mock ─────────────────────────────────────────────────────────────────────

const MOCK_PAYMENT: PaymentData = {
  invoiceNo: "INV-2026-00042",
  program: "PPR Analisis",
  batch: "Batch Oktober 2026",
  amount: 7000000,
  dueDate: "2026-10-01",
  paymentStatus: "BELUM_BAYAR",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRupiah(amount: number) {
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
    return format(new Date(dateStr), "d MMMM yyyy, HH:mm", { locale: localeId });
  } catch {
    return dateStr;
  }
}

// ─── Status Config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  PaymentStatus,
  { label: string; icon: React.ElementType; badgeClass: string; desc: string }
> = {
  BELUM_BAYAR: {
    label: "Belum Dibayar",
    icon: Clock,
    badgeClass: "bg-yellow-100 text-yellow-700 border-yellow-200",
    desc: "Segera unggah bukti transfer untuk proses verifikasi",
  },
  MENUNGGU_VERIFIKASI: {
    label: "Menunggu Verifikasi",
    icon: Clock,
    badgeClass: "bg-yellow-100 text-yellow-700 border-yellow-200",
    desc: "Bukti transfer sedang diverifikasi oleh admin. Proses 1×24 jam kerja.",
  },
  LUNAS: {
    label: "Lunas",
    icon: CheckCircle2,
    badgeClass: "bg-green-100 text-green-700 border-green-200",
    desc: "Pembayaran telah dikonfirmasi. Terima kasih!",
  },
  DITOLAK: {
    label: "Bukti Ditolak",
    icon: XCircle,
    badgeClass: "bg-red-100 text-red-700 border-red-200",
    desc: "Bukti transfer Anda ditolak. Harap upload ulang.",
  },
};

// ─── Copy to Clipboard ────────────────────────────────────────────────────────

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
    >
      {copied ? (
        <CheckCheck className="h-3.5 w-3.5 text-green-500" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
      <span className="text-xs">{copied ? "Disalin!" : "Salin"}</span>
    </button>
  );
}

// ─── Payment Timeline ─────────────────────────────────────────────────────────

function PaymentTimeline({ items }: { items: PaymentTimeline[] }) {
  return (
    <div className="relative pl-5 space-y-5">
      <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-slate-200" />
      {items.map((item, idx) => (
        <div key={idx} className="relative flex items-start gap-3">
          <div
            className={cn(
              "absolute -left-5 mt-1 h-4 w-4 rounded-full border-2 flex items-center justify-center",
              item.done
                ? "border-green-500 bg-green-500"
                : item.current
                ? "border-blue-500 bg-blue-500"
                : "border-slate-300 bg-white"
            )}
          >
            {item.done && <CheckCircle2 className="h-2.5 w-2.5 text-white" />}
            {item.current && !item.done && (
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            )}
          </div>
          <div className="ml-1">
            <p
              className={cn(
                "text-sm font-semibold leading-tight",
                item.done
                  ? "text-green-700"
                  : item.current
                  ? "text-blue-700"
                  : "text-slate-400"
              )}
            >
              {item.label}
            </p>
            {item.timestamp && (
              <p className="text-xs text-slate-400 mt-0.5">
                {formatDateTime(item.timestamp)}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Upload Bukti Form ────────────────────────────────────────────────────────

function UploadBuktiForm({
  onUploaded,
  existingFile,
  registrationId,
}: {
  onUploaded: (data: BuktiFormData, file: File) => void;
  existingFile?: string;
  registrationId?: number;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BuktiFormData>({
    resolver: zodResolver(buktiSchema),
    defaultValues: {
      namaPengirim: "",
      tanggalBayar: format(new Date(), "yyyy-MM-dd"),
    },
  });

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) setFile(accepted[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
    accept: {
      "image/*": [".jpg", ".jpeg", ".png"],
      "application/pdf": [".pdf"],
    },
    onDropRejected: () => toast.error("File tidak valid. Gunakan JPG, PNG, atau PDF maks 10 MB."),
  });

  const onSubmit = async (data: BuktiFormData) => {
    if (!file) {
      toast.error("Harap pilih file bukti transfer.");
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("bukti", file);
      fd.append("file", file);
      fd.append("namaPengirim", data.namaPengirim);
      fd.append("tanggalBayar", data.tanggalBayar);
      if (registrationId) {
        fd.append("registrationId", String(registrationId));
      }

      const res = await fetch("/api/pembayaran/bukti", { method: "POST", body: fd });

      if (res.ok) {
        toast.success("Bukti transfer berhasil diupload. Menunggu verifikasi admin.");
        onUploaded(data, file);
      } else {
        const err = await res.json();
        toast.error(err.error || err.message || "Gagal mengunggah bukti transfer.");
      }
    } catch {
      toast.error("Terjadi kesalahan saat mengunggah bukti transfer.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Drop zone */}
      {file ? (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3">
          <FileText className="h-4 w-4 text-green-600 shrink-0" />
          <span className="flex-1 text-sm text-green-700 truncate">{file.name}</span>
          <span className="text-xs text-green-500">
            {(file.size / 1024).toFixed(0)} KB
          </span>
          <button type="button" onClick={() => setFile(null)}>
            <X className="h-4 w-4 text-green-600 hover:text-red-500 transition-colors" />
          </button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={cn(
            "rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-colors",
            isDragActive
              ? "border-blue-400 bg-blue-50"
              : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
          )}
        >
          <input {...getInputProps()} />
          <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm text-slate-600 font-medium">
            {isDragActive ? "Lepas file di sini" : "Klik atau seret bukti transfer"}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Format JPG, PNG, atau PDF · Maks 5 MB
          </p>
          {existingFile && (
            <p className="text-xs text-slate-400 mt-1">
              File saat ini: <span className="font-medium">{existingFile}</span>
            </p>
          )}
        </div>
      )}

      {/* Extra fields */}
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="namaPengirim">
            Nama Pengirim <span className="text-red-500">*</span>
          </Label>
          <Input
            id="namaPengirim"
            placeholder="Sesuai nama rekening pengirim"
            {...register("namaPengirim")}
            className={cn(errors.namaPengirim && "border-red-400")}
          />
          {errors.namaPengirim && (
            <p className="text-xs text-red-500">{errors.namaPengirim.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor="tanggalBayar">
            Tanggal Transfer <span className="text-red-500">*</span>
          </Label>
          <Input
            id="tanggalBayar"
            type="date"
            max={format(new Date(), "yyyy-MM-dd")}
            {...register("tanggalBayar")}
            className={cn(errors.tanggalBayar && "border-red-400")}
          />
          {errors.tanggalBayar && (
            <p className="text-xs text-red-500">{errors.tanggalBayar.message}</p>
          )}
        </div>
      </div>

      <Button type="submit" disabled={uploading} className="w-full gap-2">
        {uploading ? (
          <>
            <RefreshCw className="h-4 w-4 animate-spin" />
            Mengupload...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4" />
            Upload Bukti Transfer
          </>
        )}
      </Button>
    </form>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PembayaranPage() {
  const [payment, setPayment] = useState<PaymentData | null>(null);
  const [hasRegistration, setHasRegistration] = useState(true);
  const [allRegistrations, setAllRegistrations] = useState<RegistrationOption[]>([]);
  const [selectedRegId, setSelectedRegId] = useState<number | null>(null);
  const [bankInfo, setBankInfo] = useState<BankInfo>({
    bankName: "Bank Mandiri",
    bankAccountNumber: "166-00-0733926-0",
    bankAccountName: "CV Hikmat Proteksi ALARA",
    institutionName: "CV. Hikmat Proteksi ALARA",
    ktunNumber: "No. 07998.722.1.040726",
  });
  const [trainingsList, setTrainingsList] = useState<TrainingProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);

  const fetchPayment = useCallback(async (regId?: number) => {
    try {
      setLoading(true);
      const url = regId ? `/api/pembayaran?registrationId=${regId}` : "/api/pembayaran";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.hasRegistration === false) {
          setHasRegistration(false);
          setPayment(null);
          if (data.bankInfo) setBankInfo(data.bankInfo);
          if (data.trainings) setTrainingsList(data.trainings);
          return;
        }
        setHasRegistration(true);
        setPayment(data);
        if (data.registrationId) setSelectedRegId(data.registrationId);
        if (data.allRegistrations) setAllRegistrations(data.allRegistrations);
        if (data.bankInfo) setBankInfo(data.bankInfo);
        if (data.trainings) setTrainingsList(data.trainings);
      } else {
        setHasRegistration(false);
        setPayment(null);
      }
    } catch (err) {
      console.error("Error fetching payment:", err);
      setHasRegistration(false);
      setPayment(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayment();
  }, [fetchPayment]);

  const handleSelectRegistration = (regIdStr: string) => {
    const regId = parseInt(regIdStr, 10);
    if (!isNaN(regId)) {
      setSelectedRegId(regId);
      fetchPayment(regId);
    }
  };

  const handleBuktiUploaded = async (data: BuktiFormData, file: File) => {
    setUploadModalOpen(false);
    setPayment((prev) =>
      prev
        ? {
            ...prev,
            paymentStatus: "MENUNGGU_VERIFIKASI",
            buktiFileName: file.name,
            buktiUploadedAt: new Date().toISOString(),
            paidBy: data.namaPengirim,
            paidAt: data.tanggalBayar,
          }
        : prev
    );
    await fetchPayment(payment?.registrationId || selectedRegId || undefined);
  };

  const [downloading, setDownloading] = useState(false);

  const handleDownloadInvoice = () => {
    if (!payment) return;
    setDownloading(true);
    try {
      generateInvoicePdf({
        ...payment,
        institutionName: bankInfo.institutionName,
        ktunNumber: bankInfo.ktunNumber,
        bankName: bankInfo.bankName,
        bankAccountNumber: bankInfo.bankAccountNumber,
        bankAccountName: bankInfo.bankAccountName,
      });
      toast.success("Invoice PDF berhasil diunduh.");
    } catch (error) {
      console.error("Gagal membuat PDF invoice:", error);
      toast.error("Gagal mengunduh invoice PDF. Silakan coba lagi.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (!hasRegistration || !payment) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Pembayaran</h1>
          <p className="text-sm text-slate-500">
            Kelola tagihan dan konfirmasi pembayaran pelatihan Anda.
          </p>
        </div>

        <Card className="p-8 text-center space-y-4 border-dashed border-2 border-slate-300">
          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto text-blue-600">
            <Banknote className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-slate-900 text-lg">
              Belum Ada Tagihan Pembayaran Aktif
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Anda belum memiliki pendaftaran batch pelatihan yang aktif. Invoice dan tagihan resmi akan otomatis diterbitkan setelah Anda memilih program pelatihan di menu Pendaftaran.
            </p>
          </div>
          <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
            <a href="/pendaftaran">
              Daftar Pelatihan Sekarang
            </a>
          </Button>
        </Card>

        {/* Official Database Training Types & Tariffs */}
        {trainingsList.length > 0 && (
          <Card className="border border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50 border-b py-3 px-5">
              <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" />
                Daftar Biaya Resmi Program Pelatihan ALARA (Sesuai Database)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {trainingsList.map((t) => (
                  <div key={t.id} className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition-colors space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs bg-slate-50 font-semibold text-slate-700">
                        {t.certBadge || "BAPETEN"}
                      </Badge>
                      <span className="text-xs text-slate-500">{t.durationDays} Hari</span>
                    </div>
                    <p className="font-semibold text-sm text-slate-900 line-clamp-2 leading-snug">
                      {t.title}
                    </p>
                    <div className="pt-2 border-t">
                      <p className="text-xs text-slate-500">Biaya Investasi:</p>
                      <p className="text-base font-bold text-blue-700 font-mono">
                        {formatRupiah(t.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[payment.paymentStatus];
  const StatusIcon = statusCfg.icon;

  // Build timeline
  const timelineItems: PaymentTimeline[] = [
    {
      label: "Invoice Dibuat",
      timestamp: undefined,
      done: true,
      current: false,
    },
    {
      label: "Bukti Transfer Diupload",
      timestamp: payment.buktiUploadedAt,
      done: !!payment.buktiUploadedAt,
      current:
        payment.paymentStatus === "BELUM_BAYAR" ||
        payment.paymentStatus === "DITOLAK",
    },
    {
      label: "Verifikasi oleh Admin",
      timestamp: payment.verifiedAt,
      done: payment.paymentStatus === "LUNAS",
      current: payment.paymentStatus === "MENUNGGU_VERIFIKASI",
    },
    {
      label: "Pembayaran Lunas",
      timestamp: payment.paymentStatus === "LUNAS" ? payment.verifiedAt : undefined,
      done: payment.paymentStatus === "LUNAS",
      current: false,
    },
  ];

  const canUpload = payment.paymentStatus !== "LUNAS";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Pembayaran</h1>
          <p className="text-sm text-slate-500">
            Kelola tagihan dan konfirmasi pembayaran pelatihan Anda.
          </p>
        </div>
        <Badge
          className={cn(
            "flex items-center gap-1.5 border text-sm px-3 py-1.5",
            statusCfg.badgeClass
          )}
        >
          <StatusIcon className="h-3.5 w-3.5" />
          {statusCfg.label}
        </Badge>
      </div>

      {/* Multi-Registration Switcher if user has enrolled in multiple programs */}
      {allRegistrations.length > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-blue-50/70 border border-blue-200 rounded-xl p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-blue-600 shrink-0" />
            <span className="text-xs font-semibold text-blue-900">
              Pilih Tagihan Pelatihan ({allRegistrations.length} Pendaftaran Terdaftar):
            </span>
          </div>
          <select
            value={payment.registrationId || selectedRegId || ""}
            onChange={(e) => handleSelectRegistration(e.target.value)}
            className="text-xs bg-white border border-blue-300 rounded px-2.5 py-1.5 font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 max-w-full"
          >
            {allRegistrations.map((r) => (
              <option key={r.id} value={r.id}>
                Batch {r.batchNumber} - {r.trainingTitle} ({formatRupiah(r.price)} • {r.paymentStatus === "PAID" ? "LUNAS" : r.paymentStatus})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Status Alert */}
      <div
        className={cn(
          "flex items-start gap-2 rounded-xl p-3 text-sm border",
          !payment.buktiFileName && payment.paymentStatus !== "LUNAS" && payment.paymentStatus !== "DITOLAK"
            ? "bg-yellow-100 text-yellow-700 border-yellow-200"
            : statusCfg.badgeClass
        )}
      >
        <StatusIcon className="h-4 w-4 shrink-0 mt-0.5" />
        <p>
          {!payment.buktiFileName && payment.paymentStatus !== "LUNAS" && payment.paymentStatus !== "DITOLAK"
            ? "Segera unggah bukti transfer untuk proses verifikasi"
            : statusCfg.desc}
        </p>
      </div>

      {payment.paymentStatus === "DITOLAK" && payment.rejectedReason && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Alasan Penolakan:</p>
            <p className="mt-0.5">{payment.rejectedReason}</p>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Invoice */}
        <div className="space-y-4">
          {/* Invoice Card */}
          <Card className="border-2 border-slate-200 shadow-sm overflow-hidden" ref={invoiceRef}>
            {/* Invoice Header */}
            <div className="bg-blue-700 text-white p-4">
              <div className="flex items-center gap-3 mb-3">
                <img
                  src="/logo.png"
                  alt="ALARA Logo"
                  className="h-10 w-10 object-contain rounded-md bg-white p-0.5 shrink-0"
                />
                <div>
                  <p className="font-bold leading-tight">{bankInfo.institutionName || "CV Hikmat Proteksi ALARA"}</p>
                  <p className="text-xs text-blue-200 leading-tight">
                    {bankInfo.ktunNumber ? `KTUN BAPETEN ${bankInfo.ktunNumber}` : "KTUN BAPETEN No. 07998.722.1.040726"}
                  </p>
                </div>
              </div>
              <Separator className="bg-blue-500 mb-3" />
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-blue-200">No. Invoice</p>
                  <p className="font-mono font-bold">{payment.invoiceNo}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-blue-200">Jatuh Tempo</p>
                  <p className="text-sm font-semibold">{formatDate(payment.dueDate)}</p>
                </div>
              </div>
            </div>

            {/* Invoice Body */}
            <CardContent className="p-4 space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Program</span>
                  <span className="font-medium text-slate-800 text-right max-w-[65%]">{payment.program}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Batch</span>
                  <span className="font-medium text-slate-800">{payment.batch}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Tanggal Invoice</span>
                  <span className="text-slate-800">{format(new Date(), "d MMMM yyyy", { locale: localeId })}</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Biaya Pelatihan</span>
                  <span className="text-sm font-medium text-slate-800">
                    {formatRupiah(payment.amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">PPN</span>
                  <span className="text-sm text-slate-500">Termasuk</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900">Total Tagihan</span>
                <span className="font-bold text-xl text-blue-700">
                  {formatRupiah(payment.amount)}
                </span>
              </div>

              {payment.paymentStatus === "LUNAS" && (
                <div className="flex items-center justify-center gap-2 rounded-lg bg-green-50 border border-green-200 p-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-semibold text-green-700">LUNAS</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons: Upload Bukti & Download Invoice */}
          <div className="space-y-2.5">
            {canUpload && (
              <Button
                className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm h-11 text-sm cursor-pointer"
                onClick={() => setUploadModalOpen(true)}
              >
                <Upload className="h-4 w-4" />
                {payment.buktiFileName ? "Ganti / Upload Ulang Bukti Bayar" : "Upload Bukti Pembayaran"}
              </Button>
            )}

            <Button
              variant="outline"
              className="w-full gap-2 border-slate-300 text-slate-700 hover:bg-slate-50 font-medium h-10 text-sm cursor-pointer"
              onClick={handleDownloadInvoice}
              disabled={downloading}
            >
              {downloading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  Menyiapkan PDF...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 text-blue-600" />
                  Download Invoice PDF
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Right: Payment Info + Upload */}
        <div className="space-y-4">
          {/* Bank Transfer Info */}
          <Card className="border border-blue-200 bg-blue-50 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-blue-800 flex items-center gap-2">
                <Banknote className="h-4 w-4" />
                Informasi Rekening Resmi ALARA
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <p className="text-xs text-blue-600">
                Transfer ke rekening resmi lembaga terdaftar:
              </p>

              <div className="rounded-lg bg-white border border-blue-200 p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-slate-500">Bank</p>
                    <p className="font-bold text-slate-900">{bankInfo.bankName}</p>
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-xs text-slate-500">Nomor Rekening</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="font-mono font-bold text-slate-900 text-lg tracking-wider">
                      {bankInfo.bankAccountNumber}
                    </p>
                    <CopyButton value={bankInfo.bankAccountNumber.replace(/[^0-9]/g, "")} />
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-xs text-slate-500">Atas Nama</p>
                  <p className="font-semibold text-slate-900">
                    {bankInfo.bankAccountName}
                  </p>
                </div>
                <Separator />
                <div>
                  <p className="text-xs text-slate-500">Jumlah Transfer</p>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-blue-700 text-base font-mono">
                      {formatRupiah(payment.amount)}
                    </p>
                    <CopyButton value={payment.amount.toString()} />
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 text-xs text-blue-700 bg-blue-100 rounded-lg p-2">
                <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <p>
                  Pastikan jumlah transfer <strong>tepat</strong> sesuai tagihan agar proses
                  verifikasi lebih cepat. Cantumkan nomor invoice pada keterangan transfer.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Bukti Transfer / Upload Bukti */}
          {payment.buktiFileName ? (
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  Bukti Transfer Terupload
                </CardTitle>
                {canUpload && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-blue-600 hover:text-blue-800 gap-1"
                    onClick={() => setUploadModalOpen(true)}
                  >
                    <Upload className="h-3.5 w-3.5" />
                    Ganti File
                  </Button>
                )}
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50/70 p-3">
                  <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">
                      {payment.buktiFileName}
                    </p>
                    {payment.buktiUploadedAt && (
                      <p className="text-xs text-slate-400">
                        Diupload pada: {formatDateTime(payment.buktiUploadedAt)}
                      </p>
                    )}
                  </div>
                </div>
                {payment.paidBy && (
                  <div className="text-xs text-slate-500 space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <div className="flex justify-between">
                      <span>Pengirim</span>
                      <span className="font-medium text-slate-700">{payment.paidBy}</span>
                    </div>
                    {payment.paidAt && (
                      <div className="flex justify-between">
                        <span>Tanggal Bayar</span>
                        <span className="font-medium text-slate-700">
                          {formatDate(payment.paidAt)}
                        </span>
                      </div>
                    )}
                  </div>
                )}
                {canUpload && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs gap-1.5 border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
                    onClick={() => setUploadModalOpen(true)}
                  >
                    <Upload className="h-3.5 w-3.5 text-blue-600" />
                    Upload Ulang Bukti Bayar
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            canUpload && (
              <Card className="border border-slate-200 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                    <Upload className="h-4 w-4 text-blue-600" />
                    {payment.paymentStatus === "DITOLAK"
                      ? "Upload Ulang Bukti Transfer"
                      : "Upload Bukti Transfer"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <UploadBuktiForm
                    onUploaded={handleBuktiUploaded}
                    existingFile={payment.buktiFileName}
                    registrationId={payment.registrationId || selectedRegId || undefined}
                  />
                </CardContent>
              </Card>
            )
          )}

          {/* Timeline */}
          <Card className="border border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-800">
                Status Pembayaran
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <PaymentTimeline items={timelineItems} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal Upload Bukti Transfer */}
      <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Upload className="h-4 w-4 text-blue-600" />
              Upload Bukti Pembayaran
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Unggah foto struk atau scan bukti transfer bank untuk diverifikasi oleh admin ALARA.
            </DialogDescription>
          </DialogHeader>
          <div className="pt-2">
            <UploadBuktiForm
              onUploaded={handleBuktiUploaded}
              existingFile={payment.buktiFileName}
              registrationId={payment.registrationId || selectedRegId || undefined}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
