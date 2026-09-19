import Link from "next/link";
import Image from "next/image";
import { Mail, Send } from "lucide-react";

function InstagramIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function YoutubeIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function FacebookIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="w-full bg-[#111827] text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
          
          {/* Brand & About */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-10 h-10 rounded-full overflow-hidden border border-slate-700 bg-white">
                <Image
                  src="/images/logo.jpeg"
                  alt="Unique Geography Notes"
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </div>
              <span className="text-lg font-black text-white tracking-tight">
                Unique Geography Notes
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-5">
              Comprehensive geography and social science notes curated by university faculty for School Boards, Civil Services, and Competitive Exams.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://www.instagram.com/uniquegeoconcept/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-[#E5A83B] hover:text-slate-950 text-slate-300 flex items-center justify-center transition"
              >
                <InstagramIcon />
              </a>
              <a
                href="https://www.youtube.com/@geographynotespdf"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-[#E5A83B] hover:text-slate-950 text-slate-300 flex items-center justify-center transition"
              >
                <YoutubeIcon />
              </a>
              <a
                href="https://facebook.com/share/1CakzgXgww"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-[#E5A83B] hover:text-slate-950 text-slate-300 flex items-center justify-center transition"
              >
                <FacebookIcon />
              </a>
              <a
                href="mailto:amarkumar10291@gmail.com"
                aria-label="Email"
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-[#E5A83B] hover:text-slate-950 text-slate-300 flex items-center justify-center transition"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-white mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/category/upsc" className="hover:text-[#E5A83B] transition">
                  UPSC &amp; All PSC Notes
                </Link>
              </li>
              <li>
                <Link href="/category/school/cbse" className="hover:text-[#E5A83B] transition">
                  NCERT 6–12 Solutions
                </Link>
              </li>
              <li>
                <Link href="/category/school/bseb" className="hover:text-[#E5A83B] transition">
                  Bihar Board (BSEB) 6–12
                </Link>
              </li>
              <li>
                <Link href="/category/university" className="hover:text-[#E5A83B] transition">
                  University (UG &amp; PG) Syllabus
                </Link>
              </li>
            </ul>
          </div>

          {/* Competitive Exams */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-white mb-4">
              Competitive Exams
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/category/exams" className="hover:text-[#E5A83B] transition">
                  CTET (Paper 1 &amp; 2)
                </Link>
              </li>
              <li>
                <Link href="/category/exams" className="hover:text-[#E5A83B] transition">
                  UGC–NET / JRF Geography
                </Link>
              </li>
              <li>
                <Link href="/category/gc" className="hover:text-[#E5A83B] transition">
                  General Competition (GC)
                </Link>
              </li>
              <li>
                <Link href="/category/gc" className="hover:text-[#E5A83B] transition">
                  Bihar Daroga &amp; Police GS
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Community */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-white mb-4">
              Connect With Us
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a
                  href="mailto:amarkumar10291@gmail.com"
                  className="hover:text-[#E5A83B] transition flex items-center gap-2"
                >
                  <Mail className="w-3.5 h-3.5 text-[#E5A83B]" />
                  amarkumar10291@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="https://www.youtube.com/@geographynotespdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#E5A83B] transition flex items-center gap-2"
                >
                  <YoutubeIcon className="w-3.5 h-3.5 text-red-500" />
                  @geographynotespdf
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/uniquegeoconcept/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#E5A83B] transition flex items-center gap-2"
                >
                  <InstagramIcon className="w-3.5 h-3.5 text-pink-500" />
                  @uniquegeoconcept
                </a>
              </li>
              <li>
                <a
                  href="https://facebook.com/share/1CakzgXgww"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#E5A83B] transition flex items-center gap-2"
                >
                  <FacebookIcon className="w-3.5 h-3.5 text-blue-500" />
                  Facebook Page
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Credits */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span>
            Designed and developed by <strong className="text-slate-400">PIXELNODE</strong>
          </span>
          <span>
            &copy; 2026. All rights reserved by Unique Geography Notes.
          </span>
        </div>
      </div>
    </footer>
  );
}