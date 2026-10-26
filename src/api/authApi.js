import axiosInstance from "./axiosInstance";

export const authApi = {
  login: (credentials) => {
    return axiosInstance.post("/api/v1/auth/login", credentials);
  },
  getMe: () => {
    return axiosInstance.get("/api/v1/auth/me");
  },
  updateProfile: (profileData) => {
    return axiosInstance.put("/api/v1/auth/update-profile", profileData);
  },
};

export default authApi;
