"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "@/next/routerShim";
import { addToCartAsync, removeFromCartAsync } from "@/entities/cart/model/cart-slice";
import { toggleFavoriteAsync } from "@/entities/favorites/model/favorites-slice";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { useGetProductByIdQuery } from "@/entities/product/api/products-api";
import { getUploadUrl } from "@/shared/config/api";
import { formatPrice } from "@/shared/lib/price/format-price";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import { ReviewsSection } from "@/features/reviews/ui/reviews-section";

const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const [selectedImage, setSelectedImage] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);

  const [lightboxOpen, setLightboxOpen] = useState(false);

  const favorites = useAppSelector((state) => state.favorites.items);
  const cartItems = useAppSelector((state) => state.cart.items);
  const productId = Number(id);
  const {
    data: product,
    isLoading: loading,
    isError,
  } = useGetProductByIdQuery(productId, { skip: Number.isNaN(productId) });

  const isFavorite = product ? favorites.some((item) => item.productId === product.id) : false;
  const isInCart = product ? cartItems.some((item) => item.productId === product.id) : false;

  const handleAddToCart = () => {
    if (product) {
      if (isInCart) {
        const cartItem = cartItems.find((item) => item.productId === product.id);
        if (cartItem) {
          dispatch(removeFromCartAsync(cartItem.id));
        }
        return;
      }

      dispatch(
        addToCartAsync({
          id: product.id!,
          name: product.name,
          price: product.price,
          images: product.images,
          article: product.id?.toString(),
          available: product.is_available ?? true,
        })
      );
    }
  };

  const handleToggleFavorite = () => {
    if (product) {
      dispatch(
        toggleFavoriteAsync({
          id: product.id!,
          name: product.name,
          price: product.price,
          images: product.images,
          article: product.id?.toString(),
          available: product.is_available ?? true,
        })
      );
    }
  };

  // Слайдер функции
  const handlePrevImage = useCallback(() => {
    if (!product?.images) return;
    const imagesCount = product.images.length;
    setSelectedImage((prev) => (prev === 0 ? imagesCount - 1 : prev - 1));
  }, [product]);

  const handleNextImage = useCallback(() => {
    if (!product?.images) return;
    const imagesCount = product.images.length;
    setSelectedImage((prev) => (prev === imagesCount - 1 ? 0 : prev + 1));
  }, [product]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (lightboxOpen) return;

    if (e.key === "ArrowLeft") {
      handlePrevImage();
    } else if (e.key === "ArrowRight") {
      handleNextImage();
    }
  }, [lightboxOpen, handlePrevImage, handleNextImage]);

  // Автопрокрутка слайдера
  useEffect(() => {
    if (!isAutoPlaying || lightboxOpen || !product?.images || product.images.length <= 1) return;

    const interval = setInterval(() => {
      handleNextImage();
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, lightboxOpen, handleNextImage, product]);

  // Клавиатурная навигация
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Обработчики свайпа/драга мышкой
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX);
    setDragOffset(0);
    setIsAutoPlaying(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const currentX = e.pageX;
    const diff = currentX - startX;
    setDragOffset(diff);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;

    const threshold = 50; // Минимальное расстояние для переключения

    if (dragOffset > threshold) {
      handlePrevImage();
    } else if (dragOffset < -threshold) {
      handleNextImage();
    }

    setIsDragging(false);
    setDragOffset(0);
    setStartX(0);
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      setDragOffset(0);
      setStartX(0);
    }
    setIsAutoPlaying(true);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center">Загрузка...</p>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-[#4b8839]">Товар не найден</p>
      </div>
    );
  }

  const images = product.images && product.images.length > 0
    ? product.images.map((img) => getUploadUrl(img))
    : ["https://via.placeholder.com/600x400"];

  const oldPrice = product.price ? Math.round(product.price * 1.43) : 0;

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6">
        <Link to="/" className="hover:text-gray-900">Главная</Link>
        <span>&gt;</span>
        <Link to="/catalog" className="hover:text-gray-900">Каталог</Link>
        <span>&gt;</span>
        <span className="text-gray-900 font-medium">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left side - Images */}
        <div className="space-y-4">

          {/* Image Slider */}
          <div
            className="relative bg-gray-50 rounded-lg overflow-hidden aspect-[4/3] group select-none"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={handleMouseLeave}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            style={{ cursor: isDragging ? 'grabbing' : 'zoom-in' }}
          >
            {/* Main Image with Transition and Drag Effect */}
            <div
              className="relative w-full h-full"
              style={{
                transform: isDragging ? `translateX(${dragOffset}px)` : 'translateX(0)',
                transition: isDragging ? 'none' : 'transform 0.3s ease-out',
              }}
              onClick={() => { if (!isDragging) setLightboxOpen(true); }}
            >
              {images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`${product.name} ${index + 1}`}
                  className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-500 ${index === selectedImage ? "opacity-100" : "opacity-0"
                    }`}
                  draggable={false}
                />
              ))}
            </div>

            {/* Previous Button */}
            {images.length > 1 && (
              <button
                onClick={handlePrevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
                aria-label="Предыдущее изображение"
                tabIndex={0}
              >
                <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {/* Next Button */}
            {images.length > 1 && (
              <button
                onClick={handleNextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
                aria-label="Следующее изображение"
                tabIndex={0}
              >
                <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}

            {/* Dots Indicator */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${index === selectedImage
                      ? "bg-white w-6"
                      : "bg-white/50 hover:bg-white/75"
                      }`}
                    aria-label={`Перейти к изображению ${index + 1}`}
                    tabIndex={0}
                  />
                ))}
              </div>
            )}

            {/* Image Counter */}
            {images.length > 1 && (
              <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 text-white text-sm rounded-full backdrop-blur-sm">
                {selectedImage + 1} / {images.length}
              </div>
            )}

            {/* Favorite Button */}
            <button
              onClick={handleToggleFavorite}
              className="absolute top-4 right-4 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 transition-colors z-10"
              aria-label={isFavorite ? "Удалить из избранного" : "Добавить в избранное"}
              tabIndex={0}
            >
              <svg
                className={`w-6 h-6 transition-colors ${isFavorite ? "text-[#4b8839] fill-current" : "text-gray-400"}`}
                fill={isFavorite ? "currentColor" : "none"}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>

            {/* Auto-play Indicator */}
            {images.length > 1 && (
              <button
                onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                className="absolute bottom-4 right-4 w-8 h-8 bg-black/60 hover:bg-black/75 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-colors z-10"
                aria-label={isAutoPlaying ? "Остановить автопрокрутку" : "Запустить автопрокрутку"}
                tabIndex={0}
              >
                {isAutoPlaying ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            )}
          </div>

          {/* Thumbnails */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {images.map((img, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${selectedImage === index ? "border-blue-500" : "border-gray-200"
                  } hover:border-blue-300`}
              >
                <img src={img} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Right side - Product Info */}
        <div className="space-y-6">
          {/* Title and Article */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <p className="text-gray-500">#{product.id}</p>
          </div>

          {/* Rating */}
          {/* <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-5 h-5 ${i < Math.floor(product.rating || 4) ? "text-orange-400" : "text-gray-300"}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-gray-600">{product.reviews_count || 389} отзывов</span>
          </div> */}

          {/* Price and Discount */}
          <div className="space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-gray-900">
                {formatPrice(product.price)} ₽
              </span>
              <span className="text-xl text-gray-400 line-through">
                {formatPrice(oldPrice)} ₽
              </span>
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className={`w-full py-4 font-bold rounded-lg flex items-center justify-center gap-2 transition-colors border-2 border-[#4b8839] ${isInCart
              ? "bg-white text-[#4b8839]"
              : "bg-[#4b8839] hover:bg-[#4b8839] text-white"
              }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {isInCart ? "В корзине" : "Добавить в корзину"}
          </button>

          {/* Availability */}
          <div className="flex items-center gap-2 text-green-600">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Доступно для доставки</span>
          </div>
        </div>
      </div>

      {/* Description Section */}
      <div className="mt-12 border-t pt-8">
        <h2 className="text-2xl font-bold mb-4">Описание</h2>
        <p className="text-gray-700 leading-relaxed">{product.description}</p>

        {product.specifications && Object.keys(product.specifications).length > 0 && (
          <div className="mt-6">
            <h3 className="text-xl font-bold mb-3">Характеристики</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(product.specifications).map(([key, value]) => (
                <div key={key} className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">{key}:</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <ReviewsSection productId={product.id} />

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={selectedImage}
        slides={images.map((src) => ({ src }))}
        plugins={[Zoom]}
        zoom={{ maxZoomPixelRatio: 3, scrollToZoom: true }}
        on={{ view: ({ index }) => setSelectedImage(index) }}
      />
    </div>
  );
};

export default ProductPage;

