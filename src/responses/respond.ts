import { PaginationMeta } from "../utils/pagination";

export interface ApiResponse<T> {
  message: string;
  data?: T;
  meta?: PaginationMeta;
}

export function jsonResponse<T>(
  data: T,
  meta?: PaginationMeta,
  message: string = "OK",
): ApiResponse<T> {
  const body: ApiResponse<T> = { message };

  if (data !== undefined) {
    body.data = data;
  }

  if (meta) {
    body.meta = meta;
  }

  return body;
}

export function errorResponse(message: string): ApiResponse<void> {
  return { message };
}
