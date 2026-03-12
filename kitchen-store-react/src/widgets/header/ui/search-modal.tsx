"use client";

import React, { useState, useEffect, useRef } from "react";
import { Link } from "@/next/routerShim";
import axios from "axios";
import { API_URL, API_ROUTES, getUploadUrl } from "@/shared/config/api";
import { formatPrice } from "@/shared/lib/price/format-price";

interface SearchProduct {
  id: number;
  name: string;
  price: number;
  images?: string[];
  category?: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SearchProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const searchProducts = async () => {
      if (searchQuery.trim().length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const response = await axios.get(
          `${API_URL}${API_ROUTES.products}/search?q=${encodeURIComponent(searchQuery)}&limit=10`
        );
        setResults(response.data);
      } catch (error) {
        console.error("Ошибка поиска:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleClose = () => {
    setSearchQuery("");
    setResults([]);
    setSelectedCategory(null);
    onClose();
  };

  const categories = Array.from(
    new Set(results.map((p) => p.category).filter(Boolean))
  );

  const filteredResults = selectedCategory
    ? results.filter((p) => p.category === selectedCategory)
    : results;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-lg w-full max-w-3xl max-h-[80vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Стул, диван, кухня..."
                className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b8839] focus:border-transparent text-lg"
              />
              <svg
                className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Закрыть"
            >
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {categories.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Категории
              </h3>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === null
                    ? "bg-[#4b8839] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  Все
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category || null)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === category
                      ? "bg-[#4b8839] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="overflow-y-auto max-h-[calc(80vh-200px)]">
          {loading && (
            <div className="p-8 text-center text-gray-500">
              Поиск товаров...
            </div>
          )}

          {!loading && searchQuery.trim().length === 0 && (
            <div className="p-8 text-center text-gray-500">
              Начните вводить название товара
            </div>
          )}

          {!loading &&
            searchQuery.trim().length > 0 &&
            filteredResults.length === 0 && (
              <div className="p-8 text-center">
                <p className="text-gray-500 mb-2">По запросу найдено</p>
                <p className="text-lg font-medium text-gray-700">
                  {results.length > 0
                    ? "Попробуйте выбрать другую категорию"
                    : "Ничего не найдено"}
                </p>
              </div>
            )}

          {!loading && filteredResults.length > 0 && (
            <div className="p-4 space-y-2">
              {filteredResults.map((product) => (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  onClick={handleClose}
                  className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={getUploadUrl(product.images[0])}
                        alt={product.name}
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

                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">
                      {product.name}
                    </h4>
                    {product.category && (
                      <p className="text-sm text-gray-500 mt-1">
                        {product.category}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900">
                        {formatPrice(product.price)} ₽
                      </p>
                    </div>
                    <button className="p-2 bg-[#4b8839] text-white rounded-lg hover:bg-[#4b8839] transition-colors">
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
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!loading && filteredResults.length > 0 && (
            <div className="p-4 border-t">
              <button
                onClick={handleClose}
                className="w-full py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                Смотреть все результаты
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;

