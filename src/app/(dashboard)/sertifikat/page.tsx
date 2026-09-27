"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Award, Download, CheckCircle2, ShieldCheck, Printer, FileText, Layers, Clock } from "lucide-react";
import { toast } from "sonner";
import QRCode from "qrcode";
import CertificateDocument from "@/components/certificate/CertificateDocument";
import { CertificateSyllabusData } from "@/lib/certificateSyllabus";

interface CertData {
  isEligible: boolean;
  certificateNumber: string | null;
  participantName: string;
  nik: string;
  trainingTitle: string;
  trainingCategory?: string | null;
  batchNumber: number;
  startDate: string;
  endDate: string;
  issuedAt: string | null;
  verifyUrl: string;
  customSyllabus?: CertificateSyllabusData | null;
  signedCertificateUrl?: string | null;
  signedCertificateName?: string | null;
  signedUploadedAt?: string | null;
  criteria: {
    attendanceComplete: boolean;
    logbookApproved: boolean;
    tryoutPassed: boolean;
    tryoutScore: number | null;
  };
  signatory?: {
    name: string;
    position: string;
    institution: string;
    nip?: string | null;
    signatureUrl?: string | null;
  };
}

export default function SertifikatPage() {
  const [data, setData] = useState<CertData | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [pageView, setPageView] = useState<"both" | "page1" | "page2">("both");

  useEffect(() => {
    async function loadCert() {
      try {
        const res = await fetch("/api/certificates/me");
        if (res.ok) {
          const resData = await res.json();
          setData(resData);
          if (resData.certificateNumber) {
            const url = `${window.location.origin}/verify/${encodeURIComponent(resData.certificateNumber)}`;
            const qr = await QRCode.toDataURL(url, { width: 140, margin: 1 });
            setQrCodeDataUrl(qr);
          }
        } else {
          // Demo fallback
          const demoCert: CertData = {
            isEligible: true,
            certificateNumber: "02/PPR/HP-ALARA/2026",
            participantName: "Yuli Prasetyo",
            nik: "3172091238910001",
            trainingTitle: "Pemindai Bagasi atau Barang Lainnya Menggunakan Sumber Radiasi Pengion",
            trainingCategory: "PPR_BAGASI",
            batchNumber: 1,
            startDate: "2026-09-14",
            endDate: "2026-09-16",
            issuedAt: "2026-09-16T17:00:00Z",
            verifyUrl: "http://localhost:3000/verify/02%2FPPR%2FHP-ALARA%2F2026",
            criteria: {
              attendanceComplete: true,
              logbookApproved: true,
              tryoutPassed: true,
              tryoutScore: 85.0,
            },
            signatory: {
              name: "Fransiskus Asisi Sanyata Putra, ST",
              position: "Direktur CV. Hikmat Proteksi ALARA",
              institution: "CV. HIKMAT PROTEKSI ALARA",
            },
          };
          setData(demoCert);
          const qr = await QRCode.toDataURL(demoCert.verifyUrl, { width: 140, margin: 1 });
          setQrCodeDataUrl(qr);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadCert();
  }, []);

  const handlePrint = () => {
    toast.info("Membuka dialog cetak PDF resmi 2 halaman...");
    window.print();
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium">Memeriksa data penerbitan E-Sertifikat...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6 print:p-0 print:m-0 print:max-w-none print:space-y-0">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Award className="w-6 h-6 text-blue-600" />
            E-Sertifikat Resmi Pelatihan ALARA
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Format Resmi 2 Halaman (Depan & Daftar Unit Kompetensi) &bull; Terakreditasi BAPETEN (KTUN No. 07998.722.1.040726)
          </p>
        </div>

        {data?.certificateNumber && (
          <div className="flex flex-wrap items-center gap-2">
            {/* View Selector Tabs */}
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1 text-xs">
              <button
                type="button"
                onClick={() => setPageView("both")}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  pageView === "both"
                    ? "bg-white text-blue-700 shadow-xs font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Semua (2 Hal)
              </button>
              <button
                type="button"
                onClick={() => setPageView("page1")}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  pageView === "page1"
                    ? "bg-white text-blue-700 shadow-xs font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Halaman 1 (Depan)
              </button>
              <button
                type="button"
                onClick={() => setPageView("page2")}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  pageView === "page2"
                    ? "bg-white text-blue-700 shadow-xs font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Halaman 2 (Belakang)
              </button>
            </div>

            <Button
              onClick={handlePrint}
              variant="outline"
              size="sm"
              className="gap-1.5 border-slate-300 shadow-xs font-medium"
            >
              <Printer className="h-4 w-4 text-slate-700" /> Cetak / Print
            </Button>
            {data?.signedCertificateUrl && (
              <a
                href={data.signedCertificateUrl}
                download={data.signedCertificateName || "Sertifikat_ALARA_TTD_Basah.pdf"}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-sm font-semibold"
                >
                  <Download className="h-4 w-4" /> Unduh Berkas TTD Basah
                </Button>
              </a>
            )}
            <Button
              onClick={handlePrint}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-sm font-semibold"
            >
              <Download className="h-4 w-4" /> Unduh PDF Resmi
            </Button>
          </div>
        )}
      </div>

      {/* Banner Notifikasi Tanda Tangan Basah */}
      {data?.signedCertificateUrl ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs no-print">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-emerald-950">
                Sertifikat Fisik Bertandatangan Basah Tersedia
              </h4>
              <p className="text-xs text-emerald-800 mt-0.5">
                Berkas fisik sertifikat dengan tanda tangan manual/basah dan cap resmi lembaga telah diunggah ({data.signedCertificateName || "Berkas Resmi"}). Anda dapat mengunduh berkas aslinya sekarang.
              </p>
            </div>
          </div>
          <a
            href={data.signedCertificateUrl}
            download={data.signedCertificateName || "Sertifikat_ALARA_TTD_Basah.pdf"}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0"
          >
            <Button className="w-full sm:w-auto bg-emerald-700 hover:bg-emerald-800 text-white font-semibold gap-2 shadow-xs">
              <Download className="w-4 h-4" />
              Unduh Sertifikat Basah
            </Button>
          </a>
        </div>
      ) : data?.certificateNumber ? (
        <div className="bg-amber-50/90 border border-amber-200 rounded-xl p-3.5 flex items-center gap-3 text-xs text-amber-900 shadow-xs no-print">
          <Clock className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <p className="font-semibold text-amber-950">Dalam Proses Penandatanganan Basah & Cap Lembaga</p>
            <p className="text-amber-800 mt-0.5 leading-relaxed">
              Sertifikat Anda telah terbit di sistem. Karena proses segel elektronik sedang berjalan, dokumen fisik sedang melalui proses tanda tangan basah pimpinan. Berkas hasil scan tanda tangan basah akan dapat diunduh langsung di laman ini setelah diunggah oleh panitia.
            </p>
          </div>
        </div>
      ) : null}

      {/* Criteria Verification Checklist */}
      <Card className="border-slate-200 shadow-sm no-print">
        <CardHeader className="py-3 px-5 border-b bg-slate-50">
          <CardTitle className="text-sm font-semibold text-slate-800 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-blue-600" />
              Status Persyaratan Kelulusan & Penerbitan Sertifikat
            </span>
            {data?.certificateNumber && (
              <Badge className="bg-emerald-600 text-white font-mono text-xs">
                Sertifikat Terbit: {data.certificateNumber}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-50/80 rounded-lg border border-slate-200 flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-800 block">Presensi Pelatihan:</span>
              <span className="text-slate-500">Minimal kehadiran terpenuhi</span>
            </div>
            {data?.criteria.attendanceComplete ? (
              <Badge className="bg-emerald-600 text-white gap-1">
                <CheckCircle2 className="h-3 w-3" /> Memenuhi
              </Badge>
            ) : (
              <Badge variant="destructive">Belum Lengkap</Badge>
            )}
          </div>

          <div className="p-3 bg-slate-50/80 rounded-lg border border-slate-200 flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-800 block">Logbook Praktikum:</span>
              <span className="text-slate-500">Disetujui Instruktur/Pakar</span>
            </div>
            {data?.criteria.logbookApproved ? (
              <Badge className="bg-emerald-600 text-white gap-1">
                <CheckCircle2 className="h-3 w-3" /> Signed-off
              </Badge>
            ) : (
              <Badge variant="secondary">Menunggu Review</Badge>
            )}
          </div>

          <div className="p-3 bg-slate-50/80 rounded-lg border border-slate-200 flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-800 block">Tryout BAPETEN:</span>
              <span className="text-slate-500">Skor &ge; 70.0 (Skor: {data?.criteria.tryoutScore || "-"})</span>
            </div>
            {data?.criteria.tryoutPassed ? (
              <Badge className="bg-emerald-600 text-white gap-1">
                <CheckCircle2 className="h-3 w-3" /> Lulus ({data.criteria.tryoutScore})
              </Badge>
            ) : (
              <Badge variant="destructive">Belum Lulus</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Certificate View Container */}
      {data?.certificateNumber ? (
        <div className="w-full flex justify-center py-2 overflow-x-auto print:overflow-visible print:p-0 print:m-0 print:block">
          <CertificateDocument
            certificateNumber={data.certificateNumber}
            participantName={data.participantName}
            nik={data.nik}
            trainingTitle={data.trainingTitle}
            trainingCategory={data.trainingCategory}
            startDate={data.startDate}
            endDate={data.endDate}
            issuedAt={data.issuedAt}
            signatory={data.signatory}
            qrCodeDataUrl={qrCodeDataUrl}
            customSyllabus={data.customSyllabus}
            showPage={pageView}
          />
        </div>
      ) : (
        <Card className="p-10 text-center border-dashed border-2 border-slate-200 bg-slate-50/50">
          <Award className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 mb-1">
            E-Sertifikat Belum Diterbitkan
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Sertifikat resmi ALARA akan diterbitkan secara otomatis setelah Anda menyelesaikan seluruh rangkaian presensi sesi pelatihan, pengisian logbook praktikum disetujui, dan lulus evaluasi/Tryout BAPETEN minimal nilai 70.0.
          </p>
        </Card>
      )}
    </div>
  );
}
