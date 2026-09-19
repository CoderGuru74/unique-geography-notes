"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Download, BookOpen, FileText, Eye, Lock, Loader2 } from "lucide-react";
import AuthModal from "../../../components/AuthModal";

// The 13 official syllabus categories from the legacy menu
const UPSC_SUB_TOPICS = [
  { id: "all", label: "सभी विषय (All Topics)", slugKey: "" },
  { id: "geomorphology", label: "1. भू-आकृति विज्ञान", slugKey: "geomorphology" },
  { id: "climatology", label: "2. जलवायु विज्ञान", slugKey: "climatology" },
  { id: "oceanography", label: "3. समुद्र विज्ञान", slugKey: "ocenography" },
  { id: "thought", label: "4. भौगोलिक चिंतन", slugKey: "geographical thought" },
  { id: "political", label: "5. राजनीतिक भूगोल", slugKey: "political geography" },
  { id: "regional", label: "6. प्रादेशिक भूगोल", slugKey: "regional geography" },
  { id: "economic", label: "7. आर्थिक भूगोल", slugKey: "economic geography" },
  { id: "human", label: "8. मानव भूगोल", slugKey: "human geography" },
  { id: "settlement", label: "9. ग्रामीण एवं नगरीय भूगोल", slugKey: "settlement geography" },
  { id: "environmental", label: "10. पर्यावरण भूगोल", slugKey: "environmental geography" },
  { id: "practical", label: "11. Practical Geography", slugKey: "cartography" },
  { id: "population", label: "12. जनसंख्या भूगोल", slugKey: "population geography" },
  { id: "india", label: "13. भारत का भूगोल", slugKey: "geography of india" },
];

const EXAM_PILLS = [
  { id: "all", label: "All Civil Services", keys: [] },
  { id: "upsc", label: "UPSC CSE (IAS)", keys: ["upsc", "ias", "civil services"] },
  { id: "bpsc", label: "BPSC (Bihar PSC)", keys: ["bpsc", "bihar", "बिहार"] },
  { id: "uppsc", label: "UPPSC / State PSC", keys: ["uppsc", "mppsc", "ras", "state psc", "psc"] },
  { id: "optional-1", label: "Geography Optional Paper 1", keys: ["optional paper 1", "geomorphology", "climatology", "oceanography", "thought"] },
  { id: "optional-2", label: "Geography Optional Paper 2", keys: ["optional paper 2", "geography of india", "economic geography", "regional"] },
  { id: "gs-1", label: "GS Paper 1 (Geography)", keys: ["gs paper 1", "gs-1", "general studies"] },
];

