import { Context } from "hono";
import { province } from "../drizzle-out/schema";
import { jsonResponse, errorResponse } from "../responses/respond";
import { getPaginationParams, getPaginationMeta } from "../utils/pagination";
import { countProvinces, fetchProvinces, ProvinceDTO } from "../db/province";

export async function listProvincesHandler(c: Context) {
  try {
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

    const total = await countProvinces();
    const records = await fetchProvinces(
      orderByField,
      sortOrder,
      pageSize,
      (page - 1) * pageSize,
    );

    const meta = getPaginationMeta(total, pagination);

    return c.json(jsonResponse<ProvinceDTO[]>(records, meta));
  } catch (err: unknown) {
    console.error("List Provinces Error:", err);
    if (err instanceof Error) {
      return c.json(errorResponse(err.message || "Internal Server Error"), 500);
    }
  }
}
