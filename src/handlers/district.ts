import { Context } from "hono";
import { district } from "../drizzle-out/schema";
import { jsonResponse, errorResponse } from "../responses/respond";
import { getPaginationParams, getPaginationMeta } from "../utils/pagination";
import { countDistricts, fetchDistricts, DistrictDTO } from "../db/district";

export async function listDistrictsHandler(c: Context) {
  try {
    const url = new URL(c.req.raw.url);
    const pagination = getPaginationParams(url.searchParams);
    const { page, pageSize } = pagination;

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

    const total = await countDistricts(url.searchParams);
    const records = await fetchDistricts(
      url.searchParams,
      orderByField,
      sortOrder,
      pageSize,
      (page - 1) * pageSize,
    );

    const meta = getPaginationMeta(total, pagination);

    return c.json(jsonResponse<DistrictDTO[]>(records, meta));
  } catch (err: unknown) {
    console.error("List Districts Error:", err);
    if (err instanceof Error) {
      return c.json(errorResponse(err.message || "Internal Server Error"), 500);
    }
  }
}
