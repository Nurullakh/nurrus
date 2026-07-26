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

export interface FavoriteItem {
  id: number;
  productId: number;
  name: string;
  price: number;
  image?: string;
  images?: string[];
  article?: string;
  available: boolean;
}

interface FavoritesState {
  items: FavoriteItem[];
  loading: boolean;
  error: string | null;
}

const getAxiosErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || fallback;
  }
  return fallback;
};

const initialState: FavoritesState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchFavorites = createAsyncThunk(
  "favorites/fetchFavorites",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}${API_ROUTES.favorites}?userId=${getUserId()}`);
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(getAxiosErrorMessage(error, "Ошибка загрузки избранного"));
    }
  }
);

export const toggleFavoriteAsync = createAsyncThunk(
  "favorites/toggleFavorite",
  async (
    item: Omit<FavoriteItem, "id" | "productId"> & { id: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post(`${API_URL}${API_ROUTES.favorites}/toggle`, {
        productId: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        images: item.images,
        article: item.article,
        available: item.available,
        userId: getUserId(),
      });
      return { ...response.data, productId: item.id };
    } catch (error: unknown) {
      return rejectWithValue(getAxiosErrorMessage(error, "Ошибка переключения избранного"));
    }
  }
);

export const removeFromFavoritesAsync = createAsyncThunk(
  "favorites/removeFromFavorites",
  async (productId: number, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}${API_ROUTES.favorites}/${productId}?userId=${getUserId()}`);
      return productId;
    } catch (error: unknown) {
      return rejectWithValue(getAxiosErrorMessage(error, "Ошибка удаления из избранного"));
    }
  }
);

export const clearFavoritesAsync = createAsyncThunk(
  "favorites/clearFavorites",
  async (_, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}${API_ROUTES.favorites}?userId=${getUserId()}`);
      return true;
    } catch (error: unknown) {
      return rejectWithValue(getAxiosErrorMessage(error, "Ошибка очистки избранного"));
    }
  }
);

const favoritesSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {
    setFavoriteItems: (state, action: PayloadAction<FavoriteItem[]>) => {
      state.items = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFavorites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(toggleFavoriteAsync.fulfilled, (state, action) => {
        const productId = action.payload.productId;

        if (action.payload.added && action.payload.item) {
          const exists = state.items.find((item) => item.productId === productId);
          if (!exists) {
            state.items.push(action.payload.item);
          }
        } else {
          state.items = state.items.filter(
            (item) => item.productId !== productId
          );
        }
      })
      .addCase(removeFromFavoritesAsync.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (item) => item.productId !== action.payload
        );
      })
      .addCase(clearFavoritesAsync.fulfilled, (state) => {
        state.items = [];
      });
  },
});

export const { setFavoriteItems } = favoritesSlice.actions;
export default favoritesSlice.reducer;
