import { Context } from "hono";
import { sql, desc } from "drizzle-orm";
import { getDb } from "../db/database";
import { province } from "../drizzle-out/schema";
import { jsonResponse, errorResponse } from "../responses/respond";
import { getPaginationParams, getPaginationMeta } from "../utils/pagination";

interface ProvinceDTO {
  province_id: number;
  thai_name: string | null;
  english_name: string | null;
}

export async function listProvincesHandler(c: Context) {
  try {
    const db = getDb();

    const url = new URL(c.req.raw.url);
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

    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(province);
    const total = Number(countResult?.count || 0);

    const baseQuery = db
      .select()
      .from(province)
      .orderBy(sortOrder === 1 ? desc(orderByField) : orderByField);
    const records =
      pageSize > 0
        ? await baseQuery.limit(pageSize).offset((page - 1) * pageSize)
        : await baseQuery;

    const data: ProvinceDTO[] = records.map((p) => ({
      province_id: p.provinceId,
      thai_name: p.nameTh,
      english_name: p.nameEn,
    }));
    const meta = getPaginationMeta(total, pagination);

    return c.json(jsonResponse<ProvinceDTO[]>(data, meta));
  } catch (err: any) {
    console.error("List Provinces Error:", err);
    return c.json(errorResponse(err.message || "Internal Server Error"), 500);
  }
}
