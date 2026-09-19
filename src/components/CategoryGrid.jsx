import Link from "next/link";

const categories = [
  {
    title: "UPSC & State PSC",
    desc: "Prelims & Mains Geography & GS Papers",
    href: "/category/upsc",
    icon: "🏛️",
  },
  {
    title: "University Notes",
    desc: "B.A., M.A., & Semester exam geography modules",
    href: "/category/university",
    icon: "🎓",
  },
  {
    title: "NCERT (6th to 12th)",
    desc: "Class-wise chapter Summaries & Key Points",
    href: "/category/ncert",
    badge: "NCERT Class 6-12",
  },
  {
    title: "Bihar Board",
    desc: "BSEB Geography & Social Science Notes (Hindi/English)",
    href: "/category/bihar-board",
    icon: "📜",
  },
  {
    title: "CTET",
    desc: "Paper - 1 & Paper - 2 Geography Syllabus",
    href: "/category/ctet",
    icon: "🎯",
  },
  {
    title: "UGC-NET / JRF",
    desc: "Paper - 1 & Paper - 2 Geography Syllabus",
    href: "/category/ugc-net",
    icon: "🏛️",
  },
  {
    title: "General competition",
    desc: "SSC, Railways, Banking, GK & GS PDFs",
    href: "/category/general-competition",
    icon: "⭐",
  },
  {
    title: "Latest Current Affairs/Map Notes",
    desc: "High Yield Diagrams & Mapping Material",
    href: "/category/map-notes",
    icon: "🗺️",
  },
];

export default function CategoryGrid() {
  return (
    <section className="py-12">
      <h2 className="text-2xl md:text-3xl font-bold text-center text-slate-900 mb-10">
        Choose Your Preparation Category
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto px-4">
        {categories.map((cat, idx) => (
          <Link
            key={idx}
            href={cat.href}
            className="bg-white rounded-2xl p-6 flex flex-col items-center text-center shadow-sm hover:shadow-md transition border border-gray-200/70"
          >
            <h3 className="text-base font-bold text-slate-900 mb-4">{cat.title}</h3>
            
            <div className="h-20 flex items-center justify-center mb-4">
              {cat.badge ? (
                <div className="bg-[#FFCC00] text-black font-extrabold px-3 py-1.5 rounded text-sm text-center shadow-inner">
                  NCERT <br /> Class 6-12
                </div>
              ) : (
                <span className="text-5xl">{cat.icon}</span>
              )}
            </div>

            <p className="text-xs text-slate-500 max-w-[200px] leading-relaxed">
              {cat.desc}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}