export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginationMeta {
  totalRecords: number;
  currentPage: number;
  recordsPerPage: number;
  totalPages: number;
  displayedRecords: number;
}

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;

export function getPaginationParams(
  query: URLSearchParams,
  defaultPageSize: number = DEFAULT_PAGE_SIZE,
): PaginationParams {
  const rawPage = parseInt(query.get("page") || "", 10);
  const rawPageSize = parseInt(query.get("page_size") || "", 10);

  const page = !isNaN(rawPage) && rawPage > 0 ? rawPage : DEFAULT_PAGE;
  const pageSize =
    !isNaN(rawPageSize) && rawPageSize >= 0 ? rawPageSize : defaultPageSize;

  return { page, pageSize };
}

export function getPaginationMeta(
  total: number,
  params: PaginationParams,
): PaginationMeta | undefined {
  const { page, pageSize } = params;

  if (pageSize <= 0) {
    return undefined;
  }

  const totalPages = Math.ceil(total / pageSize);

  const startCount = (page - 1) * pageSize;
  const remaining = Math.max(0, total - startCount);
  const displayedRecords = Math.min(pageSize, remaining);

  return {
    totalRecords: total,
    currentPage: page,
    recordsPerPage: pageSize,
    totalPages,
    displayedRecords,
  };
}
