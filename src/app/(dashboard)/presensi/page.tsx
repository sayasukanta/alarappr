"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, Clock, Camera, MapPin, AlertCircle, Calendar } from "lucide-react";
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

export default function PresensiPage() {
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Load attendance
  const fetchAttendance = async () => {
    try {
      const res = await fetch("/api/attendance");
      if (res.ok) {
        const data = await res.json();
        setAttendances(data);
      } else {
        // Fallback demo data
        setAttendances([
          {
            id: 1,
            dayNumber: 1,
            sessionType: "MORNING",
            checkinTime: "2026-10-15T08:15:00Z",
            status: "HADIR",
            latitude: -6.2297,
            longitude: 106.8295,
          },
          {
            id: 2,
            dayNumber: 1,
            sessionType: "AFTERNOON",
            checkinTime: "2026-10-15T12:55:00Z",
            status: "HADIR",
            latitude: -6.2297,
            longitude: 106.8295,
          },
          {
            id: 3,
            dayNumber: 2,
            sessionType: "MORNING",
            checkinTime: "2026-10-16T08:20:00Z",
            status: "HADIR",
            latitude: -6.2297,
            longitude: 106.8295,
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
    fetchAttendance();
  }, []);

  const handleCheckin = async (dayNumber: number, sessionType: "MORNING" | "AFTERNOON") => {
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
              dayNumber,
              sessionType,
              latitude,
              longitude,
            }),
          });
          if (res.ok) {
            toast.success(`Check-in Hari ke-${dayNumber} (${sessionType === "MORNING" ? "Pagi" : "Siang"}) berhasil!`);
            fetchAttendance();
          } else {
            toast.error("Gagal melakukan presensi check-in");
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

  const days = [
    {
      day: 1,
      title: "Hari 1: Regulasi BAPETEN & Fisika Radiasi",
      desc: "Dasar Fisika Radiasi, Satuan Dosis, Efek Biologi Radiasi, Perba BAPETEN No. 4/2024",
    },
    {
      day: 2,
      title: "Hari 2: Proteksi Spesifik & Alat Ukur Radiasi",
      desc: "Prinsip ALARA, Detektor Radiasi, Dosimetri Personal (TLD), Peralatan Radiasi Pengion",
    },
    {
      day: 3,
      title: "Hari 3: Praktikum Lapangan & Simulasi Ujian BAPETEN",
      desc: "Praktikum fasilitas, pengisian logbook, review kasus kedaruratan & Tryout CBT",
    },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Presensi Digital 3 Hari Pelatihan ALARA
        </h1>
        <p className="text-sm text-slate-600">
          Sistem pencatatan kehadiran digital berbasis Geolocation GPS & Verifikasi Sesi Pelatihan
        </p>
      </div>

      <Alert className="bg-amber-50 border-amber-200">
        <AlertCircle className="h-4 w-4 text-amber-700" />
        <AlertDescription className="text-xs text-amber-900 leading-relaxed">
          Sesuai persyaratan penerbitan Sertifikat Pelatihan ALARA dan pendaftaran Ujian Lisensi BAPETEN, peserta wajib memenuhi presensi kehadiran 100% pada seluruh sesi (Pagi & Siang) selama 3 hari masa pelatihan.
        </AlertDescription>
      </Alert>

      {/* Grid of 3 Days */}
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
              <Badge variant="outline" className="bg-white">
                Hari ke-{item.day}
              </Badge>
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
                        disabled={submitting}
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
                        disabled={submitting}
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
    </div>
  );
}
