"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Users,
  CreditCard,
  FileCheck,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { formatCurrency, formatDateTime } from "@/lib/utils";

interface SponsorEmployee {
  id: number;
  fullName: string;
  nik: string;
  email: string;
  program: string;
  batchNumber: number;
  documentStatus: string;
  paymentStatus: string;
  attendanceDays: number;
  bapetenScore: number | null;
  finalStatus: string | null;
  certificateNumber: string | null;
}

export default function SponsorDashboardPage() {
  const [employees, setEmployees] = useState<SponsorEmployee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In real app, fetch from /api/sponsor/employees
    setEmployees([
      {
        id: 1,
        fullName: "Budi Santoso",
        nik: "3172091238910001",
        email: "peserta@alara.co.id",
        program: "PPR Analisis Menggunakan Radiasi Pengion",
        batchNumber: 1,
        documentStatus: "APPROVED",
        paymentStatus: "PAID",
        attendanceDays: 3,
        bapetenScore: 88.5,
        finalStatus: "LULUS",
        certificateNumber: "CERT/ALARA/PPR-ANALISIS/2026/B1/008",
      },
      {
        id: 2,
        fullName: "Ahmad Fauzi",
        nik: "3275012398710003",
        email: "fauzi@medikaradiasi.com",
        program: "PPR Analisis Menggunakan Radiasi Pengion",
        batchNumber: 1,
        documentStatus: "APPROVED",
        paymentStatus: "PAID",
        attendanceDays: 3,
        bapetenScore: 84.0,
        finalStatus: "LULUS",
        certificateNumber: "CERT/ALARA/PPR-ANALISIS/2026/B1/009",
      },
      {
        id: 3,
        fullName: "Dewi Lestari",
        nik: "3174098712340005",
        email: "dewi@medikaradiasi.com",
        program: "PPR Analisis Menggunakan Radiasi Pengion",
        batchNumber: 1,
        documentStatus: "APPROVED",
        paymentStatus: "PAID",
        attendanceDays: 2,
        bapetenScore: null,
        finalStatus: null,
        certificateNumber: null,
      },
    ]);
    setLoading(false);
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">
              Dashboard Instansi / Perusahaan Sponsor
            </h1>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              PT Medika Radiasi
            </Badge>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            NPWP Perusahaan: 01.234.567.8-901.000 | Monitoring Peserta Kolektif & Laporan Kelulusan BAPETEN
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success("Faktur pajak resmi dan invoice kolektif sedang diunduh...")}
            className="gap-1.5"
          >
            <Download className="h-4 w-4" /> Unduh Faktur & Invoice
          </Button>
          <Button
            size="sm"
            onClick={() => toast.success("Mempersiapkan ekspor laporan progress peserta sponsor (PDF)...")}
            className="bg-blue-600 text-white gap-1.5"
          >
            <Download className="h-4 w-4" /> Ekspor Laporan BAPETEN
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Total Karyawan Dikirim</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">3 Peserta</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">PPR Analisis Batch 1</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Status Pembayaran</p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-1">LUNAS</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Total: {formatCurrency(21000000)}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CreditCard className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Kelulusan Ujian BAPETEN</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">2 / 2 Lulus</h3>
              <p className="text-[11px] text-emerald-600 font-medium mt-0.5">100% Tingkat Kelulusan</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">E-Sertifikat Terbit</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">2 Sertifikat</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Siap diunduh HRD</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
              <FileCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employee List Table */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="border-b bg-slate-50 py-4 px-6 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-slate-800">
              Daftar Karyawan Terdaftar (Sponsorship PT Medika Radiasi)
            </CardTitle>
            <CardDescription className="text-xs">
              Pelacakan status berkas administrasi, presensi harian, dan hasil lisensi resmi BAPETEN
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 border-b text-slate-600 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">No</th>
                <th className="py-3 px-4">Nama Karyawan</th>
                <th className="py-3 px-4">NIK KTP</th>
                <th className="py-3 px-4">Program Pelatihan</th>
                <th className="py-3 px-4">Presensi</th>
                <th className="py-3 px-4">Nilai BAPETEN</th>
                <th className="py-3 px-4">Status Lisensi</th>
                <th className="py-3 px-4">Sertifikat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employees.map((emp, idx) => (
                <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 text-slate-400 font-medium">{idx + 1}</td>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-slate-900">{emp.fullName}</p>
                    <p className="text-[11px] text-slate-500">{emp.email}</p>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">{emp.nik}</td>
                  <td className="py-3 px-4 text-slate-700">
                    <p className="font-medium">{emp.program}</p>
                    <p className="text-[11px] text-slate-500">Batch {emp.batchNumber}</p>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="outline" className="bg-white">
                      {emp.attendanceDays} / 3 Hari
                    </Badge>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-800">
                    {emp.bapetenScore !== null ? emp.bapetenScore : "-"}
                  </td>
                  <td className="py-3 px-4">
                    {emp.finalStatus === "LULUS" ? (
                      <Badge className="bg-emerald-600 text-white text-[11px]">
                        LULUS LISENSI
                      </Badge>
                    ) : emp.finalStatus === "REMIDIAL" ? (
                      <Badge className="bg-amber-500 text-white text-[11px]">
                        REMIDIAL
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[11px]">
                        Sedang Berjalan
                      </Badge>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {emp.certificateNumber ? (
                      <a
                        href={`/verify/${emp.certificateNumber}`}
                        target="_blank"
                        className="text-blue-600 hover:underline flex items-center gap-1 font-medium"
                      >
                        Lihat E-Cert
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
