"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle2, Loader2, Download, Lock } from "lucide-react";

export default function AuthModal({ 
  isOpen, 
  onClose, 
  targetAction, 
  postId, 
  contentElementId 
}) {
  const [isLoginView, setIsLoginView] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const savedSession = localStorage.getItem("ugn_user_session");
    if (savedSession) {
      try {
        setCurrentUser(JSON.parse(savedSession));
      } catch (e) {
        localStorage.removeItem("ugn_user_session");
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Converts strictly the study material into a PDF using an isolated sandbox
  const executeArticlePdfDownload = async () => {
    setLoading(true);
    setStatusText("Fetching note content...");

    try {
      const wpUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL;
      let articleTitle = targetAction || "Unique Geography Notes";
      let rawHtml = "";

      // 1. Get content from DOM or WordPress API
      const existingEl = contentElementId ? document.getElementById(contentElementId) : null;

      if (existingEl) {
        rawHtml = existingEl.innerHTML;
      } else if (postId && wpUrl) {
        const res = await fetch(`${wpUrl}/wp-json/wp/v2/posts/${postId}?_fields=title,content`);
        if (res.ok) {
          const data = await res.json();
          articleTitle = data.title?.rendered || articleTitle;
          rawHtml = data.content?.rendered || "";
        }
      }

      if (!rawHtml) {
        const fallbackArticle = document.querySelector("article");
        if (fallbackArticle) {
          rawHtml = fallbackArticle.innerHTML;
        }
      }

      if (!rawHtml) {
        throw new Error("Unable to retrieve note contents.");
      }

      setStatusText("Preparing document...");

      // Clean HTML: Remove scripts, styles, buttons, and navigation elements
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = rawHtml;
      tempDiv.querySelectorAll("script, style, button, nav, footer, header").forEach((el) => el.remove());
      const cleanContentHtml = tempDiv.innerHTML;

      // Close modal first so it's not present anywhere
      onClose();

      // Create an isolated sandbox iframe (No Tailwind, No lab() CSS)
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow || iframe.contentDocument;
      const iframeDoc = doc.document || doc;

      iframeDoc.open();
      iframeDoc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${articleTitle.replace(/<[^>]+>/g, "")}</title>
            <style>
              @page {
                size: A4;
                margin: 15mm 15mm 15mm 15mm;
              }
              body {
                font-family: Arial, sans-serif;
                color: #111827;
                background: #ffffff;
                line-height: 1.6;
                padding: 20px;
                margin: 0;
              }
              .header {
                border-bottom: 2px solid #D97706;
                padding-bottom: 8px;
                margin-bottom: 16px;
              }
              .header h1 {
                font-size: 20px;
                margin: 0;
                color: #111827;
              }
              .header p {
                font-size: 11px;
                color: #6B7280;
                margin: 4px 0 0 0;
              }
              .title {
                font-size: 18px;
                font-weight: bold;
                color: #1E3A8A;
                margin: 16px 0;
              }
              .content {
                font-size: 13px;
                color: #374151;
              }
              .content img {
                max-width: 100%;
                height: auto;
                display: block;
                margin: 10px 0;
              }
              .footer {
                margin-top: 30px;
                border-top: 1px solid #E5E7EB;
                padding-top: 10px;
                font-size: 10px;
                color: #9CA3AF;
                text-align: center;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Unique Geography Notes</h1>
              <p>Curated by University Faculty • Student Study Material</p>
            </div>
            <div class="title">${articleTitle}</div>
            <div class="content">${cleanContentHtml}</div>
            <div class="footer">
              © 2026 Unique Geography Notes. All rights reserved.
            </div>
          </body>
        </html>
      `);
      iframeDoc.close();

      // Trigger standard save/print directly from the isolated frame
      setTimeout(() => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 1000);
      }, 500);

    } catch (err) {
      console.error("PDF generation failure:", err);
      alert("Failed to compile study material into PDF. Please ensure the note is loaded.");
    } finally {
      setLoading(false);
      setStatusText("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    const storedUsers = JSON.parse(localStorage.getItem("ugn_registered_users") || "[]");

    if (isLoginView) {
      const user = storedUsers.find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
      );

      if (!user) {
        setLoading(false);
        setErrorMsg("Invalid email or password.");
        return;
      }

      localStorage.setItem("ugn_user_session", JSON.stringify(user));
      setCurrentUser(user);
      executeArticlePdfDownload();
    } else {
      if (!fullName.trim() || !email.trim() || !password.trim()) {
        setLoading(false);
        setErrorMsg("Please fill in all fields.");
        return;
      }

      const exists = storedUsers.some((u) => u.email.toLowerCase() === email.trim().toLowerCase());
      if (exists) {
        setLoading(false);
        setErrorMsg("An account with this email already exists. Please log in.");
        return;
      }

      const newUser = {
        id: "usr_" + Date.now(),
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password: password,
      };

      storedUsers.push(newUser);
      localStorage.setItem("ugn_registered_users", JSON.stringify(storedUsers));
      localStorage.setItem("ugn_user_session", JSON.stringify(newUser));

      setCurrentUser(newUser);
      executeArticlePdfDownload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 relative shadow-2xl border border-gray-100">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-gray-400 hover:text-black p-1 rounded-full hover:bg-gray-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {currentUser ? (
          <div className="text-center py-2">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-black text-slate-900 mb-1">
              Ready to Download, {currentUser.name}!
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Account: <strong>{currentUser.email}</strong>
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left mb-6">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Document Selected
              </span>
              <p className="text-xs text-slate-900 font-bold leading-snug">
                {targetAction || "Chapter Notes"}
              </p>
            </div>

            <button
              onClick={executeArticlePdfDownload}
              disabled={loading}
              className="w-full bg-[#E5A83B] hover:bg-[#d49425] text-slate-950 font-bold text-xs py-3.5 rounded-xl transition shadow flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{statusText || "Compiling PDF..."}</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" /> Download Full PDF Now
                </>
              )}
            </button>

            <button
              onClick={() => {
                localStorage.removeItem("ugn_user_session");
                setCurrentUser(null);
              }}
              className="text-xs text-slate-400 hover:text-slate-600 transition mt-4 underline cursor-pointer"
            >
              Log out or switch account
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-extrabold text-[#B45309] uppercase tracking-wider">
                Instant Study Material Download
              </span>
            </div>

            <h3 className="text-xl font-black text-slate-900 mb-1 leading-snug">
              {isLoginView ? "Log In to Download" : "Create Account & Download"}
            </h3>

            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Sign up once to download complete chapter notes and solutions directly to your device.
            </p>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium mb-3">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {!isLoginView && (
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Your Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl text-xs px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#E5A83B]"
                  />
                </div>
              )}

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl text-xs px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#E5A83B]"
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
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl text-xs px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#E5A83B]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0B2545] hover:bg-slate-900 text-white font-bold text-xs py-3.5 rounded-xl transition shadow flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : isLoginView ? (
                  "Log In & Download PDF"
                ) : (
                  "Create Account & Download PDF"
                )}
              </button>
            </form>

            <div className="mt-4 text-center text-xs text-slate-500">
              {isLoginView ? (
                <span>
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => { setIsLoginView(false); setErrorMsg(""); }}
                    className="font-bold text-[#B45309] hover:underline cursor-pointer"
                  >
                    Sign Up
                  </button>
                </span>
              ) : (
                <span>
                  Already registered?{" "}
                  <button
                    type="button"
                    onClick={() => { setIsLoginView(true); setErrorMsg(""); }}
                    className="font-bold text-[#B45309] hover:underline cursor-pointer"
                  >
                    Log In
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}