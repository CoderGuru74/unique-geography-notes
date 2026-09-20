"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Search, 
  ChevronRight, 
  CheckCircle2, 
  FileText, 
  HelpCircle, 
  Zap, 
  Download,
  BookOpen,
  Eye,
  Loader2
} from "lucide-react";
import Navbar from "../../../../components/Navbar";
import AuthModal from "../../../../components/AuthModal";

const LOWER_SECONDARY = [
  { grade: "6", title: "BSEB Class 6 Social Science", sub: "Social Science • History • Geography • Civics", color: "bg-[#E0F2FE] text-[#0369A1]", slug: "bseb-class-6" },
  { grade: "7", title: "BSEB Class 7 Social Science", sub: "Social Science • History • Geography • Political Science", color: "bg-[#FEF3C7] text-[#B45309]", slug: "bseb-class-7" },
  { grade: "8", title: "BSEB Class 8 Social Science", sub: "Social Science • History • Geography • Civics", color: "bg-[#DCFCE7] text-[#15803D]", slug: "bseb-class-8" },
  { grade: "9", title: "BSEB Class 9 Social Science", sub: "Social Science • History • Geography • Economics • Civics", color: "bg-[#FEE2E2] text-[#B91C1C]", slug: "bseb-class-9" },
  { grade: "10", title: "BSEB Class 10 Social Science", sub: "Social Science (Board) • History • Geography • Economics • Civics", color: "bg-[#F3E8FF] text-[#7E22CE]", slug: "bseb-class-10" },
];

const HIGHER_SECONDARY = [
  { grade: "11", title: "BSEB Class 11 Geography", sub: "Fundamentals of Physical Geography • India – Physical Environment • Human", color: "bg-[#E0F2FE] text-[#0369A1]", slug: "bseb-class-11" },
  { grade: "12", title: "BSEB Class 12 Geography", sub: "Practical Work in Geography • India – People & Economy • Fundamentals of", color: "bg-[#FEF3C7] text-[#B45309]", slug: "bseb-class-12" },
];

const SPECIAL_RESOURCES = [
  {
    id: "chapter-notes",
    title: "Chapter–wise Notes",
    desc: "Detailed chapter-by-chapter notes covering every topic in the BSEB Social Science & Geography syllabus, with diagrams and key concepts highlighted.",
    tag: "NOTES",
    tagColor: "bg-[#2563EB] text-white",
    borderColor: "border-t-4 border-t-[#2563EB]",
    icon: FileText,
    iconColor: "text-[#2563EB] bg-[#EFF6FF]",
    badges: ["Class 6–12", "Hindi & English", "PDF Download"],
    buttonText: "Download Notes",
    fileKey: "bseb_chapter_notes_pdf",
  },
  {
    id: "model-papers",
    title: "Model Question Papers (BSEB Pattern)",
    desc: "Practice with papers strictly following BSEB Patna examination format — section-wise marks, question types, and time distribution mirroring actual board exams.",
    tag: "QUESTION PAPERS",
    tagColor: "bg-[#DC2626] text-white",
    borderColor: "border-t-4 border-t-[#DC2626]",
    icon: FileText,
    iconColor: "text-[#DC2626] bg-[#FEF2F2]",
    badges: ["BSEB Pattern", "2020–2026", "Answer Key Included"],
    buttonText: "Get Question Papers",
    fileKey: "bseb_model_papers_pdf",
  },
  {
    id: "objective-mcqs",
    title: "Objective Questions (MCQs PDF)",
    desc: "1000+ chapter-wise MCQs with detailed explanations, formatted as per BSEB objective section. Ideal for rapid revision and self-testing.",
    tag: "MCQs",
    tagColor: "bg-[#16A34A] text-white",
    borderColor: "border-t-4 border-t-[#16A34A]",
    icon: HelpCircle,
    iconColor: "text-[#16A34A] bg-[#F0FDF4]",
    badges: ["1000+ MCQs", "Chapter-wise", "Solved"],
    buttonText: "Download MCQ PDF",
    fileKey: "bseb_mcq_pdf",
  },
  {
    id: "cheat-sheets",
    title: "High–Yield Board Revision Cheat Sheets",
    desc: "Compact one-page cheat sheets for each chapter — key dates, important terms, map points, and facts most likely to appear in BSEB board exams.",
    tag: "REVISION",
    tagColor: "bg-[#7C3AED] text-white",
    borderColor: "border-t-4 border-t-[#7C3AED]",
    icon: Zap,
    iconColor: "text-[#7C3AED] bg-[#F5F3FF]",
    badges: ["1-Page / Chapter", "Board Focused", "Quick Revision"],
    buttonText: "Get Cheat Sheets",
    fileKey: "bseb_cheatsheets_pdf",
  },
];

