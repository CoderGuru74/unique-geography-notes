"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Download, Loader2, GraduationCap, Home } from "lucide-react";
import Navbar from "../../../components/Navbar";
import AuthModal from "../../../components/AuthModal";

// Strict semester resolver that isolates Semester number from Paper/Unit/CC number
function checkStrictSemester(slug, title, targetSem, isPg = false) {
  const targetStr = String(targetSem);

  // Normalize delimiters into single spaces
  const cleanTitle = (title || "").toLowerCase().replace(/[-_/:(),.]/g, " ");
  const cleanSlug = (slug || "").toLowerCase().replace(/[-_/:(),.]/g, " ");
  const combined = `${cleanSlug} ${cleanTitle}`;

  // 1. If PG mode is requested, ensure post is clearly PG / MA / M.Sc
  if (isPg) {
    const isPgOrMa =
      combined.includes("pg") ||
      combined.includes("ma ") ||
      combined.includes("m a") ||
      cleanTitle.includes("m.a") ||
      combined.includes("m sc") ||
      combined.includes("post graduate") ||
      combined.includes("स्नातकोत्तर");

    if (!isPgOrMa) return false;
  }

  // 2. Identify the EXACT semester mentioned in the title/slug
  const extractSemester = (text) => {
    if (/\b(?:semester|sem|sm|सेमेस्टर)\s*(?:0?4|iv)\b/i.test(text)) return 4;
    if (/\b(?:semester|sem|sm|सेमेस्टर)\s*(?:0?3|iii)\b/i.test(text)) return 3;
    if (/\b(?:semester|sem|sm|सेमेस्टर)\s*(?:0?2|ii)\b/i.test(text)) return 2;
    if (/\b(?:semester|sem|sm|सेमेस्टर)\s*(?:0?1|i)\b/i.test(text)) return 1;
    if (/\b(?:semester|sem|sm|सेमेस्टर)\s*(?:0?5|v)\b/i.test(text)) return 5;
    if (/\b(?:semester|sem|sm|सेमेस्टर)\s*(?:0?6|vi)\b/i.test(text)) return 6;
    if (/\b(?:semester|sem|sm|सेमेस्टर)\s*(?:0?7|vii)\b/i.test(text)) return 7;
    if (/\b(?:semester|sem|sm|सेमेस्टर)\s*(?:0?8|viii)\b/i.test(text)) return 8;

    const prefixMatch = text.trim().match(/^([1-8])\s*\.\s*(?:ug|pg|ma|ba)/i);
    if (prefixMatch) return parseInt(prefixMatch[1], 10);

    return null;
  };

  const detectedSem = extractSemester(combined);

  if (detectedSem !== null) {
    return detectedSem === Number(targetStr);
  }

  if (!isPg) {
    const courseMatch = combined.match(/\b(?:mjc|mic|mdc)\s*0?([1-8])\b/i);
    if (courseMatch) {
      return parseInt(courseMatch[1], 10) === Number(targetStr);
    }
  }

  return false;
}

// UG Semester definitions
const UG_SEMESTERS = [
  {
    id: "ug-sem-1",
    label: "UG Semester-I",
    color: "bg-[#DC2626] hover:bg-[#B91C1C] text-white",
    matcher: (slug, title) => checkStrictSemester(slug, title, 1, false),
  },
  {
    id: "ug-sem-2",
    label: "UG Semester-II",
    color: "bg-[#2563EB] hover:bg-[#1D4ED8] text-white",
    matcher: (slug, title) => checkStrictSemester(slug, title, 2, false),
  },
  {
    id: "ug-sem-3",
    label: "UG Semester-III",
    color: "bg-[#16A34A] hover:bg-[#15803D] text-white",
    matcher: (slug, title) => checkStrictSemester(slug, title, 3, false),
  },
  {
    id: "ug-sem-4",
    label: "UG Semester-IV",
    color: "bg-[#8B5CF6] hover:bg-[#7C3AED] text-white",
    matcher: (slug, title) => checkStrictSemester(slug, title, 4, false),
  },
  {
    id: "ug-sem-5",
    label: "UG Semester-V",
    color: "bg-[#D97706] hover:bg-[#B45309] text-white",
    matcher: (slug, title) => checkStrictSemester(slug, title, 5, false),
  },
  {
    id: "ug-sem-6",
    label: "UG Semester-VI",
    color: "bg-[#0284C7] hover:bg-[#0369A1] text-white",
    matcher: (slug, title) => checkStrictSemester(slug, title, 6, false),
  },
  {
    id: "ug-sem-7",
    label: "UG Semester-VII",
    color: "bg-[#E11D48] hover:bg-[#BE123C] text-white",
    matcher: (slug, title) => checkStrictSemester(slug, title, 7, false),
  },
  {
    id: "ug-sem-8",
    label: "UG Semester-VIII",
    color: "bg-[#0D9488] hover:bg-[#0F766E] text-white",
    matcher: (slug, title) => checkStrictSemester(slug, title, 8, false),
  },
  {
    id: "ug-practical",
    label: "Practical Geography",
    color: "bg-[#475569] hover:bg-[#334155] text-white",
    matcher: (slug, title) => {
      const s = `${slug} ${title}`.toLowerCase();
      return s.includes("practical") || s.includes("प्रायोगिक");
    },
  },
];

