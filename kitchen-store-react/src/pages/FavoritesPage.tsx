import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { RootState, AppDispatch } from "@/store";
import { removeFromFavoritesAsync } from "@/store/slices/favoritesSlice";
import { addToCartAsync } from "@/store/slices/cartSlice";
import { getUploadUrl } from "@/config/api";
import { formatPrice } from "@/utils/price";

const FavoritesPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items } = useSelector((state: RootState) => state.favorites);

  const handleRemove = (productId: number) => {
    dispatch(removeFromFavoritesAsync(productId));
  };

  const handleAddToCart = (item: typeof items[0]) => {
    dispatch(
      addToCartAsync({
        id: item.productId,
        name: item.name,
        price: item.price,
        image: item.image,
        images: item.images,
        article: item.article,
        available: item.available,
      })
    );
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Избранное</h1>
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
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <p className="text-xl text-gray-500 mb-4">В избранном пока ничего нет</p>
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
      <h1 className="text-3xl font-bold mb-6">Избранное</h1>
      <p className="text-gray-600 mb-6">{items.length} товаров</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {items.map((item) => {
          const imageUrl = item.images?.[0] || item.image;

          return (
            <div
              key={item.id}
              className="bg-white rounded-lg border p-4 hover:shadow-md transition relative"
            >
              {/* Remove Button */}
              <button
                onClick={() => handleRemove(item.productId)}
                className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 z-10"
                aria-label="Удалить из избранного"
              >
                <svg
                  className="w-5 h-5 text-[#4b8839]"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>

              {/* Image */}
              <Link to={`/product/${item.id}`}>
                <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden mb-4">
                  {imageUrl ? (
                    <img
                      src={getUploadUrl(imageUrl)}
                      alt={item.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg
                        className="w-12 h-12"
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
              <div className="space-y-2">
                <Link
                  to={`/product/${item.id}`}
                  className="text-sm font-medium text-gray-800 hover:text-blue-600 line-clamp-2 block"
                >
                  {item.name}
                </Link>

                {item.article && (
                  <p className="text-xs text-gray-500">
                    Артикул: {item.article}
                  </p>
                )}

                {item.available ? (
                  <div className="flex items-center gap-1 text-green-600 text-xs">
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>В наличии</span>
                  </div>
                ) : (
                  <div className="text-[#4b8839] text-xs">Нет в наличии</div>
                )}

                {/* Price */}
                <div className="pt-2">
                  <div className="text-xl font-bold">
                    {formatPrice(item.price)} ₽
                  </div>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={() => handleAddToCart(item)}
                  className="w-full py-2 bg-[#4b8839] hover:bg-[#4b8839] text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  В корзину
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FavoritesPage;

