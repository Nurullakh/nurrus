"use client";

import React, { useState } from "react";
import {
  useGetReviewsQuery,
  useGetReviewsStatsQuery,
  useCreateReviewMutation,
} from "../api/reviews-api";

interface Props {
  productId: number;
}

const Stars = ({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) => {
  const sizeClass = size === "lg" ? "w-6 h-6" : "w-4 h-4";
  return (
    <div className="flex gap-0.5 text-[#f59e0b]">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg key={star} className={sizeClass} viewBox="0 0 20 20" fill="currentColor">
          <path
            fill={rating >= star ? "#f59e0b" : rating >= star - 0.5 ? "#f59e0b" : "#D1D5DB"}
            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
          />
        </svg>
      ))}
    </div>
  );
};

const InteractiveStars = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-110"
        >
          <svg className="w-8 h-8" viewBox="0 0 20 20" fill="currentColor">
            <path
              fill={(hovered || value) >= star ? "#f59e0b" : "#D1D5DB"}
              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
            />
          </svg>
        </button>
      ))}
    </div>
  );
};

export const ReviewsSection: React.FC<Props> = ({ productId }) => {
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    rating: 0,
    comment: "",
    orderNumber: "",
  });
  const [formError, setFormError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const { data: stats } = useGetReviewsStatsQuery(productId);
  const { data: reviewsData, isFetching } = useGetReviewsQuery({ productId, page });
  const [createReview, { isLoading: isSubmitting }] = useCreateReviewMutation();

  const reviews = reviewsData?.data ?? [];
  const totalPages = reviewsData?.totalPages ?? 1;

  const getUserFromStorage = () => {
    try {
      const raw = localStorage.getItem("user");
      if (raw && raw !== "undefined") return JSON.parse(raw);
    } catch { /* ignore */ }
    return null;
  };

  const isLoggedIn = !!getUserFromStorage();

  const handleOpenForm = () => {
    setShowForm(true);
    setSubmitted(false);
    setFormError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (formData.rating === 0) {
      setFormError("Пожалуйста, выберите оценку");
      return;
    }
    if (!formData.comment.trim() || formData.comment.trim().length < 10) {
      setFormError("Напишите отзыв (минимум 10 символов)");
      return;
    }
    try {
      const user = getUserFromStorage();
      if (!user?.id || !user?.name || !user?.email) {
        setFormError("Не удалось получить данные профиля. Войдите заново.");
        return;
      }

      await createReview({
        productId,
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        rating: formData.rating,
        comment: formData.comment.trim(),
        orderNumber: formData.orderNumber || undefined,
      }).unwrap();
      setSubmitted(true);
      setShowForm(false);
      setFormData({ rating: 0, comment: "", orderNumber: "" });
    } catch {
      setFormError("Ошибка при отправке отзыва. Попробуйте снова.");
    }
  };

  return (
    <div className="mt-12 border-t pt-8">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <h2 className="text-2xl font-bold">
          Отзывы {stats && stats.total > 0 && <span className="text-gray-400 font-normal text-xl">({stats.total})</span>}
        </h2>
        {!showForm && (
          isLoggedIn ? (
            <button
              onClick={handleOpenForm}
              className="px-5 py-2.5 bg-[#4b8839] text-white rounded-lg hover:bg-[#3a6b2b] transition-colors font-medium"
            >
              Написать отзыв
            </button>
          ) : (
            <a
              href="/login"
              className="px-5 py-2.5 bg-white border border-[#4b8839] text-[#4b8839] rounded-lg hover:bg-[#4b8839] hover:text-white transition-colors font-medium"
            >
              Войдите, чтобы оставить отзыв
            </a>
          )
        )}
      </div>

      {submitted && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          Спасибо за отзыв! Он появится после проверки модератором.
        </div>
      )}

      {/* Rating Summary */}
      {stats && stats.total > 0 && (
        <div className="flex flex-col sm:flex-row gap-6 mb-8 p-5 bg-gray-50 rounded-xl">
          <div className="flex flex-col items-center justify-center min-w-[100px]">
            <div className="text-5xl font-bold text-gray-900">{stats.averageRating}</div>
            <Stars rating={stats.averageRating} size="lg" />
            <div className="text-sm text-gray-500 mt-1">{stats.total} отзывов</div>
          </div>
          <div className="flex-1 space-y-1.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = stats.ratingDistribution[star] ?? 0;
              const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 w-4">{star}</span>
                  <svg className="w-3.5 h-3.5 text-[#f59e0b]" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-2 bg-[#f59e0b] rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Review Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 p-5 border border-gray-200 rounded-xl bg-white space-y-4">
          <h3 className="text-lg font-semibold">Ваш отзыв</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Оценка *</label>
            <InteractiveStars value={formData.rating} onChange={(v) => setFormData((p) => ({ ...p, rating: v }))} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Отзыв *</label>
            <textarea
              required
              rows={4}
              value={formData.comment}
              onChange={(e) => setFormData((p) => ({ ...p, comment: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4b8839] resize-none"
              placeholder="Поделитесь своими впечатлениями о товаре..."
            />
            <div className="text-xs text-gray-400 mt-1">{formData.comment.length}/1000</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Номер заказа <span className="text-gray-400 font-normal">(необязательно, для подтверждения покупки)</span></label>
            <input
              type="text"
              value={formData.orderNumber}
              onChange={(e) => setFormData((p) => ({ ...p, orderNumber: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4b8839]"
              placeholder="#1234567890"
            />
          </div>

          {formError && <p className="text-red-500 text-sm">{formError}</p>}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-[#4b8839] text-white rounded-lg hover:bg-[#3a6b2b] transition-colors font-medium disabled:opacity-60"
            >
              {isSubmitting ? "Отправка..." : "Отправить отзыв"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Отмена
            </button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      {isFetching && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4b8839]" />
        </div>
      )}

      {!isFetching && reviews.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="font-medium">Отзывов пока нет</p>
          <p className="text-sm mt-1">Будьте первым, кто оставит отзыв</p>
        </div>
      )}

      <div className="space-y-5">
        {reviews.map((review) => (
          <div key={review.id} className="border border-gray-100 rounded-xl p-5 bg-white">
            <div className="flex items-start justify-between flex-wrap gap-2 mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">{review.userName}</span>
                  {review.isVerified && (
                    <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Покупка подтверждена
                    </span>
                  )}
                </div>
                <Stars rating={review.rating} />
              </div>
              <span className="text-sm text-gray-400">
                {new Date(review.createdAt).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
              </span>
            </div>

            <p className="text-gray-700 text-sm leading-relaxed">{review.comment}</p>

            {review.adminComment && (
              <div className="mt-3 p-3 bg-[#4b8839]/5 border-l-2 border-[#4b8839] rounded-r-lg">
                <span className="text-xs font-semibold text-[#4b8839]">Ответ магазина:</span>
                <p className="text-sm text-gray-700 mt-1">{review.adminComment}</p>
              </div>
            )}

          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50"
          >
            ←
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`px-3 py-1.5 border rounded-lg text-sm ${p === page ? "border-[#4b8839] text-[#4b8839] font-semibold" : "hover:bg-gray-50"}`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
};
