import { sql, eq, and, like, or, desc } from "drizzle-orm";
import { getDb } from "../db/database";
import { district } from "../drizzle-out/schema";
import { SQLiteColumn } from "drizzle-orm/sqlite-core";

export interface DistrictDTO {
  district_id: number;
  thai_name: string | null;
  english_name: string | null;
}

function buildWhereClause(searchParams: URLSearchParams) {
  const provinceId = searchParams.get("province_id");
  const search = searchParams.get("search");

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
  return filters.length > 0 ? and(...filters) : undefined;
}

export async function countDistricts(
  searchParams: URLSearchParams,
): Promise<number> {
  const db = getDb();
  const whereClause = buildWhereClause(searchParams);
  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(district)
    .where(whereClause);
  return Number(countResult?.count || 0);
}

export async function fetchDistricts(
  searchParams: URLSearchParams,
  orderByField: SQLiteColumn,
  sortOrder: number,
  limit: number,
  offset: number,
): Promise<DistrictDTO[]> {
  const db = getDb();
  const whereClause = buildWhereClause(searchParams);
  const baseQuery = db
    .select()
    .from(district)
    .where(whereClause)
    .orderBy(sortOrder === 1 ? desc(orderByField) : orderByField);

  const records =
    limit > 0 ? await baseQuery.limit(limit).offset(offset) : await baseQuery;

  return records.map((d) => ({
    district_id: d.districtId,
    thai_name: d.nameTh,
    english_name: d.nameEn,
  }));
}
