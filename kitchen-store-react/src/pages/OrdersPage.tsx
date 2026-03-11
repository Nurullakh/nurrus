import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { formatPrice } from "@/utils/price";
import {
  useGetOrdersQuery,
  useUpdateOrderStatusMutation,
  type OrderDto,
  type OrderStatus,
} from "@/store/api/ordersApi";

type OrderFilter = "all" | "in_transit" | "completed" | "cancelled";

const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<OrderFilter>("all");
  const token = localStorage.getItem("token");
  const userRaw = localStorage.getItem("user");
  const userId = useMemo(() => {
    if (!userRaw || userRaw === "undefined") {
      return undefined;
    }
    try {
      const parsed = JSON.parse(userRaw);
      if (parsed?.id === undefined || parsed?.id === null) {
        return undefined;
      }
      return String(parsed.id);
    } catch {
      return undefined;
    }
  }, [userRaw]);
  const {
    data: orders = [],
    isLoading,
    isError,
    refetch,
  } = useGetOrdersQuery(userId, { skip: !token });
  const [updateOrderStatus, { isLoading: isCancelling }] = useUpdateOrderStatusMutation();

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
  }, [navigate, token]);

  const getStatusText = (status: OrderStatus) => {
    const statusMap = {
      pending: "Ожидает подтверждения",
      processing: "В обработке",
      shipping: "Доставляется",
      completed: "Завершен",
      cancelled: "Отменен",
    };
    return statusMap[status];
  };

  const getStatusColor = (status: OrderStatus) => {
    const colorMap = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      shipping: "bg-purple-100 text-purple-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colorMap[status];
  };

  const filteredOrders = useMemo(() => {
    if (activeFilter === "all") {
      return orders;
    }
    if (activeFilter === "in_transit") {
      return orders.filter((order) =>
        ["pending", "processing", "shipping"].includes(order.status),
      );
    }
    if (activeFilter === "completed") {
      return orders.filter((order) => order.status === "completed");
    }
    return orders.filter((order) => order.status === "cancelled");
  }, [activeFilter, orders]);

  const handleCancelOrder = async (order: OrderDto) => {
    if (order.status !== "pending") {
      return;
    }

    try {
      await updateOrderStatus({ id: order.id, status: "cancelled" }).unwrap();
      await refetch();
      alert(`Заказ ${order.orderNumber} отменен`);
    } catch {
      alert("Не удалось отменить заказ");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Загрузка...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl mb-3">Ошибка загрузки заказов</div>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-[#4b8839] text-white rounded-lg"
          >
            Повторить
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Мои заказы</h1>
            <Link
              to="/profile"
              className="text-[#4b8839] hover:text-[#4b8839] font-medium"
            >
              ← Назад в профиль
            </Link>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-4 py-2 rounded-full text-sm font-medium ${activeFilter === "all" ? "bg-[#4b8839] text-white" : "bg-white border"}`}
            >
              Все
            </button>
            <button
              onClick={() => setActiveFilter("in_transit")}
              className={`px-4 py-2 rounded-full text-sm font-medium ${activeFilter === "in_transit" ? "bg-[#4b8839] text-white" : "bg-white border"}`}
            >
              В пути
            </button>
            <button
              onClick={() => setActiveFilter("completed")}
              className={`px-4 py-2 rounded-full text-sm font-medium ${activeFilter === "completed" ? "bg-[#4b8839] text-white" : "bg-white border"}`}
            >
              Завершенные
            </button>
            <button
              onClick={() => setActiveFilter("cancelled")}
              className={`px-4 py-2 rounded-full text-sm font-medium ${activeFilter === "cancelled" ? "bg-[#4b8839] text-white" : "bg-white border"}`}
            >
              Отмененные
            </button>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <svg
                className="mx-auto h-16 w-16 text-gray-400 mb-4"
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
              <h3 className="text-xl font-semibold mb-2">У вас пока нет заказов</h3>
              <p className="text-gray-600 mb-6">
                Начните покупки в нашем каталоге
              </p>
              <Link
                to="/catalog"
                className="inline-block px-6 py-3 bg-[#4b8839] text-white rounded-lg hover:bg-[#4b8839] transition-colors"
              >
                Перейти в каталог
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="mb-4 md:mb-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold">{order.orderNumber}</h3>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {getStatusText(order.status)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>
                          Дата заказа:{" "}
                          {new Date(order.createdAt).toLocaleDateString("ru-RU")}
                        </div>
                        <div>Товаров: {order.items.length}</div>
                        <div className="font-semibold text-gray-900">
                          Сумма: {formatPrice(Number(order.total))} ₽
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Link
                        to={`/order/${order.id}`}
                        className="px-6 py-2 bg-[#4b8839] text-white rounded-lg hover:bg-[#4b8839] transition-colors text-center"
                      >
                        Подробнее
                      </Link>
                      {order.status === "completed" && (
                        <button className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                          Оставить отзыв
                        </button>
                      )}
                      {order.status === "pending" && (
                        <button
                          disabled={isCancelling}
                          onClick={() => handleCancelOrder(order)}
                          className="px-6 py-2 border border-[#4b8839] text-[#4b8839] rounded-lg hover:bg-[#4b8839] transition-colors disabled:opacity-50"
                        >
                          {isCancelling ? "Отмена..." : "Отменить"}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Прогресс доставки */}
                  {order.status !== "cancelled" && order.status !== "completed" && (
                    <div className="mt-6 pt-6 border-t">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium text-gray-700">
                          Статус доставки
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.status === "pending" && "0%"}
                          {order.status === "processing" && "25%"}
                          {order.status === "shipping" && "75%"}
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-[#4b8839] h-2 rounded-full transition-all"
                          style={{
                            width:
                              order.status === "pending"
                                ? "0%"
                                : order.status === "processing"
                                  ? "25%"
                                  : "75%",
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;

