"use client";

import React, { useState } from "react";
import { Link, useNavigate } from "@/next/routerShim";
import { useRegisterMutation } from "@/features/auth/api/auth-api";
import { extractApiErrorMessage } from "@/shared/lib/error/extract-api-error";

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    agreeToTerms: false,
  });
  const [error, setError] = useState("");
  const [register, { isLoading }] = useRegisterMutation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Валидация
    if (formData.password !== formData.confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    if (formData.password.length < 6) {
      setError("Пароль должен содержать минимум 6 символов");
      return;
    }

    if (!formData.agreeToTerms) {
      setError("Необходимо согласиться с условиями использования");
      return;
    }

    try {
      const data = await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        ...(formData.phone.trim() && { phone: formData.phone.trim() }),
      }).unwrap();

      // Сохраняем токен и пользователя
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/profile");
    } catch (err: unknown) {
      const message = extractApiErrorMessage(err, "Ошибка соединения с сервером");
      setError(message);
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <Link to="/" className="flex justify-center">
            <div className="flex flex-col items-center">
              <span className="text-4xl font-black text-[#4b8839] leading-none">
                NURRUS
              </span>
            </div>
          </Link>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Создайте аккаунт
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Уже есть аккаунт?{" "}
            <Link
              to="/login"
              className="font-medium text-[#4b8839] hover:text-[#4b8839]"
            >
              Войдите
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Имя
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#4b8839] focus:border-[#4b8839] sm:text-sm"
                placeholder="Иван Иванов"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#4b8839] focus:border-[#4b8839] sm:text-sm"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Телефон
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#4b8839] focus:border-[#4b8839] sm:text-sm"
                placeholder="+7 (999) 123-45-67"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Пароль
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#4b8839] focus:border-[#4b8839] sm:text-sm"
                placeholder="Минимум 6 символов"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Подтверждение пароля
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#4b8839] focus:border-[#4b8839] sm:text-sm"
                placeholder="Повторите пароль"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-[#4b8839]/10 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-[#4b8839]">{error}</h3>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center">
            <input
              id="agreeToTerms"
              name="agreeToTerms"
              type="checkbox"
              checked={formData.agreeToTerms}
              onChange={handleChange}
              className="h-4 w-4 text-[#4b8839] focus:ring-[#4b8839] border-gray-300 rounded"
            />
            <label
              htmlFor="agreeToTerms"
              className="ml-2 block text-sm text-gray-900"
            >
              Я согласен с{" "}
              <a href="#" className="text-[#4b8839] hover:text-[#4b8839]">
                условиями использования
              </a>{" "}
              и{" "}
              <a href="#" className="text-[#4b8839] hover:text-[#4b8839]">
                политикой конфиденциальности
              </a>
            </label>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#4b8839] hover:bg-[#4b8839] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4b8839] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Регистрация..." : "Зарегистрироваться"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;

