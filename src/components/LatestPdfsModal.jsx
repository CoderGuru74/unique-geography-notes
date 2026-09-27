"use client";

import React from "react";
import Link from "next/link";
import { Link2, X } from "lucide-react";

const MODAL_BUTTON_LINKS = [
  {
    id: 1,
    title: "BPSC TEACHER",
    href: "/read/%E0%A4%B8%E0%A4%BE%E0%A4%AE%E0%A4%BE%E0%A4%A8%E0%A5%8D%E0%A4%AF-%E0%A4%85%E0%A4%A7%E0%A5%8D%E0%A4%AF%E0%A4%AF%E0%A4%A8",
    color: "bg-[#DC2626] hover:bg-[#B91C1C]", // Red
    hasNewBadge: true,
  },
  {
    id: 2,
    title: "वैकल्पिक भूगोल (UPSC / State PSC)",
    href: "/read/%e0%a4%b5%e0%a5%88%e0%a4%95%e0%a4%b2%e0%a5%8d%e0%a4%aa%e0%a4%bf%e0%a4%95-%e0%a4%ad%e0%a5%82%e0%a4%97%e0%a5%8b%e0%a4%b2",
    color: "bg-[#2563EB] hover:bg-[#1D4ED8]", // Blue
    hasNewBadge: true,
  },
  {
    id: 3,
    title: "बिहार का भूगोल (Geography of Bih...",
    href: "/read/geography-of-bihar",
    color: "bg-[#16A34A] hover:bg-[#15803D]", // Green
    hasNewBadge: true,
  },
  {
    id: 4,
    title: "RESEARCH METHODOLOGY",
    href: "/read/research-methodology",
    color: "bg-[#2563EB] hover:bg-[#1D4ED8]", // Blue
    hasNewBadge: true,
  },
  {
    id: 5,
    title: "UGC-NET / JRF Paper 2 (Geogra...",
    href: "/read/question-answer-test",
    color: "bg-[#DC2626] hover:bg-[#B91C1C]", // Red
    hasNewBadge: true,
  },
  {
    id: 6,
    title: "Remote Sensing and GIS",
    href: "/read/1-remote-sensing-and-gis",
    color: "bg-[#2563EB] hover:bg-[#1D4ED8]", // Blue
    hasNewBadge: false, // In the screenshot, this row has no NEW tag
  },
  {
    id: 7,
    title: "SOLVED UGC NET/JRF AND OTH...",
    href: "/read/solved-exam-paper",
    color: "bg-[#16A34A] hover:bg-[#15803D]", // Green
    hasNewBadge: true,
  },
  {
    id: 8,
    title: "KVS, NVS, TGT, PGT & STET",
    href: "/category/exams/",
    color: "bg-[#DC2626] hover:bg-[#B91C1C]", // Red
    hasNewBadge: true,
  },
];

export default function LatestPdfsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[340px] sm:max-w-[370px] bg-[#EEF2F6] rounded-2xl shadow-2xl overflow-hidden border border-slate-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Navy Blue Header */}
        <div className="bg-[#1D4ED8] px-4 py-3 flex items-center justify-between text-white shadow-xs">
          <div className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-blue-200" />
            <h3 className="text-base font-black tracking-tight">
              Other Links / Important PDFs
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-lg transition cursor-pointer text-white"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Buttons List Container */}
        <div className="p-3.5 space-y-2.5 max-h-[75vh] overflow-y-auto">
          {MODAL_BUTTON_LINKS.map((btn) => (
            <Link
              key={btn.id}
              href={btn.href}
              onClick={onClose}
              className={`w-full ${btn.color} text-white font-extrabold text-[12.5px] px-3.5 py-3 rounded-xl flex items-center justify-between shadow-xs transition-transform active:scale-[0.98] cursor-pointer`}
            >
              <div className="flex items-center gap-2.5 truncate pr-2">
                <span className="text-base shrink-0 leading-none">👉</span>
                <span className="truncate tracking-wide">{btn.title}</span>
              </div>

              {btn.hasNewBadge && (
                <span className="bg-[#FACC15] text-amber-950 font-black text-[9px] uppercase px-1.5 py-0.5 rounded tracking-wide shrink-0 shadow-2xs">
                  NEW
                </span>
              )}
            </Link>
          ))}
        </div>

        {/* Footer with grey Close Button */}
        <div className="px-3.5 pb-3.5 pt-1 flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#DCE3EC] hover:bg-[#cbd5e1] text-slate-800 font-bold text-xs px-5 py-2 rounded-xl transition cursor-pointer shadow-2xs active:scale-95"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}