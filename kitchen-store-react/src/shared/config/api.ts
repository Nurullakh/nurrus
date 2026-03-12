export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const API_ROUTES = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
  },
  products: "/products",
  productCategories: "/products/categories",
  banners: "/banners",
  cart: "/cart",
  favorites: "/favorites",
} as const;

export const getUploadUrl = (fileName?: string | null) =>
  fileName ? `${API_URL}/uploads/${fileName}` : "";
