"use client";

import Link from "next/link";
import { X } from "lucide-react";

// Exact menu list matching your screenshot
const PORTAL_ITEMS = [
  {
    label: "BPSC TEACHER",
    href: "/category/exams",
    textColor: "text-[#B91C1C]",
    highlight: false,
  },
  {
    label: "वैकल्पिक भूगोल",
    href: "/category/upsc",
    textColor: "text-[#7E22CE]",
    highlight: false,
  },
  {
    label: "बिहार का भूगोल",
    href: "/category/school/bseb",
    textColor: "text-[#059669]",
    highlight: false,
  },
  {
    label: "RESEARCH METHODOLOGY",
    href: "/category/university",
    textColor: "text-[#059669]",
    highlight: true,
  },
  {
    label: "UGC-NET/JRF Paper2",
    href: "/category/exams",
    textColor: "text-[#059669]",
    highlight: true,
  },
  {
    label: "Remote Sensing and GIS",
    href: "/category/university",
    textColor: "text-[#B91C1C]",
    highlight: false,
  },
  {
    label: "SOLVED  UGC NET/JRF AND OTHER  EXAM PAPER",
    href: "/category/exams",
    textColor: "text-[#059669]",
    highlight: true,
  },
  {
    label: "KVS, NVS, TGT, PGT & STET",
    href: "/category/exams",
    textColor: "text-[#059669]",
    highlight: true,
  },
  {
    label: "प्रेरक ज्ञान, विचार तथा कहानियाँ",
    href: "/category/gc",
    textColor: "text-slate-900 font-bold italic",
    highlight: true,
    hasPrefixBars: true,
  },
];

export default function LatestPdfsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-gray-200 overflow-hidden relative animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200 bg-[#F3F4F6]">
          <h3 className="text-sm font-black text-slate-800 tracking-wide uppercase">
            Latest PDFs &amp; Special Categories
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* The Exact Vertical Stack from Image */}
        <div className="p-5 overflow-y-auto max-h-[75vh] space-y-3.5 bg-white">
          {PORTAL_ITEMS.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              onClick={onClose}
              className="block w-full py-3 px-3 rounded border border-gray-200 bg-white hover:bg-slate-50 transition text-center shadow-2xs group"
            >
              {item.highlight ? (
                <span className="inline-flex items-center justify-center gap-1">
                  {item.hasPrefixBars && (
                    <span className="flex gap-1 mr-1.5">
                      <span className="w-1 h-3.5 bg-[#FEF08A] rounded-xs inline-block" />
                      <span className="w-1 h-3.5 bg-[#FEF08A] rounded-xs inline-block" />
                    </span>
                  )}
                  <span className={`bg-[#FEF9C3] px-2 py-0.5 rounded text-[13px] sm:text-[14px] font-bold tracking-wide ${item.textColor}`}>
                    {item.label}
                  </span>
                </span>
              ) : (
                <span className={`text-[13px] sm:text-[14px] font-bold tracking-wide ${item.textColor}`}>
                  {item.label}
                </span>
              )}
            </Link>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 border-t border-gray-100 bg-[#F9FAFB] flex justify-end">
          <button
            onClick={onClose}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-4 py-1.5 rounded-lg transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}