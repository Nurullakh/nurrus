import React from "react";
import { Link, useNavigate } from "react-router-dom";

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-black text-[#4b8839] mb-4">404</h1>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Страница не найдена
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            К сожалению, страница, которую вы ищете, не существует или была
            перемещена.
          </p>
        </div>

        <div className="mb-12">
          <svg
            className="w-64 h-64 mx-auto text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 border-2 border-[#4b8839] text-[#4b8839] rounded-lg font-semibold hover:bg-[#4b8839] transition-colors"
          >
            ← Назад
          </button>
          <Link
            to="/"
            className="px-6 py-3 bg-[#4b8839] text-white rounded-lg font-semibold hover:bg-[#4b8839] transition-colors"
          >
            На главную
          </Link>
          <Link
            to="/catalog"
            className="px-6 py-3 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-900 transition-colors"
          >
            Каталог товаров
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;

