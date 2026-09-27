"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useDropzone } from "react-dropzone";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Upload,
  FileText,
  RefreshCw,
  AlertCircle,
  Eye,
  X,
  GraduationCap,
  Calendar,
  MapPin,
  Layers,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

type DocStatus = "PENDING" | "UPLOADED" | "APPROVED" | "REJECTED";

interface DocumentRecord {
  id?: string;
  type: string;
  label: string;
  required: boolean;
  status: DocStatus;
  fileName?: string;
  fileUrl?: string;
  uploadedAt?: string;
  adminNotes?: string;
  /** MCU specific */
  mcuDate?: string;
  mcuDarah?: boolean;
  mcuUrine?: boolean;
  hint: string;
}

interface ServerDoc {
  id: number;
  docType: string;
  filePath: string;
  isValid: boolean | null;
  notes?: string | null;
  mcuIssueDate?: string | null;
  hasDarah?: boolean | null;
  hasUrine?: boolean | null;
  createdAt: string;
}

interface RegistrationSummary {
  id: number;
  registrationStatus: string;
  paymentStatus: string;
  createdAt: string;
  batchNumber: number;
  startDate: string;
  endDate: string;
  trainingTitle: string;
  trainingCategory: string;
  certBadge: string;
}

interface ActiveRegistration {
  id: number;
  registrationStatus: string;
  paymentStatus: string;
  createdAt: string;
  batch: {
    id: number;
    batchNumber: number;
    startDate: string;
    endDate: string;
    location: string;
  };
  training: {
    id: number;
    title: string;
    category: string;
    certBadge: string;
    durationDays: number;
  };
}

// ─── Config ───────────────────────────────────────────────────────────────────

const DOC_DEFINITIONS: Omit<DocumentRecord, "status">[] = [
  { type: "KTP", label: "KTP / Kartu Identitas", required: true, hint: "Format JPG/PNG/PDF, maks 5 MB" },
  { type: "IJAZAH", label: "Ijazah Terakhir", required: true, hint: "Minimal D3/S1 untuk PPR Analisis" },
  { type: "MCU", label: "Surat MCU (Medical Check-Up)", required: true, hint: "Berlaku maks 6 bulan terakhir" },
  { type: "SURAT_KERJA", label: "Surat Keterangan Bekerja", required: true, hint: "Dari instansi / perusahaan asal" },
  { type: "PASFOTO", label: "Pas Foto 3×4 (Background Merah)", required: true, hint: "Format JPG/PNG, maks 2 MB" },
  { type: "NPWP", label: "NPWP", required: false, hint: "Opsional — scan dokumen NPWP" },
];

const INITIAL_DOCS: DocumentRecord[] = DOC_DEFINITIONS.map((def) => ({
  ...def,
  status: "PENDING",
}));

