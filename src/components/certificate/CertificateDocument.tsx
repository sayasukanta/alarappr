'use client';

import React from 'react';
import Image from 'next/image';
import { getCertificateSyllabus, CertificateSyllabusData } from '@/lib/certificateSyllabus';

export interface CertificateDocumentProps {
  certificateNumber?: string | null;
  participantName: string;
  nik?: string | null;
  trainingTitle?: string;
  trainingCategory?: string | null;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  issuedAt?: string | Date | null;
  signatory?: {
    name?: string | null;
    position?: string | null;
    institution?: string | null;
    nip?: string | null;
    signatureUrl?: string | null;
  } | null;
  qrCodeDataUrl?: string;
  showPage?: 'both' | 'page1' | 'page2';
  customSyllabus?: CertificateSyllabusData | null;
}

const MONTH_NAMES_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const MONTH_NAMES_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function formatDateRangeId(start?: string | Date | null, end?: string | Date | null): string {
  if (!start || !end) return '14-16 September 2026';
  const s = new Date(start);
  const e = new Date(end);
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return '14-16 September 2026';

  const sDay = s.getDate();
  const eDay = e.getDate();
  const eMonth = MONTH_NAMES_ID[e.getMonth()];
  const eYear = e.getFullYear();

  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
    return `${sDay}-${eDay} ${eMonth} ${eYear}`;
  }
  const sMonth = MONTH_NAMES_ID[s.getMonth()];
  return `${sDay} ${sMonth} - ${eDay} ${eMonth} ${eYear}`;
}

function formatDateRangeEn(start?: string | Date | null, end?: string | Date | null): string {
  if (!start || !end) return 'September, 14-16 2026';
  const s = new Date(start);
  const e = new Date(end);
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return 'September, 14-16 2026';

  const sDay = s.getDate();
  const eDay = e.getDate();
  const eMonth = MONTH_NAMES_EN[e.getMonth()];
  const eYear = e.getFullYear();

  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
    return `${eMonth}, ${sDay}-${eDay} ${eYear}`;
  }
  const sMonth = MONTH_NAMES_EN[s.getMonth()];
  return `${sMonth} ${sDay} - ${eMonth} ${eDay}, ${eYear}`;
}

function formatIssueDate(issuedAt?: string | Date | null, end?: string | Date | null): string {
  const d = issuedAt ? new Date(issuedAt) : end ? new Date(end) : new Date();
  if (isNaN(d.getTime())) return '16 September 2026';
  return `${d.getDate()} ${MONTH_NAMES_ID[d.getMonth()]} ${d.getFullYear()}`;
}

