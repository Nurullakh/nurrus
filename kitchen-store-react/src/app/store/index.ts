import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "@/shared/api/base-api";
import cartReducer from "@/entities/cart/model/cart-slice";
import favoritesReducer from "@/entities/favorites/model/favorites-slice";

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    cart: cartReducer,
    favorites: favoritesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActionPaths: [
          "meta.arg",
          "payload.timestamp",
          "meta.baseQueryMeta.request",
          "meta.baseQueryMeta.response",
        ],
      },
    }).concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
