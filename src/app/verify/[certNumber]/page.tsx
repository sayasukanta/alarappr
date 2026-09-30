import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { XCircle, ArrowLeft, ShieldCheck } from 'lucide-react';
import QRCode from 'qrcode';
import VerifyCertificateView from '@/components/certificate/VerifyCertificateView';
import { buildSyllabusFromDb } from '@/lib/certificateSyllabus';
import { generateQrCodeWithLogoServer } from '@/lib/qrWithLogoServer';

export const metadata: Metadata = {
  title: 'Verifikasi Sertifikat Resmi | ALARA Training System',
  description: 'Verifikasi keaslian dan legalitas sertifikat pelatihan ketenaganukliran ALARA',
};

interface PageProps {
  params: Promise<{ certNumber: string }>;
}

export default async function CertificateVerifyPage({ params }: PageProps) {
  const { certNumber } = await params;
  const decoded = decodeURIComponent(certNumber);

  const examResult = await prisma.examResult
    .findFirst({
      where: { certificateNumber: decoded },
      include: {
        signatory: true,
        registration: {
          include: {
            user: {
              select: {
                fullName: true,
                nik: true,
              },
            },
            batch: {
              include: {
                training: {
                  include: {
                    competencyUnits: {
                      orderBy: [{ sectionCode: 'asc' }, { orderIndex: 'asc' }, { id: 'asc' }],
                    },
                  },
                },
              },
            },
          },
        },
      },
    })
    .catch(() => null);

  const isValid = !!examResult && examResult.finalStatus === 'LULUS';

  let qrCodeDataUrl = '';
  if (isValid && examResult) {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'https://hikmatproteksialara.com';
      const verifyUrl = `${baseUrl}/verify/${encodeURIComponent(examResult.certificateNumber || decoded)}`;
      qrCodeDataUrl = await generateQrCodeWithLogoServer(verifyUrl);
    } catch (e) {
      console.error('Failed to generate verify QR code:', e);
    }
  }

  const training = examResult?.registration?.batch?.training;
  const customSyllabus = training ? buildSyllabusFromDb(training, training.competencyUnits) : null;

  return (
    <main className="min-h-screen bg-slate-100/70 py-8 px-4 sm:px-6 print:min-h-0 print:bg-white print:p-0 print:m-0">
      <div className="max-w-6xl mx-auto space-y-6 print:max-w-none print:m-0 print:p-0 print:space-y-0">
        {/* Header / Brand */}
        <div className="flex items-center justify-between no-print border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 bg-white rounded-full p-1 border shadow-xs">
              <Image
                src="/logo.png"
                alt="ALARA Logo"
                fill
                className="object-contain p-1"
                priority
              />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                CV. HIKMAT PROTEKSI ALARA
              </h1>
              <p className="text-xs text-slate-500">
                Lembaga Pelatihan Ketenaganukliran Terakreditasi BAPETEN (KTUN No. 07998.722.1.040726)
              </p>
            </div>
          </div>

          <Link
            href="/"
            className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Beranda ALARA
          </Link>
        </div>

        {/* Certificate View If Valid */}
        {isValid && examResult ? (
          <VerifyCertificateView
            certificateNumber={examResult.certificateNumber || decoded}
            participantName={examResult.registration.user.fullName}
            nik={examResult.registration.user.nik}
            instansi={examResult.registration.instansi}
            trainingTitle={examResult.registration.batch.training.title}
            trainingCategory={examResult.registration.batch.training.category}
            batchNumber={examResult.registration.batch.batchNumber}
            startDate={examResult.registration.batch.startDate.toISOString()}
            endDate={examResult.registration.batch.endDate.toISOString()}
            issuedAt={examResult.issuedAt?.toISOString() || null}
            signatory={examResult.signatory}
            qrCodeDataUrl={qrCodeDataUrl}
            customSyllabus={customSyllabus}
            signedCertificateUrl={examResult.signedCertificateUrl}
            signedCertificateName={examResult.signedCertificateName}
          />
        ) : (
          /* Not Found State */
          <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-md border border-red-100 overflow-hidden">
            <div className="p-8 text-center space-y-4">
              <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
                <XCircle className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Sertifikat Tidak Ditemukan
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Nomor sertifikat berikut tidak terdaftar atau belum diterbitkan dalam basis data resmi ALARA:
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 font-mono text-sm font-bold text-red-600 break-all">
                {decoded}
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Pastikan nomor sertifikat diketik dengan benar atau hubungi admin pelatihan jika Anda memerlukan bantuan verifikasi.
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center pt-8 text-xs text-slate-400 space-y-1 no-print">
          <p>
            Sistem Verifikasi E-Sertifikat Ketenaganukliran &mdash; CV. Hikmat Proteksi ALARA
          </p>
          <p>
            Sesuai Standar Mutu Pelatihan BAPETEN & Regulasi Ketenaganukliran Republik Indonesia
          </p>
        </div>
      </div>
    </main>
  );
}
