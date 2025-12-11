import { Context } from "hono";
import { subdistrict } from "../drizzle-out/schema";
import { jsonResponse, errorResponse } from "../responses/respond";
import { getPaginationParams, getPaginationMeta } from "../utils/pagination";
import {
  countSubdistricts,
  fetchSubdistricts,
  fetchSubdistrictsByPostalCode,
  SubdistrictDTO,
  FullSubdistrictDTO,
} from "../db/subdistrict";

export async function listSubdistrictsHandler(c: Context) {
  try {
    const url = new URL(c.req.raw.url);
    const pagination = getPaginationParams(url.searchParams);
    const { page, pageSize } = pagination;

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

    const total = await countSubdistricts(url.searchParams);
    const records = await fetchSubdistricts(
      url.searchParams,
      orderByField,
      sortOrder,
      pageSize,
      (page - 1) * pageSize,
    );

    const meta = getPaginationMeta(total, pagination);

    return c.json(jsonResponse<SubdistrictDTO[]>(records, meta));
  } catch (err: unknown) {
    if (err instanceof Error) {
      return c.json(errorResponse(err.message || "Internal Server Error"), 500);
    }
    console.error("List Subdistricts Error:", err);
  }
}

export async function getSubdistrictsByPostalCodeHandler(c: Context) {
  try {
    const postalCode = parseInt(c.req.param("postal_code"), 10);

    if (isNaN(postalCode)) {
      return c.json(errorResponse("Invalid postal code format"), 400);
    }

    const url = new URL(c.req.raw.url);
    const pagination = getPaginationParams(url.searchParams);
    const { page, pageSize } = pagination;

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

    const records = await fetchSubdistrictsByPostalCode(
      postalCode,
      orderByField,
      sortOrder,
      pageSize,
      (page - 1) * pageSize,
    );

    const meta = getPaginationMeta(records.length, pagination);

    return c.json(jsonResponse<FullSubdistrictDTO[]>(records, meta));
  } catch (err: unknown) {
    console.error("Get Subdistricts By Zip Error:", err);
    if (err instanceof Error) {
      return c.json(errorResponse(err.message || "Internal Server Error"), 500);
    }
  }
}
