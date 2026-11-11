import axiosInstance from "./axiosInstance";

export const enquiriesApi = {
  // GET /api/v1/enquiries (Admin & Operations list all customer enquiries with search & filters)
  getEnquiries: (params = {}) => {
    return axiosInstance.get("/api/v1/enquiries", { params });
  },

  // GET /api/v1/enquiries/{id}
  getEnquiryById: (id) => {
    return axiosInstance.get(`/api/v1/enquiries/${id}`);
  },

  // PATCH /api/v1/enquiries/{id}/assign (Admin assign enquiry to a representative)
  assignEnquiry: (id, { repId, representativeId, adminNotes } = {}) => {
    const finalRepId = repId || representativeId;
    const payload = {
      repId: finalRepId,
    };
    if (adminNotes !== undefined) {
      payload.adminNotes = adminNotes;
    }
    return axiosInstance.patch(`/api/v1/enquiries/${id}/assign`, payload);
  },

  // PATCH /api/v1/enquiries/{id}/status (Update enquiry workflow status)
  updateStatus: (id, { status, note }) => {
    return axiosInstance.patch(`/api/v1/enquiries/${id}/status`, {
      status,
      note,
    });
  },
};

export default enquiriesApi;