export default function BSEBPage() {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [activeClassFilter, setActiveClassFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [categories, setCategories] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState("Download PDF");
  const [activePostId, setActivePostId] = useState(null);

  const notesSectionRef = useRef(null);

  const openAuthPaywall = (actionName, postId = null) => {
    setModalAction(actionName);
    setActivePostId(postId);
    setModalOpen(true);
  };

  const handleSelectClass = (grade) => {
    setActiveClassFilter(grade);
    setSelectedClass(grade ? `class-${grade}` : "");
    if (notesSectionRef.current) {
      notesSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleQuickFinder = (e) => {
    e.preventDefault();
    if (selectedClass) {
      const parsedNum = selectedClass.replace("class-", "");
      setActiveClassFilter(parsedNum);
    } else {
      setActiveClassFilter("all");
    }
    if (notesSectionRef.current) {
      notesSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // 1. Fetch categories to discover exact WordPress Category IDs for BSEB
  useEffect(() => {
    async function loadCategories() {
      const wpUrl = (process.env.NEXT_PUBLIC_WORDPRESS_URL || "https://www.geographynotespdf.com").replace(/\/+$/, "");

      try {
        const res = await fetch(`${wpUrl}/wp-json/wp/v2/categories?per_page=100&hide_empty=false`);
        if (!res.ok) return;
        const cats = await res.json();
        if (Array.isArray(cats)) {
          setCategories(cats);
        }
      } catch (err) {
        console.error("Error loading categories:", err);
      }
    }
    loadCategories();
  }, []);

  // 2. Query posts targeted strictly to BSEB
  useEffect(() => {
    async function fetchBSEBContent() {
      const wpUrl = (process.env.NEXT_PUBLIC_WORDPRESS_URL || "https://www.geographynotespdf.com").replace(/\/+$/, "");

      setLoading(true);
      try {
        const matchedCategoryIds = [];

        categories.forEach((c) => {
          const s = (c.slug || "").toLowerCase();
          const n = (c.name || "").toLowerCase();

          const isBSEB = s.includes("bseb") || n.includes("bseb") || n.includes("बिहार");
          if (!isBSEB) return;

          if (activeClassFilter === "all") {
            matchedCategoryIds.push(c.id);
          } else {
            const matchesClass =
              s.includes(`class-${activeClassFilter}`) ||
              s.includes(`class${activeClassFilter}`) ||
              n.includes(`class ${activeClassFilter}`) ||
              n.includes(`वर्ग-${activeClassFilter}`) ||
              n.includes(`वर्ग ${activeClassFilter}`) ||
              n.includes(`${activeClassFilter}वीं`);

            if (matchesClass) {
              matchedCategoryIds.push(c.id);
            }
          }
        });

        let url = `${wpUrl}/wp-json/wp/v2/posts?_embed&per_page=100`;

        if (matchedCategoryIds.length > 0) {
          url += `&categories=${matchedCategoryIds.join(",")}`;
        } else if (activeClassFilter !== "all") {
          url += `&search=${encodeURIComponent(`बिहार बोर्ड class ${activeClassFilter}`)}`;
        }

        const res = await fetch(url);
        let rawPosts = res.ok ? await res.json() : [];

        // Fallback search if zero category matches found
        if ((!Array.isArray(rawPosts) || rawPosts.length === 0) && activeClassFilter !== "all") {
          const fallbackRes = await fetch(
            `${wpUrl}/wp-json/wp/v2/posts?search=${encodeURIComponent(`BSEB ${activeClassFilter}`)}&per_page=100&_embed`
          );
          if (fallbackRes.ok) {
            rawPosts = await fallbackRes.json();
          }
        }

        if (Array.isArray(rawPosts)) {
          const formatted = rawPosts.map((p) => {
            const title = p.title?.rendered || "";
            const titleLower = title.toLowerCase();

            // Detect Class Number
            let classNum = activeClassFilter !== "all" ? activeClassFilter : "";
            if (!classNum) {
              const match = titleLower.match(/class\s*[-–]?\s*(6|7|8|9|10|11|12)/i) ||
                            titleLower.match(/वर्ग\s*[-–]?\s*(6|7|8|9|10|11|12)/i) ||
                            titleLower.match(/(6|7|8|9|10|11|12)वीं/i);
              if (match) classNum = match[1];
            }

            // Detect Subject
            let subject = "Social Science";
            if (titleLower.includes("geography") || titleLower.includes("भूगोल")) subject = "Geography";
            else if (titleLower.includes("history") || titleLower.includes("इतिहास")) subject = "History";
            else if (titleLower.includes("civics") || titleLower.includes("नागरिक") || titleLower.includes("polity")) subject = "Civics";
            else if (titleLower.includes("economics") || titleLower.includes("अर्थशास्त्र")) subject = "Economics";

            return {
              id: p.id,
              slug: p.slug || String(p.id),
              title: title,
              classNum: classNum,
              subject: subject,
              badge: `BSEB Class ${classNum || "Notes"}`,
              chapters: p.acf?.chapters ? `${p.acf.chapters} Chapters` : "Solutions & Notes",
              pages: p.acf?.pages ? `${p.acf.pages} Pages` : "PDF Notes",
              size: p.acf?.file_size || "4.2 MB",
              desc: p.excerpt?.rendered?.replace(/<[^>]+>/g, "").trim() || "",
            };
          });

          setPosts(formatted);
        } else {
          setPosts([]);
        }
      } catch (err) {
        console.error("Error loading BSEB posts:", err);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchBSEBContent();
  }, [activeClassFilter, categories]);

  // Filtered display items
  const displayedPosts = useMemo(() => {
    return posts.filter((item) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        q === "" ||
        item.title.toLowerCase().includes(q) ||
        item.desc.toLowerCase().includes(q);

      let matchesSubject = true;
      if (selectedSubject) {
        matchesSubject = item.subject.toLowerCase() === selectedSubject.toLowerCase();
      }

      return matchesSearch && matchesSubject;
    });
  }, [posts, searchQuery, selectedSubject]);

  return (
    <main className="min-h-screen flex flex-col bg-[#E5E9EF] font-sans text-slate-900">
      <AuthModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        targetAction={modalAction}
        postId={activePostId}
        contentElementId={null}
      />

      {/* Reusable Navbar */}
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {/* Board Selector Strip */}
      <section className="bg-[#CFD4DC] border-b border-gray-300 py-3">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
              Choose Board:
            </span>
            <div className="inline-flex p-1 bg-white/80 rounded-xl border border-gray-300 shadow-sm">
              <Link
                href="/category/school/bseb"
                className="text-xs font-bold px-6 py-2 rounded-lg bg-[#0B2545] text-white shadow"
              >
                BSEB (Bihar Board)
              </Link>
              <Link
                href="/category/school/cbse"
                className="text-xs font-bold px-6 py-2 rounded-lg text-slate-600 hover:text-black transition"
              >
                CBSE (NCERT)
              </Link>
            </div>
          </div>
          <span className="text-xs font-semibold text-slate-600 bg-white/50 px-3 py-1 rounded-full border border-gray-300 hidden sm:inline">
            Active: <strong>BSEB Patna Syllabus</strong>
          </span>
        </div>
      </section>

      {/* Hero Section */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 pt-6 pb-10 w-full">
        <div className="text-xs font-semibold text-slate-500 mb-3 flex items-center gap-1.5">
          <Link href="/" className="hover:underline">Home</Link>
          <span>›</span>
          <Link href="/category/school/bseb" className="hover:underline">School Notes</Link>
          <span>›</span>
          <span className="text-[#E5A83B]">Bihar Board</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7">
            <h2 className="text-3xl sm:text-4xl md:text-[38px] font-extrabold text-[#111827] leading-[1.2] tracking-tight mb-2">
              BSEB Class 6th to 12th Social Science &amp; Geography Notes
            </h2>
            <p className="text-lg font-bold text-[#E5A83B] mb-3">
              (Hindi &amp; English Medium)
            </p>
            <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed max-w-xl">
              Comprehensive chapter-wise notes strictly aligned with Bihar School Examination Board (BSEB), Patna syllabus. Available in both Hindi &amp; English medium.
            </p>
          </div>

          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-[440px] aspect-[4/3] rounded-2xl overflow-hidden shadow-sm border border-slate-300/60 bg-white">
              <Image
                src="/images/banner.jpg"
                alt="School Notes Banner"
                fill
                sizes="(max-width: 768px) 100vw, 440px"
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* BSEB Board Optimized Strip */}
      <section className="bg-[#D2D6DC] border-t border-b border-gray-300 py-3.5 px-4 sm:px-6 md:px-8">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-start md:items-center gap-3 text-xs text-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#E5A83B] flex items-center justify-center text-slate-950 font-bold flex-shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="font-extrabold whitespace-nowrap">
              BSEB Patna Board Optimized
            </span>
          </div>
          <div className="border-l-0 md:border-l border-slate-400 pl-0 md:pl-3 flex flex-col gap-0.5 text-slate-700">
            <span>
              <strong>English:</strong> All study material is strictly optimized for Bihar School Examination Board (BSEB), Patna examination patterns and syllabus.
            </span>
            <span className="text-[11px]">
              <strong>हिंदी:</strong> सभी अध्ययन सामग्री बिहार विद्यालय परीक्षा समिति (BSEB), पटना परीक्षा पैटर्न और पाठ्यक्रम के अनुसार तैयार की गई है।
            </span>
          </div>
        </div>
      </section>

      {/* Choose Your Class Section */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 py-10 w-full">
        <div className="bg-[#F8EFE3] rounded-3xl p-6 sm:p-10 border border-amber-200/60 shadow-sm">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Choose Your Class
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Select class to access BSEB-aligned notes and study material.
              </p>
            </div>
            {activeClassFilter !== "all" && (
              <button
                onClick={() => handleSelectClass("all")}
                className="text-xs font-bold text-slate-700 bg-white px-4 py-2 rounded-xl border border-gray-300 hover:bg-slate-50 self-start sm:self-auto cursor-pointer"
              >
                Reset Class Selection (Show All)
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Column 1: Lower Secondary */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-[#0B2545] text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                  Lower Secondary
                </span>
                <span className="text-xs font-semibold text-slate-600">
                  Class 6–10 • Social Science
                </span>
              </div>

              {LOWER_SECONDARY.map((item) => (
                <div
                  key={item.grade}
                  onClick={() => handleSelectClass(item.grade)}
                  className={`bg-white rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-sm hover:shadow-md transition border cursor-pointer group ${
                    activeClassFilter === item.grade
                      ? "border-[#0B2545] ring-2 ring-[#0B2545]/20"
                      : "border-gray-200/80"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm flex-shrink-0 ${item.color}`}>
                      {item.grade}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-[#0B2545] transition">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-1">{item.sub}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition" />
                </div>
              ))}
            </div>

            {/* Column 2: Higher Secondary */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-[#0B2545] text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                  Higher Secondary
                </span>
                <span className="text-xs font-semibold text-slate-600">
                  Class 11–12 • Geography Specialist
                </span>
              </div>

              {HIGHER_SECONDARY.map((item) => (
                <div
                  key={item.grade}
                  onClick={() => handleSelectClass(item.grade)}
                  className={`bg-white rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-sm hover:shadow-md transition border cursor-pointer group ${
                    activeClassFilter === item.grade
                      ? "border-[#0B2545] ring-2 ring-[#0B2545]/20"
                      : "border-gray-200/80"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm flex-shrink-0 ${item.color}`}>
                      {item.grade}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-[#0B2545] transition">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-1">{item.sub}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition" />
                </div>
              ))}

              {/* Geography Specialist Track Box */}
              <div className="bg-[#0A192F] rounded-2xl p-6 text-white shadow-sm mt-2 flex flex-col justify-between">
                <div>
                  <h4 className="font-black text-base mb-2 text-white">
                    Geography Specialist Track
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed mb-6">
                    Class 11 &amp; 12 Geography is a standalone subject in BSEB Higher Secondary. These notes cover both NCERT content and BSEB board exam patterns in depth.
                  </p>
                </div>
                <div>
                  <button 
                    onClick={() => handleSelectClass("11")}
                    className="bg-[#E5A83B] hover:bg-[#d49425] text-slate-950 font-extrabold text-xs px-5 py-2.5 rounded-xl transition shadow-sm cursor-pointer"
                  >
                    View Geography Notes →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Special Resources Section */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 py-8 w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-8">
          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              BSEB Exam Special Resources
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              Curated study material aligned with Bihar Board (BSEB) exam patterns
            </p>
          </div>
          <span 
            onClick={() => handleSelectClass("all")}
            className="text-xs font-bold text-slate-700 cursor-pointer hover:text-black"
          >
            View All Resources →
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SPECIAL_RESOURCES.map((res) => {
            const Icon = res.icon;
            return (
              <div
                key={res.id}
                className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-200/80 flex flex-col justify-between ${res.borderColor}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${res.iconColor}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${res.tagColor}`}>
                      {res.tag}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-base text-slate-900 leading-snug mb-3">
                    {res.title}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed mb-6">
                    {res.desc}
                  </p>
                </div>

                <div>
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {res.badges.map((b, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md"
                      >
                        {b}
                      </span>
                    ))}
                  </div>

                  <button 
                    onClick={() => openAuthPaywall(res.title)}
                    className="w-full bg-[#0A192F] hover:bg-slate-800 text-white font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    {res.buttonText}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Direct PDF Quick Finder */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 py-8 w-full">
        <div className="bg-[#D1D5DB] rounded-3xl p-8 sm:p-10 text-center shadow-inner">
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-6">
            Direct PDF Quick Finder
          </h3>

          <form onSubmit={handleQuickFinder} className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-2xl mx-auto">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full sm:w-1/2 bg-white text-xs px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#E5A83B]"
            >
              <option value="">Select Exam/Class</option>
              <option value="class-6">Class 6</option>
              <option value="class-7">Class 7</option>
              <option value="class-8">Class 8</option>
              <option value="class-9">Class 9</option>
              <option value="class-10">Class 10</option>
              <option value="class-11">Class 11</option>
              <option value="class-12">Class 12</option>
            </select>

            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full sm:w-1/2 bg-white text-xs px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#E5A83B]"
            >
              <option value="">Select Subject / Chapter</option>
              <option value="geography">Geography (भूगोल)</option>
              <option value="history">History (इतिहास)</option>
              <option value="civics">Civics (नागरिक शास्त्र)</option>
              <option value="economics">Economics (अर्थशास्त्र)</option>
            </select>

            <button
              type="submit"
              className="w-full sm:w-auto bg-[#E5A83B] hover:bg-[#d49425] text-slate-950 font-bold text-xs px-8 py-3 rounded-xl shadow transition whitespace-nowrap cursor-pointer"
            >
              Find Notes Now
            </button>
          </form>
        </div>
      </section>

      {/* Live Chapters List From WordPress */}
      <section ref={notesSectionRef} className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 py-8 w-full flex-1 mb-16">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Bihar Board (BSEB) Chapter Notes
              {activeClassFilter !== "all" && ` — Class ${activeClassFilter}`}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Showing {displayedPosts.length} syllabus notes from WordPress
            </p>
          </div>
          {activeClassFilter !== "all" && (
            <button
              onClick={() => handleSelectClass("all")}
              className="text-xs font-bold text-slate-700 bg-white px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-slate-50 cursor-pointer"
            >
              Clear Filter
            </button>
          )}
        </div>

        {loading ? (
          <div className="bg-white rounded-3xl p-16 flex flex-col items-center justify-center text-slate-500 border border-gray-200">
            <Loader2 className="w-8 h-8 animate-spin text-[#E5A83B] mb-3" />
            <p className="text-xs font-semibold">Loading BSEB content directly from WordPress...</p>
          </div>
        ) : displayedPosts.length === 0 ? (
          <div className="bg-white/80 rounded-3xl p-14 text-center text-slate-500 border border-gray-200">
            <BookOpen className="w-12 h-12 text-amber-500/50 mb-3 mx-auto" />
            <h4 className="font-bold text-base text-slate-800 mb-1">
              No Notes Found for Class {activeClassFilter}
            </h4>
            <p className="text-xs text-slate-500 max-w-md mb-4 mx-auto">
              No notes are currently published under this class. Select another class or clear filters.
            </p>
            <button
              onClick={() => handleSelectClass("all")}
              className="px-4 py-2 bg-[#0B2545] text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Show All BSEB Notes
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedPosts.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-gray-200/80 flex flex-col justify-between hover:shadow-md transition"
              >
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-block bg-[#FEF3C7] text-[#B45309] text-[11px] font-extrabold px-3 py-1 rounded-md border border-amber-200">
                      {item.badge}
                    </span>
                    <span className="inline-block bg-slate-100 text-slate-700 text-[11px] font-bold px-2.5 py-1 rounded-md">
                      {item.subject}
                    </span>
                  </div>

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
                    href={`/read/${encodeURIComponent(item.slug)}`}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" /> Read Free
                  </Link>

                  <button
                    onClick={() => openAuthPaywall(`Download ${item.title}`, item.id)}
                    className="bg-[#E5A83B] hover:bg-[#d49425] text-slate-950 font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}