import { sql, eq, like, or, and, desc } from "drizzle-orm";
import { getDb } from "../db/database";
import { subdistrict, district, province } from "../drizzle-out/schema";
import { SQLiteColumn } from "drizzle-orm/sqlite-core";

export interface SubdistrictDTO {
  subdistrict_id: number;
  thai_name: string | null;
  english_name: string | null;
  postal_code: number | null;
}

export interface FullSubdistrictDTO {
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

function buildWhereClause(searchParams: URLSearchParams) {
  const districtId = searchParams.get("district_id");
  const search = searchParams.get("search");

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
  return filters.length > 0 ? and(...filters) : undefined;
}

export async function countSubdistricts(
  searchParams: URLSearchParams,
): Promise<number> {
  const db = getDb();
  const whereClause = buildWhereClause(searchParams);
  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(subdistrict)
    .where(whereClause);
  return Number(countResult?.count || 0);
}

export async function fetchSubdistricts(
  searchParams: URLSearchParams,
  orderByField: SQLiteColumn,
  sortOrder: number,
  limit: number,
  offset: number,
): Promise<SubdistrictDTO[]> {
  const db = getDb();
  const whereClause = buildWhereClause(searchParams);
  const baseQuery = db
    .select()
    .from(subdistrict)
    .where(whereClause)
    .orderBy(sortOrder === 1 ? desc(orderByField) : orderByField);

  const records =
    limit > 0 ? await baseQuery.limit(limit).offset(offset) : await baseQuery;

  return records.map((s) => ({
    subdistrict_id: s.subdistrictId,
    thai_name: s.nameTh,
    english_name: s.nameEn,
    postal_code: s.postalCode,
  }));
}

export async function fetchSubdistrictsByPostalCode(
  postalCode: number,
  orderByField: SQLiteColumn,
  sortOrder: number,
  limit: number,
  offset: number,
): Promise<FullSubdistrictDTO[]> {
  const db = getDb();
  const whereClause = eq(subdistrict.postalCode, postalCode);

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
    limit > 0 ? await baseQuery.limit(limit).offset(offset) : await baseQuery;

  return records.map(({ s, d, p }) => ({
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
}
