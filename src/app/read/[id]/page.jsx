"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, Lock, BookOpen, FileText, Loader2, Download } from "lucide-react";
import AuthModal from "../../../components/AuthModal";

export default function SecureReaderPage({ params }) {
  const resolvedParams = use(params);
  const postId = resolvedParams?.id;

  const [modalOpen, setModalOpen] = useState(false);
  const [postData, setPostData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Disable right-click & copy/print shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        (e.ctrlKey && (e.key === "p" || e.key === "s" || e.key === "u")) ||
        e.key === "PrintScreen"
      ) {
        e.preventDefault();
        alert("Printing and downloading are restricted in free preview mode.");
      }
    };

    const handleContextMenu = (e) => e.preventDefault();

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("contextmenu", handleContextMenu);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  // Fetch document details from WordPress
  useEffect(() => {
    async function loadPost() {
      const wpUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL;
      if (!wpUrl || !postId) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${wpUrl}/wp-json/wp/v2/posts/${postId}?_embed`);
        if (!res.ok) throw new Error("Post fetch failed");
        const data = await res.json();

        setPostData({
          title: data.title?.rendered || "Document Reader",
          content: data.content?.rendered || "",
          pdfUrl: data.acf?.pdf_file?.url || (typeof data.acf?.pdf_file === "string" ? data.acf?.pdf_file : ""),
          pages: data.acf?.pages || "Complete",
          fileSize: data.acf?.file_size || "Standard",
        });
      } catch (err) {
        console.error("Error loading note:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPost();
  }, [postId]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 font-sans selection:bg-amber-100">
      {/* Auth / Paywall Modal */}
      <AuthModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        targetAction={`Download ${postData?.title || "PDF"}`}
      />

      {/* Reader Top Bar - Clean White & Subtle Border */}
      <header className="sticky top-0 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between z-30 shadow-xs">
        <div className="flex items-center gap-3 overflow-hidden">
          <Link
            href="/category/exams"
            className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-950 transition flex-shrink-0 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Notes
          </Link>
          <span className="text-slate-300 hidden sm:inline">|</span>
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex-shrink-0">
            Free Web View
          </span>
        </div>

        {/* Action Button */}
        <button
          onClick={() => setModalOpen(true)}
          className="bg-[#E5A83B] hover:bg-[#d49425] text-slate-950 text-xs sm:text-sm font-bold px-4 sm:px-5 py-2 rounded-xl flex items-center gap-2 transition shadow-sm flex-shrink-0"
        >
          <Lock className="w-4 h-4" />
          <span>Download PDF</span>
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-8 py-8 sm:py-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-500 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#E5A83B]" />
            <p className="text-xs font-semibold">Loading study material...</p>
          </div>
        ) : postData?.pdfUrl ? (
          /* Case 1: PDF File Viewer */
          <div className="w-full h-[85vh] rounded-2xl overflow-hidden border border-slate-200 shadow-lg bg-white">
            <iframe
              src={`${postData.pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
              className="w-full h-full border-none"
              title="Secure Document Reader"
            />
          </div>
        ) : (
          /* Case 2: Clean White Paper Layout */
          <article className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-12 md:p-16">
            
            {/* Document Header */}
            <div className="border-b border-slate-100 pb-6 mb-8 text-center sm:text-left">
              <h1
                className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 leading-tight tracking-tight mb-4"
                dangerouslySetInnerHTML={{ __html: postData?.title || "" }}
              />

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-medium text-slate-500">
                <span className="flex items-center gap-1.5 text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md font-bold">
                  <BookOpen className="w-3.5 h-3.5" /> Full Article
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  {postData?.pages}
                </span>
                <span>•</span>
                <span>📦 {postData?.fileSize}</span>
              </div>
            </div>

            {/* Note Content - Rendered with high-contrast text and clean line spacing */}
            <div
              className="prose prose-slate max-w-none text-slate-900 leading-relaxed text-[15px] sm:text-[16px] 
                         [&_p]:mb-5 [&_p]:leading-[1.8]
                         [&_h1]:text-slate-950 [&_h1]:font-black [&_h1]:text-2xl [&_h1]:mt-8 [&_h1]:mb-4
                         [&_h2]:text-slate-900 [&_h2]:font-extrabold [&_h2]:text-xl [&_h2]:mt-8 [&_h2]:mb-3
                         [&_h3]:text-slate-800 [&_h3]:font-bold [&_h3]:text-lg [&_h3]:mt-6 [&_h3]:mb-2
                         [&_table]:w-full [&_table]:border-collapse [&_table]:my-6
                         [&_th]:bg-slate-100 [&_th]:p-3 [&_th]:border [&_th]:border-slate-300 [&_th]:font-bold [&_th]:text-left
                         [&_td]:p-3 [&_td]:border [&_td]:border-slate-200
                         [&_img]:rounded-xl [&_img]:shadow-sm [&_img]:my-6 [&_img]:mx-auto
                         [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_ul]:mb-6
                         [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-2 [&_ol]:mb-6
                         [&_strong]:text-slate-950 [&_strong]:font-bold
                         select-none"
              dangerouslySetInnerHTML={{
                __html: postData?.content || "<p>No written content available.</p>",
              }}
            />

            {/* Download CTA Card at the bottom of the article */}
            <div className="mt-14 p-6 sm:p-8 rounded-2xl bg-[#FFFBEB] border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
              <div>
                <h4 className="font-extrabold text-slate-950 text-base sm:text-lg">
                  Need an offline printable copy?
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Get the complete structured PDF for revision on your phone or laptop.
                </p>
              </div>

              <button
                onClick={() => setModalOpen(true)}
                className="w-full sm:w-auto px-6 py-3 bg-[#E5A83B] hover:bg-[#d49425] text-slate-950 font-black text-xs sm:text-sm rounded-xl transition shadow flex items-center justify-center gap-2 flex-shrink-0"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                Download PDF
              </button>
            </div>

          </article>
        )}
      </main>
    </div>
  );
}