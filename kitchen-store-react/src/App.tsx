import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { fetchCart } from "@/store/slices/cartSlice";
import { fetchFavorites } from "@/store/slices/favoritesSlice";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Home from "@/pages/Home";
import CatalogPage from "@/pages/CatalogPage";
import AddProduct from "@/pages/AddProduct";
import CVPage from '@/pages/CVPage';
import ProductPage from "@/pages/ProductPage";
import CartPage from "@/pages/CartPage";
import FavoritesPage from "@/pages/FavoritesPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import ProfilePage from "@/pages/ProfilePage";
import CheckoutPage from "@/pages/CheckoutPage";
import OrdersPage from "@/pages/OrdersPage";
import OrderDetailsPage from "@/pages/OrderDetailsPage";
import AboutPage from "@/pages/AboutPage";
import ContactsPage from "@/pages/ContactsPage";
import DeliveryPage from "@/pages/DeliveryPage";
import CheckoutSuccessPage from "@/pages/CheckoutSuccessPage";
import FaqPage from "@/pages/FaqPage";
import PrivacyPage from "@/pages/PrivacyPage";
import TermsPage from "@/pages/TermsPage";
import ReturnsPage from "@/pages/ReturnsPage";
import WarrantyPage from "@/pages/WarrantyPage";
import KitchenConstructorPage from "@/pages/KitchenConstructorPage";
import NotFoundPage from "@/pages/NotFoundPage";

const SITE_NAME = "NURRUS";

const upsertMetaByName = (name: string, content: string) => {
  let tag = document.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", name);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
};

