import { API_URL } from "@/config/api";

export const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  const headers = {
    ...getAuthHeaders(),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: "Ошибка сервера",
    }));
    throw new Error(error.message || "Ошибка запроса");
  }

  return response.json();
};

export default API_URL;

