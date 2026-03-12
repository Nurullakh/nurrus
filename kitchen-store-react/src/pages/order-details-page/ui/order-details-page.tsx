"use client";

import React from "react";
import { Link, useNavigate, useParams } from "@/next/routerShim";
import { formatPrice } from "@/shared/lib/price/format-price";
import { getUploadUrl } from "@/shared/config/api";
import { useGetOrderByIdQuery, useUpdateOrderStatusMutation, type OrderStatus } from "@/entities/order/api/orders-api";
import { addToCartAsync } from "@/entities/cart/model/cart-slice";
import { useAppDispatch } from "@/app/store/hooks";

const statusMap: Record<OrderStatus, string> = {
  pending: "Ожидает подтверждения",
  processing: "В обработке",
  shipping: "Доставляется",
  completed: "Завершен",
  cancelled: "Отменен",
};

const paymentMap: Record<string, string> = {
  card: "Банковская карта",
  cash: "Наличными при получении",
  sbp: "СБП",
};

const deliveryMap: Record<string, string> = {
  standard: "Стандартная доставка",
  express: "Экспресс доставка",
  pickup: "Самовывоз",
};

const statusColorMap: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipping: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const OrderDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const orderId = Number(id);
  const { data: order, isLoading, isError, refetch } = useGetOrderByIdQuery(orderId, {
    skip: Number.isNaN(orderId),
  });
  const [updateOrderStatus, { isLoading: isCancelling }] = useUpdateOrderStatusMutation();

  const handleRepeatOrder = () => {
    if (!order?.items?.length) {
      return;
    }

    order.items.forEach((item) => {
      dispatch(
        addToCartAsync({
          id: item.productId,
          name: item.name,
          price: Number(item.price),
          image: item.image,
          images: item.image ? [item.image] : undefined,
          available: true,
        }),
      );
    });

    navigate("/cart");
  };

  const handleCancelOrder = async () => {
    if (!order || order.status !== "pending") {
      return;
    }

    try {
      await updateOrderStatus({ id: order.id, status: "cancelled" }).unwrap();
      await refetch();
      alert("Заказ отменен");
    } catch {
      alert("Не удалось отменить заказ");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Загрузка заказа...</div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h1 className="text-2xl font-bold mb-3">Заказ не найден</h1>
            <p className="text-gray-600 mb-6">Проверьте ссылку или перейдите в список заказов.</p>
            <Link to="/orders" className="inline-block px-6 py-3 bg-[#4b8839] text-white rounded-lg">
              Мои заказы
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const canCancel = order.status === "pending";

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Заказ {order.orderNumber}</h1>
          <Link to="/orders" className="text-[#4b8839] font-medium">
            ← Все заказы
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Состав заказа</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColorMap[order.status]}`}>
                  {statusMap[order.status]}
                </span>
              </div>
              <div className="space-y-4">
                {order.items.map((item, idx) => (
                  <div key={`${item.productId}-${idx}`} className="flex items-center gap-4 border rounded-lg p-3">
                    <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <img src={getUploadUrl(item.image)} alt={item.name} className="w-full h-full object-contain" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">Фото</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{item.name}</div>
                      <div className="text-sm text-gray-500">
                        {item.quantity} × {formatPrice(Number(item.price))} ₽
                      </div>
                    </div>
                    <div className="font-semibold">{formatPrice(Number(item.price) * item.quantity)} ₽</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Трекинг</h2>
              <div className="space-y-3">
                <div className="text-sm text-gray-700">
                  <span className="text-gray-500">Трек-номер: </span>
                  {order.trackingNumber || "еще не присвоен"}
                </div>
                {order.estimatedDeliveryDate && (
                  <div className="text-sm text-gray-700">
                    <span className="text-gray-500">Ожидаемая доставка: </span>
                    {new Date(order.estimatedDeliveryDate).toLocaleDateString("ru-RU")}
                  </div>
                )}
                {order.trackingHistory?.length ? (
                  <div className="space-y-2 pt-2">
                    {order.trackingHistory.map((track, idx) => (
                      <div key={idx} className="border rounded p-3 text-sm">
                        <div className="font-medium">{track.status}</div>
                        <div className="text-gray-500">
                          {new Date(track.date).toLocaleString("ru-RU")}
                          {track.location ? `, ${track.location}` : ""}
                        </div>
                        {track.comment && <div className="text-gray-700 mt-1">{track.comment}</div>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">История перемещения пока не обновлялась.</div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Доставка и оплата</h2>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Получатель: </span>
                  {order.customerName}
                </div>
                <div>
                  <span className="text-gray-500">Телефон: </span>
                  {order.customerPhone}
                </div>
                <div>
                  <span className="text-gray-500">Email: </span>
                  {order.customerEmail}
                </div>
                <div>
                  <span className="text-gray-500">Адрес: </span>
                  {order.city}, {order.address}, {order.postalCode}
                </div>
                <div>
                  <span className="text-gray-500">Доставка: </span>
                  {deliveryMap[order.deliveryMethod] || order.deliveryMethod}
                </div>
                <div>
                  <span className="text-gray-500">Оплата: </span>
                  {paymentMap[order.paymentMethod] || order.paymentMethod}
                </div>
              </div>

              <div className="border-t mt-4 pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Товары</span>
                  <span>{formatPrice(Number(order.subtotal))} ₽</span>
                </div>
                <div className="flex justify-between">
                  <span>Доставка</span>
                  <span>{formatPrice(Number(order.deliveryPrice))} ₽</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Итого</span>
                  <span>{formatPrice(Number(order.total))} ₽</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 space-y-3">
              <button
                onClick={handleRepeatOrder}
                className="w-full py-3 bg-[#4b8839] text-white rounded-lg font-semibold"
              >
                Повторить заказ
              </button>
              {canCancel && (
                <button
                  onClick={handleCancelOrder}
                  disabled={isCancelling}
                  className="w-full py-3 border border-red-300 text-red-600 rounded-lg font-semibold disabled:opacity-50"
                >
                  {isCancelling ? "Отмена..." : "Отменить заказ"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
