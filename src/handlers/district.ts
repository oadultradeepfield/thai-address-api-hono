import { Context } from "hono";
import { sql, eq, and, like, or, desc } from "drizzle-orm";
import { getDb } from "../db/database";
import { district } from "../drizzle-out/schema";
import { jsonResponse, errorResponse } from "../responses/respond";
import { getPaginationParams, getPaginationMeta } from "../utils/pagination";

interface DistrictDTO {
  district_id: number;
  thai_name: string | null;
  english_name: string | null;
}

export async function listDistrictsHandler(c: Context) {
  try {
    const db = getDb();
    const url = new URL(c.req.raw.url);
    const pagination = getPaginationParams(url.searchParams);
    const { page, pageSize } = pagination;

    const provinceId = url.searchParams.get("province_id");
    const search = url.searchParams.get("search");

    const filters = [];
    if (provinceId)
      filters.push(eq(district.provinceId, parseInt(provinceId, 10)));
    if (search) {
      filters.push(
        or(
          like(district.nameTh, `%${search}%`),
          like(district.nameEn, `%${search}%`),
        ),
      );
    }
    const whereClause = filters.length > 0 ? and(...filters) : undefined;

    const sortBy = parseInt(url.searchParams.get("sort_by") || "0", 10);
    const sortOrder = parseInt(url.searchParams.get("sort_order") || "0", 10);

    let orderByField;
    switch (sortBy) {
      case 1:
        orderByField = district.nameTh;
        break;
      case 2:
        orderByField = district.nameEn;
        break;
      default:
        orderByField = district.districtId;
    }

    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(district)
      .where(whereClause);

    const total = Number(countResult?.count || 0);

    const baseQuery = db
      .select()
      .from(district)
      .where(whereClause)
      .orderBy(sortOrder === 1 ? desc(orderByField) : orderByField);

    const records =
      pageSize > 0
        ? await baseQuery.limit(pageSize).offset((page - 1) * pageSize)
        : await baseQuery;

    const data: DistrictDTO[] = records.map((d) => ({
      district_id: d.districtId,
      thai_name: d.nameTh,
      english_name: d.nameEn,
    }));
    const meta = getPaginationMeta(total, pagination);

    return c.json(jsonResponse<DistrictDTO[]>(data, meta));
  } catch (err: unknown) {
    console.error("List Districts Error:", err);
    if (err instanceof Error) {
      return c.json(errorResponse(err.message || "Internal Server Error"), 500);
    }
  }
}
