import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { API_URL, API_ROUTES } from "@/shared/config/api";

const getUserId = (): string => {
  if (typeof window === "undefined") return "guest";
  try {
    const raw = localStorage.getItem("user");
    if (raw && raw !== "undefined") {
      const user = JSON.parse(raw);
      if (user?.id) return String(user.id);
    }
  } catch {
    // ignore
  }
  return "guest";
};

export interface CartItem {
  id: number;
  productId: number;
  name: string;
  price: number;
  image?: string;
  images?: string[];
  article?: string;
  quantity: number;
  available: boolean;
}

interface CartState {
  items: CartItem[];
  loading: boolean;
  error: string | null;
}

const getAxiosErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || fallback;
  }
  return fallback;
};

const initialState: CartState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}${API_ROUTES.cart}?userId=${getUserId()}`);
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(getAxiosErrorMessage(error, "Ошибка загрузки корзины"));
    }
  }
);

export const addToCartAsync = createAsyncThunk(
  "cart/addToCart",
  async (
    item: Omit<CartItem, "quantity" | "id" | "productId"> & { id: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post(`${API_URL}${API_ROUTES.cart}`, {
        productId: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        images: item.images,
        article: item.article,
        available: item.available,
        quantity: 1,
        userId: getUserId(),
      });
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(getAxiosErrorMessage(error, "Ошибка добавления в корзину"));
    }
  }
);

export const updateQuantityAsync = createAsyncThunk(
  "cart/updateQuantity",
  async (
    { id, quantity }: { id: number; quantity: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.put(
        `${API_URL}${API_ROUTES.cart}/${id}/quantity?userId=${getUserId()}`,
        { quantity }
      );
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(getAxiosErrorMessage(error, "Ошибка обновления количества"));
    }
  }
);

export const removeFromCartAsync = createAsyncThunk(
  "cart/removeFromCart",
  async (id: number, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}${API_ROUTES.cart}/${id}?userId=${getUserId()}`);
      return id;
    } catch (error: unknown) {
      return rejectWithValue(getAxiosErrorMessage(error, "Ошибка удаления из корзины"));
    }
  }
);

export const clearCartAsync = createAsyncThunk(
  "cart/clearCart",
  async (_, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}${API_ROUTES.cart}?userId=${getUserId()}`);
      return true;
    } catch (error: unknown) {
      return rejectWithValue(getAxiosErrorMessage(error, "Ошибка очистки корзины"));
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCartItems: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addToCartAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(addToCartAsync.fulfilled, (state, action) => {
        state.loading = false;
        const existingIndex = state.items.findIndex(
          (item) => item.productId === action.payload.productId
        );
        if (existingIndex >= 0) {
          state.items[existingIndex] = action.payload;
        } else {
          state.items.push(action.payload);
        }
      })
      .addCase(addToCartAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateQuantityAsync.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (item) => item.id === action.payload.id
        );
        if (index >= 0) {
          state.items[index] = action.payload;
        }
      })
      .addCase(removeFromCartAsync.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addCase(clearCartAsync.fulfilled, (state) => {
        state.items = [];
      });
  },
});

export const { setCartItems } = cartSlice.actions;
export default cartSlice.reducer;
