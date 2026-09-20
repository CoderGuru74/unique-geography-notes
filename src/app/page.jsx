"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Quote } from "lucide-react";
import Navbar from "../components/Navbar";

const categories = [
  {
    title: "UPSC & State PSC",
    desc: "Prelims & Mains Geography & GS Papers",
    href: "/category/upsc",
    image: "/images/image 32.png",
  },
  {
    title: "University Notes",
    desc: "B.A., M.A., & Semester exam geography modules",
    href: "/category/university",
    image: "/images/image 29.png",
  },
  {
    title: "NCERT (6th to 12th)",
    desc: "Class-wise chapter Summaries & Key Points",
    href: "/category/school/cbse",
    image: "/images/image 30.png",
  },
  {
    title: "Bihar Board",
    desc: "BSEB Geography & Social Science Notes (Hindi/English)",
    href: "/category/school/bseb",
    image: "/images/image 25.png",
  },
  {
    title: "CTET",
    desc: "Paper - 1 & Paper - 2 Geography Syllabus",
    href: "/category/exams",
    image: "/images/image 26.png",
  },
  {
    title: "UGC-NET / JRF",
    desc: "Paper - 1 & Paper - 2 Geography Syllabus",
    href: "/category/exams",
    image: "/images/image 27.png",
  },
  {
    title: "General competition",
    desc: "SSC, Railways, Banking, GK & GS PDFs",
    href: "/category/gc",
    image: "/images/image 31.png",
  },
  {
    title: "Latest Current Affairs/Map Notes",
    desc: "High Yield Diagrams & Mapping Material",
    href: "/category/upsc",
    image: "/images/image 28.png",
  },
];

const testimonials = [
  { 
    name: "Harsh", 
    text: "The mapping and GS prelims summaries cut my revision time in half." 
  },
  { 
    name: "Nishant", 
    text: "University semester notes followed strictly syllabus standard. High yield." 
  },
  { 
    name: "Mayank", 
    text: "Clear diagrams and accurate NCERT point-to-point explanations." 
  },
];

