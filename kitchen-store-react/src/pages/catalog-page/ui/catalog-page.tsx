"use client";

import React, { useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "@/next/routerShim";
import ProductCard from "@/entities/product/ui/product-card";
import Pagination from "@/shared/ui/pagination/pagination";
import {
  useGetProductCategoriesQuery,
  useGetProductsByCategoryQuery,
  useGetProductsQuery,
} from "@/entities/product/api/products-api";

const translitMap: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "e",
  ж: "zh",
  з: "z",
  и: "i",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "h",
  ц: "c",
  ч: "ch",
  ш: "sh",
  щ: "sch",
  ъ: "",
  ы: "y",
  ь: "",
  э: "e",
  ю: "yu",
  я: "ya",
};

const slugifyCategory = (value: string) =>
  value
    .toLowerCase()
    .split("")
    .map((char) => translitMap[char] ?? char)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const categorySeoContent: Record<
  string,
  { title: string; description: string; faq: Array<{ q: string; a: string }> }
> = {
  kuhni: {
    title: "Кухни: гарнитуры, модули и решения под ваш интерьер",
    description:
      "Подберите кухню по стилю, размеру и бюджету: классика, минимализм, современные модульные решения и практичные материалы для ежедневного использования.",
    faq: [
      {
        q: "Можно ли заказать кухню под размер?",
        a: "Да, можно подобрать модульную конфигурацию или согласовать индивидуальное решение через менеджера.",
      },
      {
        q: "Есть ли услуга сборки кухни?",
        a: "Да, при оформлении заказа можно добавить профессиональную сборку.",
      },
    ],
  },
  stoly: {
    title: "Столы для кухни и столовой",
    description:
      "Кухонные и обеденные столы разных форм и размеров: компактные, раскладные и семейные модели для ежедневного использования.",
    faq: [
      {
        q: "Какие столы подходят для маленькой кухни?",
        a: "Рекомендуем компактные и раскладные модели с прямоугольной или круглой столешницей.",
      },
      {
        q: "Как выбрать материал столешницы?",
        a: "Для активного использования лучше практичные поверхности: ЛДСП, МДФ с защитой или керамика.",
      },
    ],
  },
  stulya: {
    title: "Стулья для кухни и гостиной",
    description:
      "Подбор стульев под интерьер: мягкие и жесткие модели, современные и классические решения, удобные варианты для ежедневной посадки.",
    faq: [
      {
        q: "Как подобрать высоту стула?",
        a: "Ориентируйтесь на высоту стола: комфортный зазор между сиденьем и столешницей обычно 25-30 см.",
      },
      {
        q: "Какая обивка практичнее?",
        a: "Для кухни чаще берут износостойкие ткани с пропиткой или экокожу.",
      },
    ],
  },
};

