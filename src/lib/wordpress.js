const WP_API_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || "https://admin.yourdomain.com";

export async function getPostsByTabSlug(tabSlug) {
  try {
    // 1. Find category ID by slug
    const catRes = await fetch(`${WP_API_URL}/wp-json/wp/v2/categories?slug=${tabSlug}`, {
      next: { revalidate: 30 }, // Re-checks WordPress every 30 seconds
    });
    const categories = await catRes.json();
    if (!categories.length) return [];

    const categoryId = categories[0].id;

    // 2. Fetch posts inside that category
    const postsRes = await fetch(
      `${WP_API_URL}/wp-json/wp/v2/posts?categories=${categoryId}&_embed&per_page=20`,
      { next: { revalidate: 30 } }
    );
    const posts = await postsRes.json();

    // 3. Map WordPress data to clean card props
    return posts.map((post) => ({
      id: post.id,
      title: post.title?.rendered || "Untitled Note",
      tag: post.acf?.sub_topic || "General Geography",
      chapters: post.acf?.chapters || 0,
      pages: post.acf?.pages || 0,
      size: post.acf?.file_size || "PDF",
      pdfUrl: post.acf?.pdf_file?.url || post.acf?.pdf_file || "#",
    }));
  } catch (error) {
    console.error("Error fetching from WordPress:", error);
    return [];
  }
}