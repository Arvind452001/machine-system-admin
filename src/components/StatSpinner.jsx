import React from "react";

const StatSpinner = ({ size = "20px", color = "var(--accent, #c94f2d)", style = {} }) => (
  <span
    className="stat-spinner"
    role="status"
    aria-label="Loading metric"
    style={{
      width: size,
      height: size,
      borderColor: `${color}33`,
      borderTopColor: color,
      ...style,
    }}
  />
);

export default StatSpinner;