const CatalogPage: React.FC = () => {
  const navigate = useNavigate();
  const { categorySlug } = useParams<{ categorySlug?: string }>();
  const [searchParams] = useSearchParams();

  const selectedCategoryFromQuery = searchParams.get("category") || null;
  const page = parseInt(searchParams.get("page") || "1");

  const { data: categories = [] } = useGetProductCategoriesQuery();
  const selectedCategoryFromSlug = useMemo(() => {
    if (!categorySlug || categories.length === 0) {
      return null;
    }
    return categories.find((category) => slugifyCategory(category) === categorySlug) || null;
  }, [categories, categorySlug]);

  const selectedCategory = categorySlug
    ? selectedCategoryFromSlug
    : selectedCategoryFromQuery;
  const isUnknownSlug = Boolean(categorySlug) && categories.length > 0 && !selectedCategoryFromSlug;

  const { data: commonProductsResponse, isFetching: isFetchingAll } = useGetProductsQuery(
    { page, limit: 40 },
    { skip: Boolean(selectedCategory) }
  );
  const { data: categoryProductsResponse, isFetching: isFetchingCategory } =
    useGetProductsByCategoryQuery(
      { category: selectedCategory ?? "", page, limit: 40 },
      { skip: !selectedCategory }
    );

  const response = selectedCategory ? categoryProductsResponse : commonProductsResponse;
  const products = response?.data ?? [];
  const totalPages = response?.totalPages ?? 1;
  const total = response?.total ?? 0;
  const loading = selectedCategory ? isFetchingCategory : isFetchingAll;
  const seo = categorySlug ? categorySeoContent[categorySlug] : null;

  const handleCategoryChange = (category: string | null) => {
    const params = new URLSearchParams();
    params.set("page", "1");
    const query = params.toString();
    if (!category) {
      navigate(`/catalog?${query}`);
      return;
    }
    navigate(`/catalog/${slugifyCategory(category)}?${query}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams();
    params.set("page", newPage.toString());
    const query = params.toString();
    if (selectedCategory) {
      navigate(`/catalog/${slugifyCategory(selectedCategory)}?${query}`);
    } else {
      navigate(`/catalog?${query}`);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Каталог</h1>
          <p className="text-gray-600">
            {isUnknownSlug
              ? "Категория не найдена, показаны все товары"
              : selectedCategory
              ? `Категория: ${selectedCategory} (${total} товаров)`
              : `Все товары (${total})`}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-4">Категории</h2>
              <nav className="space-y-2">
                <button
                  onClick={() => handleCategoryChange(null)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${!selectedCategory
                      ? "bg-[#4b8839] text-white font-medium"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                    }`}
                >
                  Все товары
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryChange(category)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${selectedCategory === category
                        ? "bg-[#4b8839] text-white font-medium"
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    {category}
                  </button>
                ))}
              </nav>

              <div className="mt-8 pt-8 border-t">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Быстрые ссылки
                </h3>
                <div className="space-y-2">
                  <Link
                    to="/favorites"
                    className="block text-sm text-gray-600 hover:text-[#4b8839] transition-colors"
                  >
                    Избранное
                  </Link>
                  <Link
                    to="/cart"
                    className="block text-sm text-gray-600 hover:text-[#4b8839] transition-colors"
                  >
                    Корзина
                  </Link>
                </div>
              </div>
            </div>
          </aside> */}

          {/* Main Content */}
          <main className="flex-1">
            {/* Mobile Category Filter */}
            <div className="lg:hidden mb-6">
              <select
                value={selectedCategory || ""}
                onChange={(e) =>
                  handleCategoryChange(e.target.value || null)
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b8839]"
              >
                <option value="">Все товары</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4b8839] mx-auto mb-4"></div>
                  <p className="text-gray-600">Загрузка товаров...</p>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!loading && products.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <svg
                  className="w-24 h-24 mx-auto text-gray-300 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Товары не найдены
                </h3>
                <p className="text-gray-600 mb-6">
                  В этой категории пока нет товаров
                </p>
                <button
                  onClick={() => handleCategoryChange(null)}
                  className="px-6 py-3 bg-[#4b8839] text-white rounded-lg hover:bg-[#4b8839] transition-colors"
                >
                  Показать все товары
                </button>
              </div>
            )}

            {/* Products Grid */}
            {!loading && products.length > 0 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      id={product.id}
                      name={product.name}
                      price={product.price}
                      images={product.images}
                      image={product.image}
                      available={product.is_available}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center">
                    <Pagination
                      currentPage={page}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </>
            )}

            {seo && (
              <section className="bg-white rounded-lg shadow-sm p-6 mt-6">
                <h2 className="text-2xl font-bold mb-3">{seo.title}</h2>
                <p className="text-gray-700 mb-6">{seo.description}</p>
                <h3 className="text-xl font-semibold mb-4">Частые вопросы</h3>
                <div className="space-y-3">
                  {seo.faq.map((item) => (
                    <details key={item.q} className="border rounded-lg p-4">
                      <summary className="font-medium cursor-pointer">{item.q}</summary>
                      <p className="text-gray-600 mt-2">{item.a}</p>
                    </details>
                  ))}
                </div>
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default CatalogPage;

