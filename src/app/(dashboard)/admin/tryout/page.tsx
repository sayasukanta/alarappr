"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  FileQuestion,
  Plus,
  Search,
  Download,
  Upload,
  Filter,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  FileSpreadsheet,
  AlertTriangle,
  ArrowUpDown,
  BookOpen,
  Layers,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface QuestionItem {
  id: number;
  category: "PPR_ANALISIS" | "PPR_BAGASI" | "PKR_PEKERJA";
  trainingId?: number | null;
  training?: { id: number; title: string } | null;
  topic: string;
  questionText: string;
  imageUrl?: string | null;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  optionE?: string | null;
  correctAnswer: "A" | "B" | "C" | "D" | "E";
  explanation?: string | null;
  difficulty: number;
  isActive: boolean;
  createdAt: string;
}

interface QuestionMetrics {
  total: number;
  active: number;
  inactive: number;
  byCategory: {
    PPR_ANALISIS: number;
    PPR_BAGASI: number;
    PKR_PEKERJA: number;
  };
}

export default function AdminTryoutQuestionsPage() {
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [metrics, setMetrics] = useState<QuestionMetrics>({
    total: 0,
    active: 0,
    inactive: 0,
    byCategory: { PPR_ANALISIS: 0, PPR_BAGASI: 0, PKR_PEKERJA: 0 },
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [difficultyFilter, setDifficultyFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionItem | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewQuestion, setPreviewQuestion] = useState<QuestionItem | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingQuestion, setDeletingQuestion] = useState<QuestionItem | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    category: "PPR_ANALISIS" as "PPR_ANALISIS" | "PPR_BAGASI" | "PKR_PEKERJA",
    topic: "",
    difficulty: 1,
    questionText: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    optionE: "",
    correctAnswer: "A" as "A" | "B" | "C" | "D" | "E",
    explanation: "",
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);

  // Import State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success?: boolean;
    message?: string;
    errors?: string[];
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch Questions
  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (categoryFilter !== "ALL") params.set("category", categoryFilter);
      if (difficultyFilter !== "ALL") params.set("difficulty", difficultyFilter);
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (search.trim()) params.set("search", search.trim());
      params.set("page", page.toString());
      params.set("limit", "15");

      const res = await fetch(`/api/admin/questions?${params.toString()}`);
      if (!res.ok) throw new Error("Gagal mengambil data soal");

      const data = await res.json();
      setQuestions(data.questions || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalItems(data.pagination?.total || 0);
      if (data.metrics) setMetrics(data.metrics);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Terjadi kesalahan saat memuat soal");
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, difficultyFilter, statusFilter, search, page]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // Open Form for Create
  const handleOpenCreate = () => {
    setEditingQuestion(null);
    setFormData({
      category: categoryFilter !== "ALL" ? (categoryFilter as any) : "PPR_ANALISIS",
      topic: "",
      difficulty: 1,
      questionText: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      optionE: "",
      correctAnswer: "A",
      explanation: "",
      isActive: true,
    });
    setIsFormOpen(true);
  };

  // Open Form for Edit
  const handleOpenEdit = (q: QuestionItem) => {
    setEditingQuestion(q);
    setFormData({
      category: q.category,
      topic: q.topic,
      difficulty: q.difficulty,
      questionText: q.questionText,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      optionE: q.optionE || "",
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || "",
      isActive: q.isActive,
    });
    setIsFormOpen(true);
  };

  // Submit Form (Create / Update)
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.topic.trim()) return toast.error("Topik soal wajib diisi");
    if (!formData.questionText.trim()) return toast.error("Teks pertanyaan soal wajib diisi");
    if (!formData.optionA.trim() || !formData.optionB.trim() || !formData.optionC.trim() || !formData.optionD.trim()) {
      return toast.error("Opsi jawaban A, B, C, dan D wajib diisi");
    }

    try {
      setSubmitting(true);
      const url = editingQuestion
        ? `/api/admin/questions/${editingQuestion.id}`
        : "/api/admin/questions";
      const method = editingQuestion ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Gagal menyimpan soal");

      toast.success(editingQuestion ? "Soal berhasil diperbarui" : "Soal baru berhasil ditambahkan");
      setIsFormOpen(false);
      fetchQuestions();
    } catch (err: any) {
      toast.error(err.message || "Gagal memproses data");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete
  const handleConfirmDelete = async () => {
    if (!deletingQuestion) return;
    try {
      setSubmitting(true);
      const res = await fetch(`/api/admin/questions/${deletingQuestion.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menghapus soal");

      toast.success(data.message || "Soal berhasil dihapus");
      setIsDeleteOpen(false);
      setDeletingQuestion(null);
      fetchQuestions();
    } catch (err: any) {
      toast.error(err.message || "Gagal menghapus soal");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Import Submit
  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return toast.error("Silakan pilih file Excel (.xlsx)");

    try {
      setImporting(true);
      setImportResult(null);

      const fData = new FormData();
      fData.append("file", uploadFile);

      const res = await fetch("/api/admin/questions/import", {
        method: "POST",
        body: fData,
      });

      const data = await res.json();
      if (!res.ok) {
        setImportResult({
          success: false,
          message: data.error || "Gagal mengimpor file",
          errors: data.details || [],
        });
        toast.error(data.error || "Gagal mengimpor soal");
        return;
      }

      setImportResult({
        success: true,
        message: data.message,
        errors: data.errors || [],
      });
      toast.success(data.message);
      setUploadFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchQuestions();
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan saat mengunggah");
    } finally {
      setImporting(false);
    }
  };

  // Category labels & styling helper
  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case "PPR_ANALISIS":
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none font-medium">PPR Analisis</Badge>;
      case "PPR_BAGASI":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-none font-medium">PPR Bagasi</Badge>;
      case "PKR_PEKERJA":
        return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none font-medium">Pekerja Radiasi</Badge>;
      default:
        return <Badge variant="outline">{cat}</Badge>;
    }
  };

  const getDifficultyBadge = (level: number) => {
    switch (level) {
      case 1:
        return <Badge variant="outline" className="text-emerald-600 border-emerald-300 bg-emerald-50/50">Mudah</Badge>;
      case 2:
        return <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50/50">Menengah</Badge>;
      case 3:
        return <Badge variant="outline" className="text-red-600 border-red-300 bg-red-50/50">Sulit</Badge>;
      default:
        return <Badge variant="outline">{level}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 p-4 md:p-8 space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <FileQuestion className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900">
                Kelola Bank Soal Tryout
              </h1>
              <p className="text-xs md:text-sm text-slate-500">
                Bank soal ujian kompetensi BAPETEN, pembahasan materi, dan import/export berkas Excel.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Unduh Template XLSX */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open("/api/admin/questions/export?template=true", "_blank")}
            className="text-slate-700 border-slate-200 hover:bg-slate-50 shadow-none text-xs"
          >
            <Download className="h-3.5 w-3.5 mr-1.5 text-blue-600" />
            Template XLSX
          </Button>

          {/* Ekspor XLSX */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const url = categoryFilter !== "ALL"
                ? `/api/admin/questions/export?category=${categoryFilter}`
                : "/api/admin/questions/export";
              window.open(url, "_blank");
            }}
            className="text-slate-700 border-slate-200 hover:bg-slate-50 shadow-none text-xs"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5 text-emerald-600" />
            Ekspor Soal
          </Button>

          {/* Upload XLSX */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setImportResult(null);
              setUploadFile(null);
              setIsImportOpen(true);
            }}
            className="text-slate-700 border-slate-200 hover:bg-slate-50 shadow-none text-xs"
          >
            <Upload className="h-3.5 w-3.5 mr-1.5 text-indigo-600" />
            Upload XLSX
          </Button>

          {/* Tambah Soal Manual */}
          <Button
            size="sm"
            onClick={handleOpenCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm text-xs"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Tambah Soal
          </Button>
        </div>
      </div>

      {/* ── Metric Summary Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <Card className="p-4 bg-white border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Soal</span>
            <span className="p-1.5 rounded-lg bg-slate-100 text-slate-600"><Layers className="h-4 w-4" /></span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900">{metrics.total}</span>
            <p className="text-[11px] text-slate-400 mt-0.5">{metrics.active} aktif • {metrics.inactive} arsip</p>
          </div>
        </Card>

        <Card className="p-4 bg-white border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">PPR Analisis</span>
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600"><BookOpen className="h-4 w-4" /></span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-blue-700">{metrics.byCategory.PPR_ANALISIS}</span>
            <p className="text-[11px] text-slate-400 mt-0.5">Soal Kompetensi</p>
          </div>
        </Card>

        <Card className="p-4 bg-white border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">PPR Bagasi</span>
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600"><Sparkles className="h-4 w-4" /></span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-amber-700">{metrics.byCategory.PPR_BAGASI}</span>
            <p className="text-[11px] text-slate-400 mt-0.5">Soal Sinar-X Bagasi</p>
          </div>
        </Card>

        <Card className="p-4 bg-white border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Pekerja Radiasi</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600"><CheckCircle2 className="h-4 w-4" /></span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-emerald-700">{metrics.byCategory.PKR_PEKERJA}</span>
            <p className="text-[11px] text-slate-400 mt-0.5">Soal Keselamatan PKR</p>
          </div>
        </Card>

        <Card className="p-4 bg-white border-slate-200 shadow-sm col-span-2 md:col-span-1 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Status Aktif</span>
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600"><HelpCircle className="h-4 w-4" /></span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-indigo-700">
              {metrics.total > 0 ? Math.round((metrics.active / metrics.total) * 100) : 0}%
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">Siap diujikan ke peserta</p>
          </div>
        </Card>
      </div>

      {/* ── Filters & Search ── */}
      <Card className="p-4 bg-white border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Cari teks pertanyaan, topik, atau kata kunci pembahasan..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 bg-slate-50/50 border-slate-200 text-sm"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            aria-label="Filter Berdasarkan Kategori"
            className="w-full md:w-44 px-3 py-2 text-xs md:text-sm bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Semua Kategori</option>
            <option value="PPR_ANALISIS">PPR Analisis</option>
            <option value="PPR_BAGASI">PPR Bagasi</option>
            <option value="PKR_PEKERJA">Pekerja Radiasi</option>
          </select>

          {/* Difficulty Filter */}
          <select
            value={difficultyFilter}
            onChange={(e) => {
              setDifficultyFilter(e.target.value);
              setPage(1);
            }}
            aria-label="Filter Berdasarkan Kesulitan"
            className="w-full md:w-36 px-3 py-2 text-xs md:text-sm bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Semua Kesulitan</option>
            <option value="1">1 - Mudah</option>
            <option value="2">2 - Menengah</option>
            <option value="3">3 - Sulit</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            aria-label="Filter Berdasarkan Status"
            className="w-full md:w-36 px-3 py-2 text-xs md:text-sm bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Non-Aktif</option>
          </select>

          {/* Refresh */}
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchQuestions}
            title="Muat Ulang"
            className="shrink-0 text-slate-500 hover:text-slate-700"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </Card>

      {/* ── Table Questions ── */}
      <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs md:text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold">
                <th className="py-3 px-3 w-12 text-center">No</th>
                <th className="py-3 px-4 w-44">Kategori & Topik</th>
                <th className="py-3 px-4">Pertanyaan & Pilihan Jawaban</th>
                <th className="py-3 px-3 w-20 text-center">Kunci</th>
                <th className="py-3 px-3 w-28 text-center">Kesulitan</th>
                <th className="py-3 px-3 w-24 text-center">Status</th>
                <th className="py-3 px-4 w-28 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-500" />
                    Memuat bank soal...
                  </td>
                </tr>
              ) : questions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <FileQuestion className="h-10 w-10 mx-auto mb-2 text-slate-300" />
                    Tidak ada soal yang sesuai dengan kriteria pencarian / filter.
                  </td>
                </tr>
              ) : (
                questions.map((q, idx) => (
                  <tr key={q.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* No */}
                    <td className="py-3.5 px-3 text-center text-slate-500 font-medium">
                      {(page - 1) * 15 + idx + 1}
                    </td>

                    {/* Kategori & Topik */}
                    <td className="py-3.5 px-4 align-top">
                      <div className="space-y-1">
                        <div>{getCategoryBadge(q.category)}</div>
                        <p className="font-semibold text-slate-800 text-xs">{q.topic}</p>
                        {q.training && (
                          <span className="text-[10px] text-slate-400 block truncate max-w-[150px]">
                            {q.training.title}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Teks Soal & Pilihan */}
                    <td className="py-3.5 px-4 align-top max-w-md">
                      <p className="font-medium text-slate-900 leading-snug line-clamp-2 text-xs md:text-sm">
                        {q.questionText}
                      </p>

                      <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 mt-2 text-[11px] text-slate-600 bg-slate-50/80 p-2 rounded-lg border border-slate-100">
                        <div className={q.correctAnswer === "A" ? "font-bold text-emerald-700" : ""}>
                          <span className="font-semibold mr-1">A.</span>
                          <span className="truncate inline-block max-w-[160px] align-bottom">{q.optionA}</span>
                        </div>
                        <div className={q.correctAnswer === "B" ? "font-bold text-emerald-700" : ""}>
                          <span className="font-semibold mr-1">B.</span>
                          <span className="truncate inline-block max-w-[160px] align-bottom">{q.optionB}</span>
                        </div>
                        <div className={q.correctAnswer === "C" ? "font-bold text-emerald-700" : ""}>
                          <span className="font-semibold mr-1">C.</span>
                          <span className="truncate inline-block max-w-[160px] align-bottom">{q.optionC}</span>
                        </div>
                        <div className={q.correctAnswer === "D" ? "font-bold text-emerald-700" : ""}>
                          <span className="font-semibold mr-1">D.</span>
                          <span className="truncate inline-block max-w-[160px] align-bottom">{q.optionD}</span>
                        </div>
                        {q.optionE && (
                          <div className={`col-span-2 ${q.correctAnswer === "E" ? "font-bold text-emerald-700" : ""}`}>
                            <span className="font-semibold mr-1">E.</span>
                            <span className="truncate inline-block max-w-[320px] align-bottom">{q.optionE}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Kunci */}
                    <td className="py-3.5 px-3 text-center align-top">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs shadow-xs">
                        {q.correctAnswer}
                      </span>
                    </td>

                    {/* Kesulitan */}
                    <td className="py-3.5 px-3 text-center align-top">
                      {getDifficultyBadge(q.difficulty)}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3 text-center align-top">
                      {q.isActive ? (
                        <span className="inline-flex items-center text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                          Non-Aktif
                        </span>
                      )}
                    </td>

                    {/* Aksi */}
                    <td className="py-3.5 px-4 text-center align-top">
                      <div className="flex items-center justify-center gap-1">
                        {/* Preview */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                          onClick={() => {
                            setPreviewQuestion(q);
                            setIsPreviewOpen(true);
                          }}
                          title="Lihat Detail & Pembahasan"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        {/* Edit */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-500 hover:text-amber-600 hover:bg-amber-50"
                          onClick={() => handleOpenEdit(q)}
                          title="Edit Soal"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        {/* Delete */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => {
                            setDeletingQuestion(q);
                            setIsDeleteOpen(true);
                          }}
                          title="Hapus / Nonaktifkan"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
            <span className="text-xs text-slate-500">
              Menampilkan {questions.length} dari {totalItems} soal
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="h-8 text-xs text-slate-600"
              >
                <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                Sebelumnya
              </Button>
              <span className="text-xs text-slate-600 px-2">
                Halaman <strong>{page}</strong> dari <strong>{totalPages}</strong>
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="h-8 text-xs text-slate-600"
              >
                Selanjutnya
                <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* MODAL FORM: TAMBAH / EDIT SOAL                                          */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <FileQuestion className="h-5 w-5 text-blue-600" />
              {editingQuestion ? `Edit Soal #${editingQuestion.id}` : "Tambah Soal Tryout Baru"}
            </DialogTitle>
            <DialogDescription>
              Isi pertanyaan, pilihan jawaban, kunci jawaban yang benar, serta uraian pembahasan materi.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitForm} className="space-y-4 py-2">
            {/* Row 1: Kategori, Topik, Kesulitan */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Kategori Pelatihan <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="PPR_ANALISIS">PPR Analisis</option>
                  <option value="PPR_BAGASI">PPR Bagasi</option>
                  <option value="PKR_PEKERJA">Pekerja Radiasi</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Topik / Materi <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="cth: Fisika Radiasi, Regulasi BAPETEN"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  className="text-sm"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Tingkat Kesulitan
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: parseInt(e.target.value, 10) })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="1">1 - Mudah</option>
                  <option value="2">2 - Menengah</option>
                  <option value="3">3 - Sulit</option>
                </select>
              </div>
            </div>

            {/* Teks Pertanyaan */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Teks Pertanyaan Soal <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Tuliskan butir soal / pertanyaan lengkap di sini..."
                value={formData.questionText}
                onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Pilihan Jawaban A, B, C, D, E */}
            <div className="space-y-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-700 block">Pilihan Jawaban (Multiple Choice)</span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-0.5">Opsi A *</label>
                  <Input
                    placeholder="Jawaban A"
                    value={formData.optionA}
                    onChange={(e) => setFormData({ ...formData, optionA: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-0.5">Opsi B *</label>
                  <Input
                    placeholder="Jawaban B"
                    value={formData.optionB}
                    onChange={(e) => setFormData({ ...formData, optionB: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-0.5">Opsi C *</label>
                  <Input
                    placeholder="Jawaban C"
                    value={formData.optionC}
                    onChange={(e) => setFormData({ ...formData, optionC: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-0.5">Opsi D *</label>
                  <Input
                    placeholder="Jawaban D"
                    value={formData.optionD}
                    onChange={(e) => setFormData({ ...formData, optionD: e.target.value })}
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-slate-600 block mb-0.5">
                    Opsi E <span className="text-slate-400 font-normal">(Opsional)</span>
                  </label>
                  <Input
                    placeholder="Jawaban E (opsional jika soal memiliki 5 opsi)"
                    value={formData.optionE}
                    onChange={(e) => setFormData({ ...formData, optionE: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Kunci Jawaban & Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Kunci Jawaban Benar <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  {(["A", "B", "C", "D", "E"] as const).map((letter) => (
                    <button
                      key={letter}
                      type="button"
                      onClick={() => setFormData({ ...formData, correctAnswer: letter })}
                      className={`flex-1 py-1.5 rounded-lg font-bold text-xs md:text-sm border transition-all ${
                        formData.correctAnswer === letter
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-sm ring-2 ring-emerald-200"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {letter}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <label htmlFor="isActiveToggle" className="text-xs font-medium text-slate-700 cursor-pointer">
                  Aktifkan soal ini untuk sesi ujian tryout peserta
                </label>
              </div>
            </div>

            {/* Pembahasan */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Uraian Pembahasan Jawaban
              </label>
              <textarea
                rows={3}
                placeholder="Penjelasan ilmiah atau dasar hukum/regulasi jawaban benar (ditampilkan saat peserta meninjau hasil tryout)..."
                value={formData.explanation}
                onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700 text-white">
                {submitting ? "Menyimpan..." : editingQuestion ? "Simpan Perubahan" : "Tambahkan Soal"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* MODAL PREVIEW / DETAIL SOAL                                            */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              {previewQuestion && getCategoryBadge(previewQuestion.category)}
              {previewQuestion && getDifficultyBadge(previewQuestion.difficulty)}
            </div>
            <DialogTitle className="text-base font-bold text-slate-900">
              {previewQuestion?.topic}
            </DialogTitle>
          </DialogHeader>

          {previewQuestion && (
            <div className="space-y-4 py-2">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-sm font-medium text-slate-900 leading-relaxed">
                  {previewQuestion.questionText}
                </p>
              </div>

              <div className="space-y-1.5 text-xs md:text-sm">
                {[
                  { key: "A", val: previewQuestion.optionA },
                  { key: "B", val: previewQuestion.optionB },
                  { key: "C", val: previewQuestion.optionC },
                  { key: "D", val: previewQuestion.optionD },
                  ...(previewQuestion.optionE ? [{ key: "E", val: previewQuestion.optionE }] : []),
                ].map(({ key, val }) => {
                  const isCorrect = previewQuestion.correctAnswer === key;
                  return (
                    <div
                      key={key}
                      className={`flex items-start gap-2.5 p-2.5 rounded-lg border transition-all ${
                        isCorrect
                          ? "bg-emerald-50/80 border-emerald-300 text-emerald-900 font-semibold"
                          : "bg-white border-slate-200 text-slate-700"
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                          isCorrect ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {key}
                      </span>
                      <span className="flex-1 mt-0.5">{val}</span>
                      {isCorrect && (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      )}
                    </div>
                  );
                })}
              </div>

              {previewQuestion.explanation && (
                <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200 text-xs md:text-sm space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-blue-900">
                    <Info className="h-4 w-4 text-blue-600" />
                    Pembahasan Materi:
                  </div>
                  <p className="text-blue-800 leading-relaxed pl-5">
                    {previewQuestion.explanation}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
              Tutup
            </Button>
            <Button
              onClick={() => {
                setIsPreviewOpen(false);
                if (previewQuestion) handleOpenEdit(previewQuestion);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Edit className="h-4 w-4 mr-1.5" />
              Edit Soal Ini
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* MODAL UPLOAD / IMPORT SOAL DARI XLSX                                   */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <Upload className="h-5 w-5 text-indigo-600" />
              Upload Soal dari File Excel (.xlsx)
            </DialogTitle>
            <DialogDescription>
              Impor banyak butir soal sekaligus dari file spreadsheet Excel sesuai format baku.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleImportSubmit} className="space-y-4 py-2">
            {/* Panduan & Template Download */}
            <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl text-xs space-y-2">
              <p className="text-indigo-900 font-medium">
                Gunakan format kolom template resmi agar proses impor berjalan lancar tanpa kendala.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => window.open("/api/admin/questions/export?template=true", "_blank")}
                className="bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50 text-xs h-8"
              >
                <Download className="h-3.5 w-3.5 mr-1.5" />
                Unduh Template Soal (.xlsx)
              </Button>
            </div>

            {/* File Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Pilih File Berkas Excel (.xlsx)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer border border-slate-200 rounded-lg p-1"
                required
              />
            </div>

            {/* Import Result Feedback */}
            {importResult && (
              <div
                className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                  importResult.success
                    ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                    : "bg-red-50 border-red-200 text-red-900"
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold">
                  {importResult.success ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  )}
                  {importResult.message}
                </div>

                {importResult.errors && importResult.errors.length > 0 && (
                  <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-700 pt-1 max-h-32 overflow-y-auto">
                    {importResult.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsImportOpen(false)}>
                Tutup
              </Button>
              <Button type="submit" disabled={importing || !uploadFile} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {importing ? "Mengimpor Data..." : "Mulai Upload & Impor"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* MODAL DELETE CONFIRMATION                                              */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Hapus / Nonaktifkan Soal
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus soal ini dari bank soal?
            </DialogDescription>
          </DialogHeader>

          {deletingQuestion && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
              <p className="font-semibold text-slate-800">
                #{deletingQuestion.id} • {deletingQuestion.topic} ({deletingQuestion.category})
              </p>
              <p className="text-slate-600 line-clamp-2 italic">
                &ldquo;{deletingQuestion.questionText}&rdquo;
              </p>
              <p className="text-[11px] text-slate-400 pt-1">
                Catatan: Jika soal ini pernah dikerjakan oleh peserta dalam riwayat tryout, sistem akan otomatis mengarsipkannya (non-aktif) guna menjaga integritas riwayat nilai peserta.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              disabled={submitting}
              onClick={handleConfirmDelete}
            >
              {submitting ? "Memproses..." : "Ya, Hapus Soal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
