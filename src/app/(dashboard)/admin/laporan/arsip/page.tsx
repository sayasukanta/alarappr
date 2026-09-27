import { BatchReportListView } from '@/components/admin/BatchReportListView';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Arsip Pelatihan | ALARA Admin',
  description: 'Daftar arsip pelatihan berstatus Selesai dan rekap nilai BAPETEN',
};

export default function ArsipPage() {
  return (
    <BatchReportListView
      status="SELESAI"
      pageTitle="Arsip Pelatihan Selesai"
      pageSubtitle="Daftar arsip batch pelatihan yang telah Selesai diselenggarakan. Klik 'Lihat Peserta' untuk melihat rekapitulasi kelulusan dan nilai BAPETEN."
    />
  );
}
