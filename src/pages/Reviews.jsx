import { useState, useEffect, useMemo } from "react";
import AdminLayout from "../components/AdminLayout";
import Footer from "../components/Footer";
import { reviewsApi } from "../api/reviewsApi";
import Pagination from "../components/Pagination";
import StatSpinner from "../components/StatSpinner";

const AVATAR_PALETTES = [
  { bg: "#173f35", text: "#e8fdf2", border: "#2e7456" },
  { bg: "#3d140b", text: "#ffedd5", border: "#9a3412" },
  { bg: "#1e293b", text: "#f1f5f9", border: "#475569" },
  { bg: "#2d2013", text: "#fef3c7", border: "#92400e" },
  { bg: "#0f2c3d", text: "#e0f2fe", border: "#0284c7" },
  { bg: "#23272f", text: "#e2e8f0", border: "#52525b" },
];

const getInitials = (name) => {
  if (!name || typeof name !== "string") return "MS";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const getAvatarPalette = (str) => {
  let hash = 0;
  for (let i = 0; i < (str || "").length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return AVATAR_PALETTES[Math.abs(hash) % AVATAR_PALETTES.length];
};

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReview, setSelectedReview] = useState(null);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [alertBanner, setAlertBanner] = useState(null);
  const PAGE_SIZE = 8;

  const loadReviews = () => {
    setLoading(true);
    reviewsApi
      .getAllReviews()
      .then((res) => {
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setReviews(list);
      })
      .catch((err) => {
        console.warn("Could not load reviews:", err.message);
        setReviews([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const confirmDelete = async () => {
    if (!reviewToDelete) return;
    setDeleteSubmitting(true);
    try {
      await reviewsApi.deleteReview(reviewToDelete._id);
      setReviews((prev) => prev.filter((r) => r._id !== reviewToDelete._id));
      setAlertBanner({
        type: "success",
        message: `Review from ${reviewToDelete.authorName} removed successfully.`,
      });
      setReviewToDelete(null);
      setTimeout(() => setAlertBanner(null), 4000);
    } catch (err) {
      setAlertBanner({
        type: "danger",
        message: err.response?.data?.message || "Could not delete review.",
      });
      setTimeout(() => setAlertBanner(null), 5000);
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (r.authorName && r.authorName.toLowerCase().includes(q)) ||
        (r.company && r.company.toLowerCase().includes(q)) ||
        (r.country && r.country.toLowerCase().includes(q)) ||
        (r.machinePurchased && r.machinePurchased.toLowerCase().includes(q)) ||
        (r.headline && r.headline.toLowerCase().includes(q)) ||
        (r.comment && r.comment.toLowerCase().includes(q));

      const matchesRating =
        ratingFilter === "all" || String(r.rating) === String(ratingFilter);

      return matchesSearch && matchesRating;
    });
  }, [reviews, searchTerm, ratingFilter]);

  const totalPages = Math.ceil(filteredReviews.length / PAGE_SIZE) || 1;
  const paginatedReviews = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredReviews.slice(start, start + PAGE_SIZE);
  }, [filteredReviews, currentPage]);

  const stats = useMemo(() => {
    if (reviews.length === 0) {
      return { total: 0, avg: "5.0", fiveStar: 0, recentAuthor: "—" };
    }
    const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
    const avg = (sum / reviews.length).toFixed(1);
    const fiveStar = reviews.filter((r) => Number(r.rating) === 5).length;
    const recentAuthor = reviews[0]?.authorName || "—";
    return { total: reviews.length, avg, fiveStar, recentAuthor };
  }, [reviews]);

  const breadcrumb = (
    <>
      <span>Engagement</span>
      <i className="bi bi-chevron-right"></i>
      <strong>Customer Reviews</strong>
    </>
  );

  return (
    <AdminLayout breadcrumb={breadcrumb} title="Customer Reviews">
      <main className="content-area">
        {/* Alert Banner */}
        {alertBanner && (
          <div
            className={`alert alert-${alertBanner.type === "success" ? "success" : "danger"} mb-3`}
            style={{
              background: alertBanner.type === "success" ? "#def7ec" : "#fde8e8",
              color: alertBanner.type === "success" ? "#03543f" : "#9b1c1c",
              padding: "12px 16px",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "12px",
              fontWeight: "500",
              marginBottom: "16px",
            }}
          >
            <i
              className={`bi bi-${alertBanner.type === "success" ? "check-circle" : "exclamation-triangle"}`}
            ></i>
            <span>{alertBanner.message}</span>
          </div>
        )}

        {/* Top Summary Metric Cards */}
        <section className="summary-strip">
          <div className="summary-item">
            <span>Total Reviews</span>
            <strong>{loading ? <StatSpinner /> : stats.total}</strong>
            <small>{loading ? "Loading..." : "Verified customer submissions"}</small>
          </div>
          <div className="summary-item">
            <span>Average Rating</span>
            <strong>
              {loading ? (
                <StatSpinner />
              ) : (
                <>
                  {stats.avg} <span style={{ color: "#eab308", fontSize: "16px" }}>★</span>
                </>
              )}
            </strong>
            <small>{loading ? "Loading..." : "Out of 5.0 stars"}</small>
          </div>
          <div className="summary-item">
            <span>5-Star Feedback</span>
            <strong>{loading ? <StatSpinner /> : stats.fiveStar}</strong>
            <small>
              {loading
                ? "Loading..."
                : `${Math.round((stats.fiveStar / (stats.total || 1)) * 100)}% highest satisfaction`}
            </small>
          </div>
          <div className="summary-item">
            <span>Latest Feedback From</span>
            <strong style={{ fontSize: "15px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {loading ? <StatSpinner /> : stats.recentAuthor}
            </strong>
            <small>{loading ? "Loading..." : "Most recent customer review"}</small>
          </div>
        </section>

        {/* Toolbar */}
        <div className="toolbar">
          <div className="toolbar-left">
            <label className="search-box">
              <i className="bi bi-search"></i>
              <input
                aria-label="Search reviews"
                placeholder="Search by reviewer, company, machine, or keywords..."
                type="search"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </label>
          </div>
          <div className="toolbar-right">
            <select
              aria-label="Filter by rating"
              className="filter-control"
              value={ratingFilter}
              onChange={(e) => {
                setRatingFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">All Ratings (1★ - 5★)</option>
              <option value="5">5 Stars ★★★★★</option>
              <option value="4">4 Stars ★★★★</option>
              <option value="3">3 Stars ★★★</option>
              <option value="2">2 Stars ★★</option>
              <option value="1">1 Star ★</option>
            </select>
          </div>
        </div>

        {/* Reviews Data Table */}
        <section className="table-panel">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>CUSTOMER &amp; COMPANY</th>
                  <th>MACHINE SPECIFIED</th>
                  <th>RATING</th>
                  <th>HEADLINE &amp; FEEDBACK</th>
                  <th>SUBMITTED</th>
                  <th style={{ textAlign: "right" }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: "40px" }}>
                      Loading customer reviews from live database...
                    </td>
                  </tr>
                ) : paginatedReviews.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                      No reviews found matching your search.
                    </td>
                  </tr>
                ) : (
                  paginatedReviews.map((rev) => {
                    const initials = getInitials(rev.authorName);
                    const palette = getAvatarPalette(rev.authorName || rev.company || "Customer");
                    const dateFormatted = rev.createdAt
                      ? new Date(rev.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Recently";

                    return (
                      <tr key={rev._id}>
                        {/* Customer & Company with Initials Avatar */}
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div
                              style={{
                                width: "36px",
                                height: "36px",
                                borderRadius: "50%",
                                backgroundColor: palette.bg,
                                color: palette.text,
                                border: `1.5px solid ${palette.border}`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "12px",
                                fontWeight: "700",
                                flexShrink: 0,
                                userSelect: "none",
                              }}
                              title={rev.authorName}
                            >
                              {initials}
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <strong style={{ display: "block", color: "#0f172a", fontSize: "13px" }}>
                                {rev.authorName}
                              </strong>
                              <span style={{ display: "block", color: "#64748b", fontSize: "11px" }}>
                                {rev.authorTitle || "Verified Customer"}
                              </span>
                              <small style={{ color: "#94a3b8", fontSize: "10px" }}>
                                {rev.company}
                                {rev.country ? ` · ${rev.country}` : ""}
                              </small>
                            </div>
                          </div>
                        </td>

                        {/* Machine */}
                        <td>
                          <span
                            style={{
                              display: "inline-block",
                              background: "#f1f5f9",
                              color: "#334155",
                              padding: "3px 8px",
                              borderRadius: "4px",
                              fontSize: "11px",
                              fontWeight: "500",
                            }}
                          >
                            {rev.machinePurchased || "Industrial Machine"}
                          </span>
                        </td>

                        {/* Star Rating */}
                        <td>
                          <div style={{ display: "flex", gap: "2px", color: "#eab308", fontSize: "13px" }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <i
                                key={star}
                                className={`bi ${star <= (Number(rev.rating) || 5) ? "bi-star-fill" : "bi-star"}`}
                              ></i>
                            ))}
                          </div>
                          <small style={{ color: "#64748b", fontSize: "10px" }}>
                            {rev.rating || 5} of 5 Stars
                          </small>
                        </td>

                        {/* Headline & Feedback */}
                        <td style={{ maxWidth: "340px" }}>
                          {rev.headline && (
                            <strong
                              style={{
                                display: "block",
                                color: "#1e293b",
                                fontSize: "12px",
                                marginBottom: "2px",
                              }}
                            >
                              &ldquo;{rev.headline}&rdquo;
                            </strong>
                          )}
                          <p
                            style={{
                              margin: 0,
                              color: "#475569",
                              fontSize: "11px",
                              lineHeight: "1.5",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {rev.comment}
                          </p>
                          {rev.comment && rev.comment.length > 100 && (
                            <button
                              type="button"
                              onClick={() => setSelectedReview(rev)}
                              style={{
                                background: "none",
                                border: "none",
                                color: "#c94f2d",
                                fontSize: "10px",
                                padding: 0,
                                marginTop: "3px",
                                cursor: "pointer",
                                textDecoration: "underline",
                              }}
                            >
                              Read full feedback
                            </button>
                          )}
                        </td>

                        {/* Submitted Date */}
                        <td style={{ whiteSpace: "nowrap", color: "#64748b", fontSize: "11px" }}>
                          <i className="bi bi-calendar3" style={{ marginRight: "4px" }}></i>
                          {dateFormatted}
                        </td>

                        {/* Actions */}
                        <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                          <button
                            type="button"
                            className="table-action-button"
                            title="Delete review"
                            onClick={() => setReviewToDelete(rev)}
                            style={{
                              background: "#fee2e2",
                              border: "1px solid #fecaca",
                              color: "#dc2626",
                              width: "30px",
                              height: "30px",
                              borderRadius: "4px",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              transition: "all 0.15s ease",
                            }}
                          >
                            <i className="bi bi-trash3" style={{ fontSize: "12px" }}></i>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </section>

        {/* Modal: View Full Review Details */}
        {selectedReview && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15, 23, 42, 0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              padding: "20px",
            }}
            onClick={() => setSelectedReview(null)}
          >
            <div
              style={{
                background: "#ffffff",
                maxWidth: "520px",
                width: "100%",
                borderRadius: "8px",
                padding: "24px",
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  borderBottom: "1px solid #e2e8f0",
                  paddingBottom: "14px",
                  marginBottom: "16px",
                }}
              >
                <div>
                  <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "#0f172a" }}>
                    Customer Feedback
                  </h3>
                  <small style={{ color: "#64748b" }}>
                    Submitted by {selectedReview.authorName} ({selectedReview.company})
                  </small>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedReview(null)}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "18px",
                    cursor: "pointer",
                    color: "#94a3b8",
                  }}
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>

              <div style={{ display: "flex", gap: "2px", color: "#eab308", marginBottom: "12px" }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <i
                    key={s}
                    className={`bi ${s <= (Number(selectedReview.rating) || 5) ? "bi-star-fill" : "bi-star"}`}
                  ></i>
                ))}
                <span style={{ color: "#475569", fontSize: "12px", marginLeft: "6px" }}>
                  {selectedReview.rating || 5} Stars
                </span>
              </div>

              {selectedReview.headline && (
                <h4 style={{ margin: "0 0 10px", fontSize: "14px", color: "#1e293b" }}>
                  &ldquo;{selectedReview.headline}&rdquo;
                </h4>
              )}

              <div
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  padding: "14px",
                  color: "#334155",
                  fontSize: "13px",
                  lineHeight: "1.6",
                  marginBottom: "16px",
                  whiteSpace: "pre-line",
                }}
              >
                {selectedReview.comment}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px",
                  fontSize: "11px",
                  color: "#64748b",
                  borderTop: "1px solid #f1f5f9",
                  paddingTop: "12px",
                }}
              >
                <div>
                  <strong>Machine:</strong> {selectedReview.machinePurchased || "Not specified"}
                </div>
                <div>
                  <strong>Location:</strong> {selectedReview.country || "Global"}
                </div>
                <div>
                  <strong>Designation:</strong> {selectedReview.authorTitle || "Customer"}
                </div>
                <div>
                  <strong>Date:</strong>{" "}
                  {selectedReview.createdAt
                    ? new Date(selectedReview.createdAt).toLocaleString("en-US")
                    : "Recent"}
                </div>
              </div>

              <div style={{ marginTop: "18px", textAlign: "right" }}>
                <button
                  type="button"
                  className="button button-outline"
                  onClick={() => setSelectedReview(null)}
                  style={{ minHeight: "32px", fontSize: "11px", padding: "0 14px", cursor: "pointer" }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {reviewToDelete && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15, 23, 42, 0.65)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10000,
              padding: "20px",
            }}
            onClick={() => !deleteSubmitting && setReviewToDelete(null)}
          >
            <div
              style={{
                background: "#ffffff",
                maxWidth: "440px",
                width: "100%",
                borderRadius: "8px",
                padding: "24px",
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: "#fee2e2",
                    color: "#dc2626",
                    display: "grid",
                    placeItems: "center",
                    fontSize: "20px",
                    flexShrink: 0,
                  }}
                >
                  <i className="bi bi-exclamation-triangle-fill"></i>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "600", color: "#0f172a" }}>
                    Delete Customer Review?
                  </h3>
                  <small style={{ color: "#64748b" }}>This action cannot be undone.</small>
                </div>
              </div>

              <p style={{ color: "#475569", fontSize: "12px", lineHeight: "1.6", margin: "0 0 18px" }}>
                Are you sure you want to remove the review submitted by{" "}
                <strong>{reviewToDelete.authorName}</strong> from{" "}
                <strong>{reviewToDelete.company}</strong>?
              </p>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  className="button button-outline"
                  onClick={() => setReviewToDelete(null)}
                  disabled={deleteSubmitting}
                  style={{ minHeight: "34px", fontSize: "11px", padding: "0 14px", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="button"
                  onClick={confirmDelete}
                  disabled={deleteSubmitting}
                  style={{
                    minHeight: "34px",
                    fontSize: "11px",
                    padding: "0 14px",
                    background: "#dc2626",
                    borderColor: "#dc2626",
                    color: "#ffffff",
                    cursor: "pointer",
                  }}
                >
                  {deleteSubmitting ? "Deleting..." : "Yes, Delete Review"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </AdminLayout>
  );
};

export default Reviews;
