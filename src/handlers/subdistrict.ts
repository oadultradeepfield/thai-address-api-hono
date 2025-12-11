import { Context } from "hono";
import { sql, eq, like, or, and, desc } from "drizzle-orm";
import { getDb } from "../db/database";
import { subdistrict, district, province } from "../drizzle-out/schema";
import { jsonResponse, errorResponse } from "../responses/respond";
import { getPaginationParams, getPaginationMeta } from "../utils/pagination";

interface SubdistrictDTO {
  subdistrict_id: number;
  thai_name: string | null;
  english_name: string | null;
  postal_code: number | null;
}

interface FullSubdistrictDTO {
  subdistrict_id: number;
  thai_name: string | null;
  english_name: string | null;
  postal_code: number | null;
  district: {
    district_id: number;
    thai_name: string | null;
    english_name: string | null;
  };
  province: {
    province_id: number;
    thai_name: string | null;
    english_name: string | null;
  };
}

export async function listSubdistrictsHandler(c: Context) {
  try {
    const db = getDb();
    const url = new URL(c.req.raw.url);
    const pagination = getPaginationParams(url.searchParams);
    const { page, pageSize } = pagination;

    const districtId = url.searchParams.get("district_id");
    const search = url.searchParams.get("search");
    const filters = [];
    if (districtId)
      filters.push(eq(subdistrict.districtId, parseInt(districtId, 10)));
    if (search) {
      filters.push(
        or(
          like(subdistrict.nameTh, `%${search}%`),
          like(subdistrict.nameEn, `%${search}%`),
        ),
      );
    }
    const whereClause = filters.length > 0 ? and(...filters) : undefined;

    const sortBy = parseInt(url.searchParams.get("sort_by") || "0", 10);
    const sortOrder = parseInt(url.searchParams.get("sort_order") || "0", 10);

    let orderByField;
    switch (sortBy) {
      case 1:
        orderByField = subdistrict.nameTh;
        break;
      case 2:
        orderByField = subdistrict.nameEn;
        break;
      case 3:
        orderByField = subdistrict.postalCode;
        break;
      default:
        orderByField = subdistrict.subdistrictId;
    }

    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(subdistrict)
      .where(whereClause);
    const total = Number(countResult?.count || 0);

    const baseQuery = db
      .select()
      .from(subdistrict)
      .where(whereClause)
      .orderBy(sortOrder === 1 ? desc(orderByField) : orderByField);

    const records =
      pageSize > 0
        ? await baseQuery.limit(pageSize).offset((page - 1) * pageSize)
        : await baseQuery;

    const data: SubdistrictDTO[] = records.map((s) => ({
      subdistrict_id: s.subdistrictId,
      thai_name: s.nameTh,
      english_name: s.nameEn,
      postal_code: s.postalCode,
    }));
    const meta = getPaginationMeta(total, pagination);

    return c.json(jsonResponse<SubdistrictDTO[]>(data, meta));
  } catch (err: unknown) {
    if (err instanceof Error) {
      return c.json(errorResponse(err.message || "Internal Server Error"), 500);
    }
    console.error("List Subdistricts Error:", err);
  }
}

export async function getSubdistrictsByPostalCodeHandler(c: Context) {
  try {
    const db = getDb();
    const postalCode = parseInt(c.req.param("postal_code"), 10);

    if (isNaN(postalCode)) {
      return c.json(errorResponse("Invalid postal code format"), 400);
    }

    const url = new URL(c.req.raw.url);
    const pagination = getPaginationParams(url.searchParams);
    const { page, pageSize } = pagination;

    const whereClause = eq(subdistrict.postalCode, postalCode);

    const sortBy = parseInt(url.searchParams.get("sort_by") || "0", 10);
    const sortOrder = parseInt(url.searchParams.get("sort_order") || "0", 10);

    let orderByField;
    switch (sortBy) {
      case 1:
        orderByField = subdistrict.nameTh;
        break;
      case 2:
        orderByField = subdistrict.nameEn;
        break;
      case 3:
        orderByField = subdistrict.postalCode;
        break;
      default:
        orderByField = subdistrict.subdistrictId;
    }

    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(subdistrict)
      .where(whereClause);
    const total = Number(countResult?.count || 0);

    const baseQuery = db
      .select({
        s: subdistrict,
        d: district,
        p: province,
      })
      .from(subdistrict)
      .innerJoin(district, eq(subdistrict.districtId, district.districtId))
      .innerJoin(province, eq(district.provinceId, province.provinceId))
      .where(whereClause)
      .orderBy(sortOrder === 1 ? desc(orderByField) : orderByField);

    const records =
      pageSize > 0
        ? await baseQuery.limit(pageSize).offset((page - 1) * pageSize)
        : await baseQuery;

    const data: FullSubdistrictDTO[] = records.map(({ s, d, p }) => ({
      subdistrict_id: s.subdistrictId,
      thai_name: s.nameTh,
      english_name: s.nameEn,
      postal_code: s.postalCode,
      district: {
        district_id: d.districtId,
        thai_name: d.nameTh,
        english_name: d.nameEn,
      },
      province: {
        province_id: p.provinceId,
        thai_name: p.nameTh,
        english_name: p.nameEn,
      },
    }));
    const meta = getPaginationMeta(total, pagination);

    return c.json(jsonResponse<FullSubdistrictDTO[]>(data, meta));
  } catch (err: unknown) {
    console.error("Get Subdistricts By Zip Error:", err);
    if (err instanceof Error) {
      return c.json(errorResponse(err.message || "Internal Server Error"), 500);
    }
  }
}
