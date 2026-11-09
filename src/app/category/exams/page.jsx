"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Download,
  Loader2,
  FileText,
  Lock,
  PlayCircle,
  ShieldCheck,
  User,
  LogIn,
  CheckCircle,
  Sparkles,
  Home,
  ExternalLink,
  BookOpen,
} from "lucide-react";
import Navbar from "../../../components/Navbar";
import AuthModal from "../../../components/AuthModal";

// Helper function to sanitize WordPress slugs and prevent double-prefixing (/read/read%2Fslug)
const sanitizeSlug = (rawSlug) => {
  if (!rawSlug) return "";
  return String(rawSlug)
    .replace(/^https?:\/\/[^\/]+/, "") // Remove domain if present
    .replace(/^\/?read\//i, "")        // Remove leading "read/" or "/read/"
    .replace(/^\/+|\/+$/g, "");        // Trim leading & trailing slashes
};

const EXAM_CATEGORIES = [
  {
    id: "all",
    label: "सभी परीक्षा नोट्स (All Exams)",
    slugPatterns: [],
    keywords: [],
    bgClass: "bg-[#0B2545] hover:bg-[#081B33] text-white",
  },
  {
    id: "test-series",
    label: "🔥 Test Series & Live Mock Papers",
    enLabel: "Official CBT Test Series & Model Question Papers",
    slugPatterns: [
      "test-series",
      "mock-test",
      "practice-set",
      "cbt",
      "paper-1",
      "paper-2",
      "set1",
      "set-1",
    ],
    keywords: [
      "test series",
      "mock test",
      "टेस्ट सीरीज",
      "टेस्ट सीरीज़",
      "practice set",
      "cbt test",
      "paper 1",
      "paper 2",
      "set1",
      "set 1",
    ],
    bgClass: "bg-[#E11D48] hover:bg-[#BE123C] text-white",
  },
  {
    id: "ugc-net",
    label: "UGC-NET / JRF (Paper 1 & Paper 2)",
    enLabel: "UGC NET General Paper 1 & Geography Paper 2",
    slugPatterns: ["ugc-net", "net-jrf", "ugc-net-jrf", "net-paper-2"],
    keywords: ["ugc-net", "ugc net", "jrf", "नेट", "जेआरएफ"],
    bgClass: "bg-[#2563EB] hover:bg-[#1D4ED8] text-white",
  },
  {
    id: "bpsc-teacher",
    label: "BPSC शिक्षक भर्ती (TRE)",
    enLabel: "BPSC Teacher Geography & GS",
    slugPatterns: ["bpsc-teacher", "bpsc-tre", "bpsc-shikshak"],
    keywords: ["bpsc teacher", "bpsc tre", "शिक्षक भर्ती", "शिक्षक"],
    bgClass: "bg-[#16A34A] hover:bg-[#15803D] text-white",
  },
  {
    id: "ctet",
    label: "CTET (Paper 1 & 2)",
    enLabel: "Central Teacher Eligibility Test",
    slugPatterns: ["ctet", "ctet-notes", "ctet-paper-1", "ctet-paper-2"],
    keywords: ["ctet", "सीटेट", "सी-टेट", "child pedo", "pedagogy"],
    bgClass: "bg-[#DC2626] hover:bg-[#B91C1C] text-white",
  },
  {
    id: "tgt-pgt-stet",
    label: "KVS, NVS, TGT, PGT & STET",
    enLabel: "Secondary & Higher Secondary Teacher Exams",
    slugPatterns: ["kvs-nvs", "tgt-pgt", "stet", "kvs", "nvs", "pgt-geography"],
    keywords: ["kvs", "nvs", "tgt", "pgt", "stet", "एसटेट"],
    bgClass: "bg-[#7C3AED] hover:bg-[#6D28D9] text-white",
  },
  {
    id: "solved-papers",
    label: "Solved Question Papers & MCQs",
    enLabel: "Previous Year Papers",
    slugPatterns: ["solved-paper", "previous-year", "question-paper"],
    keywords: ["solved paper", "previous year", "प्रश्न पत्र", "हल प्रश्न"],
    bgClass: "bg-[#D97706] hover:bg-[#B45309] text-white",
  },
];

function decodeHtmlEntities(str) {
  if (!str) return "";
  return str
    .replace(/&#8217;/g, "’")
    .replace(/&#8216;/g, "‘")
    .replace(/&#8220;/g, "“")
    .replace(/&#8221;/g, "”")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
}

export default function ExamsPage() {
  const router = useRouter();

  const [activeExam, setActiveExam] = useState("all");
  const [paperFilter, setPaperFilter] = useState("ALL"); // ALL | PAPER_1 | PAPER_2
  const [allPages, setAllPages] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Student Profile & Purchases State
  const [user, setUser] = useState(null);

  const [selectedPageIndex, setSelectedPageIndex] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState("Login or Upgrade Access");
  const [activePostId, setActivePostId] = useState(null);
  const [activePaperType, setActivePaperType] = useState(null);

  // Sync user profile on mount and on modal toggle
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("notes_user");
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (_) {}
      }
    }
  }, [modalOpen]);

  const openPurchaseModal = (title, postId, paperType = "PAPER_1", isTest = false) => {
    let actionLabel = "";
    if (isTest) {
      actionLabel = `Unlock ${
        paperType === "PAPER_2" ? "Paper 2 (Geography)" : "Paper 1 (Common)"
      } @ ₹599 — ${decodeHtmlEntities(title)}`;
    } else {
      actionLabel = `Download PDF (₹5 or ₹49 Notes Pass) — ${decodeHtmlEntities(title)}`;
    }
    setModalAction(actionLabel);
    setActivePostId(postId);
    setActivePaperType(isTest ? paperType : "NOTES_PASS");
    setModalOpen(true);
  };

  useEffect(() => {
    let isMounted = true;

    async function fetchExamsWordPressData() {
      const baseDomain = (
        process.env.NEXT_PUBLIC_WORDPRESS_URL || "https://geographynotespdf.com/cms"
      ).replace(/\/+$/, "");

      setDataLoading(true);

      try {
        let pagesData = [];
        let postsData = [];

        try {
          const pagesRes = await fetch(`${baseDomain}/wp-json/wp/v2/pages?per_page=100&_embed`);
          if (pagesRes.ok) pagesData = await pagesRes.json();
        } catch (e) {
          console.warn("Could not fetch Exam pages from WordPress:", e.message);
        }

        try {
          const postsRes = await fetch(
            `${baseDomain}/wp-json/wp/v2/posts?_fields=id,date,title,excerpt,content,slug,acf,_links,_embed&_embed=wp:term&per_page=100`
          );
          if (postsRes.ok) postsData = await postsRes.json();
        } catch (e) {
          console.warn("Could not fetch Exam posts from WordPress:", e.message);
        }

        if (!isMounted) return;

        setAllPages(Array.isArray(pagesData) ? pagesData : []);

        if (Array.isArray(postsData)) {
          const formattedPosts = postsData.map((p) => {
            const rawTitle = p.title?.rendered || "";
            const rawExcerpt = p.excerpt?.rendered?.replace(/<[^>]+>/g, "").trim() || "";
            const title = decodeHtmlEntities(rawTitle);
            const excerpt = decodeHtmlEntities(rawExcerpt);

            const titleLower = title.toLowerCase();
            const slugLower = (p.slug || "").toLowerCase();

            // Broad check for CBT Test fields or phrases
            const hasAcfQuestions = Boolean(
              p.acf?.q1_question ||
              p.acf?.quiz_json ||
              p.acf?.exam_questions?.length > 0 ||
              p.acf?.q1_group?.question_text ||
              p.acf?.q1_group?.question_statement
            );

            const hasExplicitMockTestPhrase =
              titleLower.includes("paper 1") ||
              titleLower.includes("paper 2") ||
              titleLower.includes("paper-1") ||
              titleLower.includes("paper-2") ||
              titleLower.includes("mock test") ||
              titleLower.includes("test series") ||
              titleLower.includes("practice set") ||
              titleLower.includes("cbt test") ||
              titleLower.includes("set1") ||
              titleLower.includes("set-1") ||
              slugLower.includes("paper-1") ||
              slugLower.includes("paper-2") ||
              slugLower.includes("mock-test") ||
              slugLower.includes("test-series") ||
              slugLower.includes("practice-set") ||
              slugLower.includes("set1");

            const isTest = hasAcfQuestions || hasExplicitMockTestPhrase;

            // Detect Paper Type
            let paperType = "PAPER_1";
            if (
              titleLower.includes("paper 2") ||
              titleLower.includes("paper-2") ||
              titleLower.includes("geography") ||
              titleLower.includes("भूगोल") ||
              slugLower.includes("paper-2") ||
              slugLower.includes("geography")
            ) {
              paperType = "PAPER_2";
            }

            return {
              id: p.id,
              title: title,
              excerpt: excerpt,
              content: p.content?.rendered || "",
              slug: p.slug || String(p.id),
              isTest: isTest,
              paperType: paperType,
              date: p.date
                ? new Date(p.date).toLocaleDateString("en-US", { month: "short", year: "numeric" })
                : "",
              corpus: `${title} ${excerpt} ${p.slug || ""}`.toLowerCase(),
            };
          });
          setAllPosts(formattedPosts);
        } else {
          setAllPosts([]);
        }
      } catch (err) {
        console.error("General error loading Exams data:", err);
      } finally {
        if (isMounted) setDataLoading(false);
      }
    }

    fetchExamsWordPressData();

    return () => {
      isMounted = false;
    };
  }, []);

  const currentExamConfig = EXAM_CATEGORIES.find((e) => e.id === activeExam) || EXAM_CATEGORIES[0];

  useEffect(() => {
    setSelectedPageIndex(0);
  }, [activeExam]);

  function cleanAndRewriteWordPressLinks(html) {
    if (!html) return "";

    let cleaned = html.replace(
      /<div[^>]*class="[^"]*(?:quiz|question-box|exam-timer)[^"]*"[^>]*>[\s\S]*?<\/div>/gi,
      ""
    );

    return cleaned.replace(
      /href=["'](https?:\/\/(?:www\.|api\.)?geographynotespdf\.com)?\/?(?:cms\/)?([^"'#\s>]+)\/?["']/gi,
      (match, domain, path) => {
        let cleanPath = path.replace(/^\/+|\/+$/g, "");
        try {
          cleanPath = decodeURIComponent(decodeURIComponent(cleanPath));
        } catch (_) {
          try {
            cleanPath = decodeURIComponent(cleanPath);
          } catch (_) {}
        }

        cleanPath = sanitizeSlug(cleanPath);

        if (cleanPath.startsWith("category/")) {
          return `href="/${cleanPath}/"`;
        }
        return `href="/read/${cleanPath}/"`;
      }
    );
  }

  const examPages = useMemo(() => {
    if (!allPages || allPages.length === 0 || activeExam === "all" || activeExam === "test-series") {
      return [];
    }

    return allPages
      .filter((pg) => {
        const slug = (pg.slug || "").toLowerCase();
        const title = (pg.title?.rendered || "").toLowerCase();
        const fullText = `${slug} ${title}`;

        const matchesPattern = currentExamConfig.slugPatterns.some((pattern) =>
          fullText.includes(pattern.toLowerCase())
        );

        const matchesKeyword = currentExamConfig.keywords.some((kw) =>
          fullText.includes(kw.toLowerCase())
        );

        return matchesPattern || matchesKeyword;
      })
      .map((pg) => ({
        id: pg.id,
        title: pg.title?.rendered || currentExamConfig.label,
        slug: pg.slug || "",
        content: cleanAndRewriteWordPressLinks(pg.content?.rendered || ""),
      }));
  }, [allPages, currentExamConfig, activeExam]);

  const activePage = examPages[selectedPageIndex] || examPages[0] || null;

  // Filtered Posts Logic
  const filteredPosts = useMemo(() => {
    if (!allPosts || allPosts.length === 0) return [];

    return allPosts.filter((p) => {
      // 1. Under "सभी परीक्षा नोट्स (All Exams)", ONLY show regular theory notes (EXCLUDE CBT tests)
      if (activeExam === "all" && paperFilter === "ALL") {
        if (p.isTest) return false;
      }

      // 2. If 'Test Series' tab or Paper Filter is explicitly selected, require CBT test flag
      if (activeExam === "test-series" || paperFilter !== "ALL") {
        if (!p.isTest) return false;
      }

      // 3. Filter by Category Keywords
      let matchesExam = true;
      if (activeExam !== "all" && activeExam !== "test-series") {
        const matchesKeyword = currentExamConfig.keywords.some((kw) =>
          p.corpus.includes(kw.toLowerCase())
        );
        const matchesPattern = currentExamConfig.slugPatterns.some((pattern) =>
          p.corpus.includes(pattern.toLowerCase())
        );
        matchesExam = matchesKeyword || matchesPattern;
      }

      // 4. Filter by Paper 1 / Paper 2
      let matchesPaper = true;
      if (paperFilter !== "ALL") {
        matchesPaper = p.paperType === paperFilter;
      }

      return matchesExam && matchesPaper;
    });
  }, [allPosts, currentExamConfig, activeExam, paperFilter]);

  return (
    <main className="min-h-screen flex flex-col bg-[#E5E9EF] font-sans text-slate-900">
      <AuthModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        targetAction={modalAction}
        postId={activePostId}
        paperType={activePaperType}
        contentElementId="printable-content"
      />

      <Navbar />

      {/* Top Student Portal & Account Status Bar */}
      <section className="bg-[#0B2545] text-white py-3 border-b border-slate-800">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-black tracking-wide uppercase">CBT Exam Portal:</span>
            <span className="text-xs font-bold bg-white/10 px-3 py-1 rounded-lg border border-white/20">
              Read Free • PDF Download (Pass / Unlock) • CBT Test Series (₹599)
            </span>
          </div>

          {/* Student Account Status Trigger */}
          <div className="flex items-center gap-3">
            {user ? (
              <button
                onClick={() => router.push("/dashboard")}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl border border-white/20 text-xs transition cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-bold text-slate-100">{user.email || user.name || "Student"}</span>
                <span className="text-slate-400">|</span>
                <span className="flex items-center gap-1 font-bold">
                  {user.purchased_paper1 && (
                    <span className="bg-blue-500/30 text-blue-300 px-2 py-0.5 rounded text-[10px] border border-blue-400/30">
                      P1 Active
                    </span>
                  )}
                  {user.purchased_paper2 && (
                    <span className="bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded text-[10px] border border-emerald-400/30">
                      P2 Active
                    </span>
                  )}
                  {user.has_active_pass && (
                    <span className="bg-amber-500/30 text-amber-300 px-2 py-0.5 rounded text-[10px] border border-amber-400/30">
                      Notes Pass
                    </span>
                  )}
                  {!user.purchased_paper1 && !user.purchased_paper2 && !user.has_active_pass && (
                    <span className="text-slate-300 text-[10px]">My Account</span>
                  )}
                </span>
                <ExternalLink className="w-3 h-3 text-amber-400 ml-1" />
              </button>
            ) : (
              <button
                onClick={() => {
                  setModalAction("Student Account Login");
                  setActivePaperType(null);
                  setModalOpen(true);
                }}
                className="bg-[#E5A83B] hover:bg-[#d49425] text-slate-950 text-xs font-black px-4 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Student Login / Account</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Categories Bar */}
      <section className="border-b border-gray-300 bg-[#DFE2E8] py-2.5">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 flex items-center gap-2.5 overflow-x-auto text-[13px]">
          {EXAM_CATEGORIES.map((cat) => {
            const isSelected = activeExam === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setActiveExam(cat.id)}
                className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all duration-150 cursor-pointer font-bold text-xs sm:text-[13px] shadow-sm flex items-center gap-2 border ${cat.bgClass} ${
                  isSelected
                    ? "ring-3 ring-amber-400 border-white scale-105"
                    : "opacity-90 hover:opacity-100 border-black/10"
                }`}
              >
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 py-8 w-full flex-1">
        {/* Paper 1 vs Paper 2 Plan Information Box */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-extrabold">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>Official Exam &amp; Study Portal</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Free Theory Notes, PDF Downloads &amp; Live CBT Test Series
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Read all theory notes for <strong>Free online</strong>. Download PDFs or unlock all downloads with the <strong>Notes Pass</strong>. Practice live NTA-pattern mock tests with the <strong>₹599 CBT Test Series Plan</strong>.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 w-full md:w-auto shrink-0">
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl text-center">
                <span className="text-[10px] font-black text-amber-700 uppercase block">PDF Pass</span>
                <span className="text-lg font-black text-slate-900 block mt-1">₹49</span>
                <span className="text-[9px] text-slate-500 font-semibold">Unlimited PDFs</span>
              </div>
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-2xl text-center">
                <span className="text-[10px] font-black text-blue-700 uppercase block">Paper 1 Test</span>
                <span className="text-lg font-black text-slate-900 block mt-1">₹599</span>
                <span className="text-[9px] text-slate-500 font-semibold">Common CBT</span>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl text-center">
                <span className="text-[10px] font-black text-emerald-700 uppercase block">Paper 2 Test</span>
                <span className="text-lg font-black text-slate-900 block mt-1">₹599</span>
                <span className="text-[9px] text-slate-500 font-semibold">Geography CBT</span>
              </div>
            </div>
          </div>

          {/* Paper Filter Bar */}
          <div className="mt-6 pt-6 border-t border-gray-100 flex items-center gap-2 overflow-x-auto">
            <span className="text-xs font-black text-slate-700 uppercase tracking-wider shrink-0">Show Papers:</span>
            <button
              onClick={() => setPaperFilter("ALL")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                paperFilter === "ALL"
                  ? "bg-[#0B2545] text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              All Items
            </button>
            <button
              onClick={() => setPaperFilter("PAPER_1")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                paperFilter === "PAPER_1"
                  ? "bg-[#2563EB] text-white shadow-xs"
                  : "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
              }`}
            >
              <span>Paper 1 CBT Tests (₹599)</span>
            </button>
            <button
              onClick={() => setPaperFilter("PAPER_2")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                paperFilter === "PAPER_2"
                  ? "bg-[#16A34A] text-white shadow-xs"
                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
              }`}
            >
              <span>Paper 2 CBT Tests (₹599)</span>
            </button>
          </div>
        </div>

        {/* Page Switcher Tabs if multiple pages exist */}
        {examPages.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto mb-4 pb-2">
            <span className="text-xs font-black text-slate-600 uppercase tracking-wider whitespace-nowrap">
              पेज चुनें:
            </span>
            {examPages.map((pg, idx) => (
              <button
                key={pg.id}
                onClick={() => setSelectedPageIndex(idx)}
                className={`text-xs px-3.5 py-1.5 rounded-lg font-bold border transition cursor-pointer whitespace-nowrap ${
                  selectedPageIndex === idx
                    ? "bg-[#E5A83B] text-slate-950 border-amber-400 shadow-xs"
                    : "bg-white text-slate-700 border-gray-300 hover:bg-slate-50"
                }`}
                dangerouslySetInnerHTML={{ __html: pg.title }}
              />
            ))}
          </div>
        )}

        {/* Selected Page Overview Content */}
        {activePage && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm mb-8">
            <h3
              className="text-lg font-black text-slate-900 mb-4 pb-2 border-b border-gray-100"
              dangerouslySetInnerHTML={{ __html: activePage.title }}
            />
            <div
              className="prose prose-slate max-w-none text-xs sm:text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: activePage.content }}
            />
          </div>
        )}

        {/* Available Content Grid */}
        <section className="w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-2">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {currentExamConfig.label}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Read notes online for free, download PDFs, or attempt live CBT test series.
              </p>
            </div>
            {activeExam !== "all" && (
              <button
                onClick={() => setActiveExam("all")}
                className="text-xs font-bold text-slate-700 bg-white px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-slate-50 cursor-pointer"
              >
                Show All Exams
              </button>
            )}
          </div>

          {dataLoading ? (
            <div className="bg-white rounded-3xl p-14 flex flex-col items-center justify-center text-slate-500 border border-gray-200">
              <Loader2 className="w-6 h-6 animate-spin text-[#E5A83B] mb-2" />
              <p className="text-xs font-semibold">Loading content from server...</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="bg-white/80 rounded-3xl p-12 text-center text-slate-500 border border-gray-200">
              <FileText className="w-10 h-10 text-amber-500/50 mb-2 mx-auto" />
              <h4 className="font-bold text-sm text-slate-800">
                No items found for this selection.
              </h4>
              <button
                onClick={() => {
                  setPaperFilter("ALL");
                  setActiveExam("all");
                }}
                className="mt-3 px-4 py-2 bg-[#0B2545] text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredPosts.map((item) => {
                const isPaper2 = item.paperType === "PAPER_2";
                const cleanSlug = sanitizeSlug(item.slug);

                // Access check
                const isTestUnlocked = user
                  ? isPaper2
                    ? Boolean(user.purchased_paper2)
                    : Boolean(user.purchased_paper1)
                  : false;

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 flex flex-col justify-between hover:shadow-md transition"
                  >
                    <div>
                      {/* Header Badge */}
                      <div className="flex items-center justify-between mb-3">
                        {item.isTest ? (
                          <span
                            className={`text-[10px] font-black px-2.5 py-0.5 rounded border ${
                              isPaper2
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : "bg-blue-50 text-blue-800 border-blue-200"
                            }`}
                          >
                            {isPaper2 ? "PAPER 2 — CBT Mock Test" : "PAPER 1 — CBT Mock Test"}
                          </span>
                        ) : (
                          <span className="text-[10px] font-black px-2.5 py-0.5 rounded border bg-emerald-50 text-emerald-800 border-emerald-200">
                            FREE READING NOTES
                          </span>
                        )}

                        {item.isTest ? (
                          isTestUnlocked ? (
                            <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded border border-emerald-300 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" /> UNLOCKED
                            </span>
                          ) : (
                            <span className="text-xs font-black text-slate-900 bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-300">
                              ₹599
                            </span>
                          )
                        ) : (
                          <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                            FREE ONLINE
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h4
                        className="font-black text-sm sm:text-base text-slate-900 leading-snug mb-2"
                        dangerouslySetInnerHTML={{ __html: item.title }}
                      />

                      {/* Excerpt */}
                      {item.excerpt && (
                        <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mb-4">
                          {item.excerpt}
                        </p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-3 border-t border-gray-100">
                      {item.isTest ? (
                        /* CBT TEST SERIES BUTTONS */
                        isTestUnlocked ? (
                          <Link
                            href={`/read/${cleanSlug}/`}
                            prefetch={false}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-3 rounded-xl flex items-center justify-center gap-2 shadow-xs transition cursor-pointer active:scale-[0.98]"
                          >
                            <PlayCircle className="w-4 h-4" />
                            <span>Start Live CBT Test</span>
                          </Link>
                        ) : (
                          <button
                            onClick={() =>
                              openPurchaseModal(item.title, item.id, item.paperType, true)
                            }
                            className="w-full bg-[#E5A83B] hover:bg-[#d49425] text-slate-950 font-black text-xs py-3 rounded-xl flex items-center justify-center gap-2 shadow-xs transition cursor-pointer active:scale-[0.98]"
                          >
                            <Lock className="w-3.5 h-3.5 text-slate-900" />
                            <span>Buy {isPaper2 ? "Paper 2" : "Paper 1"} Plan (₹599)</span>
                          </button>
                        )
                      ) : (
                        /* STANDARD THEORY NOTES BUTTONS */
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/read/${cleanSlug}/`}
                            prefetch={false}
                            className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer text-center"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>Read Free</span>
                          </Link>

                          <button
                            onClick={() =>
                              openPurchaseModal(item.title, item.id, "NOTES_PASS", false)
                            }
                            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer shrink-0"
                            title="Download PDF"
                          >
                            <Lock className="w-3.5 h-3.5 text-slate-950" />
                            <span>Download PDF</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}