"use client";

import { useState, useEffect, useCallback } from "react";
import {
  SlidersHorizontal,
  RefreshCw,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  LayoutDashboard,
  ClipboardList,
  FileText,
  CreditCard,
  BookOpen,
  CalendarCheck,
  MonitorCheck,
  BookMarked,
  Award,
  HelpCircle,
  Sparkles,
  ChevronRight,
  Shield,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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

interface MenuSettingItem {
  id: number;
  menuKey: string;
  label: string;
  href: string;
  iconName?: string | null;
  isVisible: boolean;
  orderIndex: number;
  description?: string | null;
}

interface MenuMetrics {
  totalCount: number;
  visibleCount: number;
  hiddenCount: number;
}

const ICON_MAP: Record<string, any> = {
  LayoutDashboard,
  ClipboardList,
  FileText,
  CreditCard,
  BookOpen,
  CalendarCheck,
  MonitorCheck,
  BookMarked,
  Award,
};

export default function AdminMenuPenggunaPage() {
  const [menus, setMenus] = useState<MenuSettingItem[]>([]);
  const [metrics, setMetrics] = useState<MenuMetrics>({
    totalCount: 0,
    visibleCount: 0,
    hiddenCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [updatingKey, setUpdatingKey] = useState<string | null>(null);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // ─── Fetch Menus ────────────────────────────────────────────────────────────
  const fetchMenus = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/menu-settings");
      if (!res.ok) throw new Error("Gagal mengambil pengaturan menu");
      const data = await res.json();
      setMenus(data.menus || []);
      if (data.metrics) setMetrics(data.metrics);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Terjadi kesalahan saat memuat menu");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  // ─── Toggle Single Menu ─────────────────────────────────────────────────────
  const handleToggle = async (item: MenuSettingItem) => {
    const nextState = !item.isVisible;
    try {
      setUpdatingKey(item.menuKey);
      // Optimistic update
      setMenus((prev) =>
        prev.map((m) =>
          m.menuKey === item.menuKey ? { ...m, isVisible: nextState } : m
        )
      );
      setMetrics((prev) => ({
        ...prev,
        visibleCount: prev.visibleCount + (nextState ? 1 : -1),
        hiddenCount: prev.hiddenCount + (nextState ? -1 : 1),
      }));

      const res = await fetch("/api/admin/menu-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          menuKey: item.menuKey,
          isVisible: nextState,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengubah pengaturan");

      toast.success(
        nextState
          ? `Menu "${item.label}" sekarang TAMPIL di dashboard peserta`
          : `Menu "${item.label}" sekarang DISEMBUNYIKAN dari peserta`
      );
    } catch (err: any) {
      // Revert on error
      toast.error(err.message || "Gagal mengubah status menu");
      fetchMenus();
    } finally {
      setUpdatingKey(null);
    }
  };

  // ─── Reset All to Visible ───────────────────────────────────────────────────
  const handleResetAll = async () => {
    try {
      setIsResetting(true);
      const res = await fetch("/api/admin/menu-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset_all" }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengatur ulang menu");

      toast.success("Semua menu peserta berhasil diatur tampil (default)");
      setIsResetDialogOpen(false);
      fetchMenus();
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* ─── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Kelola Menu Pengguna
            </h1>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              Hak Akses Peserta
            </Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Atur menu navigasi yang dapat diakses oleh peserta pelatihan. Menu yang dinonaktifkan akan otomatis disembunyikan dari sidebar peserta.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchMenus}
            disabled={loading}
            className="text-slate-600 hover:text-slate-900"
          >
            <RefreshCw className={`h-4 w-4 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Muat Ulang
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsResetDialogOpen(true)}
            className="text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            <RotateCcw className="h-4 w-4 mr-1.5" />
            Tampilkan Semua Menu (Default)
          </Button>
        </div>
      </div>

      {/* ─── Metrics Cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 border-slate-200 shadow-sm bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Menu Peserta
            </span>
            <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
              <SlidersHorizontal className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{metrics.totalCount}</span>
            <span className="text-xs text-slate-500">menu terdaftar</span>
          </div>
        </Card>

        <Card className="p-4 border-slate-200 shadow-sm bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
              Menu Aktif (Tampil)
            </span>
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
              <Eye className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-700">{metrics.visibleCount}</span>
            <span className="text-xs text-slate-500">muncul di sidebar</span>
          </div>
        </Card>

        <Card className="p-4 border-slate-200 shadow-sm bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Menu Disembunyikan
            </span>
            <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
              <EyeOff className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-700">{metrics.hiddenCount}</span>
            <span className="text-xs text-slate-500">dinonaktifkan admin</span>
          </div>
        </Card>
      </div>

      {/* ─── Info Banner ─────────────────────────────────────────────────────── */}
      <div className="flex items-start gap-3 p-4 rounded-xl border border-blue-200 bg-blue-50/70 text-sm text-blue-900">
        <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed">
          <p className="font-semibold text-blue-900">Informasi Pengaturan Menu</p>
          <p className="text-blue-700 mt-0.5">
            Secara *default*, sistem menampilkan seluruh menu kepada peserta. Anda dapat mematikan sakelar (*switch*) pada menu yang belum ingin dibuka untuk peserta (misal: menu <strong>Tryout</strong> atau <strong>Sertifikat</strong> sebelum jadwalnya dimulai). Pengaturan langsung tersimpan dan diterapkan seketika pada sidebar peserta.
          </p>
        </div>
      </div>

      {/* ─── Grid: Menu Management & Live Sidebar Preview ────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Menu Toggle Cards */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 px-1">
            Daftar Menu Navigasi Peserta ({menus.length})
          </h2>

          {loading ? (
            <div className="p-12 text-center bg-white rounded-xl border border-slate-200 shadow-sm">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto text-blue-600 mb-2" />
              <p className="text-xs text-slate-500">Memuat konfigurasi menu...</p>
            </div>
          ) : (
            menus.map((item) => {
              const IconComponent = item.iconName ? ICON_MAP[item.iconName] || FileText : FileText;
              const isUpdating = updatingKey === item.menuKey;

              return (
                <Card
                  key={item.menuKey}
                  className={`p-4 border transition-all duration-200 ${
                    item.isVisible
                      ? "border-slate-200 bg-white hover:border-blue-300 shadow-xs"
                      : "border-slate-200 bg-slate-50/70 opacity-75"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    {/* Left: Icon & Info */}
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div
                        className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                          item.isVisible
                            ? "bg-blue-50 text-blue-600 border border-blue-200"
                            : "bg-slate-200 text-slate-400"
                        }`}
                      >
                        <IconComponent className="h-5 w-5" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-slate-900 text-sm">
                            {item.label}
                          </span>
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                            {item.href}
                          </span>
                          {item.isVisible ? (
                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none text-[10px] px-2 py-0.5">
                              <Eye className="h-3 w-3 mr-1" />
                              Tampil
                            </Badge>
                          ) : (
                            <Badge className="bg-slate-200 text-slate-600 hover:bg-slate-200 border-none text-[10px] px-2 py-0.5">
                              <EyeOff className="h-3 w-3 mr-1" />
                              Disembunyikan
                            </Badge>
                          )}
                        </div>

                        {item.description && (
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Modern Switch Toggle */}
                    <div className="shrink-0 flex items-center gap-2">
                      <label className="relative inline-flex items-center cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={item.isVisible}
                          disabled={isUpdating}
                          onChange={() => handleToggle(item)}
                          className="sr-only peer"
                        />
                        <div className="w-12 h-6.5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5.5 after:w-5.5 after:transition-all peer-checked:bg-blue-600 peer-disabled:opacity-50"></div>
                      </label>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {/* Right 1 Col: Live Sidebar Preview Simulation */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 px-1">
            Simulasi Tampilan Sidebar Peserta
          </h2>

          <Card className="border-slate-200 shadow-sm bg-white overflow-hidden p-4 space-y-4">
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-800">Pratinjau Navigasi Peserta</p>
                <p className="text-[10px] text-slate-400">
                  {metrics.visibleCount} menu aktif tampil saat ini
                </p>
              </div>
              <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-600">
                Live Preview
              </Badge>
            </div>

            {/* Sidebar item mockup */}
            <div className="space-y-1">
              {menus.map((item) => {
                const IconComponent = item.iconName ? ICON_MAP[item.iconName] || FileText : FileText;

                if (!item.isVisible) {
                  return (
                    <div
                      key={item.menuKey}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-300 border border-dashed border-slate-200 bg-slate-50/50 line-through select-none"
                      title="Menu ini disembunyikan dari peserta"
                    >
                      <IconComponent className="h-4 w-4 opacity-40 shrink-0" />
                      <span className="flex-1 truncate">{item.label}</span>
                      <span className="text-[10px] text-slate-400 no-underline">hidden</span>
                    </div>
                  );
                }

                return (
                  <div
                    key={item.menuKey}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <IconComponent className="h-4 w-4 text-slate-500 shrink-0" />
                    <span className="flex-1 truncate">{item.label}</span>
                    <ChevronRight className="h-3 w-3 text-slate-300" />
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 text-center">
              Perubahan sakelar di samping langsung mengubah menu yang dilihat peserta secara *real-time*.
            </div>
          </Card>
        </div>
      </div>

      {/* ─── Modal Konfirmasi Reset Semua ────────────────────────────────────── */}
      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-2">
              <RotateCcw className="h-5 w-5" />
            </div>
            <DialogTitle className="text-center text-lg font-bold text-slate-900">
              Tampilkan Semua Menu Pengguna?
            </DialogTitle>
            <DialogDescription className="text-center text-xs text-slate-500">
              Tindakan ini akan mengembalikan pengaturan visibilitas ke kondisi default sistem, yaitu mengaktifkan dan menampilkan seluruh 9 menu navigasi bagi peserta.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:justify-center pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsResetDialogOpen(false)}
              disabled={isResetting}
            >
              Batal
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleResetAll}
              disabled={isResetting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isResetting ? "Menerapkan..." : "Ya, Tampilkan Semua"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
