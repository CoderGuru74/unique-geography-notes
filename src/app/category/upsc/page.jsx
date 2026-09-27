"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, Eye, Download, Loader2, FileText } from "lucide-react";
import Navbar from "../../../components/Navbar";
import AuthModal from "../../../components/AuthModal";

const UPSC_TOPICS = [
  {
    id: "all",
    label: "सभी विषय (All Topics)",
    slugPatterns: [],
    keywords: [],
    bgClass: "bg-[#0B2545] hover:bg-[#081B33] text-white", // Dark Navy
  },
  {
    id: "geomorphology",
    label: "1. भू-आकृति विज्ञान",
    enLabel: "Geomorphology",
    slugPatterns: ["geomorphology", "bhoo-aakriti", "geomorph", "bhu-aakriti"],
    keywords: ["भू-आकृति", "भू आकृति", "भूआकृति", "geomorphology"],
    bgClass: "bg-[#DC2626] hover:bg-[#B91C1C] text-white", // Crimson Red
  },
  {
    id: "climatology",
    label: "2. जलवायु विज्ञान",
    enLabel: "Climatology",
    slugPatterns: ["climatology", "jalvayu-vigyan", "jalvayu"],
    keywords: ["जलवायु", "climatology"],
    bgClass: "bg-[#2563EB] hover:bg-[#1D4ED8] text-white", // Royal Blue
  },
  {
    id: "oceanography",
    label: "3. समुद्र विज्ञान",
    enLabel: "Oceanography",
    slugPatterns: ["oceanography", "samudra-vigyan", "samudra"],
    keywords: ["समुद्र विज्ञान", "महासागर", "oceanography"],
    bgClass: "bg-[#0284C7] hover:bg-[#0369A1] text-white", // Ocean Blue
  },
  {
    id: "thought",
    label: "4. भौगोलिक चिंतन",
    enLabel: "Geographical Thought",
    slugPatterns: ["geographical-thought", "bhaugolik-chintan", "thought"],
    keywords: ["भौगोलिक चिंतन", "भौगोलिक चिन्तन", "geographical thought"],
    bgClass: "bg-[#7C3AED] hover:bg-[#6D28D9] text-white", // Deep Purple
  },
  {
    id: "political",
    label: "5. राजनीतिक भूगोल",
    enLabel: "Political Geography",
    slugPatterns: ["political-geography", "rajnitik-bhugol"],
    keywords: ["राजनीतिक भूगोल", "राजनैतिक भूगोल", "political geography"],
    bgClass: "bg-[#D97706] hover:bg-[#B45309] text-white", // Amber Orange
  },
  {
    id: "regional",
    label: "6. प्रादेशिक भूगोल",
    enLabel: "Regional Geography",
    slugPatterns: ["regional-geography", "pradeshik-bhugol", "regional-planning"],
    keywords: ["प्रादेशिक भूगोल", "प्रादेशिक नियोजन", "regional geography"],
    bgClass: "bg-[#16A34A] hover:bg-[#15803D] text-white", // Forest Green
  },
  {
    id: "economic",
    label: "7. आर्थिक भूगोल",
    enLabel: "Economic Geography",
    slugPatterns: ["economic-geography", "aarthik-bhugol"],
    keywords: ["आर्थिक भूगोल", "economic geography"],
    bgClass: "bg-[#0D9488] hover:bg-[#0F766E] text-white", // Teal
  },
  {
    id: "human",
    label: "8. मानव भूगोल",
    enLabel: "Human Geography",
    slugPatterns: ["human-geography", "manav-bhugol"],
    keywords: ["मानव भूगोल", "human geography"],
    bgClass: "bg-[#E11D48] hover:bg-[#BE123C] text-white", // Rose Red
  },
  {
    id: "settlement",
    label: "9. ग्रामीण एवं नगरीय भूगोल",
    enLabel: "Settlement Geography",
    slugPatterns: ["settlement-geography", "gramin-nagariya-bhugol", "urban-geography"],
    keywords: ["ग्रामीण", "नगरीय भूगोल", "अधिवास भूगोल", "settlement geography"],
    bgClass: "bg-[#4F46E5] hover:bg-[#4338CA] text-white", // Indigo
  },
  {
    id: "environmental",
    label: "10. पर्यावरण भूगोल",
    enLabel: "Environmental Geography",
    slugPatterns: ["environmental-geography", "paryavaran-bhugol"],
    keywords: ["पर्यावरण भूगोल", "पारिस्थितिकी", "environmental geography"],
    bgClass: "bg-[#059669] hover:bg-[#047857] text-white", // Emerald Green
  },
  {
    id: "practical",
    label: "11. Practical Geography",
    enLabel: "Cartography & Practical",
    slugPatterns: ["practical-geography", "cartography", "prayogik-bhugol"],
    keywords: ["practical", "प्रायोगिक भूगोल", "मानचित्रण", "cartography"],
    bgClass: "bg-[#475569] hover:bg-[#334155] text-white", // Slate Gray
  },
  {
    id: "population",
    label: "12. जनसंख्या भूगोल",
    enLabel: "Population Geography",
    slugPatterns: ["population-geography", "jansankhya-bhugol"],
    keywords: ["जनसंख्या भूगोल", "जनसांख्यिकी", "population geography"],
    bgClass: "bg-[#C026D3] hover:bg-[#A21CAF] text-white", // Fuchsia
  },
  {
    id: "india",
    label: "13. भारत का भूगोल",
    enLabel: "Geography of India",
    slugPatterns: ["geography-of-india", "bharat-ka-bhugol", "indian-geography"],
    keywords: ["भारत का भूगोल", "भारतीय भूगोल", "geography of india"],
    bgClass: "bg-[#EA580C] hover:bg-[#C2410C] text-white", // Orange / Saffron
  },
];

