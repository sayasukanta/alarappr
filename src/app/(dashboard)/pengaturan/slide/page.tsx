"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import {
  Images,
  Plus,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  Upload,
  Link as LinkIcon,
  RefreshCw,
  Loader2,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Maximize2,
  AlertCircle,
  ArrowUpDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { HeroSlideCarousel, SlideItem } from "@/components/HeroSlideCarousel";

export default function PengaturanSlidePage() {
  const [slides, setSlides] = useState<SlideItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Form modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<SlideItem | null>(null);

  // Form fields
  const [formTitle, setFormTitle] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formLinkUrl, setFormLinkUrl] = useState("");
  const [formIsTampil, setFormIsTampil] = useState<1 | 2>(1);
  const [formOrderIndex, setFormOrderIndex] = useState(1);

  // Uploading state
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Delete modal
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Zoom modal
  const [zoomSlide, setZoomSlide] = useState<SlideItem | null>(null);

  const fetchSlides = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/slides");
      if (res.ok) {
        const json = await res.json();
        setSlides(json.data ?? []);
      } else {
        toast.error("Gagal memuat data slide");
      }
    } catch {
      toast.error("Terjadi kesalahan koneksi");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSlides();
  }, [fetchSlides]);

  const openCreate = () => {
    setEditingSlide(null);
    setFormTitle("");
    setFormImageUrl("");
    setFormLinkUrl("/pendaftaran");
    setFormIsTampil(1); // Default = 1 (Tampil)
    setFormOrderIndex(slides.length + 1);
    setModalOpen(true);
  };

  const openEdit = (slide: SlideItem) => {
    setEditingSlide(slide);
    setFormTitle(slide.title ?? "");
    setFormImageUrl(slide.imageUrl);
    setFormLinkUrl(slide.linkUrl ?? "");
    setFormIsTampil(slide.isTampil === 2 ? 2 : 1);
    setFormOrderIndex(slide.orderIndex);
    setModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/slides/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Gagal mengunggah gambar");
      }

      setFormImageUrl(json.fileUrl);
      if (!formTitle) {
        const autoTitle = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
        setFormTitle(autoTitle.charAt(0).toUpperCase() + autoTitle.slice(1));
      }
      toast.success("Gambar slide berhasil diunggah!");
    } catch (err: any) {
      toast.error(err.message || "Gagal mengunggah berkas");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formImageUrl.trim()) {
      toast.error("URL atau berkas gambar wajib diisi");
      return;
    }

    setActionLoading(true);
    try {
      const url = editingSlide
        ? `/api/admin/slides/${editingSlide.id}`
        : "/api/admin/slides";
      const method = editingSlide ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle,
          imageUrl: formImageUrl,
          linkUrl: formLinkUrl,
          isTampil: formIsTampil,
          orderIndex: formOrderIndex,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal menyimpan slide");

      toast.success(editingSlide ? "Slide berhasil diperbarui" : "Slide berhasil ditambahkan");
      setModalOpen(false);
      await fetchSlides();
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan data slide");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleTampil = async (slide: SlideItem) => {
    const nextVal: 1 | 2 = slide.isTampil === 1 ? 2 : 1;
    try {
      const res = await fetch(`/api/admin/slides/${slide.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isTampil: nextVal }),
      });
      if (!res.ok) throw new Error();

      setSlides((prev) =>
        prev.map((s) => (s.id === slide.id ? { ...s, isTampil: nextVal } : s))
      );
      toast.success(
        nextVal === 1
          ? `Slide "${slide.title || "Flyer"}" diaktifkan (Tampil)`
          : `Slide "${slide.title || "Flyer"}" disembunyikan (Tidak Tampil)`
      );
    } catch {
      toast.error("Gagal mengubah status tampil slide");
    }
  };

  const handleDelete = async (id: number) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/slides/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();

      toast.success("Slide berhasil dihapus");
      setDeleteConfirmId(null);
      await fetchSlides();
    } catch {
      toast.error("Gagal menghapus slide");
    } finally {
      setActionLoading(false);
    }
  };

  const activeCount = slides.filter((s) => s.isTampil === 1).length;
  const inactiveCount = slides.filter((s) => s.isTampil === 2).length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Images className="w-6 h-6 text-blue-600" />
            Pengaturan Slide Laman Depan
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Kelola gambar poster dan flyer pelatihan yang tampil pada kolom kanan Hero halaman depan
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSlides}
            disabled={loading}
            title="Muat ulang data"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </Button>
          <Button
            size="sm"
            onClick={openCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Tambah Slide
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border border-slate-200 shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Slide
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{slides.length}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Images className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-emerald-200 bg-emerald-50/20 shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                Status Tampil (is_tampil = 1)
              </p>
              <p className="text-2xl font-bold text-emerald-700 mt-1">{activeCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Eye className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Tidak Tampil (is_tampil = 2)
              </p>
              <p className="text-2xl font-bold text-slate-600 mt-1">{inactiveCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <EyeOff className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid: Daftar Slide (Kiri) & Live Preview (Kanan) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Table & List (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <Card className="border border-slate-200 shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900">
                    Daftar Slide Banner
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Slide dengan status &ldquo;1 = Tampil&rdquo; akan otomatis berotasi di halaman depan
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-xs font-normal">
                  Urutan Naik (1, 2, 3...)
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-6 space-y-3">
                  {Array(3)
                    .fill(0)
                    .map((_, i) => (
                      <Skeleton key={i} className="h-20 w-full rounded-xl" />
                    ))}
                </div>
              ) : slides.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <Images className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-700">Belum ada slide banner</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Klik tombol &ldquo;Tambah Slide&rdquo; untuk mengunggah flyer atau banner pelatihan Anda.
                  </p>
                  <Button size="sm" onClick={openCreate} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white text-xs">
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Tambah Slide Pertama
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {slides.map((slide) => {
                    const isShown = slide.isTampil === 1;
                    return (
                      <div
                        key={slide.id}
                        className={cn(
                          "p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors hover:bg-slate-50/70",
                          !isShown && "bg-slate-50/40 opacity-75"
                        )}
                      >
                        {/* Left: Thumbnail & Info */}
                        <div className="flex items-center gap-3.5 min-w-0 flex-1">
                          <div
                            onClick={() => setZoomSlide(slide)}
                            className="relative w-16 h-20 sm:w-20 sm:h-24 rounded-lg bg-slate-900 overflow-hidden shrink-0 border border-slate-200 cursor-pointer shadow-2xs group/thumb"
                            title="Klik untuk melihat ukuran penuh"
                          >
                            <Image
                              src={slide.imageUrl}
                              alt={slide.title || "Slide Thumbnail"}
                              fill
                              sizes="80px"
                              className="object-cover group-hover/thumb:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity text-white">
                              <Maximize2 className="w-4 h-4" />
                            </div>
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                                #{slide.orderIndex}
                              </span>
                              <h4 className="font-bold text-slate-900 text-sm truncate">
                                {slide.title || "Tanpa Judul"}
                              </h4>
                            </div>

                            <p className="text-xs text-slate-500 font-mono truncate max-w-sm">
                              {slide.imageUrl}
                            </p>

                            {slide.linkUrl && (
                              <div className="flex items-center gap-1 text-[11px] text-blue-600 mt-1 truncate">
                                <LinkIcon className="w-3 h-3 shrink-0" />
                                <span className="truncate">{slide.linkUrl}</span>
                              </div>
                            )}

                            <div className="flex items-center gap-2 mt-2">
                              {isShown ? (
                                <Badge className="bg-emerald-100 hover:bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px] font-semibold gap-1">
                                  <Eye className="w-3 h-3 text-emerald-600" />
                                  1 = Tampil (Aktif)
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-300 text-[10px] font-semibold gap-1">
                                  <EyeOff className="w-3 h-3 text-slate-500" />
                                  2 = Tidak Tampil
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                          {/* Toggle is_tampil button */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleTampil(slide)}
                            className={cn(
                              "h-8 text-xs font-semibold gap-1",
                              isShown
                                ? "text-amber-700 border-amber-200 hover:bg-amber-50"
                                : "text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                            )}
                            title={isShown ? "Sembunyikan dari halaman depan" : "Tampilkan di halaman depan"}
                          >
                            {isShown ? (
                              <>
                                <EyeOff className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Sembunyikan</span>
                              </>
                            ) : (
                              <>
                                <Eye className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Tampilkan</span>
                              </>
                            )}
                          </Button>

                          {/* Edit button */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEdit(slide)}
                            className="h-8 w-8 p-0 text-slate-700 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-300"
                            title="Edit Slide"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>

                          {/* Delete button */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteConfirmId(slide.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:border-red-300"
                            title="Hapus Slide"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Live Preview (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="border border-slate-200 shadow-xs bg-slate-900 text-white overflow-hidden">
            <CardHeader className="pb-3 border-b border-slate-800 bg-slate-950/60">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  Pratinjau di Laman Depan
                </CardTitle>
                <Badge variant="outline" className="text-[10px] text-cyan-300 border-cyan-500/30">
                  Live Preview
                </Badge>
              </div>
              <CardDescription className="text-xs text-slate-400">
                Tampilan carousel slide yang dilihat pengunjung pada kolom kanan Hero landing page.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <HeroSlideCarousel initialSlides={slides.filter((s) => s.isTampil === 1)} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ─── Modal Form Tambah / Edit Slide ─── */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Images className="w-5 h-5 text-blue-600" />
              {editingSlide ? "Edit Slide Banner" : "Tambah Slide Banner Baru"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 pt-2">
            {/* Image upload / URL */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-700">Berkas Gambar Slide / Flyer *</Label>

              {/* Upload box */}
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center bg-slate-50/60 hover:bg-slate-50 transition-colors">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="gap-2 bg-white"
                >
                  {uploading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  ) : (
                    <Upload className="w-4 h-4 text-blue-600" />
                  )}
                  {uploading ? "Sedang Mengunggah..." : "Pilih Berkas Gambar dari Komputer"}
                </Button>
                <p className="text-[11px] text-slate-400 mt-2">
                  Format yang didukung: PNG, JPG, JPEG, WEBP (Maksimal 20 MB). Rasio poster vertikal (3:4 atau 4:5) paling optimal.
                </p>
              </div>

              {/* Or manual URL */}
              <div className="space-y-1 pt-1">
                <Label className="text-[11px] text-slate-500">Atau masukkan URL / path gambar langsung:</Label>
                <Input
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  placeholder="/uploads/slides/... atau https://..."
                  required
                />
              </div>

              {/* Image preview */}
              {formImageUrl && (
                <div className="mt-2 p-2 rounded-xl bg-slate-900 border border-slate-200 flex items-center gap-3">
                  <div className="relative w-16 h-20 rounded-md overflow-hidden bg-black shrink-0">
                    <img
                      src={formImageUrl}
                      alt="Pratinjau"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="text-white text-xs min-w-0">
                    <p className="font-semibold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Gambar Terpilih
                    </p>
                    <p className="text-[11px] text-slate-300 truncate max-w-sm mt-0.5">
                      {formImageUrl}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Judul / Keterangan Slide (Opsional)</Label>
              <Input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Contoh: Pelatihan PPR Pemindai Bagasi"
              />
            </div>

            {/* Link URL */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Tautan Tujuan / Link URL</Label>
              <Input
                value={formLinkUrl}
                onChange={(e) => setFormLinkUrl(e.target.value)}
                placeholder="/pendaftaran atau tautan eksternal"
              />
              <p className="text-[11px] text-slate-400">
                Ketika flyer diklik atau tombol Daftar pada flyer ditekan, pengguna akan diarahkan ke tautan ini.
              </p>
            </div>

            {/* Status is_tampil & Order Index */}
            <div className="grid grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Status Tampil (is_tampil) *</Label>
                <Select
                  value={formIsTampil.toString()}
                  onValueChange={(val) => {
                    if (val) setFormIsTampil(parseInt(val) as 1 | 2);
                  }}
                >
                  <SelectTrigger className="w-full h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 = Tampil (Aktif)</SelectItem>
                    <SelectItem value="2">2 = Tidak Tampil (Disembunyikan)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-slate-400">
                  Default = 1 (Langsung tampil di beranda).
                </p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Urutan Slide (order_index) *</Label>
                <Input
                  type="number"
                  min={1}
                  value={formOrderIndex}
                  onChange={(e) => setFormOrderIndex(parseInt(e.target.value) || 1)}
                  required
                />
                <p className="text-[11px] text-slate-400">
                  Nomor urut rotasi tampil (misal: 1, 2, 3...).
                </p>
              </div>
            </div>

            <DialogFooter className="gap-2 pt-3 border-t">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Batal
              </Button>
              <Button
                type="submit"
                disabled={actionLoading || !formImageUrl.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                {actionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : editingSlide ? (
                  "Simpan Perubahan"
                ) : (
                  "Tambah Slide"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── Modal Hapus Slide ─── */}
      <Dialog open={deleteConfirmId !== null} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-red-600">Hapus Slide Ini?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            Slide ini akan dihapus secara permanen dari rotasi carousel beranda depan.
          </p>
          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              disabled={actionLoading}
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Modal Zoom Flyer ─── */}
      <Dialog open={!!zoomSlide} onOpenChange={() => setZoomSlide(null)}>
        <DialogContent className="sm:max-w-3xl max-h-[92vh] overflow-y-auto p-4 bg-slate-950 text-white border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-white text-base">
              {zoomSlide?.title || "Pratinjau Flyer Slide"}
            </DialogTitle>
          </DialogHeader>
          {zoomSlide && (
            <div className="relative w-full max-h-[75vh] min-h-[40vh] flex items-center justify-center my-2 rounded-xl overflow-hidden bg-black/60 p-2">
              <img
                src={zoomSlide.imageUrl}
                alt={zoomSlide.title || "Flyer"}
                className="max-h-[70vh] w-auto object-contain rounded-lg shadow-2xl"
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setZoomSlide(null)} className="border-slate-700 text-slate-300">
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
