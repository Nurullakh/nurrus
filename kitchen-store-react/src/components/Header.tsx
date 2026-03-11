import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import SearchModal from "./SearchModal";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);

  const cartItems = useSelector((state: RootState) => state.cart.items);
  const favoriteItems = useSelector((state: RootState) => state.favorites.items);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const favoritesCount = favoriteItems.length;

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4 gap-4">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <div className="flex flex-col">
              <span className="text-3xl font-black text-[#4b8839] leading-none">
                NURRUS
              </span>
            </div>
          </Link>

          {/* Catalog Button */}
          <Link
            to="/catalog"
            className="flex items-center gap-2 px-6 py-3 bg-[#4b8839] text-white rounded-full font-medium hover:bg-[#4b8839] transition-colors"
          >
            {/* <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg> */}
            <span>Каталог</span>
          </Link>

          <Link
            to="/kitchen-constructor"
            className="hidden xl:flex items-center gap-2 px-5 py-3 border border-[#4b8839] text-[#4b8839] rounded-full font-medium hover:bg-[#4b8839]/10 transition-colors"
          >
            <span>Конструктор кухни</span>
          </Link>

          {/* Search Bar */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex-1 max-w-xl relative hidden md:block"
          >
            <div className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-full text-left text-gray-500 hover:border-[#4b8839] transition-colors">
              Стул
            </div>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 p-2">
              <svg
                className="w-5 h-5 text-gray-600"
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
          </button>

          {/* Right Side Icons */}
          <div className="flex items-center gap-4">
            {/* Favorites */}
            <Link
              to="/favorites"
              className="flex flex-col items-center gap-1 hover:text-[#4b8839] transition-colors relative group"
            >
              <div className="relative">
                <svg
                  className="w-6 h-6"
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
                {favoritesCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#4b8839] text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {favoritesCount}
                  </span>
                )}
              </div>
              <span className="text-xs hidden lg:block">Избранное</span>
            </Link>

            {/* Login */}
            <button
              onClick={() => navigate("/login")}
              className="flex flex-col items-center gap-1 hover:text-[#4b8839] transition-colors group"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span className="text-xs hidden lg:block">Войти</span>
            </button>

            {/* Cart */}
            <Link
              to="/cart"
              className="flex flex-col items-center gap-1 hover:text-[#4b8839] transition-colors relative group"
            >
              <div className="relative">
                <svg
                  className="w-6 h-6"
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
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#4b8839] text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="text-xs hidden lg:block">Корзина</span>
            </Link>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="pb-4 md:hidden">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-full relative"
          >
            <div className="w-full pl-4 pr-12 py-2 border border-gray-300 rounded-full text-left text-gray-500">
              Стул
            </div>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 p-2">
              <svg
                className="w-5 h-5 text-gray-600"
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
          </button>
        </div>
      </div>


      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  );
};

export default Header;

