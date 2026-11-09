"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Lock, CheckCircle2, ShieldCheck, Download, Loader2, User, LogIn, UserPlus, ExternalLink } from "lucide-react";

const STANDARD_PLANS = [
  {
    id: "single",
    name: "This Single PDF Note",
    price: 5,
    tag: "One-Time",
    desc: "Instant download of this specific chapter/paper",
  },
  {
    id: "all_access",
    name: "All-Access Notes Pass",
    price: 49,
    tag: "2 Months",
    desc: "Unlimited downloads for all current & future PDF notes",
    featured: true,
  },
];

const TEST_SERIES_PLANS = {
  PAPER_1: {
    id: "paper_1_plan",
    name: "Paper 1 CBT Test Series Plan",
    price: 599,
    tag: "Paper 1 Access",
    desc: "Complete access to Paper 1 Common General Mock Tests & Answer Keys",
    featured: true,
  },
  PAPER_2: {
    id: "paper_2_plan",
    name: "Paper 2 CBT Test Series Plan",
    price: 599,
    tag: "Paper 2 Access",
    desc: "Complete access to Paper 2 Geography Specialist Mock Tests & Solutions",
    featured: true,
  },
};

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function AuthModal({
  isOpen,
  onClose,
  targetAction = "Download PDF",
  postId = null,
  paperType = null, // "PAPER_1" | "PAPER_2" | null
  contentElementId = "printable-content",
}) {
  const router = useRouter();
  const [user, setUser] = useState(null);

  // Auth Form State
  const [authMode, setAuthMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  // Plan Selection
  const [selectedPlan, setSelectedPlan] = useState("all_access");

  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const isTestSeries = paperType === "PAPER_1" || paperType === "PAPER_2";
  const activePlans = isTestSeries
    ? [TEST_SERIES_PLANS[paperType]]
    : STANDARD_PLANS;

  useEffect(() => {
    if (isOpen) {
      loadRazorpayScript();
      setErrorMessage("");
      if (isTestSeries && paperType && TEST_SERIES_PLANS[paperType]) {
        setSelectedPlan(TEST_SERIES_PLANS[paperType].id);
      } else {
        setSelectedPlan("all_access");
      }
    }
  }, [isOpen, paperType, isTestSeries]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("notes_user");
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch (_) {}
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentPlanObj =
    activePlans.find((p) => p.id === selectedPlan) || activePlans[0];

  const handleSuccessAction = async () => {
    // 1. If unlocking a CBT Test Series, redirect directly to the live test page
    if (isTestSeries || paperType === "PAPER_1" || paperType === "PAPER_2") {
      onClose();
      if (postId) {
        const wpUrl = (
          process.env.NEXT_PUBLIC_WORDPRESS_URL || "https://geographynotespdf.com/cms"
        ).replace(/\/+$/, "");
        try {
          const res = await fetch(`${wpUrl}/wp-json/wp/v2/posts/${postId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.slug) {
              router.push(`/read/${data.slug}/`);
              return;
            }
          }
        } catch (_) {}
      }
      window.location.reload();
      return;
    }

    // 2. Otherwise execute standard PDF download
    await triggerPdfDownload();
  };

  const triggerPdfDownload = async () => {
    setDownloading(true);
    setErrorMessage("");

    const wpUrl = (
      process.env.NEXT_PUBLIC_WORDPRESS_URL || "https://geographynotespdf.com/cms"
    ).replace(/\/+$/, "");

    try {
      let printTitle = targetAction || "Geography Notes";
      let paperHtml = "";

      if (postId) {
        const res = await fetch(`${wpUrl}/wp-json/wp/v2/posts/${postId}`);
        if (res.ok) {
          const postData = await res.json();
          printTitle = postData.title?.rendered || printTitle;
          const rawContent = postData.content?.rendered || "";

          const pdfMatch = rawContent.match(/href=["'](https?:\/\/[^"']+\.pdf)["']/i);
          if (pdfMatch && pdfMatch[1]) {
            const link = document.createElement("a");
            link.href = pdfMatch[1];
            link.setAttribute("download", `${printTitle}.pdf`);
            link.target = "_blank";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setDownloading(false);
            onClose();
            return;
          }

          paperHtml = rawContent;
        }
      }

      if (!paperHtml && contentElementId && typeof document !== "undefined") {
        const el = document.getElementById(contentElementId);
        if (el && el.innerHTML.trim().length > 50) {
          paperHtml = el.innerHTML;
        }
      }

      if (!paperHtml) {
        throw new Error("Could not load full paper content. Please try again.");
      }

      onClose();

      const printWindow = window.open("", "_blank", "width=850,height=900");
      if (!printWindow) {
        alert("Please allow popups to download this paper.");
        setDownloading(false);
        return;
      }

      printWindow.document.open();
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${printTitle}</title>
            <meta charset="utf-8" />
            <style>
              @page { size: A4; margin: 20mm; }
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; line-height: 1.6; padding: 24px; }
              .header { border-bottom: 2px solid #0b2545; padding-bottom: 12px; margin-bottom: 24px; }
              .portal-tag { font-size: 11px; font-weight: bold; color: #b45309; text-transform: uppercase; letter-spacing: 1px; }
              h1 { font-size: 22px; color: #0b2545; margin: 6px 0 0 0; }
              .content { font-size: 14px; }
              .content h2, .content h3 { color: #0b2545; margin-top: 20px; }
              .content ul, .content ol { padding-left: 20px; }
              .content li { margin-bottom: 8px; }
              .content img { max-width: 100%; height: auto; border-radius: 8px; }
              .footer { margin-top: 40px; border-top: 1px solid #cbd5e1; padding-top: 10px; font-size: 10px; color: #64748b; text-align: center; }
            </style>
          </head>
          <body>
            <div class="header">
              <span class="portal-tag">Unique Geography Notes • Question Paper &amp; Notes</span>
              <h1>${printTitle}</h1>
            </div>
            <div class="content">${paperHtml}</div>
            <div class="footer">Downloaded from Unique Geography Notes (geographynotespdf.com)</div>
          </body>
        </html>
      `);
      printWindow.document.close();

      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 500);

    } catch (err) {
      setErrorMessage(err.message || "Failed to download paper.");
    } finally {
      setDownloading(false);
    }
  };

  const hasAccess = () => {
    if (!user) return false;

    if (paperType === "PAPER_1") {
      return Boolean(user.purchased_paper1);
    }
    if (paperType === "PAPER_2") {
      return Boolean(user.purchased_paper2);
    }

    if (user.has_active_pass) return true;
    if (postId && Array.isArray(user.purchased_posts) && user.purchased_posts.includes(Number(postId))) {
      return true;
    }

    return false;
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    const wpUrl = (
      process.env.NEXT_PUBLIC_WORDPRESS_URL || "https://geographynotespdf.com/cms"
    ).replace(/\/+$/, "");

    try {
      const res = await fetch(`${wpUrl}/wp-json/notes-api/v1/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: authMode,
          email,
          password,
          name: authMode === "register" ? name : "",
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Authentication failed");
      }

      setUser(data.user);
      localStorage.setItem("notes_user", JSON.stringify(data.user));

      let userHasAccess = false;
      if (paperType === "PAPER_1") {
        userHasAccess = Boolean(data.user.purchased_paper1);
      } else if (paperType === "PAPER_2") {
        userHasAccess = Boolean(data.user.purchased_paper2);
      } else {
        userHasAccess = data.user.has_active_pass || (postId && data.user.purchased_posts?.includes(Number(postId)));
      }

      if (userHasAccess) {
        await handleSuccessAction();
      }
    } catch (err) {
      setErrorMessage(err.message || "Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    setErrorMessage("");

    const isLoaded = await loadRazorpayScript();
    if (!isLoaded || typeof window === "undefined" || !window.Razorpay) {
      setErrorMessage("Razorpay payment gateway failed to load. Please check your internet connection.");
      setLoading(false);
      return;
    }

    const wpUrl = (
      process.env.NEXT_PUBLIC_WORDPRESS_URL || "https://geographynotespdf.com/cms"
    ).replace(/\/+$/, "");

    const activeKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_TnKpUrsGRWE0Q6";
    const isTestKey = activeKey.startsWith("rzp_test_");

    try {
      let orderId = null;

      if (!isTestKey) {
        try {
          const orderRes = await fetch(`${wpUrl}/wp-json/notes-api/v1/create-order`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              amount: currentPlanObj.price * 100,
              userId: user?.id,
              paperType: paperType,
            }),
          });

          const orderData = await orderRes.json();
          if (orderData.success && orderData.order_id) {
            orderId = orderData.order_id;
          }
        } catch (e) {
          console.warn("Server order creation skipped or failed:", e);
        }
      }

      const options = {
        key: activeKey,
        amount: currentPlanObj.price * 100,
        currency: "INR",
        name: "Unique Geography Notes",
        description: `${currentPlanObj.name} (Access Pass)`,
        prefill: {
          name: user?.name || "Student",
          email: user?.email || "student@gmail.com",
        },
        theme: {
          color: "#0B2545",
        },
        handler: async function (response) {
          try {
            const updatedUser = {
              ...user,
              has_active_pass: currentPlanObj.id === "all_access" ? true : user?.has_active_pass,
              purchased_paper1: paperType === "PAPER_1" ? true : user?.purchased_paper1,
              purchased_paper2: paperType === "PAPER_2" ? true : user?.purchased_paper2,
              purchased_posts: postId
                ? [...(user?.purchased_posts || []), Number(postId)]
                : user?.purchased_posts,
            };

            setUser(updatedUser);
            localStorage.setItem("notes_user", JSON.stringify(updatedUser));
            await handleSuccessAction();
          } catch (err) {
            setErrorMessage("Error unlocking plan after payment.");
          }
        },
      };

      if (orderId) {
        options.order_id = orderId;
      }

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setErrorMessage(err.message || "Failed to start payment.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("notes_user");
    setUser(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/75 backdrop-blur-xs print:hidden">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="bg-[#0B2545] p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-400" />
            <h3 className="text-base font-black tracking-tight">
              {isTestSeries ? `Unlock ${paperType === "PAPER_2" ? "Paper 2" : "Paper 1"} Test Series` : "Unlock PDF Notes"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5 text-slate-300" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 block">
                Item Requested:
              </span>
              <p className="text-xs font-bold text-slate-800 line-clamp-1">{targetAction}</p>
            </div>
            {user && (
              <button
                onClick={() => {
                  onClose();
                  router.push("/dashboard");
                }}
                className="text-[11px] font-black text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200 flex items-center gap-1 cursor-pointer shrink-0"
              >
                <span>My Dashboard</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>

          {errorMessage && (
            <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          {/* SCREEN 1: Not Logged In */}
          {!user ? (
            <div>
              <div className="flex items-center bg-slate-100 p-1 rounded-xl mb-4 border border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("login");
                    setErrorMessage("");
                  }}
                  className={`flex-1 py-2 text-xs font-black rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    authMode === "login"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Log In</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("register");
                    setErrorMessage("");
                  }}
                  className={`flex-1 py-2 text-xs font-black rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    authMode === "register"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Create Account</span>
                </button>
              </div>

              <form onSubmit={handleAuth} className="space-y-3">
                {authMode === "register" && (
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Your Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:border-[#0B2545] focus:outline-hidden"
                    />
                  </div>
                )}

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Email ID</label>
                  <input
                    type="email"
                    required
                    placeholder="name@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:border-[#0B2545] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:border-[#0B2545] focus:outline-hidden"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-3 bg-[#0B2545] hover:bg-slate-900 text-white font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : authMode === "login" ? (
                    "Log In & Proceed"
                  ) : (
                    "Create Account & Proceed"
                  )}
                </button>
              </form>

              <div className="text-center mt-3 pt-2 border-t border-gray-100">
                {authMode === "login" ? (
                  <p className="text-xs text-slate-500">
                    New here?{" "}
                    <button
                      type="button"
                      onClick={() => setAuthMode("register")}
                      className="font-bold text-[#0B2545] hover:underline cursor-pointer"
                    >
                      Create an Account
                    </button>
                  </p>
                ) : (
                  <p className="text-xs text-slate-500">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setAuthMode("login")}
                      className="font-bold text-[#0B2545] hover:underline cursor-pointer"
                    >
                      Log In
                    </button>
                  </p>
                )}
              </div>
            </div>
          ) : hasAccess() ? (
            // SCREEN 2: Has Valid Access
            <div className="text-center py-4 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h4 className="text-sm font-black text-slate-900">
                {isTestSeries ? "Test Series Plan Unlocked" : "Notes Access Pass Active"}
              </h4>
              <p className="text-xs text-slate-500">
                {isTestSeries
                  ? "Your test series plan is active! Click below to start your live test."
                  : "You have active access! Click below to download your complete paper."}
              </p>
              <button
                onClick={handleSuccessAction}
                disabled={downloading}
                className="w-full bg-[#E5A83B] hover:bg-[#d49425] text-slate-950 font-black text-xs py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                {downloading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isTestSeries ? (
                  <>
                    <ExternalLink className="w-4 h-4" /> Start Live CBT Test
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" /> Download PDF Notes
                  </>
                )}
              </button>
            </div>
          ) : (
            // SCREEN 3: Logged In -> Select Required Plan
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-gray-100">
                <span className="text-slate-600 flex items-center gap-1.5 font-medium">
                  <User className="w-3.5 h-3.5 text-slate-400" /> {user.email}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-red-600 text-[11px] font-bold hover:underline cursor-pointer"
                >
                  Log Out
                </button>
              </div>

              <p className="text-xs font-bold text-slate-700">Choose Access Plan:</p>

              <div className="space-y-2.5">
                {activePlans.map((plan) => (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`p-3.5 rounded-2xl border-2 transition cursor-pointer flex items-center justify-between ${
                      selectedPlan === plan.id
                        ? "border-[#0B2545] bg-slate-50 ring-2 ring-[#0B2545]/20"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          selectedPlan === plan.id ? "border-[#0B2545] bg-[#0B2545]" : "border-slate-300"
                        }`}
                      >
                        {selectedPlan === plan.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-slate-900">{plan.name}</span>
                          {plan.featured && (
                            <span className="text-[9px] font-black bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded">
                              REQUIRED
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500 font-medium block">{plan.desc}</span>
                      </div>
                    </div>
                    <span className="text-base font-black text-slate-900 shrink-0">₹{plan.price}</span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handlePayment}
                disabled={loading}
                className="w-full bg-[#E5A83B] hover:bg-[#d49425] text-slate-950 font-black text-xs py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-95"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  `Pay ₹${currentPlanObj.price} via UPI / Card`
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Secured by Razorpay • Instant Unlock</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}