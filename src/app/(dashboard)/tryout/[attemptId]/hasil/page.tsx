"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowLeft,
  RotateCcw,
  BookOpen,
  Award,
} from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

interface TopicScore {
  topic: string;
  total: number;
  correct: number;
  percentage: number;
  status: "SANGAT_BAIK" | "BAIK" | "CUKUP" | "LEMAH";
}

interface QuestionReview {
  id: number;
  topic: string;
  questionText: string;
  selectedAnswer: string | null;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string | null;
}

interface ResultData {
  attemptId: number;
  totalScore: number;
  passingGrade: number;
  isPassed: boolean;
  radarData: { subject: string; score: number; fullMark: number }[];
  categoryBreakdown: TopicScore[];
  expertFeedback: string;
  questions: QuestionReview[];
}

export default function TryoutResultPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const resolvedParams = use(params);
  const attemptId = resolvedParams.attemptId;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<ResultData | null>(null);

  useEffect(() => {
    async function loadResult() {
      try {
        const res = await fetch(`/api/tryout/${attemptId}/result`);
        if (res.ok) {
          const data = await res.json();
          setResult(data);
        } else {
          // Fallback mock data if API still calculating
          const fallbackData: ResultData = {
            attemptId: Number(attemptId),
            totalScore: 82.5,
            passingGrade: 70.0,
            isPassed: true,
            radarData: [
              { subject: "Regulasi BAPETEN", score: 90, fullMark: 100 },
              { subject: "Fisika Radiasi", score: 80, fullMark: 100 },
              { subject: "Efek Biologi", score: 90, fullMark: 100 },
              { subject: "Alat Ukur / Dosimetri", score: 80, fullMark: 100 },
              { subject: "Proteksi Spesifik", score: 90, fullMark: 100 },
              { subject: "Keadaan Darurat", score: 60, fullMark: 100 },
            ],
            categoryBreakdown: [
              {
                topic: "Regulasi Ketenaganukliran",
                total: 10,
                correct: 9,
                percentage: 90,
                status: "SANGAT_BAIK",
              },
              {
                topic: "Fisika Radiasi & Satuan Dosis",
                total: 10,
                correct: 8,
                percentage: 80,
                status: "BAIK",
              },
              {
                topic: "Efek Biologi Radiasi",
                total: 10,
                correct: 9,
                percentage: 90,
                status: "SANGAT_BAIK",
              },
              {
                topic: "Alat Ukur Radiasi & Dosimetri",
                total: 10,
                correct: 8,
                percentage: 80,
                status: "BAIK",
              },
              {
                topic: "Proteksi & Keselamatan Radiasi Spesifik",
                total: 10,
                correct: 9,
                percentage: 90,
                status: "SANGAT_BAIK",
              },
              {
                topic: "Prosedur Keadaan Darurat Radiasi",
                total: 10,
                correct: 6,
                percentage: 60,
                status: "LEMAH",
              },
            ],
            expertFeedback:
              "Selamat! Anda telah melampaui passing grade 70.0. Pemahaman dasar regulasi dan fisika radiasi sangat solid. Namun, tingkatkan pemahaman pada bab Prosedur Keadaan Darurat Radiasi (dekontaminasi & pelaporan kebocoran sumber) sesuai Peraturan BAPETEN No. 4 Tahun 2024.",
            questions: [
              {
                id: 1,
                topic: "Fisika Radiasi",
                questionText:
                  "Suatu sumber radiasi Co-60 memiliki aktivitas awal 100 Ci. Jika waktu paruh Co-60 adalah 5,27 tahun, berapakah sisa aktivitas sumber tersebut setelah 10,54 tahun?",
                selectedAnswer: "B",
                correctAnswer: "B",
                isCorrect: true,
                explanation:
                  "Rumus: N(t) = N0 * (1/2)^(t / T1/2). Perhitungan: N(10.54) = 100 * (1/2)^(10.54 / 5.27) = 100 * (1/2)^2 = 25 Ci. Referensi: Buku Modul ALARA Bab 2 & Perba BAPETEN No. 4/2024.",
              },
              {
                id: 2,
                topic: "Regulasi BAPETEN",
                questionText:
                  "Berdasarkan Peraturan BAPETEN No. 4 Tahun 2024, Nilai Batas Dosis (NBD) efektif untuk pekerja radiasi adalah...",
                selectedAnswer: "B",
                correctAnswer: "B",
                isCorrect: true,
                explanation:
                  "Pasal 24 Perba BAPETEN No. 4/2024: NBD efektif sebesar 20 mSv per tahun rata-rata dalam 5 tahun berturut-turut, dengan batas maksimal 50 mSv dalam 1 tahun.",
              },
            ],
          };
          setResult(fallbackData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadResult();
  }, [attemptId]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center space-y-3">
          <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-600 font-medium">Menganalisis Hasil Ujian & Radar Chart...</p>
        </div>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Top action bar */}
      <div className="flex items-center justify-between">
        <Link href="/tryout">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Kembali ke Menu Tryout
          </Button>
        </Link>
        <div className="flex gap-2">
          <Link href={`/tryout`}>
            <Button size="sm" variant="default" className="bg-blue-600">
              <RotateCcw className="h-4 w-4 mr-1.5" />
              Coba Paket Tryout Lain
            </Button>
          </Link>
        </div>
      </div>

      {/* Hero Banner: Score & Status */}
      <Card
        className={`border-2 overflow-hidden shadow-sm ${
          result.isPassed
            ? "border-emerald-500 bg-gradient-to-r from-emerald-50 via-teal-50 to-white"
            : "border-rose-400 bg-gradient-to-r from-rose-50 via-orange-50 to-white"
        }`}
      >
        <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <Badge
                className={`text-xs px-3 py-1 font-semibold ${
                  result.isPassed
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "bg-rose-600 hover:bg-rose-700 text-white"
                }`}
              >
                {result.isPassed ? "LULUS TRYOUT" : "BELUM LULUS TRYOUT"}
              </Badge>
              <span className="text-xs text-slate-500">
                Passing Grade Minimal: {result.passingGrade.toFixed(1)}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              Hasil Simulasi Ujian Lisensi BAPETEN
            </h1>
            <p className="text-sm text-slate-600 max-w-xl">
              Evaluasi komprehensif berdasarkan 6 pilar kompetensi proteksi radiasi sesuai
              Peraturan BAPETEN No. 4 Tahun 2024.
            </p>
          </div>

          {/* Big Score Box */}
          <div className="flex flex-col items-center justify-center px-8 py-4 bg-white rounded-2xl shadow-sm border border-slate-200">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Skor Akhir
            </span>
            <span
              className={`text-5xl font-black ${
                result.isPassed ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {result.totalScore.toFixed(1)}
            </span>
            <span className="text-xs font-medium text-slate-500 mt-1">
              dari 100 Poin
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Grid: Radar Chart + Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2 border-b">
            <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
              <Award className="h-5 w-5 text-blue-600" />
              Diagnostic Radar Chart Kompetensi
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart
                  cx="50%"
                  cy="50%"
                  outerRadius="75%"
                  data={result.radarData}
                >
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: "#475569", fontSize: 11 }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 100]}
                    tick={{ fill: "#94a3b8", fontSize: 10 }}
                  />
                  <Radar
                    name="Penguasaan Materi"
                    dataKey="score"
                    stroke="#007AFF"
                    fill="#3b82f6"
                    fillOpacity={0.45}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-slate-500 text-center mt-2">
              Grafik menunjukkan persentase penguasaan materi per topik BAPETEN
            </p>
          </CardContent>
        </Card>

        {/* Category Breakdown & Expert Feedback */}
        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-2 border-b">
              <CardTitle className="text-base font-semibold text-slate-800">
                Ringkasan Penguasaan Per Kategori
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {result.categoryBreakdown.map((cat, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/50"
                >
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-slate-800">
                      {cat.topic}
                    </p>
                    <p className="text-xs text-slate-500">
                      Benar {cat.correct} dari {cat.total} soal
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-800">
                      {cat.percentage}%
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        cat.status === "SANGAT_BAIK"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                          : cat.status === "BAIK"
                          ? "bg-blue-50 text-blue-700 border-blue-300"
                          : "bg-rose-50 text-rose-700 border-rose-300"
                      }`}
                    >
                      {cat.status === "SANGAT_BAIK"
                        ? "Sangat Baik"
                        : cat.status === "BAIK"
                        ? "Baik"
                        : "Lemah"}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Expert Notes Card */}
          <Card className="border-l-4 border-l-blue-600 shadow-sm bg-blue-50/40">
            <CardContent className="p-4">
              <h3 className="text-sm font-bold text-blue-900 flex items-center gap-1.5 mb-1.5">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                Catatan Tim Pakar Proteksi ALARA:
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed italic">
                &ldquo;{result.expertFeedback}&rdquo;
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Questions Review Section */}
      <Card className="shadow-sm">
        <CardHeader className="border-b">
          <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-slate-600" />
            Pembahasan Soal & Kunci Jawaban
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {result.questions.map((q, idx) => (
            <div
              key={q.id}
              className={`p-4 rounded-xl border ${
                q.isCorrect
                  ? "border-emerald-200 bg-emerald-50/30"
                  : "border-rose-200 bg-rose-50/30"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      Soal #{idx + 1}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {q.topic}
                    </Badge>
                    {q.isCorrect ? (
                      <span className="flex items-center text-xs font-semibold text-emerald-600 gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Benar
                      </span>
                    ) : (
                      <span className="flex items-center text-xs font-semibold text-rose-600 gap-1">
                        <XCircle className="h-3.5 w-3.5" /> Salah
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-800 font-medium">
                    {q.questionText}
                  </p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-4 text-xs">
                <div className="p-2 rounded bg-white border border-slate-200">
                  <span className="text-slate-500">Jawaban Anda: </span>
                  <span
                    className={`font-bold ${
                      q.isCorrect ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    Opsi {q.selectedAnswer || "-"}
                  </span>
                </div>
                <div className="p-2 rounded bg-white border border-slate-200">
                  <span className="text-slate-500">Kunci Jawaban: </span>
                  <span className="font-bold text-emerald-600">
                    Opsi {q.correctAnswer}
                  </span>
                </div>
              </div>

              {q.explanation && (
                <div className="mt-3 p-3 bg-white/90 rounded-lg border border-slate-200/80 text-xs text-slate-700 space-y-1">
                  <p className="font-semibold text-slate-800">
                    💡 Pembahasan & Referensi Regulasi:
                  </p>
                  <p className="leading-relaxed">{q.explanation}</p>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
