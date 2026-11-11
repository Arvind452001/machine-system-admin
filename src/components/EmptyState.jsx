import { Link } from "react-router-dom";

/**
 * Reusable EmptyState component for consistent "Data is not found" UI across the entire app.
 * Prevents blank pages and technical error dumps while maintaining a professional design.
 */
export const EmptyState = ({
  icon = "bi-inbox",
  title = "Data is not found",
  message = "No records match the requested criteria or the dataset is currently empty.",
  actionText,
  actionLink,
  onAction,
  className = "",
  style = {},
}) => {
  return (
    <div
      className={`empty-state-card text-center p-5 my-4 ${className}`}
      style={{
        background: "var(--card-bg, #ffffff)",
        border: "1px dashed var(--border, #d1d5db)",
        borderRadius: "10px",
        maxWidth: "600px",
        margin: "2rem auto",
        ...style,
      }}
    >
      <div
        className="empty-state-icon mb-3"
        style={{
          width: "56px",
          height: "56px",
          margin: "0 auto",
          borderRadius: "50%",
          background: "rgba(39, 98, 76, 0.08)",
          color: "var(--accent, #27624c)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "24px",
        }}
      >
        <i className={`bi ${icon}`}></i>
      </div>
      <h3
        style={{
          fontSize: "18px",
          fontWeight: "700",
          color: "var(--text-primary, #111827)",
          marginBottom: "8px",
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: "14px",
          color: "var(--text-muted, #6b7280)",
          maxWidth: "420px",
          margin: "0 auto 1.25rem",
          lineHeight: "1.5",
        }}
      >
        {message}
      </p>

      {actionText && actionLink && (
        <Link to={actionLink} className="btn btn-accent btn-sm">
          {actionText}
        </Link>
      )}

      {actionText && !actionLink && onAction && (
        <button type="button" onClick={onAction} className="btn btn-accent btn-sm">
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;

