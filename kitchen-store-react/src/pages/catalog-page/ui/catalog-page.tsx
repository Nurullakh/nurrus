"use client";

import React, { useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "@/next/routerShim";
import ProductCard from "@/entities/product/ui/product-card";
import Pagination from "@/shared/ui/pagination/pagination";
import {
  useGetProductCategoriesQuery,
  useGetProductsByCategoryQuery,
  useGetProductsQuery,
} from "@/entities/product/api/products-api";

const translitMap: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh",
  з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o",
  п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "c",
  ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
};

const slugifyCategory = (value: string) =>
  value.toLowerCase().split("").map((c) => translitMap[c] ?? c).join("")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const categorySeoContent: Record<
  string,
  { title: string; description: string; faq: Array<{ q: string; a: string }> }
> = {
  kuhni: {
    title: "Кухни: гарнитуры, модули и решения под ваш интерьер",
    description: "Подберите кухню по стилю, размеру и бюджету: классика, минимализм, современные модульные решения.",
    faq: [
      { q: "Можно ли заказать кухню под размер?", a: "Да, можно подобрать модульную конфигурацию или согласовать индивидуальное решение через менеджера." },
      { q: "Есть ли услуга сборки кухни?", a: "Да, при оформлении заказа можно добавить профессиональную сборку." },
    ],
  },
  stoly: {
    title: "Столы для кухни и столовой",
    description: "Кухонные и обеденные столы разных форм и размеров: компактные, раскладные и семейные модели.",
    faq: [
      { q: "Какие столы подходят для маленькой кухни?", a: "Рекомендуем компактные и раскладные модели." },
      { q: "Как выбрать материал столешницы?", a: "Для активного использования: ЛДСП, МДФ с защитой или керамика." },
    ],
  },
  stulya: {
    title: "Стулья для кухни и гостиной",
    description: "Подбор стульев под интерьер: мягкие и жесткие модели, современные и классические решения.",
    faq: [
      { q: "Как подобрать высоту стула?", a: "Комфортный зазор между сиденьем и столешницей — 25-30 см." },
      { q: "Какая обивка практичнее?", a: "Для кухни: износостойкие ткани с пропиткой или экокожа." },
    ],
  },
};

type SortOption = "default" | "price_asc" | "price_desc" | "rating";

const SORT_LABELS: Record<SortOption, string> = {
  default: "По умолчанию",
  price_asc: "Цена: по возрастанию",
  price_desc: "Цена: по убыванию",
  rating: "По рейтингу",
};

interface FilterPanelProps {
  categories: string[];
  selectedCategory: string | null | undefined;
  onCategoryChange: (c: string | null) => void;
  priceMin: string;
  priceMax: string;
  onPriceMinChange: (v: string) => void;
  onPriceMaxChange: (v: string) => void;
  onApplyPrice: () => void;
  onlyAvailable: boolean;
  onAvailableChange: (v: boolean) => void;
  activeFiltersCount: number;
  onReset: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  categories, selectedCategory, onCategoryChange,
  priceMin, priceMax, onPriceMinChange, onPriceMaxChange, onApplyPrice,
  onlyAvailable, onAvailableChange,
  activeFiltersCount, onReset,
}) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Категории</h3>
      <div className="space-y-1">
        <button
          onClick={() => onCategoryChange(null)}
          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
            !selectedCategory ? "bg-[#4b8839] text-white font-medium" : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          Все товары
        </button>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              selectedCategory === category ? "bg-[#4b8839] text-white font-medium" : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>

    <div className="border-t pt-5">
      <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Цена, ₽</h3>
      <div className="flex gap-2 mb-2">
        <input
          type="number"
          placeholder="От"
          value={priceMin}
          onChange={(e) => onPriceMinChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4b8839]"
        />
        <input
          type="number"
          placeholder="До"
          value={priceMax}
          onChange={(e) => onPriceMaxChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4b8839]"
        />
      </div>
      <button
        onClick={onApplyPrice}
        className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm rounded-lg transition-colors"
      >
        Применить
      </button>
    </div>

    <div className="border-t pt-5">
      <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Наличие</h3>
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={onlyAvailable}
          onChange={(e) => onAvailableChange(e.target.checked)}
          className="w-4 h-4 accent-[#4b8839]"
        />
        <span className="text-sm text-gray-700">Только в наличии</span>
      </label>
    </div>

    {activeFiltersCount > 0 && (
      <div className="border-t pt-5">
        <button
          onClick={onReset}
          className="w-full py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
        >
          Сбросить все фильтры
        </button>
      </div>
    )}
  </div>
);

