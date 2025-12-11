import { sql, desc } from "drizzle-orm";
import { getDb } from "../db/database";
import { province } from "../drizzle-out/schema";
import { SQLiteColumn } from "drizzle-orm/sqlite-core";

export interface ProvinceDTO {
  province_id: number;
  thai_name: string | null;
  english_name: string | null;
}

export async function countProvinces(): Promise<number> {
  const db = getDb();
  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(province);
  return Number(countResult?.count || 0);
}

export async function fetchProvinces(
  orderByField: SQLiteColumn,
  sortOrder: number,
  limit: number,
  offset: number,
): Promise<ProvinceDTO[]> {
  const db = getDb();
  const baseQuery = db
    .select()
    .from(province)
    .orderBy(sortOrder === 1 ? desc(orderByField) : orderByField);

  const records =
    limit > 0 ? await baseQuery.limit(limit).offset(offset) : await baseQuery;

  return records.map((p) => ({
    province_id: p.provinceId,
    thai_name: p.nameTh,
    english_name: p.nameEn,
  }));
}
