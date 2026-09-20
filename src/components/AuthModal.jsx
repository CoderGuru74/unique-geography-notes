"use client";

import { useState } from "react";
import { X, Download, Loader2 } from "lucide-react";

export default function AuthModal({
  isOpen,
  onClose,
  targetAction = "Study Material",
  postId = null,
  contentElementId = "printable-content",
}) {
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const executeArticlePdfDownload = async () => {
    setLoading(true);
    setErrorMsg("");
    setStatusText("Retrieving note content...");

    try {
      let rawHtml = "";
      let docTitle = typeof targetAction === "string" ? targetAction : "Unique Geography Notes";

      // 1. Try extracting content from current active DOM
      if (contentElementId) {
        const el = document.getElementById(contentElementId);
        if (el && el.innerHTML.trim().length > 40) {
          rawHtml = el.innerHTML;
        }
      }

      // 2. If DOM extraction is empty, fetch content via WordPress API using postId
      if (!rawHtml && postId) {
        setStatusText("Fetching study material from server...");
        const wpUrl = (
          process.env.NEXT_PUBLIC_WORDPRESS_URL || "https://www.geographynotespdf.com"
        ).replace(/\/+$/, "");

        let fetchedData = null;

        // Try posts first
        try {
          const res = await fetch(`${wpUrl}/wp-json/wp/v2/posts/${postId}`);
          if (res.ok) fetchedData = await res.json();
        } catch (_) {}

        // Fallback to pages
        if (!fetchedData) {
          try {
            const res = await fetch(`${wpUrl}/wp-json/wp/v2/pages/${postId}`);
            if (res.ok) fetchedData = await res.json();
          } catch (_) {}
        }

        if (fetchedData) {
          docTitle = fetchedData.title?.rendered || docTitle;
          rawHtml = fetchedData.content?.rendered || fetchedData.excerpt?.rendered || "";
        }
      }

      // 3. Fallback: If still empty, compose a structured placeholder document
      if (!rawHtml || rawHtml.trim().length === 0) {
        rawHtml = `
          <div style="padding: 16px 0;">
            <h2 style="font-size: 20px; color: #0B2545;">${docTitle}</h2>
            <p style="color: #475569; font-size: 14px;">Curated by University Faculty — Unique Geography Notes</p>
            <hr style="border: 0; border-top: 1px solid #E2E8F0; margin: 16px 0;" />
            <p style="font-size: 14px; line-height: 1.6; color: #1E293B;">
              This module is verified and synchronized with the latest curriculum. Please explore the interactive digital chapters on the portal for multimedia diagrams and real-time revisions.
            </p>
          </div>
        `;
      }

      setStatusText("Preparing document for export...");

      // 4. Open isolated print window
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        throw new Error("Popup blocked by browser. Please allow popups to save your PDF.");
      }

      printWindow.document.open();
      printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <title>${docTitle}</title>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <style>
              @page {
                margin: 15mm;
                size: A4;
              }
              body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
                color: #111827;
                line-height: 1.6;
                padding: 24px;
                max-width: 820px;
                margin: 0 auto;
                background-color: #ffffff;
              }
              h1 {
                font-size: 24px;
                color: #0B2545;
                border-bottom: 2px solid #E5A83B;
                padding-bottom: 8px;
                margin-bottom: 14px;
                font-weight: 800;
              }
              h2 {
                font-size: 18px;
                color: #1E293B;
                margin-top: 22px;
                margin-bottom: 10px;
                font-weight: 700;
              }
              h3 {
                font-size: 15px;
                color: #B45309;
                margin-top: 16px;
                margin-bottom: 6px;
                font-weight: 700;
              }
              p {
                margin-bottom: 12px;
                font-size: 13.5px;
                color: #1E293B;
              }
              ul, ol {
                padding-left: 24px;
                margin-bottom: 14px;
              }
              li {
                margin-bottom: 6px;
                font-size: 13.5px;
              }
              img {
                max-width: 100%;
                height: auto;
                display: block;
                margin: 18px auto;
                border-radius: 8px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin: 16px 0;
              }
              th, td {
                border: 1px solid #CBD5E1;
                padding: 8px 10px;
                font-size: 13px;
                text-align: left;
              }
              th {
                background-color: #F1F5F9;
              }
              .header-meta {
                font-size: 12px;
                color: #64748B;
                margin-bottom: 24px;
              }
              .footer-stamp {
                border-top: 1px solid #E2E8F0;
                margin-top: 40px;
                padding-top: 12px;
                font-size: 11px;
                color: #94A3B8;
                text-align: center;
              }
              @media print {
                body { padding: 0; }
              }
            </style>
          </head>
          <body>
            <h1>${docTitle}</h1>
            <div class="header-meta">Unique Geography Notes • Curated by Faculty</div>
            <div>${rawHtml}</div>
            <div class="footer-stamp">© Unique Geography Notes • geographynotespdf.com</div>
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                }, 300);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();

      setStatusText("Complete!");
      setTimeout(() => {
        setLoading(false);
        onClose();
      }, 700);
    } catch (err) {
      console.error("PDF generation error:", err);
      setErrorMsg(err.message || "Failed to generate PDF. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-xl border border-gray-200 relative">
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute right-4 top-4 text-gray-400 hover:text-black transition cursor-pointer p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <Download className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-slate-900 leading-snug">
            Save Notes PDF
          </h3>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 px-2">
            {typeof targetAction === "string" ? targetAction : "Download complete study unit"}
          </p>
        </div>

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl mb-4 text-center font-medium">
            {errorMsg}
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={executeArticlePdfDownload}
            disabled={loading}
            className="w-full bg-[#0B2545] hover:bg-slate-900 text-white font-bold text-xs py-3 px-4 rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                <span>{statusText || "Processing..."}</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-amber-400" />
                <span>Download / Print PDF</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            disabled={loading}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl transition cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}