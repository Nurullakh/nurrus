import { Link } from "react-router-dom";
import { toggleFavoriteAsync } from "@/store/slices/favoritesSlice";
import { addToCartAsync, removeFromCartAsync } from "@/store/slices/cartSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getUploadUrl } from "@/config/api";
import { formatPrice } from "@/utils/price";

interface ProductCardProps {
  id: number;
  image?: string;
  images?: string[];
  name: string;
  price: string | number;
  available?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  image,
  images,
  name,
  price,
  available = true,
}) => {
  const dispatch = useAppDispatch();
  const favorites = useAppSelector((state) => state.favorites.items);
  const cartItems = useAppSelector((state) => state.cart.items);

  const isFavorite = favorites.some((item) => item.productId === id);
  const isInCart = cartItems.some((item) => item.productId === id);

  // Используем первое изображение из массива или image prop, если он есть
  const imageToShow = images?.length ? images[0] : image;

  // Определяем есть ли миниатюры для показа
  // const thumbnails = images && images.length > 1 ? images.slice(0, 2) : [];

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(
      toggleFavoriteAsync({
        id,
        name,
        price: typeof price === "string" ? parseFloat(price) : price,
        images,
        image,
        article: id.toString(),
        available,
      })
    );
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInCart) {
      const cartItem = cartItems.find((item) => item.productId === id);
      if (cartItem) {
        dispatch(removeFromCartAsync(cartItem.id));
      }
    } else {
      dispatch(
        addToCartAsync({
          id,
          name,
          price: typeof price === "string" ? parseFloat(price) : price,
          images,
          image,
          article: id.toString(),
          available,
        })
      );
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg bg-white hover:shadow-lg transition-shadow relative group">
      <Link to={`/product/${id}`} className="block">
        {/* Favorite Button */}
        <button
          onClick={handleToggleFavorite}
          className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md z-10 transition-all"
          aria-label={isFavorite ? "Удалить из избранного" : "Добавить в избранное"}
        >
          <svg
            className={`w-5 h-5 ${isFavorite ? "text-[#4b8839] fill-current" : "text-gray-400"}`}
            fill={isFavorite ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>

        {/* Main Image */}
        <div className="relative w-full bg-gray-50 rounded-t-lg overflow-hidden aspect-[4/3]">
          {imageToShow ? (
            <img
              src={getUploadUrl(imageToShow)}
              alt={name}
              className="w-full h-full object-contain p-4"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <svg
                className="w-16 h-16"
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

        {/* Thumbnails */}
        {/* {thumbnails.length > 0 && (
          <div className="flex gap-2 px-4 py-2 border-t border-gray-100">
            {thumbnails.map((thumb, index) => (
              <div
                key={index}
                className="w-12 h-12 bg-gray-50 rounded border border-gray-200 overflow-hidden flex-shrink-0"
              >
                <img
                  src={getUploadUrl(thumb)}
                  alt={`${name} ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )} */}
      </Link>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Price */}
        <div className="text-2xl font-bold text-gray-900">
          {formatPrice(price)} ₽
        </div>

        {/* Product Name */}
        <Link to={`/product/${id}`}>
          <h3 className="text-sm text-gray-700 line-clamp-2 hover:text-[#4b8839] transition-colors">
            {name}
          </h3>
        </Link>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          className={`w-full py-2.5 px-4 border-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${isInCart
            ? "bg-white border-[#4b8839] text-[#4b8839]"
            : "bg-[#4b8839] border-[#4b8839] text-white hover:bg-[#4b8839]"
            }`}
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
          {isInCart ? "В корзине" : "В корзину"}
        </button>

        {/* Availability */}
        {available ? (
          <div className="flex items-center gap-1 text-xs text-green-600">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>Доступно для доставки</span>
          </div>
        ) : (
          <div className="text-xs text-gray-400">Нет в наличии</div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
