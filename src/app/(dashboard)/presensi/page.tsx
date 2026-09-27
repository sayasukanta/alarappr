"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle2,
  Clock,
  Camera,
  MapPin,
  AlertCircle,
  Calendar,
  GraduationCap,
  ChevronDown,
  Layers,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { formatDateTime } from "@/lib/utils";

interface AttendanceRecord {
  id: number;
  dayNumber: number;
  sessionType: "MORNING" | "AFTERNOON";
  checkinTime: string | null;
  status: "HADIR" | "IZIN" | "ALPA";
  latitude: number | null;
  longitude: number | null;
}

interface RegistrationInfo {
  id: number;
  batchId: number;
  batchNumber: number;
  trainingTitle: string;
  category: string;
  startDate: string;
  endDate: string;
  location: string;
  durationDays: number;
  registrationStatus: string;
  paymentStatus: string;
}

export default function PresensiPage() {
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);
  const [registrations, setRegistrations] = useState<RegistrationInfo[]>([]);
  const [activeReg, setActiveReg] = useState<RegistrationInfo | null>(null);
  const [hasRegistration, setHasRegistration] = useState(true);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Load attendance
  const fetchAttendance = async (regId?: number) => {
    try {
      setLoading(true);
      const url = regId ? `/api/attendance?registrationId=${regId}` : "/api/attendance";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setAttendances(data);
        } else {
          setAttendances(data.attendances || []);
          setRegistrations(data.registrations || []);
          setActiveReg(data.activeRegistration || null);
          setHasRegistration(data.hasRegistration);
        }
      } else {
        setHasRegistration(false);
      }
    } catch (e) {
      console.error("Error fetching attendance:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const handleSelectBatch = (regIdStr: string) => {
    const regId = parseInt(regIdStr, 10);
    if (!isNaN(regId)) {
      fetchAttendance(regId);
    }
  };

  const handleCheckin = async (dayNumber: number, sessionType: "MORNING" | "AFTERNOON") => {
    if (!activeReg) {
      toast.error("Anda belum terdaftar dalam batch pelatihan manapun.");
      return;
    }

    if (activeReg.registrationStatus !== "APPROVED") {
      toast.error("Pendaftaran batch Anda masih dalam proses verifikasi admin.");
      return;
    }

    setSubmitting(true);
    // Request browser geolocation
    if (!navigator.geolocation) {
      toast.error("Geolocation tidak didukung pada browser ini.");
      setSubmitting(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch("/api/attendance/checkin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              registrationId: activeReg.id,
              dayNumber,
              sessionType,
              latitude,
              longitude,
            }),
          });
          if (res.ok) {
            toast.success(
              `Check-in Hari ke-${dayNumber} (${sessionType === "MORNING" ? "Pagi" : "Siang"}) untuk Batch ${activeReg.batchNumber} berhasil!`
            );
            fetchAttendance(activeReg.id);
          } else {
            const errData = await res.json().catch(() => null);
            toast.error(errData?.error || "Gagal melakukan presensi check-in");
          }
        } catch {
          toast.error("Terjadi gangguan jaringan");
        } finally {
          setSubmitting(false);
        }
      },
      (err) => {
        toast.error(`Akses lokasi GPS ditolak: ${err.message}. Mohon aktifkan izin GPS.`);
        setSubmitting(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const getRecord = (day: number, session: "MORNING" | "AFTERNOON") => {
    return attendances.find((a) => a.dayNumber === day && a.sessionType === session);
  };

  // Generate days dynamic from batch training
  const durationDays = activeReg?.durationDays || 3;
  const days = Array.from({ length: durationDays }, (_, i) => {
    const dayNum = i + 1;
    let dayDateFormatted = "";
    if (activeReg?.startDate) {
      const d = new Date(activeReg.startDate);
      d.setDate(d.getDate() + i);
      dayDateFormatted = d.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }

    let title = `Hari ${dayNum}: Pembelajaran & Praktikum`;
    let desc = "Materi kurikulum proteksi radiasi & evaluasi pembelajaran";
    if (dayNum === 1) {
      title = `Hari 1: Regulasi BAPETEN & Fisika Radiasi`;
      desc = "Dasar Fisika Radiasi, Satuan Dosis, Efek Biologi Radiasi, Perba BAPETEN No. 4/2024";
    } else if (dayNum === 2) {
      title = `Hari 2: Proteksi Spesifik & Alat Ukur Radiasi`;
      desc = "Prinsip ALARA, Detektor Radiasi, Dosimetri Personal (TLD), Peralatan Radiasi Pengion";
    } else if (dayNum === 3) {
      title = `Hari 3: Praktikum Lapangan & Simulasi Ujian BAPETEN`;
      desc = "Praktikum fasilitas, pengisian logbook, review kasus kedaruratan & Tryout CBT";
    } else if (dayNum > 3) {
      title = `Hari ${dayNum}: Pendalaman Kasus & Ujian Komprehensif`;
      desc = "Ujian kompetensi, evaluasi akhir, dan verifikasi sertifikasi";
    }

    return {
      day: dayNum,
      title,
      desc,
      dayDateFormatted,
    };
  });

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Presensi Digital Pelatihan ALARA
          </h1>
          <p className="text-sm text-slate-600">
            Sistem pencatatan kehadiran digital berbasis Geolocation GPS & Verifikasi Sesi Pelatihan
          </p>
        </div>

        {/* Multi-Batch Switcher if participant has multiple registrations */}
        {registrations.length > 1 && (
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-1.5 shadow-sm">
            <Layers className="h-4 w-4 text-blue-600 ml-1.5 shrink-0" />
            <select
              value={activeReg?.id || ""}
              onChange={(e) => handleSelectBatch(e.target.value)}
              className="text-xs bg-white border border-slate-300 rounded px-2.5 py-1.5 font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {registrations.map((r) => (
                <option key={r.id} value={r.id}>
                  Batch {r.batchNumber} - {r.trainingTitle} ({r.registrationStatus})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* No Registration State */}
      {!loading && !hasRegistration && (
        <Card className="p-8 text-center space-y-4 border-dashed border-2 border-slate-300">
          <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto text-amber-600">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-slate-900 text-lg">
              Belum Terdaftar Dalam Batch Pelatihan
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Anda belum memiliki pendaftaran batch pelatihan yang aktif. Silakan pilih dan daftarkan diri Anda pada program pelatihan terlebih dahulu untuk dapat mengisi presensi kehadiran.
            </p>
          </div>
          <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
            <Link href="/pendaftaran">
              Buka Halaman Pendaftaran <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </Card>
      )}

      {/* Active Batch Information Card */}
      {activeReg && (
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50/90 via-indigo-50/50 to-blue-50/90 shadow-sm overflow-hidden">
          <CardContent className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className="bg-blue-600 text-white text-xs font-semibold">
                    Batch {activeReg.batchNumber}
                  </Badge>
                  <Badge variant="outline" className="bg-white/80 text-blue-900 border-blue-300 text-xs">
                    {activeReg.category}
                  </Badge>
                  <span className="font-bold text-slate-900 text-base sm:text-lg">
                    {activeReg.trainingTitle}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-600 pt-1">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    Jadwal: {new Date(activeReg.startDate).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                    })}{" "}
                    s.d.{" "}
                    {new Date(activeReg.endDate).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}{" "}
                    ({activeReg.durationDays} Hari Pelatihan)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    Lokasi: {activeReg.location}
                  </span>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                {activeReg.registrationStatus === "APPROVED" ? (
                  <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-xs px-3 py-1.5 shadow-sm">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Batch Disetujui
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-amber-100 text-amber-900 border border-amber-300 gap-1.5 text-xs px-3 py-1.5">
                    <Clock className="h-3.5 w-3.5 text-amber-700" />
                    Menunggu Verifikasi Admin
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Alert */}
      {hasRegistration && (
        <Alert className="bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-700" />
          <AlertDescription className="text-xs text-amber-900 leading-relaxed">
            Sesuai persyaratan penerbitan Sertifikat Pelatihan ALARA dan pendaftaran Ujian Lisensi BAPETEN, peserta wajib memenuhi presensi kehadiran 100% pada seluruh sesi (Pagi & Siang) selama masa pelatihan batch yang diikuti.
          </AlertDescription>
        </Alert>
      )}

      {/* Grid of Days */}
      {hasRegistration && (
        <div className="space-y-6">
          {days.map((item) => (
            <Card key={item.day} className="border-slate-200 shadow-sm overflow-hidden">
              <CardHeader className="bg-slate-50 border-b py-3 px-5 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    {item.title}
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500 mt-0.5">
                    {item.desc}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="bg-white font-medium">
                    Hari ke-{item.day}
                  </Badge>
                  {item.dayDateFormatted && (
                    <p className="text-[11px] text-slate-500 mt-1 font-mono">
                      {item.dayDateFormatted}
                    </p>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Sesi Pagi */}
                {(() => {
                  const recMorning = getRecord(item.day, "MORNING");
                  return (
                    <div className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col justify-between space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Sesi Pagi (08:30 - 12:00)
                          </span>
                          <p className="text-sm font-semibold text-slate-800">
                            Pembelajaran Teori & Diskusi
                          </p>
                        </div>
                        {recMorning ? (
                          <Badge className="bg-emerald-600 text-white gap-1 text-xs">
                            <CheckCircle2 className="h-3 w-3" /> Hadir
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs text-slate-600">
                            Belum Presensi
                          </Badge>
                        )}
                      </div>

                      {recMorning ? (
                        <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Waktu Check-in:</span>
                            <span className="font-semibold text-slate-800 font-mono">
                              {formatDateTime(recMorning.checkinTime)}
                            </span>
                          </div>
                          {recMorning.latitude && (
                            <div className="flex items-center justify-between text-[11px] text-slate-500">
                              <span>GPS Koordinat:</span>
                              <span className="font-mono">
                                {recMorning.latitude.toFixed(4)}, {recMorning.longitude?.toFixed(4)}
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          disabled={submitting || activeReg?.registrationStatus !== "APPROVED"}
                          onClick={() => handleCheckin(item.day, "MORNING")}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
                        >
                          <Camera className="h-4 w-4" />
                          Check-in Sesi Pagi (GPS)
                        </Button>
                      )}
                    </div>
                  );
                })()}

                {/* Sesi Siang */}
                {(() => {
                  const recAfternoon = getRecord(item.day, "AFTERNOON");
                  return (
                    <div className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col justify-between space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Sesi Siang (13:00 - 17:00)
                          </span>
                          <p className="text-sm font-semibold text-slate-800">
                            Praktikum, Studi Kasus & Review
                          </p>
                        </div>
                        {recAfternoon ? (
                          <Badge className="bg-emerald-600 text-white gap-1 text-xs">
                            <CheckCircle2 className="h-3 w-3" /> Hadir
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs text-slate-600">
                            Belum Presensi
                          </Badge>
                        )}
                      </div>

                      {recAfternoon ? (
                        <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Waktu Check-in:</span>
                            <span className="font-semibold text-slate-800 font-mono">
                              {formatDateTime(recAfternoon.checkinTime)}
                            </span>
                          </div>
                          {recAfternoon.latitude && (
                            <div className="flex items-center justify-between text-[11px] text-slate-500">
                              <span>GPS Koordinat:</span>
                              <span className="font-mono">
                                {recAfternoon.latitude.toFixed(4)}, {recAfternoon.longitude?.toFixed(4)}
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          disabled={submitting || activeReg?.registrationStatus !== "APPROVED"}
                          onClick={() => handleCheckin(item.day, "AFTERNOON")}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
                        >
                          <Camera className="h-4 w-4" />
                          Check-in Sesi Siang (GPS)
                        </Button>
                      )}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
