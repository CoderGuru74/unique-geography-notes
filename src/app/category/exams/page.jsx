"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Search, 
  BookOpen, 
  FileText, 
  Eye, 
  Lock, 
  Loader2 
} from "lucide-react";
import AuthModal from "../../../components/AuthModal";

// Distinct default topics mapped to specific exam types
const EXAM_TOPIC_PRESETS = {
  ctet: [
    "All Topics",
    "Child Development & Pedagogy",
    "Geography & SST Content",
    "Pedagogy of Social Science",
    "Previous Year Question Papers",
  ],
  stet: [
    "All Topics",
    "Social Science Pedagogy",
    "Geography Specialisation",
    "Teaching Art & Skills",
    "STET PYQ Papers",
  ],
  btet: [
    "All Topics",
    "Child Pedagogy",
    "Social Studies Paper 2",
    "Environmental Studies (EVS)",
    "Previous Years Solved",
  ],
  "ugc-net": [
    "All Topics",
    "Teaching Aptitude",
    "Research Methodology & Statistics",
    "Higher Education System",
    "Information & Comm Technology (ICT)",
    "People, Dev & Environment",
    "Geography Paper-II",
    "UGC NET PYQ",
  ],
  default: [
    "All Topics",
    "General Studies",
    "Subject Special",
    "Previous Year Papers",
    "Mock Practice",
  ],
};

const INITIAL_EXAMS = [
  { 
    id: "ctet", 
    slug: "ctet", 
    name: "CTET", 
    title: "CTET Paper 1 & Paper 2 Social Studies (SST) Complete Notes",
    desc: "Tailored notes for CTET Paper 1 & Paper 2 — Child Pedagogy, Geography, and Social Sciences." 
  },
  { 
    id: "stet", 
    slug: "stet", 
    name: "Bihar STET", 
    title: "Bihar STET Paper 1 & Paper 2 Social Science Complete Notes",
    desc: "Syllabus-aligned notes for Bihar STET covering Geography and Secondary Teacher Pedagogy." 
  },
  { 
    id: "btet", 
    slug: "btet", 
    name: "BTET", 
    title: "Bihar TET Paper 1 & Paper 2 Social Studies Notes",
    desc: "Detailed chapter notes and pedagogy modules prepared for Bihar TET." 
  },
  { 
    id: "ugc-net", 
    slug: "ugc-net", 
    name: "UGC–NET / JRF", 
    title: "UGC–NET / JRF Geography (Paper 2) & General Paper 1 Notes",
    desc: "Unit-wise notes for NTA UGC-NET Geography Paper 2 and General Paper 1." 
  },
];

