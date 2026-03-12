"use client";

import React from "react";
import { Link } from "@/next/routerShim";

const DeliveryPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero секция */}
      <div className="bg-gradient-to-r from-[#4b8839] to-[#4b8839] text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-4">Доставка и оплата</h1>
            <p className="text-xl opacity-90">
              Все что нужно знать о доставке и способах оплаты
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Доставка */}
          <section>
            <h2 className="text-3xl font-bold mb-8">Доставка</h2>

            <div className="space-y-6">
              {/* Стандартная доставка */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#4b8839]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-6 h-6 text-[#4b8839]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold">Стандартная доставка</h3>
                      <span className="text-[#4b8839] font-bold text-lg">500 ₽</span>
                    </div>
                    <p className="text-gray-600 mb-2">
                      Доставка осуществляется в течение 3-5 рабочих дней после
                      подтверждения заказа
                    </p>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      <li>По Москве и МО - 500 ₽</li>
                      <li>По регионам России - от 1000 ₽</li>
                      <li>Бесплатно при заказе от 50 000 ₽</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Экспресс доставка */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#4b8839]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-6 h-6 text-[#4b8839]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold">Экспресс доставка</h3>
                      <span className="text-[#4b8839] font-bold text-lg">1500 ₽</span>
                    </div>
                    <p className="text-gray-600 mb-2">
                      Срочная доставка в течение 1-2 рабочих дней
                    </p>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      <li>Доступна только по Москве и МО</li>
                      <li>Заказ необходимо оформить до 14:00</li>
                      <li>Точное время доставки согласовывается с курьером</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Самовывоз */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-6 h-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold">Самовывоз</h3>
                      <span className="text-green-600 font-bold text-lg">Бесплатно</span>
                    </div>
                    <p className="text-gray-600 mb-2">
                      Вы можете забрать заказ из нашего пункта выдачи
                    </p>
                    <div className="bg-gray-50 p-4 rounded-lg mt-3">
                      <p className="font-medium mb-1">Адрес пункта выдачи:</p>
                      <p className="text-gray-600">г. Москва, ул. Примерная, д. 123</p>
                      <p className="text-gray-600 text-sm mt-2">
                        Пн-Пт: 9:00 - 21:00, Сб-Вс: 10:00 - 20:00
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Сборка и подъем */}
          <section>
            <h2 className="text-3xl font-bold mb-6">Дополнительные услуги</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b">
                  <div>
                    <h4 className="font-semibold">Подъем на этаж</h4>
                    <p className="text-sm text-gray-600">
                      При отсутствии лифта или крупногабаритном товаре
                    </p>
                  </div>
                  <span className="font-bold">от 300 ₽</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b">
                  <div>
                    <h4 className="font-semibold">Сборка мебели</h4>
                    <p className="text-sm text-gray-600">
                      Профессиональная сборка нашими специалистами
                    </p>
                  </div>
                  <span className="font-bold">от 1500 ₽</span>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold">Вынос старой мебели</h4>
                    <p className="text-sm text-gray-600">
                      Демонтаж и утилизация старой мебели
                    </p>
                  </div>
                  <span className="font-bold">от 1000 ₽</span>
                </div>
              </div>
            </div>
          </section>

          {/* Способы оплаты */}
          {/* <section>
            <h2 className="text-3xl font-bold mb-8">Способы оплаты</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Банковской картой онлайн</h3>
                <p className="text-gray-600 mb-3">
                  Оплата на сайте картами Visa, MasterCard, Мир
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✓ Безопасная транзакция</li>
                  <li>✓ Мгновенное подтверждение</li>
                  <li>✓ Защита 3D-Secure</li>
                </ul>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Наличными при получении</h3>
                <p className="text-gray-600 mb-3">
                  Оплата курьеру или в пункте выдачи
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✓ Без предоплаты</li>
                  <li>✓ Оплата при получении</li>
                  <li>✓ Проверка товара перед оплатой</li>
                </ul>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Система Быстрых Платежей</h3>
                <p className="text-gray-600 mb-3">
                  Оплата через СБП по QR-коду
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✓ Без комиссии</li>
                  <li>✓ Оплата из любого банка</li>
                  <li>✓ Быстрый перевод</li>
                </ul>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-orange-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Рассрочка 0-0-12</h3>
                <p className="text-gray-600 mb-3">
                  Беспроцентная рассрочка на 12 месяцев
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✓ Без первоначального взноса</li>
                  <li>✓ Без переплаты</li>
                  <li>✓ Одобрение за 5 минут</li>
                </ul>
              </div>
            </div>
          </section> */}

          {/* FAQ */}
          <section>
            <div className="bg-white rounded-lg shadow p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">Часто задаваемые вопросы</h2>
                <p className="text-gray-600">
                  Ответы на вопросы по доставке, оплате, гарантии и возврату собраны на отдельной странице.
                </p>
              </div>
              <Link
                to="/faq"
                className="inline-flex items-center justify-center px-6 py-3 bg-[#4b8839] text-white rounded-lg font-semibold"
              >
                Перейти в FAQ
              </Link>
            </div>
          </section>

          {/* CTA */}
          <div className="bg-gradient-to-r from-[#4b8839] to-[#4b8839] rounded-lg p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-4">Остались вопросы?</h2>
            <p className="mb-6 opacity-90">
              Наши специалисты с радостью ответят на все ваши вопросы
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                to="/contacts"
                className="px-6 py-3 bg-white text-[#4b8839] rounded-lg font-bold hover:bg-gray-100 transition-colors"
              >
                Связаться с нами
              </Link>
              <a
                href="tel:+79991234567"
                className="px-6 py-3 border-2 border-white rounded-lg font-bold hover:bg-white hover:text-[#4b8839] transition-colors"
              >
                Позвонить: +7 (999) 123-45-67
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryPage;