const STATUS_CONFIG: Record<DocStatus, { label: string; icon: React.ElementType; badgeClass: string }> = {
  PENDING: { label: "Belum Upload", icon: Clock, badgeClass: "bg-slate-100 text-slate-600" },
  UPLOADED: { label: "Menunggu Review", icon: Clock, badgeClass: "bg-yellow-100 text-yellow-700" },
  APPROVED: { label: "Disetujui", icon: CheckCircle2, badgeClass: "bg-green-100 text-green-700" },
  REJECTED: { label: "Ditolak", icon: XCircle, badgeClass: "bg-red-100 text-red-700" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDateTime(dateStr: string) {
  try {
    return format(new Date(dateStr), "d MMM yyyy, HH:mm", { locale: localeId });
  } catch {
    return dateStr;
  }
}

// ─── Upload Dialog ────────────────────────────────────────────────────────────

function UploadDialog({
  doc,
  open,
  registrationId,
  onClose,
  onSuccess,
}: {
  doc: DocumentRecord;
  open: boolean;
  registrationId: number | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [mcuDate, setMcuDate] = useState(doc.mcuDate ?? "");
  const [mcuDarah, setMcuDarah] = useState(doc.mcuDarah ?? false);
  const [mcuUrine, setMcuUrine] = useState(doc.mcuUrine ?? false);

  const isMCU = doc.type === "MCU";

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) setFile(accepted[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
    accept: {
      "image/*": [".jpg", ".jpeg", ".png"],
      "application/pdf": [".pdf"],
    },
    onDropRejected: () => toast.error("File ditolak. Format atau ukuran tidak sesuai."),
  });

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("docType", doc.type);
      if (registrationId) {
        formData.append("registrationId", String(registrationId));
      }
      if (isMCU) {
        if (mcuDate) {
          formData.append("mcuIssueDate", mcuDate);
          formData.append("mcuDate", mcuDate);
        }
        formData.append("hasDarah", String(mcuDarah));
        formData.append("hasUrine", String(mcuUrine));
      }

      const res = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        toast.success(`${doc.label} berhasil diupload.`);
        onSuccess();
        onClose();
      } else {
        const err = await res.json();
        toast.error(err.error || err.message || "Gagal upload.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Terjadi kesalahan saat mengupload dokumen.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-4 w-4 text-blue-600" />
            {doc.status === "REJECTED" ? "Upload Ulang" : "Upload"} Dokumen
          </DialogTitle>
          <DialogDescription>{doc.label}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
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
                {isDragActive ? "Lepas file di sini" : "Klik atau seret file"}
              </p>
              <p className="text-xs text-slate-400 mt-1">{doc.hint}</p>
            </div>
          )}

          {/* MCU extra fields */}
          {isMCU && (
            <div className="space-y-3 rounded-lg border border-slate-200 p-3 bg-slate-50">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Detail MCU
              </p>
              <div className="space-y-1">
                <Label htmlFor="mcuDate" className="text-sm">
                  Tanggal MCU <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="mcuDate"
                  type="date"
                  value={mcuDate}
                  onChange={(e) => setMcuDate(e.target.value)}
                  max={format(new Date(), "yyyy-MM-dd")}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-sm">Pemeriksaan yang Dilakukan</Label>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="mcuDarah"
                    checked={mcuDarah}
                    onCheckedChange={(v) => setMcuDarah(!!v)}
                  />
                  <Label htmlFor="mcuDarah" className="cursor-pointer text-sm font-normal">
                    Pemeriksaan Darah
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="mcuUrine"
                    checked={mcuUrine}
                    onCheckedChange={(v) => setMcuUrine(!!v)}
                  />
                  <Label htmlFor="mcuUrine" className="cursor-pointer text-sm font-normal">
                    Pemeriksaan Urine
                  </Label>
                </div>
              </div>
            </div>
          )}

          {/* Rejected note */}
          {doc.status === "REJECTED" && doc.adminNotes && (
            <div className="flex gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Catatan Admin:</p>
                <p className="mt-0.5">{doc.adminNotes}</p>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Batal
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!file || uploading || (isMCU && !mcuDate)}
              className="flex-1 gap-2"
            >
              {uploading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Document Row ─────────────────────────────────────────────────────────────

function DocumentRow({
  doc,
  onUpload,
}: {
  doc: DocumentRecord;
  onUpload: (doc: DocumentRecord) => void;
}) {
  const cfg = STATUS_CONFIG[doc.status];
  const StatusIcon = cfg.icon;
  const canUpload = doc.status === "PENDING" || doc.status === "REJECTED";

  return (
    <div
      className={cn(
        "rounded-xl border p-4 transition-all",
        doc.status === "REJECTED"
          ? "border-red-200 bg-red-50"
          : doc.status === "APPROVED"
          ? "border-green-200 bg-green-50"
          : "border-slate-200 bg-white"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Status Icon */}
        <div className="mt-0.5 shrink-0">
          <StatusIcon
            className={cn(
              "h-5 w-5",
              doc.status === "APPROVED"
                ? "text-green-500"
                : doc.status === "REJECTED"
                ? "text-red-500"
                : doc.status === "UPLOADED"
                ? "text-yellow-500"
                : "text-slate-400"
            )}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-wrap gap-2 mb-1">
            <span className="font-medium text-sm text-slate-900">{doc.label}</span>
            {!doc.required && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-slate-100 text-slate-500">
                Opsional
              </Badge>
            )}
            <span
              className={cn(
                "text-[10px] font-semibold rounded-full px-2 py-0.5",
                cfg.badgeClass
              )}
            >
              {cfg.label}
            </span>
          </div>

          {/* File info */}
          {doc.fileName && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <FileText className="h-3 w-3" />
              <span className="truncate max-w-xs">{doc.fileName}</span>
              {doc.uploadedAt && (
                <span className="text-slate-400 shrink-0">
                  · {formatDateTime(doc.uploadedAt)}
                </span>
              )}
            </div>
          )}

          {/* MCU details */}
          {doc.type === "MCU" && doc.mcuDate && (
            <p className="text-xs text-slate-400 mt-0.5">
              Tgl MCU: {format(new Date(doc.mcuDate), "d MMM yyyy", { locale: localeId })}
              {doc.mcuDarah && " · Darah"}
              {doc.mcuUrine && " · Urine"}
            </p>
          )}

          {/* Admin notes */}
          {doc.adminNotes && (
            <div className="mt-1.5 flex items-start gap-1.5 text-xs text-red-600">
              <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-px" />
              <span>{doc.adminNotes}</span>
            </div>
          )}

          {!doc.fileName && (
            <p className="text-xs text-slate-400 mt-0.5">{doc.hint}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {doc.fileUrl && (
            <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
              <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                <Eye className="h-3.5 w-3.5" />
              </a>
            </Button>
          )}
          {canUpload && (
            <Button
              variant={doc.status === "REJECTED" ? "destructive" : "outline"}
              size="sm"
              className={cn(
                "h-7 gap-1 text-xs",
                doc.status === "REJECTED" && "bg-red-600 hover:bg-red-700"
              )}
              onClick={() => onUpload(doc)}
            >
              {doc.status === "REJECTED" ? (
                <>
                  <RefreshCw className="h-3 w-3" />
                  Upload Ulang
                </>
              ) : (
                <>
                  <Upload className="h-3 w-3" />
                  Upload
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DokumenPage() {
  const [docs, setDocs] = useState<DocumentRecord[]>(INITIAL_DOCS);
  const [loading, setLoading] = useState(true);
  const [registrationId, setRegistrationId] = useState<number | null>(null);
  const [uploadTarget, setUploadTarget] = useState<DocumentRecord | null>(null);
  const [registrations, setRegistrations] = useState<RegistrationSummary[]>([]);
  const [activeReg, setActiveReg] = useState<ActiveRegistration | null>(null);
  const [selectedRegId, setSelectedRegId] = useState<number | null>(null);

  const fetchDocs = useCallback(async (targetRegId?: number | null) => {
    setLoading(true);
    try {
      const query = targetRegId ? `?registrationId=${targetRegId}` : "";
      const res = await fetch(`/api/documents${query}`);
      if (res.ok) {
        const result = await res.json();
        const dbDocs: ServerDoc[] = result.data || [];

        if (result.registrationId) {
          setRegistrationId(result.registrationId);
          setSelectedRegId(result.registrationId);
        } else {
          setRegistrationId(null);
          setSelectedRegId(null);
        }

        if (result.activeRegistration) {
          setActiveReg(result.activeRegistration);
        } else {
          setActiveReg(null);
        }

        if (Array.isArray(result.registrations)) {
          setRegistrations(result.registrations);
        }

        const mapped = DOC_DEFINITIONS.map((def) => {
          const found = dbDocs.find((d) => d.docType === def.type);
          if (!found) {
            return {
              ...def,
              status: "PENDING" as DocStatus,
            };
          }

          let status: DocStatus = "UPLOADED";
          if (found.isValid === true) status = "APPROVED";
          else if (found.isValid === false) status = "REJECTED";

          const fileName = found.filePath.split("/").pop() || "Dokumen";

          return {
            ...def,
            id: String(found.id),
            status,
            fileName,
            fileUrl: found.filePath,
            uploadedAt: found.createdAt,
            adminNotes: found.notes || undefined,
            mcuDate: found.mcuIssueDate ? found.mcuIssueDate.split("T")[0] : undefined,
            mcuDarah: !!found.hasDarah,
            mcuUrine: !!found.hasUrine,
          };
        });

        setDocs(mapped);
      } else {
        setDocs(INITIAL_DOCS);
        setActiveReg(null);
        setRegistrations([]);
      }
    } catch (err) {
      console.error("Gagal memuat dokumen:", err);
      setDocs(INITIAL_DOCS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  const approved = docs.filter((d) => d.status === "APPROVED").length;
  const total = docs.length;
  const rejected = docs.filter((d) => d.status === "REJECTED").length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Dokumen Persyaratan</h1>
          <p className="text-sm text-slate-500">
            Upload dan kelola dokumen persyaratan pelatihan Anda.
          </p>
        </div>
      </div>

      {/* Multi-Registration Selector (jika memiliki 2 atau lebih pendaftaran) */}
      {!loading && registrations.length > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-blue-600 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-blue-950">
                Pilih Pendaftaran Pelatihan ({registrations.length} Pendaftaran Aktif)
              </p>
              <p className="text-[11px] text-blue-700">
                Pilih program pelatihan untuk melihat atau melengkapi dokumen terkait:
              </p>
            </div>
          </div>
          <Select
            value={selectedRegId ? String(selectedRegId) : ""}
            onValueChange={(val) => {
              if (val) {
                const id = parseInt(val);
                setSelectedRegId(id);
                fetchDocs(id);
              }
            }}
          >
            <SelectTrigger className="w-full sm:w-[360px] bg-white text-xs h-9">
              <SelectValue placeholder="Pilih Pelatihan..." />
            </SelectTrigger>
            <SelectContent>
              {registrations.map((r) => (
                <SelectItem key={r.id} value={String(r.id)} className="text-xs">
                  <span className="font-semibold">{r.trainingTitle}</span> · Batch {r.batchNumber}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Training Information Banner */}
      {!loading && activeReg && (
        <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50/90 to-indigo-50/60 p-4 shadow-sm space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                  <GraduationCap className="h-3.5 w-3.5 text-blue-600" />
                  Program Pelatihan Terdaftar:
                </span>
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-[10px] px-2 py-0.5 font-semibold",
                    activeReg.training.certBadge === "BAPETEN"
                      ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                      : activeReg.training.certBadge === "Internal"
                      ? "bg-slate-100 text-slate-700 border-slate-200"
                      : "bg-amber-100 text-amber-800 border-amber-200"
                  )}
                >
                  {activeReg.training.certBadge}
                </Badge>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-white border-blue-200 text-blue-700 font-medium">
                  {activeReg.registrationStatus}
                </Badge>
              </div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                {activeReg.training.title}
              </h2>
            </div>
          </div>

          <div className="pt-2 border-t border-blue-100 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-blue-600 shrink-0" />
              <span>
                <strong>Batch {activeReg.batch.batchNumber}</strong> (
                {format(new Date(activeReg.batch.startDate), "d MMM", { locale: localeId })} –{" "}
                {format(new Date(activeReg.batch.endDate), "d MMM yyyy", { locale: localeId })})
              </span>
            </div>
            {activeReg.batch.location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span className="truncate max-w-xs">{activeReg.batch.location}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* No Registration Notice */}
      {!loading && !activeReg && registrations.length === 0 && (
        <Card className="border border-dashed border-slate-300 p-8 text-center bg-slate-50/50 rounded-xl space-y-3">
          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-slate-800">
              Belum Ada Pendaftaran Pelatihan
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Anda belum terdaftar pada program pelatihan apapun. Silakan lakukan pendaftaran terlebih dahulu untuk melengkapi dokumen persyaratan.
            </p>
          </div>
          <div className="pt-2">
            <Link href="/pendaftaran">
              <Button className="gap-2 cursor-pointer">
                Daftar Pelatihan Sekarang
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Summary */}
      {!loading && (
        <div className="grid grid-cols-3 gap-3">
          <Card className="border border-slate-200 shadow-sm text-center py-3">
            <p className="text-2xl font-bold text-green-600">{approved}</p>
            <p className="text-xs text-slate-500 mt-0.5">Disetujui</p>
          </Card>
          <Card className="border border-slate-200 shadow-sm text-center py-3">
            <p className="text-2xl font-bold text-yellow-600">
              {docs.filter((d) => d.status === "UPLOADED").length}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">Menunggu Review</p>
          </Card>
          <Card className="border border-slate-200 shadow-sm text-center py-3">
            <p className="text-2xl font-bold text-red-600">{rejected}</p>
            <p className="text-xs text-slate-500 mt-0.5">Ditolak</p>
          </Card>
        </div>
      )}

      {/* Progress */}
      {!loading && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-500">
            <span>Progress Dokumen</span>
            <span className="font-semibold">{approved}/{total} disetujui</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-green-500 transition-all duration-500"
              style={{ width: `${total > 0 ? (approved / total) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {/* Rejected Alert */}
      {!loading && rejected > 0 && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <p>
            <strong>{rejected} dokumen ditolak.</strong> Harap upload ulang dengan dokumen yang sesuai.
          </p>
        </div>
      )}

      {/* Document List */}
      <div className="space-y-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))
          : docs.map((doc) => (
              <DocumentRow
                key={doc.type}
                doc={doc}
                onUpload={(d) => setUploadTarget(d)}
              />
            ))}
      </div>

      {/* Info box */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 space-y-1">
        <p className="font-semibold text-slate-800">Ketentuan Dokumen:</p>
        <ul className="list-disc list-inside space-y-1 text-xs text-slate-500">
          <li>Format file: JPG, PNG, atau PDF</li>
          <li>Ukuran maksimal: 5 MB per file</li>
          <li>Pastikan dokumen terbaca dengan jelas (tidak blur/terpotong)</li>
          <li>MCU harus dari fasilitas kesehatan yang terdaftar, berlaku maks 6 bulan</li>
        </ul>
      </div>

      {/* Upload Dialog */}
      {uploadTarget && (
        <UploadDialog
          doc={uploadTarget}
          open={!!uploadTarget}
          registrationId={registrationId}
          onClose={() => setUploadTarget(null)}
          onSuccess={() => fetchDocs(selectedRegId)}
        />
      )}
    </div>
  );
}
