import axiosInstance from "./axiosInstance";

export const categoriesApi = {
  // GET /api/v1/categories
  getCategories: (params = {}) => {
    return axiosInstance.get("/api/v1/categories", { params });
  },

  // GET /api/v1/categories/{id}
  getCategory: (id) => {
    return axiosInstance.get(`/api/v1/categories/${id}`);
  },

  // POST /api/v1/categories (Admin only)
  createCategory: (categoryData) => {
    return axiosInstance.post("/api/v1/categories", categoryData);
  },

  // PUT /api/v1/categories/{id} (Admin only)
  updateCategory: (id, categoryData) => {
    return axiosInstance.put(`/api/v1/categories/${id}`, categoryData);
  },

  // DELETE /api/v1/categories/{id} (Admin only)
  deleteCategory: (id) => {
    return axiosInstance.delete(`/api/v1/categories/${id}`);
  },
};

export default categoriesApi;
