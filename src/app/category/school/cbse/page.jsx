"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, BookOpen, Eye, Download, Loader2, FileText } from "lucide-react";
import AuthModal from "../../../../components/AuthModal";

const CBSE_CLASSES = [
  {
    id: "class-12",
    label: "Class 12th Geography",
    num: 12,
    roman: "XII",
    exactSlugs: [
      "cbse-class-12-geography",
      "class-12-geography-notes",
      "class-12-geography",
      "ncert-class-12-geography"
    ],
    titleRegex: /\b(class[-_\s]*12\b|class[-_\s]*xii\b|12th\b)/i,
    negativeRegex: /\b(6|7|8|9|10|11|vi|vii|viii|ix|x|xi)\b/i,
  },
  {
    id: "class-11",
    label: "Class 11th Geography",
    num: 11,
    roman: "XI",
    exactSlugs: [
      "cbse-class-11-geography",
      "class-11-geography-notes",
      "class-11-geography",
      "ncert-class-11-geography"
    ],
    titleRegex: /\b(class[-_\s]*11\b|class[-_\s]*xi\b|11th\b)/i,
    negativeRegex: /\b(12|xii)\b/i,
  },
  {
    id: "class-10",
    label: "Class 10th Social Science",
    num: 10,
    roman: "X",
    exactSlugs: [
      "cbse-class-10-social-science",
      "class-10-geography",
      "class-10-social-science"
    ],
    titleRegex: /\b(class[-_\s]*10\b|class[-_\s]*x\b|10th\b)/i,
    negativeRegex: /\b(11|12|xi|xii)\b/i,
  },
  {
    id: "class-9",
    label: "Class 9th Social Science",
    num: 9,
    roman: "IX",
    exactSlugs: [
      "cbse-class-9-social-science",
      "class-9-geography",
      "class-9-social-science"
    ],
    titleRegex: /\b(class[-_\s]*9\b|class[-_\s]*ix\b|9th\b)/i,
    negativeRegex: /\b(10|11|12|x|xi|xii)\b/i,
  },
  {
    id: "class-8",
    label: "Class 8th Geography",
    num: 8,
    roman: "VIII",
    exactSlugs: ["cbse-class-8-geography", "class-8-geography"],
    titleRegex: /\b(class[-_\s]*8\b|class[-_\s]*viii\b|8th\b)/i,
    negativeRegex: null,
  },
  {
    id: "class-7",
    label: "Class 7th Geography",
    num: 7,
    roman: "VII",
    exactSlugs: ["cbse-class-7-geography", "class-7-geography"],
    titleRegex: /\b(class[-_\s]*7\b|class[-_\s]*vii\b|7th\b)/i,
    negativeRegex: /\b(8|viii)\b/i,
  },
  {
    id: "class-6",
    label: "Class 6th Geography",
    num: 6,
    roman: "VI",
    exactSlugs: ["cbse-class-6-geography", "class-6-geography"],
    titleRegex: /\b(class[-_\s]*6\b|class[-_\s]*vi\b|6th\b)/i,
    negativeRegex: /\b(7|8|vii|viii)\b/i,
  },
];

