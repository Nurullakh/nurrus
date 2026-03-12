import { baseApi } from "@/shared/api/base-api";

export interface CreateContactRequest {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface CreateContactResponse {
  id: number;
  createdAt: string;
  message: string;
}

export const contactsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createContactRequest: builder.mutation<CreateContactResponse, CreateContactRequest>({
      query: (payload) => ({
        url: "/contacts",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Contacts"],
    }),
  }),
});

export const { useCreateContactRequestMutation } = contactsApi;
