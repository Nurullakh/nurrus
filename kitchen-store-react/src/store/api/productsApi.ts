import { baseApi } from "@/store/api/baseApi";

export interface ProductsResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface BannerDto {
  id: number;
  title: string;
  subtitle?: string;
  imageUrl: string;
  link?: string;
}

export interface ProductDto {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  brand: string;
  specifications: Record<string, string>;
  images?: string[];
  image?: string;
  rating?: number;
  reviews_count?: number;
  is_available?: boolean;
}

export const productsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<ProductsResponse<ProductDto>, { page: number; limit?: number }>({
      query: ({ page, limit = 40 }) => `/products?page=${page}&limit=${limit}`,
      providesTags: ["Products"],
    }),
    getProductsByCategory: builder.query<
      ProductsResponse<ProductDto>,
      { category: string; page: number; limit?: number }
    >({
      query: ({ category, page, limit = 40 }) =>
        `/products/category/${encodeURIComponent(category)}?page=${page}&limit=${limit}`,
      providesTags: ["Products"],
    }),
    getProductById: builder.query<ProductDto, number>({
      query: (id) => `/products/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Product", id }],
    }),
    getProductCategories: builder.query<string[], void>({
      query: () => "/products/categories",
      providesTags: ["Categories"],
    }),
    getMainBanners: builder.query<BannerDto[], "mobile" | "desktop">({
      query: (device) => `/banners?position=main&device=${device}`,
      providesTags: ["Banners"],
    }),
    createProduct: builder.mutation<ProductDto, FormData>({
      query: (body) => ({
        url: "/products",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Products"],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductsByCategoryQuery,
  useGetProductByIdQuery,
  useGetProductCategoriesQuery,
  useGetMainBannersQuery,
  useCreateProductMutation,
} = productsApi;
