import { baseApi } from "@/store/api/baseApi";

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipping"
  | "completed"
  | "cancelled";

export interface OrderItemDto {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface OrderTrackingDto {
  status: string;
  date: string;
  location?: string;
  comment?: string;
}

export interface OrderDto {
  id: number;
  orderNumber: string;
  userId: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  city: string;
  postalCode: string;
  comment?: string;
  items: OrderItemDto[];
  subtotal: number;
  deliveryPrice: number;
  total: number;
  deliveryMethod: string;
  paymentMethod: string;
  status: OrderStatus;
  paymentStatus: string;
  trackingNumber?: string;
  trackingHistory?: OrderTrackingDto[];
  estimatedDeliveryDate?: string;
  courierName?: string;
  courierPhone?: string;
  createdAt: string;
  updatedAt: string;
}

export const ordersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrders: builder.query<OrderDto[], string | void>({
      query: (userId) => {
        if (!userId) {
          return "/orders";
        }
        return `/orders?userId=${encodeURIComponent(userId)}`;
      },
      providesTags: ["Orders"],
    }),
    getOrderById: builder.query<OrderDto, number>({
      query: (id) => `/orders/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Orders", id }],
    }),
    updateOrderStatus: builder.mutation<OrderDto, { id: number; status: OrderStatus }>({
      query: ({ id, status }) => ({
        url: `/orders/${id}/status`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: (_result, _error, { id }) => ["Orders", { type: "Orders", id }],
    }),
  }),
});

export const { useGetOrdersQuery, useGetOrderByIdQuery, useUpdateOrderStatusMutation } = ordersApi;
