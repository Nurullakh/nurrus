"use client";

import React, { useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "@/next/routerShim";
import { RootState, AppDispatch } from "@/app/store";
import { removeFromCartAsync } from "@/entities/cart/model/cart-slice";
import { apiRequest } from "@/shared/lib/api";
import { formatPrice } from "@/shared/lib/price/format-price";

interface DeliveryMethod {
  id: string;
  name: string;
  price: number;
  days: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
}

interface CheckoutLocationState {
  selectedCartItemIds?: number[];
}

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { items } = useSelector((state: RootState) => state.cart);
  const locationState = (location.state as CheckoutLocationState | null) || null;
  const hasSelectedItemsInState = Array.isArray(locationState?.selectedCartItemIds);

  const checkoutItems = useMemo(() => {
    if (!hasSelectedItemsInState) {
      return items;
    }
    const selectedIds = new Set(locationState?.selectedCartItemIds || []);
    return items.filter((item) => selectedIds.has(item.id));
  }, [hasSelectedItemsInState, items, locationState?.selectedCartItemIds]);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    comment: "",
  });

  const [selectedDelivery, setSelectedDelivery] = useState<string>("standard");
  const [selectedPayment, setSelectedPayment] = useState<string>("card");
  const [loading, setLoading] = useState(false);

  const deliveryMethods: DeliveryMethod[] = [
    { id: "standard", name: "Стандартная доставка", price: 500, days: "3-5 дней" },
    { id: "express", name: "Экспресс доставка", price: 1500, days: "1-2 дня" },
    { id: "pickup", name: "Самовывоз", price: 0, days: "Сегодня" },
  ];

  const paymentMethods: PaymentMethod[] = [
    { id: "card", name: "Банковская карта", description: "Visa, MasterCard, Мир" },
    { id: "cash", name: "Наличными при получении", description: "Оплата курьеру" },
    { id: "sbp", name: "Система Быстрых Платежей", description: "По QR-коду" },
  ];

  const subtotal = checkoutItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const deliveryPrice = deliveryMethods.find((d) => d.id === selectedDelivery)?.price || 0;
  const total = subtotal + deliveryPrice;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userRaw = localStorage.getItem("user");
      let userId: string | null = null;
      if (userRaw) {
        try {
          const parsedUser = JSON.parse(userRaw);
          if (parsedUser?.id !== undefined && parsedUser?.id !== null) {
            userId = String(parsedUser.id);
          }
        } catch {
          // Ignore invalid user payload in localStorage
        }
      }

      const orderData = {
        userId,
        customerName: `${formData.firstName} ${formData.lastName}`.trim(),
        customerEmail: formData.email,
        customerPhone: formData.phone,
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
        comment: formData.comment || undefined,
        items: checkoutItems.map((item) => ({
          productId: item.productId || item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: item.images?.[0] || item.image,
        })),
        subtotal,
        deliveryPrice,
        total,
        deliveryMethod: selectedDelivery,
        paymentMethod: selectedPayment,
      };

      const order = await apiRequest("/orders", {
        method: "POST",
        body: JSON.stringify(orderData),
      });
      if (order?.id) {
        await Promise.all(
          checkoutItems.map((item) => dispatch(removeFromCartAsync(item.id))),
        );
        navigate("/checkout/success", {
          state: {
            orderId: order.id,
            orderNumber: order.orderNumber,
            estimatedDeliveryDate: order.estimatedDeliveryDate,
          },
        });
      }
    } catch (error) {
      console.error("Ошибка:", error);
      alert("Ошибка соединения с сервером");
    } finally {
      setLoading(false);
    }
  };

  if (checkoutItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold mb-4">
            {items.length === 0 ? "Корзина пуста" : "Нет выбранных товаров"}
          </h1>
          <p className="text-gray-600 mb-8">
            {items.length === 0
              ? "Добавьте товары в корзину, чтобы оформить заказ"
              : "Вернитесь в корзину и отметьте товары для оформления"}
          </p>
          <button
            onClick={() => navigate(items.length === 0 ? "/catalog" : "/cart")}
            className="px-6 py-3 bg-[#4b8839] text-white rounded-lg hover:bg-[#4b8839] transition-colors"
          >
            {items.length === 0 ? "Перейти в каталог" : "Вернуться в корзину"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Оформление заказа</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Форма заказа */}
            <div className="lg:col-span-2 space-y-6">
              {/* Контактные данные */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">Контактные данные</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Имя *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4b8839]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Фамилия *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4b8839]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4b8839]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Телефон *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4b8839]"
                      placeholder="+7 (999) 123-45-67"
                    />
                  </div>
                </div>
              </div>

              {/* Адрес доставки */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">Адрес доставки</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Город *
                      </label>
                      <input
                        type="text"
                        name="city"
                        required
                        value={formData.city}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4b8839]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Индекс *
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        required
                        value={formData.postalCode}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4b8839]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Адрес *
                    </label>
                    <input
                      type="text"
                      name="address"
                      required
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4b8839]"
                      placeholder="Улица, дом, квартира"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Комментарий к заказу
                    </label>
                    <textarea
                      name="comment"
                      value={formData.comment}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4b8839]"
                      placeholder="Дополнительная информация..."
                    />
                  </div>
                </div>
              </div>

              {/* Способ доставки */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">Способ доставки</h2>
                <div className="space-y-3">
                  {deliveryMethods.map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-colors ${selectedDelivery === method.id
                        ? "border-[#4b8839]"
                        : "border-gray-200 hover:border-gray-300"
                        }`}
                    >
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="delivery"
                          value={method.id}
                          checked={selectedDelivery === method.id}
                          onChange={(e) => setSelectedDelivery(e.target.value)}
                          className="mt-1 mr-3 accent-[#4b8839]"
                        />
                        <div>
                          <div className="font-medium">{method.name}</div>
                          <div className="text-sm text-gray-500">{method.days}</div>
                        </div>
                      </div>
                      <div className="font-bold">
                        {method.price === 0 ? "Бесплатно" : `${formatPrice(method.price)} ₽`}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Способ оплаты */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">Способ оплаты</h2>
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-colors ${selectedPayment === method.id
                        ? "border-[#4b8839]"
                        : "border-gray-200 hover:border-gray-300"
                        }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={method.id}
                        checked={selectedPayment === method.id}
                        onChange={(e) => setSelectedPayment(e.target.value)}
                        className="mt-1 mr-3 accent-[#4b8839]"
                      />
                      <div>
                        <div className="font-medium">{method.name}</div>
                        <div className="text-sm text-gray-500">{method.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Сводка заказа */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6 sticky top-24">
                <h2 className="text-xl font-bold mb-4">Ваш заказ</h2>

                <div className="space-y-3 mb-4">
                  {checkoutItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <div className="flex-1">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-gray-500">
                          {item.quantity} × {formatPrice(item.price)} ₽
                        </div>
                      </div>
                      <div className="font-medium">
                        {formatPrice(item.price * item.quantity)} ₽
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Товары ({checkoutItems.length}):</span>
                    <span>{formatPrice(subtotal)} ₽</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Доставка:</span>
                    <span>
                      {deliveryPrice === 0
                        ? "Бесплатно"
                        : `${formatPrice(deliveryPrice)} ₽`}
                    </span>
                  </div>
                  <div className="flex justify-between text-xl font-bold border-t pt-2">
                    <span>Итого:</span>
                    <span>{formatPrice(total)} ₽</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-6 py-3 bg-[#4b8839] text-white rounded-lg font-bold hover:bg-[#4b8839] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Оформление..." : "Оформить заказ"}
                </button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  Нажимая кнопку, вы соглашаетесь с{" "}
                  <a href="#" className="text-[#4b8839] hover:underline">
                    условиями обработки персональных данных
                  </a>
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;

