export const CACHE_TTL = 86_400; // 1 day

export function getCacheKey(
  req: Request,
  type: "province" | "district" | "subdistrict",
) {
  return `${type}:${req.url}`;
}
