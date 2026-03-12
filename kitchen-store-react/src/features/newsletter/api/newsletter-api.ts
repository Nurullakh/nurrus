import { baseApi } from "@/shared/api/base-api";

export interface SubscribeNewsletterRequest {
  email: string;
  source?: string;
}

export interface SubscribeNewsletterResponse {
  id: number;
  status: "subscribed" | "already_subscribed";
  message: string;
}

export const newsletterApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    subscribeNewsletter: builder.mutation<
      SubscribeNewsletterResponse,
      SubscribeNewsletterRequest
    >({
      query: (payload) => ({
        url: "/newsletter/subscribe",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Newsletter"],
    }),
  }),
});

export const { useSubscribeNewsletterMutation } = newsletterApi;

