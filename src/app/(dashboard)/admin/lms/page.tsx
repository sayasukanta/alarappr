"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  BookOpen,
  Plus,
  Search,
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
  Layers,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Info,
  PlayCircle,
  FileText,
  GraduationCap,
  Clock,
  Download,
  Upload,
  Calendar,
  ExternalLink,
  Video,
  FileDown,
  Paperclip,
  Check,
  X,
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

// ─── Interfaces ─────────────────────────────────────────────────────────────

interface LmsModuleItem {
  id: number;
  trainingCategory: "PPR_ANALISIS" | "PPR_BAGASI" | "PKR_PEKERJA";
  trainingId?: number | null;
  training?: { id: number; title: string } | null;
  dayNumber: number;
  title: string;
  description?: string | null;
  moduleType: "reading" | "video" | "quiz" | "file";
  durationMinutes: number;
  content?: string | null;
  contentPath?: string | null;
  fileUrl?: string | null;
  fileName?: string | null;
  fileSize?: string | null;
  videoUrl?: string | null;
  pageCount: number;
  orderIndex: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt?: string;
  _count?: {
    progressRecords: number;
  };
}

interface LmsMetrics {
  totalModules: number;
  publishedCount: number;
  draftCount: number;
  totalHours: number;
  totalMinutes: number;
  byCategory: {
    PPR_ANALISIS: number;
    PPR_BAGASI: number;
    PKR_PEKERJA: number;
  };
}