export default function UpscPage() {
  const router = useRouter();

  const [activeTopic, setActiveTopic] = useState("geomorphology");
  const [allPages, setAllPages] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  const [selectedPageIndex, setSelectedPageIndex] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState("Download Notes PDF");
  const [activePostId, setActivePostId] = useState(null);

  const openDownloadModal = (title, postId) => {
    setModalAction(title);
    setActivePostId(postId);
    setModalOpen(true);
  };

  useEffect(() => {
    let isMounted = true;

    async function fetchWordPressData() {
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
          console.warn("Pages fetch error:", e.message);
        }

        try {
          const postsRes = await fetch(
            `${baseDomain}/wp-json/wp/v2/posts?_fields=id,date,title,excerpt,content,slug,acf,_links,_embed&_embed=wp:term&per_page=100`
          );
          if (postsRes.ok) {
            postsData = await postsRes.json();
          }
        } catch (e) {
          console.warn("Posts fetch error:", e.message);
        }

        if (!isMounted) return;

        setAllPages(Array.isArray(pagesData) ? pagesData : []);

        if (Array.isArray(postsData)) {
          const formattedPosts = postsData.map((p) => {
            const title = p.title?.rendered || "";
            const excerpt = p.excerpt?.rendered?.replace(/<[^>]+>/g, "").trim() || "";
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
        console.error("General error loading UPSC data:", err);
      } finally {
        if (isMounted) setDataLoading(false);
      }
    }

    fetchWordPressData();

    return () => {
      isMounted = false;
    };
  }, []);

  const currentTopicConfig = UPSC_TOPICS.find((t) => t.id === activeTopic) || UPSC_TOPICS[1];

  useEffect(() => {
    setSelectedPageIndex(0);
  }, [activeTopic]);

  function cleanAndRewriteWordPressLinks(html) {
    if (!html) return "";

    return html.replace(
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
          return `href="/${cleanPath}"`;
        }
        return `href="/read/${encodeURIComponent(cleanPath)}"`;
      }
    );
  }

  const topicPages = useMemo(() => {
    if (!allPages || allPages.length === 0) return [];

    if (activeTopic === "all") {
      return allPages.map((pg) => ({
        id: pg.id,
        title: pg.title?.rendered || "UPSC Geography Notes",
        slug: pg.slug || "",
        content: cleanAndRewriteWordPressLinks(pg.content?.rendered || ""),
      }));
    }

    return allPages
      .filter((pg) => {
        const slug = (pg.slug || "").toLowerCase();
        const title = (pg.title?.rendered || "").toLowerCase();
        const fullText = `${slug} ${title}`;

        const matchesPattern = currentTopicConfig.slugPatterns.some((pattern) =>
          fullText.includes(pattern.toLowerCase())
        );

        const matchesKeyword = currentTopicConfig.keywords.some((kw) =>
          fullText.includes(kw.toLowerCase())
        );

        return matchesPattern || matchesKeyword;
      })
      .map((pg) => ({
        id: pg.id,
        title: pg.title?.rendered || currentTopicConfig.label,
        slug: pg.slug || "",
        content: cleanAndRewriteWordPressLinks(pg.content?.rendered || ""),
      }));
  }, [allPages, currentTopicConfig, activeTopic]);

  const activePage = topicPages[selectedPageIndex] || topicPages[0] || null;

  const filteredPosts = useMemo(() => {
    if (!allPosts || allPosts.length === 0) return [];

    return allPosts.filter((p) => {
      if (activeTopic === "all") return true;

      const matchesKeyword = currentTopicConfig.keywords.some((kw) =>
        p.corpus.includes(kw.toLowerCase())
      );
      const matchesPattern = currentTopicConfig.slugPatterns.some((pattern) =>
        p.corpus.includes(pattern.toLowerCase())
      );

      return matchesKeyword || matchesPattern;
    });
  }, [allPosts, currentTopicConfig, activeTopic]);

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

      <Navbar />

      <section className="bg-[#CFD4DC] border-b border-gray-300 py-3">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-700 uppercase tracking-wider">Domain:</span>
            <span className="text-xs font-bold text-slate-900 bg-white/80 px-3 py-1 rounded-lg border border-gray-300 shadow-xs">
              UPSC Civil Services &amp; State PSCs (BPSC, UPPCS, MPPSC) Optional &amp; GS
            </span>
          </div>
          <span className="text-xs font-semibold text-slate-600 bg-white/50 px-3 py-1 rounded-full border border-gray-300 hidden sm:inline">
            Comprehensive Faculty Notes
          </span>
        </div>
      </section>

      {/* Full Solid Colored Box Buttons Strip */}
      <section className="border-b border-gray-300 bg-[#DFE2E8] py-2.5">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 flex items-center gap-2.5 overflow-x-auto text-[13px]">
          {UPSC_TOPICS.map((topic) => {
            const isSelected = activeTopic === topic.id;

            return (
              <button
                key={topic.id}
                onClick={() => setActiveTopic(topic.id)}
                className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all duration-150 cursor-pointer font-bold text-xs sm:text-[13px] shadow-sm flex items-center gap-2 border ${topic.bgClass} ${
                  isSelected
                    ? "ring-3 ring-amber-400 border-white scale-105"
                    : "opacity-90 hover:opacity-100 border-black/10"
                }`}
              >
                <span>{topic.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 py-8 w-full flex-1">
        {topicPages.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto mb-4 pb-2">
            <span className="text-xs font-black text-slate-600 uppercase tracking-wider whitespace-nowrap">
              पेज चुनें:
            </span>
            {topicPages.map((pg, idx) => (
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

        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-gray-200 mb-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 mb-6 border-b border-gray-100 gap-3">
            <div>
              <span className="text-[11px] font-extrabold text-[#B45309] uppercase tracking-wider block">
                UPSC Geography Optional • {currentTopicConfig.enLabel || "Syllabus & Material"}
              </span>
              <h2
                className="text-xl sm:text-2xl font-black text-slate-900"
                dangerouslySetInnerHTML={{
                  __html: activePage?.title || `${currentTopicConfig.label} Notes`,
                }}
              />
            </div>
            <button
              onClick={() =>
                openDownloadModal(
                  activePage?.title || `${currentTopicConfig.label} Notes`,
                  activePage?.id
                )
              }
              className="bg-[#0B2545] hover:bg-slate-900 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer shadow-xs whitespace-nowrap"
            >
              <Download className="w-4 h-4 text-amber-400" /> Save Page PDF
            </button>
          </div>

          {dataLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin text-[#E5A83B] mb-3" />
              <p className="text-xs font-semibold">Loading content...</p>
            </div>
          ) : !activePage ? (
            <div className="py-12 text-center text-slate-500">
              <BookOpen className="w-10 h-10 text-amber-500/50 mb-2 mx-auto" />
              <p className="text-xs font-bold text-slate-800">
                {currentTopicConfig.label} के मुख्य पेजेस लोड हो रहे हैं।
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                नीचे दिए गए अध्यायों और नोट्स को सीधे पढ़ सकते हैं।
              </p>
            </div>
          ) : (
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
          )}
        </div>

        <section className="w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-2">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {currentTopicConfig.label} — संबंधित नोट्स एवं प्रश्नोत्तर
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                High-yield diagrams, analytical notes, and model answers.
              </p>
            </div>
          </div>

          {dataLoading ? (
            <div className="bg-white rounded-3xl p-14 flex flex-col items-center justify-center text-slate-500 border border-gray-200">
              <Loader2 className="w-6 h-6 animate-spin text-[#E5A83B] mb-2" />
              <p className="text-xs font-semibold">Loading notes catalog...</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="bg-white/80 rounded-3xl p-12 text-center text-slate-500 border border-gray-200">
              <FileText className="w-10 h-10 text-amber-500/50 mb-2 mx-auto" />
              <h4 className="font-bold text-sm text-slate-800">
                सभी अध्याय ऊपर दिए गए पेज में लिंक हैं
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                ऊपर दिए गए टॉपिक विवरण में से किसी भी अध्याय पर क्लिक करके पढ़ें और PDF डाउनलोड करें।
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
                      UPSC / PSC Optional
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
                      href={`/read/${encodeURIComponent(item.slug)}`}
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