export default function UPSCPage() {
  const [activeTopic, setActiveTopic] = useState("all");
  const [activePill, setActivePill] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState("Download PDF");

  const openAuthPaywall = (actionName) => {
    setModalAction(actionName);
    setModalOpen(true);
  };

  useEffect(() => {
    let isCancelled = false;

    async function loadUPSCContent() {
      const wpUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL;
      if (!wpUrl) {
        if (!isCancelled) setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // High-speed optimized fetch: Strips heavy post content bodies and runs pages in parallel
        const fields = "_fields=id,date,title,excerpt,categories,acf,_links.wp:term";
        
        const [res1, res2] = await Promise.allSettled([
          fetch(`${wpUrl}/wp-json/wp/v2/posts?_embed=wp:term&per_page=100&page=1&${fields}`),
          fetch(`${wpUrl}/wp-json/wp/v2/posts?_embed=wp:term&per_page=100&page=2&${fields}`)
        ]);

        const page1 = res1.status === "fulfilled" && res1.value.ok ? await res1.value.json() : [];
        const page2 = res2.status === "fulfilled" && res2.value.ok ? await res2.value.json() : [];

        const allPosts = [...(Array.isArray(page1) ? page1 : []), ...(Array.isArray(page2) ? page2 : [])];

        if (!isCancelled && Array.isArray(allPosts)) {
          const upscPosts = [];

          allPosts.forEach((p) => {
            const title = p.title?.rendered || "";
            const titleLower = title.toLowerCase();

            // Extract terms
            const wpTerms = p._embedded?.["wp:term"] || [];
            const termNames = [];
            const termSlugs = [];

            if (Array.isArray(wpTerms)) {
              wpTerms.forEach((group) => {
                if (Array.isArray(group)) {
                  group.forEach((t) => {
                    if (t?.name) termNames.push(t.name.toLowerCase());
                    if (t?.slug) termSlugs.push(t.slug.toLowerCase());
                  });
                }
              });
            }

            const catText = [...termNames, ...termSlugs].join(" ");
            const metaCorpus = [titleLower, catText, (p.acf?.sub_topic || "").toLowerCase()].join(" ");

            // 1. HARD EXCLUSION: Reject anything that is strictly CTET, School Board, or NET Paper 1
            const isForbidden =
              catText.includes("ctet") ||
              catText.includes("btet") ||
              catText.includes("stet") ||
              catText.includes("bseb") ||
              catText.includes("ncert") ||
              catText.includes("ugc net/jrf paper 1") ||
              titleLower.includes("ctet") ||
              titleLower.includes("bseb") ||
              titleLower.includes("ncert") ||
              titleLower.includes("ugc net/jrf paper-i");

            if (isForbidden) return;

            // 2. INCLUSION CHECK: Does it match one of our 13 Geography domains or Civil Services?
            const isUPSCGeography =
              catText.includes("geomorphology") ||
              catText.includes("भू-आकृति") ||
              catText.includes("climatology") ||
              catText.includes("जलवायु") ||
              catText.includes("oceanography") ||
              catText.includes("ocenography") ||
              catText.includes("समुद्र") ||
              catText.includes("geographical thought") ||
              catText.includes("भौगोलिक चिंतन") ||
              catText.includes("political geography") ||
              catText.includes("regional geography") ||
              catText.includes("economic geography") ||
              catText.includes("human geography") ||
              catText.includes("मानव भूगोल") ||
              catText.includes("settlement geography") ||
              catText.includes("बस्ती भूगोल") ||
              catText.includes("environmental geography") ||
              catText.includes("पर्यावरण भूगोल") ||
              catText.includes("cartography") ||
              catText.includes("मानचित्र") ||
              catText.includes("population geography") ||
              catText.includes("जनसंख्या भूगोल") ||
              catText.includes("geography of india") ||
              catText.includes("भारत का भूगोल") ||
              catText.includes("bpsc") ||
              titleLower.includes("bpsc") ||
              titleLower.includes("upsc");

            if (!isUPSCGeography) return;

            // Determine primary category tag
            let displayBadge = "Civil Services Geography";
            if (catText.includes("geomorphology")) displayBadge = "भू-आकृति विज्ञान";
            else if (catText.includes("climatology")) displayBadge = "जलवायु विज्ञान";
            else if (catText.includes("oceanography") || catText.includes("ocenography")) displayBadge = "समुद्र विज्ञान";
            else if (catText.includes("geographical thought")) displayBadge = "भौगोलिक चिंतन";
            else if (catText.includes("political geography")) displayBadge = "राजनीतिक भूगोल";
            else if (catText.includes("regional geography")) displayBadge = "प्रादेशिक भूगोल";
            else if (catText.includes("economic geography")) displayBadge = "आर्थिक भूगोल";
            else if (catText.includes("human geography")) displayBadge = "मानव भूगोल";
            else if (catText.includes("settlement geography")) displayBadge = "ग्रामीण एवं नगरीय भूगोल";
            else if (catText.includes("environmental geography")) displayBadge = "पर्यावरण भूगोल";
            else if (catText.includes("cartography")) displayBadge = "Practical Geography";
            else if (catText.includes("population geography")) displayBadge = "जनसंख्या भूगोल";
            else if (catText.includes("geography of india")) displayBadge = "भारत का भूगोल";
            else if (catText.includes("bpsc")) displayBadge = "BPSC Mains Optional";

            const dateObj = new Date(p.date);
            const dateStr = dateObj.toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            });

            upscPosts.push({
              id: p.id,
              index: String(upscPosts.length + 1).padStart(2, "0"),
              title: title,
              badge: displayBadge,
              chapters: p.acf?.chapters ? `${p.acf.chapters} Chapters` : "Civil Services Module",
              pages: p.acf?.pages ? `${p.acf.pages} Pages` : "PDF Notes",
              size: p.acf?.file_size || "4.2 MB",
              date: dateStr,
              metaCorpus: metaCorpus,
              desc: p.excerpt?.rendered?.replace(/<[^>]+>/g, "").trim() || "",
            });
          });

          setItems(upscPosts);
        }
      } catch (err) {
        console.error("Error loading UPSC notes:", err);
        if (!isCancelled) setItems([]);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    loadUPSCContent();

    return () => {
      isCancelled = true;
    };
  }, []);

  // Strict topic and exam filtering
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const q = searchQuery.trim().toLowerCase();
      const text = item.metaCorpus || "";

      // 1. Text Search Filter
      const matchesSearch = q === "" || text.includes(q);

      // 2. Sub-Topic Strip (13 Geography Categories)
      let matchesTopic = true;
      if (activeTopic !== "all") {
        const topicObj = UPSC_SUB_TOPICS.find((t) => t.id === activeTopic);
        if (topicObj && topicObj.slugKey) {
          matchesTopic = text.includes(topicObj.slugKey.toLowerCase()) || item.badge === topicObj.label.replace(/^\d+\.\s*/, "");
        }
      }

      // 3. Exam Target Pills
      let matchesPill = true;
      if (activePill !== "all") {
        const pillObj = EXAM_PILLS.find((p) => p.id === activePill);
        if (pillObj && pillObj.keys.length > 0) {
          matchesPill = pillObj.keys.some((k) => text.includes(k.toLowerCase()));
        }
      }

      return matchesSearch && matchesTopic && matchesPill;
    });
  }, [items, searchQuery, activeTopic, activePill]);

  return (
    <main className="min-h-screen flex flex-col bg-[#E5E9EF] font-sans text-slate-900">
      <AuthModal isOpen={modalOpen} onClose={() => setModalOpen(false)} targetAction={modalAction} />

      {/* Header */}
      <header className="w-full bg-[#E5E7EB]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 pt-5 pb-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-full overflow-hidden border border-gray-300 flex-shrink-0 bg-white">
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
              placeholder="Search Geography Optional & GS notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white text-xs pl-10 pr-4 py-2.5 rounded-md border border-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#E5A83B]"
            />
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          </div>
        </div>

        {/* Global Navigation Strip */}
        <nav className="border-t border-b border-gray-300 bg-[#DFE2E8]">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 flex items-center gap-8 overflow-x-auto text-[14px] font-medium text-slate-900">
            <Link href="/" className="py-3 px-1 hover:text-black">Home</Link>
            
            <div className="relative py-3 flex flex-col items-center">
              <Link href="/category/upsc" className="font-bold text-slate-950 px-1">UPSC &amp; All PSC</Link>
              <span className="absolute bottom-0 left-1 right-1 h-[2.5px] bg-[#E5A83B] rounded-full" />
            </div>

            <Link href="/category/school" className="py-3 px-1 hover:text-black">School Notes</Link>
            <Link href="/category/exams" className="py-3 px-1 hover:text-black">Exams (CTET, UGC-NET)</Link>
            <Link href="/category/university" className="py-3 px-1 hover:text-black">University Notes</Link>
            <Link href="/category/gc" className="py-3 px-1 hover:text-black">GC</Link>
          </div>
        </nav>
      </header>

      {/* Hero Banner with Exam Pills */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 pt-6 pb-6 w-full">
        <div className="text-xs font-semibold text-slate-500 mb-3 flex items-center gap-1.5">
          <Link href="/" className="hover:underline">Home</Link>
          <span>›</span>
          <span className="text-[#E5A83B]">UPSC &amp; All PSC</span>
        </div>

        <div className="bg-[#EFE5D5] rounded-3xl p-6 sm:p-10 border border-amber-200/70 shadow-sm mb-6">
          <span className="text-xs font-bold text-[#B45309] uppercase tracking-wider block mb-1">
            Civil Services &amp; State PSC Preparation
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-[38px] font-extrabold text-[#111827] leading-[1.2] tracking-tight mb-2">
            UPSC &amp; All PSC Geography (भूगोल सिविल सेवा नोट्स)
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed max-w-3xl mb-6">
            Complete syllabus coverage for Geography Optional Paper 1 &amp; 2, GS Paper 1, BPSC, UPPSC, and State Administrative Services.
          </p>

          {/* Exam Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {EXAM_PILLS.map((pill) => (
              <button
                key={pill.id}
                onClick={() => setActivePill(pill.id)}
                className={`text-xs px-4 py-2.5 rounded-xl font-bold transition shadow-sm cursor-pointer ${
                  activePill === pill.id
                    ? "bg-[#0B2545] text-white shadow"
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-gray-300"
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 13 Sub-Topics Horizontal Navigation Strip */}
      <section className="border-t border-b border-gray-300 bg-[#DFE2E8]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 flex items-center gap-7 overflow-x-auto text-[13px] font-semibold text-slate-700">
          {UPSC_SUB_TOPICS.map((topic) => (
            <button
              key={topic.id}
              onClick={() => setActiveTopic(topic.id)}
              className={`py-3.5 px-1 whitespace-nowrap transition cursor-pointer ${
                activeTopic === topic.id
                  ? "border-b-2 border-[#E5A83B] text-slate-950 font-bold"
                  : "hover:text-black"
              }`}
            >
              {topic.label}
            </button>
          ))}
        </div>
      </section>

      {/* Grid of Notes */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 py-8 w-full flex-1">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Geography Study Modules &amp; Notes
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Showing {filteredItems.length} civil services notes available
            </p>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-3xl p-16 flex flex-col items-center justify-center text-slate-500 border border-gray-200">
            <Loader2 className="w-8 h-8 animate-spin text-[#E5A83B] mb-3" />
            <p className="text-xs font-semibold">Loading civil services study material...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white/80 rounded-3xl p-14 text-center text-slate-500 border border-gray-200">
            <BookOpen className="w-12 h-12 text-amber-500/50 mb-3 mx-auto" />
            <h4 className="font-bold text-base text-slate-800 mb-1">No Notes Found</h4>
            <p className="text-xs text-slate-500 max-w-md mb-4 mx-auto">
              No notes match the active topic or examination filter.
            </p>
            <button
              onClick={() => {
                setActiveTopic("all");
                setActivePill("all");
                setSearchQuery("");
              }}
              className="px-4 py-2 bg-[#0B2545] text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-gray-200/80 flex flex-col justify-between hover:shadow-md transition"
              >
                <div>
                  <span className="inline-block bg-[#FEF3C7] text-[#B45309] text-[11px] font-extrabold px-3 py-1 rounded-md mb-4 border border-amber-200">
                    {item.badge}
                  </span>

                  <h4
                    className="font-extrabold text-base sm:text-lg text-slate-900 leading-snug mb-3 line-clamp-2"
                    dangerouslySetInnerHTML={{ __html: item.title }}
                  />

                  {item.desc && (
                    <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                      {item.desc}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-[11px] text-slate-500 font-medium mb-6">
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                      {item.chapters}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      {item.pages}
                    </span>
                    <span className="flex items-center gap-1.5">📦 {item.size}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-4 border-t border-gray-100">
                  <Link
                    href={`/read/${item.id}`}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" /> Read Free
                  </Link>

                  <button
                    onClick={() => openAuthPaywall(`Download ${item.title}`)}
                    className="bg-[#E5A83B] hover:bg-[#d49425] text-slate-950 font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Download Table */}
        {filteredItems.length > 0 && (
          <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200 mb-16">
            <div className="mb-6">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-1">
                One–Liner Quick Download Table
              </h3>
              <p className="text-xs text-slate-500">
                Read summary on-site or unlock one-click PDF downloads.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Topic / PDF Title</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Pages</th>
                    <th className="py-3 px-4">Size</th>
                    <th className="py-3 px-4">Updated</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {filteredItems.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-400">{row.index}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 max-w-sm">
                        <span dangerouslySetInnerHTML={{ __html: row.title }} />
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded text-[10px] border border-amber-200">
                          {row.badge}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{row.pages}</td>
                      <td className="py-3.5 px-4 text-slate-600">{row.size}</td>
                      <td className="py-3.5 px-4 text-slate-400 text-[11px]">{row.date}</td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/read/${row.id}`}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3 py-1.5 rounded-lg text-[11px] transition flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" /> Read
                          </Link>
                          <button
                            onClick={() => openAuthPaywall(`Download ${row.title}`)}
                            className="bg-[#E5A83B] hover:bg-[#d49425] text-slate-950 font-bold px-3 py-1.5 rounded-lg text-[11px] transition shadow-xs flex items-center gap-1 cursor-pointer"
                          >
                            <Download className="w-3 h-3" /> Download
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}