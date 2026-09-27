"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, BookOpen, ChevronRight } from "lucide-react";

// Pre-indexed quick links for major syllabus topics & subjects
const CURATED_TOPICS = [
  { title: "भू-आकृति विज्ञान (Geomorphology)", slug: "category/upsc", type: "Subject" },
  { title: "जलवायु विज्ञान (Climatology)", slug: "read/climatology", type: "Subject" },
  { title: "समुद्र विज्ञान (Oceanography)", slug: "read/oceanography", type: "Subject" },
  { title: "भौगोलिक चिंतन (Geographical Thought)", slug: "read/geographical-thought", type: "Subject" },
  { title: "राजनीतिक भूगोल (Political Geography)", slug: "read/political-geography", type: "Subject" },
  { title: "प्रादेशिक भूगोल (Regional Geography)", slug: "read/regional-geography", type: "Subject" },
  { title: "आर्थिक भूगोल (Economic Geography)", slug: "read/economic-geography", type: "Subject" },
  { title: "मानव भूगोल (Human Geography)", slug: "read/human-geography", type: "Subject" },
  { title: "पर्यावरण भूगोल (Environmental Geography)", slug: "read/environmental-geography", type: "Subject" },
  { title: "भारत का भूगोल (Geography of India)", slug: "read/geography-of-india", type: "Subject" },
  { title: "पृथ्वी का भूगर्भिक इतिहास (Geological History of Earth)", slug: "read/geological-history-of-the-earth", type: "Topic" },
  { title: "भू-आकृति विज्ञान की प्रकृति और विषय क्षेत्र (Nature and Scope of Geomorphology)", slug: "read/nature-and-scope-of-geomorphology", type: "Topic" },
  { title: "पृथ्वी की उत्पति (Origin Of The Earth)", slug: "read/origin-of-the-earth", type: "Topic" },
  { title: "काण्ट की वायव्य राशि परिकल्पना (Kant's Gaseous Hypothesis)", slug: "read/kants-gaseous-hypothesis", type: "Topic" },
  { title: "लाप्लास की निहारिका परिकल्पना (Nebular Hypothesis of Laplace)", slug: "read/nebular-hypothesis-of-laplace", type: "Topic" },
  { title: "बिग बैंग तथा स्फीति सिद्धान्त (Big Bang Theory)", slug: "read/big-bang-theory", type: "Topic" },
  { title: "पृथ्वी की आंतरिक संरचना (Internal Structure of Earth)", slug: "read/internal-structure-of-the-earth", type: "Topic" },
  { title: "कोबर का भूसन्नति पर्वतोत्पत्ति सिद्धांत (Kober Geosyncline Theory)", slug: "read/kober-geosyncline-theory", type: "Topic" },
  { title: "भूसंतुलन / समस्थिति (Isostasy)", slug: "read/isostasy", type: "Topic" },
  { title: "वेगनर का महाद्वीपीय विस्थापन सिद्धान्त (Continental Drift Theory)", slug: "read/continental-drift-theory", type: "Topic" },
  { title: "प्लेट विवर्तनिकी सिद्धांत (Plate Tectonic Theory)", slug: "read/plate-tectonic-theory", type: "Topic" },
  { title: "सागर नितल प्रसार का सिद्धांत (Sea Floor Spreading)", slug: "read/sea-floor-spreading", type: "Topic" },
  { title: "ज्वालामुखी एवं स्थलाकृति (Volcanism & Landforms)", slug: "read/volcanism-and-volcanic-landforms", type: "Topic" },
  { title: "भूकम्प (Earthquake in India)", slug: "read/earthquake", type: "Topic" },
  { title: "डेविस का अपरदन चक्र (Davis Cycle of Erosion)", slug: "read/cycle-of-erosion-wm-davis", type: "Topic" },
  { title: "पेंक का अपरदन चक्र सिद्धांत (Penck's Morphological Analysis)", slug: "read/pencks-cycle-of-erosion", type: "Topic" },
  { title: "नदी द्वारा निर्मित स्थलाकृति (River Landforms)", slug: "read/fluvial-landforms", type: "Topic" },
  { title: "कार्स्ट स्थलाकृति (Karst Topography)", slug: "read/karst-topography", type: "Topic" },
  { title: "पवन द्वारा निर्मित स्थलाकृति (Arid Topography)", slug: "read/arid-topography", type: "Topic" },
  { title: "चट्टानें एवं चट्टानों का प्रकार (Rocks and Types)", slug: "read/rocks-and-their-types", type: "Topic" },
];

