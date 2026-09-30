import jsPDF from "jspdf";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { ALARA_LOGO_BASE64 } from "@/lib/logo-base64";

export interface InvoiceData {
  invoiceNo: string;
  program: string;
  batch: string;
  amount: number;
  dueDate: string;
  paymentStatus: "BELUM_BAYAR" | "MENUNGGU_VERIFIKASI" | "LUNAS" | "DITOLAK";
  paidAt?: string;
  paidBy?: string;
  pesertaName?: string;
  pesertaNik?: string;
  instansi?: string;
  institutionName?: string;
  ktunNumber?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
}

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

export function generateInvoicePdf(payment: InvoiceData) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 20;

  // Header Banner
  doc.setFillColor(27, 75, 143); // Navy Blue
  doc.rect(margin, 18, pageWidth - 2 * margin, 26, "F");

  // Logo Image in Banner
  try {
    doc.addImage(ALARA_LOGO_BASE64, "PNG", margin + 3, 19, 24, 24);
  } catch (e) {
    console.error("Failed to add logo to invoice PDF", e);
  }

  // Company Name & Subtitle
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text((payment.institutionName || "CV HIKMAT PROTEKSI ALARA").toUpperCase(), margin + 30, 26);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Lembaga Pelatihan Ketenaganukliran Berizin Resmi BAPETEN", margin + 30, 31);
  doc.text(`SK ${payment.ktunNumber || "KTUN BAPETEN No. 07998.722.1.040726"} | www.hikmatproteksialara.com`, margin + 30, 36);

  // INVOICE Title on right side
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("INVOICE", pageWidth - margin - 6, 29, { align: "right" });
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("TAGIHAN RESMI PELATIHAN", pageWidth - margin - 6, 35, { align: "right" });

  // Invoice Meta & Billed To Section
  let y = 55;

  // Left: Billed To
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(110, 110, 110);
  doc.text("TAGIHAN KEPADA:", margin, y);

  doc.setTextColor(25, 25, 25);
  doc.setFontSize(11);
  doc.text(payment.pesertaName || "Peserta Pelatihan ALARA", margin, y + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(75, 75, 75);
  let offset = 11;
  if (payment.pesertaNik && payment.pesertaNik !== "-") {
    doc.text(`NIK: ${payment.pesertaNik}`, margin, y + offset);
    offset += 5;
  }
  if (payment.instansi && payment.instansi !== "-") {
    doc.text(`Instansi: ${payment.instansi}`, margin, y + offset);
  }

  // Right: Invoice Info
  const rightColX = 130;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(110, 110, 110);
  doc.text("RINCIAN TAGIHAN:", rightColX, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(60, 60, 60);

  doc.text("No. Invoice", rightColX, y + 6);
  doc.text(":", rightColX + 22, y + 6);
  doc.setFont("helvetica", "bold");
  doc.text(payment.invoiceNo, rightColX + 25, y + 6);

  doc.setFont("helvetica", "normal");
  doc.text("Tgl. Invoice", rightColX, y + 11);
  doc.text(":", rightColX + 22, y + 11);
  doc.text(format(new Date(), "d MMMM yyyy", { locale: localeId }), rightColX + 25, y + 11);

  doc.text("Jatuh Tempo", rightColX, y + 16);
  doc.text(":", rightColX + 22, y + 16);
  doc.text(formatDate(payment.dueDate), rightColX + 25, y + 16);

  doc.text("Status", rightColX, y + 21);
  doc.text(":", rightColX + 22, y + 21);
  if (payment.paymentStatus === "LUNAS") {
    doc.setTextColor(22, 163, 74);
    doc.setFont("helvetica", "bold");
    doc.text("LUNAS (VERIFIED)", rightColX + 25, y + 21);
  } else if (payment.paymentStatus === "MENUNGGU_VERIFIKASI") {
    doc.setTextColor(217, 119, 6);
    doc.setFont("helvetica", "bold");
    doc.text("MENUNGGU VERIFIKASI", rightColX + 25, y + 21);
  } else {
    doc.setTextColor(220, 38, 38);
    doc.setFont("helvetica", "bold");
    doc.text("BELUM BAYAR", rightColX + 25, y + 21);
  }

  // Items Table Header
  y = 86;
  doc.setFillColor(243, 246, 250);
  doc.rect(margin, y, pageWidth - 2 * margin, 8, "F");
  doc.setDrawColor(215, 222, 230);
  doc.rect(margin, y, pageWidth - 2 * margin, 8, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(70, 70, 70);
  doc.text("NO", margin + 3, y + 5.5);
  doc.text("PROGRAM PELATIHAN & LAYANAN", 32, y + 5.5);
  doc.text("BATCH", 120, y + 5.5);
  doc.text("BIAYA (IDR)", pageWidth - margin - 4, y + 5.5, { align: "right" });

  // Wrap text to fit inside strict column boundaries
  const colProgramWidth = 84; // mm (from x=32 to x=116)
  const colBatchWidth = 22;   // mm (from x=120 to x=142)

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  const programLines: string[] = doc.splitTextToSize(payment.program, colProgramWidth);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  const subText = "Termasuk modul pelatihan, materi praktikum, tryout ujian & sertifikasi BAPETEN";
  const subLines: string[] = doc.splitTextToSize(subText, colProgramWidth);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  const batchLines: string[] = doc.splitTextToSize(payment.batch, colBatchWidth);

  // Dynamic row height based on content lines
  const titleHeight = programLines.length * 4.2;
  const subHeight = subLines.length * 3.4;
  const batchHeight = batchLines.length * 4.2;
  const contentHeight = Math.max(titleHeight + subHeight + 2, batchHeight);
  const rowHeight = Math.max(16, contentHeight + 6);

  // Items Table Row
  y += 8;
  doc.setFillColor(255, 255, 255);
  doc.rect(margin, y, pageWidth - 2 * margin, rowHeight, "F");
  doc.setDrawColor(215, 222, 230);
  doc.rect(margin, y, pageWidth - 2 * margin, rowHeight, "S");

  // Subtle vertical column dividers
  doc.setDrawColor(235, 240, 245);
  doc.line(30, y, 30, y + rowHeight);
  doc.line(118, y, 118, y + rowHeight);
  doc.line(142, y, 142, y + rowHeight);

  // Col 1: NO
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(30, 30, 30);
  doc.text("1", margin + 3.5, y + 5.5);

  // Col 2: Program Title & Description
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(20, 20, 20);
  doc.text(programLines, 32, y + 5.5);

  const subTextY = y + 5.5 + titleHeight + 0.5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(110, 110, 110);
  doc.text(subLines, 32, subTextY);

  // Col 3: Batch
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(30, 30, 30);
  doc.text(batchLines, 120, y + 5.5);

  // Col 4: Amount
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text(formatRupiah(payment.amount), pageWidth - margin - 4, y + 5.5, { align: "right" });

  // Totals Section
  y += rowHeight;
  const totX = 115;

  doc.setDrawColor(220, 225, 230);
  doc.line(totX, y, pageWidth - margin, y);

  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  doc.text("Subtotal", totX, y);
  doc.text(formatRupiah(payment.amount), pageWidth - margin - 4, y, { align: "right" });

  y += 5;
  doc.text("PPN (Termasuk)", totX, y);
  doc.text("Rp 0", pageWidth - margin - 4, y, { align: "right" });

  y += 4;
  doc.setLineWidth(0.4);
  doc.line(totX, y, pageWidth - margin, y);

  y += 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(27, 75, 143);
  doc.text("TOTAL TAGIHAN", totX, y);
  doc.text(formatRupiah(payment.amount), pageWidth - margin - 4, y, { align: "right" });

  // Bank Account Box
  y += 14;
  doc.setFillColor(242, 248, 255);
  doc.setDrawColor(185, 215, 245);
  doc.roundedRect(margin, y, pageWidth - 2 * margin, 32, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(27, 75, 143);
  doc.text("METODE PEMBAYARAN TRANSFER BANK:", margin + 5, y + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(50, 50, 50);
  doc.text("Nama Bank", margin + 5, y + 12);
  doc.text(":", margin + 35, y + 12);
  doc.setFont("helvetica", "bold");
  doc.text(payment.bankName || "Bank Mandiri", margin + 38, y + 12);

  doc.setFont("helvetica", "normal");
  doc.text("Nomor Rekening", margin + 5, y + 17);
  doc.text(":", margin + 35, y + 17);
  doc.setFont("helvetica", "bold");
  doc.text(payment.bankAccountNumber || "166-00-0733926-0", margin + 38, y + 17);

  doc.setFont("helvetica", "normal");
  doc.text("Atas Nama", margin + 5, y + 22);
  doc.text(":", margin + 35, y + 22);
  doc.setFont("helvetica", "bold");
  doc.text(payment.bankAccountName || "CV Hikmat Proteksi ALARA", margin + 38, y + 22);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 100, 100);
  doc.text(
    "* Mohon sertakan nomor invoice pada berita transfer dan unggah bukti transfer di menu Pembayaran.",
    margin + 5,
    y + 28
  );

  // Lunas Stamp if Lunas
  if (payment.paymentStatus === "LUNAS") {
    doc.setDrawColor(22, 163, 74);
    doc.setLineWidth(1);
    doc.rect(margin + 5, y + 40, 48, 18);
    doc.setTextColor(22, 163, 74);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("LUNAS / PAID", margin + 29, y + 49, { align: "center" });
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    const tglLunas = payment.paidAt ? formatDate(payment.paidAt) : formatDate(new Date().toISOString());
    doc.text(`Tgl: ${tglLunas}`, margin + 29, y + 54, { align: "center" });
  }

  // Signature Block
  const sigY = y + 38;
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Jakarta, " + format(new Date(), "d MMMM yyyy", { locale: localeId }), pageWidth - margin - 40, sigY, {
    align: "center",
  });
  doc.text("Bagian Keuangan & Administrasi,", pageWidth - margin - 40, sigY + 4.5, { align: "center" });
  doc.text("CV Hikmat Proteksi ALARA", pageWidth - margin - 40, sigY + 8.5, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.text("( Finance ALARA )", pageWidth - margin - 40, sigY + 28, { align: "center" });

  // Footer Disclaimer
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(140, 140, 140);
  doc.text(
    "Dokumen ini diterbitkan secara otomatis oleh Sistem Informasi Pelatihan ALARA dan sah tanpa tanda tangan basah.",
    pageWidth / 2,
    pageHeight - 12,
    { align: "center" }
  );

  // Clean filename and trigger browser download
  const cleanInvNo = payment.invoiceNo.replace(/[^a-zA-Z0-9_-]/g, "_");
  doc.save(`Invoice_${cleanInvNo}.pdf`);
}
