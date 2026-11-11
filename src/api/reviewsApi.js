import axiosInstance from "./axiosInstance";

export const reviewsApi = {
  // GET /api/v1/reviews/all (Admin gets all customer reviews)
  getAllReviews: () => {
    return axiosInstance.get("/api/v1/reviews/all");
  },

  // DELETE /api/v1/reviews/{id} (Admin delete an unwanted review)
  deleteReview: (id) => {
    return axiosInstance.delete(`/api/v1/reviews/${id}`);
  },
};

export default reviewsApi;

