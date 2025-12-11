import { Context } from "hono";
import { province } from "../drizzle-out/schema";
import { jsonResponse, errorResponse } from "../responses/respond";
import { getPaginationParams, getPaginationMeta } from "../utils/pagination";
import { countProvinces, fetchProvinces, ProvinceDTO } from "../db/province";
import { CACHE_TTL, getCacheKey } from "../utils/kv";

export async function listProvincesHandler(c: Context) {
  try {
    const url = new URL(c.req.raw.url);

    const cacheKey = getCacheKey(c.req.raw, "district");
    const cachedData = await c.env.QUERY_KV.get(cacheKey, "json");
    if (cachedData) {
      return c.json(cachedData);
    }

    const pagination = getPaginationParams(url.searchParams);
    const { page, pageSize } = pagination;

    const sortBy = parseInt(url.searchParams.get("sort_by") || "0", 10);
    const sortOrder = parseInt(url.searchParams.get("sort_order") || "0", 10);

    let orderByField;
    switch (sortBy) {
      case 1:
        orderByField = province.nameTh;
        break;
      case 2:
        orderByField = province.nameEn;
        break;
      default:
        orderByField = province.provinceId;
    }

    const total = await countProvinces();
    const records = await fetchProvinces(
      orderByField,
      sortOrder,
      pageSize,
      (page - 1) * pageSize,
    );

    const meta = getPaginationMeta(total, pagination);
    const responseData = jsonResponse<ProvinceDTO[]>(records, meta);

    c.executionCtx.waitUntil(
      c.env.QUERY_KV.put(cacheKey, JSON.stringify(responseData), {
        expirationTtl: CACHE_TTL,
      }),
    );

    return c.json(responseData);
  } catch (err: unknown) {
    console.error("List Provinces Error:", err);
    if (err instanceof Error) {
      return c.json(errorResponse(err.message || "Internal Server Error"), 500);
    }
  }
}
