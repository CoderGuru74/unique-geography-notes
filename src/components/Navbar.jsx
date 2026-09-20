"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import LatestPdfsModal from "./LatestPdfsModal";

export default function Navbar({ searchQuery, setSearchQuery }) {
  const pathname = usePathname();
  const [latestModalOpen, setLatestModalOpen] = useState(false);

  const isUniversity = pathname.startsWith("/category/university");
  const isSchool = pathname.startsWith("/category/school");
  const isUpsc = pathname.startsWith("/category/upsc");
  const isExams = pathname.startsWith("/category/exams");
  const isGc = pathname.startsWith("/category/gc");
  const isHome = pathname === "/";

  return (
    <>
      <LatestPdfsModal 
        isOpen={latestModalOpen} 
        onClose={() => setLatestModalOpen(false)} 
      />

      <header className="w-full bg-[#E5E7EB]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 pt-5 pb-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-full overflow-hidden border border-gray-300 flex-shrink-0 bg-white shadow-xs">
              <Image src="/images/logo.jpeg" alt="Logo" fill sizes="48px" className="object-cover" priority />
            </div>
            <div>
              <h1 className="text-2xl md:text-[26px] font-black tracking-tight text-[#111827]">
                Unique Geography Notes
              </h1>
              <span className="text-[13px] font-medium text-slate-500">Curated by University Faculty</span>
            </div>
          </Link>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <div className="relative w-full md:w-80">
              <input
                type="text"
                placeholder="Search topic or notes..."
                value={searchQuery || ""}
                onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
                className="w-full bg-white text-xs pl-10 pr-4 py-2.5 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#E5A83B]"
              />
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            </div>

            <button
              type="button"
              onClick={() => setLatestModalOpen(true)}
              className="bg-[#E5A83B] hover:bg-[#d49425] text-slate-950 font-bold text-xs px-5 py-2.5 rounded-md transition shadow-xs whitespace-nowrap cursor-pointer"
            >
              Latest PDFs
            </button>
          </div>
        </div>

        {/* Global Nav */}
        <nav className="border-t border-b border-gray-300 bg-[#DFE2E8]">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 flex items-center gap-8 overflow-x-auto text-[14px] font-medium text-slate-900">
            <Link
              href="/"
              className={`py-3 px-1 hover:text-black whitespace-nowrap transition ${
                isHome ? "font-bold text-slate-950 border-b-2 border-[#E5A83B]" : ""
              }`}
            >
              Home
            </Link>

            <Link
              href="/category/upsc"
              className={`py-3 px-1 hover:text-black whitespace-nowrap transition ${
                isUpsc ? "font-bold text-slate-950 border-b-2 border-[#E5A83B]" : ""
              }`}
            >
              UPSC &amp; PSC
            </Link>

            <Link
              href="/category/school"
              className={`py-3 px-1 hover:text-black whitespace-nowrap transition ${
                isSchool ? "font-bold text-slate-950 border-b-2 border-[#E5A83B]" : ""
              }`}
            >
              School Notes
            </Link>

            <Link
              href="/category/exams"
              className={`py-3 px-1 hover:text-black whitespace-nowrap transition ${
                isExams ? "font-bold text-slate-950 border-b-2 border-[#E5A83B]" : ""
              }`}
            >
              Exams (CTET, UGC-NET)
            </Link>

            <Link
              href="/category/university"
              className={`py-3 px-1 hover:text-black whitespace-nowrap transition ${
                isUniversity ? "font-bold text-slate-950 border-b-2 border-[#E5A83B]" : ""
              }`}
            >
              University Notes
            </Link>

            <Link
              href="/category/gc"
              className={`py-3 px-1 hover:text-black whitespace-nowrap transition ${
                isGc ? "font-bold text-slate-950 border-b-2 border-[#E5A83B]" : ""
              }`}
            >
              GC
            </Link>
          </div>
        </nav>
      </header>
    </>
  );
}