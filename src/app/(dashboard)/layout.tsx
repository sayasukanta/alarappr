"use client";

import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  LayoutDashboard,
  ClipboardList,
  FileText,
  CreditCard,
  BookOpen,
  CalendarCheck,
  MonitorCheck,
  BookMarked,
  Award,
  Users,
  Settings,
  LogOut,
  Menu,
  Shield,
  ChevronRight,
  ChevronDown,
  Bell,
  UserCog,
  BarChart3,
  GraduationCap,
  FileSignature,
  FileQuestion,
  SlidersHorizontal,
  Palette,
  PanelBottom,
  Images,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface NavSubItem {
  label: string;
  href: string;
  icon?: React.ElementType;
  roles?: string[];
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles: string[];
  badge?: string;
  children?: NavSubItem[];
}

// ─── Navigation Config ───────────────────────────────────────────────────────

const NAV_ITEMS: NavItem[] = [
  // ─── Peserta Menu ───
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["PESERTA"],
  },
  {
    label: "Pendaftaran",
    href: "/pendaftaran",
    icon: ClipboardList,
    roles: ["PESERTA"],
  },
  {
    label: "Dokumen",
    href: "/dokumen",
    icon: FileText,
    roles: ["PESERTA"],
  },
  {
    label: "Pembayaran",
    href: "/pembayaran",
    icon: CreditCard,
    roles: ["PESERTA", "SPONSOR"],
  },
  {
    label: "LMS / Modul",
    href: "/lms",
    icon: BookOpen,
    roles: ["PESERTA", "INSTRUCTOR"],
  },
  {
    label: "Presensi",
    href: "/presensi",
    icon: CalendarCheck,
    roles: ["PESERTA", "INSTRUCTOR"],
  },
  {
    label: "Tryout",
    href: "/tryout",
    icon: MonitorCheck,
    roles: ["PESERTA", "INSTRUCTOR"],
  },
  {
    label: "Logbook",
    href: "/logbook",
    icon: BookMarked,
    roles: ["PESERTA", "INSTRUCTOR"],
  },
  {
    label: "Sertifikat",
    href: "/sertifikat",
    icon: Award,
    roles: ["PESERTA"],
  },

  // ─── Admin Menu ───
  {
    label: "Dashboard Admin",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    roles: ["ADMIN"],
  },
  {
    label: "Verifikasi Berkas",
    href: "/admin/verifikasi",
    icon: Shield,
    roles: ["ADMIN"],
  },
  {
    label: "Jenis Pelatihan",
    href: "/admin/pelatihan",
    icon: BookOpen,
    roles: ["ADMIN"],
  },
  {
    label: "Kelola Batch",
    href: "/admin/batch",
    icon: GraduationCap,
    roles: ["ADMIN"],
  },
  {
    label: "Kelola Soal Tryout",
    href: "/admin/tryout",
    icon: FileQuestion,
    roles: ["ADMIN"],
  },
  {
    label: "Kelola LMS / Modul",
    href: "/admin/lms",
    icon: BookMarked,
    roles: ["ADMIN"],
  },
  {
    label: "Verifikasi Pembayaran",
    href: "/admin/pembayaran",
    icon: CreditCard,
    roles: ["ADMIN"],
  },
  {
    label: "Presensi Peserta",
    href: "/admin/presensi",
    icon: CalendarCheck,
    roles: ["ADMIN"],
  },
  {
    label: "Laporan & Rekap",
    href: "/admin/laporan",
    icon: BarChart3,
    roles: ["ADMIN", "SPONSOR"],
    children: [
      { label: "Rekap", href: "/admin/laporan" },
      { label: "Penyelenggaraan", href: "/admin/laporan/penyelenggaraan" },
      { label: "Arsip", href: "/admin/laporan/arsip" },
    ],
  },
  {
    label: "Kelola Instruktur",
    href: "/admin/instruktur",
    icon: UserCog,
    roles: ["ADMIN"],
  },

  // ─── Instructor & Sponsor Dashboard ───
  {
    label: "Dashboard Instruktur",
    href: "/instructor/dashboard",
    icon: LayoutDashboard,
    roles: ["INSTRUCTOR"],
  },
  {
    label: "Dashboard Sponsor",
    href: "/sponsor/dashboard",
    icon: LayoutDashboard,
    roles: ["SPONSOR"],
  },

  // ─── Pengaturan ───
  {
    label: "Pengaturan",
    href: "/pengaturan",
    icon: Settings,
    roles: ["PESERTA", "ADMIN", "INSTRUCTOR", "SPONSOR"],
    children: [
      { label: "Tema Aplikasi", href: "/pengaturan/tema", icon: Palette },
      { label: "Kelola User", href: "/admin/users", icon: Users, roles: ["ADMIN"] },
      { label: "Kelola Menu Pengguna", href: "/admin/menu-pengguna", icon: SlidersHorizontal, roles: ["ADMIN"] },
      { label: "Penandatangan Sertifikat", href: "/admin/penandatangan", icon: FileSignature, roles: ["ADMIN"] },
      { label: "Pengaturan Footer", href: "/pengaturan/footer", icon: PanelBottom, roles: ["ADMIN"] },
      { label: "Slide", href: "/pengaturan/slide", icon: Images, roles: ["ADMIN"] },
    ],
  },
];

