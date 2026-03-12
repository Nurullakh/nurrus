"use client";

import React from "react";

const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-6">Политика конфиденциальности</h1>
        <div className="bg-white rounded-lg shadow p-8 space-y-5 text-gray-700">
          <p>
            Мы обрабатываем персональные данные только для выполнения заказов, обратной связи и улучшения сервиса.
            Используя сайт, вы соглашаетесь с этой политикой.
          </p>
          <h2 className="text-2xl font-bold text-gray-900">Какие данные мы собираем</h2>
          <p>Имя, email, телефон, адрес доставки, история заказов и технические данные сессии.</p>
          <h2 className="text-2xl font-bold text-gray-900">Для чего используем</h2>
          <p>Оформление и доставка заказов, поддержка, уведомления о статусах и предотвращение злоупотреблений.</p>
          <h2 className="text-2xl font-bold text-gray-900">Передача третьим лицам</h2>
          <p>Передаем только необходимый минимум логистическим и платежным партнерам для исполнения заказа.</p>
          <h2 className="text-2xl font-bold text-gray-900">Контакты по персональным данным</h2>
          <p>По вопросам обработки данных: info@kitchenstore.ru, +7 (999) 123-45-67.</p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
