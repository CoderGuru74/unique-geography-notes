"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Globe, Home, ChevronRight, Loader2, BookOpen, Download, FileText, CheckCircle } from "lucide-react";
import AuthModal from "../../../../components/AuthModal";

const SEMESTER_CONFIG = {
  "sem-1": {
    slug: "ug-semester-i-academic-notes",
    title: "1. UG Semester-I Academic Notes",
    paperName: "MJC-1 / MIC-1 Geomorphology",
  },
  "ug-1": {
    slug: "ug-semester-i-academic-notes",
    title: "1. UG Semester-I Academic Notes",
    paperName: "MJC-1 / MIC-1 Geomorphology",
  },
  "sem-2": {
    slug: "ug-semester-ii-academic-notes",
    title: "2. UG Semester-II Academic Notes",
    paperName: "MJC-2 Climatology & Oceanography",
  },
  "ug-2": {
    slug: "ug-semester-ii-academic-notes",
    title: "2. UG Semester-II Academic Notes",
    paperName: "MJC-2 Climatology & Oceanography",
  },
  "sem-3": {
    slug: "ug-semester-iii-academic-notes",
    title: "3. UG Semester-III Academic Notes",
    paperName: "MJC-3 Human Geography",
  },
  "ug-3": {
    slug: "ug-semester-iii-academic-notes",
    title: "3. UG Semester-III Academic Notes",
    paperName: "MJC-3 Human Geography",
  },
  "sem-4": {
    slug: "ug-semester-iv-academic-notes",
    title: "4. UG Semester-IV Academic Notes",
    paperName: "MJC-4 Economic Geography",
  },
  "ug-4": {
    slug: "ug-semester-iv-academic-notes",
    title: "4. UG Semester-IV Academic Notes",
    paperName: "MJC-4 Economic Geography",
  },
};

const SIDEBAR_ITEMS = [
  { label: "BPSC TEACHER", href: "/category/exams", color: "text-[#B91C1C]" },
  { label: "वैकल्पिक भूगोल (Optional Geography)", href: "/category/upsc", color: "text-[#7E22CE]" },
  { label: "बिहार का भूगोल (Bihar Geography)", href: "/category/school/bseb", color: "text-[#047857]" },
  { label: "RESEARCH METHODOLOGY", href: "/category/university", color: "text-[#A16207]" },
  { label: "UGC-NET/JRF Paper 2", href: "/category/exams", color: "text-[#65A30D]" },
  { label: "Remote Sensing and GIS", href: "/category/university", color: "text-[#DC2626]" },
  { label: "SOLVED UGC NET/JRF PAPERS", href: "/category/exams", color: "text-[#0D9488]" },
  { label: "KVS, NVS, TGT, PGT & STET", href: "/category/exams", color: "text-[#4F46E5]" },
];

