import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  createdAt: string;
}

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"profile" | "orders" | "settings">("profile");

  useEffect(() => {
    // Проверка авторизации
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData || userData === "undefined") {
      navigate("/login");
      return;
    }

    // Парсим данные пользователя
    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    } catch (error) {
      console.error("Ошибка парсинга данных пользователя:", error);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      navigate("/login");
      return;
    }

    setLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Загрузка...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Личный кабинет</h1>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex flex-col items-center mb-6">
                  <div className="w-20 h-20 bg-[#4b8839] rounded-full flex items-center justify-center text-white text-2xl font-bold mb-3">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <h2 className="text-xl font-semibold text-center">{user.name}</h2>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>

                <nav className="space-y-2">
                  <button
                    onClick={() => setActiveTab("profile")}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeTab === "profile"
                      ? "bg-[#4b8839]/10 text-[#4b8839]"
                      : "hover:bg-gray-50"
                      }`}
                  >
                    Профиль
                  </button>
                  <Link
                    to="/orders"
                    className="block w-full text-left px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Мои заказы
                  </Link>
                  <Link
                    to="/favorites"
                    className="block w-full text-left px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Избранное
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 rounded-lg hover:bg-[#4b8839]/10 text-[#4b8839] transition-colors"
                  >
                    Выйти
                  </button>
                </nav>
              </div>
            </div>

            {/* Content */}
            <div className="md:col-span-3">
              {activeTab === "profile" && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-2xl font-bold mb-6">Личные данные</h2>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Имя
                      </label>
                      <input
                        type="text"
                        value={user.name}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={user.email}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Телефон
                      </label>
                      <input
                        type="tel"
                        value={user.phone || ""}
                        placeholder="Не указан"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Адрес доставки
                      </label>
                      <textarea
                        value={user.address || ""}
                        placeholder="Не указан"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>

                    <div className="flex gap-4">
                      <button className="px-6 py-2 bg-[#4b8839] text-white rounded-lg hover:bg-[#4b8839] transition-colors">
                        Сохранить изменения
                      </button>
                      <button className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        Отмена
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

