"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDropzone } from "react-dropzone";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Upload,
  FileText,
  User,
  Building2,
  Folder,
  Eye,
  GraduationCap,
  Shield,
  AlertCircle,
  X,
  Check,
  Banknote,
  ExternalLink,
  Loader2,
  Calendar,
  CreditCard,
  Mail,
  Phone,
  MapPin,
  Home,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

// ─── Constants ────────────────────────────────────────────────────────────────

export interface ProgramItem {
  id: string;
  category: string;
  dbId?: number;
  label: string;
  title?: string;
  price: number;
  description: string;
  duration: string;
  durationDays?: number;
  badge: string;
}

const DEFAULT_PROGRAMS: ProgramItem[] = [
  {
    id: "PPR_ANALISIS",
    category: "PPR_ANALISIS",
    label: "PPR Analisis",
    price: 7000000,
    description: "Petugas Proteksi Radiasi Tingkat Analisis",
    duration: "5 hari (40 JPL)",
    badge: "BAPETEN",
  },
  {
    id: "PPR_BAGASI",
    category: "PPR_BAGASI",
    label: "PPR Bagasi",
    price: 4000000,
    description: "Petugas Proteksi Radiasi Tingkat Bagasi/Industri",
    duration: "3 hari (24 JPL)",
    badge: "BAPETEN",
  },
  {
    id: "PKR",
    category: "PKR_PEKERJA",
    label: "PKR Pekerja Radiasi",
    price: 3500000,
    description: "Pelatihan Keselamatan Radiasi bagi Pekerja Radiasi",
    duration: "2 hari (16 JPL)",
    badge: "Internal",
  },
];

export interface BatchItem {
  id: number;
  batchNumber: number;
  startDate: string;
  endDate: string;
  quota: number;
  location: string;
  registeredCount: number;
  availableSlots: number;
  isFull: boolean;
  isOngoing?: boolean;
  isCompleted?: boolean;
  status: "COMPLETED" | "ONGOING" | "FULL" | "AVAILABLE";
  statusLabel: string;
  isSelectable: boolean;
  training?: {
    id: number;
    title: string;
    category: string;
    certBadge?: string | null;
    price: number;
    durationDays: number;
  };
}

const DOC_TYPES = [
  { id: "KTP", label: "KTP / Kartu Identitas", required: true, hint: "Format JPG/PNG/PDF, maks 5 MB" },
  { id: "IJAZAH", label: "Ijazah Terakhir", required: true, hint: "Minimal D3/S1 untuk PPR Analisis" },
  { id: "MCU", label: "Surat MCU (Medical Check-Up)", required: true, hint: "Berlaku maks 6 bulan terakhir" },
  { id: "SURAT_KERJA", label: "Surat Keterangan Bekerja", required: true, hint: "Dari instansi/perusahaan asal" },
  { id: "PASFOTO", label: "Pas Foto 3×4 (Background Merah)", required: true, hint: "Format JPG/PNG" },
  { id: "NPWP", label: "NPWP", required: false, hint: "Opsional, bila memiliki NPWP" },
] as const;

type DocTypeId = (typeof DOC_TYPES)[number]["id"];

// ─── Zod Schemas per Step ─────────────────────────────────────────────────────

const step1Schema = z.object({
  programId: z.string().min(1, "Pilih program pelatihan"),
  batchId: z.string().min(1, "Pilih jadwal batch yang tersedia"),
});

const step2Schema = z.object({
  nik: z.string(),
  tempatLahir: z.string(),
  tanggalLahir: z.string(),
  alamat: z.string(),
  instansi: z.string(),
  jabatan: z.string(),
  noHp: z.string(),
});

const step3Schema = z.object({
  namaSponsor: z.string().optional(),
  npwpSponsor: z.string().optional(),
  alamatSponsor: z.string().optional(),
  emailSponsor: z.string().email("Format email tidak valid").optional().or(z.literal("")),
  selfFunded: z.boolean(),
});

const step4Schema = z.object({
  docs: z.record(z.instanceof(File).nullable()).optional(),
});

// ─── Combined form type ───────────────────────────────────────────────────────

interface FormData {
  step1: z.infer<typeof step1Schema>;
  step2: z.infer<typeof step2Schema>;
  step3: z.infer<typeof step3Schema>;
  docs: Partial<Record<DocTypeId, File | null>>;
}

interface UserProfileData {
  id: number;
  email: string;
  fullName: string;
  phoneNumber: string | null;
  nik: string | null;
  tempat_lahir: string | null;
  tanggal_lahir: string | null;
  alamat_domisili: string | null;
  instansi: string | null;
  alamat_instansi: string | null;
}

