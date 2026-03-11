import React from "react";
import { Link } from "react-router-dom";

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero секция */}
      <div className="bg-gradient-to-r from-[#4b8839] to-[#4b8839] text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">О компании NURRUS</h1>
            <p className="text-xl opacity-90">
              Мы создаем уютные интерьеры для вашего дома уже более 15 лет
            </p>
          </div>
        </div>
      </div>

      {/* Основной контент */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* История компании */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6">Наша история</h2>
            <div className="bg-white rounded-lg shadow p-8">
              <p className="text-lg text-gray-700 mb-4 leading-relaxed">
                NURRUS начал свою деятельность в 2008 году как небольшой
                магазин кухонной мебели. За годы работы мы выросли в одну из
                крупнейших сетей по продаже мебели и товаров для дома в России.
              </p>
              <p className="text-lg text-gray-700 mb-4 leading-relaxed">
                Сегодня в ассортименте представлено более 10 000 товаров от
                ведущих производителей мебели из России, Европы и Азии. Мы
                гордимся тем, что помогли обустроить более 50 000 домов по всей
                стране.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Наша миссия - сделать качественную мебель доступной для каждой
                семьи, предлагая широкий выбор, выгодные цены и отличный сервис.
              </p>
            </div>
          </section>

          {/* Преимущества */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8">Почему выбирают нас</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="w-12 h-12 bg-[#4b8839]/10 rounded-lg flex items-center justify-center mb-4">
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Гарантия качества</h3>
                <p className="text-gray-600">
                  Все товары сертифицированы и имеют официальную гарантию от
                  производителя до 3 лет.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="w-12 h-12 bg-[#4b8839]/10 rounded-lg flex items-center justify-center mb-4">
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
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Выгодные цены</h3>
                <p className="text-gray-600">
                  Работаем напрямую с производителями, что позволяет предлагать
                  лучшие цены на рынке.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="w-12 h-12 bg-[#4b8839]/10 rounded-lg flex items-center justify-center mb-4">
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
                <h3 className="text-xl font-bold mb-2">Быстрая доставка</h3>
                <p className="text-gray-600">
                  Доставим ваш заказ в течение 1-3 дней по Москве и 3-7 дней по
                  России.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="w-12 h-12 bg-[#4b8839]/10 rounded-lg flex items-center justify-center mb-4">
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
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Профессиональная сборка</h3>
                <p className="text-gray-600">
                  Опытные мастера соберут и установят вашу мебель быстро и
                  качественно.
                </p>
              </div>
            </div>
          </section>

          {/* Цифры */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8">Hoff в цифрах</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="text-4xl font-bold text-[#4b8839] mb-2">15+</div>
                <div className="text-gray-600">лет на рынке</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="text-4xl font-bold text-[#4b8839] mb-2">50K+</div>
                <div className="text-gray-600">довольных клиентов</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="text-4xl font-bold text-[#4b8839] mb-2">10K+</div>
                <div className="text-gray-600">товаров в каталоге</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="text-4xl font-bold text-[#4b8839] mb-2">35</div>
                <div className="text-gray-600">городов России</div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-[#4b8839] to-[#4b8839] rounded-lg p-8 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">Начните обновление своего дома сегодня!</h2>
            <p className="text-lg mb-6 opacity-90">
              Откройте для себя тысячи товаров для создания идеального интерьера
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                to="/catalog"
                className="px-8 py-3 bg-white text-[#4b8839] rounded-lg font-bold hover:bg-gray-100 transition-colors"
              >
                Смотреть каталог
              </Link>
              <Link
                to="/contacts"
                className="px-8 py-3 border-2 border-white text-white rounded-lg font-bold hover:bg-white hover:text-[#4b8839] transition-colors"
              >
                Связаться с нами
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;

