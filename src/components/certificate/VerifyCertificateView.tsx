'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  Printer,
  Download,
  Calendar,
  User,
  CreditCard,
  Building2,
  FileText,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { toast } from 'sonner';
import CertificateDocument from './CertificateDocument';
import { CertificateSyllabusData } from '@/lib/certificateSyllabus';

interface VerifyCertificateViewProps {
  certificateNumber: string;
  participantName: string;
  nik?: string | null;
  instansi?: string | null;
  trainingTitle: string;
  trainingCategory?: string | null;
  batchNumber: number;
  startDate?: string | null;
  endDate?: string | null;
  issuedAt?: string | null;
  signatory?: {
    name?: string | null;
    position?: string | null;
    institution?: string | null;
    nip?: string | null;
  } | null;
  qrCodeDataUrl?: string;
  customSyllabus?: CertificateSyllabusData | null;
  signedCertificateUrl?: string | null;
  signedCertificateName?: string | null;
}

export default function VerifyCertificateView({
  certificateNumber,
  participantName,
  nik,
  instansi,
  trainingTitle,
  trainingCategory,
  batchNumber,
  startDate,
  endDate,
  issuedAt,
  signatory,
  qrCodeDataUrl,
  customSyllabus,
  signedCertificateUrl,
  signedCertificateName,
}: VerifyCertificateViewProps) {
  const [pageView, setPageView] = useState<'both' | 'page1' | 'page2'>('both');

  const handlePrint = () => {
    toast.info('Menyiapkan format cetak sertifikat resmi 2 halaman...');
    window.print();
  };

  return (
    <div className="space-y-6 w-full max-w-5xl mx-auto print:max-w-none print:m-0 print:p-0 print:space-y-0">
      {/* Top Banner Verification Status */}
      <div className="bg-white rounded-2xl shadow-md border border-emerald-100 overflow-hidden no-print">
        <div className="bg-emerald-50/90 border-b border-emerald-100 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-emerald-600 shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-emerald-900">
                  Sertifikat Resmi & Sah Terverifikasi
                </h2>
                <Badge className="bg-emerald-600 text-white font-mono text-[11px]">
                  VALID
                </Badge>
                {signedCertificateUrl && (
                  <Badge className="bg-blue-600 text-white text-[11px]">
                    TTD Basah Terupload
                  </Badge>
                )}
              </div>
              <p className="text-xs text-emerald-700 mt-0.5">
                Diterbitkan secara sah oleh Lembaga Pelatihan Ketenaganukliran CV. Hikmat Proteksi ALARA
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-end sm:self-center">
            {signedCertificateUrl && (
              <a href={signedCertificateUrl} download={signedCertificateName || 'Sertifikat_TTD_Basah.pdf'} target="_blank" rel="noopener noreferrer">
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5 text-xs font-semibold shadow-xs"
                >
                  <Download className="h-3.5 w-3.5" /> Unduh Berkas TTD Basah
                </Button>
              </a>
            )}
            <Button
              onClick={handlePrint}
              variant="outline"
              size="sm"
              className="gap-1.5 border-slate-300 text-xs font-medium"
            >
              <Printer className="h-3.5 w-3.5 text-slate-700" /> Cetak
            </Button>
            <Button
              onClick={handlePrint}
              size="sm"
              className="bg-emerald-700 hover:bg-emerald-800 text-white gap-1.5 text-xs font-semibold shadow-xs"
            >
              <Download className="h-3.5 w-3.5" /> Unduh PDF
            </Button>
          </div>
        </div>

        {/* Quick Meta Details */}
        <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs bg-slate-50/50">
          <div>
            <p className="text-slate-400 font-medium text-[10px] uppercase">Nomor Sertifikat</p>
            <p className="font-mono font-bold text-slate-900 text-xs mt-0.5">{certificateNumber}</p>
          </div>
          <div>
            <p className="text-slate-400 font-medium text-[10px] uppercase">Nama Peserta</p>
            <p className="font-semibold text-slate-900 text-xs mt-0.5">{participantName}</p>
          </div>
          <div>
            <p className="text-slate-400 font-medium text-[10px] uppercase">Program Pelatihan</p>
            <p className="font-medium text-slate-800 text-xs mt-0.5 truncate">{trainingTitle}</p>
          </div>
          <div>
            <p className="text-slate-400 font-medium text-[10px] uppercase">Pejabat Pengesah</p>
            <p className="font-semibold text-slate-900 text-xs mt-0.5">
              {signatory?.name || 'Fransiskus Asisi Sanyata Putra, ST'}
            </p>
          </div>
        </div>
      </div>

      {/* Page Navigation Selector */}
      <div className="flex items-center justify-between no-print px-1">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-800">
            Pratinjau E-Sertifikat Asli (Format Resmi ALARA)
          </h3>
        </div>

        <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 text-xs shadow-2xs">
          <button
            type="button"
            onClick={() => setPageView('both')}
            className={`px-3 py-1 rounded-md font-medium transition-all ${
              pageView === 'both'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua (2 Halaman)
          </button>
          <button
            type="button"
            onClick={() => setPageView('page1')}
            className={`px-3 py-1 rounded-md font-medium transition-all ${
              pageView === 'page1'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Halaman 1 (Depan)
          </button>
          <button
            type="button"
            onClick={() => setPageView('page2')}
            className={`px-3 py-1 rounded-md font-medium transition-all ${
              pageView === 'page2'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Halaman 2 (Belakang)
          </button>
        </div>
      </div>

      {/* The 2-Page Certificate Document */}
      <div className="w-full flex justify-center overflow-x-auto py-2 print:overflow-visible print:p-0 print:m-0 print:block">
        <CertificateDocument
          certificateNumber={certificateNumber}
          participantName={participantName}
          nik={nik}
          trainingTitle={trainingTitle}
          trainingCategory={trainingCategory}
          startDate={startDate}
          endDate={endDate}
          issuedAt={issuedAt}
          signatory={signatory}
          qrCodeDataUrl={qrCodeDataUrl}
          customSyllabus={customSyllabus}
          showPage={pageView}
        />
      </div>
    </div>
  );
}
