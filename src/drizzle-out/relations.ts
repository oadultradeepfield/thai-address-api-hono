import { relations } from "drizzle-orm/relations";
import { province, district, subdistrict } from "./schema";

export const districtRelations = relations(district, ({one, many}) => ({
	province: one(province, {
		fields: [district.provinceId],
		references: [province.provinceId]
	}),
	subdistricts: many(subdistrict),
}));

export const provinceRelations = relations(province, ({many}) => ({
	districts: many(district),
}));

export const subdistrictRelations = relations(subdistrict, ({one}) => ({
	district: one(district, {
		fields: [subdistrict.districtId],
		references: [district.districtId]
	}),
}));