const ROLE_LABELS: Record<string, string> = {
  PESERTA: "Peserta",
  ADMIN: "Administrator",
  INSTRUCTOR: "Instruktur",
  SPONSOR: "Sponsor",
};

const ROLE_COLORS: Record<string, string> = {
  PESERTA: "bg-blue-100 text-blue-700",
  ADMIN: "bg-red-100 text-red-700",
  INSTRUCTOR: "bg-green-100 text-green-700",
  SPONSOR: "bg-purple-100 text-purple-700",
};

// ─── Sidebar Nav Item ─────────────────────────────────────────────────────────

function SidebarNavItem({
  item,
  isActive,
  pathname,
  onNavClick,
  role,
}: {
  item: NavItem;
  isActive: boolean;
  pathname: string;
  onNavClick?: () => void;
  role?: string;
}) {
  const Icon = item.icon;
  const filteredChildren = item.children?.filter(
    (c) => !c.roles || (role && c.roles.includes(role))
  );
  const hasChildren = filteredChildren && filteredChildren.length > 0;
  const isAnyChildActive =
    hasChildren &&
    filteredChildren.some(
      (c) =>
        pathname === c.href ||
        (c.href !== "/admin/laporan" && pathname.startsWith(c.href))
    );

  const [open, setOpen] = useState(isAnyChildActive || isActive);

  useEffect(() => {
    if (isAnyChildActive || isActive) {
      setOpen(true);
    }
  }, [isAnyChildActive, isActive]);

  if (hasChildren) {
    return (
      <div className="space-y-1">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className={cn(
            "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 text-left cursor-pointer",
            isAnyChildActive || isActive
              ? "bg-slate-100 text-blue-700 font-semibold"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          )}
        >
          <Icon className="h-4 w-4 shrink-0 text-slate-500" />
          <span className="flex-1">{item.label}</span>
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 transition-transform duration-200 text-slate-400",
              open && "rotate-180 text-blue-600"
            )}
          />
        </button>

        {open && (
          <div className="pl-6 pr-1 py-1 space-y-1 border-l-2 border-slate-200 ml-4">
            {filteredChildren.map((child) => {
              const ChildIcon = child.icon;
              const isChildActive =
                child.href === "/admin/laporan"
                  ? pathname === "/admin/laporan"
                  : pathname === child.href || pathname.startsWith(child.href + "/");
              return (
                <Link
                  key={child.href}
                  href={child.href}
                  onClick={onNavClick}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                    isChildActive
                      ? "bg-blue-600 text-white font-semibold shadow-xs"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  {ChildIcon && (
                    <ChildIcon
                      className={cn(
                        "h-3.5 w-3.5 shrink-0",
                        isChildActive ? "text-white" : "text-slate-500"
                      )}
                    />
                  )}
                  <span className="flex-1">{child.label}</span>
                  {isChildActive && <ChevronRight className="h-3 w-3 opacity-70" />}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={onNavClick}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
        isActive
          ? "bg-blue-600 text-white shadow-sm"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="flex-1">{item.label}</span>
      {item.badge && (
        <Badge className="ml-auto h-5 min-w-5 justify-center bg-red-500 px-1 text-[10px] text-white">
          {item.badge}
        </Badge>
      )}
      {isActive && <ChevronRight className="h-3 w-3 opacity-60" />}
    </Link>
  );
}

// ─── Sidebar Content ──────────────────────────────────────────────────────────

function SidebarContent({
  role,
  pathname,
  onNavClick,
  menuVisibility = {},
}: {
  role: string;
  pathname: string;
  onNavClick?: () => void;
  menuVisibility?: Record<string, boolean>;
}) {
  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(role));

  // Group: general vs admin vs settings
  const generalItems = visibleItems
    .filter((i) => !i.href.startsWith("/admin") && !i.href.startsWith("/pengaturan"))
    .filter((i) => {
      // If role is PESERTA and this menu is explicitly disabled
      if (role === "PESERTA" && menuVisibility[i.href] === false) {
        return false;
      }
      return true;
    });
  const adminItems = visibleItems.filter((i) => i.href.startsWith("/admin"));
  const settingsItems = visibleItems.filter((i) => i.href.startsWith("/pengaturan"));

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <Link
        href={
          role === "ADMIN"
            ? "/admin/dashboard"
            : role === "INSTRUCTOR"
            ? "/instructor/dashboard"
            : role === "SPONSOR"
            ? "/sponsor/dashboard"
            : "/dashboard"
        }
        className="flex items-center gap-3 px-4 py-4 hover:opacity-90 transition-opacity"
      >
        <img
          src="/logo.png"
          alt="ALARA Logo"
          className="h-10 w-10 object-contain rounded-lg shrink-0"
        />
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-900 leading-tight">ALARA</p>
          <p className="truncate text-[10px] text-slate-500 leading-tight">
            Training System
          </p>
        </div>
      </Link>

      <Separator className="mx-4 w-auto" />

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {generalItems.map((item) => (
          <SidebarNavItem
            key={item.href}
            item={item}
            isActive={pathname === item.href || (item.children ? item.children.some(c => pathname === c.href || pathname.startsWith(c.href + "/")) : pathname.startsWith(item.href + "/"))}
            pathname={pathname}
            onNavClick={onNavClick}
            role={role}
          />
        ))}

        {adminItems.length > 0 && (
          <>
            <div className="px-3 pb-1 pt-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                Administrasi
              </p>
            </div>
            {adminItems.map((item) => (
              <SidebarNavItem
                key={item.href}
                item={item}
                isActive={pathname === item.href || (item.children ? item.children.some(c => pathname === c.href || pathname.startsWith(c.href + "/")) : pathname.startsWith(item.href + "/"))}
                pathname={pathname}
                onNavClick={onNavClick}
                role={role}
              />
            ))}
          </>
        )}

        {settingsItems.length > 0 && (
          <>
            <div className="px-3 pb-1 pt-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                Pengaturan
              </p>
            </div>
            {settingsItems.map((item) => (
              <SidebarNavItem
                key={item.href}
                item={item}
                isActive={pathname === item.href || (item.children ? item.children.some(c => pathname === c.href || pathname.startsWith(c.href + "/")) : pathname.startsWith(item.href + "/"))}
                pathname={pathname}
                onNavClick={onNavClick}
                role={role}
              />
            ))}
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-200 px-4 py-3">
        <p className="text-[10px] text-slate-400 text-center leading-tight">
          CV Hikmat Proteksi ALARA
          <br />
          KTUN BAPETEN No. 07998.722.1.040726
        </p>
      </div>
    </div>
  );
}

// ─── Main Layout ─────────────────────────────────────────────────────────────

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [menuVisibility, setMenuVisibility] = useState<Record<string, boolean>>({});
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Fetch menu visibility settings
  useEffect(() => {
    async function loadMenuVisibility() {
      try {
        const res = await fetch("/api/menu-settings");
        if (res.ok) {
          const data = await res.json();
          if (data.visibilityMap) {
            setMenuVisibility(data.visibilityMap);
          }
        }
      } catch (err) {
        console.error("Failed to load menu visibility", err);
      }
    }
    loadMenuVisibility();
  }, [pathname]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    if (userMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [userMenuOpen]);

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <img
            src="/logo.png"
            alt="ALARA Logo"
            className="h-12 w-12 animate-pulse object-contain"
          />
          <p className="text-sm text-slate-500">Memuat sesi...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) return null;

  const user = session.user;
  const role = (user as any).role ?? "PESERTA";
  const initials = user.name
    ? user.name
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col bg-white border-r border-slate-200 shrink-0">
        <SidebarContent role={role} pathname={pathname} menuVisibility={menuVisibility} />
      </aside>

      {/* ── Mobile Sidebar via Sheet ── */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigasi</SheetTitle>
          </SheetHeader>
          <SidebarContent
            role={role}
            pathname={pathname}
            menuVisibility={menuVisibility}
            onNavClick={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* ── Main Area ── */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="flex h-14 items-center gap-3 border-b border-slate-200 bg-white px-4 shrink-0">
          {/* Mobile hamburger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              className="lg:hidden h-8 w-8 inline-flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Buka menu"
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>
          </Sheet>

          {/* Page title – derived from pathname */}
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-semibold text-slate-800">
              {(() => {
                if (pathname.startsWith("/pengaturan/slide")) return "Pengaturan Slide";
                if (pathname.startsWith("/pengaturan/footer")) return "Pengaturan Footer";
                if (pathname.startsWith("/pengaturan/tema")) return "Tema Aplikasi";
                if (pathname.startsWith("/admin/users")) return "Kelola User";
                if (pathname.startsWith("/admin/menu-pengguna")) return "Kelola Menu Pengguna";
                if (pathname.startsWith("/admin/penandatangan")) return "Penandatangan Sertifikat";
                for (const item of NAV_ITEMS) {
                  if (item.children) {
                    const matchChild = item.children.find(
                      (c) => pathname === c.href || pathname.startsWith(c.href + "/")
                    );
                    if (matchChild) return matchChild.label;
                  }
                  if (pathname === item.href || pathname.startsWith(item.href + "/")) {
                    return item.label;
                  }
                }
                return pathname.startsWith("/pengaturan") ? "Pengaturan" : "Dashboard";
              })()}
            </p>
          </div>

          {/* Notification bell */}
          <Button variant="ghost" size="icon" className="h-8 w-8 relative">
            <Bell className="h-4 w-4 text-slate-600" />
          </Button>

          {/* User dropdown in top-right corner */}
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setUserMenuOpen((prev) => !prev)}
              className={cn(
                "flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 transition-all outline-none border cursor-pointer",
                userMenuOpen
                  ? "bg-slate-100 border-slate-300 shadow-sm"
                  : "hover:bg-slate-50 border-transparent hover:border-slate-200"
              )}
              aria-expanded={userMenuOpen}
              aria-label="Menu Pengguna"
            >
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name || "User"}
                  className="h-8 w-8 rounded-full object-cover border border-slate-200 shrink-0"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold shadow-sm shrink-0">
                  {initials}
                </div>
              )}
              <div className="hidden sm:block text-left min-w-0">
                <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-36">
                  {user?.name || "Peserta"}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={cn(
                      "text-[10px] font-semibold rounded px-1.5 py-0.5 leading-tight inline-block",
                      ROLE_COLORS[role] ?? "bg-slate-100 text-slate-600"
                    )}
                  >
                    {ROLE_LABELS[role] ?? role}
                  </span>
                </div>
              </div>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-slate-400 transition-transform duration-200",
                  userMenuOpen && "rotate-180 text-slate-700"
                )}
              />
            </button>

            {/* Dropdown Menu Popup */}
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white p-2 shadow-2xl border border-slate-200 z-50 animate-in fade-in-0 zoom-in-95">
                {/* User Info Header */}
                <div className="px-3 py-2.5 bg-slate-50/80 rounded-xl mb-1.5 border border-slate-100">
                  <div className="flex items-center gap-2.5">
                    {user.image ? (
                      <img
                        src={user.image}
                        alt="Avatar"
                        className="h-9 w-9 rounded-full object-cover border border-slate-200 shrink-0"
                      />
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold shrink-0">
                        {initials}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {user?.name || "Peserta"}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {user?.email || ""}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between pt-2 border-t border-slate-200/60 text-[10px]">
                    <span className="text-slate-500 font-medium">Status Akun</span>
                    <span
                      className={cn(
                        "font-semibold rounded px-1.5 py-0.5",
                        ROLE_COLORS[role] ?? "bg-slate-100 text-slate-600"
                      )}
                    >
                      {ROLE_LABELS[role] ?? role}
                    </span>
                  </div>
                </div>

                {/* Navigation Items */}
                <div className="space-y-0.5">
                  <Link
                    href="/profil"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                  >
                    <UserCog className="h-4 w-4 text-blue-600" />
                    <span>User Profile</span>
                  </Link>

                  <Link
                    href="/pengaturan/tema"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                  >
                    <Palette className="h-4 w-4 text-slate-500" />
                    <span>Tema Aplikasi</span>
                  </Link>

                  {role === "ADMIN" && (
                    <>
                      <Link
                        href="/admin/users"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                      >
                        <Users className="h-4 w-4 text-slate-500" />
                        <span>Kelola User</span>
                      </Link>
                      <Link
                        href="/admin/menu-pengguna"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                      >
                        <SlidersHorizontal className="h-4 w-4 text-slate-500" />
                        <span>Kelola Menu Pengguna</span>
                      </Link>
                      <Link
                        href="/admin/penandatangan"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                      >
                        <FileSignature className="h-4 w-4 text-slate-500" />
                        <span>Penandatangan Sertifikat</span>
                      </Link>
                      <Link
                        href="/pengaturan/footer"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                      >
                        <PanelBottom className="h-4 w-4 text-slate-500" />
                        <span>Pengaturan Footer</span>
                      </Link>
                      <Link
                        href="/pengaturan/slide"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                      >
                        <Images className="h-4 w-4 text-slate-500" />
                        <span>Pengaturan Slide</span>
                      </Link>
                    </>
                  )}

                  <Link
                    href={
                      role === "ADMIN"
                        ? "/admin/dashboard"
                        : role === "INSTRUCTOR"
                        ? "/instructor/dashboard"
                        : role === "SPONSOR"
                        ? "/sponsor/dashboard"
                        : "/dashboard"
                    }
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                  >
                    <LayoutDashboard className="h-4 w-4 text-slate-500" />
                    <span>
                      {role === "ADMIN"
                        ? "Dashboard Admin"
                        : role === "INSTRUCTOR"
                        ? "Dashboard Instruktur"
                        : role === "SPONSOR"
                        ? "Dashboard Sponsor"
                        : "Dashboard Saya"}
                    </span>
                  </Link>

                  {role === "ADMIN" && (
                    <Link
                      href="/admin/verifikasi"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                    >
                      <Shield className="h-4 w-4 text-slate-500" />
                      <span>Verifikasi Berkas</span>
                    </Link>
                  )}
                </div>

                <div className="my-1 border-t border-slate-100" />

                {/* Logout Button */}
                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    handleSignOut();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer text-left"
                >
                  <LogOut className="h-4 w-4 text-red-500" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
