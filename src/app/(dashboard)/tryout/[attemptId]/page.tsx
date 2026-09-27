"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Clock,
  AlertTriangle,
  Calculator,
  ChevronLeft,
  ChevronRight,
  Send,
  Flag,
  Maximize2,
} from "lucide-react";
import ScientificCalculator from "@/components/ScientificCalculator";
import { toast } from "sonner";

interface QuestionItem {
  id: number;
  category: string;
  topic: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  optionE?: string | null;
}

interface AttemptData {
  id: number;
  startedAt: string;
  durationMinutes: number;
  tabSwitchCount: number;
  questions: QuestionItem[];
  answers: Record<number, string>;
  marked: Record<number, boolean>;
}

export default function TryoutExamPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const resolvedParams = use(params);
  const attemptId = resolvedParams.attemptId;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState<AttemptData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [marked, setMarked] = useState<Record<number, boolean>>({});
  const [timeLeft, setTimeLeft] = useState(60 * 60); // 60 mins default
  const [tabSwitches, setTabSwitches] = useState(0);
  const [showCalculator, setShowCalculator] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch attempt and questions
  useEffect(() => {
    async function loadAttempt() {
      try {
        const res = await fetch(`/api/tryout/${attemptId}`);
        if (!res.ok) {
          // If attempt endpoint not ready, fetch general attempt info
          toast.error("Gagal memuat sesi tryout");
          return;
        }
        const data = await res.json();
        setAttempt(data);
        setAnswers(data.answers || {});
        setMarked(data.marked || {});
        setTabSwitches(data.tabSwitchCount || 0);

        // calculate remaining time
        if (data.startedAt) {
          const start = new Date(data.startedAt).getTime();
          const duration = (data.durationMinutes || 60) * 60 * 1000;
          const end = start + duration;
          const remaining = Math.max(0, Math.floor((end - Date.now()) / 1000));
          setTimeLeft(remaining);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAttempt();
  }, [attemptId]);

  // Submit attempt
  const handleSubmit = useCallback(
    async (isForced = false) => {
      if (submitting) return;
      setSubmitting(true);
      try {
        const res = await fetch(`/api/tryout/${attemptId}/submit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isForced }),
        });
        if (res.ok) {
          toast.success(
            isForced
              ? "Ujian otomatis diselesaikan karena pelanggaran tab/waktu habis."
              : "Tryout berhasil diselesaikan!"
          );
          router.push(`/tryout/${attemptId}/hasil`);
        } else {
          toast.error("Gagal menyelesaikan tryout");
          setSubmitting(false);
        }
      } catch (err) {
        console.error(err);
        setSubmitting(false);
      }
    },
    [attemptId, router, submitting]
  );

  // Anti-cheating: detect tab switches
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.hidden) {
        setTabSwitches((prev) => {
          const next = prev + 1;
          toast.warning(`Peringatan: Berpindah tab terdeteksi! (${next}/3)`, {
            description:
              next >= 3
                ? "Batas maksimal perpindahan layar tercapai. Ujian akan disubmit otomatis!"
                : "Dilarang membuka tab atau aplikasi lain selama ujian.",
          });

          // Sync tab switch to server
          fetch(`/api/tryout/${attemptId}/tab-switch`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ count: next }),
          }).catch(console.error);

          if (next >= 3) {
            handleSubmit(true);
          }
          return next;
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [attemptId, handleSubmit]);

  // Anti copy-paste & right click
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey &&
          ["c", "v", "p", "s", "u"].includes(e.key.toLowerCase())) ||
        e.key === "F12"
      ) {
        e.preventDefault();
      }
    };

    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Timer countdown
  useEffect(() => {
    if (loading || timeLeft <= 0) {
      if (timeLeft <= 0 && !loading && !submitting) {
        handleSubmit(true);
      }
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [loading, timeLeft, handleSubmit, submitting]);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const handleSelectAnswer = async (questionId: number, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
    try {
      await fetch(`/api/tryout/${attemptId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId,
          selectedAnswer: answer,
          isMarked: !!marked[questionId],
        }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const toggleMarked = async (questionId: number) => {
    const nextVal = !marked[questionId];
    setMarked((prev) => ({ ...prev, [questionId]: nextVal }));
    try {
      await fetch(`/api/tryout/${attemptId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId,
          selectedAnswer: answers[questionId] || null,
          isMarked: nextVal,
        }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const requestFullscreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center space-y-3">
          <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-600 font-medium">Memuat Soal Tryout BAPETEN...</p>
        </div>
      </div>
    );
  }

  const questions = attempt?.questions || [];
  const currentQ = questions[currentIndex];

  if (!currentQ) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">Soal tidak ditemukan untuk sesi ini.</p>
        <Button onClick={() => router.push("/tryout")} className="mt-4">
          Kembali ke Tryout
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col select-none">
      {/* Top Bar */}
      <header className="bg-slate-900 text-white px-6 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-4">
          <div className="bg-blue-600 px-3 py-1 rounded font-bold tracking-wider text-sm">
            ALARA CBT
          </div>
          <div>
            <h1 className="font-semibold text-sm md:text-base">
              Simulasi Ujian Lisensi BAPETEN
            </h1>
            <p className="text-xs text-slate-400">
              Sesuai Standar Kompetensi Perba BAPETEN No. 4/2024
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Tab Switch warning badge */}
          {tabSwitches > 0 && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Tab Switch: {tabSwitches}/3
            </Badge>
          )}

          {/* Calculator toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCalculator(!showCalculator)}
            className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700"
          >
            <Calculator className="h-4 w-4 mr-1 text-blue-400" />
            Kalkulator
          </Button>

          {/* Fullscreen button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={requestFullscreen}
            className="text-slate-300 hover:text-white"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>

          {/* Countdown Timer */}
          <div
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg font-mono font-bold text-base ${
              timeLeft < 300
                ? "bg-red-600 text-white animate-pulse"
                : timeLeft < 600
                ? "bg-amber-600 text-white"
                : "bg-slate-800 text-emerald-400 border border-slate-700"
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>{formatTimer(timeLeft)}</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row p-4 gap-4 max-w-7xl w-full mx-auto">
        {/* Left: Question area (75%) */}
        <div className="flex-1 flex flex-col gap-4">
          <Card className="flex-1 shadow-sm border-slate-200 flex flex-col">
            <div className="p-4 border-b flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="text-sm font-semibold">
                  Soal No. {currentIndex + 1} dari {questions.length}
                </Badge>
                <Badge variant="outline" className="text-xs text-blue-600 border-blue-200">
                  {currentQ.topic}
                </Badge>
              </div>
              <Button
                variant={marked[currentQ.id] ? "default" : "outline"}
                size="sm"
                onClick={() => toggleMarked(currentQ.id)}
                className={
                  marked[currentQ.id]
                    ? "bg-amber-500 hover:bg-amber-600 text-white gap-1"
                    : "text-amber-600 border-amber-300 hover:bg-amber-50 gap-1"
                }
              >
                <Flag className="h-3.5 w-3.5" />
                {marked[currentQ.id] ? "Ditandai Ragu-ragu" : "Ragu-ragu"}
              </Button>
            </div>

            <CardContent className="p-6 flex-1 flex flex-col justify-between">
              {/* Question Text */}
              <div className="space-y-6">
                <div className="text-base md:text-lg font-medium text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {currentQ.questionText}
                </div>

                {/* Options */}
                <div className="space-y-3">
                  {[
                    { key: "A", text: currentQ.optionA },
                    { key: "B", text: currentQ.optionB },
                    { key: "C", text: currentQ.optionC },
                    { key: "D", text: currentQ.optionD },
                    ...(currentQ.optionE
                      ? [{ key: "E", text: currentQ.optionE }]
                      : []),
                  ].map((opt) => {
                    const isSelected = answers[currentQ.id] === opt.key;
                    return (
                      <div
                        key={opt.key}
                        onClick={() => handleSelectAnswer(currentQ.id, opt.key)}
                        className={`flex items-start p-3.5 rounded-lg border cursor-pointer transition-all ${
                          isSelected
                            ? "border-blue-600 bg-blue-50/70 shadow-sm"
                            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <div
                          className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5 shrink-0 transition-colors ${
                            isSelected
                              ? "bg-blue-600 text-white"
                              : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {opt.key}
                        </div>
                        <span className="text-slate-800 text-sm md:text-base leading-relaxed">
                          {opt.text}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="pt-6 border-t mt-6 flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Sebelumnya
                </Button>

                {currentIndex < questions.length - 1 ? (
                  <Button
                    onClick={() =>
                      setCurrentIndex((prev) =>
                        Math.min(questions.length - 1, prev + 1)
                      )
                    }
                  >
                    Selanjutnya
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleSubmit(false)}
                    disabled={submitting}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <Send className="h-4 w-4 mr-1" />
                    Selesai & Kumpulkan
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Question Grid & Summary (25%) */}
        <div className="w-full md:w-80 flex flex-col gap-4">
          <Card className="shadow-sm border-slate-200">
            <div className="p-4 border-b font-semibold text-slate-800 text-sm flex items-center justify-between">
              <span>Navigasi Soal</span>
              <span className="text-xs text-slate-500">
                {Object.keys(answers).length}/{questions.length} Terjawab
              </span>
            </div>
            <CardContent className="p-4">
              <div className="grid grid-cols-5 gap-2">
                {questions.map((q, idx) => {
                  const isCurrent = idx === currentIndex;
                  const isAnswered = !!answers[q.id];
                  const isRagu = !!marked[q.id];

                  let btnStyle = "bg-slate-100 text-slate-700 hover:bg-slate-200";
                  if (isCurrent) {
                    btnStyle = "ring-2 ring-blue-600 font-bold bg-blue-100 text-blue-800";
                  } else if (isRagu) {
                    btnStyle = "bg-amber-400 text-slate-900 font-medium";
                  } else if (isAnswered) {
                    btnStyle = "bg-emerald-600 text-white font-medium";
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-9 rounded text-xs flex items-center justify-center transition-colors ${btnStyle}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-6 pt-4 border-t space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <div className="h-3.5 w-3.5 rounded bg-emerald-600" />
                  <span>Sudah Terjawab</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3.5 w-3.5 rounded bg-amber-400" />
                  <span>Ragu-ragu</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3.5 w-3.5 rounded bg-slate-200" />
                  <span>Belum Terjawab</span>
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-6 pt-4 border-t">
                <Button
                  onClick={() => handleSubmit(false)}
                  disabled={submitting}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white"
                >
                  <Send className="h-4 w-4 mr-1.5" />
                  {submitting ? "Mengirim Jawaban..." : "Submit Ujian Sekarang"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Floating Scientific Calculator Modal */}
      {showCalculator && (
        <div className="fixed bottom-6 right-6 z-50 shadow-2xl">
          <ScientificCalculator onClose={() => setShowCalculator(false)} />
        </div>
      )}
    </div>
  );
}
