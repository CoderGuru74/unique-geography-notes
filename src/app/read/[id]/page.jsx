"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Download, Calendar, BookOpen, Loader2, Share2, Check } from "lucide-react";
import AuthModal from "../../../components/AuthModal";

export default function ReaderPage({ params }) {
  const resolvedParams = use(params);
  const rawId = resolvedParams.id;
  const router = useRouter();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  function cleanAndRewriteHtmlLinks(html) {
    if (!html) return "";

    return html.replace(
      /href=["'](?:https?:\/\/(?:www\.|api\.)?geographynotespdf\.com)?\/([^"'#\s>]+)\/?["']/gi,
      (match, path) => {
        let cleanPath = path.replace(/^\/+|\/+$/g, "");
        try {
          cleanPath = decodeURIComponent(decodeURIComponent(cleanPath));
        } catch (_) {
          try { cleanPath = decodeURIComponent(cleanPath); } catch (_) {}
        }

        if (cleanPath.startsWith("category/")) {
          return `href="/${cleanPath}"`;
        }
        return `href="/read/${encodeURIComponent(cleanPath)}"`;
      }
    );
  }

  useEffect(() => {
    async function fetchArticle() {
      const wpUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL || "https://www.geographynotespdf.com";
      if (!rawId) return;

      setLoading(true);
      setError(false);

      try {
        let cleanParam = String(rawId).trim();

        // 1. Fully unroll any multi-layer URL encoding (%25e0 -> %e0 -> सूर्यातप)
        while (cleanParam.includes("%")) {
          try {
            const decoded = decodeURIComponent(cleanParam);
            if (decoded === cleanParam) break;
            cleanParam = decoded;
          } catch (e) {
            break;
          }
        }

        // Strip any residual protocol or domain fragments
        cleanParam = cleanParam
          .replace(/^https?:\/\/[^\/]+\//i, "")
          .replace(/^\/?read\//i, "")
          .replace(/^\/+|\/+$/g, "");

        let found = null;
        const isNumeric = /^\d+$/.test(cleanParam);

        if (isNumeric) {
          // Direct fetch by post ID
          const pRes = await fetch(`${wpUrl}/wp-json/wp/v2/posts/${cleanParam}?_embed`);
          if (pRes.ok) {
            found = await pRes.json();
          } else {
            const pgRes = await fetch(`${wpUrl}/wp-json/wp/v2/pages/${cleanParam}?_embed`);
            if (pgRes.ok) found = await pgRes.json();
          }
        } else {
          // Both raw utf-8 and standard URI encoded slugs
          const slugVariations = [
            encodeURIComponent(cleanParam),
            cleanParam,
          ];

          // 2. Query both posts and pages
          for (const s of slugVariations) {
            if (found) break;

            const postRes = await fetch(`${wpUrl}/wp-json/wp/v2/posts?slug=${s}&_embed`);
            if (postRes.ok) {
              const list = await postRes.json();
              if (Array.isArray(list) && list.length > 0) {
                found = list[0];
                break;
              }
            }

            const pageRes = await fetch(`${wpUrl}/wp-json/wp/v2/pages?slug=${s}&_embed`);
            if (pageRes.ok) {
              const list = await pageRes.json();
              if (Array.isArray(list) && list.length > 0) {
                found = list[0];
                break;
              }
            }
          }

          // 3. Fallback: Search by keyword/title
          if (!found) {
            const cleanSearchQuery = cleanParam
              .replace(/[-_]/g, " ")
              .replace(/^\d+[\.\s]*/, "")
              .trim();

            const searchEndpoints = [
              `${wpUrl}/wp-json/wp/v2/posts?search=${encodeURIComponent(cleanSearchQuery)}&per_page=1&_embed`,
              `${wpUrl}/wp-json/wp/v2/pages?search=${encodeURIComponent(cleanSearchQuery)}&per_page=1&_embed`,
            ];

            for (const url of searchEndpoints) {
              if (found) break;
              const res = await fetch(url);
              if (res.ok) {
                const list = await res.json();
                if (Array.isArray(list) && list.length > 0) {
                  found = list[0];
                }
              }
            }
          }
        }

        if (found && (found.content?.rendered || found.title?.rendered)) {
          found.cleanContent = cleanAndRewriteHtmlLinks(found.content?.rendered || "");
          setPost(found);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Error retrieving note content:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchArticle();
  }, [rawId]);

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
      try { cleanPath = decodeURIComponent(cleanPath); } catch (_) {}
    }

    if (cleanPath.startsWith("category/")) {
      router.push(`/${cleanPath}`);
      return;
    }

    router.push(`/read/${encodeURIComponent(cleanPath)}`);
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-[#F3F4F6] font-sans text-slate-900">
      <AuthModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        targetAction={post?.title?.rendered || "Study Material"}
        postId={post?.id}
        contentElementId="printable-content"
      />

      <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <Link
            href="/category/university"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-950 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Syllabus &amp; Notes</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? "Link Copied!" : "Share"}</span>
            </button>

            {post && (
              <button
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-950 bg-[#E5A83B] hover:bg-[#d49425] px-4 py-2 rounded-xl shadow-xs transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 py-8 w-full flex-1">
        {loading ? (
          <div className="bg-white rounded-3xl p-20 flex flex-col items-center justify-center text-slate-500 border border-gray-200 shadow-sm">
            <Loader2 className="w-8 h-8 animate-spin text-[#E5A83B] mb-3" />
            <p className="text-xs font-semibold">Loading full study material from WordPress...</p>
          </div>
        ) : error || !post ? (
          <div className="bg-white rounded-3xl p-16 text-center text-slate-500 border border-gray-200 shadow-sm">
            <BookOpen className="w-12 h-12 text-amber-500/50 mb-3 mx-auto" />
            <h3 className="font-bold text-base text-slate-800 mb-1">Study Material Not Found</h3>
            <p className="text-xs text-slate-500 mb-5">
              Could not retrieve the note for &ldquo;{decodeURIComponent(rawId)}&rdquo;.
            </p>
            <Link
              href="/category/university"
              className="px-5 py-2.5 bg-[#0B2545] text-white text-xs font-bold rounded-xl inline-block"
            >
              Return to University Notes
            </Link>
          </div>
        ) : (
          <article className="bg-white rounded-3xl p-6 sm:p-12 shadow-sm border border-gray-200">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-center justify-between gap-4">
              <span className="text-xs font-semibold text-amber-900">
                Offline study version with all diagrams and Hindi text notes.
              </span>
              <button
                onClick={() => setModalOpen(true)}
                className="bg-[#0B2545] hover:bg-slate-900 text-white font-bold text-xs px-4 py-2 rounded-xl transition whitespace-nowrap cursor-pointer"
              >
                Save PDF
              </button>
            </div>

            <div id="printable-content">
              <h1
                className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 leading-tight mb-4"
                dangerouslySetInnerHTML={{ __html: post.title?.rendered || "" }}
              />

              <div className="flex items-center gap-4 text-xs text-slate-400 font-medium pb-6 mb-8 border-b border-gray-100">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {post.date
                    ? new Date(post.date).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Unique Geography Notes"}
                </span>
                <span>•</span>
                <span>Curated by University Faculty</span>
              </div>

              <div
                onClick={handleContentClick}
                className="prose max-w-none text-slate-800 leading-relaxed text-sm sm:text-base
                  [&_h1]:text-2xl [&_h1]:font-black [&_h1]:text-slate-900 [&_h1]:mt-8 [&_h1]:mb-4
                  [&_h2]:text-xl [&_h2]:font-extrabold [&_h2]:text-slate-900 [&_h2]:mt-6 [&_h2]:mb-3
                  [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-slate-900 [&_h3]:mt-5 [&_h3]:mb-2
                  [&_p]:mb-4 [&_p]:leading-relaxed
                  [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_li]:mb-1.5
                  [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_li]:mb-1.5
                  [&_img]:rounded-2xl [&_img]:my-6 [&_img]:mx-auto [&_img]:shadow-sm
                  [&_a]:text-blue-600 [&_a]:font-semibold [&_a:hover]:underline [&_a]:cursor-pointer"
                dangerouslySetInnerHTML={{ __html: post.cleanContent || post.content?.rendered || "" }}
              />
            </div>
          </article>
        )}
      </div>
    </main>
  );
}