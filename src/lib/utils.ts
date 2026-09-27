import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(num);
}

export function formatDate(date: Date | string | null): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(d);
}

export function formatDateTime(date: Date | string | null): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function generateInvoiceNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `INV/ALARA/${year}${month}/${random}`;
}

export function generateCertNumber(
  program: string,
  year: number,
  batch: number,
  seq: number
): string {
  const programCode =
    program === "PPR_ANALISIS"
      ? "PPR-ANALISIS"
      : program === "PPR_BAGASI"
      ? "PPR-BAGASI"
      : program === "PPR_PENYEGARAN"
      ? "PPR-PENYEGARAN"
      : "PKR";
  return `CERT/ALARA/${programCode}/${year}/B${batch}/${String(seq).padStart(3, "0")}`;
}

export function getTrainingLabel(category: string): string {
  switch (category) {
    case "PPR_ANALISIS":
      return "PPR Analisis";
    case "PPR_BAGASI":
      return "PPR Pemindai Bagasi";
    case "PKR_PEKERJA":
      return "PKR Pekerja Radiasi";
    case "PPR_PENYEGARAN":
      return "PPR Penyegaran";
    default:
      return category;
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "APPROVED":
    case "PAID":
    case "VERIFIED":
    case "LULUS":
    case "LULUS_TRYOUT":
    case "HADIR":
      return "text-green-600 bg-green-50";
    case "REJECTED":
    case "TIDAK_LULUS":
    case "ALPA":
      return "text-red-600 bg-red-50";
    case "MENUNGGU_VERIFIKASI":
    case "PENDING_VERIFICATION":
    case "PENDING":
      return "text-yellow-600 bg-yellow-50";
    case "DRAFT":
    case "UNPAID":
      return "text-gray-600 bg-gray-50";
    case "REMIDIAL":
    case "IZIN":
      return "text-orange-600 bg-orange-50";
    default:
      return "text-blue-600 bg-blue-50";
  }
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    DRAFT: "Draft",
    MENUNGGU_VERIFIKASI: "Menunggu Verifikasi",
    APPROVED: "Disetujui",
    REJECTED: "Ditolak",
    UNPAID: "Belum Bayar",
    PENDING_VERIFICATION: "Verifikasi Pembayaran",
    PAID: "Lunas",
    PENDING: "Menunggu",
    VERIFIED: "Terverifikasi",
    HADIR: "Hadir",
    IZIN: "Izin",
    ALPA: "Alpa",
    LULUS: "Lulus",
    TIDAK_LULUS: "Tidak Lulus",
    REMIDIAL: "Remedial",
    LULUS_TRYOUT: "Lulus Tryout",
    BELUM_LULUS: "Belum Lulus",
    ACTIVE: "Aktif",
    INACTIVE: "Tidak Aktif",
  };
  return labels[status] || status;
}

export function isMcuExpired(
  mcuDate: Date | string,
  trainingStart: Date | string
): boolean {
  const mcu = typeof mcuDate === "string" ? new Date(mcuDate) : mcuDate;
  const training =
    typeof trainingStart === "string" ? new Date(trainingStart) : trainingStart;
  const oneYearBefore = new Date(training);
  oneYearBefore.setFullYear(oneYearBefore.getFullYear() - 1);
  return mcu < oneYearBefore;
}
