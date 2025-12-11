import {
  sqliteTable,
  AnySQLiteColumn,
  index,
  integer,
  text,
  foreignKey,
  real,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const province = sqliteTable(
  "province",
  {
    provinceId: integer("province_id").primaryKey().notNull(),
    nameTh: text("name_th"),
    nameEn: text("name_en"),
  },
  (table) => [
    index("idx_province_nameEn").on(table.nameEn),
    index("idx_province_nameTh").on(table.nameTh),
  ],
);

export const district = sqliteTable(
  "district",
  {
    districtId: integer("district_id").primaryKey().notNull(),
    provinceId: integer("province_id").references(() => province.provinceId),
    nameTh: text("name_th"),
    nameEn: text("name_en"),
  },
  (table) => [
    index("idx_district_nameEn").on(table.nameEn),
    index("idx_district_nameTh").on(table.nameTh),
    index("idx_district_provinceId").on(table.provinceId),
  ],
);

export const subdistrict = sqliteTable(
  "subdistrict",
  {
    subdistrictId: integer("subdistrict_id").primaryKey(),
    districtId: integer("district_id").references(() => district.districtId),
    nameTh: text("name_th"),
    nameEn: text("name_en"),
    lat: real(),
    long: real(),
    postalCode: integer("postal_code"),
  },
  (table) => [
    index("idx_subdistrict_districtId_postalCode").on(
      table.districtId,
      table.postalCode,
    ),
    index("idx_subdistrict_districtId_nameTh").on(
      table.districtId,
      table.nameTh,
    ),
    index("idx_subdistrict_nameEn").on(table.nameEn),
    index("idx_subdistrict_nameTh").on(table.nameTh),
    index("idx_subdistrict_postalCode").on(table.postalCode),
    index("idx_subdistrict_districtId").on(table.districtId),
  ],
);
