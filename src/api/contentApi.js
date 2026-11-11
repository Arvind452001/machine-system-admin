import { axiosInstance } from "./axiosInstance";

export const contentApi = {
  // Get all content pages
  getAllContent: async () => {
    const response = await axiosInstance.get("/api/v1/content");
    return response.data;
  },

  // Get content by slug (e.g. 'privacy', 'terms')
  getContentBySlug: async (slug) => {
    const response = await axiosInstance.get(`/api/v1/content/${slug}`);
    return response.data;
  },

  // Update content by slug
  updateContent: async (slug, data) => {
    const response = await axiosInstance.put(`/api/v1/content/${slug}`, data);
    return response.data;
  },
};

export default contentApi;
