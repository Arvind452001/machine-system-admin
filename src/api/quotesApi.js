import axiosInstance, { getAuthToken } from "./axiosInstance";

const rawBaseUrl =
  import.meta.env.VITE_API_BASE_URL || "https://node.aitechnotech.in/machine";
const normalizedBaseUrl = rawBaseUrl.replace(/\/+$/, "");
const BASE_URL = normalizedBaseUrl.endsWith("/api/v1")
  ? normalizedBaseUrl.slice(0, -7)
  : normalizedBaseUrl;

export const quotesApi = {
  // GET /api/v1/quotes (Admin get all quotes with search and status filters)
  getQuotes: (params = {}) => {
    return axiosInstance.get("/api/v1/quotes", { params });
  },

  // POST /api/v1/quotes (Create and issue commercial quotation)
  createQuote: (quoteData) => {
    return axiosInstance.post("/api/v1/quotes", quoteData);
  },

  // GET /api/v1/quotes/{id} (Get single quote details by ID or Quote Number)
  getQuoteById: (id) => {
    return axiosInstance.get(`/api/v1/quotes/${id}`);
  },

  // PUT /api/v1/quotes/{id} (Update quote details, pricing, options, validity, or terms)
  updateQuote: (id, quoteData) => {
    return axiosInstance.put(`/api/v1/quotes/${id}`, quoteData);
  },

  // DELETE /api/v1/quotes/{id} (Delete a quotation - Admin only)
  deleteQuote: (id) => {
    return axiosInstance.delete(`/api/v1/quotes/${id}`);
  },

  // PATCH /api/v1/quotes/{id}/status (Update quotation status)
  updateStatus: (id, { status, rejectionReason, note }) => {
    return axiosInstance.patch(`/api/v1/quotes/${id}/status`, {
      status,
      rejectionReason,
      note,
    });
  },

  // GET /api/v1/quotes/export-csv (Export all quotations to CSV file)
  exportCsv: async () => {
    const token = getAuthToken();
    const res = await fetch(`${BASE_URL}/api/v1/quotes/export-csv`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) {
      throw new Error(`Export failed with status ${res.status}`);
    }
    const blob = await res.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = `quotes-export-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(downloadUrl);
    return true;
  },

  // GET /api/v1/quotes/{id}/pdf (Download or stream generated Quotation PDF)
  downloadPdf: async (id, quoteNumber = "quote") => {
    const token = getAuthToken();
    const res = await fetch(`${BASE_URL}/api/v1/quotes/${id}/pdf`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) {
      throw new Error(`PDF download failed with status ${res.status}`);
    }
    const blob = await res.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = `${quoteNumber}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(downloadUrl);
    return true;
  },
};

export default quotesApi;
