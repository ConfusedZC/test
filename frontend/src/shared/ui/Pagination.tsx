type PaginationProps = {
  page: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
};

export function Pagination({
  page,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
}: PaginationProps) {
  const safePageSize = Math.max(1, pageSize);
  const totalPages = Math.max(1, Math.ceil(totalCount / safePageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const start = totalCount === 0 ? 0 : (currentPage - 1) * safePageSize + 1;
  const end = Math.min(totalCount, currentPage * safePageSize);

  return (
    <div className="pagination">
      <div className="pagination__summary">
        <strong>
          {start}-{end}
        </strong>
        <span> / {totalCount} 条</span>
      </div>

      <div className="pagination__controls">
        {onPageSizeChange ? (
          <label className="pagination__size">
            <span>每页</span>
            <select
              className="pagination__select"
              value={safePageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <button
          className="pagination__button"
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          上一页
        </button>
        <div className="pagination__pages">
          <span>第</span>
          <strong>{currentPage}</strong>
          <span>页 / 共 {totalPages} 页</span>
        </div>
        <button
          className="pagination__button"
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          下一页
        </button>
      </div>
    </div>
  );
}
