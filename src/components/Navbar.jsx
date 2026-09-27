"use client";

import { useState } from "react";
import SearchBar from "./SearchBar";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LatestPdfsModal from "./LatestPdfsModal";

const NAV_ITEMS = [
  {
    name: "Home",
    href: "/",
    match: (pathname) => pathname === "/",
    bgClass: "bg-[#0B2545] hover:bg-[#081B33] text-white", // Dark Navy
  },
  {
    name: "UPSC & PSC",
    href: "/category/upsc",
    match: (pathname) => pathname.startsWith("/category/upsc"),
    bgClass: "bg-[#DC2626] hover:bg-[#B91C1C] text-white", // Crimson Red
  },
  {
    name: "School Notes",
    href: "/category/school",
    match: (pathname) => pathname.startsWith("/category/school"),
    bgClass: "bg-[#2563EB] hover:bg-[#1D4ED8] text-white", // Royal Blue
  },
  {
    name: "Exams (CTET, UGC-NET)",
    href: "/category/exams",
    match: (pathname) => pathname.startsWith("/category/exams"),
    bgClass: "bg-[#16A34A] hover:bg-[#15803D] text-white", // Forest Green
  },
  {
    name: "University Notes",
    href: "/category/university",
    match: (pathname) => pathname.startsWith("/category/university"),
    bgClass: "bg-[#7C3AED] hover:bg-[#6D28D9] text-white", // Deep Purple
  },
  {
    name: "General Competition",
    href: "/category/gc",
    match: (pathname) => pathname.startsWith("/category/gc"),
    bgClass: "bg-[#D97706] hover:bg-[#B45309] text-white", // Amber Orange
  },
];

export default function Navbar() {
  const pathname = usePathname();
  const [latestModalOpen, setLatestModalOpen] = useState(false);

  return (
    <>
      <LatestPdfsModal
        isOpen={latestModalOpen}
        onClose={() => setLatestModalOpen(false)}
      />

      <header className="w-full bg-[#E5E7EB]">
        {/* Top Header Row */}
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 pt-5 pb-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-full overflow-hidden border border-gray-300 shrink-0 bg-white shadow-xs">
              <Image src="/images/logo.jpeg" alt="Logo" fill sizes="48px" className="object-cover" priority />
            </div>
            <div>
              <h1 className="text-2xl md:text-[26px] font-black tracking-tight text-[#111827]">
                Unique Geography Notes
              </h1>
              <span className="text-[13px] font-medium text-slate-500">Curated by University Faculty</span>
            </div>
          </Link>

          {/* Action Row */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <div className="w-full md:w-80">
              <SearchBar />
            </div>

            <button
              type="button"
              onClick={() => setLatestModalOpen(true)}
              className="bg-[#E5A83B] hover:bg-[#d49425] text-slate-950 font-bold text-xs px-5 py-2.5 rounded-lg transition shadow-xs whitespace-nowrap cursor-pointer shrink-0"
            >
              Other links
            </button>
          </div>
        </div>

        {/* Global Navigation Strip */}
        <nav className="border-t border-b border-gray-300 bg-[#DFE2E8] py-2.5">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 flex items-center gap-2.5 overflow-x-auto text-[13px]">
            {NAV_ITEMS.map((item) => {
              const isActive = item.match(pathname);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all duration-150 font-bold text-xs sm:text-[13px] shadow-sm flex items-center gap-2 border ${item.bgClass} ${
                    isActive
                      ? "ring-3 ring-amber-400 border-white scale-105"
                      : "opacity-90 hover:opacity-100 border-black/10"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>
      </header>
    </>
  );
}