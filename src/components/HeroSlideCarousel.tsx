"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  ExternalLink,
  Sparkles,
  Layers,
  ArrowRight,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface SlideItem {
  id: number;
  title: string | null;
  imageUrl: string;
  linkUrl: string | null;
  isTampil: number;
  orderIndex: number;
}

interface HeroSlideCarouselProps {
  initialSlides?: SlideItem[];
  className?: string;
  autoPlayInterval?: number;
}

export function HeroSlideCarousel({
  initialSlides,
  className,
  autoPlayInterval = 5000,
}: HeroSlideCarouselProps) {
  const [slides, setSlides] = useState<SlideItem[]>(initialSlides ?? []);
  const [loading, setLoading] = useState(!initialSlides || initialSlides.length === 0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [zoomModalOpen, setZoomModalOpen] = useState(false);

  // Fetch active slides if not provided
  useEffect(() => {
    if (initialSlides && initialSlides.length > 0) {
      setSlides(initialSlides);
      setLoading(false);
      return;
    }

    let isMounted = true;
    async function loadSlides() {
      try {
        const res = await fetch("/api/slides");
        if (res.ok) {
          const json = await res.json();
          if (isMounted && Array.isArray(json.data) && json.data.length > 0) {
            setSlides(json.data);
          }
        }
      } catch (e) {
        console.error("Gagal memuat slide hero:", e);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadSlides();

    return () => {
      isMounted = false;
    };
  }, [initialSlides]);

  const activeSlides = slides.filter((s) => s.isTampil === 1);
  const total = activeSlides.length;

  const nextSlide = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Autoplay
  useEffect(() => {
    if (isPaused || total <= 1) return;
    const timer = setInterval(() => {
      nextSlide();
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [isPaused, total, nextSlide, autoPlayInterval]);

  // Fallback if no slides exist yet
  if (!loading && total === 0) {
    return null;
  }

  const currentSlide = activeSlides[currentIndex] || activeSlides[0];

  return (
    <div
      className={cn(
        "relative w-full max-w-md lg:max-w-none mx-auto select-none group",
        className
      )}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Decorative Outer Aura / Glow */}
      <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-500/30 via-cyan-400/25 to-indigo-500/30 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 pointer-events-none" />

      {/* Main Glass Frame Card */}
      <div className="relative rounded-2xl sm:rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/20 shadow-2xl overflow-hidden p-2 sm:p-3 flex flex-col">
        {/* Top Header Bar of the Slide */}
        <div className="flex items-center justify-between px-2.5 py-1.5 mb-1.5 border-b border-white/10 text-white/90">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] sm:text-xs font-semibold tracking-wide uppercase text-blue-200">
              Informasi Pelatihan ALARA
            </span>
          </div>
          {total > 1 && (
            <Badge
              variant="outline"
              className="bg-white/10 border-white/20 text-white text-[10px] font-mono px-2 py-0.5"
            >
              {currentIndex + 1} / {total}
            </Badge>
          )}
        </div>

        {/* Slide Image Box */}
        <div className="relative w-full aspect-[3/4] sm:aspect-[4/5] rounded-xl overflow-hidden bg-slate-950/80 cursor-pointer shadow-inner">
          {loading ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-blue-200/50 gap-2">
              <Layers className="w-8 h-8 animate-spin" />
              <span className="text-xs">Memuat informasi slide...</span>
            </div>
          ) : (
            currentSlide && (
              <>
                <Image
                  src={currentSlide.imageUrl}
                  alt={currentSlide.title || `Slide ${currentIndex + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 500px"
                  className="object-contain hover:scale-[1.02] transition-transform duration-500"
                  priority={currentIndex === 0}
                  onClick={() => setZoomModalOpen(true)}
                />

                {/* Subtle gradient vignette at bottom */}
                <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none" />

                {/* Bottom Caption & Action inside flyer */}
                <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 flex flex-col justify-end">
                  {currentSlide.title && (
                    <h3 className="text-sm sm:text-base font-bold text-white leading-snug drop-shadow-md mb-2">
                      {currentSlide.title}
                    </h3>
                  )}

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setZoomModalOpen(true);
                      }}
                      className="bg-white/20 hover:bg-white/30 text-white text-xs h-7 sm:h-8 px-2.5 backdrop-blur-md border border-white/30 gap-1.5 shadow-sm"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>Perbesar Flyer</span>
                    </Button>

                    {currentSlide.linkUrl ? (
                      <Button
                        size="sm"
                        asChild
                        className="bg-blue-600 hover:bg-blue-500 text-white text-xs h-7 sm:h-8 px-3 font-semibold gap-1 shadow-md shadow-blue-900/50 ml-auto"
                      >
                        <Link href={currentSlide.linkUrl}>
                          <span>Daftar</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        asChild
                        className="bg-blue-600 hover:bg-blue-500 text-white text-xs h-7 sm:h-8 px-3 font-semibold gap-1 shadow-md shadow-blue-900/50 ml-auto"
                      >
                        <Link href="/pendaftaran">
                          <span>Daftar</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </>
            )
          )}

          {/* Navigation Arrows */}
          {total > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prevSlide();
                }}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all opacity-80 hover:opacity-100 hover:scale-105 shadow-md"
                aria-label="Slide Sebelumnya"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  nextSlide();
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all opacity-80 hover:opacity-100 hover:scale-105 shadow-md"
                aria-label="Slide Selanjutnya"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Bottom Pagination Dots */}
        {total > 1 && (
          <div className="flex items-center justify-center gap-1.5 mt-2.5 py-1">
            {activeSlides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentIndex(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  currentIndex === i
                    ? "w-6 bg-gradient-to-r from-blue-400 to-cyan-300 shadow-xs"
                    : "w-1.5 bg-white/30 hover:bg-white/60"
                )}
                aria-label={`Ke slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ─── Modal Zoom Flyer ─── */}
      <Dialog open={zoomModalOpen} onOpenChange={setZoomModalOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[92vh] overflow-y-auto p-4 sm:p-6 bg-slate-950 text-white border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg font-bold flex items-center gap-2 text-white">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              {currentSlide?.title || "Flyer Informasi Pelatihan ALARA"}
            </DialogTitle>
          </DialogHeader>

          {currentSlide && (
            <div className="relative w-full max-h-[72vh] min-h-[50vh] flex items-center justify-center my-2 rounded-xl overflow-hidden bg-black/60 p-2">
              <img
                src={currentSlide.imageUrl}
                alt={currentSlide.title || "Flyer Pelatihan"}
                className="max-h-[70vh] w-auto object-contain rounded-lg shadow-2xl"
              />
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800">
            <p className="text-xs text-slate-400 text-center sm:text-left">
              Pendaftaran resmi dapat dilakukan langsung secara online melalui portal ALARA.
            </p>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoomModalOpen(false)}
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                Tutup
              </Button>
              <Button
                size="sm"
                asChild
                className="bg-blue-600 hover:bg-blue-500 text-white font-semibold gap-1.5"
              >
                <Link
                  href={currentSlide?.linkUrl || "/pendaftaran"}
                  onClick={() => setZoomModalOpen(false)}
                >
                  <span>Daftar Pelatihan Ini</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
