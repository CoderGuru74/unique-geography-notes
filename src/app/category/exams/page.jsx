"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Download, Loader2, FileText, FileCheck, Lock, BookOpen } from "lucide-react";
import Navbar from "../../../components/Navbar";
import AuthModal from "../../../components/AuthModal";

const EXAM_CATEGORIES = [
  {
    id: "all",
    label: "सभी परीक्षा नोट्स (All Exams)",
    slugPatterns: [],
    keywords: [],
    bgClass: "bg-[#0B2545] hover:bg-[#081B33] text-white", // Dark Navy
  },
  {
    id: "test-series",
    label: "🔥 Test Series & Mock Papers",
    enLabel: "Official Printable Test Series & Model Question Papers",
    slugPatterns: [
      "test-series",
      "test",
      "mock-test",
      "practice-set",
      "model-paper",
      "test-paper",
      "online-test",
      "quiz",
    ],
    keywords: [
      "test series",
      "test",
      "mock test",
      "टेस्ट सीरीज",
      "टेस्ट सीरीज़",
      "मॉडल पेपर",
      "अभ्यास प्रश्न",
      "practice set",
      "model paper",
      "test paper",
    ],
    bgClass: "bg-[#E11D48] hover:bg-[#BE123C] text-white", // Vibrant Crimson/Rose
  },
  {
    id: "ctet",
    label: "CTET (Paper 1 & 2)",
    enLabel: "Central Teacher Eligibility Test",
    slugPatterns: ["ctet", "ctet-notes", "ctet-paper-1", "ctet-paper-2"],
    keywords: ["ctet", "सीटेट", "सी-टेट", "child pedo", "pedagogy"],
    bgClass: "bg-[#DC2626] hover:bg-[#B91C1C] text-white", // Crimson Red
  },
  {
    id: "ugc-net",
    label: "UGC-NET / JRF (Geography & Paper 1)",
    enLabel: "UGC NET Paper 1 & Paper 2",
    slugPatterns: ["ugc-net", "net-jrf", "ugc-net-jrf", "net-paper-2"],
    keywords: ["ugc-net", "ugc net", "jrf", "नेट", "जेआरएफ"],
    bgClass: "bg-[#2563EB] hover:bg-[#1D4ED8] text-white", // Royal Blue
  },
  {
    id: "bpsc-teacher",
    label: "BPSC शिक्षक भर्ती (TRE)",
    enLabel: "BPSC Teacher Geography & GS",
    slugPatterns: ["bpsc-teacher", "bpsc-tre", "bpsc-shikshak"],
    keywords: ["bpsc teacher", "bpsc tre", "शिक्षक भर्ती", "शिक्षक"],
    bgClass: "bg-[#16A34A] hover:bg-[#15803D] text-white", // Forest Green
  },
  {
    id: "tgt-pgt-stet",
    label: "KVS, NVS, TGT, PGT & STET",
    enLabel: "Secondary & Higher Secondary Teacher Exams",
    slugPatterns: ["kvs-nvs", "tgt-pgt", "stet", "kvs", "nvs", "pgt-geography"],
    keywords: ["kvs", "nvs", "tgt", "pgt", "stet", "एसटेट"],
    bgClass: "bg-[#7C3AED] hover:bg-[#6D28D9] text-white", // Deep Purple
  },
  {
    id: "solved-papers",
    label: "Solved Question Papers & MCQs",
    enLabel: "Previous Year Papers",
    slugPatterns: ["solved-paper", "previous-year", "question-paper", "mcq"],
    keywords: ["solved paper", "previous year", "प्रश्न पत्र", "हल प्रश्न", "mcq"],
    bgClass: "bg-[#D97706] hover:bg-[#B45309] text-white", // Amber Orange
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

  const [activeExam, setActiveExam] = useState("test-series");
  const [allPages, setAllPages] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  const [selectedPageIndex, setSelectedPageIndex] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState("Download Test Series PDF");
  const [activePostId, setActivePostId] = useState(null);

  const openDownloadModal = (title, postId) => {
    setModalAction(decodeHtmlEntities(title));
    setActivePostId(postId);
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
          if (pagesRes.ok) {
            pagesData = await pagesRes.json();
          }
        } catch (e) {
          console.warn("Could not fetch Exam pages from WordPress:", e.message);
        }

        try {
          const postsRes = await fetch(
            `${baseDomain}/wp-json/wp/v2/posts?_fields=id,date,title,excerpt,content,slug,acf,_links,_embed&_embed=wp:term&per_page=100`
          );
          if (postsRes.ok) {
            postsData = await postsRes.json();
          }
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

            return {
              id: p.id,
              title: title,
              excerpt: excerpt,
              content: p.content?.rendered || "",
              slug: p.slug || String(p.id),
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

        if (cleanPath.startsWith("category/")) {
          return `href="/${cleanPath}/"`;
        }
        return `href="/read/${encodeURIComponent(cleanPath)}/"`;
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

  const filteredPosts = useMemo(() => {
    if (!allPosts || allPosts.length === 0) return [];

    return allPosts.filter((p) => {
      if (activeExam === "all") return true;

      const matchesKeyword = currentExamConfig.keywords.some((kw) =>
        p.corpus.includes(kw.toLowerCase())
      );
      const matchesPattern = currentExamConfig.slugPatterns.some((pattern) =>
        p.corpus.includes(pattern.toLowerCase())
      );

      return matchesKeyword || matchesPattern;
    });
  }, [allPosts, currentExamConfig, activeExam]);

  const handleContentClick = (e) => {
    const targetLink = e.target.closest("a");
    if (!targetLink) return;

    const href = targetLink.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;

    e.preventDefault();

    let cleanPath = href
      .replace(/^https?:\/\/(?:www\.|api\.)?geographynotespdf\.com\/?(?:cms\/)?/i, "")
      .replace(/^\/?read\//i, "")
      .replace(/^\/+|\/+$/g, "");

    try {
      cleanPath = decodeURIComponent(decodeURIComponent(cleanPath));
    } catch (_) {
      try {
        cleanPath = decodeURIComponent(cleanPath);
      } catch (_) {}
    }

    if (cleanPath.startsWith("category/")) {
      window.location.href = `/${cleanPath}/`;
      return;
    }

    window.location.href = `/read/${encodeURIComponent(cleanPath)}/`;
  };

  return (
    <main className="min-h-screen flex flex-col bg-[#E5E9EF] font-sans text-slate-900">
      <AuthModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        targetAction={modalAction}
        postId={activePostId}
        contentElementId="printable-content"
      />

      <Navbar />

      <section className="bg-[#CFD4DC] border-b border-gray-300 py-3">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-700 uppercase tracking-wider">Exam Portal:</span>
            <span className="text-xs font-bold text-slate-900 bg-white/80 px-3 py-1 rounded-lg border border-gray-300 shadow-xs">
              Test Series &amp; Mock Papers • UGC-NET • BPSC TRE • CTET • KVS/NVS
            </span>
          </div>
          <span className="text-xs font-semibold text-slate-600 bg-white/50 px-3 py-1 rounded-full border border-gray-300 hidden sm:inline">
            Free Online Reading • Direct PDF Download
          </span>
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
        {/* Notice Card for Test Series */}
        {activeExam === "test-series" && (
          <div className="bg-white border border-amber-300/80 rounded-2xl p-4 sm:p-5 mb-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-100 rounded-xl text-amber-700 shrink-0">
                <FileCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900">
                  Official Printable Test Series &amp; Practice Sets
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Read complete questions and answers <strong>Online for Free</strong>, or click <strong>&quot;Download PDF&quot;</strong> to get the verified printable copy.
                </p>
              </div>
            </div>
          </div>
        )}

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

        {/* Standard Content Overview Card */}
        {activePage && activeExam !== "test-series" && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-gray-200 mb-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 mb-6 border-b border-gray-100 gap-3">
              <div>
                <span className="text-[11px] font-extrabold text-[#B45309] uppercase tracking-wider block">
                  {currentExamConfig.enLabel || "Exam Question Paper & Solution Overview"}
                </span>
                <h2
                  className="text-xl sm:text-2xl font-black text-slate-900"
                  dangerouslySetInnerHTML={{
                    __html: activePage.title,
                  }}
                />
              </div>
              <button
                onClick={() =>
                  openDownloadModal(
                    activePage.title || `${currentExamConfig.label} Paper`,
                    activePage.id
                  )
                }
                className="bg-[#0B2545] hover:bg-slate-900 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer shadow-xs whitespace-nowrap"
              >
                <Download className="w-4 h-4 text-amber-400" /> Save Page PDF
              </button>
            </div>

            <div
              id="printable-content"
              onClick={handleContentClick}
              className="prose max-w-none text-slate-800 leading-relaxed
                [&_a]:text-blue-600 [&_a]:font-semibold [&_a:hover]:underline [&_a]:cursor-pointer
                [&_h1]:text-xl [&_h1]:font-black [&_h1]:text-slate-900 [&_h1]:mb-3
                [&_h2]:text-lg [&_h2]:font-extrabold [&_h2]:text-slate-900 [&_h2]:mt-5 [&_h2]:mb-2
                [&_h3]:text-sm [&_h3]:font-bold [&_h3]:text-[#DC2626] [&_h3]:mt-4 [&_h3]:mb-1.5
                [&_ul]:list-square [&_ul]:pl-6 [&_ul]:my-2 [&_li]:my-1.5 [&_li]:text-xs sm:[&_li]:text-sm
                [&_img]:rounded-xl [&_img]:shadow-xs [&_img]:my-3 [&_img]:mx-auto"
              dangerouslySetInnerHTML={{ __html: activePage.content }}
            />
          </div>
        )}

        {/* Available Test Series & Papers Grid */}
        <section className="w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-2">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {currentExamConfig.label} — Available Test Sets &amp; Question Papers
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Free online access to read, with direct PDF download available.
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
              <p className="text-xs font-semibold">Loading test papers from server...</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="bg-white/80 rounded-3xl p-12 text-center text-slate-500 border border-gray-200">
              <FileText className="w-10 h-10 text-amber-500/50 mb-2 mx-auto" />
              <h4 className="font-bold text-sm text-slate-800">
                No papers currently uploaded for {currentExamConfig.label}
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
                Test papers and solution keys uploaded via WordPress will appear here automatically.
              </p>
              <button
                onClick={() => setActiveExam("all")}
                className="px-4 py-2 bg-[#0B2545] text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                View All Available Exam Papers
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredPosts.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 flex flex-col justify-between hover:shadow-md transition"
                >
                  <div>
                    <span className="inline-block bg-[#FEF3C7] text-[#B45309] text-[10px] font-extrabold px-2.5 py-0.5 rounded mb-3 border border-amber-200">
                      {currentExamConfig.id === "all" ? "Test Series / Notes" : currentExamConfig.label}
                    </span>

                    {/* Post Title links to free online reader */}
                    <Link
                      href={`/read/${encodeURIComponent(item.slug)}/`}
                      className="block font-black text-sm sm:text-base text-slate-900 leading-snug mb-2 hover:text-[#0B2545] transition cursor-pointer"
                    >
                      <h4 dangerouslySetInnerHTML={{ __html: item.title }} />
                    </Link>

                    {/* Short excerpt description */}
                    {item.excerpt && (
                      <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mb-4">
                        {item.excerpt}
                      </p>
                    )}
                  </div>

                  {/* Dual Action Buttons: Read Free + Direct Paid PDF Download */}
                  <div className="pt-3 border-t border-gray-100 flex items-center gap-2">
                    <Link
                      href={`/read/${encodeURIComponent(item.slug)}/`}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-slate-600" />
                      <span>Read Free</span>
                    </Link>

                    <button
                      onClick={() => openDownloadModal(item.title, item.id)}
                      className="flex-1 bg-[#E5A83B] hover:bg-[#d49425] text-slate-950 font-black text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer active:scale-[0.98]"
                    >
                      <Lock className="w-3.5 h-3.5 text-slate-900" />
                      <Download className="w-3.5 h-3.5 text-slate-900" />
                      <span>Download PDF</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}