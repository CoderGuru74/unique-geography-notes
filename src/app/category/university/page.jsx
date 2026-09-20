"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, BookOpen, Eye, Download, Loader2, FileText } from "lucide-react";
import AuthModal from "../../../components/AuthModal";

const DEGREE_TABS = [
  { id: "ug", label: "BA / UG / B.Sc. Notes" },
  { id: "pg", label: "MA / PG / M.Sc. Notes" },
];

const UG_SEMESTERS = [
  {
    id: "ug-1",
    label: "UG Semester-I",
    num: 1,
    roman: "I",
    paperKey: "MJC-1",
    exactSlugs: ["ug-semester-i-academic-notes", "ug-semester-1", "ug-semester-i"],
    titleRegex: /\b(semester[-_\s]*i\b|semester[-_\s]*1\b|mjc[-_\s]*1\b)/i,
    negativeRegex: /\b(ii|iii|iv|v|vi|vii|viii|2|3|4|5|6|7|8)\b/i,
  },
  {
    id: "ug-2",
    label: "UG Semester-II",
    num: 2,
    roman: "II",
    paperKey: "MJC-2",
    exactSlugs: [
      "ug-%e0%a4%95%e0%a4%be-%e0%a4%a8%e0%a5%8b%e0%a4%9f%e0%a5%8d%e0%a4%b8-semester-ii",
      "ug-semester-ii-academic-notes",
      "ug-semester-ii",
      "ug-semester-2",
    ],
    titleRegex: /\b(semester[-_\s]*ii\b|semester[-_\s]*2\b|mjc[-_\s]*2\b)/i,
    negativeRegex: /\b(iii|vii|viii|3|7|8)\b/i,
  },
  {
    id: "ug-3",
    label: "UG Semester-III",
    num: 3,
    roman: "III",
    paperKey: "MJC-3",
    exactSlugs: [
      "ug-%e0%a4%95%e0%a4%be-%e0%a4%a8%e0%a5%8b%e0%a4%9f%e0%a5%8d%e0%a4%b8-semester-iii",
      "ug-semester-iii-academic-notes",
      "ug-semester-iii",
      "ug-semester-3",
    ],
    titleRegex: /\b(semester[-_\s]*iii\b|semester[-_\s]*3\b|mjc[-_\s]*3\b)/i,
    negativeRegex: /\b(viii|8)\b/i,
  },
  {
    id: "ug-4",
    label: "UG Semester-IV",
    num: 4,
    roman: "IV",
    paperKey: "MJC-4",
    exactSlugs: [
      "ug-semester-iv-academic-notes",
      "ug-semester-iv",
      "ug-semester-4",
      "ba-semester-paper-iv",
    ],
    titleRegex: /\b(semester[-_\s]*iv\b|semester[-_\s]*4\b|mjc[-_\s]*4\b|paper[-_\s]*iv\b)/i,
    negativeRegex: null,
  },
  {
    id: "ug-5",
    label: "UG Semester-V",
    num: 5,
    roman: "V",
    paperKey: "MJC-5",
    exactSlugs: [
      "ug-semester-v-academic-notes",
      "ug-semester-v",
      "ug-semester-5",
      "ba-semester-paper-v",
    ],
    titleRegex: /\b(semester[-_\s]*v\b|semester[-_\s]*5\b|mjc[-_\s]*5\b|paper[-_\s]*v\b)/i,
    negativeRegex: /\b(vi|vii|viii|6|7|8)\b/i,
  },
  {
    id: "ug-6",
    label: "UG Semester-VI",
    num: 6,
    roman: "VI",
    paperKey: "MJC-6",
    exactSlugs: [
      "ug-semester-vi-academic-notes",
      "ug-semester-vi",
      "ug-semester-6",
      "ba-semester-paper-vi",
    ],
    titleRegex: /\b(semester[-_\s]*vi\b|semester[-_\s]*6\b|mjc[-_\s]*6\b|paper[-_\s]*vi\b)/i,
    negativeRegex: /\b(vii|viii|7|8)\b/i,
  },
  {
    id: "ug-7",
    label: "UG Semester-VII",
    num: 7,
    roman: "VII",
    paperKey: "MJC-7",
    exactSlugs: [
      "ug-semester-vii-academic-notes",
      "ug-semester-vii",
      "ug-semester-7",
      "ba-semester-paper-vii",
    ],
    titleRegex: /\b(semester[-_\s]*vii\b|semester[-_\s]*7\b|mjc[-_\s]*7\b|paper[-_\s]*vii\b)/i,
    negativeRegex: /\b(viii|8)\b/i,
  },
  {
    id: "ug-8",
    label: "UG Semester-VIII",
    num: 8,
    roman: "VIII",
    paperKey: "MJC-8",
    exactSlugs: [
      "ug-semester-viii-academic-notes",
      "ug-semester-viii",
      "ug-semester-8",
      "semester-viii",
      "semester-8",
      "ba-semester-paper-viii",
    ],
    titleRegex: /\b(semester[-_\s]*viii\b|semester[-_\s]*8\b|mjc[-_\s]*8\b|paper[-_\s]*viii\b)/i,
    negativeRegex: null,
  },
  {
    id: "ug-practical",
    label: "Practical Geography",
    num: 0,
    roman: "PRACTICAL",
    paperKey: "Practical",
    exactSlugs: ["practical-geography", "practical-geography-notes", "all-practical-geography"],
    titleRegex: /\b(practical|cartography|प्रायोगिक)\b/i,
    negativeRegex: null,
  },
];

