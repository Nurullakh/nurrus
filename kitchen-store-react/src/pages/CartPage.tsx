import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { RootState, AppDispatch } from "@/store";
import { removeFromCartAsync, updateQuantityAsync } from "@/store/slices/cartSlice";
import { toggleFavoriteAsync } from "@/store/slices/favoritesSlice";
import { getUploadUrl } from "@/config/api";
import { formatPrice } from "@/utils/price";

const CartPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items } = useSelector((state: RootState) => state.cart);
  const favoriteItems = useSelector((state: RootState) => state.favorites.items);
  const [selectedItems, setSelectedItems] = React.useState<Record<number, boolean>>(
    {},
  );

  const handleQuantityChange = (id: number, newQuantity: number) => {
    if (newQuantity > 0) {
      dispatch(updateQuantityAsync({ id, quantity: newQuantity }));
    }
  };

  const handleRemove = (id: number) => {
    dispatch(removeFromCartAsync(id));
  };

  const isItemSelected = (id: number) => selectedItems[id] ?? true;
  const selectedCartItemIds = items
    .filter((item) => isItemSelected(item.id))
    .map((item) => item.id);
  const selectedItemsCount = items.filter((item) => isItemSelected(item.id)).length;

  const total = items.reduce(
    (sum, item) =>
      isItemSelected(item.id) ? sum + item.price * item.quantity : sum,
    0,
  );
  const discount = 0;
  const finalTotal = total - discount;

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Корзина</h1>
        <div className="text-center py-12">
          <svg
            className="w-24 h-24 mx-auto text-gray-300 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
          <p className="text-xl text-gray-500 mb-4">Ваша корзина пуста</p>
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-[#4b8839] text-white rounded-lg hover:bg-[#4b8839]"
          >
            Перейти к покупкам
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6">
        {items.length} товар в корзине
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left side - Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const imageUrl = item.images?.[0] || item.image;
            const itemTotal = item.price * item.quantity;
            const productId = item.productId || item.id;
            const isFavorite = favoriteItems.some(
              (favoriteItem) => favoriteItem.productId === productId,
            );
            // const itemOldPrice = Math.round(itemTotal * 1.15);

            return (
              <div
                key={item.id}
                className="bg-white rounded-lg border p-4 flex gap-4"
              >
                {/* Checkbox */}
                <div className="flex items-start pt-2">
                  <input
                    type="checkbox"
                    checked={isItemSelected(item.id)}
                    onChange={(e) =>
                      setSelectedItems((prev) => ({
                        ...prev,
                        [item.id]: e.target.checked,
                      }))
                    }
                    className="w-5 h-5 accent-[#4b8839] border-gray-300 rounded focus:ring-[#4b8839]"
                  />
                </div>

                {/* Image */}
                <Link to={`/product/${item.id}`} className="flex-shrink-0">
                  <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
                    {imageUrl ? (
                      <img
                        src={getUploadUrl(imageUrl)}
                        alt={item.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg
                          className="w-8 h-8"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                </Link>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/product/${item.id}`}
                    className="hover:text-[#4b8839] font-medium mb-1 block"
                  >
                    {item.name}
                  </Link>
                  {item.article && (
                    <p className="text-sm text-gray-500 mb-2">
                      Артикул: {item.article}
                    </p>
                  )}
                  {item.available ? (
                    <div className="flex items-center gap-2 text-green-600 text-sm mb-3">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Доступно для доставки</span>
                    </div>
                  ) : (
                    <div className="text-[#4b8839] text-sm mb-3">
                      Нет в наличии
                    </div>
                  )}

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        handleQuantityChange(item.id, item.quantity - 1)
                      }
                      className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50"
                      aria-label="Уменьшить количество"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 12H4"
                        />
                      </svg>
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        handleQuantityChange(item.id, parseInt(e.target.value) || 1)
                      }
                      className="w-16 text-center border border-gray-300 rounded py-1"
                    />
                    <button
                      onClick={() =>
                        handleQuantityChange(item.id, item.quantity + 1)
                      }
                      className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50"
                      aria-label="Увеличить количество"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Price and Actions */}
                <div className="flex flex-col items-end justify-between">
                  <div className="text-right">
                    <div className="text-xl font-bold">
                      {formatPrice(itemTotal)} ₽
                    </div>
                    {/* <div className="text-sm text-gray-400 line-through">
                      {itemOldPrice.toLocaleString("ru-RU")} ₽
                    </div> */}
                    {/* <div className="text-sm text-gray-500 mt-1">
                      {item.price.toLocaleString("ru-RU")} ₽/шт
                    </div> */}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="p-2 hover:bg-gray-100 rounded"
                      aria-label="Удалить из корзины"
                    >
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() =>
                        dispatch(
                          toggleFavoriteAsync({
                            id: productId,
                            name: item.name,
                            price: item.price,
                            image: item.image,
                            images: item.images,
                            article: item.article,
                            available: item.available,
                          }),
                        )
                      }
                      className="p-2 hover:bg-gray-100 rounded"
                      aria-label={
                        isFavorite
                          ? "Удалить из избранного"
                          : "Добавить в избранное"
                      }
                    >
                      <svg
                        className={`w-5 h-5 ${isFavorite ? "text-[#4b8839] fill-current" : "text-gray-400"}`}
                        fill={isFavorite ? "currentColor" : "none"}
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right side - Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border p-6 sticky top-6">
            <h2 className="text-2xl font-bold mb-6">
              Итого{" "}
              <span className="float-right">
                {formatPrice(finalTotal)} ₽
              </span>
            </h2>

            {/* Checkout Button */}
            <Link
              to="/checkout"
              state={{ selectedCartItemIds }}
              aria-disabled={selectedItemsCount === 0}
              className={`block w-full py-4 text-white font-bold rounded-lg mb-4 transition-colors text-center ${selectedItemsCount === 0
                ? "bg-gray-300 pointer-events-none cursor-not-allowed"
                : "bg-[#4b8839] hover:bg-[#4b8839]"
                }`}
            >
              Оформить заказ
            </Link>

            {/* Price Breakdown */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {selectedItemsCount} товар на сумму
                </span>
                <span className="font-medium">
                  {formatPrice(total)} ₽
                </span>
              </div>
              {/* <div className="flex justify-between text-green-600">
                <span>Скидка</span>
                <span className="font-medium">
                  -{discount.toLocaleString("ru-RU")} ₽
                </span>
              </div> */}
              <div className="border-t pt-2 flex justify-between font-bold text-lg">
                <span>Итого</span>
                <span>{formatPrice(finalTotal)} ₽</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;

