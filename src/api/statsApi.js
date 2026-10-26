import axiosInstance from "./axiosInstance";

export const statsApi = {
  // GET /api/v1/stats/admin
  getAdminStats: () => {
    return axiosInstance.get("/api/v1/stats/admin");
  },
};

export default statsApi;
