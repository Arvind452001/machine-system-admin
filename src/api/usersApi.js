import axiosInstance from "./axiosInstance";

export const usersApi = {
  // GET /api/v1/users (Admin list all users with filters)
  getUsers: (params = {}) => {
    return axiosInstance.get("/api/v1/users", { params });
  },

  // POST /api/v1/users (Admin invite / create a new representative or team member)
  inviteUser: (userData) => {
    return axiosInstance.post("/api/v1/users", userData);
  },

  // GET /api/v1/users/representatives (List sales representatives with territory & performance metrics)
  getRepresentatives: () => {
    return axiosInstance.get("/api/v1/users/representatives");
  },

  // PATCH /api/v1/users/{id}/approve (Admin approves a pending sales representative account)
  approveUser: (id) => {
    return axiosInstance.patch(`/api/v1/users/${id}/approve`);
  },

  // PATCH /api/v1/users/{id}/reject (Admin rejects a sales representative application)
  rejectUser: (id, { reason } = {}) => {
    return axiosInstance.patch(`/api/v1/users/${id}/reject`, { reason });
  },
};

export default usersApi;
