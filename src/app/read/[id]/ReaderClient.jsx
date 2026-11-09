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
  ChevronRight,
  FolderOpen,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Award,
  Clock
} from "lucide-react";
import AuthModal from "../../../components/AuthModal";

// Helper function to sanitize WordPress slugs
const sanitizeSlug = (rawSlug) => {
  if (!rawSlug) return "";
  return String(rawSlug)
    .replace(/^https?:\/\/[^\/]+/, "")
    .replace(/^\/?read\//i, "")
    .replace(/^\/+|\/+$/g, "");
};

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

// Interactive CBT Quiz Interface Component with Live Countdown Timer
function CBTQuizRenderer({ quizData, postTitle, durationMinutes = 60 }) {
  const [userAnswers, setUserAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60); // In seconds
  const [timerRunning, setTimerRunning] = useState(true);

  // Countdown timer effect
  useEffect(() => {
    if (!timerRunning || submitted) return;

    if (timeLeft <= 0) {
      setSubmitted(true);
      setTimerRunning(false);
      alert("⏰ Time is up! Your mock test has been automatically submitted.");
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, timerRunning, submitted]);

  // Format seconds into HH:MM:SS
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const pad = (num) => String(num).padStart(2, "0");
    if (hrs > 0) {
      return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  };

  if (!Array.isArray(quizData) || quizData.length === 0) return null;

  const handleSelectOption = (questionIdx, optionKey) => {
    if (submitted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [questionIdx]: optionKey,
    }));
  };

  const calculateScore = () => {
    let score = 0;
    quizData.forEach((q, idx) => {
      const selected = userAnswers[idx];
      const correct = (q.correct_option || q.correct || "").toString().toUpperCase();
      if (selected && selected.toUpperCase() === correct) {
        score += 2; // +2 Marks per correct answer (UGC NET Pattern)
      }
    });
    return score;
  };

  const totalPossibleScore = quizData.length * 2;
  const answeredCount = Object.keys(userAnswers).length;

  const handleReset = () => {
    setUserAnswers({});
    setSubmitted(false);
    setTimeLeft(durationMinutes * 60);
    setTimerRunning(true);
  };

  const handleSubmit = () => {
    if (window.confirm("Are you sure you want to submit your test now?")) {
      setSubmitted(true);
      setTimerRunning(false);
    }
  };

  return (
    <div className="space-y-6 mt-6">
      {/* CBT Quiz Status & Timer Header */}
      <div className="bg-[#0B2545] text-white p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm border border-slate-800">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block mb-1">
            Official NTA Pattern CBT Practice Test
          </span>
          <h2 className="text-lg font-black">{postTitle}</h2>
          <p className="text-xs text-slate-300 mt-1">
            Total Questions: <strong className="text-white">{quizData.length}</strong> | Total Marks:{" "}
            <strong className="text-white">{totalPossibleScore}</strong>
          </p>
        </div>

        {/* Live Timer Badge */}
        {!submitted ? (
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black border transition ${
              timeLeft < 300 
                ? "bg-red-500/20 text-red-300 border-red-500/50 animate-pulse" 
                : "bg-white/10 text-amber-300 border-white/20"
            }`}>
              <Clock className="w-4 h-4" />
              <span>Time Remaining: {formatTime(timeLeft)}</span>
            </div>
            <div className="text-xs font-bold bg-white/10 border border-white/20 px-3.5 py-2 rounded-xl shrink-0">
              Answered: {answeredCount} / {quizData.length}
            </div>
          </div>
        ) : (
          <div className="bg-amber-400 text-slate-950 px-5 py-2.5 rounded-xl text-center font-black text-sm shrink-0 shadow-xs">
            Final Score: {calculateScore()} / {totalPossibleScore}
          </div>
        )}
      </div>

      {/* Questions List */}
      <div className="space-y-6">
        {quizData.map((q, idx) => {
          const selectedOption = userAnswers[idx];
          const correctOption = (q.correct_option || q.correct || "").toString().toUpperCase();
          const qText = q.question_text || q.question || `Question ${idx + 1}`;

          const options = [
            { key: "A", text: q.option_a || q.a },
            { key: "B", text: q.option_b || q.b },
            { key: "C", text: q.option_c || q.c },
            { key: "D", text: q.option_d || q.d },
          ].filter((opt) => opt.text);

          return (
            <div
              key={idx}
              className={`p-5 sm:p-6 rounded-2xl border transition-all ${
                submitted
                  ? selectedOption === correctOption
                    ? "border-emerald-300 bg-emerald-50/30"
                    : selectedOption
                    ? "border-red-300 bg-red-50/30"
                    : "border-gray-200 bg-white"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex items-start gap-3 mb-4">
                <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-[#0B2545] text-white font-black text-xs shrink-0 mt-0.5">
                  Q{idx + 1}
                </span>
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-snug">
                  {qText}
                </h3>
              </div>

              {/* Options List */}
              <div className="grid grid-cols-1 gap-2.5 ml-0 sm:ml-10">
                {options.map((opt) => {
                  const isSelected = selectedOption === opt.key;
                  const isCorrect = opt.key === correctOption;

                  let optionStyle = "border-gray-200 bg-slate-50 hover:bg-slate-100 text-slate-800";

                  if (submitted) {
                    if (isCorrect) {
                      optionStyle = "border-emerald-500 bg-emerald-100 text-emerald-900 font-bold";
                    } else if (isSelected && !isCorrect) {
                      optionStyle = "border-red-500 bg-red-100 text-red-900 font-bold";
                    } else {
                      optionStyle = "border-gray-200 bg-slate-50 opacity-60";
                    }
                  } else if (isSelected) {
                    optionStyle = "border-[#0B2545] bg-[#0B2545] text-white font-bold shadow-xs";
                  }

                  return (
                    <button
                      key={opt.key}
                      onClick={() => handleSelectOption(idx, opt.key)}
                      disabled={submitted}
                      className={`w-full p-3.5 rounded-xl border text-xs sm:text-sm text-left flex items-center justify-between transition cursor-pointer ${optionStyle}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center border ${
                            isSelected && !submitted
                              ? "bg-amber-400 text-slate-950 border-amber-300"
                              : "border-black/10 bg-white text-slate-700"
                          }`}
                        >
                          {opt.key}
                        </span>
                        <span>{opt.text}</span>
                      </div>

                      {submitted && (
                        <div>
                          {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-700" />}
                          {isSelected && !isCorrect && <XCircle className="w-4 h-4 text-red-600" />}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation section if test submitted */}
              {submitted && q.explanation && (
                <div className="mt-4 ml-0 sm:ml-10 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                  <span className="font-black uppercase text-[10px] text-amber-700 block mb-1">
                    Explanation:
                  </span>
                  {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Test Action Controls */}
      <div className="pt-4 flex items-center justify-between border-t border-gray-200">
        {submitted ? (
          <button
            onClick={handleReset}
            className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-5 py-3 rounded-xl flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <RotateCcw className="w-4 h-4" /> Re-take Test
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={answeredCount === 0}
            className="w-full sm:w-auto bg-[#E5A83B] hover:bg-[#d49425] text-slate-950 text-xs font-black px-8 py-3.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
          >
            <Award className="w-4 h-4" /> Submit &amp; View Result
          </button>
        )}
      </div>
    </div>
  );
}

export default function ReaderClient({ rawId }) {
  const params = useParams();
  const router = useRouter();

  const getInitialSlug = () => {
    let slug = rawId || (params?.id ? (Array.isArray(params.id) ? params.id.join("/") : params.id) : "");
    if ((!slug || slug === "default") && typeof window !== "undefined") {
      const pathname = window.location.pathname.replace(/^\/+|\/+$/g, "").split("?")[0];
      if (pathname.startsWith("read/")) {
        slug = pathname.replace(/^read\//, "");
      } else if (
        pathname && 
        !pathname.startsWith("category") && 
        !pathname.startsWith("cms") && 
        !pathname.startsWith("_next")
      ) {
        slug = pathname;
      }
    }
    return slug && slug !== "default" ? sanitizeSlug(slug) : "";
  };

  const [resolvedSlug, setResolvedSlug] = useState(() => getInitialSlug());
  const [post, setPost] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizDuration, setQuizDuration] = useState(60);
  const [categoryArchive, setCategoryArchive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const pathname = window.location.pathname.replace(/^\/+|\/+$/g, "").split("?")[0];
      let clean = "";
      if (pathname.startsWith("read/")) {
        clean = pathname.replace(/^read\//, "");
      } else if (
        pathname && 
        !pathname.startsWith("category") && 
        !pathname.startsWith("cms") && 
        !pathname.startsWith("_next")
      ) {
        clean = pathname;
      }

      if (clean && clean !== "default") {
        let decoded = clean;
        try {
          decoded = decodeURIComponent(clean);
        } catch (_) {}
        const finalSlug = sanitizeSlug(decoded);
        if (finalSlug) {
          setResolvedSlug(finalSlug);
        }
      }
    }
  }, [params]);

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
      setQuizQuestions([]);
      setCategoryArchive(null);

      let cleanSlug = resolvedSlug;
      try {
        cleanSlug = decodeURIComponent(decodeURIComponent(resolvedSlug));
      } catch (_) {
        try {
          cleanSlug = decodeURIComponent(resolvedSlug);
        } catch (_) {}
      }

      cleanSlug = sanitizeSlug(cleanSlug);

      try {
        const isNumericId = /^\d+$/.test(cleanSlug);
        let foundPost = null;

        const safeFetchJson = async (url) => {
          try {
            const res = await fetch(url);
            if (res.ok) {
              return await res.json();
            }
          } catch (e) {
            console.warn("Fetch warning for URL:", url, e);
          }
          return null;
        };

        if (isNumericId) {
          foundPost = await safeFetchJson(`${baseDomain}/wp-json/wp/v2/posts/${cleanSlug}?_embed`);
        }

        if (!foundPost) {
          const arr = await safeFetchJson(
            `${baseDomain}/wp-json/wp/v2/posts?slug=${encodeURIComponent(cleanSlug)}&_embed`
          );
          if (Array.isArray(arr) && arr.length > 0) {
            foundPost = arr[0];
          }
        }

        if (!foundPost) {
          const pagesArr = await safeFetchJson(
            `${baseDomain}/wp-json/wp/v2/pages?slug=${encodeURIComponent(cleanSlug)}&_embed`
          );
          if (Array.isArray(pagesArr) && pagesArr.length > 0) {
            foundPost = pagesArr[0];
          }
        }

        if (foundPost) {
          if (isMounted) {
            setPost(foundPost);

            let acfData = foundPost.acf;

            if (!acfData || Object.keys(acfData).length === 0) {
              const directAcf = await safeFetchJson(`${baseDomain}/wp-json/acf/v3/posts/${foundPost.id}`);
              if (directAcf && directAcf.acf) {
                acfData = directAcf.acf;
              }
            }

            // Set duration from test_duration field or default to 60 mins
            if (acfData?.test_duration) {
              const parsedDuration = parseInt(acfData.test_duration, 10);
              if (!isNaN(parsedDuration) && parsedDuration > 0) {
                setQuizDuration(parsedDuration);
              }
            }

            const extractedQuestions = [];

            if (acfData) {
              for (let i = 1; i <= 50; i++) {
                const qText = acfData[`q${i}_question`] || acfData[`q${i}_question_text`];
                if (qText) {
                  extractedQuestions.push({
                    question_text: qText,
                    option_a: acfData[`q${i}_option_a`] || "",
                    option_b: acfData[`q${i}_option_b`] || "",
                    option_c: acfData[`q${i}_option_c`] || "",
                    option_d: acfData[`q${i}_option_d`] || "",
                    correct_option: acfData[`q${i}_correct`] || acfData[`q${i}_correct_option`] || "A",
                    explanation: acfData[`q${i}_explanation`] || "",
                  });
                }
              }
            }

            if (extractedQuestions.length === 0 && (acfData?.quiz_json || foundPost.quiz_json)) {
              try {
                const raw = acfData?.quiz_json || foundPost.quiz_json;
                const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
                if (Array.isArray(parsed)) {
                  extractedQuestions.push(...parsed);
                }
              } catch (_) {}
            }

            if (extractedQuestions.length > 0) {
              setQuizQuestions(extractedQuestions);
            }
          }
          return;
        }

        const catQuery = cleanSlug.replace(/[-_]/g, " ").trim();
        if (catQuery) {
          const catList = await safeFetchJson(
            `${baseDomain}/wp-json/wp/v2/categories?search=${encodeURIComponent(catQuery)}&per_page=10`
          );

          if (Array.isArray(catList) && catList.length > 0) {
            const matchedCat =
              catList.find(
                (c) =>
                  c.name.toLowerCase() === catQuery.toLowerCase() ||
                  c.slug.toLowerCase() === cleanSlug.toLowerCase()
              ) || catList[0];

            const postsInCat = await safeFetchJson(
              `${baseDomain}/wp-json/wp/v2/posts?categories=${matchedCat.id}&per_page=100&_embed`
            );

            if (isMounted) {
              setCategoryArchive({
                title: matchedCat.name,
                posts: Array.isArray(postsInCat) ? postsInCat : [],
              });
              return;
            }
          }
        }

        if (!isMounted) return;
        setError("Note not found or unavailable.");
      } catch (err) {
        console.error("General error fetching content:", err);
        if (isMounted) setError("Failed to load content from WordPress server.");
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

    e.preventDefault();

    let cleanPath = rawHref
      .replace(/^https?:\/\/(?:www\.|api\.)?geographynotespdf\.com\/?(?:cms\/)?/i, "")
      .replace(/^\/?read\//i, "");

    try {
      cleanPath = decodeURIComponent(decodeURIComponent(cleanPath));
    } catch (_) {
      try {
        cleanPath = decodeURIComponent(cleanPath);
      } catch (_) {}
    }

    cleanPath = sanitizeSlug(cleanPath);

    if (cleanPath.startsWith("category/") || cleanPath.startsWith("tag/")) {
      router.push(`/${cleanPath}/`);
      return;
    }

    setResolvedSlug(cleanPath);
    window.history.pushState({}, "", `/read/${cleanPath}/`);
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

      {/* Reader Navigation Bar */}
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

      {/* Main Content Area */}
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-8 w-full flex-1">
        {loading ? (
          <div className="bg-white rounded-3xl p-16 border border-gray-200 shadow-sm flex flex-col items-center justify-center text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-[#E5A83B] mb-3" />
            <p className="text-xs font-bold">Loading chapter note...</p>
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
                  const cleanSlug = sanitizeSlug(p.slug || String(p.id));

                  return (
                    <Link
                      key={p.id}
                      href={`/read/${cleanSlug}/`}
                      prefetch={false}
                      className="group flex items-center justify-between p-4 rounded-2xl border border-gray-200 hover:border-amber-400 hover:bg-amber-50/40 transition shadow-2xs cursor-pointer"
                    >
                      <div className="pr-3">
                        <h2 className="text-sm font-bold text-slate-800 group-hover:text-[#0B2545] transition leading-snug">
                          {postTitle}
                        </h2>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Click to read note &amp; download PDF
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
          /* Missing Note View */
          <div className="bg-white rounded-3xl p-12 border border-gray-200 shadow-sm text-center">
            <h2 className="text-xl font-black text-slate-900 mb-2">Note Not Found</h2>
            <p className="text-xs text-slate-500 mb-6">{error || "Requested note is missing."}</p>
            <Link
              href="/"
              className="px-5 py-2.5 bg-[#0B2545] text-white text-xs font-bold rounded-xl shadow-xs"
            >
              Back to Home
            </Link>
          </div>
        ) : (
          /* Single Article View */
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
                Curated by University Faculty
              </span>
            </div>

            {/* Render CBT Quiz Questions with Timer */}
            {quizQuestions.length > 0 ? (
              <CBTQuizRenderer
                quizData={quizQuestions}
                postTitle={decodeHtmlEntities(post.title?.rendered || "")}
                durationMinutes={quizDuration}
              />
            ) : (
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
            )}
          </article>
        )}
      </div>
    </main>
  );
}