export default function Home() {
  const router = useRouter();

  // Search and quick finder state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExam, setSelectedExam] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  // Direct PDF Quick Finder Click Handler
  const handleFinderSubmit = () => {
    if (selectedExam === "UPSC" || selectedExam === "BPSC") {
      router.push("/category/upsc");
    } else if (selectedExam === "NCERT 11th/12th") {
      router.push("/category/school/cbse");
    } else {
      router.push("/category/gc");
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-[#E5E9EF] font-sans text-slate-900">
      {/* Universal Navbar containing Latest PDFs Modal */}
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {/* ================= HERO SECTION ================= */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 py-10 md:py-14 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full">
        <div className="lg:col-span-7 flex flex-col justify-center">
          <h2 className="text-3xl sm:text-4xl md:text-[42px] font-extrabold text-[#111827] leading-[1.18] tracking-tight mb-5">
            Master Geography &amp; General <br className="hidden sm:inline" />
            Studies with Comprehensive, <br className="hidden sm:inline" />
            Professor–Curated Notes
          </h2>

          <p className="text-[15px] text-[#374151] leading-relaxed max-w-xl mb-8 font-normal">
            High-quality Downloadable PDF notes tailored for UPSC, State PSCs, UGC-NET, NCERT, Bihar Board and other Competitive Exams.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link 
              href="/category/exams"
              className="bg-[#E5A83B] hover:bg-[#d49425] text-[#1e1b18] font-bold text-[13px] px-6 py-3 rounded-lg shadow-sm transition inline-block text-center"
            >
              Explore Exam Notes
            </Link>

            <Link 
              href="/category/school/cbse"
              className="bg-[#474F59] hover:bg-[#343A42] text-white font-semibold text-[13px] px-6 py-3 rounded-lg shadow-sm transition inline-block text-center"
            >
              Download Free NCERT PDFs
            </Link>
          </div>
        </div>

        <div className="lg:col-span-5 flex justify-center items-center">
          <div className="relative w-full max-w-[500px] aspect-[4/3] rounded-2xl overflow-hidden shadow-sm border border-slate-300/60 bg-white">
            <Image
              src="/images/geeo.jpg"
              alt="Unique Geography Notes Banner"
              fill
              sizes="(max-width: 768px) 100vw, 500px"
              className="object-cover"
              priority
            />
          </div>
        </div>
      </section>

      {/* ================= TRUST BADGES / FEATURES ================= */}
      <section className="border-t border-b border-gray-300 bg-[#D4D8DF] py-4">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-[#1E293B]">
          <div className="flex items-center gap-3">
            <div className="relative w-7 h-7 flex-shrink-0">
              <Image
                src="/images/image 15.png"
                alt="100% Free & Verified Notes"
                fill
                sizes="28px"
                className="object-contain"
              />
            </div>
            <span className="text-xs font-bold leading-tight">
              100% Free &amp; <br /> Verified Notes
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-7 h-7 flex-shrink-0">
              <Image
                src="/images/image 16.png"
                alt="NCERT & Bihar Board Covered"
                fill
                sizes="28px"
                className="object-contain"
              />
            </div>
            <span className="text-xs font-bold leading-tight">
              NCERT (Class 6–12) &amp; <br /> Bihar Board Covered
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-7 h-7 flex-shrink-0">
              <Image
                src="/images/image 17.png"
                alt="Detailed UPSC & State PSC Syllabus Maps"
                fill
                sizes="28px"
                className="object-contain"
              />
            </div>
            <span className="text-xs font-bold leading-tight">
              Detailed UPSC &amp; State <br /> PSC Syllabus Maps
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-7 h-7 flex-shrink-0">
              <Image
                src="/images/image 18.png"
                alt="Easy 1-Click PDF Download"
                fill
                sizes="28px"
                className="object-contain"
              />
            </div>
            <span className="text-xs font-bold leading-tight">
              Easy 1-Click <br /> PDF Download
            </span>
          </div>
        </div>
      </section>

      {/* ================= CATEGORY GRID ================= */}
      <section id="categories-section" className="py-12 max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 w-full">
        <h3 className="text-2xl md:text-3xl font-extrabold text-center text-slate-900 mb-10 tracking-tight">
          Choose Your Preparation Category
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, idx) => (
            <Link
              key={idx}
              href={cat.href}
              className="bg-white rounded-2xl p-6 flex flex-col items-center text-center shadow-sm hover:shadow-md transition border border-gray-200/80"
            >
              <h4 className="text-base font-bold text-slate-900 mb-4">{cat.title}</h4>
              
              <div className="relative w-24 h-24 mb-4 flex items-center justify-center">
                <Image
                  src={cat.image}
                  alt={cat.title}
                  fill
                  sizes="96px"
                  className="object-contain"
                />
              </div>

              <p className="text-xs text-slate-500 max-w-[220px] leading-relaxed">
                {cat.desc}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ================= DIRECT QUICK FINDER ================= */}
      <section className="max-w-[1100px] mx-auto px-4 sm:px-6 md:px-8 w-full mb-12">
        <div className="bg-[#C8CBD0] rounded-2xl p-6 shadow-inner text-center">
          <h4 className="text-base font-bold text-slate-900 mb-4">Direct PDF Quick Finder</h4>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <select 
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="bg-white text-xs px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none"
            >
              <option value="">Select Exam/Class</option>
              <option value="UPSC">UPSC</option>
              <option value="BPSC">BPSC</option>
              <option value="NCERT 11th/12th">NCERT 11th/12th</option>
            </select>
            <select 
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="bg-white text-xs px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none"
            >
              <option value="">Select Subject / Chapter</option>
              <option value="Physical Geography">Physical Geography</option>
              <option value="Human Geography">Human Geography</option>
              <option value="Indian Geography">Indian Geography</option>
            </select>
            <button 
              onClick={handleFinderSubmit}
              className="bg-[#D99A26] hover:bg-[#bc831c] text-slate-950 font-bold text-xs px-5 py-2.5 rounded-lg shadow-sm transition cursor-pointer"
            >
              Find Notes Now
            </button>
          </div>
        </div>
      </section>

      {/* ================= PROFESSOR CARD (DR. AMAR KUMAR) ================= */}
      <section className="max-w-[1100px] mx-auto px-4 sm:px-6 md:px-8 my-6 w-full">
        <div className="bg-[#F6E9D5] rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center gap-8 shadow-sm border border-amber-200/60">
          <div className="relative w-48 h-60 rounded-2xl overflow-hidden shadow-md border-2 border-amber-300 flex-shrink-0 bg-white">
            <Image
              src="/images/prof.jpeg"
              alt="Dr. Amar Kumar"
              fill
              sizes="192px"
              className="object-cover object-top"
            />
          </div>

          <div className="flex-1 text-left">
            <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-1">
              Dr. Amar Kumar
            </h3>
            <p className="text-sm font-semibold text-amber-900 mb-4">
              Assistant Professor | Department of Geography, PPU, Patna (Bihar) India
            </p>

            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-1.5">
              Dedicated to Academic Guidance
            </h4>
            <p className="text-xs md:text-sm text-slate-700 leading-relaxed mb-6">
              I am working as an Assistant Professor in The Department Of Geography in PPU, Patna (Bihar) India. I want to help the students and study lovers across the world who face difficulties to gather the information and knowledge about Geography.
            </p>

            <div className="bg-white/80 backdrop-blur rounded-xl p-4 shadow-sm border border-amber-200/60">
              <p className="text-xs md:text-sm italic text-slate-800 font-medium">
                &ldquo;I think my latest UNIQUE GEOGRAPHY NOTES are more useful for them and I publish all types of notes regularly.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= TESTIMONIALS ================= */}
      <section className="py-10 max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 w-full">
        <h3 className="text-2xl font-extrabold text-center text-slate-900 mb-8">
          Student Testimonials
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((item, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 relative">
              <Quote className="w-6 h-6 text-blue-600 mb-3" />
              <h4 className="font-bold text-sm text-slate-900 mb-1">{item.name}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= CONTACT US ================= */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-10 text-center w-full mb-12">
        <h3 className="text-2xl font-extrabold text-slate-900 mb-6">Contact Us</h3>
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert("Thank you! Your message has been received."); }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              type="text" 
              required
              suppressHydrationWarning
              placeholder="Your Name :" 
              className="w-full bg-white rounded-xl px-4 py-3 text-xs border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" 
            />
            <input 
              type="email" 
              required
              suppressHydrationWarning
              placeholder="Email Address :" 
              className="w-full bg-white rounded-xl px-4 py-3 text-xs border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" 
            />
          </div>
          <textarea 
            rows={4} 
            required
            placeholder="Enter Your Message :" 
            className="w-full bg-white rounded-xl p-4 text-xs border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" 
          />
          <button 
            type="submit" 
            className="bg-[#2B70F7] hover:bg-blue-600 text-white font-semibold text-xs px-8 py-3 rounded-xl transition shadow cursor-pointer"
          >
            Send Message
          </button>
        </form>
      </section>
    </main>
  );
}