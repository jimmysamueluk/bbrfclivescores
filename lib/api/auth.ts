import { apiClient } from "./client";
import { LoginCredentials, AuthResponse } from "@/types";

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      "/auth/login",
      credentials
    );
    return response.data;
  },

  getProfile: async () => {
    const response = await apiClient.get("/auth/profile");
    return response.data;
  },

  logout: () => {
    // Just clear local state, backend is stateless JWT
    return Promise.resolve();
  },
};
