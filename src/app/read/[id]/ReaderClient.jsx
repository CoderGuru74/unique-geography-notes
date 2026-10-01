"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Home,
  Download,
  Share2,
  Loader2,
  Calendar,
  User,
  BookOpen,
  ChevronRight,
  FolderOpen
} from "lucide-react";
import AuthModal from "../../../components/AuthModal";

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

export default function ReaderClient({ rawId }) {
  const params = useParams();
  const router = useRouter();

  // Robust slug resolution from props, params, or browser address bar
  let initialSlug = rawId || (params?.id ? (Array.isArray(params.id) ? params.id.join("/") : params.id) : "");
  if (!initialSlug && typeof window !== "undefined") {
    const parts = window.location.pathname.split("/read/");
    if (parts[1]) {
      initialSlug = parts[1].replace(/^\/+|\/+$/g, "");
    }
  }

  const [resolvedSlug, setResolvedSlug] = useState(initialSlug ? decodeURIComponent(initialSlug) : "");
  const [post, setPost] = useState(null);
  const [categoryArchive, setCategoryArchive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const parts = window.location.pathname.split("/read/");
      if (parts[1]) {
        const clean = parts[1].replace(/^\/+|\/+$/g, "").split("?")[0];
        if (clean && clean !== "default") {
          try {
            setResolvedSlug(decodeURIComponent(clean));
          } catch (_) {
            setResolvedSlug(clean);
          }
        }
      }
    }
  }, []);

  useEffect(() => {
    if (!resolvedSlug) return;

    let isMounted = true;

    async function fetchContent() {
      const baseDomain = (
        process.env.NEXT_PUBLIC_WORDPRESS_URL || "https://geographynotespdf.com/cms"
      ).replace(/\/+$/, "");

      setLoading(true);
      setError(null);
      setPost(null);
      setCategoryArchive(null);

      let cleanSlug = resolvedSlug;
      try {
        cleanSlug = decodeURIComponent(decodeURIComponent(resolvedSlug));
      } catch (_) {
        try {
          cleanSlug = decodeURIComponent(resolvedSlug);
        } catch (_) {}
      }

      // Trim cleanSlug and remove any trailing slash
      cleanSlug = cleanSlug.trim().replace(/\/+$/, "");

      try {
        const isNumericId = /^\d+$/.test(cleanSlug);
        let foundPost = null;

        // 1. Direct ID lookup
        if (isNumericId) {
          const directRes = await fetch(`${baseDomain}/wp-json/wp/v2/posts/${cleanSlug}?_embed`);
          if (directRes.ok) {
            foundPost = await directRes.json();
          }
        }

        // 2. Direct Slug lookup on /posts (Supports exact and encoded)
        if (!foundPost) {
          const slugRes = await fetch(
            `${baseDomain}/wp-json/wp/v2/posts?slug=${encodeURIComponent(cleanSlug)}&_embed`
          );
          if (slugRes.ok) {
            const arr = await slugRes.json();
            if (Array.isArray(arr) && arr.length > 0) {
              foundPost = arr[0];
            }
          }
        }

        // 3. Direct Slug lookup on /pages (BSEB notes created as pages)
        if (!foundPost) {
          const pagesRes = await fetch(
            `${baseDomain}/wp-json/wp/v2/pages?slug=${encodeURIComponent(cleanSlug)}&_embed`
          );
          if (pagesRes.ok) {
            const pagesArr = await pagesRes.json();
            if (Array.isArray(pagesArr) && pagesArr.length > 0) {
              foundPost = pagesArr[0];
            }
          }
        }

        // 4. Fallback search on /posts with clean keywords
        if (!foundPost) {
          try {
            const query = cleanSlug.replace(/[-_]/g, " ").trim();
            const searchRes = await fetch(
              `${baseDomain}/wp-json/wp/v2/posts?search=${encodeURIComponent(query)}&per_page=10&_embed`
            );
            if (searchRes.ok) {
              const searchArr = await searchRes.json();
              if (Array.isArray(searchArr) && searchArr.length > 0) {
                // Match best candidate by slug or title
                foundPost =
                  searchArr.find(
                    (p) =>
                      p.slug.toLowerCase() === cleanSlug.toLowerCase() ||
                      p.title?.rendered.toLowerCase().includes(query.toLowerCase())
                  ) || searchArr[0];
              }
            }
          } catch (_) {}
        }

        // 5. Fallback search on /pages with clean keywords
        if (!foundPost) {
          try {
            const query = cleanSlug.replace(/[-_]/g, " ").trim();
            const pageSearchRes = await fetch(
              `${baseDomain}/wp-json/wp/v2/pages?search=${encodeURIComponent(query)}&per_page=10&_embed`
            );
            if (pageSearchRes.ok) {
              const pSearchArr = await pageSearchRes.json();
              if (Array.isArray(pSearchArr) && pSearchArr.length > 0) {
                foundPost =
                  pSearchArr.find(
                    (p) =>
                      p.slug.toLowerCase() === cleanSlug.toLowerCase() ||
                      p.title?.rendered.toLowerCase().includes(query.toLowerCase())
                  ) || pSearchArr[0];
              }
            }
          } catch (_) {}
        }

        if (foundPost) {
          if (isMounted) setPost(foundPost);
          return;
        }

        // 6. Category Archive Lookup (e.g., class-6, bseb-notes, bhu-akriti)
        const catQuery = cleanSlug.replace(/[-_]/g, " ").trim();
        const catRes = await fetch(
          `${baseDomain}/wp-json/wp/v2/categories?search=${encodeURIComponent(catQuery)}&per_page=10`
        );

        if (catRes.ok) {
          const catList = await catRes.json();
          if (Array.isArray(catList) && catList.length > 0) {
            const matchedCat =
              catList.find(
                (c) =>
                  c.name.toLowerCase() === catQuery.toLowerCase() ||
                  c.slug.toLowerCase() === cleanSlug.toLowerCase()
              ) || catList[0];

            const postsInCatRes = await fetch(
              `${baseDomain}/wp-json/wp/v2/posts?categories=${matchedCat.id}&per_page=100&_embed`
            );

            if (postsInCatRes.ok) {
              const postsInCat = await postsInCatRes.json();
              if (isMounted) {
                setCategoryArchive({
                  title: matchedCat.name,
                  posts: Array.isArray(postsInCat) ? postsInCat : [],
                });
                return;
              }
            }
          }
        }

        if (!isMounted) return;
        setError("Note not found or unavailable.");
      } catch (err) {
        console.error("Error fetching content:", err);
        if (isMounted) setError("Failed to load content.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchContent();

    return () => {
      isMounted = false;
    };
  }, [resolvedSlug]);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  function cleanAndProcessPostContent(rawHtml) {
    if (!rawHtml) return "";

    return rawHtml
      .replace(
        /<div[^>]*class="[^"]*(?:quiz|question-box|exam-timer|old-payment|payment-box|razorpay-embed-btn)[^"]*"[^>]*>[\s\S]*?<\/div>/gi,
        ""
      )
      .replace(
        /<form[^>]*action="[^"]*(?:instamojo|paytm|rzp\.io|razorpay)[^"]*"[^>]*>[\s\S]*?<\/form>/gi,
        ""
      );
  }

  const handleContentClick = (e) => {
    const targetLink = e.target.closest("a, button");
    if (!targetLink) return;

    const rawHref = targetLink.getAttribute("href") || "";
    const href = rawHref.trim().toLowerCase();
    const text = (targetLink.innerText || "").toLowerCase();

    // 1. Payment links
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

    const baseDomain = (
      process.env.NEXT_PUBLIC_WORDPRESS_URL || "https://geographynotespdf.com/cms"
    ).replace(/\/+$/, "");

    // 2. Direct PDFs & media
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
        if (!rawHref.startsWith("http")) {
          const cleanUpload = rawHref.replace(/^\/?(?:cms\/)?/, "");
          targetUrl = `${baseDomain}/${cleanUpload}`;
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

    // 3. Navigation
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

  const title = post?.title?.rendered
    ? decodeHtmlEntities(post.title.rendered)
    : categoryArchive
    ? decodeHtmlEntities(categoryArchive.title)
    : "Geography Note";

  const processedContent = cleanAndProcessPostContent(post?.content?.rendered || "");

  return (
    <main className="min-h-screen bg-[#F3F4F6] text-slate-900 font-sans flex flex-col">
      <AuthModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        targetAction={title}
        postId={post?.id}
        contentElementId="printable-content"
      />

      {/* Reader Top Action Bar */}
      <nav className="w-full bg-[#E5E7EB] border-b border-gray-300 py-3 sticky top-0 z-30 shadow-xs">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-950 px-3 py-1.5 rounded-xl hover:bg-slate-200 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go Back</span>
            </button>

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-black text-slate-800 bg-white hover:bg-[#0B2545] hover:text-white px-3.5 py-1.5 rounded-xl border border-gray-300 transition cursor-pointer shadow-xs"
            >
              <Home className="w-3.5 h-3.5 text-amber-500" />
              <span>Home</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-white border border-gray-300 text-slate-700 hover:bg-slate-50 shadow-xs transition cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copied ? "Copied Link!" : "Share"}</span>
            </button>

            {post && (
              <button
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-[#E5A83B] hover:bg-[#d49425] text-slate-950 shadow-xs transition cursor-pointer active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content View */}
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-8 w-full flex-1">
        {loading ? (
          <div className="bg-white rounded-3xl p-16 border border-gray-200 shadow-sm flex flex-col items-center justify-center text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-[#E5A83B] mb-3" />
            <p className="text-xs font-bold">Loading content...</p>
          </div>
        ) : categoryArchive ? (
          /* Category Archive View */
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 pb-6 mb-8 border-b border-gray-100">
              <div className="p-3 bg-amber-500/10 text-amber-600 rounded-2xl">
                <FolderOpen className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-extrabold text-[#B45309] uppercase tracking-wider block">
                  Category Archive
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                  {decodeHtmlEntities(categoryArchive.title)}
                </h1>
              </div>
            </div>

            {categoryArchive.posts.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                No notes found in this category.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categoryArchive.posts.map((p) => {
                  const postTitle = decodeHtmlEntities(p.title?.rendered || p.slug);
                  const pSlug = p.slug || String(p.id);

                  return (
                    <Link
                      key={p.id}
                      href={`/read/${encodeURIComponent(pSlug)}/`}
                      className="group flex items-center justify-between p-4 rounded-2xl border border-gray-200 hover:border-amber-400 hover:bg-amber-50/40 transition shadow-2xs cursor-pointer"
                    >
                      <div className="pr-3">
                        <h2 className="text-sm font-bold text-slate-800 group-hover:text-[#0B2545] transition leading-snug">
                          {postTitle}
                        </h2>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Click to read note & download PDF
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 transition shrink-0" />
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ) : error || !post ? (
          /* Error / Missing view */
          <div className="bg-white rounded-3xl p-12 border border-gray-200 shadow-sm text-center">
            <h2 className="text-xl font-black text-slate-900 mb-2">Note Not Found</h2>
            <p className="text-xs text-slate-500 mb-6">{error || "Requested note is missing."}[cite: 4]</p>
            <Link
              href="/"
              className="px-5 py-2.5 bg-[#0B2545] text-white text-xs font-bold rounded-xl shadow-xs"
            >
              Back to Home
            </Link>
          </div>
        ) : (
          /* Single Note View */
          <article className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200 shadow-sm">
            <div className="bg-[#FEF3C7] border border-amber-300 rounded-2xl p-3.5 sm:p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <span className="text-xs font-bold text-[#B45309]">
                Offline study version with all diagrams and Hindi text notes.
              </span>
              <button
                onClick={() => setModalOpen(true)}
                className="bg-[#0B2545] hover:bg-slate-900 text-white font-bold text-xs px-4 py-1.5 rounded-lg transition whitespace-nowrap cursor-pointer shadow-xs"
              >
                Save PDF
              </button>
            </div>

            <h1
              className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight mb-4"
              dangerouslySetInnerHTML={{ __html: post.title?.rendered || "" }}
            />

            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 pb-6 mb-8 border-b border-gray-100">
              {post.date && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {new Date(post.date).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              )}
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Curated by Faculty
              </span>
            </div>

            <div
              id="printable-content"
              onClick={handleContentClick}
              className="prose max-w-none text-slate-800 leading-relaxed
                [&_a]:text-blue-600 [&_a]:font-semibold [&_a:hover]:underline [&_a]:cursor-pointer
                [&_h1]:text-2xl [&_h1]:font-black [&_h1]:text-slate-900 [&_h1]:mt-6 [&_h1]:mb-3
                [&_h2]:text-xl [&_h2]:font-extrabold [&_h2]:text-slate-900 [&_h2]:mt-6 [&_h2]:mb-3
                [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-[#DC2626] [&_h3]:mt-5 [&_h3]:mb-2
                [&_p]:my-3.5 [&_p]:text-sm sm:[&_p]:text-base [&_p]:leading-relaxed
                [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-3 [&_li]:my-1.5 [&_li]:text-sm
                [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-3 [&_li]:my-1.5 [&_li]:text-sm
                [&_table]:w-full [&_table]:border-collapse [&_table]:my-5
                [&_th]:border [&_th]:border-gray-300 [&_th]:p-2.5 [&_th]:bg-slate-100 [&_th]:text-xs [&_th]:font-bold
                [&_td]:border [&_td]:border-gray-300 [&_td]:p-2.5 [&_td]:text-xs sm:[&_td]:text-sm
                [&_img]:rounded-xl [&_img]:shadow-xs [&_img]:my-5 [&_img]:mx-auto"
              dangerouslySetInnerHTML={{ __html: processedContent }}
            />
          </article>
        )}
      </div>
    </main>
  );
}