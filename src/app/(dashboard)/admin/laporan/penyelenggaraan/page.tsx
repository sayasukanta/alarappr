import { BatchReportListView } from '@/components/admin/BatchReportListView';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Penyelenggaraan Pelatihan | ALARA Admin',
  description: 'Daftar penyelenggaraan pelatihan berstatus Pelaksanaan dan rekap nilai BAPETEN',
};

export default function PenyelenggaraanPage() {
  return (
    <BatchReportListView
      status="PELAKSANAAN"
      pageTitle="Penyelenggaraan Pelatihan"
      pageSubtitle="Daftar batch pelatihan yang sedang dalam tahap Pelaksanaan. Klik 'Lihat Peserta' untuk memantau rekap kelulusan dan menginput nilai BAPETEN."
    />
  );
}