export default function AdminLmsPage() {
  const [modules, setModules] = useState<LmsModuleItem[]>([]);
  const [metrics, setMetrics] = useState<LmsMetrics>({
    totalModules: 0,
    publishedCount: 0,
    draftCount: 0,
    totalHours: 0,
    totalMinutes: 0,
    byCategory: { PPR_ANALISIS: 0, PPR_BAGASI: 0, PKR_PEKERJA: 0 },
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [dayFilter, setDayFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState<"days" | "table">("days");

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<LmsModuleItem | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewModule, setPreviewModule] = useState<LmsModuleItem | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingModule, setDeletingModule] = useState<LmsModuleItem | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    trainingCategory: "PPR_ANALISIS",
    dayNumber: 1,
    orderIndex: 1,
    title: "",
    description: "",
    moduleType: "reading",
    durationMinutes: 45,
    pageCount: 1,
    fileUrl: "",
    fileName: "",
    fileSize: "",
    videoUrl: "",
    content: "",
    isPublished: true,
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [contentTab, setContentTab] = useState<"edit" | "preview">("edit");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Fetch Modules ──────────────────────────────────────────────────────────
  const fetchModules = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (categoryFilter !== "ALL") params.append("category", categoryFilter);
      if (dayFilter !== "ALL") params.append("day", dayFilter);
      if (typeFilter !== "ALL") params.append("type", typeFilter);
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (search.trim()) params.append("search", search.trim());

      const res = await fetch(`/api/admin/lms?${params.toString()}`);
      if (!res.ok) throw new Error("Gagal mengambil data modul");
      const data = await res.json();
      setModules(data.modules || []);
      if (data.metrics) setMetrics(data.metrics);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Terjadi kesalahan saat memuat modul");
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, dayFilter, typeFilter, statusFilter, search]);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  // ─── Toggle Publish ─────────────────────────────────────────────────────────
  const handleTogglePublish = async (mod: LmsModuleItem) => {
    try {
      const res = await fetch(`/api/admin/lms/${mod.id}/publish`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !mod.isPublished }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengubah status publikasi");

      toast.success(data.message || "Status publikasi diperbarui");
      setModules((prev) =>
        prev.map((item) =>
          item.id === mod.id ? { ...item, isPublished: data.isPublished } : item
        )
      );
      // update metrics
      setMetrics((prev) => ({
        ...prev,
        publishedCount: prev.publishedCount + (data.isPublished ? 1 : -1),
        draftCount: prev.draftCount + (data.isPublished ? -1 : 1),
      }));
    } catch (err: any) {
      toast.error(err.message || "Gagal mengubah status");
    }
  };

  // ─── Open Form Modal ────────────────────────────────────────────────────────
  const handleOpenCreate = () => {
    setEditingModule(null);
    // Find next order index for default category & day 1
    const existingInDay = modules.filter(
      (m) =>
        m.trainingCategory === (categoryFilter !== "ALL" ? categoryFilter : "PPR_ANALISIS") &&
        m.dayNumber === 1
    );
    const nextOrder = existingInDay.length > 0 ? Math.max(...existingInDay.map((m) => m.orderIndex)) + 1 : 1;

    setFormData({
      trainingCategory: categoryFilter !== "ALL" ? categoryFilter : "PPR_ANALISIS",
      dayNumber: 1,
      orderIndex: nextOrder,
      title: "",
      description: "",
      moduleType: "reading",
      durationMinutes: 45,
      pageCount: 1,
      fileUrl: "",
      fileName: "",
      fileSize: "",
      videoUrl: "",
      content: "",
      isPublished: true,
    });
    setContentTab("edit");
    setIsFormOpen(true);
  };

  const handleOpenEdit = (mod: LmsModuleItem) => {
    setEditingModule(mod);
    setFormData({
      trainingCategory: mod.trainingCategory,
      dayNumber: mod.dayNumber,
      orderIndex: mod.orderIndex,
      title: mod.title,
      description: mod.description || "",
      moduleType: mod.moduleType || "reading",
      durationMinutes: mod.durationMinutes || 45,
      pageCount: mod.pageCount || 1,
      fileUrl: mod.fileUrl || "",
      fileName: mod.fileName || "",
      fileSize: mod.fileSize || "",
      videoUrl: mod.videoUrl || "",
      content: mod.content || "",
      isPublished: mod.isPublished,
    });
    setContentTab("edit");
    setIsFormOpen(true);
  };

  // ─── Save Module ────────────────────────────────────────────────────────────
  const handleSaveModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Judul modul wajib diisi");
      return;
    }

    try {
      setFormSubmitting(true);
      const url = editingModule ? `/api/admin/lms/${editingModule.id}` : "/api/admin/lms";
      const method = editingModule ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan modul");

      toast.success(editingModule ? "Modul berhasil diperbarui" : "Modul berhasil ditambahkan");
      setIsFormOpen(false);
      fetchModules();
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan");
    } finally {
      setFormSubmitting(false);
    }
  };

  // ─── Delete Module ──────────────────────────────────────────────────────────
  const handleDeleteModule = async () => {
    if (!deletingModule) return;
    try {
      const res = await fetch(`/api/admin/lms/${deletingModule.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menghapus modul");

      toast.success("Modul berhasil dihapus");
      setIsDeleteOpen(false);
      setDeletingModule(null);
      fetchModules();
    } catch (err: any) {
      toast.error(err.message || "Gagal menghapus modul");
    }
  };

  // ─── File Upload ────────────────────────────────────────────────────────────
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingFile(true);
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/admin/lms/upload", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengunggah berkas");

      setFormData((prev) => ({
        ...prev,
        fileUrl: data.fileUrl,
        fileName: data.fileName,
        fileSize: data.fileSize,
      }));
      toast.success(`Berkas ${data.fileName} berhasil diunggah (${data.fileSize})`);
    } catch (err: any) {
      toast.error(err.message || "Gagal mengunggah berkas");
    } finally {
      setIsUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // ─── Helper Formatters ──────────────────────────────────────────────────────
  const categoryLabels: Record<string, string> = {
    PPR_ANALISIS: "PPR Industri Tk. 1 (Analisis)",
    PPR_BAGASI: "PPR Medik Tk. 2 (Bagasi)",
    PKR_PEKERJA: "PKR Pekerja Radiasi",
  };

  const categoryColors: Record<string, string> = {
    PPR_ANALISIS: "bg-blue-50 text-blue-700 border-blue-200",
    PPR_BAGASI: "bg-emerald-50 text-emerald-700 border-emerald-200",
    PKR_PEKERJA: "bg-purple-50 text-purple-700 border-purple-200",
  };

  const typeConfig: Record<string, { label: string; icon: any; color: string }> = {
    reading: { label: "Membaca Teks", icon: FileText, color: "text-blue-600 bg-blue-50 border-blue-200" },
    video: { label: "Video Tutorial", icon: PlayCircle, color: "text-red-600 bg-red-50 border-red-200" },
    quiz: { label: "Kuis / Evaluasi", icon: GraduationCap, color: "text-purple-600 bg-purple-50 border-purple-200" },
    file: { label: "Berkas / Slide PDF", icon: Download, color: "text-amber-600 bg-amber-50 border-amber-200" },
  };

  // Group modules by day for the Day Accordion view
  const daysGroup = [1, 2, 3, 4, 5].map((d) => ({
    dayNumber: d,
    modules: modules.filter((m) => m.dayNumber === d),
  })).filter((group) => dayFilter === "ALL" ? group.modules.length > 0 || group.dayNumber <= 3 : group.dayNumber === parseInt(dayFilter, 10));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* ─── Page Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Kelola LMS & Modul Pembelajaran
            </h1>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              Admin
            </Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Atur kurikulum modul per hari, materi bacaan, video edukasi, slide unduhan, dan status rilis bagi peserta.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchModules}
            disabled={loading}
            className="text-slate-600 hover:text-slate-900"
          >
            <RefreshCw className={`h-4 w-4 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Muat Ulang
          </Button>

          <Button
            onClick={handleOpenCreate}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Tambah Modul Baru
          </Button>
        </div>
      </div>

      {/* ─── Metric Cards ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 border-slate-200 shadow-sm bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Modul
            </span>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <BookOpen className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-slate-900">{metrics.totalModules}</span>
            <span className="text-xs text-slate-500 ml-1.5">modul terdaftar</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center gap-2">
            <span>Analisis: {metrics.byCategory.PPR_ANALISIS}</span>·
            <span>Bagasi: {metrics.byCategory.PPR_BAGASI}</span>·
            <span>PKR: {metrics.byCategory.PKR_PEKERJA}</span>
          </div>
        </Card>

        <Card className="p-5 border-slate-200 shadow-sm bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
              Modul Terbit (Published)
            </span>
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-emerald-700">{metrics.publishedCount}</span>
            <span className="text-xs text-slate-500 ml-1.5">aktif dibaca peserta</span>
          </div>
          <div className="mt-2 text-xs text-emerald-600 font-medium">
            Siap diakses di dashboard LMS peserta
          </div>
        </Card>

        <Card className="p-5 border-slate-200 shadow-sm bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-600">
              Draf Modul
            </span>
            <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
              <Layers className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-amber-700">{metrics.draftCount}</span>
            <span className="text-xs text-slate-500 ml-1.5">belum diterbitkan</span>
          </div>
          <div className="mt-2 text-xs text-amber-600">
            Tersembunyi dari peserta
          </div>
        </Card>

        <Card className="p-5 border-slate-200 shadow-sm bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              Total Jam Belajar
            </span>
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-indigo-700">{metrics.totalHours}</span>
            <span className="text-xs text-slate-500 ml-1.5">jam ({metrics.totalMinutes} menit)</span>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Akumulasi estimasi waktu belajar
          </div>
        </Card>
      </div>

      {/* ─── Filters & Search Bar ────────────────────────────────────────────── */}
      <Card className="p-4 border-slate-200 shadow-sm bg-white space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Cari judul modul, materi, atau topik..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-slate-50 border-slate-200 text-sm focus-visible:ring-blue-500"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Tampilan:</span>
            <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
              <button
                onClick={() => setViewMode("days")}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  viewMode === "days"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Grup per Hari
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  viewMode === "table"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Daftar Tabel
              </button>
            </div>
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-100 text-sm">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-slate-500">Kategori:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-8 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">Semua Kategori</option>
              <option value="PPR_ANALISIS">PPR Analisis</option>
              <option value="PPR_BAGASI">PPR Bagasi</option>
              <option value="PKR_PEKERJA">PKR Pekerja</option>
            </select>
          </div>

          {/* Day Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-slate-500">Hari:</span>
            <select
              value={dayFilter}
              onChange={(e) => setDayFilter(e.target.value)}
              className="h-8 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">Semua Hari</option>
              <option value="1">Hari 1</option>
              <option value="2">Hari 2</option>
              <option value="3">Hari 3</option>
              <option value="4">Hari 4</option>
              <option value="5">Hari 5</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-slate-500">Tipe:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-8 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">Semua Tipe</option>
              <option value="reading">Membaca Teks</option>
              <option value="video">Video Tutorial</option>
              <option value="file">Berkas / Slide PDF</option>
              <option value="quiz">Kuis / Evaluasi</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">Semua Status</option>
              <option value="published">Terbit (Published)</option>
              <option value="draft">Draf (Belum Terbit)</option>
            </select>
          </div>

          {/* Reset Filters */}
          {(categoryFilter !== "ALL" || dayFilter !== "ALL" || typeFilter !== "ALL" || statusFilter !== "ALL" || search) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setCategoryFilter("ALL");
                setDayFilter("ALL");
                setTypeFilter("ALL");
                setStatusFilter("ALL");
                setSearch("");
              }}
              className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 ml-auto"
            >
              <X className="h-3.5 w-3.5 mr-1" />
              Reset Filter
            </Button>
          )}
        </div>
      </Card>

      {/* ─── Content List ────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200 shadow-sm">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-3" />
          <p className="text-slate-600 font-medium">Memuat modul pembelajaran...</p>
        </div>
      ) : modules.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-dashed border-slate-300 shadow-sm">
          <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">Belum ada modul yang cocok</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Tidak ditemukan modul sesuai filter pencarian. Ubah filter atau tambahkan modul materi baru.
          </p>
          <Button
            onClick={handleOpenCreate}
            size="sm"
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Tambah Modul Baru
          </Button>
        </div>
      ) : viewMode === "days" ? (
        /* ─── Day Grouped View ─────────────────────────────────────────────── */
        <div className="space-y-6">
          {daysGroup.map((group) => (
            <Card key={group.dayNumber} className="border-slate-200 shadow-sm overflow-hidden bg-white">
              {/* Day Header */}
              <div className="p-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-blue-600 text-white font-bold text-sm flex items-center justify-center shadow-sm">
                    H{group.dayNumber}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">
                      Materi Pelatihan — Hari ke-{group.dayNumber}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {group.modules.length} modul terdaftar di hari ini
                    </p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleOpenCreate();
                    setFormData((prev) => ({ ...prev, dayNumber: group.dayNumber }));
                  }}
                  className="h-8 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Tambah di Hari {group.dayNumber}
                </Button>
              </div>

              {/* Day Modules */}
              <div className="divide-y divide-slate-100">
                {group.modules.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 italic">
                    Belum ada modul untuk Hari {group.dayNumber}. Klik tombol tambah di atas.
                  </div>
                ) : (
                  group.modules.map((mod) => {
                    const TypeIcon = typeConfig[mod.moduleType]?.icon || FileText;
                    const typeStyle = typeConfig[mod.moduleType] || typeConfig.reading;

                    return (
                      <div
                        key={mod.id}
                        className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                      >
                        {/* Left: Info */}
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="mt-1 h-7 w-7 rounded-md bg-slate-100 border border-slate-200 text-slate-600 font-semibold text-xs flex items-center justify-center shrink-0">
                            #{mod.orderIndex}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-slate-900 text-sm">
                                {mod.title}
                              </span>

                              {/* Category Badge */}
                              <Badge
                                variant="outline"
                                className={`text-[10px] px-1.5 py-0 border ${categoryColors[mod.trainingCategory]}`}
                              >
                                {categoryLabels[mod.trainingCategory]}
                              </Badge>

                              {/* Type Badge */}
                              <Badge
                                variant="outline"
                                className={`text-[10px] px-1.5 py-0 border flex items-center gap-1 ${typeStyle.color}`}
                              >
                                <TypeIcon className="h-3 w-3" />
                                {typeStyle.label}
                              </Badge>

                              {/* Status Badge */}
                              {mod.isPublished ? (
                                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none text-[10px] px-1.5 py-0">
                                  Terbit
                                </Badge>
                              ) : (
                                <Badge className="bg-slate-100 text-slate-500 hover:bg-slate-100 border-none text-[10px] px-1.5 py-0">
                                  Draf
                                </Badge>
                              )}
                            </div>

                            {mod.description && (
                              <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                                {mod.description}
                              </p>
                            )}

                            {/* Details meta */}
                            <div className="flex items-center gap-3 mt-2 text-xs text-slate-400 flex-wrap">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5 text-slate-400" />
                                {mod.durationMinutes} menit
                              </span>

                              {mod.pageCount > 0 && (
                                <span className="flex items-center gap-1">
                                  <FileText className="h-3.5 w-3.5 text-slate-400" />
                                  {mod.pageCount} halaman
                                </span>
                              )}

                              {mod.fileName && (
                                <span className="flex items-center gap-1 text-blue-600 font-medium">
                                  <Paperclip className="h-3.5 w-3.5" />
                                  {mod.fileName} {mod.fileSize && `(${mod.fileSize})`}
                                </span>
                              )}

                              {mod.videoUrl && (
                                <span className="flex items-center gap-1 text-red-600 font-medium">
                                  <Video className="h-3.5 w-3.5" />
                                  Video Link
                                </span>
                              )}

                              {mod._count?.progressRecords !== undefined && (
                                <span className="text-slate-400">
                                  · Dibaca {mod._count.progressRecords} peserta
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                          {/* Publish Toggle Button */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTogglePublish(mod)}
                            title={mod.isPublished ? "Ubah ke Draf" : "Terbitkan Modul"}
                            className={`h-8 text-xs font-medium border ${
                              mod.isPublished
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            {mod.isPublished ? (
                              <>
                                <Check className="h-3.5 w-3.5 mr-1" />
                                Terbit
                              </>
                            ) : (
                              <>
                                <X className="h-3.5 w-3.5 mr-1" />
                                Draf
                              </>
                            )}
                          </Button>

                          {/* Preview Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setPreviewModule(mod);
                              setIsPreviewOpen(true);
                            }}
                            title="Pratinjau Modul"
                            className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          {/* Edit Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEdit(mod)}
                            title="Edit Modul"
                            className="h-8 w-8 p-0 text-slate-500 hover:text-amber-600 hover:bg-amber-50"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          {/* Delete Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setDeletingModule(mod);
                              setIsDeleteOpen(true);
                            }}
                            title="Hapus Modul"
                            className="h-8 w-8 p-0 text-slate-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        /* ─── Table View ───────────────────────────────────────────────────── */
        <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 w-12 text-center">No</th>
                  <th className="py-3.5 px-4">Modul & Deskripsi</th>
                  <th className="py-3.5 px-4">Kategori Pelatihan</th>
                  <th className="py-3.5 px-4">Hari & Urutan</th>
                  <th className="py-3.5 px-4">Tipe & Durasi</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {modules.map((mod, idx) => {
                  const TypeIcon = typeConfig[mod.moduleType]?.icon || FileText;
                  const typeStyle = typeConfig[mod.moduleType] || typeConfig.reading;

                  return (
                    <tr key={mod.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 text-center text-xs text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4 max-w-sm">
                        <p className="font-semibold text-slate-900 text-sm">{mod.title}</p>
                        {mod.description && (
                          <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                            {mod.description}
                          </p>
                        )}
                        {mod.fileName && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-blue-600 font-medium mt-1">
                            <Paperclip className="h-3 w-3" />
                            {mod.fileName}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant="outline"
                          className={`text-xs border ${categoryColors[mod.trainingCategory]}`}
                        >
                          {categoryLabels[mod.trainingCategory]}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-xs">
                          <span className="font-medium text-slate-800">Hari {mod.dayNumber}</span>
                          <span className="text-slate-400 ml-1.5">(Urutan: #{mod.orderIndex})</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1">
                          <Badge
                            variant="outline"
                            className={`w-fit text-[11px] border flex items-center gap-1 ${typeStyle.color}`}
                          >
                            <TypeIcon className="h-3 w-3" />
                            {typeStyle.label}
                          </Badge>
                          <span className="text-[11px] text-slate-400">
                            {mod.durationMinutes} menit · {mod.pageCount} hlm
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleTogglePublish(mod)}
                          className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border transition-colors ${
                            mod.isPublished
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                              : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                          }`}
                        >
                          {mod.isPublished ? "Terbit" : "Draf"}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setPreviewModule(mod);
                              setIsPreviewOpen(true);
                            }}
                            className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEdit(mod)}
                            className="h-8 w-8 p-0 text-slate-500 hover:text-amber-600"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setDeletingModule(mod);
                              setIsDeleteOpen(true);
                            }}
                            className="h-8 w-8 p-0 text-slate-500 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ─── Modal Form Tambah / Edit Modul ──────────────────────────────────── */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">
              {editingModule ? "Edit Modul Pembelajaran" : "Tambah Modul Pembelajaran Baru"}
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              Isi parameter modul materi pelatihan, lampiran berkas, durasi, dan isi konten lengkap.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveModule} className="space-y-4 pt-2">
            {/* Row 1: Kategori, Hari, Urutan */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Kategori Pelatihan <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.trainingCategory}
                  onChange={(e) => setFormData({ ...formData, trainingCategory: e.target.value })}
                  className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="PPR_ANALISIS">PPR Industri Tk. 1 (Analisis)</option>
                  <option value="PPR_BAGASI">PPR Medik Tk. 2 (Bagasi)</option>
                  <option value="PKR_PEKERJA">PKR Pekerja Radiasi</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Hari Pelatihan <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.dayNumber}
                  onChange={(e) => setFormData({ ...formData, dayNumber: parseInt(e.target.value, 10) })}
                  className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value={1}>Hari 1</option>
                  <option value={2}>Hari 2</option>
                  <option value={3}>Hari 3</option>
                  <option value={4}>Hari 4</option>
                  <option value={5}>Hari 5</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Urutan Materi <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  min={1}
                  value={formData.orderIndex}
                  onChange={(e) => setFormData({ ...formData, orderIndex: parseInt(e.target.value, 10) || 1 })}
                  className="h-9 text-xs"
                  required
                />
              </div>
            </div>

            {/* Row 2: Judul Modul */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Judul Modul <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Contoh: Modul 1.1 - Pengantar Proteksi Radiasi dan Regulasi BAPETEN"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="h-9 text-xs"
                required
              />
            </div>

            {/* Row 3: Deskripsi Singkat */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Deskripsi Singkat
              </label>
              <textarea
                placeholder="Rangkuman pokok materi yang dipelajari pada modul ini..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="w-full rounded-md border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Row 4: Tipe Modul, Durasi, Jumlah Halaman */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Tipe Modul
                </label>
                <select
                  value={formData.moduleType}
                  onChange={(e) => setFormData({ ...formData, moduleType: e.target.value })}
                  className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="reading">Membaca Teks (Reading)</option>
                  <option value="video">Video Tutorial</option>
                  <option value="file">Berkas / Slide PDF (Unduhan)</option>
                  <option value="quiz">Kuis / Evaluasi Pemahaman</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Estimasi Durasi (Menit)
                </label>
                <Input
                  type="number"
                  min={5}
                  step={5}
                  value={formData.durationMinutes}
                  onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value, 10) || 45 })}
                  className="h-9 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Estimasi Halaman / Slide
                </label>
                <Input
                  type="number"
                  min={1}
                  value={formData.pageCount}
                  onChange={(e) => setFormData({ ...formData, pageCount: parseInt(e.target.value, 10) || 1 })}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            {/* Row 5: Video URL (jika tipe video atau ada video) */}
            {(formData.moduleType === "video" || formData.videoUrl) && (
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  URL Video Pembelajaran (YouTube / Vimeo / MP4 Link)
                </label>
                <Input
                  placeholder="https://www.youtube.com/watch?v=... atau https://youtu.be/..."
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>
            )}

            {/* Row 6: Upload Berkas Materi (PDF / PPT / Slide) */}
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Paperclip className="h-3.5 w-3.5 text-blue-600" />
                  Lampiran Berkas Materi (PDF / PPTX / DOCX)
                </label>

                {formData.fileUrl && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, fileUrl: "", fileName: "", fileSize: "" })}
                    className="text-[11px] text-red-600 hover:underline"
                  >
                    Hapus Berkas
                  </button>
                )}
              </div>

              {formData.fileUrl ? (
                <div className="flex items-center justify-between p-2.5 bg-white rounded border border-blue-200">
                  <div className="flex items-center gap-2">
                    <FileDown className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-xs font-medium text-slate-800">{formData.fileName || "Berkas Materi"}</p>
                      <p className="text-[10px] text-slate-400">{formData.fileSize || "Tersimpan di server"}</p>
                    </div>
                  </div>
                  <a
                    href={formData.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                  >
                    Lihat <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".pdf,.pptx,.ppt,.docx,.doc,.xlsx,.zip,.mp4"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isUploadingFile}
                    onClick={() => fileInputRef.current?.click()}
                    className="h-8 text-xs bg-white"
                  >
                    <Upload className={`h-3.5 w-3.5 mr-1.5 ${isUploadingFile ? "animate-spin" : ""}`} />
                    {isUploadingFile ? "Mengunggah..." : "Unggah Berkas Materi"}
                  </Button>
                  <span className="text-[11px] text-slate-400">
                    Atau masukkan link eksternal di bawah:
                  </span>
                </div>
              )}

              {!formData.fileName && (
                <Input
                  placeholder="Atau URL berkas eksternal (Google Drive / link cloud)..."
                  value={formData.fileUrl}
                  onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                  className="h-8 text-xs bg-white"
                />
              )}
            </div>

            {/* Row 7: Content Editor with Tabs */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">
                  Konten Lengkap Materi (Teks / Format HTML)
                </label>
                <div className="inline-flex rounded border border-slate-200 p-0.5 bg-slate-50 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setContentTab("edit")}
                    className={`px-2 py-0.5 rounded font-medium ${
                      contentTab === "edit" ? "bg-white text-blue-600 shadow-xs" : "text-slate-500"
                    }`}
                  >
                    Editor Teks
                  </button>
                  <button
                    type="button"
                    onClick={() => setContentTab("preview")}
                    className={`px-2 py-0.5 rounded font-medium ${
                      contentTab === "preview" ? "bg-white text-blue-600 shadow-xs" : "text-slate-500"
                    }`}
                  >
                    Pratinjau HTML
                  </button>
                </div>
              </div>

              {contentTab === "edit" ? (
                <textarea
                  placeholder="Tuliskan naskah materi lengkap di sini. Mendukung tag HTML standar seperti <h2>, <p>, <ul>, <li>, <strong>, <table>, dsb..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={8}
                  className="w-full rounded-md border border-slate-200 p-3 font-mono text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
                />
              ) : (
                <div className="w-full rounded-md border border-slate-200 p-4 bg-slate-50/50 min-h-[160px] max-h-[300px] overflow-y-auto prose prose-sm max-w-none text-slate-800 text-xs">
                  {formData.content ? (
                    <div dangerouslySetInnerHTML={{ __html: formData.content }} />
                  ) : (
                    <p className="text-slate-400 italic">Belum ada konten materi yang ditulis.</p>
                  )}
                </div>
              )}
            </div>

            {/* Row 8: Status Terbit Switch */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <p className="text-xs font-semibold text-slate-800">Status Publikasi</p>
                <p className="text-[11px] text-slate-500">
                  {formData.isPublished
                    ? "Modul ini langsung dapat dilihat dan dipelajari peserta pada LMS."
                    : "Modul disimpan sebagai draf dan belum tampil bagi peserta."}
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {/* Dialog Footer */}
            <DialogFooter className="pt-2 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsFormOpen(false)}
                disabled={formSubmitting}
              >
                Batal
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={formSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {formSubmitting ? "Menyimpan..." : editingModule ? "Simpan Perubahan" : "Buat Modul"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── Modal Pratinjau (Preview) ───────────────────────────────────────── */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {previewModule && (
            <div className="space-y-5">
              <DialogHeader>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className={`text-xs ${categoryColors[previewModule.trainingCategory]}`}>
                    {categoryLabels[previewModule.trainingCategory]}
                  </Badge>
                  <Badge variant="outline" className="text-xs bg-slate-100 text-slate-700">
                    Hari ke-{previewModule.dayNumber} · Modul #{previewModule.orderIndex}
                  </Badge>
                </div>
                <DialogTitle className="text-xl font-bold text-slate-900">
                  {previewModule.title}
                </DialogTitle>
                {previewModule.description && (
                  <DialogDescription className="text-sm text-slate-600 mt-1">
                    {previewModule.description}
                  </DialogDescription>
                )}
              </DialogHeader>

              {/* Meta bar */}
              <div className="flex items-center gap-4 py-2 px-3 bg-slate-50 rounded-lg text-xs text-slate-600 border border-slate-200">
                <span className="flex items-center gap-1.5 font-medium">
                  <Clock className="h-4 w-4 text-blue-600" />
                  Estimasi: {previewModule.durationMinutes} Menit
                </span>
                <span>·</span>
                <span className="flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-slate-500" />
                  {previewModule.pageCount} Halaman
                </span>
                <span>·</span>
                <span>
                  Status:{" "}
                  <strong className={previewModule.isPublished ? "text-emerald-600" : "text-amber-600"}>
                    {previewModule.isPublished ? "Terbit (Aktif)" : "Draf (Belum Terbit)"}
                  </strong>
                </span>
              </div>

              {/* Video Player if videoUrl */}
              {previewModule.videoUrl && (
                <div className="rounded-xl overflow-hidden border border-slate-200 bg-black aspect-video flex items-center justify-center">
                  {previewModule.videoUrl.includes("youtube.com") || previewModule.videoUrl.includes("youtu.be") ? (
                    <iframe
                      src={
                        previewModule.videoUrl.includes("watch?v=")
                          ? previewModule.videoUrl.replace("watch?v=", "embed/")
                          : previewModule.videoUrl.replace("youtu.be/", "www.youtube.com/embed/")
                      }
                      title={previewModule.title}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div className="p-6 text-center text-white">
                      <PlayCircle className="h-12 w-12 mx-auto mb-2 text-red-500" />
                      <p className="text-sm font-semibold">Tautan Video Pembelajaran</p>
                      <a
                        href={previewModule.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-400 hover:underline mt-1 inline-block"
                      >
                        Buka Video di Tab Baru &rarr;
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Download File Card if fileUrl */}
              {previewModule.fileUrl && (
                <div className="flex items-center justify-between p-4 bg-blue-50/70 border border-blue-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                      <FileDown className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {previewModule.fileName || "Berkas Materi Pembelajaran"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {previewModule.fileSize || "Format PDF/Slide Presentasi"} · Siap diunduh
                      </p>
                    </div>
                  </div>

                  <a
                    href={previewModule.fileUrl}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Unduh Berkas
                  </a>
                </div>
              )}

              {/* Main Rich Content */}
              <div className="border-t border-slate-200 pt-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                  Naskah Materi
                </h4>
                {previewModule.content ? (
                  <div
                    className="prose prose-sm max-w-none text-slate-800 leading-relaxed bg-white p-5 rounded-xl border border-slate-100 shadow-xs"
                    dangerouslySetInnerHTML={{ __html: previewModule.content }}
                  />
                ) : (
                  <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs italic">
                    Modul ini belum memiliki naskah teks lengkap. Silakan klik tombol Edit untuk menambahkan materi.
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPreviewOpen(false)}
                >
                  Tutup Pratinjau
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setIsPreviewOpen(false);
                    handleOpenEdit(previewModule);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Edit className="h-4 w-4 mr-1.5" />
                  Edit Modul Ini
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── Modal Konfirmasi Hapus ─────────────────────────────────────────── */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="h-10 w-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-2">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <DialogTitle className="text-center text-lg font-bold text-slate-900">
              Hapus Modul Pembelajaran?
            </DialogTitle>
            <DialogDescription className="text-center text-xs text-slate-500">
              Apakah Anda yakin ingin menghapus modul{" "}
              <strong className="text-slate-800 font-semibold">
                &ldquo;{deletingModule?.title}&rdquo;
              </strong>
              ? Data modul dan riwayat pembacaan peserta terkait akan dihapus secara permanen.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:justify-center pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDeleteModule}
              className="bg-red-600 hover:bg-red-700"
            >
              Ya, Hapus Modul
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