const upsertMetaByProperty = (property: string, content: string) => {
  let tag = document.querySelector(`meta[property="${property}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("property", property);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
};

const getPageMeta = (pathname: string) => {
  if (pathname === "/") {
    return {
      title: "Главная",
      description:
        "Интернет-магазин кухонь и техники. Каталог, избранное, корзина и быстрое оформление заказа.",
      noindex: false,
    };
  }
  if (pathname === "/catalog") {
    return {
      title: "Каталог товаров",
      description:
        "Каталог кухонной мебели и техники с актуальными ценами, фильтрами и быстрым добавлением в корзину.",
      noindex: false,
    };
  }
  if (pathname.startsWith("/catalog/")) {
    const categorySlug = pathname.replace("/catalog/", "");
    const categoryMeta: Record<string, { title: string; description: string }> = {
      kuhni: {
        title: "Кухни",
        description: "Каталог кухонь: современные и классические модели с фильтрами, фото и актуальными ценами.",
      },
      stoly: {
        title: "Столы",
        description: "Каталог столов для кухни и столовой: компактные, раскладные и семейные решения.",
      },
      stulya: {
        title: "Стулья",
        description: "Каталог стульев: удобные и стильные модели для кухни, гостиной и столовой зоны.",
      },
    };
    const meta = categoryMeta[categorySlug];
    if (meta) {
      return {
        title: `${meta.title} в каталоге`,
        description: meta.description,
        noindex: false,
      };
    }
    return {
      title: "Категория каталога",
      description: "Подбор товаров по категории в каталоге интернет-магазина NURRUS.",
      noindex: false,
    };
  }
  if (pathname.startsWith("/product/")) {
    return {
      title: "Карточка товара",
      description:
        "Подробная информация о товаре: фото, характеристики, цена и возможность оформить заказ онлайн.",
      noindex: false,
    };
  }
  if (pathname === "/cart") {
    return {
      title: "Корзина",
      description:
        "Проверьте выбранные товары, измените количество и перейдите к оформлению заказа.",
      noindex: true,
    };
  }
  if (pathname === "/checkout") {
    return {
      title: "Оформление заказа",
      description:
        "Заполните контактные данные, выберите доставку и оплату для завершения покупки.",
      noindex: true,
    };
  }
  if (pathname === "/favorites") {
    return {
      title: "Избранное",
      description: "Сохраненные товары для быстрого просмотра и добавления в корзину.",
      noindex: true,
    };
  }
  if (pathname === "/orders") {
    return {
      title: "Мои заказы",
      description:
        "История заказов, текущие статусы доставки и информация по оформленным покупкам.",
      noindex: true,
    };
  }
  if (pathname.startsWith("/order/")) {
    return {
      title: "Детали заказа",
      description:
        "Состав заказа, статус доставки, трек-номер и действия по заказу в личном кабинете.",
      noindex: true,
    };
  }
  if (pathname === "/checkout/success") {
    return {
      title: "Заказ оформлен",
      description:
        "Спасибо за покупку. Информация по оформленному заказу, сроки доставки и полезные действия.",
      noindex: true,
    };
  }
  if (pathname === "/profile") {
    return {
      title: "Профиль",
      description: "Личный кабинет пользователя: данные аккаунта и доступ к заказам.",
      noindex: true,
    };
  }
  if (pathname === "/login") {
    return {
      title: "Вход",
      description:
        "Войдите в аккаунт NURRUS, чтобы управлять заказами и избранными товарами.",
      noindex: true,
    };
  }
  if (pathname === "/register") {
    return {
      title: "Регистрация",
      description:
        "Создайте аккаунт в NURRUS для оформления заказов и сохранения избранного.",
      noindex: true,
    };
  }
  if (pathname === "/about") {
    return {
      title: "О компании",
      description:
        "Информация о NURRUS, подходе к качеству и сервисе для покупателей.",
      noindex: false,
    };
  }
  if (pathname === "/delivery") {
    return {
      title: "Доставка и оплата",
      description:
        "Условия доставки и оплаты заказов по Москве, области и регионам России.",
      noindex: false,
    };
  }
  if (pathname === "/contacts") {
    return {
      title: "Контакты",
      description: "Контактная информация NURRUS: адрес, телефон и способы связи.",
      noindex: false,
    };
  }
  if (pathname === "/kitchen-constructor") {
    return {
      title: "Конструктор кухни",
      description:
        "Онлайн-конструктор кухни: выберите планировку, материалы и технику, получите предварительный расчет и отправьте проект.",
      noindex: false,
    };
  }
  if (pathname === "/faq") {
    return {
      title: "FAQ",
      description: "Ответы на частые вопросы по заказам, доставке, оплате, возврату и гарантии.",
      noindex: false,
    };
  }
  if (pathname === "/privacy") {
    return {
      title: "Политика конфиденциальности",
      description: "Правила обработки персональных данных пользователей интернет-магазина NURRUS.",
      noindex: false,
    };
  }
  if (pathname === "/terms") {
    return {
      title: "Пользовательское соглашение",
      description: "Условия использования сайта и оформления заказов в интернет-магазине NURRUS.",
      noindex: false,
    };
  }
  if (pathname === "/returns") {
    return {
      title: "Возврат и обмен",
      description: "Условия возврата и обмена товаров, порядок обращения и сроки рассмотрения заявок.",
      noindex: false,
    };
  }
  if (pathname === "/warranty") {
    return {
      title: "Гарантия",
      description: "Гарантийные условия на товары NURRUS и порядок обращения по гарантийным случаям.",
      noindex: false,
    };
  }
  if (pathname === "/add") {
    return {
      title: "Добавление товара",
      description: "Форма добавления нового товара в каталог магазина.",
      noindex: true,
    };
  }
  if (pathname === "/cv") {
    return {
      title: "CV",
      description: "Резюме и профессиональная информация.",
      noindex: false,
    };
  }
  return {
    title: "Страница не найдена",
    description:
      "Запрошенная страница не найдена. Вернитесь в каталог и продолжите покупки.",
    noindex: true,
  };
};

function AppContent() {
  const dispatch = useAppDispatch();
  const location = useLocation();

  // Загружаем корзину и избранное при запуске приложения
  useEffect(() => {
    dispatch(fetchCart());
    dispatch(fetchFavorites());
  }, [dispatch]);

  useEffect(() => {
    const { title, description, noindex } = getPageMeta(location.pathname);
    const fullTitle = `${title} | ${SITE_NAME}`;
    const currentUrl = `${window.location.origin}${location.pathname}${location.search}`;

    document.title = fullTitle;
    upsertMetaByName("description", description);
    upsertMetaByName("robots", noindex ? "noindex, nofollow" : "index, follow");
    upsertMetaByProperty("og:title", fullTitle);
    upsertMetaByProperty("og:description", description);
    upsertMetaByProperty("og:type", "website");
    upsertMetaByProperty("og:url", currentUrl);
    upsertMetaByName("twitter:card", "summary_large_image");
    upsertMetaByName("twitter:title", fullTitle);
    upsertMetaByName("twitter:description", description);
  }, [location.pathname, location.search]);

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/catalog/:categorySlug" element={<CatalogPage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/order/:id" element={<OrderDetailsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contacts" element={<ContactsPage />} />
          <Route path="/kitchen-constructor" element={<KitchenConstructorPage />} />
          <Route path="/delivery" element={<DeliveryPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/returns" element={<ReturnsPage />} />
          <Route path="/warranty" element={<WarrantyPage />} />
          <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
          <Route path="/add" element={<AddProduct />} />
          <Route path="/cv" element={<CVPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
