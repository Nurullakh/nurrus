"use client";

import React from "react";
import { Provider } from "react-redux";
import { store } from "./index";
import { fetchCart } from "@/entities/cart/model/cart-slice";
import { fetchFavorites } from "@/entities/favorites/model/favorites-slice";

function AppBootstrap() {
  React.useEffect(() => {
    void store.dispatch(fetchCart());
    void store.dispatch(fetchFavorites());
  }, []);

  return null;
}

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AppBootstrap />
      {children}
    </Provider>
  );
}
