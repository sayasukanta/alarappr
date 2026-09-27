"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  PanelBottom,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Save,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  Building2,
  CreditCard,
  FileCheck2,
  Globe,
  Info,
  ChevronRight,
  Eye,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { DEFAULT_FOOTER_SETTINGS } from "@/lib/footer-constants";

interface FooterFormData {
  phone: string;
  email: string;
  address: string;
  mapUrl: string;
  brandTitle: string;
  brandSubtitle: string;
  brandDescription: string;
  institutionName: string;
  ktunNumber: string;
  bankName: string;
  bankAccountName: string;
  copyrightText: string;
  footerKtunText: string;
}

export default function PengaturanFooterPage() {
  const { data: session, status } = useSession();
  const [formData, setFormData] = useState<FooterFormData>({
    phone: DEFAULT_FOOTER_SETTINGS.phone,
    email: DEFAULT_FOOTER_SETTINGS.email,
    address: DEFAULT_FOOTER_SETTINGS.address,
    mapUrl: DEFAULT_FOOTER_SETTINGS.mapUrl || "",
    brandTitle: DEFAULT_FOOTER_SETTINGS.brandTitle,
    brandSubtitle: DEFAULT_FOOTER_SETTINGS.brandSubtitle,
    brandDescription: DEFAULT_FOOTER_SETTINGS.brandDescription,
    institutionName: DEFAULT_FOOTER_SETTINGS.institutionName,
    ktunNumber: DEFAULT_FOOTER_SETTINGS.ktunNumber,
    bankName: DEFAULT_FOOTER_SETTINGS.bankName,
    bankAccountName: DEFAULT_FOOTER_SETTINGS.bankAccountName,
    copyrightText: DEFAULT_FOOTER_SETTINGS.copyrightText,
    footerKtunText: DEFAULT_FOOTER_SETTINGS.footerKtunText,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [showLivePreview, setShowLivePreview] = useState(true);

  // Fetch current footer settings
  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        const res = await fetch("/api/footer-settings");
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            setFormData({
              phone: json.data.phone || DEFAULT_FOOTER_SETTINGS.phone,
              email: json.data.email || DEFAULT_FOOTER_SETTINGS.email,
              address: json.data.address || DEFAULT_FOOTER_SETTINGS.address,
              mapUrl: json.data.mapUrl || DEFAULT_FOOTER_SETTINGS.mapUrl,
              brandTitle: json.data.brandTitle || DEFAULT_FOOTER_SETTINGS.brandTitle,
              brandSubtitle: json.data.brandSubtitle || DEFAULT_FOOTER_SETTINGS.brandSubtitle,
              brandDescription: json.data.brandDescription || DEFAULT_FOOTER_SETTINGS.brandDescription,
              institutionName: json.data.institutionName || DEFAULT_FOOTER_SETTINGS.institutionName,
              ktunNumber: json.data.ktunNumber || DEFAULT_FOOTER_SETTINGS.ktunNumber,
              bankName: json.data.bankName || DEFAULT_FOOTER_SETTINGS.bankName,
              bankAccountName: json.data.bankAccountName || DEFAULT_FOOTER_SETTINGS.bankAccountName,
              copyrightText: json.data.copyrightText || DEFAULT_FOOTER_SETTINGS.copyrightText,
              footerKtunText: json.data.footerKtunText || DEFAULT_FOOTER_SETTINGS.footerKtunText,
            });
          }
        }
      } catch (err) {
        console.error("Failed to load footer settings", err);
        toast.error("Gagal memuat data pengaturan footer.");
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch("/api/admin/footer-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Gagal menyimpan perubahan");
      }

      toast.success("Pengaturan Footer Berhasil Disimpan!", {
        description: "Informasi footer dan kontak landing page telah diperbarui secara langsung.",
      });
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Terjadi kesalahan saat menyimpan pengaturan footer.");
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefault = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/admin/footer-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset_default" }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Gagal mereset pengaturan footer");
      }

      if (json.data) {
        setFormData({
          phone: json.data.phone,
          email: json.data.email,
          address: json.data.address,
          mapUrl: json.data.mapUrl || "",
          brandTitle: json.data.brandTitle,
          brandSubtitle: json.data.brandSubtitle,
          brandDescription: json.data.brandDescription,
          institutionName: json.data.institutionName,
          ktunNumber: json.data.ktunNumber,
          bankName: json.data.bankName,
          bankAccountName: json.data.bankAccountName,
          copyrightText: json.data.copyrightText,
          footerKtunText: json.data.footerKtunText,
        });
      }

      setResetDialogOpen(false);
      toast.success("Pengaturan Footer Direset!", {
        description: "Seluruh informasi telah dikembalikan ke standar awal sistem ALARA.",
      });
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Gagal mereset pengaturan footer.");
    } finally {
      setSaving(false);
    }
  };

  const role = (session?.user as any)?.role;

  if (status === "loading" || loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-sm text-slate-500">Memuat pengaturan footer...</p>
        </div>
      </div>
    );
  }

  // Check admin permission
  if (role !== "ADMIN") {
    return (
      <Card className="max-w-2xl mx-auto p-8 text-center space-y-4 my-12 border-red-200 bg-red-50/50">
        <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Akses Dibatasi</h2>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          Halaman Pengaturan Footer landing page hanya dapat diakses dan diubah oleh Administrator sistem ALARA.
        </p>
        <div>
          <Link href="/dashboard">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white text-xs">
              Kembali ke Dashboard
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shadow-xs">
              <PanelBottom className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Pengaturan Footer
                </h1>
                <Badge className="bg-blue-600 text-white text-[11px] font-semibold">
                  Landing Page
                </Badge>
              </div>
              <p className="text-sm text-slate-500">
                Kelola informasi kontak "Hubungi Kami", identitas lembaga, nomor rekening, dan hak cipta di landing page
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-xs transition-colors"
          >
            <Globe className="h-4 w-4 text-blue-600" />
            Lihat Landing Page
            <ExternalLink className="h-3 w-3 text-slate-400" />
          </a>

          <Button
            type="button"
            variant="outline"
            onClick={() => setResetDialogOpen(true)}
            disabled={saving}
            className="text-xs h-9 font-semibold text-slate-600 border-slate-200 hover:bg-slate-100 gap-1.5"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Default
          </Button>

          <Button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-9 gap-1.5 shadow-xs cursor-pointer"
          >
            <Save className="h-4 w-4" />
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* ── CARD 1: Hubungi Kami (Kontak & Peta) ── */}
        <Card className="p-6 bg-white border border-slate-200 shadow-xs rounded-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Data "Hubungi Kami" (Kontak & Lokasi Peta)
                </h2>
                <p className="text-xs text-slate-500">
                  Informasi kontak yang ditampilkan pada section Hubungi Kami di bagian bawah landing page
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-emerald-700 border-emerald-200 bg-emerald-50 text-xs">
              Live di Beranda
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Phone / WhatsApp */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-blue-600" />
                Nomor Telepon / WhatsApp
                <span className="text-red-500">*</span>
              </label>
              <Input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+62 812-3456-7890"
                required
                className="text-sm font-medium"
              />
              <p className="text-[11px] text-slate-400">
                Format nomor internasional (diawali +62). Otomatis terhubung dengan tombol "Kirim Pesan" WhatsApp di landing page.
              </p>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-blue-600" />
                Alamat Email Resmi
                <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="info@hikmatproteksi.com"
                required
                className="text-sm font-medium"
              />
              <p className="text-[11px] text-slate-400">
                Email operasional resmi lembaga untuk konsultasi pendaftaran peserta.
              </p>
            </div>

            {/* Address / Location Text */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-blue-600" />
                Nama Lokasi / Kota
                <span className="text-red-500">*</span>
              </label>
              <Input
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Jakarta, Indonesia"
                required
                className="text-sm font-medium"
              />
              <p className="text-[11px] text-slate-400">
                Teks lokasi ringkas yang muncul pada kartu lokasi di landing page.
              </p>
            </div>

            {/* Google Maps URL */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-blue-600" />
                  Link Lokasi Google Maps
                </label>
                {formData.mapUrl && (
                  <a
                    href={formData.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-blue-600 hover:underline flex items-center gap-1"
                  >
                    Uji Tautan Map <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
              <Input
                name="mapUrl"
                value={formData.mapUrl}
                onChange={handleChange}
                placeholder="https://maps.google.com/?q=Jakarta"
                className="text-sm font-medium"
              />
              <p className="text-[11px] text-slate-400">
                URL Google Maps (link pencarian atau tautan berbagi). Peserta dapat mengklik tautan ini untuk langsung membuka rute lokasi.
              </p>
            </div>
          </div>
        </Card>

        {/* ── CARD 2: Identitas Brand Footer ── */}
        <Card className="p-6 bg-white border border-slate-200 shadow-xs rounded-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Identitas Brand & Deskripsi Footer
                </h2>
                <p className="text-xs text-slate-500">
                  Kolom pertama di footer landing page yang memuat logo, nama sistem, dan pengantar lembaga
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Judul Brand Sistem
                <span className="text-red-500">*</span>
              </label>
              <Input
                name="brandTitle"
                value={formData.brandTitle}
                onChange={handleChange}
                placeholder="ALARA Training System"
                required
                className="text-sm font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Subjudul Lembaga
                <span className="text-red-500">*</span>
              </label>
              <Input
                name="brandSubtitle"
                value={formData.brandSubtitle}
                onChange={handleChange}
                placeholder="CV. Hikmat Proteksi ALARA"
                required
                className="text-sm font-medium"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-700">
                Deskripsi Lembaga di Footer
                <span className="text-red-500">*</span>
              </label>
              <Textarea
                name="brandDescription"
                value={formData.brandDescription}
                onChange={handleChange}
                rows={3}
                placeholder="Lembaga pelatihan proteksi radiasi terakreditasi BAPETEN..."
                required
                className="text-sm leading-relaxed"
              />
              <p className="text-[11px] text-slate-400">
                Penjelasan singkat komitmen lembaga pelatihan di bagian bawah footer.
              </p>
            </div>
          </div>
        </Card>

        {/* ── CARD 3: Informasi Lembaga & Rekening ── */}
        <Card className="p-6 bg-white border border-slate-200 shadow-xs rounded-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Informasi Lembaga & Rekening Pembayaran
                </h2>
                <p className="text-xs text-slate-500">
                  Detail legalitas KTUN BAPETEN dan rekening resmi untuk pembayaran peserta
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Nama Resmi Lembaga
                <span className="text-red-500">*</span>
              </label>
              <Input
                name="institutionName"
                value={formData.institutionName}
                onChange={handleChange}
                placeholder="CV. Hikmat Proteksi ALARA"
                required
                className="text-sm font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Nomor KTUN BAPETEN
                <span className="text-red-500">*</span>
              </label>
              <Input
                name="ktunNumber"
                value={formData.ktunNumber}
                onChange={handleChange}
                placeholder="No. 07998.722.1.040726"
                required
                className="text-sm font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Bank Pembayaran & Nomor Rekening
                <span className="text-red-500">*</span>
              </label>
              <Input
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
                placeholder="Mandiri No. 166-00-0733926-0"
                required
                className="text-sm font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Rekening Atas Nama
                <span className="text-red-500">*</span>
              </label>
              <Input
                name="bankAccountName"
                value={formData.bankAccountName}
                onChange={handleChange}
                placeholder="CV Hikmat Proteksi ALARA"
                required
                className="text-sm font-medium"
              />
            </div>
          </div>
        </Card>

        {/* ── CARD 4: Hak Cipta & Catatan Bawah ── */}
        <Card className="p-6 bg-white border border-slate-200 shadow-xs rounded-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                <FileCheck2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Hak Cipta & Catatan Kaki Footer
                </h2>
                <p className="text-xs text-slate-500">
                  Teks hak cipta dan pengesahan KTUN di baris paling bawah footer
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Teks Hak Cipta (Copyright)
                <span className="text-red-500">*</span>
              </label>
              <Input
                name="copyrightText"
                value={formData.copyrightText}
                onChange={handleChange}
                placeholder="CV. Hikmat Proteksi ALARA. Hak Cipta Dilindungi."
                required
                className="text-sm font-medium"
              />
              <p className="text-[11px] text-slate-400">
                Tahun (&copy; {new Date().getFullYear()}) otomatis ditambahkan di depan teks ini.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Teks KTUN Baris Bawah
                <span className="text-red-500">*</span>
              </label>
              <Input
                name="footerKtunText"
                value={formData.footerKtunText}
                onChange={handleChange}
                placeholder="KTUN BAPETEN No. 07998.722.1.040726"
                required
                className="text-sm font-medium"
              />
              <p className="text-[11px] text-slate-400">
                Ditampilkan di sisi kanan baris bawah footer.
              </p>
            </div>
          </div>
        </Card>

        {/* ── CARD 5: Live Preview Footer & Kontak ── */}
        <Card className="p-6 bg-slate-950 text-white border border-slate-800 shadow-md rounded-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-400" />
              <div>
                <h3 className="text-base font-bold text-white">
                  Simulasi Tampilan Langsung (Live Preview)
                </h3>
                <p className="text-xs text-slate-400">
                  Pratinjau langsung bagaimana landing page menampilkan informasi di atas
                </p>
              </div>
            </div>
            <Badge className="bg-blue-600 text-white text-xs">
              Live Mockup
            </Badge>
          </div>

          {/* Hubungi Kami Preview */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Pratinjau Section Hubungi Kami
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Card Phone */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
                <Phone className="h-5 w-5 text-blue-400 mx-auto mb-2" />
                <p className="text-[10px] text-slate-400">Telepon / WhatsApp</p>
                <p className="text-xs font-bold text-white mt-0.5">{formData.phone || "-"}</p>
              </div>

              {/* Card Email */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
                <Mail className="h-5 w-5 text-blue-400 mx-auto mb-2" />
                <p className="text-[10px] text-slate-400">Email Resmi</p>
                <p className="text-xs font-bold text-white mt-0.5 truncate">{formData.email || "-"}</p>
              </div>

              {/* Card Lokasi */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
                <MapPin className="h-5 w-5 text-blue-400 mx-auto mb-2" />
                <p className="text-[10px] text-slate-400">Lokasi Lembaga</p>
                <p className="text-xs font-bold text-white mt-0.5">{formData.address || "-"}</p>
                {formData.mapUrl && (
                  <span className="text-[10px] text-blue-400 flex items-center justify-center gap-1 mt-1 font-medium">
                    Google Maps <ExternalLink className="h-2.5 w-2.5" />
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Footer Preview */}
          <div className="pt-4 border-t border-slate-800 space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Pratinjau Footer Landing Page
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-400">
              {/* Brand */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <img src="/logo.png" alt="Logo" className="h-7 w-7 object-contain bg-white rounded p-0.5" />
                  <div>
                    <p className="font-bold text-white text-sm">{formData.brandTitle}</p>
                    <p className="text-blue-400 text-[11px]">{formData.brandSubtitle}</p>
                  </div>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-400">
                  {formData.brandDescription}
                </p>
              </div>

              {/* Links */}
              <div>
                <p className="font-bold text-white mb-2">Tautan Cepat</p>
                <ul className="space-y-1 text-[11px]">
                  <li>• Beranda</li>
                  <li>• Program Pelatihan</li>
                  <li>• Tentang Kami</li>
                  <li>• Kontak</li>
                </ul>
              </div>

              {/* Info Lembaga */}
              <div>
                <p className="font-bold text-white mb-2">Informasi Lembaga</p>
                <div className="space-y-1 text-[11px]">
                  <p><span className="text-slate-500">Lembaga:</span> {formData.institutionName}</p>
                  <p><span className="text-slate-500">KTUN:</span> {formData.ktunNumber}</p>
                  <p><span className="text-slate-500">Bank:</span> {formData.bankName}</p>
                  <p><span className="text-slate-500">A.N:</span> {formData.bankAccountName}</p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-500">
              <p>&copy; {new Date().getFullYear()} {formData.copyrightText}</p>
              <p>{formData.footerKtunText}</p>
            </div>
          </div>
        </Card>

        {/* Bottom Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <Button
            type="button"
            variant="outline"
            onClick={() => setResetDialogOpen(true)}
            disabled={saving}
            className="text-xs h-10 font-semibold"
          >
            Reset Default
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-10 px-6 gap-2 shadow-sm cursor-pointer"
          >
            <Save className="h-4 w-4" />
            {saving ? "Menyimpan..." : "Simpan Pengaturan Footer"}
          </Button>
        </div>
      </form>

      {/* Confirmation Dialog for Reset */}
      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-900">
              <RotateCcw className="h-5 w-5 text-amber-600" />
              Reset Pengaturan Footer?
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 leading-relaxed pt-2">
              Tindakan ini akan mengembalikan seluruh teks, nomor kontak, nomor rekening, dan informasi KTUN BAPETEN di footer landing page ke data standar awal sistem ALARA.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setResetDialogOpen(false)}
              className="text-xs"
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={handleResetToDefault}
              disabled={saving}
              className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold"
            >
              {saving ? "Mereset..." : "Ya, Reset ke Default"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
