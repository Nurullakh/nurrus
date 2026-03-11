import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

interface CheckoutSuccessLocationState {
  orderId?: number;
  orderNumber?: string;
  estimatedDeliveryDate?: string;
}

const CheckoutSuccessPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state as CheckoutSuccessLocationState | null) || null;

  if (!state?.orderNumber) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h1 className="text-3xl font-bold mb-4">Данные заказа недоступны</h1>
            <p className="text-gray-600 mb-6">Проверьте список заказов в личном кабинете.</p>
            <Link to="/orders" className="inline-block px-6 py-3 bg-[#4b8839] text-white rounded-lg">
              Перейти в мои заказы
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleDownloadReceipt = () => {
    const receiptText = [
      "NURRUS",
      `Заказ: ${state.orderNumber}`,
      `Дата: ${new Date().toLocaleString("ru-RU")}`,
      state.estimatedDeliveryDate
        ? `Ожидаемая доставка: ${new Date(state.estimatedDeliveryDate).toLocaleDateString("ru-RU")}`
        : "",
    ]
      .filter(Boolean)
      .join("\n");

    const blob = new Blob([receiptText], { type: "text/plain;charset=utf-8" });
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = `receipt-${state.orderNumber.replace("#", "")}.txt`;
    anchor.click();
    URL.revokeObjectURL(objectUrl);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="bg-white rounded-xl shadow p-8 md:p-10 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-3xl font-bold mb-3">Спасибо за заказ!</h1>
          <p className="text-gray-600 mb-2">
            Заказ <span className="font-semibold">{state.orderNumber}</span> успешно оформлен.
          </p>
          {state.estimatedDeliveryDate && (
            <p className="text-gray-600 mb-8">
              Ожидаемая дата доставки:{" "}
              <span className="font-semibold">
                {new Date(state.estimatedDeliveryDate).toLocaleDateString("ru-RU")}
              </span>
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={() => navigate(state.orderId ? `/order/${state.orderId}` : "/orders")}
              className="py-3 bg-[#4b8839] text-white rounded-lg font-semibold"
            >
              Отследить заказ
            </button>
            <Link to="/catalog" className="py-3 border border-gray-300 rounded-lg font-semibold text-center">
              В каталог
            </Link>
            <button
              onClick={handleDownloadReceipt}
              className="py-3 border border-gray-300 rounded-lg font-semibold"
            >
              Скачать чек
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccessPage;
