"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { MapPin, Menu, X, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReportStore } from "@/lib/store";
import { logout } from "@/lib/auth";
import { LogOut, User, LogIn } from "lucide-react";
import { useTranslation, type Language } from "@/lib/i18n";

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useReportStore();
  const { t, lang, setLang } = useTranslation();

  const links = [
    { href: "/", label: t("home") },
    { href: "/report", label: t("reportSpot") },
    { href: "/dashboard", label: t("dashboard") },
  ];

  const handleLogout = async () => {
    await logout();
  };

  const toggleLang = () => {
    const order: Language[] = ["en", "ta", "hi"];
    const idx = order.indexOf(lang);
    const next = order[(idx + 1) % order.length] ?? "en";
    setLang(next);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b-[3px] border-black shadow-[0_3px_0_0_#000]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group brutal-hover">
            <div className="p-1 px-1.5 border-[3px] border-black bg-brutal-yellow">
              <MapPin className="w-5 h-5 text-black" />
            </div>
            <span className="text-xl font-black tracking-tight text-black uppercase">
              Swish<span className="text-brutal-cyan block sm:inline drop-shadow-[1px_1px_0_#000]">ti</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-1.5 text-sm font-bold border-[3px] border-transparent uppercase transition-all",
                  pathname === link.href
                    ? "bg-brutal-yellow border-black shadow-[3px_3px_0px_#000] text-black"
                    : "text-neutral-700 hover:text-black hover:bg-neutral-100 border-transparent hover:border-black"
                )}
              >
                {link.label}
              </Link>
            ))}

            <div className="h-6 w-[3px] bg-black mx-1" />

            {/* Language Toggle */}
            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 px-2.5 py-1.5 border-[3px] border-black bg-white shadow-[3px_3px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_#000] transition-all"
              title="Toggle Language"
            >
              <Globe className="w-3.5 h-3.5 text-black" />
              <span className="text-[10px] font-black text-black uppercase">{t("language")}</span>
            </button>

            <div className="h-6 w-[3px] bg-black mx-1" />

            {user ? (
              <div className="flex items-center gap-3 ml-1">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white border-[3px] border-black shadow-[3px_3px_0px_#000]">
                  <User className="w-4 h-4 text-black" />
                  <span className="text-xs font-bold text-black max-w-[120px] truncate">
                    {user.email}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 border-[3px] border-black bg-brutal-red text-black brutal-button flex items-center justify-center shadow-[3px_3px_0px_#000]"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 px-4 py-1.5 bg-brutal-cyan text-black brutal-button font-bold text-sm shadow-[3px_3px_0px_#000] border-[3px]"
              >
                <LogIn className="w-4 h-4" />
                {t("login").toUpperCase()}
              </Link>
            )}
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden flex items-center gap-2">
            {/* Language Toggle (mobile) */}
            <button
              onClick={toggleLang}
              className="p-1.5 border-[3px] border-black bg-white shadow-[2px_2px_0px_#000]"
            >
              <Globe className="w-4 h-4 text-black" />
            </button>
            <button
              className="p-1.5 bg-white border-[3px] border-black shadow-[3px_3px_0px_#000]"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5 text-black" /> : <Menu className="w-5 h-5 text-black" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t-[3px] border-black overflow-hidden"
          >
            <div className="px-4 py-4 flex flex-col gap-3">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "block px-4 py-2.5 text-sm font-bold uppercase transition-colors border-[3px]",
                    pathname === link.href
                      ? "bg-brutal-yellow border-black shadow-[3px_3px_0px_#000] text-black"
                      : "bg-white border-black text-black hover:bg-neutral-100"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              
              <div className="pt-4 mt-2 border-t-[3px] border-black">
                {user ? (
                  <div className="flex flex-col gap-3">
                    <div className="px-4 py-2 text-xs font-bold border-[3px] border-black bg-white shadow-[3px_3px_0px_#000] truncate">
                      {t("user").toUpperCase()}: {user.email}
                    </div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileOpen(false);
                      }}
                      className="flex w-full justify-center items-center gap-2 px-4 py-2.5 bg-brutal-red text-black brutal-button border-[3px]"
                    >
                      <LogOut className="w-4 h-4" />
                      {t("logout").toUpperCase()}
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex w-full justify-center items-center gap-2 px-4 py-3 bg-brutal-cyan text-black brutal-button border-[3px]"
                  >
                    <LogIn className="w-4 h-4" />
                    {t("login").toUpperCase()}
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
