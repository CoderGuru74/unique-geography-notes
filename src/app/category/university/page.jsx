"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, BookOpen, Eye, Lock, Loader2 } from "lucide-react";
import AuthModal from "../../../components/AuthModal";

const DEGREE_TABS = [
  { id: "ug", label: "BA / UG / B.Sc. Notes", degree: "B.A" },
  { id: "pg", label: "MA / PG / M.Sc. Notes", degree: "M.A" },
];

const UG_SEMESTERS = [
  { id: "all", label: "All Semesters" },
  { id: "ug-1", label: "UG Semester-I" },
  { id: "ug-2", label: "UG Semester-II" },
  { id: "ug-3", label: "UG Semester-III" },
  { id: "ug-4", label: "UG Semester-IV" },
  { id: "ug-5", label: "UG Semester-V" },
  { id: "ug-6", label: "UG Semester-VI" },
  { id: "ug-7", label: "UG Semester-VII" },
  { id: "ug-practical", label: "सभी प्रायोगिक भूगोल" },
];

const PG_SEMESTERS = [
  { id: "all", label: "All Semesters" },
  { id: "pg-1", label: "PG Semester-1" },
  { id: "pg-2", label: "PG Semester-2" },
  { id: "pg-3", label: "PG Semester-3" },
  { id: "pg-4", label: "PG Semester-4" },
];