export default function SearchBar() {
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Hybrid search: instant local match + full-text WordPress search
  useEffect(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed || trimmed.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    // 1. Instant local filter against curated Hindi/English topics
    const localMatches = CURATED_TOPICS.filter((item) =>
      item.title.toLowerCase().includes(trimmed) || item.slug.toLowerCase().includes(trimmed)
    ).map((item) => ({
      id: item.slug,
      title: item.title,
      slug: item.slug,
      type: item.type,
    }));

    setResults(localMatches);
    setIsOpen(localMatches.length > 0);

    // 2. Debounced query to WordPress Universal Search
    const timer = setTimeout(async () => {
      setLoading(true);
      const wpUrl = (
        process.env.NEXT_PUBLIC_WORDPRESS_URL || "https://geographynotespdf.com/cms"
      ).replace(/\/+$/, "");

      try {
        // Universal search queries full post/page content and titles across WP
        const searchEndpoint = `${wpUrl}/wp-json/wp/v2/search?search=${encodeURIComponent(
          trimmed
        )}&per_page=8&_fields=id,title,url,subtype`;

        const res = await fetch(searchEndpoint);
        if (res.ok) {
          const wpMatches = await res.json();

          const formattedWp = wpMatches.map((item) => {
            // Extract clean slug from WP URL
            const rawUrl = item.url || "";
            const slug = rawUrl
              .replace(/^https?:\/\/[^\/]+\/(?:cms\/)?/i, "")
              .replace(/\/+$/, "");

            return {
              id: item.id,
              title: item.title,
              slug: slug || String(item.id),
              type: item.subtype === "page" ? "Page" : "Note",
            };
          });

          // Merge local matches and WP results without duplicates
          const seen = new Set(localMatches.map((m) => m.slug));
          const combined = [...localMatches];

          formattedWp.forEach((item) => {
            if (!seen.has(item.slug)) {
              seen.add(item.slug);
              combined.push(item);
            }
          });

          setResults(combined);
          setIsOpen(combined.length > 0);
        }
      } catch (err) {
        console.error("Search API error:", err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (item) => {
    setIsOpen(false);
    setQuery("");

    let destination = item.slug;
    if (!destination.startsWith("category/") && !destination.startsWith("read/")) {
      destination = `read/${destination}`;
    }

    router.push(`/${destination}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (results.length > 0) {
        handleSelect(results[0]);
      } else if (query.trim()) {
        setIsOpen(false);
        router.push(`/read/${encodeURIComponent(query.trim())}`);
      }
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xs sm:max-w-sm">
      <div className="relative flex items-center">
        <span className="absolute left-3 text-slate-400 pointer-events-none">
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </span>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder="Search topic, paper, or notes..."
          autoComplete="off"
          suppressHydrationWarning={true}
          className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-[#E5A83B] focus:ring-2 focus:ring-amber-200/50 shadow-xs transition"
        />
      </div>

      {/* Suggestion Dropdown */}
      {mounted && isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 max-h-80 overflow-y-auto divide-y divide-gray-100">
          <div className="px-3 py-1.5 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Matching Geography Notes ({results.length})
          </div>

          {results.map((item) => (
            <button
              key={`${item.type}-${item.id}`}
              onClick={() => handleSelect(item)}
              className="w-full text-left px-3.5 py-2.5 hover:bg-amber-50/80 transition flex items-center justify-between gap-3 cursor-pointer group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <BookOpen className="w-3.5 h-3.5 text-amber-600 shrink-0 group-hover:scale-110 transition" />
                <span
                  className="text-xs font-semibold text-slate-800 line-clamp-1 group-hover:text-[#0B2545]"
                  dangerouslySetInnerHTML={{ __html: item.title }}
                />
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 group-hover:bg-amber-100 group-hover:text-amber-800 transition">
                  {item.type}
                </span>
                <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-slate-600" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}