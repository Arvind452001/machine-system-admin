import axiosInstance from "./axiosInstance";

export const renderingsApi = {
  // GET /api/v1/renderings
  getRenderings: (params = {}) => {
    return axiosInstance.get("/api/v1/renderings", { params });
  },
};

export default renderingsApi;