// PG Semester definitions
const PG_SEMESTERS = [
  {
    id: "pg-sem-1",
    label: "PG Semester-I",
    color: "bg-[#DC2626] hover:bg-[#B91C1C] text-white",
    matcher: (slug, title) => checkStrictSemester(slug, title, 1, true),
  },
  {
    id: "pg-sem-2",
    label: "PG Semester-II",
    color: "bg-[#2563EB] hover:bg-[#1D4ED8] text-white",
    matcher: (slug, title) => checkStrictSemester(slug, title, 2, true),
  },
  {
    id: "pg-sem-3",
    label: "PG Semester-III",
    color: "bg-[#16A34A] hover:bg-[#15803D] text-white",
    matcher: (slug, title) => checkStrictSemester(slug, title, 3, true),
  },
  {
    id: "pg-sem-4",
    label: "PG Semester-IV",
    color: "bg-[#8B5CF6] hover:bg-[#7C3AED] text-white",
    matcher: (slug, title) => checkStrictSemester(slug, title, 4, true),
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

export default function UniversityCategoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read URL query parameters so shared links open exact Level and Semester
  const urlLevel = searchParams?.get("level")?.toUpperCase() || "UG";
  const urlSem = searchParams?.get("sem") || (urlLevel === "PG" ? "pg-sem-1" : "ug-sem-1");

  const [level, setLevel] = useState(urlLevel === "PG" ? "PG" : "UG");
  const [activeSemId, setActiveSemId] = useState(urlSem);

  const [allPages, setAllPages] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState("Download Syllabus PDF");
  const [activePostId, setActivePostId] = useState(null);

  // Keep state synchronized with URL query params
  useEffect(() => {
    const currentLvl = searchParams?.get("level")?.toUpperCase();
    const currentSem = searchParams?.get("sem");

    if (currentLvl === "PG" || currentLvl === "UG") {
      setLevel(currentLvl);
    }
    if (currentSem) {
      setActiveSemId(currentSem);
    }
  }, [searchParams]);

  const updateUrlParams = (newLevel, newSem) => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("level", newLevel.toLowerCase());
      url.searchParams.set("sem", newSem);
      window.history.replaceState({}, "", url.toString());
    }
  };

  const openDownloadModal = (title, postId) => {
    setModalAction(decodeHtmlEntities(title));
    setActivePostId(postId);
    setModalOpen(true);
  };

  const handleLevelChange = (newLevel) => {
    setLevel(newLevel);
    const defaultSem = newLevel === "UG" ? "ug-sem-1" : "pg-sem-1";
    setActiveSemId(defaultSem);
    updateUrlParams(newLevel, defaultSem);
  };

  const handleSemesterChange = (semId) => {
    setActiveSemId(semId);
    updateUrlParams(level, semId);
  };

  useEffect(() => {
    let isMounted = true;

    async function fetchUniversityData() {
      const baseDomain = (
        process.env.NEXT_PUBLIC_WORDPRESS_URL || "https://geographynotespdf.com/cms"
      ).replace(/\/+$/, "");

      setDataLoading(true);

      try {
        const pagesRes = await fetch(`${baseDomain}/wp-json/wp/v2/pages?per_page=100&_embed`);
        if (pagesRes.ok) {
          const pagesData = await pagesRes.json();
          if (isMounted) {
            setAllPages(Array.isArray(pagesData) ? pagesData : []);
          }
        }
      } catch (err) {
        console.error("Error loading university pages:", err);
      } finally {
        if (isMounted) setDataLoading(false);
      }
    }

    fetchUniversityData();

    return () => {
      isMounted = false;
    };
  }, []);

  const semesterList = level === "UG" ? UG_SEMESTERS : PG_SEMESTERS;
  const currentSemesterConfig =
    semesterList.find((s) => s.id === activeSemId) || semesterList[0];

  function cleanAndRewriteWordPressLinks(html) {
    if (!html) return "";

    const baseDomain = (
      process.env.NEXT_PUBLIC_WORDPRESS_URL || "https://geographynotespdf.com/cms"
    ).replace(/\/+$/, "");

    let cleaned = html
      .replace(
        /<div[^>]*class="[^"]*(?:quiz|question-box|exam-timer|old-payment|payment-box|razorpay-embed-btn)[^"]*"[^>]*>[\s\S]*?<\/div>/gi,
        ""
      )
      .replace(
        /<form[^>]*action="[^"]*(?:instamojo|paytm|rzp\.io|razorpay)[^"]*"[^>]*>[\s\S]*?<\/form>/gi,
        ""
      );

    return cleaned.replace(/href=["']([^"']+)["']/gi, (match, rawHref) => {
      const href = rawHref.trim();
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
        return match;
      }

      if (
        href.includes("/wp-content/uploads/") ||
        href.toLowerCase().endsWith(".pdf") ||
        href.includes(".pdf?")
      ) {
        if (href.startsWith("http")) {
          return `href="${href}" target="_blank" rel="noopener noreferrer"`;
        }
        const cleanUpload = href.replace(/^\/?(?:cms\/)?/, "");
        return `href="${baseDomain}/${cleanUpload}" target="_blank" rel="noopener noreferrer"`;
      }

      if (
        href.includes("drive.google.com") ||
        href.includes("docs.google.com") ||
        href.includes("mediafire.com") ||
        (href.startsWith("http") && !href.includes("geographynotespdf.com") && !href.includes("localhost"))
      ) {
        return `href="${href}" target="_blank" rel="noopener noreferrer"`;
      }

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

      if (cleanPath.startsWith("category/") || cleanPath.startsWith("tag/")) {
        return `href="/${cleanPath}/"`;
      }

      return `href="/read/${encodeURIComponent(cleanPath)}/"`;
    });
  }

  const activePage = useMemo(() => {
    if (!allPages || allPages.length === 0) return null;

    const matched = allPages.find((pg) => {
      const slug = (pg.slug || "").toLowerCase();
      const title = pg.title?.rendered || "";
      return currentSemesterConfig.matcher(slug, title);
    });

    if (matched) {
      return {
        id: matched.id,
        title: matched.title?.rendered || currentSemesterConfig.label,
        content: cleanAndRewriteWordPressLinks(matched.content?.rendered || ""),
      };
    }

    return null;
  }, [allPages, currentSemesterConfig]);

  const handleContentClick = (e) => {
    const targetLink = e.target.closest("a, button");
    if (!targetLink) return;

    const rawHref = targetLink.getAttribute("href") || "";
    const href = rawHref.trim().toLowerCase();
    const text = (targetLink.innerText || "").toLowerCase();

    const isPaymentTrigger =
      href.includes("rzp.io") ||
      href.includes("instamojo") ||
      href.includes("paytm") ||
      href.includes("/checkout") ||
      href.includes("payment") ||
      targetLink.classList.contains("pay-btn") ||
      targetLink.classList.contains("buy-now") ||
      targetLink.classList.contains("payment-btn") ||
      text.includes("पेमेंट") ||
      text.includes("खरीदें") ||
      text.includes("buy now") ||
      text.includes("pay now") ||
      text.includes("purchase");

    if (isPaymentTrigger) {
      e.preventDefault();
      e.stopPropagation();
      setModalOpen(true);
      return;
    }

    if (!rawHref || rawHref.startsWith("#") || rawHref.startsWith("mailto:") || rawHref.startsWith("tel:")) return;

    const isPdf =
      href.includes(".pdf") ||
      href.includes("/wp-content/uploads/") ||
      href.includes("drive.google.com") ||
      href.includes("docs.google.com") ||
      href.includes("mediafire.com");

    const isExternal =
      rawHref.startsWith("http") &&
      !rawHref.includes("geographynotespdf.com") &&
      !rawHref.includes("localhost");

    if (isPdf || isExternal || href.includes("ppup.ac.in")) {
      e.preventDefault();
      e.stopPropagation();

      let targetUrl = rawHref;
      if (rawHref.includes("/wp-content/uploads/")) {
        const baseDomain = (
          process.env.NEXT_PUBLIC_WORDPRESS_URL || "https://geographynotespdf.com/cms"
        ).replace(/\/+$/, "");

        if (!rawHref.startsWith("http")) {
          targetUrl = `${baseDomain}/${rawHref.replace(/^\/?(?:cms\/)?/, "")}`;
        } else if (rawHref.includes("geographynotespdf.com/wp-content/uploads/")) {
          targetUrl = rawHref.replace(
            "geographynotespdf.com/wp-content/uploads/",
            "geographynotespdf.com/cms/wp-content/uploads/"
          );
        }
      }

      window.open(targetUrl, "_blank", "noopener,noreferrer");
      return;
    }

    e.preventDefault();

    let cleanPath = rawHref
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

    if (cleanPath.startsWith("category/") || cleanPath.startsWith("tag/")) {
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

      {/* Top Banner */}
      <section className="bg-[#CFD4DC] border-b border-gray-300 py-3">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
              University Portal:
            </span>
            <span className="text-xs font-bold text-slate-900 bg-white/80 px-3 py-1 rounded-lg border border-gray-300 shadow-xs">
              CBCS 4-Year B.A. Course • M.A./M.Sc. Geography • Patliputra, Magadh, PU, VKSU
            </span>
          </div>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-black text-slate-800 bg-white hover:bg-slate-100 px-3 py-1 rounded-lg border border-gray-300 transition cursor-pointer"
          >
            <Home className="w-3.5 h-3.5 text-amber-500" />
            <span>Home</span>
          </Link>
        </div>
      </section>

      {/* Level Selection Switcher */}
      <section className="bg-[#DFE2E8] border-b border-gray-300 py-2.5">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 flex items-center gap-3">
          <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
            LEVEL:
          </span>
          <div className="inline-flex bg-white rounded-xl p-1 border border-slate-300 shadow-xs">
            <button
              onClick={() => handleLevelChange("UG")}
              className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                level === "UG"
                  ? "bg-[#0B2545] text-white shadow-xs"
                  : "text-slate-700 hover:text-slate-900"
              }`}
            >
              BA / UG / B.Sc. Notes
            </button>
            <button
              onClick={() => handleLevelChange("PG")}
              className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                level === "PG"
                  ? "bg-[#0B2545] text-white shadow-xs"
                  : "text-slate-700 hover:text-slate-900"
              }`}
            >
              MA / PG / M.Sc. Notes
            </button>
          </div>
        </div>
      </section>

      {/* Semester Buttons Bar */}
      <section className="border-b border-gray-300 bg-[#E5E9EF] py-2.5">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 flex items-center gap-2 overflow-x-auto text-[13px]">
          {semesterList.map((item) => {
            const isSelected = activeSemId === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSemesterChange(item.id)}
                className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all duration-150 cursor-pointer font-black text-xs shadow-xs border ${item.color} ${
                  isSelected
                    ? "ring-3 ring-amber-400 border-white scale-105"
                    : "opacity-90 hover:opacity-100 border-black/10"
                }`}
              >
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 py-8 w-full flex-1">
        {dataLoading ? (
          <div className="bg-white rounded-3xl p-16 flex flex-col items-center justify-center text-slate-500 border border-gray-200">
            <Loader2 className="w-8 h-8 animate-spin text-[#E5A83B] mb-3" />
            <p className="text-sm font-bold text-slate-700">Loading {currentSemesterConfig.label} notes...</p>
          </div>
        ) : activePage ? (
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-gray-200 mb-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 mb-6 border-b border-gray-100 gap-3">
              <div>
                <span className="text-[11px] font-extrabold text-[#B45309] uppercase tracking-wider block">
                  University Academic Notes &amp; Official Syllabus
                </span>
                <h2
                  className="text-xl sm:text-2xl font-black text-slate-900"
                  dangerouslySetInnerHTML={{ __html: activePage.title }}
                />
              </div>
              <button
                onClick={() => openDownloadModal(activePage.title, activePage.id)}
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
                [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2 [&_li]:my-1.5 [&_li]:text-xs sm:[&_li]:text-sm
                [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-2
                [&_img]:rounded-xl [&_img]:shadow-xs [&_img]:my-3 [&_img]:mx-auto"
              dangerouslySetInnerHTML={{ __html: activePage.content }}
            />
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center text-slate-500 border border-gray-200">
            <GraduationCap className="w-10 h-10 text-amber-500/50 mb-2 mx-auto" />
            <h4 className="font-bold text-sm text-slate-800">
              No notes found for {currentSemesterConfig.label}
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
              Please ensure a page for this semester exists in WordPress with the corresponding title or slug.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}