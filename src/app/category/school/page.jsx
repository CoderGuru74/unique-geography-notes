"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Search, 
  Download, 
  BookOpen, 
  FileText, 
  Eye, 
  Lock, 
  Loader2 
} from "lucide-react";
import AuthModal from "../../../components/AuthModal";

const CLASSES = [
  { id: "all", label: "All Classes", num: "" },
  { id: "6", label: "Class 6", num: "6" },
  { id: "7", label: "Class 7", num: "7" },
  { id: "8", label: "Class 8", num: "8" },
  { id: "9", label: "Class 9", num: "9" },
  { id: "10", label: "Class 10", num: "10" },
  { id: "11", label: "Class 11", num: "11" },
  { id: "12", label: "Class 12", num: "12" },
];

const SUBJECTS = [
  { id: "all", label: "All Subjects" },
  { id: "geography", label: "Geography" },
  { id: "history", label: "History" },
  { id: "civics", label: "Civics" },
  { id: "science", label: "Science / SST" },
];

export default function CBSENcertPage() {
  const [activeClass, setActiveClass] = useState("all");
  const [activeSubject, setActiveSubject] = useState("all");
  const [activeMedium, setActiveMedium] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [categories, setCategories] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState("Download PDF");

  const openAuthPaywall = (actionName) => {
    setModalAction(actionName);
    setModalOpen(true);
  };

  // 1. Fetch categories to discover exact NCERT IDs from your WordPress backend
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

  // 2. Fetch NCERT posts dynamically when activeClass changes
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

        // Match NCERT categories accurately
        categories.forEach((c) => {
          const s = (c.slug || "").toLowerCase();
          const n = (c.name || "").toLowerCase();

          const isNCERT = 
            s.includes("ncert") || 
            n.includes("ncert") || 
            s.includes("cbse") || 
            n.includes("एनसीईआरटी");

          if (!isNCERT) return;

          if (activeClass === "all") {
            matchedCategoryIds.push(c.id);
          } else {
            // Match Class 6, 7, 8... including variations like "6th", "वर्ग 6", etc.
            const matchesClassNum =
              s.includes(`class-${activeClass}`) ||
              s.includes(`class${activeClass}`) ||
              s.includes(`class-${activeClass}th`) ||
              n.includes(`class ${activeClass}`) ||
              n.includes(`class ${activeClass}th`) ||
              n.includes(`वर्ग-${activeClass}`) ||
              n.includes(`वर्ग ${activeClass}`) ||
              n.includes(`कक्षा ${activeClass}`);

            if (matchesClassNum) {
              matchedCategoryIds.push(c.id);
            }
          }
        });

        // Request posts for matched IDs or use a search query fallback
        let url = `${wpUrl}/wp-json/wp/v2/posts?_embed&per_page=100`;

        if (matchedCategoryIds.length > 0) {
          url += `&categories=${matchedCategoryIds.join(",")}`;
        } else if (activeClass !== "all") {
          url += `&search=${encodeURIComponent(`NCERT Class ${activeClass}`)}`;
        } else {
          url += `&search=${encodeURIComponent("NCERT")}`;
        }

        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to load NCERT posts");
        const rawPosts = await res.json();

        if (Array.isArray(rawPosts)) {
          const formatted = rawPosts.map((p) => {
            const title = p.title?.rendered || "";
            const titleLower = title.toLowerCase();

            // Extract category names and slugs
            const wpTerms = p._embedded?.["wp:term"] || [];
            const termList = [];
            if (Array.isArray(wpTerms)) {
              wpTerms.forEach((grp) => {
                if (Array.isArray(grp)) {
                  grp.forEach((t) => {
                    if (t?.name) termList.push(t.name.toLowerCase());
                    if (t?.slug) termList.push(t.slug.toLowerCase());
                  });
                }
              });
            }

            const corpus = [titleLower, ...termList].join(" ");

            // Detect Class
            let classFound = activeClass !== "all" ? activeClass : "";
            if (!classFound) {
              const match = corpus.match(/class\s*[-–]?\s*(6|7|8|9|10|11|12)/i) ||
                            corpus.match(/वर्ग\s*[-–]?\s*(6|7|8|9|10|11|12)/i);
              if (match) classFound = match[1];
            }

            // Detect Subject
            let detectedSubject = "Geography";
            if (corpus.includes("history") || corpus.includes("इतिहास")) detectedSubject = "History";
            else if (corpus.includes("civics") || corpus.includes("नागरिक") || corpus.includes("political")) detectedSubject = "Civics";
            else if (corpus.includes("science") || corpus.includes("विज्ञान")) detectedSubject = "Science";

            return {
              id: p.id,
              title: title,
              classNum: classFound,
              subject: detectedSubject,
              badge: `NCERT Class ${classFound || "Notes"}`,
              chapters: p.acf?.chapters ? `${p.acf.chapters} Chapters` : "Chapter Notes & Solutions",
              pages: p.acf?.pages ? `${p.acf.pages} Pages` : "PDF File",
              size: p.acf?.file_size || "4.2 MB",
              desc: p.excerpt?.rendered?.replace(/<[^>]+>/g, "").trim() || "",
              corpus: corpus,
            };
          });

          setPosts(formatted);
        } else {
          setPosts([]);
        }
      } catch (err) {
        console.error("Error loading NCERT content:", err);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchNCERTContent();
  }, [activeClass, categories]);

  // Dynamic filter for search and subjects
  const filteredPosts = useMemo(() => {
    return posts.filter((item) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        q === "" ||
        item.title.toLowerCase().includes(q) ||
        item.desc.toLowerCase().includes(q);

      let matchesSubject = true;
      if (activeSubject !== "all") {
        matchesSubject = item.subject.toLowerCase() === activeSubject.toLowerCase();
      }

      return matchesSearch && matchesSubject;
    });
  }, [posts, searchQuery, activeSubject]);

  return (
    <main className="min-h-screen flex flex-col bg-[#E5E9EF] font-sans text-slate-900">
      <AuthModal isOpen={modalOpen} onClose={() => setModalOpen(false)} targetAction={modalAction} />

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
                placeholder="Search NCERT chapters..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white text-xs pl-10 pr-4 py-2.5 rounded-md border border-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#E5A83B]"
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

      {/* Board Selector */}
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
                className="text-xs font-bold px-6 py-2 rounded-lg bg-[#0B2545] text-white shadow"
              >
                CBSE (NCERT)
              </Link>
            </div>
          </div>
          <span className="text-xs font-semibold text-slate-600 bg-white/50 px-3 py-1 rounded-full border border-gray-300 hidden sm:inline">
            Active: <strong>CBSE (NCERT) Curriculum</strong>
          </span>
        </div>
      </section>

      {/* Hero Container */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 pt-6 pb-6 w-full">
        <div className="text-xs font-semibold text-slate-500 mb-3 flex items-center gap-1.5">
          <Link href="/" className="hover:underline">Home</Link>
          <span>›</span>
          <Link href="/category/school" className="hover:underline">School Notes</Link>
          <span>›</span>
          <span className="text-[#E5A83B]">CBSE (NCERT)</span>
        </div>

        <div className="bg-[#EFE5D5] rounded-3xl p-6 sm:p-10 border border-amber-200/70 shadow-sm mb-6">
          <span className="text-xs font-bold text-[#B45309] uppercase tracking-wider block mb-1">
            NCERT Solutions &amp; Notes
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-[38px] font-extrabold text-[#111827] leading-[1.2] tracking-tight mb-2">
            NCERT Geography &amp; Social Science Notes
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed max-w-3xl mb-6">
            Class-wise chapter summaries, key points &amp; free PDF downloads — Class 6 to 12.
          </p>

          {/* Class Navigation Strip */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {CLASSES.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveClass(c.id)}
                className={`text-xs px-4 py-2 rounded-xl font-bold transition shadow-sm cursor-pointer ${
                  activeClass === c.id
                    ? "bg-[#0B2545] text-white"
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-gray-300"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Subject Pills & Medium */}
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-amber-200/60 text-xs font-semibold text-slate-700">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveMedium("all")}
                className={`px-3 py-1 rounded-lg transition ${activeMedium === "all" ? "bg-slate-800 text-white" : "hover:bg-amber-100"}`}
              >
                All Mediums
              </button>
              <button
                onClick={() => setActiveMedium("en")}
                className={`px-3 py-1 rounded-lg transition ${activeMedium === "en" ? "bg-slate-800 text-white" : "hover:bg-amber-100"}`}
              >
                English Medium
              </button>
              <button
                onClick={() => setActiveMedium("hi")}
                className={`px-3 py-1 rounded-lg transition ${activeMedium === "hi" ? "bg-slate-800 text-white" : "hover:bg-amber-100"}`}
              >
                Hindi Medium
              </button>
            </div>

            <span className="text-slate-400">|</span>

            <div className="flex items-center gap-2">
              <span className="text-slate-500">Subjects:</span>
              {SUBJECTS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveSubject(s.id)}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    activeSubject === s.id ? "bg-[#B45309] text-white" : "hover:bg-amber-100"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Chapters Grid */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 py-4 w-full flex-1 mb-16">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              NCERT Chapter Notes &amp; Solutions
              {activeClass !== "all" && ` — Class ${activeClass}`}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {filteredPosts.length} chapters available
            </p>
          </div>
          {activeClass !== "all" && (
            <button
              onClick={() => { setActiveClass("all"); setActiveSubject("all"); }}
              className="text-xs font-bold text-slate-700 bg-white px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-slate-50"
            >
              Reset Filters (Show All Classes)
            </button>
          )}
        </div>

        {loading ? (
          <div className="bg-white rounded-3xl p-16 flex flex-col items-center justify-center text-slate-500 border border-gray-200">
            <Loader2 className="w-8 h-8 animate-spin text-[#E5A83B] mb-3" />
            <p className="text-xs font-semibold">Connecting to WordPress...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="bg-white/80 rounded-3xl p-14 text-center text-slate-500 border border-gray-200">
            <BookOpen className="w-12 h-12 text-amber-500/50 mb-3 mx-auto" />
            <h4 className="font-bold text-base text-slate-800 mb-1">
              No Notes Uploaded Yet for {activeClass !== "all" ? `Class ${activeClass}` : "Selected Category"} {activeSubject !== "all" ? `(${activeSubject})` : ""}
            </h4>
            <p className="text-xs text-slate-500 max-w-md mb-4 mx-auto">
              Try switching subjects or selecting &ldquo;All Classes&rdquo; to view available NCERT content.
            </p>
            <button
              onClick={() => {
                setActiveClass("all");
                setActiveSubject("all");
                setSearchQuery("");
              }}
              className="px-4 py-2 bg-[#0B2545] text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Show All NCERT Notes
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-gray-200/80 flex flex-col justify-between hover:shadow-md transition"
              >
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-block bg-[#FEF3C7] text-[#B45309] text-[11px] font-extrabold px-3 py-1 rounded-md border border-amber-200">
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
                      <BookOpen className="w-3.5 h-3.5 text-blue-600" />
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
                    onClick={() => openAuthPaywall(`Download ${item.title}`)}
                    className="bg-[#E5A83B] hover:bg-[#d49425] text-slate-950 font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
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