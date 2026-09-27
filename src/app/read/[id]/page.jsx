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
  const [posts, pages] = await Promise.all([
    fetchAllWordPressItems("posts"),
    fetchAllWordPressItems("pages"),
  ]);

  const allEntries = [...posts, ...pages];
  const paths = [];
  const seen = new Set();

  allEntries.forEach((item) => {
    if (item.slug && !seen.has(item.slug)) {
      seen.add(item.slug);
      paths.push({ id: item.slug });
    }
    const strId = String(item.id);
    if (strId && !seen.has(strId)) {
      seen.add(strId);
      paths.push({ id: strId });
    }
  });

  // Ensure default fallback routes exist
  ["default", "geological-history-of-earth", "river-landforms"].forEach((fallback) => {
    if (!seen.has(fallback)) {
      paths.push({ id: fallback });
    }
  });

  return paths;
}

export default async function Page({ params }) {
  const resolvedParams = await params;
  return <ReaderClient rawId={resolvedParams?.id || ""} />;
}