import { baseApi } from "@/shared/api/base-api";

export interface Review {
  id: number;
  productId: number;
  userId?: number;
  userName: string;
  userEmail: string;
  rating: number;
  comment: string;
  images: string[];
  isVerified: boolean;
  adminComment?: string;
  createdAt: string;
}

export interface ReviewsStats {
  total: number;
  averageRating: number;
  ratingDistribution: Record<string, number>;
}

export interface ReviewsResponse {
  data: Review[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CreateReviewPayload {
  productId: number;
  userId?: number;
  userName: string;
  userEmail: string;
  rating: number;
  comment: string;
  orderNumber?: string;
}

export const reviewsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getReviews: builder.query<ReviewsResponse, { productId: number; page?: number }>({
      query: ({ productId, page = 1 }) =>
        `/reviews?productId=${productId}&page=${page}&limit=5`,
      providesTags: (_result, _err, { productId }) => [
        { type: "Reviews" as const, id: productId },
      ],
    }),
    getReviewsStats: builder.query<ReviewsStats, number>({
      query: (productId) => `/reviews/stats/${productId}`,
      providesTags: (_result, _err, productId) => [
        { type: "Reviews" as const, id: productId },
      ],
    }),
    createReview: builder.mutation<Review, CreateReviewPayload>({
      query: (body) => ({
        url: "/reviews",
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _err, { productId }) => [
        { type: "Reviews" as const, id: productId },
      ],
    }),
  }),
});

export const {
  useGetReviewsQuery,
  useGetReviewsStatsQuery,
  useCreateReviewMutation,
} = reviewsApi;
