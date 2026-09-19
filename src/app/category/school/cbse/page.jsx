"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Search, 
  ChevronRight, 
  FileText, 
  Download,
  BookOpen,
  Eye,
  Loader2
} from "lucide-react";
import AuthModal from "../../../../components/AuthModal";

const NCERT_CLASSES = [
  { grade: "all", title: "All Classes", num: "All" },
  { grade: "6", title: "NCERT CLASS 6Th Solutions", num: "6", sub: "The Earth: Our Habitat • Social Science • History • Civics", color: "bg-[#E0F2FE] text-[#0369A1]" },
  { grade: "7", title: "NCERT CLASS 7Th Solutions", num: "7", sub: "Our Environment • Social Science • History • Civics", color: "bg-[#FEF3C7] text-[#B45309]" },
  { grade: "8", title: "NCERT CLASS 8Th Solutions", num: "8", sub: "Resources and Development • Social Science • Civics", color: "bg-[#DCFCE7] text-[#15803D]" },
  { grade: "9", title: "NCERT CLASS 9Th Solutions", num: "9", sub: "Contemporary India – I • Geography • Economics • History", color: "bg-[#FEE2E2] text-[#B91C1C]" },
  { grade: "10", title: "NCERT CLASS 10Th Solutions", num: "10", sub: "Contemporary India – II • Democratic Politics • Economics", color: "bg-[#F3E8FF] text-[#7E22CE]" },
  { grade: "11", title: "NCERT CLASS 11Th Solutions", num: "11", sub: "Fundamentals of Physical Geography • India: Physical Environment", color: "bg-[#E0F2FE] text-[#0369A1]" },
  { grade: "12", title: "NCERT CLASS 12Th Solutions", num: "12", sub: "Fundamentals of Human Geography • India: People and Economy", color: "bg-[#FEF3C7] text-[#B45309]" },
];

