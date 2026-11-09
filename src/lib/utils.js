// Sanitize WordPress slugs to avoid double-prefixing (/read/read%2Fslug)
export const sanitizeSlug = (rawSlug) => {
    if (!rawSlug) return "";
    return rawSlug
      .replace(/^https?:\/\/[^\/]+/, "") // Remove full domain if present
      .replace(/^\/?read\//, "")         // Remove leading "read/" or "/read/"
      .replace(/^\/+|\/+$/g, "");        // Trim extra slashes
  };