export default function UniversityNotesPage() {
  const [activeDegree, setActiveDegree] = useState("ug");
  const [activeSemester, setActiveSemester] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState("Download PDF");

  const openAuthPaywall = (actionName) => {
    setModalAction(actionName);
    setModalOpen(true);
  };

  const currentSemesterList = activeDegree === "ug" ? UG_SEMESTERS : PG_SEMESTERS;

  useEffect(() => {
    setActiveSemester("all");
  }, [activeDegree]);

  useEffect(() => {
    async function loadUniversityPosts() {
      const wpUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL;
      if (!wpUrl) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`${wpUrl}/wp-json/wp/v2/posts?_embed&per_page=100`);
        if (!res.ok) throw new Error("WordPress response not ok");
        const posts = await res.json();

        if (Array.isArray(posts)) {
          const formatted = [];

          posts.forEach((p) => {
            const title = p.title?.rendered || "";
            const titleUpper = title.toUpperCase();

            // Extract WP Categories
            const wpTerms = p._embedded?.["wp:term"] || [];
            const categorySlugs = [];

            if (Array.isArray(wpTerms)) {
              wpTerms.forEach((taxGroup) => {
                if (Array.isArray(taxGroup)) {
                  taxGroup.forEach((term) => {
                    if (term?.slug) categorySlugs.push(term.slug.toLowerCase());
                  });
                }
              });
            }

            const catString = categorySlugs.join(" ");

            // Exclude competitive exams and school content
            const isExcluded =
              catString.includes("ctet") ||
              catString.includes("btet") ||
              catString.includes("stet") ||
              catString.includes("ugc-net") ||
              catString.includes("general-competition") ||
              catString.includes("ncert") ||
              catString.includes("bseb") ||
              titleUpper.includes("CTET") ||
              titleUpper.includes("UGC NET") ||
              titleUpper.includes("STET");

            if (isExcluded) return;

            // Strict Degree Mapping
            const isPG =
              catString.includes("pg-semester") ||
              catString.includes("pg") ||
              titleUpper.includes("PG SEMESTER") ||
              titleUpper.includes("M.A");

            const degree = isPG ? "M.A" : "B.A";

            // Strict Semester Resolution
            let semesterLabel = "UG Semester-I";

            if (isPG) {
              if (catString.includes("pg-semester-4") || titleUpper.includes("SEMESTER-IV") || titleUpper.includes("SEMESTER 4")) {
                semesterLabel = "PG Semester-4";
              } else if (catString.includes("pg-semester-3") || titleUpper.includes("SEMESTER-III") || titleUpper.includes("SEMESTER 3")) {
                semesterLabel = "PG Semester-3";
              } else if (catString.includes("pg-semester-2") || titleUpper.includes("SEMESTER-II") || titleUpper.includes("SEMESTER 2")) {
                semesterLabel = "PG Semester-2";
              } else {
                semesterLabel = "PG Semester-1";
              }
            } else {
              if (catString.includes("practical") || catString.includes("cartography") || titleUpper.includes("PRACTICAL") || titleUpper.includes("प्रायोगिक")) {
                semesterLabel = "सभी प्रायोगिक भूगोल";
              } else if (catString.includes("ba-semester-paper-vii") || titleUpper.includes("SEMESTER-VII") || titleUpper.includes("SEMESTER 7")) {
                semesterLabel = "UG Semester-VII";
              } else if (catString.includes("ba-semester-paper-vi") || titleUpper.includes("SEMESTER-VI") || titleUpper.includes("SEMESTER 6")) {
                semesterLabel = "UG Semester-VI";
              } else if (catString.includes("ba-semester-paper-v") || titleUpper.includes("SEMESTER-V") || titleUpper.includes("SEMESTER 5")) {
                semesterLabel = "UG Semester-V";
              } else if (catString.includes("ba-semester-paper-iv") || titleUpper.includes("SEMESTER-IV") || titleUpper.includes("SEMESTER 4") || titleUpper.includes("MIC-4")) {
                semesterLabel = "UG Semester-IV";
              } else if (catString.includes("ba-semester-paper-iii") || titleUpper.includes("SEMESTER/PAPER III") || titleUpper.includes("SEMESTER 3")) {
                semesterLabel = "UG Semester-III";
              } else if (catString.includes("ba-semester-ii") || titleUpper.includes("SEMESTER-II") || titleUpper.includes("SEMESTER 2")) {
                semesterLabel = "UG Semester-II";
              } else if (catString.includes("ba-semester-i") || titleUpper.includes("SEMESTER-I") || titleUpper.includes("SEMESTER 1")) {
                semesterLabel = "UG Semester-I";
              } else {
                // If no specific semester tag exists, assign to general category
                semesterLabel = "UG Semester-I";
              }
            }

            // Paper Code Extraction
            let code = "GEO";
            const codeMatch = titleUpper.match(/(MIC-\d+|MJC-\d+|CC-\d+|PAPER\s*[-–]?\s*[IVXLCDM\d]+)/i);
            if (codeMatch) code = codeMatch[0];

            formatted.push({
              id: p.id,
              degree: degree,
              semester: semesterLabel,
              code: code,
              title: title,
              desc: p.excerpt?.rendered?.replace(/<[^>]+>/g, "").trim() || "",
            });
          });

          setCards(formatted);
        }
      } catch (err) {
        console.error("Error loading notes:", err);
        setCards([]);
      } finally {
        setLoading(false);
      }
    }

    loadUniversityPosts();
  }, []);

  // Strict Matching Filter
  const filteredCards = useMemo(() => {
    const targetDegree = activeDegree === "ug" ? "B.A" : "M.A";
    const selectedSemObj = currentSemesterList.find((s) => s.id === activeSemester);

    return cards.filter((item) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        q === "" ||
        item.title.toLowerCase().includes(q) ||
        item.desc.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q);

      const matchesDegree = item.degree === targetDegree;

      // Strict Equality check: item's computed semester MUST match selected tab label exactly
      const matchesSemester =
        activeSemester === "all" ||
        (selectedSemObj && item.semester === selectedSemObj.label);

      return matchesSearch && matchesDegree && matchesSemester;
    });
  }, [cards, activeDegree, activeSemester, searchQuery, currentSemesterList]);

  return (
    <main className="min-h-screen flex flex-col bg-[#E5E9EF] font-sans text-slate-900">
      <AuthModal isOpen={modalOpen} onClose={() => setModalOpen(false)} targetAction={modalAction} />

      <header className="w-full bg-[#E5E7EB]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 pt-5 pb-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-full overflow-hidden border border-gray-300 flex-shrink-0 bg-white">
              <Image src="/images/logo.jpeg" alt="Logo" fill sizes="48px" className="object-cover" priority />
            </div>
            <div>
              <h1 className="text-2xl md:text-[26px] font-black tracking-tight text-[#111827]">Unique Geography Notes</h1>
              <span className="text-[13px] font-medium text-slate-500">Curated by University Faculty</span>
            </div>
          </Link>

          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search semester papers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white text-xs pl-10 pr-4 py-2.5 rounded-md border border-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#E5A83B]"
            />
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          </div>
        </div>

        <nav className="border-t border-b border-gray-300 bg-[#DFE2E8]">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 flex items-center gap-8 overflow-x-auto text-[14px] font-medium text-slate-900">
            <Link href="/" className="py-3 px-1 hover:text-black">Home</Link>
            <Link href="/category/upsc" className="py-3 px-1 hover:text-black">UPSC &amp; PSC</Link>
            <Link href="/category/school" className="py-3 px-1 hover:text-black">School Notes</Link>
            <Link href="/category/exams" className="py-3 px-1 hover:text-black">Exams (CTET, UGC-NET)</Link>
            <div className="relative py-3 flex flex-col items-center">
              <Link href="/category/university" className="font-bold text-slate-950 px-1">University Notes</Link>
              <span className="absolute bottom-0 left-1 right-1 h-[2.5px] bg-[#E5A83B] rounded-full" />
            </div>
            <Link href="/category/gc" className="py-3 px-1 hover:text-black">GC</Link>
          </div>
        </nav>
      </header>

      {/* Select Level */}
      <section className="bg-[#CFD4DC] border-b border-gray-300 py-3">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 flex items-center gap-3">
          <span className="text-xs font-black text-slate-700 uppercase tracking-wider">Select Level:</span>
          <div className="inline-flex p-1 bg-white/80 rounded-xl border border-gray-300 shadow-sm gap-1">
            {DEGREE_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveDegree(tab.id)}
                className={`text-xs font-bold px-5 py-2 rounded-lg transition ${
                  activeDegree === tab.id ? "bg-[#0B2545] text-white shadow" : "text-slate-600 hover:text-black hover:bg-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Semester Filter Tabs */}
      <section className="border-b border-gray-300 bg-[#DFE2E8]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 flex items-center gap-6 overflow-x-auto text-[13px] font-semibold text-slate-700">
          {currentSemesterList.map((sem) => (
            <button
              key={sem.id}
              onClick={() => setActiveSemester(sem.id)}
              className={`py-3 px-1 whitespace-nowrap transition cursor-pointer ${
                activeSemester === sem.id ? "border-b-2 border-[#E5A83B] text-slate-950 font-bold" : "hover:text-black"
              }`}
            >
              {sem.label}
            </button>
          ))}
        </div>
      </section>

      {/* Grid */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 py-8 w-full flex-1">
        <div className="mb-6">
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {activeDegree === "ug" ? "Undergraduate (UG / B.A.) Syllabus Notes" : "Postgraduate (PG / M.A.) Syllabus Notes"}
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Showing {filteredCards.length} syllabus modules
          </p>
        </div>

        {loading ? (
          <div className="bg-white rounded-3xl p-16 flex flex-col items-center justify-center text-slate-500 border border-gray-200">
            <Loader2 className="w-8 h-8 animate-spin text-[#E5A83B] mb-3" />
            <p className="text-xs font-semibold">Loading university papers...</p>
          </div>
        ) : filteredCards.length === 0 ? (
          <div className="bg-white/80 rounded-3xl p-14 text-center text-slate-500 border border-gray-200">
            <BookOpen className="w-12 h-12 text-amber-500/50 mb-3 mx-auto" />
            <h4 className="font-bold text-base text-slate-800 mb-1">No Notes Found for This Semester</h4>
            <p className="text-xs text-slate-500 mb-4">No notes match the active selection.</p>
            <button onClick={() => setActiveSemester("all")} className="px-4 py-2 bg-[#0B2545] text-white text-xs font-bold rounded-xl">
              Show All Semesters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredCards.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 flex flex-col justify-between hover:shadow-md transition">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded ${
                      item.degree === "M.A" ? "bg-[#D97706]" : "bg-[#0B2545]"
                    }`}>
                      {item.degree}
                    </span>
                    <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2.5 py-0.5 rounded">
                      {item.semester}
                    </span>
                  </div>

                  <span className="text-xs font-bold text-[#B45309] block mb-1">{item.code}</span>
                  <h4 className="font-extrabold text-base text-slate-900 leading-snug mb-2" dangerouslySetInnerHTML={{ __html: item.title }} />
                  {item.desc && (
                    <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mb-4">
                      {item.desc}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-4 border-t border-gray-100">
                  <Link href={`/read/${item.id}`} className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition">
                    <Eye className="w-3.5 h-3.5" /> Read Free
                  </Link>
                  <button onClick={() => openAuthPaywall(`Download ${item.title}`)} className="bg-[#E5A83B] hover:bg-[#d49425] text-slate-950 font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition">
                    <Lock className="w-3.5 h-3.5" /> Download PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}