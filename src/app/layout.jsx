import "./globals.css";
import Footer from "../components/Footer";

export const metadata = {
  title: "Unique Geography Notes",
  description: "Curated by University Faculty",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className="min-h-screen flex flex-col antialiased bg-[#E5E9EF]">
        <div className="flex-1">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}