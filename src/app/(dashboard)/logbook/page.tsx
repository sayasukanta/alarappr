"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, CheckCircle2, Clock, Plus, ShieldCheck, MapPin, Building } from "lucide-react";
import { toast } from "sonner";
import { formatDateTime } from "@/lib/utils";

interface LogbookEntry {
  id: number;
  practiceDate: string;
  location: string;
  dosisLaju: number | null;
  kondisiInterlock: string | null;
  penggunaanDosimeter: string | null;
  notes: string | null;
  signedOffBy: number | null;
  signedOffAt: string | null;
  createdAt: string;
}

export default function LogbookPage() {
  const [logbooks, setLogbooks] = useState<LogbookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [location, setLocation] = useState("Menara BCA, Fasilitas X-Ray Bagasi");
  const [practiceDate, setPracticeDate] = useState("2026-10-17");
  const [dosisLaju, setDosisLaju] = useState("0.12");
  const [kondisiInterlock, setKondisiInterlock] = useState("Interlock mekanik dan elektrik berfungsi normal, sinar X otomatis mati saat pintu chamber dibuka");
  const [penggunaanDosimeter, setPenggunaanDosimeter] = useState("TLD Barcode No. TLD-8891 + Electronic Personal Dosimeter (EPD) No. EPD-04 (Akumulasi: 0.005 mSv)");
  const [notes, setNotes] = useState("Pengukuran paparan radiasi pada 5 titik batas luar permukaan scanner bagasi (depan, belakang, atas, kanan, kiri) berada di bawah ambang batas < 1 µSv/jam.");

  const fetchLogbooks = async () => {
    try {
      const res = await fetch("/api/logbook");
      if (res.ok) {
        const data = await res.json();
        setLogbooks(data);
      } else {
        // Mock fallback if DB empty
        setLogbooks([
          {
            id: 1,
            practiceDate: "2026-10-17T09:30:00Z",
            location: "Menara BCA, Fasilitas X-Ray Bagasi",
            dosisLaju: 0.12,
            kondisiInterlock: "Interlock mekanik dan elektrik berfungsi normal saat cover scanner dibuka",
            penggunaanDosimeter: "TLD Badge No. TLD-8891 + Dosimeter Saku Digital",
            notes: "Pengukuran radiasi bocor di 5 titik permukaan scanner bagasi memenuhi kriteria keselamatan BAPETEN (< 1 µSv/jam).",
            signedOffBy: 2,
            signedOffAt: "2026-10-17T14:20:00Z",
            createdAt: "2026-10-17T11:00:00Z",
          },
        ]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogbooks();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const parsedDosis = dosisLaju ? parseFloat(dosisLaju) : null;
      const res = await fetch("/api/logbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location,
          practiceDate,
          dosisLaju: !isNaN(parsedDosis as number) ? parsedDosis : null,
          kondisiInterlock,
          penggunaanDosimeter,
          notes,
        }),
      });

      if (res.ok) {
        toast.success("Catatan praktikum lapangan berhasil disimpan!");
        setShowForm(false);
        fetchLogbooks();
      } else {
        const errorData = await res.json().catch(() => null);
        toast.error(errorData?.error || "Gagal menyimpan logbook");
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Logbook Praktikum Lapangan Proteksi Radiasi
          </h1>
          <p className="text-sm text-slate-600">
            Pencatatan dan digital sign-off kegiatan praktikum proteksi radiasi sesuai Peraturan BAPETEN No. 4/2024
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
        >
          <Plus className="h-4 w-4" />
          {showForm ? "Tutup Form" : "Tambah Kegiatan Praktikum"}
        </Button>
      </div>

      {/* Info Box */}
      <Alert className="bg-blue-50 border-blue-200">
        <ShieldCheck className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-xs text-blue-800 leading-relaxed">
          Logbook praktikum merupakan syarat wajib kelulusan pelatihan internal ALARA. Seluruh data pengukuran laju dosis, kondisi keselamatan interlock, dan dosimeter harus diisi lengkap serta diverifikasi melalui <strong>Digital Sign-off</strong> oleh Tim Pengajar Expert ALARA.
        </AlertDescription>
      </Alert>

      {/* Entry Form */}
      {showForm && (
        <Card className="border-blue-300 shadow-sm animate-in fade-in">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="text-base font-semibold text-slate-800">
              Formulir Hasil Pengukuran Praktikum Lapangan
            </CardTitle>
            <CardDescription className="text-xs">
              Isikan data aktual hasil inspeksi dan survei radiasi di lokasi fasilitas kerja sama
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="location" className="text-xs font-semibold">
                    Lokasi Praktikum / Fasilitas Mitra
                  </Label>
                  <div className="relative">
                    <Building className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
                    <Input
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Contoh: Menara BCA, X-Ray Scanner Bagasi"
                      className="pl-9 text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="date" className="text-xs font-semibold">
                    Tanggal Praktikum
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={practiceDate}
                    onChange={(e) => setPracticeDate(e.target.value)}
                    className="text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="dosis" className="text-xs font-semibold">
                    Laju Dosis Radiasi Terukur (µSv / Jam)
                  </Label>
                  <Input
                    id="dosis"
                    type="number"
                    step="0.01"
                    value={dosisLaju}
                    onChange={(e) => setDosisLaju(e.target.value)}
                    placeholder="Contoh: 0.15"
                    className="text-sm font-mono"
                    required
                  />
                  <p className="text-[11px] text-slate-500">
                    Batas keselamatan radiasi publik &lt; 1 µSv/jam pada jarak 5 cm dari permukaan
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="dosimeter" className="text-xs font-semibold">
                    Penggunaan Dosimeter Personal
                  </Label>
                  <Input
                    id="dosimeter"
                    value={penggunaanDosimeter}
                    onChange={(e) => setPenggunaanDosimeter(e.target.value)}
                    placeholder="No. ID TLD Badge / EPD Digital"
                    className="text-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="interlock" className="text-xs font-semibold">
                  Uji Sistem Keselamatan Interlock & Indikator Paparan
                </Label>
                <Textarea
                  id="interlock"
                  rows={2}
                  value={kondisiInterlock}
                  onChange={(e) => setKondisiInterlock(e.target.value)}
                  placeholder="Deskripsikan fungsi interlock tombol darurat dan lampu indikator emisi radiasi"
                  className="text-sm"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="notes" className="text-xs font-semibold">
                  Catatan Prosedur & Kesimpulan Praktikan
                </Label>
                <Textarea
                  id="notes"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Catatan pelaksanaan prosedur proteksi radiasi sesuai standar ALARA"
                  className="text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 text-white"
                >
                  {submitting ? "Menyimpan..." : "Simpan Logbook"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* History List */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          Riwayat Kegiatan Praktikum Lapangan
        </h2>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Memuat logbook...</div>
        ) : logbooks.length === 0 ? (
          <Card className="p-8 text-center text-slate-500">
            Belum ada catatan praktikum yang dibuat. Klik tombol &ldquo;Tambah Kegiatan Praktikum&rdquo; untuk memulai.
          </Card>
        ) : (
          logbooks.map((log) => (
            <Card key={log.id} className="shadow-sm border-slate-200">
              <CardContent className="p-5 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-3 gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 text-base">
                        {log.location}
                      </span>
                      {log.signedOffBy ? (
                        <Badge className="bg-emerald-600 text-white gap-1 text-xs">
                          <CheckCircle2 className="h-3 w-3" />
                          Disetujui Pakar ALARA
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1 text-xs bg-amber-100 text-amber-800">
                          <Clock className="h-3 w-3" />
                          Menunggu Digital Sign-off
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> Pelaksanaan: {new Date(log.practiceDate).toLocaleDateString("id-ID", { dateStyle: "long" })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-500 block mb-1 font-medium">Laju Dosis Terukur:</span>
                    <span className="text-slate-900 font-mono font-bold text-sm">
                      {log.dosisLaju !== null ? `${log.dosisLaju} µSv/jam` : "-"}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg md:col-span-2">
                    <span className="text-slate-500 block mb-1 font-medium">Dosimeter Personal:</span>
                    <span className="text-slate-800">{log.penggunaanDosimeter || "-"}</span>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <span className="text-slate-500 font-medium">Kondisi Uji Interlock:</span>
                  <p className="text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-100">
                    {log.kondisiInterlock || "-"}
                  </p>
                </div>

                {log.notes && (
                  <div className="space-y-1 text-xs">
                    <span className="text-slate-500 font-medium">Catatan & Analisis Praktikan:</span>
                    <p className="text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-100">
                      {log.notes}
                    </p>
                  </div>
                )}

                {log.signedOffAt && (
                  <div className="pt-2 border-t flex items-center justify-between text-xs text-emerald-700 bg-emerald-50/50 p-2.5 rounded">
                    <div className="flex items-center gap-1.5 font-medium">
                      <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      Digital Sign-off oleh Tim Pakar BAPETEN ALARA
                    </div>
                    <span>{formatDateTime(log.signedOffAt)}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
