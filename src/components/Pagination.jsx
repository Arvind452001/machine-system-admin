import React from "react";

const Pagination = ({
  currentPage = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
  itemName = "items",
  className = "",
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  if (totalItems === 0) {
    return (
      <footer className={`table-footer ${className}`}>
        <span>No ${itemName} found</span>
      </footer>
    );
  }

  const startIdx = (currentPage - 1) * pageSize + 1;
  const endIdx = Math.min(currentPage * pageSize, totalItems);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    return pages;
  };

  return (
    <footer
      className={`table-footer ${className}`}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "10px",
        padding: "13px 16px",
        borderTop: "1px solid #ededeb",
        color: "#888981",
        fontSize: "11px",
      }}
    >
      <span>
        Showing <strong>{startIdx}–{endIdx}</strong> of <strong>{totalItems}</strong> {itemName}
      </span>
      {totalPages > 1 && (
        <nav aria-label="Pagination" className="pagination" style={{ display: "flex", gap: "5px", alignItems: "center" }}>
          <button
            type="button"
            className="pagination-btn"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            aria-label="Previous page"
            style={{
              display: "grid",
              width: "29px",
              height: "29px",
              placeItems: "center",
              border: "1px solid #e9e9e5",
              borderRadius: "4px",
              background: currentPage <= 1 ? "#f5f5f3" : "#fff",
              color: currentPage <= 1 ? "#bbb" : "#65665f",
              cursor: currentPage <= 1 ? "not-allowed" : "pointer",
              fontSize: "11px",
              padding: 0,
            }}
          >
            <i className="bi bi-chevron-left"></i>
          </button>

          {getPageNumbers().map((page, idx) => {
            if (page === "...") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  style={{ width: "20px", textAlign: "center", color: "#999", fontSize: "11px" }}
                >
                  …
                </span>
              );
            }
            const isCurrent = page === currentPage;
            return (
              <button
                key={page}
                type="button"
                className={`pagination-btn ${isCurrent ? "current" : ""}`}
                onClick={() => onPageChange(page)}
                style={{
                  display: "grid",
                  width: "29px",
                  height: "29px",
                  placeItems: "center",
                  border: isCurrent ? "1px solid var(--accent, #e47756)" : "1px solid #e9e9e5",
                  borderRadius: "4px",
                  background: isCurrent ? "var(--accent, #e47756)" : "#fff",
                  color: isCurrent ? "#fff" : "#65665f",
                  fontWeight: isCurrent ? "700" : "400",
                  cursor: "pointer",
                  fontSize: "11px",
                  padding: 0,
                }}
              >
                {page}
              </button>
            );
          })}

          <button
            type="button"
            className="pagination-btn"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            aria-label="Next page"
            style={{
              display: "grid",
              width: "29px",
              height: "29px",
              placeItems: "center",
              border: "1px solid #e9e9e5",
              borderRadius: "4px",
              background: currentPage >= totalPages ? "#f5f5f3" : "#fff",
              color: currentPage >= totalPages ? "#bbb" : "#65665f",
              cursor: currentPage >= totalPages ? "not-allowed" : "pointer",
              fontSize: "11px",
              padding: 0,
            }}
          >
            <i className="bi bi-chevron-right"></i>
          </button>
        </nav>
      )}
    </footer>
  );
};

export default Pagination;
