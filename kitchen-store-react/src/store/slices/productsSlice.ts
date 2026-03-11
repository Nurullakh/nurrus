import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { API_URL, API_ROUTES } from "@/config/api";

// Интерфейс для продукта
interface Product {
  id: number;
  name: string;
  price: string;
  image?: string;
  images?: string[];
}

// Интерфейс состояния товаров
interface ProductsState {
  items: Product[];
  loading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
}

const initialState: ProductsState = {
  items: [],
  loading: false,
  error: null,
  page: 1,
  totalPages: 1,
};

// Асинхронный thunk для загрузки товаров по страницам
export const fetchProducts = createAsyncThunk<
  { data: Product[]; totalPages: number },
  number
>("products/fetchProducts", async (page) => {
  const response = await fetch(
    `${API_URL}${API_ROUTES.products}?page=${page}&limit=40`
  );
  if (!response.ok) throw new Error("Ошибка загрузки товаров");

  return await response.json();
});

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Ошибка";
      });
  },
});

export const { setPage } = productsSlice.actions;
export default productsSlice.reducer;
