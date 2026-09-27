"use client";

import React, { useState } from "react";
import {
  ExternalLink,
  Video,
  FolderOpen,
  FileImage,
  Globe,
  Maximize2,
  Minimize2,
  Info,
  Grid,
  List,
  Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { parseMediaEmbedUrl, MediaEmbedInfo } from "@/lib/media-embed";
import { cn } from "@/lib/utils";

function YoutubeIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

interface BatchDocumentationEmbedProps {
  url?: string | null;
  title?: string | null;
  batchName?: string;
  className?: string;
  compact?: boolean;
}

export function BatchDocumentationEmbed({
  url,
  title,
  batchName,
  className,
  compact = false,
}: BatchDocumentationEmbedProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [folderViewMode, setFolderViewMode] = useState<"grid" | "list">("grid");

  const embedInfo = parseMediaEmbedUrl(url);

  if (!embedInfo || !embedInfo.isValid) {
    return null;
  }

  // Adjust folder view mode if Google Drive Folder
  let finalEmbedUrl = embedInfo.embedUrl;
  if (embedInfo.type === "GDRIVE_FOLDER") {
    finalEmbedUrl = `https://drive.google.com/embeddedfolderview?id=${embedInfo.id}#${folderViewMode}`;
  }

  const renderBadge = () => {
    switch (embedInfo.type) {
      case "YOUTUBE":
        return (
          <Badge className="bg-red-600 hover:bg-red-600 text-white gap-1 text-[11px] font-semibold shadow-xs">
            <YoutubeIcon className="w-3.5 h-3.5" />
            YouTube Video
          </Badge>
        );
      case "GDRIVE_FOLDER":
        return (
          <Badge className="bg-blue-600 hover:bg-blue-600 text-white gap-1 text-[11px] font-semibold shadow-xs">
            <FolderOpen className="w-3.5 h-3.5" />
            Galeri Google Drive
          </Badge>
        );
      case "GDRIVE_FILE":
        return (
          <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white gap-1 text-[11px] font-semibold shadow-xs">
            <FileImage className="w-3.5 h-3.5" />
            File Google Drive
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="gap-1 text-[11px]">
            <Globe className="w-3.5 h-3.5 text-blue-600" />
            Tautan Dokumentasi
          </Badge>
        );
    }
  };

  const getOpenLinkText = () => {
    if (embedInfo.type === "YOUTUBE") return "Tonton di YouTube";
    if (embedInfo.type === "GDRIVE_FOLDER") return "Buka Folder di Google Drive";
    if (embedInfo.type === "GDRIVE_FILE") return "Buka di Google Drive";
    return "Buka Tautan";
  };

  return (
    <Card
      className={cn(
        "overflow-hidden border border-slate-200 bg-white shadow-xs rounded-2xl transition-all",
        isFullscreen &&
          "fixed inset-4 z-50 shadow-2xl flex flex-col bg-white overflow-hidden max-w-6xl mx-auto my-auto border-2 border-slate-300",
        className
      )}
    >
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-slate-100 bg-slate-50/70">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs shrink-0">
            {embedInfo.type === "YOUTUBE" ? (
              <YoutubeIcon className="w-5 h-5 text-red-600" />
            ) : embedInfo.type === "GDRIVE_FOLDER" ? (
              <FolderOpen className="w-5 h-5 text-blue-600" />
            ) : (
              <FileImage className="w-5 h-5 text-emerald-600" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-slate-900 text-sm truncate">
                {title || "Dokumentasi Kegiatan Batch"}
              </h3>
              {renderBadge()}
            </div>
            {batchName && (
              <p className="text-xs text-slate-500 truncate mt-0.5">{batchName}</p>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {embedInfo.type === "GDRIVE_FOLDER" && (
            <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setFolderViewMode("grid")}
                title="Tampilan Kotak (Grid)"
                className={cn(
                  "p-1.5 rounded-md transition-colors",
                  folderViewMode === "grid"
                    ? "bg-blue-50 text-blue-700 font-bold"
                    : "text-slate-500 hover:text-slate-900"
                )}
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setFolderViewMode("list")}
                title="Tampilan Daftar (List)"
                className={cn(
                  "p-1.5 rounded-md transition-colors",
                  folderViewMode === "list"
                    ? "bg-blue-50 text-blue-700 font-bold"
                    : "text-slate-500 hover:text-slate-900"
                )}
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <a
            href={embedInfo.originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <span>{getOpenLinkText()}</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="h-8 w-8 text-slate-500 hover:text-slate-800"
            title={isFullscreen ? "Perkecil Tampilan" : "Perbesar Tampilan"}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* ── Embedded Frame Content ── */}
      <div
        className={cn(
          "w-full bg-slate-950 relative",
          isFullscreen ? "flex-1 min-h-0" : "",
          embedInfo.type === "YOUTUBE"
            ? "aspect-video max-h-[520px]"
            : "h-[450px] md:h-[520px]"
        )}
      >
        <iframe
          src={finalEmbedUrl}
          title={title || "Dokumentasi Batch ALARA"}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
        />
      </div>

      {/* ── Footer Tips / Information ── */}
      {embedInfo.type === "GDRIVE_FOLDER" && !compact && (
        <div className="p-3 bg-blue-50/60 border-t border-blue-100 text-[11px] text-blue-800 flex items-start gap-2">
          <Info className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Catatan Akses Google Drive:</strong> Pastikan setelan berbagi folder di Google Drive telah diatur ke{" "}
            <em>"Siapa saja yang memiliki link dapat melihat" (Anyone with the link can view)</em> agar peserta dapat melihat dan mengunduh foto dokumentasi tanpa hambatan.
          </p>
        </div>
      )}
    </Card>
  );
}