export default function CBSENcertPage() {
  const [activeClassFilter, setActiveClassFilter] = useState("all");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [categories, setCategories] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState("Download PDF");
  const [activePdfUrl, setActivePdfUrl] = useState("");

  const notesSectionRef = useRef(null);

  const openAuthPaywall = (actionName, pdfUrl) => {
    setModalAction(actionName);
    setActivePdfUrl(pdfUrl || "");
    setModalOpen(true);
  };

  const handleSelectClass = (grade) => {
    setActiveClassFilter(grade);
    setSelectedClass(grade !== "all" ? `class-${grade}` : "");
    if (notesSectionRef.current) {
      notesSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleQuickFinder = (e) => {
    e.preventDefault();
    if (selectedClass) {
      const parsedNum = selectedClass.replace("class-", "");
      setActiveClassFilter(parsedNum);
    } else {
      setActiveClassFilter("all");
    }
    if (notesSectionRef.current) {
      notesSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // 1. Fetch Categories once to locate WordPress Category IDs for NCERT
  useEffect(() => {
    async function loadCategories() {
      const wpUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL;
      if (!wpUrl) return;

      try {
        const res = await fetch(`${wpUrl}/wp-json/wp/v2/categories?per_page=100&hide_empty=false`);
        if (!res.ok) return;
        const cats = await res.json();
        if (Array.isArray(cats)) {
          setCategories(cats);
        }
      } catch (err) {
        console.error("Error loading categories:", err);
      }
    }
    loadCategories();
  }, []);

  // 2. Fetch NCERT Posts based on matching category IDs
  useEffect(() => {
    async function fetchNCERTContent() {
      const wpUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL;
      if (!wpUrl) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const matchedCategoryIds = [];

        categories.forEach((c) => {
          const s = (c.slug || "").toLowerCase();
          const n = (c.name || "").toLowerCase();

          const isNCERT = 
            s.includes("ncert") || 
            n.includes("ncert") || 
            s.includes("cbse") || 
            n.includes("एनसीईआरटी");

          if (!isNCERT) return;

          if (activeClassFilter === "all") {
            matchedCategoryIds.push(c.id);
          } else {
            const targetNum = activeClassFilter;
            const matchesClass =
              s.includes(`class-${targetNum}`) ||
              s.includes(`class${targetNum}`) ||
              s.includes(`${targetNum}th`) ||
              n.includes(`class ${targetNum}`) ||
              n.includes(`class ${targetNum}th`) ||
              n.includes(`${targetNum}th solutions`) ||
              n.includes(`वर्ग-${targetNum}`) ||
              n.includes(`वर्ग ${targetNum}`) ||
              n.includes(`कक्षा ${targetNum}`);

            if (matchesClass) {
              matchedCategoryIds.push(c.id);
            }
          }
        });

        let url = `${wpUrl}/wp-json/wp/v2/posts?_embed&per_page=100`;

        if (matchedCategoryIds.length > 0) {
          url += `&categories=${matchedCategoryIds.join(",")}`;
        } else if (activeClassFilter !== "all") {
          url += `&search=${encodeURIComponent(`NCERT CLASS ${activeClassFilter}Th Solutions`)}`;
        } else {
          url += `&search=${encodeURIComponent("NCERT Solutions")}`;
        }

        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to load NCERT posts");
        const rawPosts = await res.json();

        if (Array.isArray(rawPosts)) {
          const formatted = rawPosts.map((p) => {
            const title = p.title?.rendered || "";
            const titleLower = title.toLowerCase();

            let classNum = activeClassFilter !== "all" ? activeClassFilter : "";
            if (!classNum) {
              const match = 
                titleLower.match(/class\s*[-–]?\s*(6|7|8|9|10|11|12)/i) ||
                titleLower.match(/(6|7|8|9|10|11|12)th\s*solutions/i) ||
                titleLower.match(/वर्ग\s*[-–]?\s*(6|7|8|9|10|11|12)/i);
              if (match) classNum = match[1];
            }

            let subject = "Social Science";
            if (titleLower.includes("geography") || titleLower.includes("भूगोल")) subject = "Geography";
            else if (titleLower.includes("history") || titleLower.includes("इतिहास")) subject = "History";
            else if (titleLower.includes("civics") || titleLower.includes("नागरिक") || titleLower.includes("political")) subject = "Civics";
            else if (titleLower.includes("economics") || titleLower.includes("अर्थशास्त्र")) subject = "Economics";

            return {
              id: p.id,
              title: title,
              classNum: classNum,
              subject: subject,
              badge: `NCERT Class ${classNum || "Solutions"}`,
              chapters: p.acf?.chapters ? `${p.acf.chapters} Chapters` : "Solutions & Notes",
              pages: p.acf?.pages ? `${p.acf.pages} Pages` : "PDF Notes",
              size: p.acf?.file_size || "4.2 MB",
              pdfUrl: p.acf?.pdf_file?.url || p.acf?.pdf_file || "#",
              desc: p.excerpt?.rendered?.replace(/<[^>]+>/g, "").trim() || "",
            };
          });

          setPosts(formatted);
        } else {
          setPosts([]);
        }
      } catch (err) {
        console.error("Error loading NCERT posts:", err);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchNCERTContent();
  }, [activeClassFilter, categories]);

  const displayedPosts = useMemo(() => {
    return posts.filter((item) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        q === "" ||
        item.title.toLowerCase().includes(q) ||
        item.desc.toLowerCase().includes(q);

      let matchesSubject = true;
      if (selectedSubject) {
        matchesSubject = item.subject.toLowerCase() === selectedSubject.toLowerCase();
      }

      return matchesSearch && matchesSubject;
    });
  }, [posts, searchQuery, selectedSubject]);

  return (
    <main className="min-h-screen flex flex-col bg-[#E5E9EF] font-sans text-slate-900">
      <AuthModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        targetAction={modalAction}
        pdfDownloadUrl={activePdfUrl}
      />

      {/* Header */}
      <header className="w-full bg-[#E5E7EB]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 pt-5 pb-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-full overflow-hidden border border-gray-300 flex-shrink-0 shadow-sm bg-white">
              <Image
                src="/images/logo.jpeg"
                alt="Unique Geography Notes Logo"
                fill
                sizes="48px"
                className="object-cover"
                priority
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl md:text-[26px] font-black tracking-tight text-[#111827]">
                Unique Geography Notes
              </h1>
              <span className="text-[13px] font-medium text-slate-500">
                Curated by University Faculty
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <div className="relative w-full md:w-80">
              <input
                type="text"
                suppressHydrationWarning
                placeholder="Search NCERT chapters or solutions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white text-xs pl-10 pr-4 py-2.5 rounded-md border border-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0369A1]"
              />
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400 stroke-[2.2]" />
            </div>

            <button className="bg-[#E5A83B] hover:bg-[#d49425] text-[#1e1b18] font-bold text-xs px-5 py-2.5 rounded-md transition shadow-sm whitespace-nowrap">
              Latest PDFs
            </button>
          </div>
        </div>

        {/* Global Nav */}
        <nav className="border-t border-b border-gray-300 bg-[#DFE2E8]">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 flex items-center gap-8 overflow-x-auto text-[14px] font-medium text-slate-900">
            <Link href="/" className="py-3 px-1 text-slate-800 hover:text-black whitespace-nowrap">Home</Link>
            <Link href="/category/upsc" className="py-3 px-1 text-slate-800 hover:text-black whitespace-nowrap">UPSC &amp; PSC</Link>

            <div className="relative py-3 flex flex-col items-center">
              <Link href="/category/school" className="font-bold text-slate-950 px-1 whitespace-nowrap">School Notes</Link>
              <span className="absolute bottom-0 left-1 right-1 h-[2.5px] bg-[#E5A83B] rounded-full" />
            </div>

            <Link href="/category/exams" className="py-3 px-1 text-slate-800 hover:text-black whitespace-nowrap">Exams (CTET, UGC-NET)</Link>
            <Link href="/category/university" className="py-3 px-1 text-slate-800 hover:text-black whitespace-nowrap">University Notes</Link>
            <Link href="/category/gc" className="py-3 px-1 text-slate-800 hover:text-black whitespace-nowrap">GC</Link>
          </div>
        </nav>
      </header>

      {/* Board Selector Strip */}
      <section className="bg-[#CFD4DC] border-b border-gray-300 py-3">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-black text-slate-700 uppercase tracking-wider">Choose Board:</span>
            <div className="inline-flex p-1 bg-white/80 rounded-xl border border-gray-300 shadow-sm">
              <Link
                href="/category/school/bseb"
                className="text-xs font-bold px-6 py-2 rounded-lg text-slate-600 hover:text-black transition"
              >
                BSEB (Bihar Board)
              </Link>
              <Link
                href="/category/school/cbse"
                className="text-xs font-bold px-6 py-2 rounded-lg bg-[#0369A1] text-white shadow"
              >
                CBSE (NCERT)
              </Link>
            </div>
          </div>
          <span className="text-xs font-semibold text-slate-600 bg-white/50 px-3 py-1 rounded-full border border-gray-300 hidden sm:inline">
            Active: <strong>NCERT 6 To 12Th Solutions</strong>
          </span>
        </div>
      </section>

      {/* Hero Section */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 pt-6 pb-10 w-full">
        <div className="text-xs font-semibold text-slate-500 mb-3 flex items-center gap-1.5">
          <Link href="/" className="hover:underline">Home</Link>
          <span>›</span>
          <Link href="/category/school" className="hover:underline">School Notes</Link>
          <span>›</span>
          <span className="text-[#0369A1]">NCERT (CBSE)</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7">
            <h2 className="text-3xl sm:text-4xl md:text-[38px] font-extrabold text-[#111827] leading-[1.2] tracking-tight mb-2">
              NCERT Class 6th to 12th Solutions &amp; Geography Notes
            </h2>
            <p className="text-lg font-bold text-[#0369A1] mb-3">
              (Bilingual • English &amp; Hindi Medium)
            </p>
            <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed max-w-xl">
              Complete chapter summaries, textbook solutions, exercise answers, and objective questions strictly based on the latest NCERT textbooks.
            </p>
          </div>

          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-[440px] aspect-[4/3] rounded-2xl overflow-hidden shadow-sm border border-slate-300/60 bg-white">
              <Image
                src="/images/banner.jpg"
                alt="NCERT Solutions Banner"
                fill
                sizes="(max-width: 768px) 100vw, 440px"
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Class Selection Cards */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 py-8 w-full">
        <div className="bg-[#E0F2FE]/40 rounded-3xl p-6 sm:p-10 border border-sky-200/70 shadow-sm">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                NCERT 6 To 12Th Classes
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Tap on any class below to load its textbook solutions directly from WordPress.
              </p>
            </div>
            {activeClassFilter !== "all" && (
              <button
                onClick={() => handleSelectClass("all")}
                className="text-xs font-bold text-slate-700 bg-white px-4 py-2 rounded-xl border border-gray-300 hover:bg-slate-50 self-start sm:self-auto cursor-pointer"
              >
                Show All Classes
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {NCERT_CLASSES.filter((c) => c.grade !== "all").map((item) => (
              <div
                key={item.grade}
                onClick={() => handleSelectClass(item.grade)}
                className={`bg-white rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-sm hover:shadow-md transition border cursor-pointer group ${
                  activeClassFilter === item.grade
                    ? "border-[#0369A1] ring-2 ring-[#0369A1]/20"
                    : "border-gray-200/80"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm flex-shrink-0 ${item.color}`}>
                    {item.num}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 group-hover:text-[#0369A1] transition">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{item.sub}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Direct PDF Quick Finder */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 py-6 w-full">
        <div className="bg-[#D1D5DB] rounded-3xl p-6 sm:p-8 text-center shadow-inner">
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-4">
            NCERT Direct PDF Quick Finder
          </h3>

          <form onSubmit={handleQuickFinder} className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-2xl mx-auto">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full sm:w-1/2 bg-white text-xs px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#0369A1]"
            >
              <option value="">Select Class</option>
              <option value="class-6">Class 6</option>
              <option value="class-7">Class 7</option>
              <option value="class-8">Class 8</option>
              <option value="class-9">Class 9</option>
              <option value="class-10">Class 10</option>
              <option value="class-11">Class 11</option>
              <option value="class-12">Class 12</option>
            </select>

            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full sm:w-1/2 bg-white text-xs px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#0369A1]"
            >
              <option value="">Select Subject</option>
              <option value="geography">Geography (भूगोल)</option>
              <option value="history">History (इतिहास)</option>
              <option value="civics">Civics (नागरिक शास्त्र)</option>
              <option value="economics">Economics (अर्थशास्त्र)</option>
            </select>

            <button
              type="submit"
              className="w-full sm:w-auto bg-[#0369A1] hover:bg-[#0284C7] text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow transition whitespace-nowrap cursor-pointer"
            >
              Find Notes
            </button>
          </form>
        </div>
      </section>

      {/* Chapters Grid from WordPress */}
      <section ref={notesSectionRef} className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 py-8 w-full flex-1 mb-16">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              NCERT Chapter Notes &amp; Solutions
              {activeClassFilter !== "all" && ` — Class ${activeClassFilter}`}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Showing {displayedPosts.length} syllabus notes from WordPress
            </p>
          </div>
          {activeClassFilter !== "all" && (
            <button
              onClick={() => handleSelectClass("all")}
              className="text-xs font-bold text-slate-700 bg-white px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-slate-50 cursor-pointer"
            >
              Clear Filter
            </button>
          )}
        </div>

        {loading ? (
          <div className="bg-white rounded-3xl p-16 flex flex-col items-center justify-center text-slate-500 border border-gray-200">
            <Loader2 className="w-8 h-8 animate-spin text-[#0369A1] mb-3" />
            <p className="text-xs font-semibold">Loading NCERT solutions from WordPress...</p>
          </div>
        ) : displayedPosts.length === 0 ? (
          <div className="bg-white/80 rounded-3xl p-14 text-center text-slate-500 border border-gray-200">
            <BookOpen className="w-12 h-12 text-sky-500/50 mb-3 mx-auto" />
            <h4 className="font-bold text-base text-slate-800 mb-1">
              No Notes Found for Class {activeClassFilter}
            </h4>
            <p className="text-xs text-slate-500 max-w-md mb-4 mx-auto">
              Please check that posts for this class are published in WordPress under the matching category.
            </p>
            <button
              onClick={() => handleSelectClass("all")}
              className="px-4 py-2 bg-[#0369A1] text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Show All NCERT Notes
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedPosts.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-gray-200/80 flex flex-col justify-between hover:shadow-md transition"
              >
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-block bg-[#E0F2FE] text-[#0369A1] text-[11px] font-extrabold px-3 py-1 rounded-md border border-sky-200">
                      {item.badge}
                    </span>
                    <span className="inline-block bg-slate-100 text-slate-700 text-[11px] font-bold px-2.5 py-1 rounded-md">
                      {item.subject}
                    </span>
                  </div>

                  <h4
                    className="font-extrabold text-base sm:text-lg text-slate-900 leading-snug mb-3 line-clamp-2"
                    dangerouslySetInnerHTML={{ __html: item.title }}
                  />

                  {item.desc && (
                    <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                      {item.desc}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-[11px] text-slate-500 font-medium mb-6">
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-sky-600" />
                      {item.chapters}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      {item.pages}
                    </span>
                    <span className="flex items-center gap-1.5">📦 {item.size}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-4 border-t border-gray-100">
                  <Link
                    href={`/read/${item.id}`}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" /> Read Free
                  </Link>

                  <button
                    onClick={() => openAuthPaywall(`Download ${item.title}`, item.pdfUrl)}
                    className="bg-[#0369A1] hover:bg-[#0284C7] text-white font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
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