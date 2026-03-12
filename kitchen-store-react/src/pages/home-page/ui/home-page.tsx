"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Link } from "@/next/routerShim";
import ProductCard from "@/entities/product/ui/product-card";
import HeroSlider from "@/widgets/hero-slider/ui/hero-slider";
import { API_URL } from "@/shared/config/api";
import {
  useGetMainBannersQuery,
  useGetProductsQuery,
} from "@/entities/product/api/products-api";
import { useSubscribeNewsletterMutation } from "@/features/newsletter/api/newsletter-api";

const Home: React.FC = () => {
  const [device, setDevice] = useState<"mobile" | "desktop">(() =>
    typeof window !== "undefined" && window.innerWidth < 768 ? "mobile" : "desktop",
  );
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterMessage, setNewsletterMessage] = useState("");
  const [newsletterError, setNewsletterError] = useState("");
  const [subscribeNewsletter, { isLoading: isSubscribing }] = useSubscribeNewsletterMutation();
  const { data: productsResponse } = useGetProductsQuery({ page: 1, limit: 40 });
  const { data: bannersResponse } = useGetMainBannersQuery(device);

  useEffect(() => {
    const updateDevice = () => {
      setDevice(window.innerWidth < 768 ? "mobile" : "desktop");
    };

    updateDevice();
    window.addEventListener("resize", updateDevice);
    return () => window.removeEventListener("resize", updateDevice);
  }, []);

  const heroBanners = useMemo(
    () =>
      (bannersResponse ?? [])
        .filter((banner) => Boolean(banner.imageUrl))
        .map((banner) => ({
          id: banner.id,
          image: `${API_URL}${banner.imageUrl}`,
          link: banner.link || "/catalog",
        })),
    [bannersResponse]
  );

  const products = productsResponse?.data ?? [];
  const latestProducts = useMemo(
    () => [...products].sort((a, b) => b.id - a.id).slice(0, 8),
    [products],
  );

  const handleNewsletterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setNewsletterMessage("");
    setNewsletterError("");

    const normalizedEmail = newsletterEmail.trim().toLowerCase();
    if (!normalizedEmail) {
      setNewsletterError("Введите email");
      return;
    }

    try {
      const response = await subscribeNewsletter({
        email: normalizedEmail,
        source: "homepage",
      }).unwrap();
      setNewsletterMessage(response.message);
      setNewsletterEmail("");
    } catch {
      setNewsletterError("Не удалось оформить подписку. Попробуйте еще раз.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSlider slides={heroBanners} />

      {/* Категории */}
      {/* <section className="py-16 container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">
          Популярные категории
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map((category) => (
            <Link
              key={category.name}
              to={`/catalog?category=${category.name}`}
              className="group"
            >
              <div className="relative overflow-hidden rounded-lg aspect-square mb-3">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60" />
                <div className="absolute bottom-3 left-3 text-white">
                  <div className="text-lg font-bold">{category.name}</div>
                  <div className="text-sm opacity-90">{category.count} товаров</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section> */}

      {/* Преимущества */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#4b8839]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-[#4b8839]"
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
                Доставим заказ от 1 дня по Москве и области
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#4b8839]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-[#4b8839]"
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
                Официальная гарантия на все товары до 3 лет
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#4b8839]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-[#4b8839]"
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
                Работаем напрямую с производителями мебели
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#4b8839]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-[#4b8839]"
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
                Опытные мастера соберут мебель за вас
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Новинки */}
      <section className="py-16 container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-4xl font-bold">Новинки</h2>
          <Link
            to="/catalog"
            className="text-[#4b8839] hover:text-[#4b8839] font-semibold flex items-center gap-2"
          >
            Смотреть все
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
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {latestProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </section>

      {/* Баннер акции */}
      {/* <section className="py-16 bg-gradient-to-r from-[#4b8839] to-[#4b8839] text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-5xl font-bold mb-4">
                Рассрочка 0-0-12
              </h2>
              <p className="text-xl mb-6 opacity-90">
                Купите мебель сейчас, платите потом. Без первого взноса и переплат!
              </p>
              <ul className="space-y-2 mb-8">
                <li className="flex items-center gap-2">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Без первоначального взноса
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  0% переплаты
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Одобрение за 5 минут
                </li>
              </ul>
              <Link
                to="/catalog"
                className="inline-block px-8 py-4 bg-white text-[#4b8839] font-bold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Выбрать товар
              </Link>
            </div>
            <div className="hidden md:block">
              <img
                src="https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80"
                alt="Рассрочка"
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section> */}

      {/* О компании кратко */}
      <section className="py-16 container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Мебель для вашего дома с 2008 года
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            NURRUS — это более 10 000 товаров для создания уютного интерьера.
            Мы помогли обустроить более 50 000 домов по всей России.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="text-4xl font-bold text-[#4b8839] mb-2">15+</div>
              <div className="text-gray-600">лет на рынке</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#4b8839] mb-2">50K+</div>
              <div className="text-gray-600">довольных клиентов</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#4b8839] mb-2">10K+</div>
              <div className="text-gray-600">товаров</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#4b8839] mb-2">35</div>
              <div className="text-gray-600">городов России</div>
            </div>
          </div>
          <Link
            to="/about"
            className="inline-block px-8 py-3 border-2 border-[#4b8839] text-[#4b8839] font-bold rounded-lg hover:bg-[#4b8839] hover:text-white transition-colors"
          >
            Узнать больше о компании
          </Link>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">
              Подпишитесь на рассылку
            </h2>
            <p className="text-gray-600 mb-8">
              Получайте первыми информацию о новинках и специальных предложениях
            </p>
            <form className="flex gap-4" onSubmit={handleNewsletterSubmit}>
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Введите ваш email"
                required
                className="flex-1 px-6 py-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4b8839]"
              />
              <button
                type="submit"
                disabled={isSubscribing}
                className="px-8 py-4 bg-[#4b8839] text-white font-bold rounded-lg hover:bg-[#4b8839] transition-colors"
              >
                {isSubscribing ? "Отправка..." : "Подписаться"}
              </button>
            </form>
            {newsletterMessage && (
              <p className="mt-3 text-green-700 font-medium">{newsletterMessage}</p>
            )}
            {newsletterError && (
              <p className="mt-3 text-red-600 font-medium">{newsletterError}</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
