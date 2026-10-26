import axiosInstance from "./axiosInstance";

export const machinesApi = {
  // GET /api/v1/machines/categories
  getCategories: () => {
    return axiosInstance.get("/api/v1/machines/categories");
  },

  // GET /api/v1/machines
  getMachines: (params = {}) => {
    return axiosInstance.get("/api/v1/machines", { params });
  },

  // POST /api/v1/machines (Admin only)
  createMachine: (machineData) => {
    console.log('createMachine api called')
    return axiosInstance.post("/api/v1/machines", machineData);
  },

  // GET /api/v1/machines/{idOrSlug}
  getMachine: (idOrSlug) => {
    return axiosInstance.get(`/api/v1/machines/${idOrSlug}`);
  },

  // PUT /api/v1/machines/{idOrSlug} (Admin only)
  updateMachine: (idOrSlug, machineData) => {
    // If machineData is FormData, axios handles Content-Type multipart automatically
    const headers =
      machineData instanceof FormData
        ? { "Content-Type": "multipart/form-data" }
        : undefined;
    return axiosInstance.put(`/api/v1/machines/${idOrSlug}`, machineData, {
      headers,
    });
  },
};

export default machinesApi;
