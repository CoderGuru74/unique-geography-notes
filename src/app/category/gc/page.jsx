"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, Eye, Download, Loader2, FileText } from "lucide-react";
import Navbar from "../../../components/Navbar";
import AuthModal from "../../../components/AuthModal";

// Exactly matching the 3 original sections from the old website
const GC_SECTIONS = [
  {
    id: "bharat-bhugol",
    label: "1. भारत का भूगोल",
    enLabel: "Geography of India",
    slugPatterns: [
      "bharat-ka-bhugol",
      "geography-of-india",
      "indian-geography",
      "bharat-bhugol",
      "bharat"
    ],
    keywords: ["भारत का भूगोल", "भारतीय भूगोल", "geography of india", "indian geography"],
  },
  {
    id: "general-geography",
    label: "General Geography",
    enLabel: "General Geography",
    slugPatterns: [
      "general-geography",
      "samanya-bhugol",
      "basic-geography",
      "physical-geography"
    ],
    keywords: ["general geography", "सामान्य भूगोल", "भौतिक भूगोल"],
  },
  {
    id: "samanya-adhyayan",
    label: "3. सामान्य अध्ययन",
    enLabel: "General Studies (GS)",
    slugPatterns: [
      "samanya-adhyayan",
      "general-studies",
      "gs-notes",
      "gk-gs",
      "general-competition"
    ],
    keywords: ["सामान्य अध्ययन", "general studies", "gk", "gs"],
  },
];

// Noise and draft filter to prevent test posts from polluting production
const JUNK_DRAFT_PATTERNS = [
  "ctet child pedo",
  "plate tectonics (test)",
  "ewfewafwaefweee",
  "ppu pg semester",
  "ppu ug semester",
  "mjc-",
  "mic-",
  "ug regular semester",
  "pg regular semester",
];

