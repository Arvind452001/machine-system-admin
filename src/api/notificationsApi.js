import axiosInstance from "./axiosInstance";

export const notificationsApi = {
  // GET /api/v1/notifications (Fetch all admin notifications)
  getNotifications: (params = {}) => {
    return axiosInstance.get("/api/v1/notifications", { params });
  },

  // PATCH /api/v1/notifications/:id/read
  markAsRead: (id) => {
    return axiosInstance.patch(`/api/v1/notifications/${id}/read`);
  },

  // PATCH /api/v1/notifications/mark-all-read
  markAllAsRead: () => {
    return axiosInstance.patch("/api/v1/notifications/mark-all-read");
  },
};

export default notificationsApi;

