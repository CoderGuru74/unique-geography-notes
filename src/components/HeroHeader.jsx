import Link from "next/link";
import Image from "next/image";
import { 
  Search, 
  BadgeCheck, 
  GraduationCap, 
  BookOpenCheck, 
  FileDown 
} from "lucide-react";

export default function HeroHeader() {
  return (
    <div className="w-full bg-[#E5E9EF] font-sans">
      {/* --- TOP BRANDING & SEARCH BAR --- */}
      <div className="max-w-7xl mx-auto px-6 pt-6 pb-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Logo / Site Title */}
        <div className="flex flex-col">
          <h1 className="text-2xl md:text-[26px] font-black tracking-tight text-[#111827]">
            Unique Geography Notes
          </h1>
          <span className="text-[13px] font-medium text-slate-500">
            Curated by University Faculty
          </span>
        </div>

        {/* Search Bar & Action Button */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search by topic, class or exam..."
              className="w-full bg-white text-xs pl-10 pr-4 py-2.5 rounded-md border border-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#E5A83B]"
            />
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400 stroke-[2.2]" />
          </div>

          <button className="bg-[#E5A83B] hover:bg-[#d49425] text-[#1e1b18] font-bold text-xs px-5 py-2.5 rounded-md transition shadow-sm whitespace-nowrap">
            Latest PDFs
          </button>
        </div>
      </div>

      {/* --- SUB-NAV MENU BAR --- */}
      <div className="border-t border-b border-gray-300/80 bg-[#DFE3EA]">
        <div className="max-w-7xl mx-auto px-6 flex items-center gap-8 overflow-x-auto text-[13px] font-semibold text-[#334155] py-0">
          <Link 
            href="/" 
            className="text-slate-900 border-b-2 border-[#E5A83B] py-2.5 px-1 font-bold"
          >
            Home
          </Link>
          <Link href="/category/upsc" className="hover:text-black transition py-2.5 px-1 whitespace-nowrap">
            UPSC & PSC
          </Link>
          <Link href="/category/school" className="hover:text-black transition py-2.5 px-1 whitespace-nowrap">
            School Notes
          </Link>
          <Link href="/category/exams" className="hover:text-black transition py-2.5 px-1 whitespace-nowrap">
            Exams (CTET, UGC-NET)
          </Link>
          <Link href="/category/university" className="hover:text-black transition py-2.5 px-1 whitespace-nowrap">
            University Notes
          </Link>
          <Link href="/category/gc" className="hover:text-black transition py-2.5 px-1 whitespace-nowrap">
            GC
          </Link>
        </div>
      </div>

      {/* --- MAIN HERO SECTION --- */}
      <section className="max-w-7xl mx-auto px-6 py-12 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Headings & CTA */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          <h2 className="text-3xl sm:text-4xl md:text-[42px] font-extrabold text-[#111827] leading-[1.18] tracking-tight mb-5">
            Master Geography & General <br className="hidden sm:inline" />
            Studies with Comprehensive, <br className="hidden sm:inline" />
            Professor–Curated Notes
          </h2>

          <p className="text-[15px] text-[#374151] leading-relaxed max-w-xl mb-8 font-normal">
            High-quality Downloadable PDF notes tailored for UPSC, State PSCs, UGC-NET, NCERT, Bihar Board and other Competitive Exams.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button className="bg-[#E5A83B] hover:bg-[#d49425] text-[#1e1b18] font-bold text-[13px] px-6 py-3 rounded-lg shadow-sm transition">
              Explore Exam Notes
            </button>
            <button className="bg-[#474F59] hover:bg-[#343A42] text-white font-semibold text-[13px] px-6 py-3 rounded-lg shadow-sm transition">
              Download Free NCERT PDFs
            </button>
          </div>
        </div>

        {/* Right Column: Geography Hero Image */}
        <div className="lg:col-span-5 flex justify-center items-center">
          <div className="relative w-full max-w-[460px] aspect-[4/3] rounded-2xl overflow-hidden shadow-sm border border-slate-300/60 bg-white">
            <Image
              src="/images/geography-hero.png" // Place your downloaded image in public/images/
              alt="Geography and Earth Studies"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </section>

      {/* --- BOTTOM TRUST BADGES / FEATURE STRIP --- */}
      <section className="border-t border-b border-gray-300 bg-[#D4D8DF] py-4">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-[#1E293B]">
          
          <div className="flex items-center gap-3">
            <BadgeCheck className="w-6 h-6 text-black stroke-[2]" />
            <span className="text-xs font-bold leading-tight">
              100% Free &amp; <br /> Verified Notes
            </span>
          </div>

          <div className="flex items-center gap-3">
            <GraduationCap className="w-6 h-6 text-black stroke-[2]" />
            <span className="text-xs font-bold leading-tight">
              NCERT (Class 6–12) &amp; <br /> Bihar Board Covered
            </span>
          </div>

          <div className="flex items-center gap-3">
            <BookOpenCheck className="w-6 h-6 text-black stroke-[2]" />
            <span className="text-xs font-bold leading-tight">
              Detailed UPSC &amp; State <br /> PSC Syllabus Maps
            </span>
          </div>

          <div className="flex items-center gap-3">
            <FileDown className="w-6 h-6 text-black stroke-[2]" />
            <span className="text-xs font-bold leading-tight">
              Easy 1-Click <br /> PDF Download
            </span>
          </div>

        </div>
      </section>
    </div>
  );
}