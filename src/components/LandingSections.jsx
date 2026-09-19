import { Quote } from "lucide-react";

export function ProfessorSection() {
  return (
    <section className="max-w-4xl mx-auto px-4 my-12">
      <div className="bg-[#F6E9D5] rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 shadow-sm">
        <div className="w-48 h-60 bg-amber-200/60 rounded-2xl flex items-center justify-center overflow-hidden border border-amber-300">
          <span className="text-6xl">👨‍🏫</span>
        </div>

        <div className="flex-1 text-left">
          <h2 className="text-2xl font-extrabold text-slate-900">Prof. R. K. Sharma</h2>
          <p className="text-sm font-medium text-slate-600 mb-4">Patna University</p>

          <h3 className="text-sm font-bold text-slate-900 mb-1">Guided By academic excellence</h3>
          <p className="text-xs text-slate-600 leading-relaxed mb-6">
            Over 25+ Years of university - Level teaching experience. A mentor to thousands of UPSC/PSC aspirants, dedicated to making simplified, accurate geography material accessible to all.
          </p>

          <div className="bg-white/80 backdrop-blur rounded-2xl p-4 shadow-sm border border-amber-200/50">
            <p className="text-xs italic text-slate-700">
              "Our Goal is to make high-standard academic notes accessible to every student preparing for competitive exams across India."
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function TestimonialsSection() {
  const reviews = [
    { name: "Harsh", text: "The mapping and GS prelims summaries cut my revision time in half." },
    { name: "Nishant", text: "University semester notes followed strictly syllabus standard. High yield." },
    { name: "Mayank", text: "Clear diagrams and accurate NCERT point-to-point explanations." },
  ];

  return (
    <section className="py-10 max-w-5xl mx-auto px-4">
      <h2 className="text-2xl font-bold text-center text-slate-900 mb-8">Student Testimonials</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reviews.map((r, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 relative">
            <Quote className="w-6 h-6 text-blue-600 mb-3" />
            <h4 className="font-bold text-sm text-slate-900 mb-1">{r.name}</h4>
            <p className="text-xs text-slate-500 leading-relaxed">{r.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ContactSection() {
  return (
    <section className="max-w-3xl mx-auto px-4 py-12 text-center">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Contact Us</h2>
      <form className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="Your Name :" className="w-full bg-white rounded-xl px-4 py-3 text-xs border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input type="email" placeholder="Email Address :" className="w-full bg-white rounded-xl px-4 py-3 text-xs border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <textarea rows={4} placeholder="Enter Your Message :" className="w-full bg-white rounded-xl p-4 text-xs border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <button type="submit" className="bg-[#2B70F7] hover:bg-blue-600 text-white font-semibold text-xs px-8 py-3 rounded-xl transition shadow">
          Send Message
        </button>
      </form>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="bg-[#0D1B2A] text-white pt-12 pb-8">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="w-10 h-10 bg-[#FFCC00] rounded-full flex items-center justify-center text-black font-black mb-3">
            ✳
          </div>
          <h3 className="font-bold text-sm">Unique Geography Notes</h3>
          <p className="text-[11px] text-gray-400">Curated by University Faculty</p>
        </div>

        <div>
          <h4 className="font-semibold text-xs uppercase tracking-wider text-gray-300 mb-3">Quick Links</h4>
          <ul className="space-y-1.5 text-xs text-gray-400">
            <li><a href="/category/upsc" className="hover:text-white">UPSC Notes</a></li>
            <li><a href="/category/ncert" className="hover:text-white">NCERT 6-12</a></li>
            <li><a href="/category/bihar-board" className="hover:text-white">Bihar Board 6-12</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-xs uppercase tracking-wider text-gray-300 mb-3">Exams</h4>
          <ul className="space-y-1.5 text-xs text-gray-400">
            <li><a href="/category/ctet" className="hover:text-white">CTET</a></li>
            <li><a href="/category/ugc-net" className="hover:text-white">UGC-NET/JRF</a></li>
            <li><a href="/category/general-competition" className="hover:text-white">General Competition</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-xs uppercase tracking-wider text-gray-300 mb-3">Contact Us</h4>
          <ul className="space-y-1.5 text-xs text-gray-400">
            <li>E-mail</li>
            <li>Telegram</li>
            <li>Whatsapp</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}