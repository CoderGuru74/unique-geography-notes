"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Clock, Loader2 } from "lucide-react";

// Exact menu portals matching the original WordPress website
const SIDEBAR_PORTALS = [
  { label: "BPSC TEACHER", href: "/category/exams", color: "text-[#B91C1C]" },
  { label: "वैकल्पिक भूगोल", href: "/category/upsc", color: "text-[#7E22CE]" },
  { label: "बिहार का भूगोल", href: "/category/school/bseb", color: "text-[#047857]" },
  { label: "RESEARCH METHODOLOGY", href: "/category/university", color: "text-[#A16207]", highlight: true },
  { label: "UGC-NET/JRF Paper2", href: "/category/exams", color: "text-[#65A30D]", highlight: true },
  { label: "Remote Sensing and GIS", href: "/category/university", color: "text-[#DC2626]" },
  { label: "SOLVED  UGC NET/JRF AND OTHER  EXAM PAPER", href: "/category/exams", color: "text-[#0D9488]", highlight: true },
  { label: "KVS, NVS, TGT, PGT & STET", href: "/category/exams", color: "text-[#4F46E5]", highlight: true },
  { label: "प्रेरक ज्ञान, विचार तथा कहानियाँ", href: "/category/gc", color: "text-[#111827]", highlight: true },
];

export default function RightSidebar() {
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function loadRecentPosts() {
      const baseDomain = process.env.NEXT_PUBLIC_WORDPRESS_URL || "https://www.geographynotespdf.com";
      const wpUrl = baseDomain.replace(/\/+$/, "");

      try {
        const endpoint = `${wpUrl}/wp-json/wp/v2/posts?per_page=6&_fields=id,title,slug,date`;
        
        const res = await fetch(endpoint, {
          signal: controller.signal,
          headers: {
            Accept: "application/json",
          },
        });

        if (!res.ok) {
          throw new Error(`WordPress status: ${res.status}`);
        }

        const data = await res.json();
        if (Array.isArray(data)) {
          setRecentPosts(data);
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.warn("Sidebar posts failed to load:", err.message);
          setRecentPosts([]);
        }
      } finally {
        setLoading(false);
      }
    }

    loadRecentPosts();

    return () => controller.abort();
  }, []);

  return (
    <aside className="w-full space-y-6">
      {/* 1. Category Portals */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-gray-200">
        <div className="space-y-2.5">
          {SIDEBAR_PORTALS.map((portal, idx) => (
            <Link
              key={idx}
              href={portal.href}
              className={`block w-full py-2.5 px-3 rounded-lg border border-gray-200 bg-white hover:bg-slate-50 transition text-center font-bold text-xs sm:text-[13px] tracking-wide ${portal.color}`}
            >
              {portal.highlight ? (
                <span className="bg-[#FEF08A]/60 px-2 py-0.5 rounded">
                  {portal.label}
                </span>
              ) : (
                portal.label
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* 2. Live Recently Added Section */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-gray-200">
        <div className="flex items-center gap-2 pb-3 mb-4 border-b border-gray-100">
          <Clock className="w-4 h-4 text-[#E5A83B]" />
          <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
            Recently Added
          </h3>
        </div>

        {loading ? (
          <div className="py-6 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin text-[#E5A83B] mb-2" />
            <p className="text-[11px]">Loading latest uploads...</p>
          </div>
        ) : recentPosts.length === 0 ? (
          <p className="text-xs text-slate-400 py-3 text-center">No recent uploads found.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentPosts.map((post, index) => {
              const cleanSlug = post.slug || String(post.id);
              return (
                <Link
                  key={post.id}
                  href={`/read/${encodeURIComponent(cleanSlug)}`}
                  className="block py-3 hover:text-blue-600 group transition"
                >
                  <p
                    className="text-xs font-bold text-slate-800 group-hover:text-blue-600 line-clamp-2 leading-snug mb-1"
                    dangerouslySetInnerHTML={{
                      __html: `${index + 1}. ${post.title?.rendered || "Geography Note"}`,
                    }}
                  />
                  <span className="text-[10px] text-slate-400 font-medium">
                    {post.date
                      ? new Date(post.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Recently Added"}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Direct PDF Info Card */}
      <div className="bg-[#FFFBEB] rounded-2xl p-5 border border-amber-200 text-center shadow-xs">
        <h4 className="text-xs font-black text-[#B45309] leading-snug mb-2">
          विभिन्न प्रकार के परीक्षाओं की तैयारी हेतु सम्पूर्ण पीडीएफ नोट्स उपलब्ध हैं।
        </h4>
        <p className="text-[11px] text-slate-600 mb-3">
          Get unlimited direct access to all semester papers, NCERT summaries, and competitive modules.
        </p>
        <Link
          href="/category/university"
          className="w-full inline-block bg-[#0B2545] hover:bg-slate-900 text-white font-bold text-xs py-2.5 rounded-xl shadow-xs transition"
        >
          Explore All PDFs
        </Link>
      </div>
    </aside>
  );
}