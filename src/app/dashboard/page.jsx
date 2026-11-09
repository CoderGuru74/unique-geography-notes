"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowLeft,
  BookOpen,
  Sparkles,
  FileText,
  CreditCard,
  Download,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import AuthModal from "../../components/AuthModal";

export default function StudentDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal State for Purchasing missing plans from Dashboard
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState("");
  const [activePaperType, setActivePaperType] = useState(null);

  // Load user profile from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("notes_user");
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch (_) {}
      }
      setLoading(false);
    }
  }, [modalOpen]);

  const handleLogout = () => {
    localStorage.removeItem("notes_user");
    setUser(null);
    router.push("/category/exams");
  };

  const openPlanModal = (title, paperType = null) => {
    setModalAction(title);
    setActivePaperType(paperType);
    setModalOpen(true);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#E5E9EF] flex flex-col justify-center items-center font-sans">
        <div className="w-8 h-8 border-4 border-[#0B2545] border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs font-bold text-slate-600">Loading Student Dashboard...</p>
      </main>
    );
  }

  // If user is not logged in, prompt to log in or return home
  if (!user) {
    return (
      <main className="min-h-screen bg-[#E5E9EF] flex flex-col font-sans text-slate-900">
        <Navbar />
        <div className="max-w-md mx-auto my-auto p-8 bg-white rounded-3xl shadow-lg border border-gray-200 text-center space-y-4">
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-700">
            <User className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-black text-slate-900">Student Account Required</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Please log in or create an account to view your active plans, test series subscriptions, and PDF downloads.
          </p>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => {
                setModalAction("Student Dashboard Login");
                setActivePaperType(null);
                setModalOpen(true);
              }}
              className="flex-1 bg-[#0B2545] hover:bg-slate-900 text-amber-400 font-bold text-xs py-3 rounded-xl transition cursor-pointer"
            >
              Log In Now
            </button>
            <Link
              href="/category/exams"
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-3 rounded-xl transition flex items-center justify-center cursor-pointer"
            >
              Browse Tests
            </Link>
          </div>
        </div>

        <AuthModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          targetAction={modalAction}
          paperType={activePaperType}
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col bg-[#E5E9EF] font-sans text-slate-900">
      <Navbar />

      {/* Top Banner */}
      <section className="bg-[#0B2545] text-white py-8 px-4 sm:px-6 md:px-8 border-b border-slate-800">
        <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-amber-400/10 text-amber-400 border border-amber-400/30 rounded-full text-[11px] font-black uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Student Account Portal</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Welcome Back, {user.name || user.email.split("@")[0]}
            </h1>
            <p className="text-xs text-slate-300">{user.email}</p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/category/exams"
              className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer border border-white/20"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Tests</span>
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer border border-red-400/30"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </section>

      {/* Dashboard Content */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 py-8 w-full flex-1 space-y-8">
        {/* Active Subscriptions Overview Grid */}
        <section className="space-y-4">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-600" />
            <span>My Active Plans &amp; Subscriptions</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* 1. PDF Notes Pass Card */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded bg-slate-100 text-slate-800 border border-gray-200">
                    PDF Notes Access
                  </span>
                  {user.has_active_pass ? (
                    <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded border border-emerald-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> ACTIVE
                    </span>
                  ) : (
                    <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      INACTIVE
                    </span>
                  )}
                </div>

                <h3 className="text-base font-black text-slate-900 mb-1">
                  All-Access PDF Notes Pass (₹49)
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  Unlimited downloads for all current and future PDF notes and chapter summaries.
                </p>
              </div>

              {user.has_active_pass ? (
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>2-Month Unlimited Access Active</span>
                </div>
              ) : (
                <button
                  onClick={() => openPlanModal("Upgrade to PDF Notes Pass (₹49)", null)}
                  className="w-full bg-[#0B2545] hover:bg-slate-900 text-amber-400 font-black text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Lock className="w-3.5 h-3.5" /> Unlock Notes Pass (₹49)
                </button>
              )}
            </div>

            {/* 2. Paper 1 Test Series Card */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                    Paper 1 CBT Plan
                  </span>
                  {user.purchased_paper1 ? (
                    <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded border border-emerald-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> ACTIVE
                    </span>
                  ) : (
                    <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      INACTIVE
                    </span>
                  )}
                </div>

                <h3 className="text-base font-black text-slate-900 mb-1">
                  Paper 1 Common CBT Series (₹599)
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  Access to all General Teaching &amp; Research Aptitude mock papers and answer keys.
                </p>
              </div>

              {user.purchased_paper1 ? (
                <Link
                  href="/category/exams"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <BookOpen className="w-3.5 h-3.5" /> Practice Paper 1 Tests
                </Link>
              ) : (
                <button
                  onClick={() => openPlanModal("Unlock Paper 1 CBT Test Series (₹599)", "PAPER_1")}
                  className="w-full bg-[#E5A83B] hover:bg-[#d49425] text-slate-950 font-black text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Lock className="w-3.5 h-3.5" /> Unlock Paper 1 (₹599)
                </button>
              )}
            </div>

            {/* 3. Paper 2 Test Series Card */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Paper 2 CBT Plan
                  </span>
                  {user.purchased_paper2 ? (
                    <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded border border-emerald-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> ACTIVE
                    </span>
                  ) : (
                    <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      INACTIVE
                    </span>
                  )}
                </div>

                <h3 className="text-base font-black text-slate-900 mb-1">
                  Paper 2 Geography Specialist (₹599)
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  Access to Geography specialist mock tests, detailed solutions, and answer keys.
                </p>
              </div>

              {user.purchased_paper2 ? (
                <Link
                  href="/category/exams"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <BookOpen className="w-3.5 h-3.5" /> Practice Paper 2 Tests
                </Link>
              ) : (
                <button
                  onClick={() => openPlanModal("Unlock Paper 2 CBT Test Series (₹599)", "PAPER_2")}
                  className="w-full bg-[#E5A83B] hover:bg-[#d49425] text-slate-950 font-black text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Lock className="w-3.5 h-3.5" /> Unlock Paper 2 (₹599)
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Quick Links / Account Actions */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-base font-black text-slate-900">Need to start a test or download PDF notes?</h3>
            <p className="text-xs text-slate-500">
              Browse the live test series catalog to access full CBT mock tests and instant downloads.
            </p>
          </div>

          <Link
            href="/category/exams"
            className="bg-[#0B2545] hover:bg-slate-900 text-amber-400 text-xs font-black px-6 py-3 rounded-xl transition flex items-center gap-2 cursor-pointer shadow-xs shrink-0"
          >
            <FileText className="w-4 h-4" />
            <span>Go to Live Mock Tests</span>
          </Link>
        </section>
      </div>

      {/* Auth / Upgrade Modal */}
      <AuthModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        targetAction={modalAction}
        paperType={activePaperType}
      />
    </main>
  );
}