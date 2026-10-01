import ReaderClient from "./ReaderClient";

export const dynamicParams = false;

async function fetchAllWordPressItems(endpoint) {
  const baseDomain = (
    process.env.NEXT_PUBLIC_WORDPRESS_URL || "https://geographynotespdf.com/cms"
  ).replace(/\/+$/, "");

  let allItems = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    try {
      const res = await fetch(
        `${baseDomain}/wp-json/wp/v2/${endpoint}?per_page=100&page=${page}&_fields=id,slug`,
        { next: { revalidate: 3600 } }
      );

      if (!res.ok) {
        hasMore = false;
        break;
      }

      const items = await res.json();
      if (Array.isArray(items) && items.length > 0) {
        allItems.push(...items);
        const totalPages = parseInt(res.headers.get("x-wp-totalpages") || "1", 10);
        if (page >= totalPages) {
          hasMore = false;
        } else {
          page++;
        }
      } else {
        hasMore = false;
      }
    } catch (err) {
      console.warn(`Static export warning for ${endpoint} page ${page}:`, err.message);
      hasMore = false;
    }
  }

  return allItems;
}

export async function generateStaticParams() {
  const [posts, pages, categories] = await Promise.all([
    fetchAllWordPressItems("posts"),
    fetchAllWordPressItems("pages"),
    fetchAllWordPressItems("categories"),
  ]);

  const allEntries = [...posts, ...pages, ...categories];
  const paths = [];
  const seen = new Set();

  const addPath = (rawVal) => {
    if (!rawVal || typeof rawVal !== "string") return;

    // Fully decode any pre-existing %20 or %XX so Windows filesystem never sees %25
    let clean = rawVal.trim();
    try {
      clean = decodeURIComponent(decodeURIComponent(clean));
    } catch (_) {
      try {
        clean = decodeURIComponent(clean);
      } catch (_) {}
    }

    // Skip empty, invalid characters, or strings still containing literal %
    if (!clean || clean.includes("%") || seen.has(clean)) return;

    seen.add(clean);
    paths.push({ id: clean });
  };

  // Add post/page/category slugs and IDs
  allEntries.forEach((item) => {
    if (item.slug) addPath(item.slug);
    if (item.id) addPath(String(item.id));
  });

  // Default routes and fallbacks without percent encoding
  const coreFallbacks = [
    "default",
    "geological-history-of-earth",
    "river-landforms",
    "भू-आकृति-विज्ञान",
    "जलवायु-विज्ञान",
    "समुद्र-विज्ञान",
    "भौगोलिक-चिंतन",
    "राजनीतिक-भूगोल",
    "प्रादेशिक-भूगोल",
    "आर्थिक-भूगोल",
    "मानव-भूगोल",
    "ग्रामीण-एवं-नगरीय-भूगोल",
    "पर्यावरण-भूगोल",
    "मानचित्र-कला",
    "जनसंख्या-भूगोल",
    "भारत-भूगोल",
    "बिहार-का-भूगोल",
    "विश्व-का-भूगोल",
    "सामान्य-भूगोल"
  ];

  coreFallbacks.forEach(addPath);

  return paths;
}

export default async function Page({ params }) {
  const resolvedParams = await params;
  return <ReaderClient rawId={resolvedParams?.id || ""} />;
}