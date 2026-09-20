"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  BookOpen, 
  ArrowRight, 
  CheckCircle2, 
  FileText, 
  Layers, 
  Sparkles,
  HelpCircle
} from "lucide-react";
import Navbar from "../../../components/Navbar";

const BOARD_OPTIONS = [
  {
    id: "cbse",
    title: "CBSE & NCERT Curriculum",
    subtitle: "Central Board of Secondary Education",
    desc: "Complete chapter-wise notes, NCERT textbook solutions, diagrams, and key revision points for Classes 6 through 12.",
    href: "/category/school/cbse",
    badge: "National Standard",
    badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
    gradient: "from-[#0B2545] to-[#134074]",
    classes: "Classes 6th, 7th, 8th, 9th, 10th, 11th, 12th",
    subjects: "Geography • Social Science (History, Civics, Economics)",
    features: [
      "Official NCERT syllabus outlines",
      "Chapter summaries with printable PDFs",
      "Human & Physical Geography deep-dives",
      "Map work & objective questions",
    ],
  },
  {
    id: "bseb",
    title: "Bihar Board (BSEB) Patna",
    subtitle: "Bihar School Examination Board",
    desc: "Targeted study material prepared strictly for BSEB board examination patterns in both Hindi & English medium.",
    href: "/category/school/bseb",
    badge: "State Board Pattern",
    badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
    gradient: "from-[#1F2937] to-[#111827]",
    classes: "Classes 6th to 12th (Arts / Humanities)",
    subjects: "भूगोल • सामाजिक विज्ञान (इतिहास, नागरिक शास्त्र, अर्थशास्त्र)",
    features: [
      "BSEB Patna annual examination model papers",
      "Hindi & English medium chapter notes",
      "Class 11 & 12 Geography specialist modules",
      "High-yield 1-page revision sheets",
    ],
  },
];

const WHAT_WE_PROVIDE = [
  {
    icon: FileText,
    title: "Chapter-Wise Conceptual Notes",
    desc: "Rigorous summaries breaking down textbook chapters into digestible concepts, definitions, and diagrams.",
  },
  {
    icon: Layers,
    title: "Dual Medium Support",
    desc: "Carefully curated notes available in both Hindi and English for maximum student accessibility.",
  },
  {
    icon: HelpCircle,
    title: "Objective & Subjective Q&A",
    desc: "Comprehensive question banks including MCQs, short answers, and previous years' board questions with solutions.",
  },
  {
    icon: Sparkles,
    title: "Printable Study PDFs",
    desc: "Clean, distraction-free PDF notes formatted specifically for offline reading and desktop printing.",
  },
];

export default function SchoolNotesHub() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <main className="min-h-screen flex flex-col bg-[#E5E9EF] font-sans text-slate-900">
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {/* Hero Banner */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 pt-8 pb-6 w-full">
        <div className="text-xs font-semibold text-slate-500 mb-3 flex items-center gap-1.5">
          <Link href="/" className="hover:underline">Home</Link>
          <span>›</span>
          <span className="text-[#E5A83B]">School Notes Hub</span>
        </div>

        <div className="bg-[#EFE5D5] rounded-3xl p-6 sm:p-12 border border-amber-200/70 shadow-sm">
          <div className="max-w-3xl">
            <span className="text-xs font-black text-[#B45309] uppercase tracking-wider block mb-2">
              Classes 6th to 12th Academic Resource Center
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-[40px] font-black text-slate-950 leading-[1.2] tracking-tight mb-3">
              School Geography &amp; Social Science Notes
            </h1>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal mb-6">
              Curated study materials, detailed chapter summaries, NCERT solutions, and board-specific question papers tailored for secondary and senior secondary students.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-800">
              <span className="flex items-center gap-1.5 bg-white/70 px-3 py-1.5 rounded-lg border border-amber-200/80">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> NCERT Aligned
              </span>
              <span className="flex items-center gap-1.5 bg-white/70 px-3 py-1.5 rounded-lg border border-amber-200/80">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> BSEB Patna Pattern
              </span>
              <span className="flex items-center gap-1.5 bg-white/70 px-3 py-1.5 rounded-lg border border-amber-200/80">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Hindi &amp; English Medium
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Board Selection Cards */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 py-6 w-full">
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Select Your Examination Board
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Choose your board below to view curriculum-aligned chapter notes and download PDFs.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {BOARD_OPTIONS.map((board) => (
            <div
              key={board.id}
              className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200 flex flex-col justify-between hover:shadow-md transition"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className={`text-[11px] font-black px-3 py-1 rounded-full border ${board.badgeColor}`}>
                    {board.badge}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    Classes 6–12
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-1">
                  {board.title}
                </h3>
                <p className="text-xs font-bold text-[#B45309] mb-3">
                  {board.subtitle}
                </p>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                  {board.desc}
                </p>

                <div className="bg-slate-50 rounded-2xl p-4 border border-gray-100 mb-6 space-y-2">
                  <div className="text-xs font-bold text-slate-800">
                    <span className="text-slate-500">Coverage: </span> {board.classes}
                  </div>
                  <div className="text-xs font-bold text-slate-800">
                    <span className="text-slate-500">Subjects: </span> {board.subjects}
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                    What&apos;s Included:
                  </span>
                  <ul className="space-y-1.5">
                    {board.features.map((feat, idx) => (
                      <li key={idx} className="text-xs text-slate-600 flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#E5A83B] flex-shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <Link
                href={board.href}
                className="w-full bg-[#0B2545] hover:bg-slate-900 text-white font-bold text-xs sm:text-sm py-3 px-5 rounded-xl shadow-xs transition flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>Enter {board.title}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* What We Provide Section */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 py-8 w-full">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200 shadow-sm">
          <div className="mb-8">
            <span className="text-[11px] font-black text-[#B45309] uppercase tracking-wider block">
              Curated By University Faculty
            </span>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              What We Provide in School Notes
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              Designed to help students build strong conceptual foundations and score high marks in board examinations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHAT_WE_PROVIDE.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="p-5 rounded-2xl bg-[#F8FAFC] border border-slate-200 flex flex-col justify-start">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 mb-1.5">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quick Jump Strip */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 pb-16 w-full">
        <div className="bg-[#DFE2E8] rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border border-gray-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0B2545] text-white flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-900">Looking for University Degree Material?</h4>
              <p className="text-xs text-slate-600">Explore BA, B.Sc., MA, and CBCS 8-semester geography syllabi.</p>
            </div>
          </div>
          <Link
            href="/category/university"
            className="bg-white hover:bg-slate-50 text-slate-900 font-bold text-xs px-5 py-2.5 rounded-xl border border-gray-300 transition whitespace-nowrap"
          >
            Go to University Notes →
          </Link>
        </div>
      </section>
    </main>
  );
}