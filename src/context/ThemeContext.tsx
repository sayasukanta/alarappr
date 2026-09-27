"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface ThemeConfig {
  id: string;
  name: string;
  category: string;
  description: string;
  primaryColor: string;
  accentColor: string;
  bgColor: string;
  cardColor: string;
  tag: string;
  isDark?: boolean;
}

export const THEMES: ThemeConfig[] = [
  {
    id: "blue",
    name: "ALARA Ocean Blue",
    category: "Standar Korporat",
    description: "Tema resmi khas ALARA & BAPETEN. Dominasi biru profesional, seimbang, dan terpercaya.",
    primaryColor: "#007AFF",
    accentColor: "#3894ff",
    bgColor: "#eff6ff",
    cardColor: "#ffffff",
    tag: "Default BAPETEN",
  },
  {
    id: "emerald",
    name: "Emerald Proteksi",
    category: "Keselamatan & Lingkungan",
    description: "Nuansa hijau zamrud segar melambangkan proteksi radiasi, keselamatan kerja, dan keberlanjutan.",
    primaryColor: "#059669",
    accentColor: "#10b981",
    bgColor: "#ecfdf5",
    cardColor: "#ffffff",
    tag: "Proteksi & K3",
  },
  {
    id: "violet",
    name: "Royal Violet",
    category: "Akademik & Riset",
    description: "Warna ungu elegan modern yang mencerminkan kedalaman riset ilmiah, inovasi, dan prestisius.",
    primaryColor: "#7c3aed",
    accentColor: "#8b5cf6",
    bgColor: "#f5f3ff",
    cardColor: "#ffffff",
    tag: "Akademik",
  },
  {
    id: "amber",
    name: "Warm Amber",
    category: "Energi & Fokus",
    description: "Sentuhan emas oranye hangat yang memancarkan optimisme, konsentrasi, dan keramahan antarmuka.",
    primaryColor: "#d97706",
    accentColor: "#f59e0b",
    bgColor: "#fffbeb",
    cardColor: "#ffffff",
    tag: "Energik",
  },
  {
    id: "rose",
    name: "Crimson Rose",
    category: "Dinamis & Tegas",
    description: "Merah kirmizi berani dengan kontras tinggi untuk tampilan tegas, dinamis, dan berkarakter kuat.",
    primaryColor: "#e11d48",
    accentColor: "#f43f5e",
    bgColor: "#fff1f2",
    cardColor: "#ffffff",
    tag: "High Contrast",
  },
  {
    id: "slate",
    name: "Dark Charcoal / Slate",
    category: "Mode Gelap",
    description: "Palet gelap bertekstur arang malam untuk kenyamanan mata maksimal di lingkungan minim cahaya.",
    primaryColor: "#0284c7",
    accentColor: "#38bdf8",
    bgColor: "#0f172a",
    cardColor: "#1e293b",
    tag: "Night Mode",
    isDark: true,
  },
];

interface ThemeContextType {
  currentTheme: string;
  setTheme: (themeId: string) => void;
  activeThemeConfig: ThemeConfig;
  themes: ThemeConfig[];
}

const ThemeContext = createContext<ThemeContextType>({
  currentTheme: "blue",
  setTheme: () => {},
  activeThemeConfig: THEMES[0],
  themes: THEMES,
});

const STORAGE_KEY = "alara_app_theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentThemeState] = useState<string>("blue");
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && THEMES.some((t) => t.id === saved)) {
        setCurrentThemeState(saved);
        applyThemeToDOM(saved);
      } else {
        applyThemeToDOM("blue");
      }
    } catch (e) {
      console.warn("Theme init error:", e);
    }
    setMounted(true);
  }, []);

  const applyThemeToDOM = (themeId: string) => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.setAttribute("data-theme", themeId);
    
    if (themeId === "slate") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  };

  const setTheme = (themeId: string) => {
    setCurrentThemeState(themeId);
    applyThemeToDOM(themeId);
    try {
      localStorage.setItem(STORAGE_KEY, themeId);
    } catch (e) {
      console.warn("Save theme error:", e);
    }
  };

  const activeThemeConfig =
    THEMES.find((t) => t.id === currentTheme) || THEMES[0];

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        setTheme,
        activeThemeConfig,
        themes: THEMES,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  return useContext(ThemeContext);
}