export default function ExamsPage() {
  const [examsList, setExamsList] = useState(INITIAL_EXAMS);
  const [selectedExam, setSelectedExam] = useState(INITIAL_EXAMS[0]);
  
  const [subTabs, setSubTabs] = useState(EXAM_TOPIC_PRESETS.ctet);
  const [activeSubTab, setActiveSubTab] = useState("All Topics");
  const [paperPill, setPaperPill] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [cards, setCards] = useState([]);
  const [quickSets, setQuickSets] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState("Download PDF");

  const openAuthPaywall = (actionName) => {
    setModalAction(actionName);
    setModalOpen(true);
  };

  // Helper to pick default sub-tabs based on exam slug or name
  const getPresetForExam = (examObj) => {
    if (!examObj) return EXAM_TOPIC_PRESETS.default;
    const s = (examObj.slug || "").toLowerCase();
    const n = (examObj.name || "").toLowerCase();

    if (s.includes("ctet") || n.includes("ctet")) return EXAM_TOPIC_PRESETS.ctet;
    if (s.includes("stet") || n.includes("stet")) return EXAM_TOPIC_PRESETS.stet;
    if (s.includes("btet") || n.includes("btet")) return EXAM_TOPIC_PRESETS.btet;
    if (s.includes("net") || s.includes("ugc") || n.includes("net")) return EXAM_TOPIC_PRESETS["ugc-net"];
    return EXAM_TOPIC_PRESETS.default;
  };

  // 1. Fetch live categories from WordPress
  useEffect(() => {
    async function loadExamsCategories() {
      const wpUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL;
      if (!wpUrl) return;

      try {
        const res = await fetch(`${wpUrl}/wp-json/wp/v2/categories?per_page=100&hide_empty=false`);
        const allCats = await res.json();

        if (Array.isArray(allCats) && allCats.length > 0) {
          const examCats = allCats.filter((c) => {
            const s = (c.slug || "").toLowerCase();
            const n = (c.name || "").toLowerCase();
            return (
              s.includes("tet") ||
              s.includes("net") ||
              s.includes("ctet") ||
              s.includes("stet") ||
              s.includes("btet") ||
              s.includes("ugc") ||
              n.includes("net") ||
              n.includes("tet") ||
              n.includes("ctet")
            );
          });

          if (examCats.length > 0) {
            const formatted = examCats.map((c) => ({
              id: c.id,
              slug: c.slug,
              name: c.name,
              title: `${c.name} Study Material & Notes`,
              desc: c.description || `Complete syllabus-aligned PDF notes for ${c.name}.`,
            }));

            const seen = new Set();
            const merged = [...INITIAL_EXAMS, ...formatted].filter((item) => {
              if (seen.has(item.slug)) return false;
              seen.add(item.slug);
              return true;
            });

            setExamsList(merged);
          }
        }
      } catch (err) {
        console.error("Error loading WP exam categories:", err);
      }
    }

    loadExamsCategories();
  }, []);

  // 2. Fetch live posts whenever the selected exam changes
  useEffect(() => {
    if (!selectedExam) return;

    // Reset tab view to initial exam defaults
    const presetTabs = getPresetForExam(selectedExam);
    setSubTabs(presetTabs);
    setActiveSubTab("All Topics");
    setPaperPill("all");

    async function loadExamContent() {
      const wpUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL;

      if (!wpUrl) {
        setCards([]);
        setQuickSets([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const queryParam = typeof selectedExam.id === "number"
          ? `categories=${selectedExam.id}`
          : `categories_slug=${selectedExam.slug}`;

        const res = await fetch(`${wpUrl}/wp-json/wp/v2/posts?${queryParam}&_embed&per_page=100`);
        const posts = await res.json();

        if (Array.isArray(posts) && posts.length > 0) {
          // Verify category ID strictly if available
          const validPosts = posts.filter((p) => {
            if (typeof selectedExam.id === "number" && Array.isArray(p.categories)) {
              return p.categories.includes(selectedExam.id);
            }
            return true;
          });

          const formattedCards = [];
          const formattedQuickSets = [];

          validPosts.forEach((p) => {
            const isQuickSet = p.acf?.is_quick_set || false;

            if (isQuickSet) {
              formattedQuickSets.push({
                id: p.id,
                title: p.title?.rendered || "Study Set",
                badge: p.acf?.paper_type || "Paper 1 & 2",
                pages: p.acf?.pages ? `${p.acf.pages} Pages` : "PDF File",
                size: p.acf?.file_size || "Standard",
                pdfUrl: p.acf?.pdf_file?.url || p.acf?.pdf_file || "#",
              });
            } else {
              formattedCards.push({
                id: p.id,
                tag: selectedExam.name,
                title: p.title?.rendered || "Untitled Resource",
                desc: p.excerpt?.rendered?.replace(/<[^>]+>/g, "").trim() || "",
                chapters: p.acf?.chapters ? `${p.acf.chapters} Chapters` : "Complete Module",
                pages: p.acf?.pages ? `${p.acf.pages} Pages` : "Study Notes",
                size: p.acf?.file_size || "3.5 MB",
                paper: (p.acf?.paper_type || "").trim(),
                subTopic: (p.acf?.sub_topic || "").trim(),
                rawContent: p.content?.rendered?.replace(/<[^>]+>/g, "").trim() || "",
                pdfUrl: p.acf?.pdf_file?.url || p.acf?.pdf_file || "#",
              });
            }
          });

          setCards(formattedCards);
          setQuickSets(formattedQuickSets);

          // Append any unique sub_topic values custom-written in WordPress
          const wpSubTopics = Array.from(
            new Set(validPosts.map((p) => p.acf?.sub_topic?.trim()).filter(Boolean))
          );
          if (wpSubTopics.length > 0) {
            setSubTabs(Array.from(new Set([...presetTabs, ...wpSubTopics])));
          }
        } else {
          setCards([]);
          setQuickSets([]);
        }
      } catch (err) {
        console.error("Error loading exam posts:", err);
        setCards([]);
        setQuickSets([]);
      } finally {
        setLoading(false);
      }
    }

    loadExamContent();
  }, [selectedExam]);

  // 3. Dynamic Filtering
  const filteredCards = useMemo(() => {
    return cards.filter((item) => {
      const q = searchQuery.trim().toLowerCase();
      const titleLower = item.title.toLowerCase();
      const descLower = item.desc.toLowerCase();
      const paperLower = item.paper.toLowerCase();
      const subLower = item.subTopic.toLowerCase();
      const fullText = `${titleLower} ${descLower} ${paperLower} ${subLower}`;

      // A. Text Search
      const matchesSearch =
        q === "" ||
        titleLower.includes(q) ||
        descLower.includes(q) ||
        item.rawContent.toLowerCase().includes(q);

      // B. Paper Pills
      let matchesPill = true;
      if (paperPill === "paper-1") {
        matchesPill = paperLower.includes("paper 1") || paperLower.includes("primary") || titleLower.includes("paper 1") || titleLower.includes("paper-1") || titleLower.includes("paper-i");
      } else if (paperPill === "paper-2") {
        matchesPill = paperLower.includes("paper 2") || paperLower.includes("upper") || titleLower.includes("paper 2") || titleLower.includes("paper-2") || titleLower.includes("paper-ii");
      } else if (paperPill === "pedagogy") {
        matchesPill = paperLower.includes("pedagogy") || titleLower.includes("pedagogy") || titleLower.includes("शिक्षण") || titleLower.includes("शिक्षाशास्त्र") || subLower.includes("pedagogy");
      }

      // C. Context-Sensitive Sub-Topic Filter
      let matchesSubTab = true;
      if (activeSubTab !== "All Topics") {
        // Direct match if ACF sub_topic is set
        if (subLower === activeSubTab.toLowerCase()) {
          matchesSubTab = true;
        } 
        // CTET Matches
        else if (activeSubTab === "Child Development & Pedagogy") {
          matchesSubTab = fullText.includes("child") || fullText.includes("pedo") || fullText.includes("शिक्षार्थी") || fullText.includes("बाल विकास") || fullText.includes("teaching");
        } else if (activeSubTab === "Geography & SST Content") {
          matchesSubTab = fullText.includes("geography") || fullText.includes("भूगोल") || fullText.includes("sst") || fullText.includes("map") || fullText.includes("climate") || fullText.includes("river");
        } else if (activeSubTab === "Pedagogy of Social Science" || activeSubTab === "Social Science Pedagogy") {
          matchesSubTab = fullText.includes("social science") || fullText.includes("सामाजिक विज्ञान") || fullText.includes("sst pedagogy") || fullText.includes("ict based");
        } 
        // UGC-NET Matches
        else if (activeSubTab === "Teaching Aptitude") {
          matchesSubTab = fullText.includes("teaching") || fullText.includes("शिक्षण") || fullText.includes("learner");
        } else if (activeSubTab === "Research Methodology & Statistics") {
          matchesSubTab = fullText.includes("research") || fullText.includes("शोध") || fullText.includes("test") || fullText.includes("correlation") || fullText.includes("anova") || fullText.includes("hypothesis");
        } else if (activeSubTab === "Higher Education System") {
          matchesSubTab = fullText.includes("higher education") || fullText.includes("उच्च शिक्षा") || fullText.includes("ancient indian");
        } else if (activeSubTab === "Information & Comm Technology (ICT)") {
          matchesSubTab = fullText.includes("ict") || fullText.includes("computer") || fullText.includes("cyber") || fullText.includes("swayam") || fullText.includes("mooc") || fullText.includes("internet");
        } else if (activeSubTab === "People, Dev & Environment") {
          matchesSubTab = fullText.includes("environment") || fullText.includes("disaster") || fullText.includes("pollution") || fullText.includes("biodiversity") || fullText.includes("climate");
        } else if (activeSubTab === "Geography Paper-II") {
          matchesSubTab = fullText.includes("geography") || fullText.includes("भूगोल") || fullText.includes("regional") || fullText.includes("resource") || fullText.includes("industry");
        } 
        // Generic PYQ
        else if (activeSubTab.includes("PYQ") || activeSubTab.includes("Previous Year")) {
          matchesSubTab = fullText.includes("pyq") || fullText.includes("question paper") || fullText.includes("mcqs") || fullText.includes("examination");
        } else {
          matchesSubTab = false;
        }
      }

      return matchesSearch && matchesPill && matchesSubTab;
    });
  }, [cards, searchQuery, paperPill, activeSubTab]);

  return (
    <main className="min-h-screen flex flex-col bg-[#E5E9EF] font-sans text-slate-900">
      <AuthModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        targetAction={modalAction}
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
                placeholder="Search by topic, class or exam..."
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

        {/* Global Navigation Strip */}
        <nav className="border-t border-b border-gray-300 bg-[#DFE2E8]">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 flex items-center gap-8 overflow-x-auto text-[14px] font-medium text-slate-900">
            <Link href="/" className="py-3 px-1 text-slate-800 hover:text-black whitespace-nowrap">Home</Link>
            <Link href="/category/upsc" className="py-3 px-1 text-slate-800 hover:text-black whitespace-nowrap">UPSC &amp; PSC</Link>
            <Link href="/category/school" className="py-3 px-1 text-slate-800 hover:text-black whitespace-nowrap">School Notes</Link>

            <div className="relative py-3 flex flex-col items-center">
              <Link href="/category/exams" className="font-bold text-slate-950 px-1 whitespace-nowrap">
                Exams (CTET, UGC-NET)
              </Link>
              <span className="absolute bottom-0 left-1 right-1 h-[2.5px] bg-[#E5A83B] rounded-full" />
            </div>

            <Link href="/category/university" className="py-3 px-1 text-slate-800 hover:text-black whitespace-nowrap">University Notes</Link>
            <Link href="/category/gc" className="py-3 px-1 text-slate-800 hover:text-black whitespace-nowrap">GC</Link>
          </div>
        </nav>
      </header>

      {/* Select Exam Strip */}
      <section className="bg-[#CFD4DC] border-b border-gray-300 py-3">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 flex items-center justify-between gap-4 overflow-x-auto">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-xs font-black text-slate-700 uppercase tracking-wider whitespace-nowrap">
              Select Exam:
            </span>
            <div className="inline-flex p-1 bg-white/80 rounded-xl border border-gray-300 shadow-sm gap-1">
              {examsList.map((exam) => (
                <button
                  key={exam.id}
                  onClick={() => setSelectedExam(exam)}
                  className={`text-xs font-bold px-4 sm:px-5 py-2 rounded-lg transition whitespace-nowrap ${
                    selectedExam?.id === exam.id
                      ? "bg-[#0B2545] text-white shadow"
                      : "text-slate-600 hover:text-black hover:bg-white"
                  }`}
                >
                  {exam.name}
                </button>
              ))}
            </div>
          </div>
          {selectedExam && (
            <span className="text-xs font-semibold text-slate-600 bg-white/50 px-3 py-1 rounded-full border border-gray-300 hidden md:inline whitespace-nowrap">
              Active: <strong>{selectedExam.name}</strong>
            </span>
          )}
        </div>
      </section>

      {/* Hero Section */}
      {selectedExam && (
        <section className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 pt-6 pb-6 w-full">
          <div className="text-xs font-semibold text-slate-500 mb-3 flex items-center gap-1.5">
            <Link href="/" className="hover:underline">Home</Link>
            <span>/</span>
            <span className="text-[#E5A83B]">{selectedExam.name}</span>
          </div>

          <div className="bg-[#F8EFE3] rounded-3xl p-6 sm:p-10 border border-amber-200/70 shadow-sm">
            <h2 className="text-3xl sm:text-4xl md:text-[38px] font-extrabold text-[#111827] leading-[1.2] tracking-tight mb-3">
              {selectedExam.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed max-w-3xl mb-6">
              {selectedExam.desc}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 max-w-xl mb-6">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search notes, topics, questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white text-xs pl-9 pr-4 py-3 rounded-xl border border-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#E5A83B]"
                />
                <Search className="w-4 h-4 absolute left-3 top-3.5 text-gray-400" />
              </div>
              <button className="bg-[#E5A83B] hover:bg-[#d49425] text-slate-950 font-bold text-xs px-7 py-3 rounded-xl transition shadow-sm whitespace-nowrap">
                Find Notes
              </button>
            </div>

            {/* Paper Category Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: "all", label: "All" },
                { id: "paper-1", label: "Paper 1 (Primary)" },
                { id: "paper-2", label: "Paper 2 (Upper Primary)" },
                { id: "pedagogy", label: "Pedagogy" },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setPaperPill(pill.id)}
                  className={`text-xs px-4 py-2 rounded-xl font-bold transition shadow-sm ${
                    paperPill === pill.id
                      ? "bg-[#0B2545] text-white"
                      : "bg-white text-slate-700 hover:bg-slate-50 border border-gray-200"
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contextual Sub-Topic Bar */}
      <section className="border-t border-b border-gray-300 bg-[#DFE2E8]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 flex items-center gap-8 overflow-x-auto text-[13px] font-semibold text-slate-700">
          {subTabs.map((tab, idx) => (
            <button
              key={idx}
              onClick={() => setActiveSubTab(tab)}
              className={`py-3.5 px-1 whitespace-nowrap transition cursor-pointer ${
                activeSubTab === tab
                  ? "border-b-2 border-[#E5A83B] text-slate-950 font-bold"
                  : "hover:text-black"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </section>

      {/* Study Material Section */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 py-8 w-full flex-1">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {selectedExam ? `${selectedExam.name} Study Material` : "Study Material"}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Showing {filteredCards.length} resources ({activeSubTab})
            </p>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-3xl p-16 flex flex-col items-center justify-center text-slate-500 border border-gray-200">
            <Loader2 className="w-8 h-8 animate-spin text-[#E5A83B] mb-3" />
            <p className="text-xs font-semibold">Loading study materials...</p>
          </div>
        ) : filteredCards.length === 0 ? (
          <div className="bg-white/80 rounded-3xl p-14 text-center text-slate-500 border border-gray-200 flex flex-col items-center justify-center my-4">
            <BookOpen className="w-12 h-12 text-amber-500/50 mb-3" />
            <h4 className="font-bold text-base text-slate-800 mb-1">
              No Notes Found
            </h4>
            <p className="text-xs text-slate-500 max-w-md mb-4">
              No materials found under &ldquo;{selectedExam?.name}&rdquo; for topic &ldquo;{activeSubTab}&rdquo;.
            </p>
            <button
              onClick={() => {
                setActiveSubTab("All Topics");
                setPaperPill("all");
                setSearchQuery("");
              }}
              className="px-4 py-2 bg-[#0B2545] text-white text-xs font-bold rounded-xl"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredCards.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-gray-200/80 flex flex-col justify-between hover:shadow-md transition"
              >
                <div>
                  <span className="inline-block bg-[#FEF3C7] text-[#B45309] text-[11px] font-extrabold px-3 py-1 rounded-md mb-4 border border-amber-200">
                    {item.tag}
                  </span>

                  <h4 
                    className="font-extrabold text-lg text-slate-900 leading-snug mb-3"
                    dangerouslySetInnerHTML={{ __html: item.title }}
                  />

                  {item.desc && (
                    <p className="text-xs text-slate-500 leading-relaxed mb-6">
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
                    <span className="flex items-center gap-1.5">
                      📦 {item.size}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-4 border-t border-gray-100">
                  <Link
                    href={`/read/${item.id}`}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Read Free
                  </Link>

                  <button
                    onClick={() => openAuthPaywall(`Download ${item.title}`)}
                    className="bg-[#E5A83B] hover:bg-[#d49425] text-slate-950 font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    Download PDF
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