export default function CbsePage() {
  const router = useRouter();

  const [activeClass, setActiveClass] = useState("class-12");
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
    async function fetchCbseWordPressData() {
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
        console.error("Error fetching CBSE data from WordPress:", err);
      } finally {
        setDataLoading(false);
      }
    }

    fetchCbseWordPressData();
  }, []);

  const currentClassConfig = CBSE_CLASSES.find((c) => c.id === activeClass) || CBSE_CLASSES[0];

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

    for (const targetSlug of currentClassConfig.exactSlugs) {
      const slugMatch = allPages.find((pg) => {
        const pgSlug = (pg.slug || "").toLowerCase();
        return pgSlug === targetSlug.toLowerCase() || decodeURIComponent(pgSlug) === decodeURIComponent(targetSlug);
      });
      if (slugMatch) {
        return {
          id: slugMatch.id,
          title: slugMatch.title?.rendered || currentClassConfig.label,
          content: cleanAndRewriteWordPressLinks(slugMatch.content?.rendered || ""),
        };
      }
    }

    const regexMatch = allPages.find((pg) => {
      const slug = (pg.slug || "").toLowerCase();
      const title = (pg.title?.rendered || "").toLowerCase();
      const textToTest = `${slug} ${title}`;

      const isCbseOrNcert = textToTest.includes("cbse") || textToTest.includes("ncert") || textToTest.includes("class");
      if (!isCbseOrNcert) return false;

      const hasPositive = currentClassConfig.titleRegex.test(textToTest);
      if (!hasPositive) return false;

      if (currentClassConfig.negativeRegex && currentClassConfig.negativeRegex.test(textToTest)) {
        return false;
      }

      return true;
    });

    if (regexMatch) {
      return {
        id: regexMatch.id,
        title: regexMatch.title?.rendered || currentClassConfig.label,
        content: cleanAndRewriteWordPressLinks(regexMatch.content?.rendered || ""),
      };
    }

    return null;
  }, [allPages, currentClassConfig]);

  const classNotes = useMemo(() => {
    if (!allPosts || allPosts.length === 0) return [];

    return allPosts.filter((p) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch = q === "" || p.corpus.includes(q);

      const isSchool = p.corpus.includes("cbse") || p.corpus.includes("ncert") || p.corpus.includes("class");
      const hasPositive = currentClassConfig.titleRegex.test(p.corpus);
      const passesNegative = !currentClassConfig.negativeRegex || !currentClassConfig.negativeRegex.test(p.corpus);

      const matchesClass = isSchool && hasPositive && passesNegative;
      return matchesSearch && (matchesClass || q !== "");
    });
  }, [allPosts, currentClassConfig, searchQuery]);

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

      {/* Header */}
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
              <span className="text-[13px] font-medium text-slate-500">CBSE &amp; NCERT Curriculum Notes</span>
            </div>
          </Link>

          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search chapter, topic or book..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white text-xs pl-10 pr-4 py-2.5 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#E5A83B]"
            />
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="border-t border-b border-gray-300 bg-[#DFE2E8]">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 flex items-center gap-8 overflow-x-auto text-[14px] font-medium text-slate-900">
            <Link href="/" className="py-3 px-1 hover:text-black whitespace-nowrap">Home</Link>
            <Link href="/category/upsc" className="py-3 px-1 hover:text-black whitespace-nowrap">UPSC &amp; PSC</Link>
            <div className="relative py-3 flex flex-col items-center">
              <Link href="/category/school/cbse" className="font-bold text-slate-950 px-1 whitespace-nowrap">School Notes (CBSE)</Link>
              <span className="absolute bottom-0 left-1 right-1 h-[2.5px] bg-[#E5A83B] rounded-full" />
            </div>
            <Link href="/category/school/bseb" className="py-3 px-1 hover:text-black whitespace-nowrap">Bihar Board (BSEB)</Link>
            <Link href="/category/university" className="py-3 px-1 hover:text-black whitespace-nowrap">University Notes</Link>
            <Link href="/category/exams" className="py-3 px-1 hover:text-black whitespace-nowrap">Exams</Link>
          </div>
        </nav>
      </header>

      {/* Class Selector Strip */}
      <section className="border-b border-gray-300 bg-[#DFE2E8]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 flex items-center gap-3 sm:gap-6 overflow-x-auto text-[13px] font-semibold text-slate-700">
          {CBSE_CLASSES.map((cls) => (
            <button
              key={cls.id}
              onClick={() => setActiveClass(cls.id)}
              className={`py-3.5 px-2 whitespace-nowrap transition cursor-pointer ${
                activeClass === cls.id
                  ? "border-b-2 border-[#E5A83B] text-slate-950 font-bold"
                  : "hover:text-black"
              }`}
            >
              {cls.label}
            </button>
          ))}
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 py-8 w-full flex-1">

        {/* 1. Live Syllabus / Chapter Outline */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-gray-200 mb-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 mb-6 border-b border-gray-100 gap-3">
            <div>
              <span className="text-[11px] font-extrabold text-[#B45309] uppercase tracking-wider block">
                NCERT / CBSE Syllabus Outline
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                {currentClassConfig.label} Chapters &amp; Topics
              </h2>
            </div>
            <button
              onClick={() => openDownloadModal(activeSyllabusPage?.title || `${currentClassConfig.label} Syllabus`, activeSyllabusPage?.id)}
              className="bg-[#0B2545] hover:bg-slate-900 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer shadow-xs whitespace-nowrap"
            >
              <Download className="w-4 h-4 text-amber-400" /> Save Full Syllabus PDF
            </button>
          </div>

          {dataLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin text-[#E5A83B] mb-3" />
              <p className="text-xs font-semibold">Loading chapter outline from WordPress...</p>
            </div>
          ) : !activeSyllabusPage ? (
            <div className="py-12 text-center text-slate-500">
              <BookOpen className="w-10 h-10 text-amber-500/50 mb-2 mx-auto" />
              <p className="text-xs font-bold text-slate-800">
                Chapter syllabus outline for {currentClassConfig.label} is currently synchronizing.
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                You can download the chapter notes and revision modules directly below.
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

        {/* 2. Downloadable Notes List */}
        <section className="w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-2">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Downloadable PDF Chapter Notes ({currentClassConfig.label})
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Complete NCERT solutions, key points, and chapter summary PDFs.
              </p>
            </div>
          </div>

          {dataLoading ? (
            <div className="bg-white rounded-3xl p-14 flex flex-col items-center justify-center text-slate-500 border border-gray-200">
              <Loader2 className="w-6 h-6 animate-spin text-[#E5A83B] mb-2" />
              <p className="text-xs font-semibold">Loading chapter notes catalog...</p>
            </div>
          ) : classNotes.length === 0 ? (
            <div className="bg-white/80 rounded-3xl p-12 text-center text-slate-500 border border-gray-200">
              <FileText className="w-10 h-10 text-amber-500/50 mb-2 mx-auto" />
              <h4 className="font-bold text-sm text-slate-800">All Topics Linked in Outline Above</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Tap on any chapter or topic heading in the outline above to read and download the PDF.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {classNotes.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 flex flex-col justify-between hover:shadow-md transition"
                >
                  <div>
                    <span className="inline-block bg-[#FEF3C7] text-[#B45309] text-[10px] font-extrabold px-2.5 py-0.5 rounded mb-2 border border-amber-200">
                      {currentClassConfig.label}
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