export default function SemesterPage({ params }) {
  const resolvedParams = use(params);
  const semKey = resolvedParams.sem || "sem-1";
  const router = useRouter();

  const currentConfig = SEMESTER_CONFIG[semKey] || SEMESTER_CONFIG["sem-1"];

  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    async function fetchOriginalPage() {
      const wpUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL || "https://www.geographynotespdf.com";
      setLoading(true);

      try {
        let res = await fetch(`${wpUrl}/wp-json/wp/v2/pages?slug=${currentConfig.slug}&_embed`);
        let pages = res.ok ? await res.json() : [];

        if (!Array.isArray(pages) || pages.length === 0) {
          res = await fetch(`${wpUrl}/wp-json/wp/v2/pages?search=${encodeURIComponent(currentConfig.title)}&per_page=1`);
          pages = res.ok ? await res.json() : [];
        }

        if (Array.isArray(pages) && pages.length > 0) {
          const raw = pages[0];
          let html = raw.content?.rendered || "";

          // Rewrite WordPress site links into Next.js reading routes
          html = html.replace(
            /href=["']https?:\/\/(www\.)?geographynotespdf\.com\/([^"'#\s>]+)\/?["']/gi,
            (match, p1, path) => {
              const cleanPath = path.replace(/^\/+|\/+$/g, "");
              if (cleanPath.startsWith("category/")) return `href="/${cleanPath}"`;
              return `href="/read/${encodeURIComponent(cleanPath)}"`;
            }
          );

          setPageData({
            id: raw.id,
            title: raw.title?.rendered || currentConfig.title,
            content: html,
          });
        }
      } catch (err) {
        console.error("Failed to load semester page from WordPress:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchOriginalPage();
  }, [currentConfig]);

  // Click handler to redirect smoothly inside Next.js router
  const handleLinkClick = (e) => {
    const linkEl = e.target.closest("a");
    if (!linkEl) return;

    const href = linkEl.getAttribute("href");
    if (!href) return;

    if (href.startsWith("/read/") || href.startsWith("/category/")) {
      e.preventDefault();
      router.push(href);
    } else if (href.includes("geographynotespdf.com")) {
      e.preventDefault();
      const slug = href.replace(/https?:\/\/(www\.)?geographynotespdf\.com\/?/, "").replace(/^\/+|\/+$/g, "");
      router.push(`/read/${encodeURIComponent(slug)}`);
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-[#F3F4F6] font-sans text-slate-900">
      <AuthModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        targetAction={pageData?.title || currentConfig.title}
        postId={pageData?.id}
        contentElementId="semester-printable-body"
      />

      {/* Hero Header with Nature & Globe Banner */}
      <section className="relative w-full h-[220px] sm:h-[260px] bg-slate-900 flex flex-col justify-center items-center text-center px-4 overflow-hidden">
        <Image
          src="/images/banner.jpg"
          alt="Semester Banner"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/70 to-slate-950/85" />

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          <div className="flex items-center gap-3 mb-2 text-white">
            <Globe className="w-8 h-8 sm:w-10 sm:h-10 text-sky-400 drop-shadow flex-shrink-0" />
            <h1
              className="text-2xl sm:text-4xl font-extrabold tracking-tight"
              dangerouslySetInnerHTML={{ __html: pageData?.title || currentConfig.title }}
            />
          </div>

          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-300 font-medium">
            <Link href="/" className="hover:text-white flex items-center gap-1 transition">
              <Home className="w-3.5 h-3.5" /> Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <Link href="/category/university" className="hover:text-white transition">
              University Notes
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-amber-400 font-semibold">{currentConfig.title}</span>
          </div>
        </div>
      </section>

      {/* Main Two-Column View */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 py-8 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column: Real WordPress Page Content */}
          <div className="lg:col-span-8 bg-white rounded-2xl p-6 sm:p-10 shadow-sm border border-gray-200">
            {loading ? (
              <div className="py-24 flex flex-col items-center justify-center text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin text-[#E5A83B] mb-3" />
                <p className="text-xs font-semibold">Loading original syllabus page...</p>
              </div>
            ) : !pageData ? (
              <div className="py-16 text-center text-slate-500">
                <BookOpen className="w-12 h-12 text-amber-500/50 mb-3 mx-auto" />
                <h3 className="font-bold text-base text-slate-800 mb-1">Content Unavailable</h3>
                <p className="text-xs text-slate-500 mb-4">Could not load syllabus content from server.</p>
                <Link
                  href="/category/university"
                  className="px-4 py-2 bg-[#0B2545] text-white text-xs font-bold rounded-xl inline-block"
                >
                  Return to University Notes
                </Link>
              </div>
            ) : (
              <div>
                {/* Notice Strip */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 mb-6 flex items-center justify-between text-xs text-blue-900">
                  <span className="font-medium">
                    Tap on any topic below to open its dedicated study notes.
                  </span>
                  <button
                    onClick={() => setModalOpen(true)}
                    className="bg-[#0B2545] hover:bg-slate-900 text-white font-bold px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-400" /> Save Page PDF
                  </button>
                </div>

                {/* Rendered WordPress HTML */}
                <div
                  id="semester-printable-body"
                  onClick={handleLinkClick}
                  className="prose max-w-none text-slate-800 leading-relaxed
                    [&_a]:text-blue-600 [&_a]:font-semibold [&_a:hover]:underline [&_a]:cursor-pointer
                    [&_h1]:text-2xl [&_h1]:font-black [&_h1]:text-slate-900 [&_h1]:mb-4
                    [&_h2]:text-xl [&_h2]:font-extrabold [&_h2]:text-slate-900 [&_h2]:mt-6 [&_h2]:mb-3
                    [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-[#DC2626] [&_h3]:mt-4 [&_h3]:mb-2
                    [&_ul]:list-square [&_ul]:pl-6 [&_ul]:my-3 [&_li]:my-2 [&_li]:text-sm
                    [&_img]:rounded-xl [&_img]:shadow-xs [&_img]:my-4 [&_img]:mx-auto"
                  dangerouslySetInnerHTML={{ __html: pageData.content }}
                />

                {/* Bottom PDF Download Card */}
                <div className="mt-10 pt-8 border-t border-gray-200">
                  <div className="bg-[#FFFBEB] border border-amber-300 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-xl bg-[#E5A83B]/20 text-[#B45309] flex items-center justify-center flex-shrink-0">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm sm:text-base text-slate-900">
                          Download All Notes for {currentConfig.title}
                        </h4>
                        <p className="text-xs text-slate-600 mt-0.5">
                          Compiled theory units, practical scales, diagrams &amp; solutions in a single PDF.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setModalOpen(true)}
                      className="bg-[#E5A83B] hover:bg-[#d49425] text-slate-950 font-bold text-xs px-6 py-3 rounded-xl transition shadow flex items-center gap-2 whitespace-nowrap cursor-pointer"
                    >
                      <Download className="w-4 h-4" /> Download Notes PDF
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Portal Navigation Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
                Quick Category Portals
              </h4>
              <div className="space-y-2.5">
                {SIDEBAR_ITEMS.map((item, i) => (
                  <Link
                    key={i}
                    href={item.href}
                    className={`block w-full py-2.5 px-4 rounded-xl border border-gray-200/80 bg-slate-50/70 hover:bg-white hover:border-amber-400 hover:shadow-xs text-center font-bold text-xs sm:text-[13px] transition ${item.color}`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="bg-[#0B2545] text-white rounded-2xl p-6 shadow-sm">
              <h4 className="font-bold text-sm text-amber-400 mb-2">Need Help Finding a Unit?</h4>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                You can browse all semesters directly or search any topic across the university curriculum.
              </p>
              <Link
                href="/category/university"
                className="inline-block w-full text-center bg-white hover:bg-slate-100 text-[#0B2545] font-bold text-xs py-2.5 rounded-xl transition"
              >
                Browse All Semesters
              </Link>
            </div>
          </aside>

        </div>
      </div>
    </main>
  );
}