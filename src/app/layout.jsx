import "./globals.css";
import Script from "next/script";
import Footer from "../components/Footer";

export const metadata = {
  title: "Unique Geography Notes",
  description: "Official Geography Study Notes & Test Series",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Anti-copy / anti-inspect protection */}
        <Script
          id="disable-inspect"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              document.addEventListener('contextmenu', function(e) { e.preventDefault(); });
              document.addEventListener('keydown', function(e) {
                if (
                  e.key === 'F12' || 
                  (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'C' || e.key === 'J')) || 
                  (e.ctrlKey && e.key === 'U')
                ) {
                  e.preventDefault();
                }
              });
            `,
          }}
        />
        {/* Razorpay Checkout SDK */}
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-[#E5E9EF] antialiased">
        <div className="flex-1 flex flex-col w-full">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}