export default function GCPage() {
  const router = useRouter();

  const [activeSection, setActiveSection] = useState("bharat-bhugol");
  const [searchQuery, setSearchQuery] = useState("");

  const [allPages, setAllPages] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  const [selectedPageIndex, setSelectedPageIndex] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState("Download GC Notes PDF");
  const [activePostId, setActivePostId] = useState(null);

  const openDownloadModal = (title, postId) => {
    setModalAction(title);
    setActivePostId(postId);
    setModalOpen(true);
  };

  useEffect(() => {
    let isMounted = true;

    async function fetchGCWordPressData() {
      const baseDomain = (
        process.env.NEXT_PUBLIC_WORDPRESS_URL || "https://www.geographynotespdf.com"
      ).replace(/\/+$/, "");

      setDataLoading(true);

      try {
        let pagesData = [];
        let postsData = [];

        // 1. Safe Pages Fetch
        try {
          const pagesRes = await fetch(`${baseDomain}/wp-json/wp/v2/pages?per_page=100&_embed`);
          if (pagesRes.ok) {
            pagesData = await pagesRes.json();
          }
        } catch (e) {
          console.warn("Could not fetch GC pages from WordPress:", e.message);
        }

        // 2. Safe Posts Fetch
        try {
          const postsRes = await fetch(
            `${baseDomain}/wp-json/wp/v2/posts?_fields=id,date,title,excerpt,content,slug,acf,_links,_embed&_embed=wp:term&per_page=100`
          );
          if (postsRes.ok) {
            postsData = await postsRes.json();
          }
        } catch (e) {
          console.warn("Could not fetch GC posts from WordPress:", e.message);
        }

        if (!isMounted) return;

        setAllPages(Array.isArray(pagesData) ? pagesData : []);

        if (Array.isArray(postsData)) {
          const formattedPosts = postsData
            .filter((p) => {
              const rawTitle = (p.title?.rendered || "").toLowerCase();
              const rawSlug = (p.slug || "").toLowerCase();
              const fullCheck = `${rawTitle} ${rawSlug}`;
              
              // Filter out drafts or university question papers
              const isJunk = JUNK_DRAFT_PATTERNS.some((junk) => fullCheck.includes(junk));
              return !isJunk;
            })
            .map((p) => {
              const title = p.title?.rendered || "";
              const excerpt = p.excerpt?.rendered?.replace(/<[^>]+>/g, "").trim() || "";
              return {
                id: p.id,
                title: title,
                excerpt: excerpt,
                content: p.content?.rendered || "",
                slug: p.slug || "",
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
        console.error("General error loading GC data:", err);
      } finally {
        if (isMounted) setDataLoading(false);
      }
    }

    fetchGCWordPressData();

    return () => {
      isMounted = false;
    };
  }, []);

  const currentSectionConfig =
    GC_SECTIONS.find((s) => s.id === activeSection) || GC_SECTIONS[0];

  useEffect(() => {
    setSelectedPageIndex(0);
  }, [activeSection]);

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

  // Find all WordPress Pages corresponding to the selected section
  const sectionPages = useMemo(() => {
    if (!allPages || allPages.length === 0) return [];

    return allPages
      .filter((pg) => {
        const slug = (pg.slug || "").toLowerCase();
        const title = (pg.title?.rendered || "").toLowerCase();
        const fullText = `${slug} ${title}`;

        const matchesPattern = currentSectionConfig.slugPatterns.some((pattern) =>
          fullText.includes(pattern.toLowerCase())
        );

        const matchesKeyword = currentSectionConfig.keywords.some((kw) =>
          fullText.includes(kw.toLowerCase())
        );

        return matchesPattern || matchesKeyword;
      })
      .map((pg) => ({
        id: pg.id,
        title: pg.title?.rendered || currentSectionConfig.label,
        slug: pg.slug || "",
        content: cleanAndRewriteWordPressLinks(pg.content?.rendered || ""),
      }));
  }, [allPages, currentSectionConfig]);

  const activePage = sectionPages[selectedPageIndex] || sectionPages[0] || null;

  // Filter posts relevant to this section
  const filteredPosts = useMemo(() => {
    if (!allPosts || allPosts.length === 0) return [];

    return allPosts.filter((p) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch = q === "" || p.corpus.includes(q);

      const matchesKeyword = currentSectionConfig.keywords.some((kw) =>
        p.corpus.includes(kw.toLowerCase())
      );
      const matchesPattern = currentSectionConfig.slugPatterns.some((pattern) =>
        p.corpus.includes(pattern.toLowerCase())
      );

      return matchesSearch && (matchesKeyword || matchesPattern);
    });
  }, [allPosts, currentSectionConfig, searchQuery]);

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

      {/* Global Navbar */}
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {/* Sub-header Banner */}
      <section className="bg-[#CFD4DC] border-b border-gray-300 py-3">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-700 uppercase tracking-wider">Category:</span>
            <span className="text-xs font-bold text-slate-900 bg-white/80 px-3 py-1 rounded-lg border border-gray-300 shadow-xs">
              General Competition (SSC, Railway, Banking, BPSC, Police &amp; All One-Day Exams)
            </span>
          </div>
          <span className="text-xs font-semibold text-slate-600 bg-white/50 px-3 py-1 rounded-full border border-gray-300 hidden sm:inline">
            Fast Track Revision &amp; Static GS
          </span>
        </div>
      </section>

      {/* The 3 Section Buttons from the Old Website */}
      <section className="border-b border-gray-300 bg-[#DFE2E8]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 flex items-center gap-3 overflow-x-auto text-[13px] font-semibold text-slate-700 py-2">
          {GC_SECTIONS.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`py-2.5 px-5 rounded-xl whitespace-nowrap transition cursor-pointer font-bold ${
                activeSection === section.id
                  ? "bg-[#0B2545] text-white shadow-xs"
                  : "bg-white/70 text-slate-800 hover:bg-white hover:text-black border border-gray-300/80"
              }`}
            >
              {section.label}
            </button>
          ))}
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 py-8 w-full flex-1">
        {/* If multiple WordPress pages exist under this section, show page tabs */}
        {sectionPages.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto mb-4 pb-2">
            <span className="text-xs font-black text-slate-600 uppercase tracking-wider whitespace-nowrap">
              पेज चुनें:
            </span>
            {sectionPages.map((pg, idx) => (
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

        {/* 1. Live WordPress Page Content (Only shows when client has published a page for it) */}
        {activePage && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-gray-200 mb-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 mb-6 border-b border-gray-100 gap-3">
              <div>
                <span className="text-[11px] font-extrabold text-[#B45309] uppercase tracking-wider block">
                  General Competition • {currentSectionConfig.enLabel}
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
                    activePage.title || `${currentSectionConfig.label} Notes`,
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

        {/* 2. Downloadable Notes List for the Selected Section */}
        <section className="w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-2">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {currentSectionConfig.label} — उपलब्ध नोट्स एवं PDFs
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {filteredPosts.length} study units and PDFs ready for download.
              </p>
            </div>
          </div>

          {dataLoading ? (
            <div className="bg-white rounded-3xl p-14 flex flex-col items-center justify-center text-slate-500 border border-gray-200">
              <Loader2 className="w-6 h-6 animate-spin text-[#E5A83B] mb-2" />
              <p className="text-xs font-semibold">Loading materials from server...</p>
            </div>
          ) : filteredPosts.length === 0 && !activePage ? (
            <div className="bg-white/80 rounded-3xl p-12 text-center text-slate-500 border border-gray-200">
              <FileText className="w-10 h-10 text-amber-500/50 mb-2 mx-auto" />
              <h4 className="font-bold text-sm text-slate-800">
                इस सेक्शन के पेजेस और नोट्स WordPress पर अपलोड किए जा रहे हैं।
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                You can create and publish new Pages or Posts under this topic in WordPress Admin anytime.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredPosts.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 flex flex-col justify-between hover:shadow-md transition"
                >
                  <div>
                    <span className="inline-block bg-[#FEF3C7] text-[#B45309] text-[10px] font-extrabold px-2.5 py-0.5 rounded mb-2 border border-amber-200">
                      {currentSectionConfig.label}
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