const PG_SEMESTERS = [
  {
    id: "pg-1",
    label: "PG Semester-1",
    num: 1,
    roman: "I",
    paperKey: "PG-1",
    exactSlugs: ["pg-semester-i", "pg-semester-1"],
    titleRegex: /\b(pg[-_\s]*semester[-_\s]*1\b|pg[-_\s]*semester[-_\s]*i\b)/i,
    negativeRegex: /\b(ii|iii|iv|2|3|4)\b/i,
  },
  {
    id: "pg-2",
    label: "PG Semester-2",
    num: 2,
    roman: "II",
    paperKey: "PG-2",
    exactSlugs: ["pg-semester-ii", "pg-semester-2"],
    titleRegex: /\b(pg[-_\s]*semester[-_\s]*2\b|pg[-_\s]*semester[-_\s]*ii\b)/i,
    negativeRegex: /\b(iii|iv|3|4)\b/i,
  },
  {
    id: "pg-3",
    label: "PG Semester-3",
    num: 3,
    roman: "III",
    paperKey: "PG-3",
    exactSlugs: [
      "ma-%e0%a4%95%e0%a4%be-%e0%a4%a8%e0%a5%8b%e0%a4%9f%e0%a5%8d%e0%a4%b8-semester3",
      "pg-semester-iii",
      "pg-semester-3",
    ],
    titleRegex: /\b(pg[-_\s]*semester[-_\s]*3\b|pg[-_\s]*semester[-_\s]*iii\b|ma.*semester[-_\s]*3)/i,
    negativeRegex: /\b(iv|4)\b/i,
  },
  {
    id: "pg-4",
    label: "PG Semester-4",
    num: 4,
    roman: "IV",
    paperKey: "PG-4",
    exactSlugs: ["pg-semester-iv", "pg-semester-4"],
    titleRegex: /\b(pg[-_\s]*semester[-_\s]*4\b|pg[-_\s]*semester[-_\s]*iv\b)/i,
    negativeRegex: null,
  },
];

