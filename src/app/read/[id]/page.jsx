import ReaderClient from "./ReaderClient";

// Generates the single static route shell for Hostinger static export.
// All dynamic post URLs (/read/*) get redirected to this shell via .htaccess,
// and ReaderClient fetches the post content live from WordPress.
export async function generateStaticParams() {
  return [{ id: "default" }];
}

export default async function Page({ params }) {
  const resolvedParams = await params;
  
  let rawId = resolvedParams?.id || "";
  if (typeof rawId === "string") {
    rawId = rawId.replace(/\/+$/, "");
    try {
      rawId = decodeURIComponent(rawId);
    } catch (_) {}
  }

  return <ReaderClient rawId={rawId} />;
}