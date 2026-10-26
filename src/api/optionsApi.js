import axiosInstance from "./axiosInstance";

export const optionsApi = {
  // GET /api/v1/options
  getOptions: (params = {}) => {
    return axiosInstance.get("/api/v1/options", { params });
  },

  // POST /api/v1/options (Admin only)
  createOption: (optionData) => {
    return axiosInstance.post("/api/v1/options", optionData);
  },

  // POST /api/v1/options/validate
  validateOptions: ({ machineId, optionCodes }) => {
    return axiosInstance.post("/api/v1/options/validate", {
      machineId,
      optionCodes: Array.isArray(optionCodes) ? optionCodes : [],
    });
  },
};

export default optionsApi;