// ─── Steps config ────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: "Pilih Program", icon: GraduationCap },
  { id: 2, label: "Data Diri", icon: User },
  { id: 3, label: "Data Sponsor", icon: Building2 },
  { id: 4, label: "Upload Dokumen", icon: Folder },
  { id: 5, label: "Review & Submit", icon: Eye },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRupiah(amount: number) {
  if (amount === 0) return "Hubungi Admin";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

// ─── Step 1: Program Selection ───────────────────────────────────────────────

function Step1Program({
  form,
  batches,
  programs,
  loadingBatches,
  programBadges,
  onNext,
}: {
  form: ReturnType<typeof useForm<z.infer<typeof step1Schema>>>;
  batches: BatchItem[];
  programs: ProgramItem[];
  loadingBatches: boolean;
  programBadges: Record<string, string>;
  onNext: () => void;
}) {
  const { handleSubmit, watch, setValue, formState: { errors } } = form;
  const selectedProgram = watch("programId");
  const selectedBatch = watch("batchId");

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-slate-800 mb-1">
          Pilih Program Pelatihan
        </h2>
        <p className="text-sm text-slate-500">
          Pilih program yang sesuai dengan kebutuhan Anda.
        </p>
      </div>

      {/* Program Cards */}
      <div className="grid gap-3">
        {programs.map((prog) => {
          const currentBadge = programBadges[prog.id] || programBadges[prog.category] || prog.badge;
          return (
            <button
              key={prog.id}
              type="button"
              onClick={() => setValue("programId", prog.id, { shouldValidate: true })}
              className={cn(
                "text-left w-full rounded-xl border-2 p-4 transition-all cursor-pointer",
                selectedProgram === prog.id
                  ? "border-blue-600 bg-blue-50"
                  : "border-slate-200 hover:border-slate-300"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-slate-900">{prog.label}</span>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-[10px] px-1.5 font-semibold",
                        currentBadge === "BAPETEN"
                          ? "bg-green-100 text-green-700 border-green-200"
                          : currentBadge === "Internal"
                          ? "bg-slate-100 text-slate-700 border-slate-200"
                          : "bg-amber-100 text-amber-800 border-amber-200"
                      )}
                    >
                      {currentBadge}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-500">{prog.description}</p>
                  <p className="text-xs text-slate-400 mt-1">{prog.duration}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-blue-700 text-sm">
                    {formatRupiah(prog.price)}
                  </p>
                  {selectedProgram === prog.id && (
                    <CheckCircle2 className="h-5 w-5 text-blue-600 ml-auto mt-1" />
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
      {errors.programId && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {errors.programId.message}
        </p>
      )}

      {/* Batch Selection */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-slate-800">
            Pilih Jadwal Batch
          </h3>
          <span className="text-xs text-slate-400">
            Jadwal diperbarui otomatis sesuai tanggal & kuota peserta
          </span>
        </div>

        {loadingBatches ? (
          <div className="flex items-center justify-center py-8 gap-2.5 text-slate-500 text-sm border border-slate-200 rounded-xl bg-slate-50/50">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            <span>Memuat jadwal batch yang tersedia...</span>
          </div>
        ) : batches.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 bg-slate-50/50">
            <Calendar className="h-6 w-6 mx-auto mb-2 text-slate-400" />
            <p className="font-medium text-slate-700">Belum ada jadwal batch untuk program ini</p>
            <p className="text-xs text-slate-500 mt-1">Silakan pilih program lain atau hubungi pihak sekretariat ALARA.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {batches.map((batch) => {
              const isSelected = selectedBatch === String(batch.id);
              const startDateFormatted = format(new Date(batch.startDate), "d MMM", { locale: localeId });
              const endDateFormatted = format(new Date(batch.endDate), "d MMM yyyy", { locale: localeId });
              const dateRange = `${startDateFormatted} – ${endDateFormatted}`;

              return (
                <button
                  key={batch.id}
                  type="button"
                  disabled={!batch.isSelectable}
                  onClick={() => {
                    if (batch.isSelectable) {
                      setValue("batchId", String(batch.id), { shouldValidate: true });
                    }
                  }}
                  className={cn(
                    "text-left rounded-xl border-2 p-3.5 transition-all relative flex flex-col justify-between group",
                    !batch.isSelectable
                      ? "opacity-60 bg-slate-50 border-slate-200 cursor-not-allowed select-none"
                      : isSelected
                      ? "border-blue-600 bg-blue-50/70 shadow-sm cursor-pointer"
                      : "border-slate-200 hover:border-slate-300 bg-white cursor-pointer"
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className="font-semibold text-sm text-slate-900">
                        Batch {batch.batchNumber}
                      </span>
                      {batch.status === "COMPLETED" ? (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-slate-200 text-slate-700 font-medium">
                          Selesai
                        </Badge>
                      ) : batch.status === "ONGOING" ? (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-amber-100 text-amber-800 border border-amber-200 font-medium">
                          Sedang berlangsung
                        </Badge>
                      ) : batch.status === "FULL" ? (
                        <Badge variant="destructive" className="text-[10px] px-1.5 py-0 bg-red-600 hover:bg-red-600 text-white font-medium">
                          Penuh
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-emerald-100 text-emerald-700 font-medium">
                          Tersedia
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      {dateRange}
                    </p>
                    {batch.location && (
                      <p className="text-[11px] text-slate-400 mt-1 truncate flex items-center gap-1">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {batch.location}
                      </p>
                    )}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    {batch.status === "COMPLETED" ? (
                      <span className="font-medium text-slate-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Jadwal telah berakhir
                      </span>
                    ) : batch.status === "ONGOING" ? (
                      <span className="font-medium text-amber-700 flex items-center gap-1">
                        <Clock className="h-3 w-3 text-amber-600" />
                        Sedang jalan (Pendaftaran ditutup)
                      </span>
                    ) : batch.status === "FULL" ? (
                      <span className="font-medium text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Kuota Penuh ({batch.registeredCount}/{batch.quota})
                      </span>
                    ) : (
                      <span className="text-slate-500">
                        Sisa: <strong className="text-slate-800 font-semibold">{batch.availableSlots}</strong>/{batch.quota} kursi
                      </span>
                    )}
                    {isSelected && (
                      <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 ml-1" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
      {errors.batchId && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {errors.batchId.message}
        </p>
      )}

      <div className="flex justify-end">
        <Button type="submit" className="gap-2 cursor-pointer">
          Lanjut
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}

// ─── Step 2: Data Diri (Tampilan Data Profile Langsung) ────────────────────────

function Step2DataDiri({
  userProfile,
  loadingProfile,
  onNext,
  onBack,
}: {
  userProfile: UserProfileData | null;
  loadingProfile: boolean;
  onNext: () => void;
  onBack: () => void;
}) {
  const isIncomplete = !userProfile?.nik || !userProfile?.phoneNumber;

  if (loadingProfile) {
    return (
      <div className="py-12 flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-sm text-slate-500">Memuat data profil Anda…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-slate-800">Data Diri Peserta</h2>
          <p className="text-sm text-slate-500">
            Data identitas diambil otomatis sesuai informasi pada profil akun Anda.
          </p>
        </div>
        <Link
          href="/profil"
          target="_blank"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors w-fit"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Ubah di Menu Profil
        </Link>
      </div>

      {/* Notice box */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 flex items-start gap-3">
        <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-amber-950">
            Lengkapi data pribadi ini dengan benar, karena akan digunakan untuk SERTIFIKAT.
          </p>
          <p className="text-amber-800/90 leading-relaxed">
            Data di bawah ini ditampilkan langsung dari profil Anda untuk penerbitan sertifikat resmi BAPETEN. Jika terdapat perubahan atau data yang belum lengkap, silakan sesuaikan melalui menu <strong>User Profile</strong>.
          </p>
        </div>
      </div>

      {/* Attention if missing key fields */}
      {isIncomplete && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-800 flex items-start gap-3">
          <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Data NIK KTP atau Nomor WhatsApp belum lengkap!</p>
            <p className="mt-0.5 text-red-700">
              Mohon lengkapi NIK KTP (16 digit) dan No. WhatsApp aktif di menu Profil Anda agar pendaftaran dapat divalidasi.
            </p>
          </div>
        </div>
      )}

      {/* Read-Only Profile View */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 space-y-4">
        {/* Nama & Email */}
        <div className="grid sm:grid-cols-2 gap-4 pb-4 border-b border-slate-200/80">
          <div>
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              Nama Lengkap
            </span>
            <p className="text-sm font-bold text-slate-900 mt-0.5">
              {userProfile?.fullName || "-"}
            </p>
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              Alamat Email (Google)
            </span>
            <p className="text-sm font-medium text-slate-700 mt-0.5">
              {userProfile?.email || "-"}
            </p>
          </div>
        </div>

        {/* NIK & Nomor HP */}
        <div className="grid sm:grid-cols-2 gap-4 pb-4 border-b border-slate-200/80">
          <div>
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-slate-400" />
              NIK KTP (16 Digit)
            </span>
            <p className="text-sm font-mono font-semibold text-slate-800 mt-0.5">
              {userProfile?.nik || "-"}
            </p>
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              Nomor WhatsApp / HP
            </span>
            <p className="text-sm font-medium text-slate-800 mt-0.5">
              {userProfile?.phoneNumber || "-"}
            </p>
          </div>
        </div>

        {/* Tempat & Tanggal Lahir */}
        <div className="grid sm:grid-cols-2 gap-4 pb-4 border-b border-slate-200/80">
          <div>
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              Tempat Lahir
            </span>
            <p className="text-sm font-medium text-slate-800 mt-0.5">
              {userProfile?.tempat_lahir || "-"}
            </p>
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Tanggal Lahir
            </span>
            <p className="text-sm font-medium text-slate-800 mt-0.5">
              {userProfile?.tanggal_lahir
                ? format(new Date(userProfile.tanggal_lahir), "d MMMM yyyy", { locale: localeId })
                : "-"}
            </p>
          </div>
        </div>

        {/* Alamat Domisili */}
        <div className="pb-4 border-b border-slate-200/80">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <Home className="w-3.5 h-3.5 text-slate-400" />
            Alamat Domisili (Tempat Tinggal)
          </span>
          <p className="text-sm text-slate-800 mt-0.5 leading-relaxed">
            {userProfile?.alamat_domisili || "-"}
          </p>
        </div>

        {/* Instansi & Alamat Instansi */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              Instansi / Perusahaan
            </span>
            <p className="text-sm font-medium text-slate-800 mt-0.5">
              {userProfile?.instansi || "-"}
            </p>
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              Alamat Instansi / Kantor
            </span>
            <p className="text-sm text-slate-800 mt-0.5 leading-relaxed">
              {userProfile?.alamat_instansi || "-"}
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-2">
        <Button type="button" variant="outline" onClick={onBack} className="gap-2 cursor-pointer">
          <ChevronLeft className="h-4 w-4" />
          Kembali
        </Button>
        <Button type="button" onClick={onNext} className="gap-2 cursor-pointer">
          Lanjut ke Data Sponsor
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ─── Step 3: Data Sponsor ─────────────────────────────────────────────────────

function Step3Sponsor({
  form,
  onNext,
  onBack,
}: {
  form: ReturnType<typeof useForm<z.infer<typeof step3Schema>>>;
  onNext: () => void;
  onBack: () => void;
}) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const selfFunded = watch("selfFunded");

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-5">
      <div>
        <h2 className="text-base font-semibold text-slate-800 mb-1">
          Data Sponsor / Penanggung Biaya
        </h2>
        <p className="text-sm text-slate-500">
          Isi data instansi sponsor jika biaya pelatihan dibiayai perusahaan.
        </p>
      </div>

      {/* Self-funded checkbox */}
      <div className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 bg-slate-50">
        <Checkbox
          id="selfFunded"
          checked={selfFunded}
          onCheckedChange={(checked) => {
            setValue("selfFunded", !!checked);
            if (checked) {
              setValue("namaSponsor", "");
              setValue("npwpSponsor", "");
              setValue("alamatSponsor", "");
              setValue("emailSponsor", "");
            }
          }}
        />
        <Label htmlFor="selfFunded" className="cursor-pointer text-sm font-medium text-slate-700">
          Biaya ditanggung pribadi (tanpa sponsor perusahaan)
        </Label>
      </div>

      {!selfFunded && (
        <div className="space-y-4">
          {/* Nama Sponsor */}
          <div className="space-y-1">
            <Label htmlFor="namaSponsor">Nama Instansi Sponsor</Label>
            <Input
              id="namaSponsor"
              placeholder="PT Contoh Indonesia"
              {...register("namaSponsor")}
            />
          </div>

          {/* NPWP Sponsor */}
          <div className="space-y-1">
            <Label htmlFor="npwpSponsor">NPWP Sponsor</Label>
            <Input
              id="npwpSponsor"
              placeholder="00.000.000.0-000.000"
              {...register("npwpSponsor")}
            />
          </div>

          {/* Alamat Sponsor */}
          <div className="space-y-1">
            <Label htmlFor="alamatSponsor">Alamat Sponsor</Label>
            <Textarea
              id="alamatSponsor"
              rows={2}
              placeholder="Alamat penagihan sponsor"
              {...register("alamatSponsor")}
            />
          </div>

          {/* Email Sponsor */}
          <div className="space-y-1">
            <Label htmlFor="emailSponsor">Email PIC / Keuangan Sponsor</Label>
            <Input
              id="emailSponsor"
              type="email"
              placeholder="finance@perusahaan.com"
              {...register("emailSponsor")}
              className={cn(errors.emailSponsor && "border-red-400")}
            />
            {errors.emailSponsor && (
              <p className="text-xs text-red-500">{errors.emailSponsor.message}</p>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack} className="gap-2 cursor-pointer">
          <ChevronLeft className="h-4 w-4" />
          Kembali
        </Button>
        <Button type="submit" className="gap-2 cursor-pointer">
          Lanjut
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}

// ─── Step 4: Upload Dokumen ───────────────────────────────────────────────────

function Step4Dokumen({
  docs,
  setDocs,
  onNext,
  onBack,
}: {
  docs: Partial<Record<DocTypeId, File | null>>;
  setDocs: React.Dispatch<React.SetStateAction<Partial<Record<DocTypeId, File | null>>>>;
  onNext: () => void;
  onBack: () => void;
}) {
  const [activeUpload, setActiveUpload] = useState<DocTypeId | null>(null);

  const handleDrop = useCallback(
    (typeId: DocTypeId, acceptedFiles: File[]) => {
      if (acceptedFiles[0]) {
        setDocs((prev) => ({ ...prev, [typeId]: acceptedFiles[0] }));
        setActiveUpload(null);
      }
    },
    [setDocs]
  );

  const removeDoc = (typeId: DocTypeId) => {
    setDocs((prev) => {
      const copy = { ...prev };
      delete copy[typeId];
      return copy;
    });
  };

  const allRequiredUploaded = DOC_TYPES.filter((d) => d.required).every(
    (d) => !!docs[d.id]
  );

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold text-slate-800 mb-1">
          Upload Dokumen Persyaratan
        </h2>
        <p className="text-sm text-slate-500">
          Upload scan dokumen yang diperlukan. Format JPG, PNG, atau PDF (maks 5 MB).
        </p>
      </div>

      <div className="space-y-3">
        {DOC_TYPES.map((doc) => {
          const file = docs[doc.id];
          return (
            <DocUploadRow
              key={doc.id}
              doc={doc}
              file={file ?? null}
              onDrop={(files) => handleDrop(doc.id, files)}
              onRemove={() => removeDoc(doc.id)}
            />
          );
        })}
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack} className="gap-2 cursor-pointer">
          <ChevronLeft className="h-4 w-4" />
          Kembali
        </Button>
        <Button
          type="button"
          onClick={onNext}
          className="gap-2 cursor-pointer"
        >
          Lanjut
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function DocUploadRow({
  doc,
  file,
  onDrop,
  onRemove,
}: {
  doc: (typeof DOC_TYPES)[number];
  file: File | null;
  onDrop: (files: File[]) => void;
  onRemove: () => void;
}) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
    accept: {
      "image/*": [".jpg", ".jpeg", ".png"],
      "application/pdf": [".pdf"],
    },
    onDropRejected: () => toast.error("File ditolak. Maks 5 MB, format JPG/PNG/PDF."),
  });

  return (
    <div className="rounded-lg border border-slate-200 p-3 bg-white">
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-800">{doc.label}</span>
            {doc.required ? (
              <Badge variant="secondary" className="text-[10px] px-1 bg-red-50 text-red-600">
                Wajib
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-[10px] px-1 text-slate-500">
                Opsional
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{doc.hint}</p>
        </div>

        {file ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 px-2 py-1 rounded">
              <FileText className="h-3.5 w-3.5" />
              <span className="max-w-28 truncate">{file.name}</span>
            </div>
            <button
              type="button"
              onClick={onRemove}
              className="text-slate-400 hover:text-red-500 p-1 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div {...getRootProps()}>
            <input {...getInputProps()} />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={cn(
                "h-8 gap-1.5 text-xs cursor-pointer",
                isDragActive && "border-blue-500 bg-blue-50"
              )}
            >
              <Upload className="h-3.5 w-3.5" />
              Upload
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Step 5: Review & Submit ──────────────────────────────────────────────────

function Step5Review({
  formData,
  batches,
  programs,
  userProfile,
  docs,
  onBack,
  onSubmit,
  isSubmitting,
}: {
  formData: {
    step1: z.infer<typeof step1Schema>;
    step2: z.infer<typeof step2Schema>;
    step3: z.infer<typeof step3Schema>;
  };
  batches: BatchItem[];
  programs: ProgramItem[];
  userProfile: UserProfileData | null;
  docs: Partial<Record<DocTypeId, File | null>>;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}) {
  const selectedProgram = programs.find(
    (p) => p.id === formData.step1.programId || p.category === formData.step1.programId
  );
  const selectedBatch = batches.find((b) => String(b.id) === String(formData.step1.batchId));
  const invoiceNo = `INV-${Date.now().toString().slice(-8)}`;
  const today = format(new Date(), "d MMMM yyyy", { locale: localeId });

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold text-slate-800 mb-1">
          Review & Submit
        </h2>
        <p className="text-sm text-slate-500">
          Periksa kembali data Anda sebelum mengirimkan pendaftaran.
        </p>
      </div>

      {/* Invoice Preview */}
      <div className="rounded-xl border-2 border-blue-200 bg-blue-50 overflow-hidden">
        {/* Header */}
        <div className="bg-blue-700 text-white p-4">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="ALARA Logo"
              className="h-10 w-10 object-contain rounded-md bg-white p-0.5 shrink-0"
            />
            <div>
              <p className="font-bold text-sm leading-tight">CV Hikmat Proteksi ALARA</p>
              <p className="text-xs text-blue-200">KTUN BAPETEN No. 07998.722.1.040726</p>
            </div>
          </div>
        </div>
        {/* Body */}
        <div className="p-4 space-y-3">
          <div className="flex justify-between text-xs text-slate-500">
            <span>No. Invoice</span>
            <span className="font-mono font-semibold text-slate-800">{invoiceNo}</span>
          </div>
          <div className="flex justify-between text-xs text-slate-500">
            <span>Tanggal</span>
            <span className="text-slate-800">{today}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-sm">
            <span className="text-slate-700 font-medium">{selectedProgram?.label}</span>
            <span className="font-bold text-slate-900">
              {selectedProgram ? formatRupiah(selectedProgram.price) : "—"}
            </span>
          </div>
          <div className="flex justify-between text-xs text-slate-500">
            <span>Jadwal Batch</span>
            <span className="font-medium text-slate-800 text-right">
              {selectedBatch
                ? `Batch ${selectedBatch.batchNumber} (${format(new Date(selectedBatch.startDate), "d MMM", { locale: localeId })} – ${format(new Date(selectedBatch.endDate), "d MMM yyyy", { locale: localeId })})`
                : "—"}
            </span>
          </div>
          <Separator />
          <div className="flex justify-between text-sm font-bold text-blue-700">
            <span>Total Tagihan</span>
            <span>
              {selectedProgram ? formatRupiah(selectedProgram.price) : "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Summary Grid */}
      <div className="grid sm:grid-cols-2 gap-4">
        {/* Data Diri */}
        <Card className="border border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Data Diri Peserta
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-1.5 text-sm">
            <RowItem label="Nama" value={userProfile?.fullName || "-"} />
            <RowItem label="NIK" value={userProfile?.nik || formData.step2.nik || "-"} />
            <RowItem
              label="Lahir"
              value={
                userProfile?.tempat_lahir || userProfile?.tanggal_lahir
                  ? `${userProfile?.tempat_lahir || "-"}${
                      userProfile?.tanggal_lahir
                        ? `, ${format(new Date(userProfile.tanggal_lahir), "d MMM yyyy", { locale: localeId })}`
                        : ""
                    }`
                  : "-"
              }
            />
            <RowItem label="No. HP" value={userProfile?.phoneNumber || formData.step2.noHp || "-"} />
            <RowItem label="Instansi" value={userProfile?.instansi || formData.step2.instansi || "-"} />
            <RowItem label="Domisili" value={userProfile?.alamat_domisili || formData.step2.alamat || "-"} />
          </CardContent>
        </Card>

        {/* Dokumen */}
        <Card className="border border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Dokumen
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-1.5 text-sm">
            {DOC_TYPES.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between gap-2">
                <span className="text-slate-600 truncate">{doc.label}</span>
                {docs[doc.id] ? (
                  <Check className="h-4 w-4 text-green-500 shrink-0" />
                ) : (
                  <X className="h-4 w-4 text-slate-300 shrink-0" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Payment reminder */}
      <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 text-sm text-orange-700 flex gap-2">
        <Banknote className="h-4 w-4 shrink-0 mt-0.5" />
        <p>
          Setelah submit, Anda akan mendapatkan invoice dan instruksi pembayaran ke
          rekening <strong>Bank Mandiri 166-00-0733926-0</strong> a.n. CV Hikmat Proteksi
          ALARA.
        </p>
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack} className="gap-2 cursor-pointer">
          <ChevronLeft className="h-4 w-4" />
          Kembali
        </Button>
        <Button onClick={onSubmit} disabled={isSubmitting} className="gap-2 min-w-32 cursor-pointer">
          {isSubmitting ? (
            <>
              <span className="animate-spin">⏳</span>
              Mengirim...
            </>
          ) : (
            <>
              <Check className="h-4 w-4" />
              Kirim Pendaftaran
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function RowItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-slate-500 shrink-0">{label}</span>
      <span className="text-slate-800 font-medium text-right truncate">{value}</span>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PendaftaranPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [docs, setDocs] = useState<Partial<Record<DocTypeId, File | null>>>({});

  // Profile data state
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Dynamic Programs, Batches & Program Badges state
  const [programs, setPrograms] = useState<ProgramItem[]>(DEFAULT_PROGRAMS);
  const [batches, setBatches] = useState<BatchItem[]>([]);
  const [loadingBatches, setLoadingBatches] = useState<boolean>(false);
  const [programBadges, setProgramBadges] = useState<Record<string, string>>({
    PPR_ANALISIS: "BAPETEN",
    PPR_BAGASI: "BAPETEN",
    PKR: "Internal",
  });

  const form1 = useForm<z.infer<typeof step1Schema>>({
    resolver: zodResolver(step1Schema),
    defaultValues: { programId: undefined, batchId: "" },
  });

  const selectedProgramId = form1.watch("programId");

  // Load dynamic programs from database on mount
  useEffect(() => {
    fetch("/api/trainings")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setPrograms(data);
          const newBadges: Record<string, string> = {};
          data.forEach((p: ProgramItem) => {
            if (p.badge) {
              newBadges[p.id] = p.badge;
              newBadges[p.category] = p.badge;
            }
          });
          if (Object.keys(newBadges).length > 0) {
            setProgramBadges((prev) => ({ ...prev, ...newBadges }));
          }
        }
      })
      .catch((err) => {
        console.error("Gagal memuat program pelatihan:", err);
      });
  }, []);

  // Load all program badges on mount
  useEffect(() => {
    fetch("/api/batches")
      .then((r) => r.json())
      .then((data) => {
        const list: BatchItem[] = Array.isArray(data) ? data : data.data || [];
        const newBadges: Record<string, string> = {};
        list.forEach((b) => {
          if (b.training?.category && b.training?.certBadge) {
            const key = b.training.category === "PKR_PEKERJA" ? "PKR" : b.training.category;
            newBadges[key] = b.training.certBadge;
          }
        });
        if (Object.keys(newBadges).length > 0) {
          setProgramBadges((prev) => ({ ...prev, ...newBadges }));
        }
      })
      .catch(() => {});
  }, []);

  // Fetch batches when selected program changes
  useEffect(() => {
    if (!selectedProgramId) {
      setBatches([]);
      return;
    }

    const matchedProg = programs.find(
      (p) => p.id === selectedProgramId || p.category === selectedProgramId
    );
    let category = matchedProg?.category || "PPR_ANALISIS";
    if (selectedProgramId === "PPR_BAGASI") {
      category = "PPR_BAGASI";
    } else if (selectedProgramId === "PKR" || selectedProgramId === "PKR_PEKERJA") {
      category = "PKR_PEKERJA";
    }

    let isMounted = true;
    setLoadingBatches(true);

    fetch(`/api/batches?category=${category}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        const list: BatchItem[] = Array.isArray(data) ? data : data.batches || [];
        setBatches(list);

        // Update badge dari data training
        list.forEach((b) => {
          if (b.training?.category && b.training?.certBadge) {
            const key = b.training.category === "PKR_PEKERJA" ? "PKR" : b.training.category;
            setProgramBadges((prev) => ({ ...prev, [key]: b.training!.certBadge! }));
          }
        });

        // Hanya pilih batch yang dapat dipilih (status === 'AVAILABLE' / isSelectable)
        const currentBatchId = form1.getValues("batchId");
        const matched = list.find((b) => String(b.id) === currentBatchId);
        if (!matched || !matched.isSelectable) {
          const firstAvailable = list.find((b) => b.isSelectable);
          if (firstAvailable) {
            form1.setValue("batchId", String(firstAvailable.id), { shouldValidate: true });
          } else {
            form1.setValue("batchId", "", { shouldValidate: false });
          }
        }
      })
      .catch((err) => {
        console.error("Gagal memuat jadwal batch:", err);
        toast.error("Gagal memuat jadwal batch pelatihan.");
      })
      .finally(() => {
        if (isMounted) setLoadingBatches(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedProgramId, form1]);

  const form2 = useForm<z.infer<typeof step2Schema>>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      nik: "",
      tempatLahir: "",
      tanggalLahir: "",
      alamat: "",
      instansi: "",
      jabatan: "-",
      noHp: "",
    },
  });

  const form3 = useForm<z.infer<typeof step3Schema>>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      namaSponsor: "",
      npwpSponsor: "",
      alamatSponsor: "",
      emailSponsor: "",
      selfFunded: false,
    },
  });

  // Load user profile on mount to auto-populate data diri
  useEffect(() => {
    async function loadUserProfile() {
      try {
        const res = await fetch("/api/auth/complete-profile");
        if (res.ok) {
          const json = await res.json();
          if (json.user) {
            setUserProfile(json.user);
            form2.reset({
              nik: json.user.nik || "",
              tempatLahir: json.user.tempat_lahir || "",
              tanggalLahir: json.user.tanggal_lahir
                ? format(new Date(json.user.tanggal_lahir), "yyyy-MM-dd")
                : "",
              alamat: json.user.alamat_domisili || "",
              instansi: json.user.instansi || "",
              jabatan: "-",
              noHp: json.user.phoneNumber || "",
            });
          }
        }
      } catch (err) {
        console.error("Gagal memuat profil:", err);
      } finally {
        setLoadingProfile(false);
      }
    }
    loadUserProfile();
  }, [form2]);

  const goNext = () =>
    setCurrentStep((s) => Math.min(s + 1, STEPS.length));
  const goBack = () =>
    setCurrentStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("programId", form1.getValues("programId"));
      formData.append("batchId", form1.getValues("batchId"));

      // Profile data from userProfile / form2
      formData.append("nik", userProfile?.nik || form2.getValues("nik") || "");
      formData.append("tempatLahir", userProfile?.tempat_lahir || form2.getValues("tempatLahir") || "");
      formData.append(
        "tanggalLahir",
        userProfile?.tanggal_lahir
          ? format(new Date(userProfile.tanggal_lahir), "yyyy-MM-dd")
          : form2.getValues("tanggalLahir") || ""
      );
      formData.append("alamat", userProfile?.alamat_domisili || form2.getValues("alamat") || "");
      formData.append("instansi", userProfile?.instansi || form2.getValues("instansi") || "");
      formData.append("noHp", userProfile?.phoneNumber || form2.getValues("noHp") || "");

      Object.entries(form3.getValues()).forEach(([k, v]) =>
        formData.append(k, String(v))
      );
      Object.entries(docs).forEach(([key, file]) => {
        if (file) formData.append(`doc_${key}`, file);
      });

      const res = await fetch("/api/pendaftaran", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        toast.success("Pendaftaran berhasil dikirim! Silakan cek email Anda.");
        router.push("/dashboard");
      } else {
        const err = await res.json().catch(() => null);
        toast.error(err?.message || err?.error || "Gagal mengirim pendaftaran.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-lg font-bold text-slate-900">Formulir Pendaftaran</h1>
        <p className="text-sm text-slate-500">
          Pelatihan Keselamatan Radiasi – CV Hikmat Proteksi ALARA
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center gap-0">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isCompleted = currentStep > step.id;
          const isActive = currentStep === step.id;
          return (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all",
                    isCompleted
                      ? "border-blue-600 bg-blue-600 text-white"
                      : isActive
                      ? "border-blue-600 bg-white text-blue-600"
                      : "border-slate-200 bg-white text-slate-400"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-[10px] font-medium text-center leading-tight max-w-12",
                    isActive ? "text-blue-600" : "text-slate-400"
                  )}
                >
                  {step.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 flex-1 mx-1 rounded transition-all",
                    isCompleted ? "bg-blue-600" : "bg-slate-200"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Form Card */}
      <Card className="border border-slate-200 shadow-sm">
        <CardContent className="pt-6">
          {currentStep === 1 && (
            <Step1Program
              form={form1}
              batches={batches}
              programs={programs}
              loadingBatches={loadingBatches}
              programBadges={programBadges}
              onNext={goNext}
            />
          )}
          {currentStep === 2 && (
            <Step2DataDiri
              userProfile={userProfile}
              loadingProfile={loadingProfile}
              onNext={goNext}
              onBack={goBack}
            />
          )}
          {currentStep === 3 && (
            <Step3Sponsor form={form3} onNext={goNext} onBack={goBack} />
          )}
          {currentStep === 4 && (
            <Step4Dokumen
              docs={docs}
              setDocs={setDocs}
              onNext={goNext}
              onBack={goBack}
            />
          )}
          {currentStep === 5 && (
            <Step5Review
              formData={{
                step1: form1.getValues(),
                step2: form2.getValues(),
                step3: form3.getValues(),
              }}
              batches={batches}
              programs={programs}
              userProfile={userProfile}
              docs={docs}
              onBack={goBack}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
