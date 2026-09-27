"use client";

import React from "react";
import {
  Palette,
  Check,
  CheckCircle2,
  Sparkles,
  Sun,
  Moon,
  Laptop,
  Layers,
  ShieldCheck,
  Eye,
  RefreshCw,
  Info,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppTheme, THEMES, ThemeConfig } from "@/context/ThemeContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function PengaturanTemaPage() {
  const { currentTheme, setTheme, activeThemeConfig } = useAppTheme();

  const handleSelectTheme = (theme: ThemeConfig) => {
    if (theme.id === currentTheme) {
      toast.info(`Tema "${theme.name}" sudah aktif.`);
      return;
    }
    setTheme(theme.id);
    toast.success(`Tema ${theme.name} berhasil diterapkan!`, {
      description: "Preferensi tampilan antarmuka telah disimpan.",
    });
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shadow-xs">
              <Palette className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Tema Aplikasi
              </h1>
              <p className="text-sm text-slate-500">
                Pilih dan kustomisasi skema warna serta kenyamanan visual sistem pelatihan ALARA
              </p>
            </div>
          </div>
        </div>

        {/* Current Active Indicator in Header */}
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Tema Saat Ini:</span>
          <div className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-full border border-black/10 shrink-0"
              style={{ backgroundColor: activeThemeConfig.primaryColor }}
            />
            <span className="text-xs font-bold text-slate-800">
              {activeThemeConfig.name}
            </span>
          </div>
          <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white text-[11px] font-semibold flex items-center gap-1 shadow-xs ml-1 px-2 py-0.5">
            <Check className="h-3 w-3" /> Active
          </Badge>
        </div>
      </div>

      {/* ── Active Theme Highlight Banner ── */}
      <Card className="relative overflow-hidden border-2 border-blue-600/30 bg-gradient-to-r from-blue-50/50 via-white to-slate-50 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white font-bold flex items-center gap-1 px-2.5 py-0.5 text-xs shadow-xs">
                <CheckCircle2 className="h-3.5 w-3.5" /> Active
              </Badge>
              <Badge variant="outline" className="text-xs font-semibold text-slate-700 bg-white">
                {activeThemeConfig.tag}
              </Badge>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 font-medium">
                Kategori: {activeThemeConfig.category}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              {activeThemeConfig.name}
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {activeThemeConfig.description}
            </p>
          </div>

          {/* Color preview swatch box */}
          <div className="flex items-center gap-3 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs shrink-0">
            <div className="text-right mr-1 hidden sm:block">
              <p className="text-[11px] font-semibold text-slate-800">Palet Warna</p>
              <p className="text-[10px] text-slate-400">Primer & Aksen</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex flex-col items-center gap-1">
                <div
                  className="h-8 w-8 rounded-lg shadow-inner border border-black/10 transition-transform hover:scale-110"
                  style={{ backgroundColor: activeThemeConfig.primaryColor }}
                  title="Primary Color"
                />
                <span className="text-[9px] font-mono text-slate-500">Primer</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div
                  className="h-8 w-8 rounded-lg shadow-inner border border-black/10 transition-transform hover:scale-110"
                  style={{ backgroundColor: activeThemeConfig.accentColor }}
                  title="Accent Color"
                />
                <span className="text-[9px] font-mono text-slate-500">Aksen</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div
                  className="h-8 w-8 rounded-lg shadow-inner border border-slate-300 transition-transform hover:scale-110"
                  style={{ backgroundColor: activeThemeConfig.bgColor }}
                  title="Background Soft"
                />
                <span className="text-[9px] font-mono text-slate-500">Lembut</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* ── Theme Options Grid ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Koleksi Tema Pilihan
            </h3>
            <p className="text-xs text-slate-500">
              Pilih salah satu tema di bawah ini untuk langsung memperbarui seluruh tampilan aplikasi
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
            {THEMES.length} Tema Tersedia
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {THEMES.map((theme) => {
            const isActive = theme.id === currentTheme;

            return (
              <Card
                key={theme.id}
                onClick={() => handleSelectTheme(theme)}
                className={cn(
                  "relative flex flex-col justify-between p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer hover:shadow-md",
                  isActive
                    ? "border-emerald-600 bg-emerald-50/10 ring-2 ring-emerald-500/20 shadow-sm"
                    : "border-slate-200 bg-white hover:border-slate-300"
                )}
              >
                <div>
                  {/* Top Bar: Tag & Active Badge */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <Badge
                      variant="outline"
                      className="text-[11px] font-medium text-slate-600 border-slate-200 bg-slate-50"
                    >
                      {theme.tag}
                    </Badge>

                    {/* ACTIVE BADGE: strictly shown for the currently active theme */}
                    {isActive ? (
                      <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white font-bold flex items-center gap-1 shadow-sm px-2.5 py-0.5 text-xs animate-in zoom-in-90">
                        <Check className="h-3 w-3" /> Active
                      </Badge>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-medium">
                        {theme.category}
                      </span>
                    )}
                  </div>

                  {/* Theme Title */}
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="h-4 w-4 rounded-full border border-black/10 shrink-0"
                      style={{ backgroundColor: theme.primaryColor }}
                    />
                    <h4 className="font-bold text-slate-900 text-base">
                      {theme.name}
                    </h4>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-500 leading-relaxed mb-4 min-h-[36px]">
                    {theme.description}
                  </p>

                  {/* Live Visual Preview Card Mockup */}
                  <div
                    className="p-3 rounded-xl border border-slate-200/70 mb-4 transition-all"
                    style={{
                      backgroundColor: theme.isDark ? "#0f172a" : theme.bgColor,
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: theme.primaryColor }}
                        />
                        <span
                          className={cn(
                            "text-[10px] font-semibold",
                            theme.isDark ? "text-slate-200" : "text-slate-700"
                          )}
                        >
                          Tampilan UI
                        </span>
                      </div>
                      <span
                        className="text-[9px] px-1.5 py-0.5 rounded font-bold text-white"
                        style={{ backgroundColor: theme.primaryColor }}
                      >
                        Sample
                      </span>
                    </div>

                    {/* Miniature UI elements inside card */}
                    <div className="space-y-1.5">
                      <div
                        className={cn(
                          "h-5 rounded-md flex items-center px-2 text-[10px] font-semibold text-white shadow-xs",
                        )}
                        style={{ backgroundColor: theme.primaryColor }}
                      >
                        Tombol Primer
                      </div>
                      <div
                        className={cn(
                          "h-4 rounded px-2 flex items-center text-[9px] border",
                          theme.isDark
                            ? "bg-slate-800 text-slate-300 border-slate-700"
                            : "bg-white text-slate-600 border-slate-200"
                        )}
                      >
                        Komponen & Input
                      </div>
                    </div>
                  </div>

                  {/* Color Swatch Dots */}
                  <div className="flex items-center justify-between py-2 border-t border-slate-100 text-xs text-slate-500">
                    <span className="text-[11px] font-medium">Palet Warna:</span>
                    <div className="flex items-center gap-1.5">
                      <div
                        className="h-5 w-5 rounded-full border border-black/10 shadow-xs"
                        style={{ backgroundColor: theme.primaryColor }}
                        title="Primary Color"
                      />
                      <div
                        className="h-5 w-5 rounded-full border border-black/10 shadow-xs"
                        style={{ backgroundColor: theme.accentColor }}
                        title="Accent Color"
                      />
                      <div
                        className="h-5 w-5 rounded-full border border-slate-200 shadow-xs"
                        style={{ backgroundColor: theme.bgColor }}
                        title="Background Tint"
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom Action Button */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  {isActive ? (
                    <Button
                      variant="outline"
                      className="w-full bg-emerald-50 border-emerald-300 text-emerald-700 font-semibold cursor-default text-xs h-9"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <Check className="h-3.5 w-3.5 mr-1 text-emerald-600" />
                      Tema Aktif
                    </Button>
                  ) : (
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-9 cursor-pointer shadow-xs transition-all"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectTheme(theme);
                      }}
                    >
                      Terapkan Tema
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* ── Real-time Component Preview Section ── */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-600" />
          <h3 className="text-base font-bold text-slate-900">
            Simulasi Komponen dengan Tema Aktif
          </h3>
        </div>
        <p className="text-xs text-slate-500">
          Lihat bagaimana tombol, status badge, formulir, dan indikator beradaptasi secara otomatis dengan tema {activeThemeConfig.name}.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Buttons & Actions */}
          <Card className="p-4 bg-white border border-slate-200 space-y-3">
            <p className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-2">
              Tombol & Tindakan
            </p>
            <div className="space-y-2">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold">
                Tombol Utama (Primary)
              </Button>
              <Button variant="outline" className="w-full text-xs font-medium">
                Tombol Sekunder (Outline)
              </Button>
              <Button variant="ghost" className="w-full text-xs text-blue-600 hover:bg-blue-50">
                Tautan / Tombol Ghost
              </Button>
            </div>
          </Card>

          {/* Card 2: Badges & Tags */}
          <Card className="p-4 bg-white border border-slate-200 space-y-3">
            <p className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-2">
              Status & Badge
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Badge className="bg-blue-600 text-white text-xs">
                Sertifikasi BAPETEN
              </Badge>
              <Badge className="bg-emerald-600 text-white text-xs flex items-center gap-1">
                <Check className="h-3 w-3" /> Active
              </Badge>
              <Badge variant="outline" className="border-blue-600 text-blue-600 text-xs">
                Pendaftaran Terbuka
              </Badge>
              <Badge variant="secondary" className="text-xs">
                Batch 2026
              </Badge>
            </div>
          </Card>

          {/* Card 3: Notice & Highlights */}
          <Card className="p-4 bg-white border border-slate-200 space-y-3">
            <p className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-2">
              Banner & Notifikasi
            </p>
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs flex items-start gap-2">
              <Info className="h-4 w-4 shrink-0 mt-0.5 text-blue-600" />
              <p className="leading-snug">
                Tema disimpan pada peramban (browser) dan akan selalu diterapkan saat Anda masuk kembali.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
