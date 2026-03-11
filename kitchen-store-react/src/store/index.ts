import { configureStore } from "@reduxjs/toolkit";
import productsReducer from "./slices/productsSlice";
import cartReducer from "./slices/cartSlice";
import favoritesReducer from "./slices/favoritesSlice";
import { baseApi } from "@/store/api/baseApi";

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    products: productsReducer,
    cart: cartReducer,
    favorites: favoritesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActionPaths: ["meta.arg", "payload.timestamp"],
      },
    }).concat(baseApi.middleware),
});

// Типизация RootState и AppDispatch (чтобы TypeScript работал правильно)
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