export default function CertificateDocument({
  certificateNumber = '02/PPR/HP-ALARA/2026',
  participantName,
  nik,
  trainingTitle,
  trainingCategory,
  startDate,
  endDate,
  issuedAt,
  signatory,
  qrCodeDataUrl,
  showPage = 'both',
  customSyllabus,
}: CertificateDocumentProps) {
  const fallbackSyllabus = getCertificateSyllabus(trainingCategory);
  const syllabus = customSyllabus || fallbackSyllabus;

  const displayTitleId = trainingTitle || syllabus.trainingTitleId;
  const displayTitleEn = syllabus.trainingTitleEn;

  const dateId = formatDateRangeId(startDate, endDate);
  const dateEn = formatDateRangeEn(startDate, endDate);
  const issueDateStr = formatIssueDate(issuedAt, endDate);

  const signatoryName = signatory?.name || 'Fransiskus Asisi Sanyata Putra, ST';
  const signatoryPosition = signatory?.position || 'Direktur CV. Hikmat Proteksi ALARA';

  return (
    <div className="cert-print-container flex flex-col items-center gap-10 w-full print:gap-0 print:m-0 print:p-0 print:block">
      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {/* HALAMAN 1 (DEPAN)                                                        */}
      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {(showPage === 'both' || showPage === 'page1') && (
        <div
          className="cert-page relative bg-white overflow-hidden shadow-2xl rounded-sm border border-slate-200 select-none print:shadow-none print:border-none print:rounded-none"
          style={{
            width: '100%',
            maxWidth: '1024px',
            aspectRatio: '297 / 210',
          }}
        >
          {/* Latar Belakang Bingkai Geometris (Navy & Copper Gold) */}
          <div className="absolute inset-0 pointer-events-none z-0">
            <Image
              src="/images/cert-frame.png"
              alt="Bingkai Sertifikat ALARA"
              fill
              className="object-fill"
              priority
            />
          </div>

          {/* Medali Pita Emas di Pojok Kiri Atas */}
          <div className="absolute top-[13.5%] left-[13%] w-[68px] h-[105px] md:w-[78px] md:h-[120px] z-10">
            <Image
              src="/images/cert-gold-badge.png"
              alt="Medali Penghargaan"
              fill
              className="object-contain drop-shadow-sm"
              priority
            />
          </div>

          {/* Logo Resmi CV. HIKMAT PROTEKSI ALARA di Pojok Kanan Atas */}
          <div className="absolute top-[11.5%] right-[11.5%] w-[82px] h-[82px] md:w-[94px] md:h-[94px] z-10">
            <Image
              src="/logo.png"
              alt="Logo CV. Hikmat Proteksi ALARA"
              fill
              className="object-contain"
              priority
            />
          </div>

          {/* Area Konten Utama Halaman Depan */}
          <div className="relative z-10 flex flex-col items-center justify-start h-full pt-[9.5%] px-[12%] text-center">
            {/* Judul & Nomor Sertifikat */}
            <div className="space-y-0.5">
              <h1 className="font-certificate-title text-base sm:text-lg md:text-xl lg:text-[22px] font-bold text-slate-900 tracking-[0.25em] uppercase">
                SERTIFIKAT PELATIHAN
              </h1>
              <p className="font-certificate-title text-xs sm:text-sm md:text-base text-slate-800 tracking-[0.22em] italic uppercase -mt-0.5">
                TRAINING CERTIFICATE
              </p>
              <p className="text-[11px] sm:text-xs md:text-[13px] font-semibold tracking-[0.18em] text-slate-900 mt-1">
                No. {certificateNumber || '02/PPR/HP-ALARA/2026'}
              </p>
            </div>

            {/* Pernyataan Bahasa Indonesia & Inggris */}
            <div className="mt-2 space-y-0">
              <p className="text-xs sm:text-sm md:text-[14.5px] font-bold text-slate-900 tracking-wide">
                Dengan ini menyatakan bahwa
              </p>
              <p className="text-[10px] sm:text-[11.5px] md:text-xs italic text-slate-700 tracking-normal">
                This is to certify that
              </p>
            </div>

            {/* Nama Peserta (Font Kursif Elegan / Calligraphy) */}
            <div className="w-full mt-0.5">
              <p className="font-certificate-name text-3xl sm:text-4xl md:text-5xl lg:text-[54px] text-slate-900 leading-tight py-0.5 drop-shadow-sm">
                {participantName}
              </p>
              {/* Garis Horizontal Pembatas di bawah Nama */}
              <div className="w-[68%] mx-auto h-[1.2px] bg-slate-800/85 -mt-0.5" />
            </div>

            {/* Program Pelatihan */}
            <div className="mt-1 space-y-0.5 max-w-2xl">
              <p className="text-[11px] sm:text-xs md:text-sm font-semibold text-slate-800">
                Telah mengikuti Pelatihan Calon PPR
              </p>
              <p className="text-xs sm:text-[13px] md:text-[15px] font-extrabold text-slate-950 leading-snug">
                {displayTitleId}
              </p>
              <p className="text-[9.5px] sm:text-[10.5px] md:text-xs italic text-slate-600">
                Has participated in the training of
              </p>
              <p className="text-[10px] sm:text-[11px] md:text-[12.5px] italic font-semibold text-slate-800 leading-tight">
                {displayTitleEn}
              </p>
            </div>

            {/* Jadwal Pelaksanaan */}
            <div className="mt-1.5 space-y-0">
              <p className="text-[10.5px] sm:text-xs md:text-[13px] font-semibold text-slate-800">
                Yang diselenggarakan pada tanggal {dateId}
              </p>
              <p className="text-[9px] sm:text-[10px] md:text-[11px] italic text-slate-600">
                Which was held on {dateEn}
              </p>
            </div>

            {/* Bagian Bawah: QR Code & Pengesahan Tanda Tangan */}
            <div
              className="w-full flex items-end justify-between mt-auto px-[2%]"
              style={{ paddingBottom: 'calc(5% + 11mm)' }}
            >
              {/* QR Code Verifikasi Keaslian */}
              <div className="flex items-center text-left">
                {qrCodeDataUrl ? (
                  <img
                    src={qrCodeDataUrl}
                    alt="QR Verifikasi Sertifikat"
                    className="w-16 h-16 md:w-[76px] md:h-[76px] border border-slate-300 rounded p-1 bg-white shadow-xs"
                  />
                ) : (
                  <div className="w-16 h-16 md:w-[76px] md:h-[76px] border border-slate-200 rounded bg-slate-50 flex items-center justify-center text-[10px] text-slate-400">
                    QR
                  </div>
                )}
              </div>

              {/* Tanda Tangan, Stempel Resmi & Nama Pejabat */}
              <div className="text-right flex flex-col items-end">
                <p className="text-[10.5px] sm:text-[11.5px] md:text-xs text-slate-800 font-medium">
                  Jakarta, {issueDateStr}
                </p>
                <p className="text-[9.5px] sm:text-[10.5px] md:text-[11px] text-slate-800 font-medium">
                  Atas nama (<em>on behalf of</em>) CV. Hikmat Proteksi ALARA
                </p>

                {/* Ruang Kosong untuk Tanda Tangan Basah & Cap Stempel Fisik */}
                <div className="h-16 md:h-20 w-44 md:w-52" />

                <p className="text-[11px] sm:text-xs md:text-[13px] font-bold text-slate-900 tracking-wide">
                  {signatoryName}
                </p>
                <p className="text-[9.5px] sm:text-[10.5px] md:text-[11px] text-slate-700">
                  {signatoryPosition}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {/* HALAMAN 2 (BELAKANG / DAFTAR UNIT KOMPETENSI)                            */}
      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {(showPage === 'both' || showPage === 'page2') && (
        <div
          className="cert-page relative bg-white overflow-hidden shadow-2xl rounded-sm border border-slate-200 select-none print:shadow-none print:border-none print:rounded-none"
          style={{
            width: '100%',
            maxWidth: '1024px',
            aspectRatio: '297 / 210',
          }}
        >
          {/* Latar Belakang Bingkai Geometris (Navy & Copper Gold) */}
          <div className="absolute inset-0 pointer-events-none z-0">
            <Image
              src="/images/cert-frame.png"
              alt="Bingkai Sertifikat ALARA"
              fill
              className="object-fill"
              priority
            />
          </div>

          {/* Logo Resmi CV. HIKMAT PROTEKSI ALARA di Pojok Kanan Atas */}
          <div className="absolute top-[8.5%] right-[11.5%] w-[68px] h-[68px] md:w-[78px] md:h-[78px] z-10">
            <Image
              src="/logo.png"
              alt="Logo CV. Hikmat Proteksi ALARA"
              fill
              className="object-contain"
              priority
            />
          </div>

          {/* Area Konten Halaman Belakang */}
          <div
            className="relative z-10 flex flex-col items-center justify-start h-full px-[9%] text-center"
            style={{ paddingTop: 'calc(5% + 15mm)' }}
          >
            {/* Header Judul Unit Kompetensi */}
            <div className="space-y-0.5 max-w-xl mx-auto">
              <h2 className="text-[11px] sm:text-xs md:text-[13px] font-bold text-slate-900 tracking-wide uppercase leading-tight">
                {syllabus.titleHeaderId}
              </h2>
              <h3 className="text-[10px] sm:text-[11px] md:text-xs font-bold text-slate-900 tracking-wide uppercase leading-tight">
                {syllabus.trainingSubtitleId}
              </h3>
              <p className="text-[7.5px] sm:text-[8px] md:text-[8.5px] italic font-semibold text-slate-600 leading-none uppercase">
                ({syllabus.titleHeaderEn})
              </p>
            </div>

            {/* Tabel Daftar Unit Kompetensi Pelatihan */}
            <div className="w-full mt-1.5 overflow-hidden text-slate-900">
              <table className="w-full border-collapse border border-slate-900 text-left text-[8px] sm:text-[8.5px] md:text-[9px] print:text-[8px]">
                <thead>
                  <tr className="border-b border-slate-900 font-bold bg-white text-slate-900 text-center text-[8px] sm:text-[8.5px] md:text-[9px]">
                    <th className="border-r border-slate-900 py-0.5 px-1 w-[5%]">No.</th>
                    <th className="border-r border-slate-900 py-0.5 px-2 w-[46%] text-center">Mata Ajar</th>
                    <th className="border-r border-slate-900 py-0.5 px-1 w-[20%] text-center">Kode</th>
                    <th className="border-r border-slate-900 py-0.5 px-1 w-[23%] text-center">Kode Kompetensi</th>
                    <th className="py-0.5 px-1 w-[6%] text-center">JP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {syllabus.sections.map((sec) => (
                    <React.Fragment key={sec.code}>
                      {/* Section Header Row */}
                      <tr className="font-bold border-t border-b border-slate-900 bg-slate-50/70 text-[8px] sm:text-[8.5px] md:text-[9px]">
                        <td className="border-r border-slate-900 py-[1.5px] px-1 text-center font-bold">
                          {sec.code}.
                        </td>
                        <td className="border-r border-slate-900 py-[1.5px] px-2 font-bold" colSpan={4}>
                          {sec.title}
                        </td>
                      </tr>

                      {/* Section Units Rows */}
                      {sec.units.map((u) => (
                        <tr key={u.kode} className="hover:bg-slate-50/40">
                          <td className="border-r border-slate-900 py-[1.5px] px-1 text-center align-middle font-medium">
                            {u.no}
                          </td>
                          <td className="border-r border-slate-900 py-[1.5px] px-2 leading-[1.2] align-middle text-slate-900 font-medium">
                            {u.mataAjar}
                          </td>
                          <td className="border-r border-slate-900 py-[1.5px] px-1 text-center font-mono text-[7px] sm:text-[7.5px] md:text-[8px] print:text-[7px] align-middle text-slate-800">
                            {u.kode}
                          </td>
                          <td className="border-r border-slate-900 py-[1.5px] px-1 text-center align-middle leading-[1.1] font-mono text-[6.5px] sm:text-[7px] md:text-[7.5px] print:text-[6.5px] text-slate-800">
                            {u.kodeKompetensi.length === 1 && u.kodeKompetensi[0] === '-' ? (
                              <span>-</span>
                            ) : (
                              u.kodeKompetensi.map((kc, i) => (
                                <div key={i} className="whitespace-normal">
                                  {kc}
                                </div>
                              ))
                            )}
                          </td>
                          <td className="py-[1.5px] px-1 text-center font-bold align-middle">
                            {u.jp}
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