export default function UniversityNotesPage() {
  const router = useRouter();

  const [activeDegree, setActiveDegree] = useState("ug");
  const [activeSemester, setActiveSemester] = useState("ug-1");
  const [searchQuery, setSearchQuery] = useState("");

  const [allPages, setAllPages] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState("Download Notes PDF");
  const [activePostId, setActivePostId] = useState(null);

  const openDownloadModal = (title, postId) => {
    setModalAction(title);
    setActivePostId(postId);
    setModalOpen(true);
  };

  useEffect(() => {
    if (activeDegree === "ug") {
      setActiveSemester("ug-1");
    } else {
      setActiveSemester("pg-1");
    }
  }, [activeDegree]);

  useEffect(() => {
    async function fetchAllWordPressData() {
      const wpUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL || "https://www.geographynotespdf.com";
      setDataLoading(true);

      try {
        const [pagesRes, postsRes] = await Promise.allSettled([
          fetch(`${wpUrl}/wp-json/wp/v2/pages?per_page=100&_embed`),
          fetch(
            `${wpUrl}/wp-json/wp/v2/posts?_fields=id,date,title,excerpt,slug,acf,_links,_embed&_embed=wp:term&per_page=100`
          ),
        ]);

        const rawPages = pagesRes.status === "fulfilled" && pagesRes.value.ok ? await pagesRes.value.json() : [];
        const rawPosts = postsRes.status === "fulfilled" && postsRes.value.ok ? await postsRes.value.json() : [];

        setAllPages(Array.isArray(rawPages) ? rawPages : []);

        if (Array.isArray(rawPosts)) {
          const formattedPosts = rawPosts.map((p) => {
            const title = p.title?.rendered || "";
            const excerpt = p.excerpt?.rendered?.replace(/<[^>]+>/g, "").trim() || "";
            return {
              id: p.id,
              title: title,
              excerpt: excerpt,
              slug: p.slug || "",
              date: new Date(p.date).toLocaleDateString("en-US", { month: "short", year: "numeric" }),
              corpus: `${title} ${excerpt} ${p.slug || ""}`.toLowerCase(),
            };
          });
          setAllPosts(formattedPosts);
        }
      } catch (err) {
        console.error("Error connecting to WordPress REST API:", err);
      } finally {
        setDataLoading(false);
      }
    }

    fetchAllWordPressData();
  }, []);

  const activeSemList = activeDegree === "ug" ? UG_SEMESTERS : PG_SEMESTERS;
  const currentSemConfig = activeSemList.find((s) => s.id === activeSemester) || activeSemList[0];

  // Helper to sanitize WordPress HTML and rewrite all external links to Next.js routes
  function cleanAndRewriteWordPressLinks(html) {
    if (!html) return "";

    return html.replace(
      /href=["'](https?:\/\/(?:www\.|api\.)?geographynotespdf\.com)?\/([^"'#\s>]+)\/?["']/gi,
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
          return `href="/${cleanPath}"`;
        }
        return `href="/read/${encodeURIComponent(cleanPath)}"`;
      }
    );
  }

  const activeSyllabusPage = useMemo(() => {
    if (!allPages || allPages.length === 0) return null;

    const isUG = activeDegree === "ug";

    for (const targetSlug of currentSemConfig.exactSlugs) {
      const slugMatch = allPages.find((pg) => {
        const pgSlug = (pg.slug || "").toLowerCase();
        return pgSlug === targetSlug.toLowerCase() || decodeURIComponent(pgSlug) === decodeURIComponent(targetSlug);
      });
      if (slugMatch) {
        return {
          id: slugMatch.id,
          title: slugMatch.title?.rendered || currentSemConfig.label,
          content: cleanAndRewriteWordPressLinks(slugMatch.content?.rendered || ""),
        };
      }
    }

    const regexMatch = allPages.find((pg) => {
      const slug = (pg.slug || "").toLowerCase();
      const title = (pg.title?.rendered || "").toLowerCase();
      const textToTest = `${slug} ${title}`;

      const isPostPG = slug.startsWith("pg-") || slug.startsWith("ma-") || title.includes("pg ") || title.includes("m.a");
      if (isUG && isPostPG) return false;
      if (!isUG && !isPostPG) return false;

      const hasPositive = currentSemConfig.titleRegex.test(textToTest);
      if (!hasPositive) return false;

      if (currentSemConfig.negativeRegex && currentSemConfig.negativeRegex.test(textToTest)) {
        return false;
      }

      return true;
    });

    if (regexMatch) {
      return {
        id: regexMatch.id,
        title: regexMatch.title?.rendered || currentSemConfig.label,
        content: cleanAndRewriteWordPressLinks(regexMatch.content?.rendered || ""),
      };
    }

    return null;
  }, [allPages, currentSemConfig, activeDegree]);

  const semesterNotes = useMemo(() => {
    if (!allPosts || allPosts.length === 0) return [];

    return allPosts.filter((p) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch = q === "" || p.corpus.includes(q);

      const hasPositive = currentSemConfig.titleRegex.test(p.corpus);
      const passesNegative = !currentSemConfig.negativeRegex || !currentSemConfig.negativeRegex.test(p.corpus);

      const matchesSemester = hasPositive && passesNegative;
      return matchesSearch && (matchesSemester || q !== "");
    });
  }, [allPosts, currentSemConfig, searchQuery]);

  // Global click interception: Catches ANY link clicked inside the syllabus content
  const handleContentClick = (e) => {
    const targetLink = e.target.closest("a");
    if (!targetLink) return;

    const href = targetLink.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;

    e.preventDefault();

    let cleanPath = href
      .replace(/^https?:\/\/(?:www\.|api\.)?geographynotespdf\.com\/?/i, "")
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
      router.push(`/${cleanPath}`);
      return;
    }

    router.push(`/read/${encodeURIComponent(cleanPath)}`);
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

      {/* Top Header */}
      <header className="w-full bg-[#E5E7EB]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 pt-5 pb-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-full overflow-hidden border border-gray-300 flex-shrink-0 bg-white shadow-xs">
              <Image src="/images/logo.jpeg" alt="Logo" fill sizes="48px" className="object-cover" priority />
            </div>
            <div>
              <h1 className="text-2xl md:text-[26px] font-black tracking-tight text-[#111827]">
                Unique Geography Notes
              </h1>
              <span className="text-[13px] font-medium text-slate-500">Curated by University Faculty</span>
            </div>
          </Link>

          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search topic, paper or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white text-xs pl-10 pr-4 py-2.5 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#E5A83B]"
            />
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          </div>
        </div>

        {/* Global Navigation Bar */}
        <nav className="border-t border-b border-gray-300 bg-[#DFE2E8]">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 flex items-center gap-8 overflow-x-auto text-[14px] font-medium text-slate-900">
            <Link href="/" className="py-3 px-1 hover:text-black whitespace-nowrap">Home</Link>
            <Link href="/category/upsc" className="py-3 px-1 hover:text-black whitespace-nowrap">UPSC &amp; PSC</Link>
            <Link href="/category/school" className="py-3 px-1 hover:text-black whitespace-nowrap">School Notes</Link>
            <Link href="/category/exams" className="py-3 px-1 hover:text-black whitespace-nowrap">Exams (CTET, UGC-NET)</Link>
            <div className="relative py-3 flex flex-col items-center">
              <Link href="/category/university" className="font-bold text-slate-950 px-1 whitespace-nowrap">University Notes</Link>
              <span className="absolute bottom-0 left-1 right-1 h-[2.5px] bg-[#E5A83B] rounded-full" />
            </div>
            <Link href="/category/gc" className="py-3 px-1 hover:text-black whitespace-nowrap">GC</Link>
          </div>
        </nav>
      </header>

      {/* Select Degree Level */}
      <section className="bg-[#CFD4DC] border-b border-gray-300 py-3">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 flex items-center gap-3">
          <span className="text-xs font-black text-slate-700 uppercase tracking-wider">Level:</span>
          <div className="inline-flex p-1 bg-white/80 rounded-xl border border-gray-300 shadow-sm gap-1">
            {DEGREE_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveDegree(tab.id)}
                className={`text-xs font-bold px-5 py-2 rounded-lg transition cursor-pointer ${
                  activeDegree === tab.id ? "bg-[#0B2545] text-white shadow" : "text-slate-600 hover:text-black hover:bg-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Horizontal Strip for All Semesters */}
      <section className="border-b border-gray-300 bg-[#DFE2E8]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 flex items-center gap-3 sm:gap-6 overflow-x-auto text-[13px] font-semibold text-slate-700">
          {activeSemList.map((sem) => (
            <button
              key={sem.id}
              onClick={() => setActiveSemester(sem.id)}
              className={`py-3.5 px-2 whitespace-nowrap transition cursor-pointer ${
                activeSemester === sem.id
                  ? "border-b-2 border-[#E5A83B] text-slate-950 font-bold"
                  : "hover:text-black"
              }`}
            >
              {sem.label}
            </button>
          ))}
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 py-8 w-full flex-1">

        {/* 1. Live Syllabus Display Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-gray-200 mb-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 mb-6 border-b border-gray-100 gap-3">
            <div>
              <span className="text-[11px] font-extrabold text-[#B45309] uppercase tracking-wider block">
                Official UGC / CBCS Curriculum
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                {currentSemConfig.label} Syllabus &amp; Topics
              </h2>
            </div>
            <button
              onClick={() => openDownloadModal(activeSyllabusPage?.title || `${currentSemConfig.label} Syllabus`, activeSyllabusPage?.id)}
              className="bg-[#0B2545] hover:bg-slate-900 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer shadow-xs whitespace-nowrap"
            >
              <Download className="w-4 h-4 text-amber-400" /> Save Full Syllabus PDF
            </button>
          </div>

          {dataLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin text-[#E5A83B] mb-3" />
              <p className="text-xs font-semibold">Loading syllabus from WordPress...</p>
            </div>
          ) : !activeSyllabusPage ? (
            <div className="py-12 text-center text-slate-500">
              <BookOpen className="w-10 h-10 text-amber-500/50 mb-2 mx-auto" />
              <p className="text-xs font-bold text-slate-800">
                Syllabus outline for {currentSemConfig.label} is currently synchronizing.
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                You can download the semester notes and study material modules directly below.
              </p>
            </div>
          ) : (
            <div
              onClick={handleContentClick}
              className="prose max-w-none text-slate-800 leading-relaxed
                [&_a]:text-blue-600 [&_a]:font-semibold [&_a:hover]:underline [&_a]:cursor-pointer
                [&_h1]:text-xl [&_h1]:font-black [&_h1]:text-slate-900 [&_h1]:mb-3
                [&_h2]:text-lg [&_h2]:font-extrabold [&_h2]:text-slate-900 [&_h2]:mt-5 [&_h2]:mb-2
                [&_h3]:text-sm [&_h3]:font-bold [&_h3]:text-[#DC2626] [&_h3]:mt-4 [&_h3]:mb-1.5
                [&_ul]:list-square [&_ul]:pl-6 [&_ul]:my-2 [&_li]:my-1.5 [&_li]:text-xs sm:[&_li]:text-sm
                [&_img]:rounded-xl [&_img]:shadow-xs [&_img]:my-3 [&_img]:mx-auto"
              dangerouslySetInnerHTML={{ __html: activeSyllabusPage.content }}
            />
          )}
        </div>

        {/* 2. Downloadable Notes List at Bottom */}
        <section className="w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-2">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Downloadable PDF Study Material ({currentSemConfig.label})
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Offline notes, chapter summaries, and university exam solutions.
              </p>
            </div>
          </div>

          {dataLoading ? (
            <div className="bg-white rounded-3xl p-14 flex flex-col items-center justify-center text-slate-500 border border-gray-200">
              <Loader2 className="w-6 h-6 animate-spin text-[#E5A83B] mb-2" />
              <p className="text-xs font-semibold">Loading notes catalog...</p>
            </div>
          ) : semesterNotes.length === 0 ? (
            <div className="bg-white/80 rounded-3xl p-12 text-center text-slate-500 border border-gray-200">
              <FileText className="w-10 h-10 text-amber-500/50 mb-2 mx-auto" />
              <h4 className="font-bold text-sm text-slate-800">All Topics Linked in Syllabus Above</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Tap on any topic heading in the syllabus above to view and download the note as a PDF.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {semesterNotes.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 flex flex-col justify-between hover:shadow-md transition"
                >
                  <div>
                    <span className="inline-block bg-[#FEF3C7] text-[#B45309] text-[10px] font-extrabold px-2.5 py-0.5 rounded mb-2 border border-amber-200">
                      {currentSemConfig.label}
                    </span>

                    <h4
                      className="font-extrabold text-sm sm:text-base text-slate-900 leading-snug mb-2 line-clamp-2"
                      dangerouslySetInnerHTML={{ __html: item.title }}
                    />

                    {item.excerpt && (
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                        {item.excerpt}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100">
                    <Link
                      href={`/read/${item.id}`}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 transition"
                    >
                      <Eye className="w-3.5 h-3.5" /> Read
                    </Link>

                    <button
                      onClick={() => openDownloadModal(item.title, item.id)}
                      className="bg-[#E5A83B] hover:bg-[#d49425] text-slate-950 font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" /> Download PDF
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