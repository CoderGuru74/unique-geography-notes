"use client";

import { useState, useEffect } from "react";
import { X, Lock, CheckCircle2, ShieldCheck, Download, Loader2, User, LogIn, UserPlus } from "lucide-react";

const PLANS = [
  {
    id: "single",
    name: "This Single PDF Note",
    price: 5,
    tag: "One-Time",
    desc: "Instant download of this specific chapter/paper",
  },
  {
    id: "all_access",
    name: "All-Access Portal Pass",
    price: 49,
    tag: "3 Years",
    desc: "Unlimited downloads for all current & future notes and test series",
    featured: true,
  },
];

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
  contentElementId = "printable-content",
}) {
  const [user, setUser] = useState(null);
  
  // Auth Form State
  const [authMode, setAuthMode] = useState("login"); // 'login' or 'register'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  
  // Plan Selection
  const [selectedPlan, setSelectedPlan] = useState("all_access");

  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadRazorpayScript();
      setErrorMessage("");
    }
  }, [isOpen]);

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

  const currentPlanObj = PLANS.find((p) => p.id === selectedPlan) || PLANS[1];

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

          // Check if post links directly to an uploaded PDF file
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
    if (user.has_active_pass) return true;
    if (postId && Array.isArray(user.purchased_posts) && user.purchased_posts.includes(Number(postId))) {
      return true;
    }
    return false;
  };

  // Handle Login or Register
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
          mode: authMode, // 'login' or 'register'
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

      if (data.user.has_active_pass || (postId && data.user.purchased_posts?.includes(Number(postId)))) {
        await triggerPdfDownload();
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

    try {
      const orderRes = await fetch(`${wpUrl}/wp-json/notes-api/v1/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: currentPlanObj.price * 100, // in paise
          userId: user?.id,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderData.success || !orderData.order_id) {
        throw new Error(orderData.message || "Could not initialize payment order");
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_live_TgdBiGOY6iigmU",
        amount: orderData.amount,
        currency: "INR",
        name: "Unique Geography Notes",
        description: `${currentPlanObj.name} (Access Pass)`,
        order_id: orderData.order_id,
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
        },
        theme: {
          color: "#0B2545",
        },
        handler: async function (response) {
          try {
            const verifyRes = await fetch(`${wpUrl}/wp-json/notes-api/v1/verify-payment`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                userId: user?.id,
                planId: currentPlanObj.id,
                postId: postId,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              const updatedUser = {
                ...user,
                has_active_pass: currentPlanObj.id === "all_access" ? true : user?.has_active_pass,
                purchased_posts: postId
                  ? [...(user?.purchased_posts || []), Number(postId)]
                  : user?.purchased_posts,
              };
              setUser(updatedUser);
              localStorage.setItem("notes_user", JSON.stringify(updatedUser));

              await triggerPdfDownload();
            } else {
              setErrorMessage("Payment verification failed. Please contact support.");
            }
          } catch (err) {
            setErrorMessage("Error verifying payment.");
          }
        },
      };

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
            <h3 className="text-base font-black tracking-tight">Unlock PDF Notes</h3>
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
          <div className="mb-4">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 block">
              Item Requested:
            </span>
            <p className="text-xs font-bold text-slate-800 line-clamp-1">{targetAction}</p>
          </div>

          {errorMessage && (
            <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          {/* SCREEN 1: Not Logged In -> Show Login vs Register Tabs */}
          {!user ? (
            <div>
              {/* Tabs Switcher */}
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

              {/* Bottom helper toggle text */}
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
            // SCREEN 2: Logged In & Already Has Access
            <div className="text-center py-4 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h4 className="text-sm font-black text-slate-900">Access Pass Active</h4>
              <p className="text-xs text-slate-500">
                You have active access! Click below to download your complete paper.
              </p>
              <button
                onClick={triggerPdfDownload}
                disabled={downloading}
                className="w-full bg-[#E5A83B] hover:bg-[#d49425] text-slate-950 font-black text-xs py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                {downloading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Download className="w-4 h-4" /> Download PDF Now
                  </>
                )}
              </button>
            </div>
          ) : (
            // SCREEN 3: Logged In -> Select Plan and Pay
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

              <p className="text-xs font-bold text-slate-700">Choose Your Access Plan:</p>

              <div className="space-y-2.5">
                {PLANS.map((plan) => (
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
                              BEST VALUE
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
                <span>Secured by Razorpay • Instant Download</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}