const CatalogPage: React.FC = () => {
  const navigate = useNavigate();
  const { categorySlug } = useParams<{ categorySlug?: string }>();
  const [searchParams] = useSearchParams();

  const selectedCategoryFromQuery = searchParams.get("category") || null;
  const page = parseInt(searchParams.get("page") || "1");

  // Filter state
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [priceMinApplied, setPriceMinApplied] = useState("");
  const [priceMaxApplied, setPriceMaxApplied] = useState("");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [sort, setSort] = useState<SortOption>("default");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const { data: categories = [] } = useGetProductCategoriesQuery();

  const selectedCategoryFromSlug = useMemo(() => {
    if (!categorySlug || categories.length === 0) return null;
    return categories.find((c) => slugifyCategory(c) === categorySlug) || null;
  }, [categories, categorySlug]);

  const selectedCategory = categorySlug ? selectedCategoryFromSlug : selectedCategoryFromQuery;
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
  const rawProducts = response?.data ?? [];
  const totalPages = response?.totalPages ?? 1;
  const loading = selectedCategory ? isFetchingCategory : isFetchingAll;
  const seo = categorySlug ? categorySeoContent[categorySlug] : null;

  // Client-side filtering + sorting
  const products = useMemo(() => {
    let list = [...rawProducts];

    if (onlyAvailable) {
      list = list.filter((p) => p.is_available !== false);
    }
    if (priceMinApplied !== "") {
      list = list.filter((p) => p.price >= Number(priceMinApplied));
    }
    if (priceMaxApplied !== "") {
      list = list.filter((p) => p.price <= Number(priceMaxApplied));
    }

    if (sort === "price_asc") list.sort((a, b) => a.price - b.price);
    else if (sort === "price_desc") list.sort((a, b) => b.price - a.price);
    else if (sort === "rating") list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

    return list;
  }, [rawProducts, onlyAvailable, priceMinApplied, priceMaxApplied, sort]);

  const total = products.length;

  const activeFiltersCount = [
    priceMinApplied || priceMaxApplied,
    onlyAvailable,
    sort !== "default",
  ].filter(Boolean).length + (selectedCategory ? 1 : 0);

  const handleCategoryChange = (category: string | null) => {
    const params = new URLSearchParams();
    params.set("page", "1");
    if (!category) {
      navigate(`/catalog?${params}`);
    } else {
      navigate(`/catalog/${slugifyCategory(category)}?${params}`);
    }
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams();
    params.set("page", newPage.toString());
    if (selectedCategory) {
      navigate(`/catalog/${slugifyCategory(selectedCategory)}?${params}`);
    } else {
      navigate(`/catalog?${params}`);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const applyPriceFilter = () => {
    setPriceMinApplied(priceMin);
    setPriceMaxApplied(priceMax);
  };

  const resetAllFilters = () => {
    setPriceMin(""); setPriceMax("");
    setPriceMinApplied(""); setPriceMaxApplied("");
    setOnlyAvailable(false);
    setSort("default");
    handleCategoryChange(null);
  };

  const filterPanelProps: FilterPanelProps = {
    categories,
    selectedCategory,
    onCategoryChange: handleCategoryChange,
    priceMin,
    priceMax,
    onPriceMinChange: setPriceMin,
    onPriceMaxChange: setPriceMax,
    onApplyPrice: applyPriceFilter,
    onlyAvailable,
    onAvailableChange: setOnlyAvailable,
    activeFiltersCount,
    onReset: resetAllFilters,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-1">Каталог</h1>
          <p className="text-gray-500 text-sm">
            {isUnknownSlug
              ? "Категория не найдена, показаны все товары"
              : loading
              ? "Загрузка..."
              : `${total} товаров`}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm p-5 sticky top-24">
              <FilterPanel {...filterPanelProps} />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3 mb-5">
              {/* Mobile filter button */}
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M7 8h10M11 12h2" />
                </svg>
                Фильтры
                {activeFiltersCount > 0 && (
                  <span className="w-5 h-5 bg-[#4b8839] text-white text-xs rounded-full flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {/* Sort */}
              <div className="ml-auto relative">
                <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M6 12h12M9 17h6" />
                  </svg>
                </div>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortOption)}
                  className="appearance-none pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 shadow-sm hover:border-[#4b8839] focus:outline-none focus:ring-2 focus:ring-[#4b8839]/30 focus:border-[#4b8839] transition-colors cursor-pointer"
                >
                  {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
                    <option key={key} value={key}>{SORT_LABELS[key]}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Active filter chips */}
            {(priceMinApplied || priceMaxApplied || onlyAvailable || selectedCategory) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedCategory && (
                  <span className="flex items-center gap-1 px-3 py-1 bg-[#4b8839]/10 text-[#4b8839] text-sm rounded-full">
                    {selectedCategory}
                    <button onClick={() => handleCategoryChange(null)} className="ml-1 hover:text-red-500">×</button>
                  </span>
                )}
                {(priceMinApplied || priceMaxApplied) && (
                  <span className="flex items-center gap-1 px-3 py-1 bg-[#4b8839]/10 text-[#4b8839] text-sm rounded-full">
                    {priceMinApplied && `от ${priceMinApplied} ₽`}{priceMinApplied && priceMaxApplied && " "}{priceMaxApplied && `до ${priceMaxApplied} ₽`}
                    <button onClick={() => { setPriceMin(""); setPriceMax(""); setPriceMinApplied(""); setPriceMaxApplied(""); }} className="ml-1 hover:text-red-500">×</button>
                  </span>
                )}
                {onlyAvailable && (
                  <span className="flex items-center gap-1 px-3 py-1 bg-[#4b8839]/10 text-[#4b8839] text-sm rounded-full">
                    В наличии
                    <button onClick={() => setOnlyAvailable(false)} className="ml-1 hover:text-red-500">×</button>
                  </span>
                )}
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4b8839] mx-auto mb-4" />
                  <p className="text-gray-600">Загрузка товаров...</p>
                </div>
              </div>
            )}

            {/* Empty */}
            {!loading && products.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Товары не найдены</h3>
                <p className="text-gray-600 mb-6">Попробуйте изменить параметры фильтра</p>
                <button
                  onClick={resetAllFilters}
                  className="px-6 py-3 bg-[#4b8839] text-white rounded-lg hover:bg-[#3a6b2b] transition-colors"
                >
                  Сбросить фильтры
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

                {totalPages > 1 && (
                  <div className="flex justify-center">
                    <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
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

      {/* Mobile Filter Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-bold">Фильтры</h2>
              <button onClick={() => setMobileFiltersOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <FilterPanel {...filterPanelProps} />
            </div>
            <div className="p-4 border-t">
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full py-3 bg-[#4b8839] text-white rounded-lg font-medium hover:bg-[#3a6b2b] transition-colors"
              >
                Показать {total} товаров
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CatalogPage;
