import Link from "next/link";
import { Search } from "lucide-react";

export default function Navbar() {
  return (
    <header className="w-full bg-[#E5E7EB] border-b border-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900">
            Unique Geography Notes
          </h1>
          <p className="text-xs text-slate-500 font-medium">Curated by University Faculty</p>
        </div>

        <div className="flex items-center gap-3 flex-1 max-w-md justify-end">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search by topic, class or exam..."
              className="w-full bg-white text-xs md:text-sm pl-9 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#D99A26]"
            />
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          </div>
          <button className="bg-[#D99A26] hover:bg-[#b8801d] text-slate-950 font-semibold text-xs md:text-sm px-5 py-2 rounded-lg transition whitespace-nowrap shadow-sm">
            Latest PDFs
          </button>
        </div>
      </div>

      <nav className="border-t border-gray-300 bg-[#ECEEF2]">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-6 overflow-x-auto text-xs md:text-sm font-semibold py-2.5 text-slate-700">
          <Link href="/" className="border-b-2 border-slate-900 pb-0.5 text-slate-950">Home</Link>
          <Link href="/category/upsc" className="hover:text-slate-950 transition">UPSC & PSC</Link>
          <Link href="/category/school" className="hover:text-slate-950 transition">School Notes</Link>
          <Link href="/category/exams" className="hover:text-slate-950 transition">Exams (CTET, UGC-NET)</Link>
          <Link href="/category/university" className="hover:text-slate-950 transition">University Notes</Link>
          <Link href="/category/gc" className="hover:text-slate-950 transition">GC</Link>
        </div>
      </nav>
    </header>
  );
}