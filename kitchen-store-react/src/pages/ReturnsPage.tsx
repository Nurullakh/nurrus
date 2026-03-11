import React from "react";

const ReturnsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-6">Возврат и обмен</h1>
        <div className="bg-white rounded-lg shadow p-8 space-y-5 text-gray-700">
          <p>
            Мы соблюдаем правила возврата и обмена в соответствии с законодательством РФ. Ниже базовые условия и
            порядок обращения.
          </p>
          <h2 className="text-2xl font-bold text-gray-900">Сроки</h2>
          <p>Заявку на возврат или обмен необходимо подать в разумный срок после получения товара.</p>
          <h2 className="text-2xl font-bold text-gray-900">Состояние товара</h2>
          <p>Для возврата требуется сохранить товарный вид, комплектность, документы и упаковку (если применимо).</p>
          <h2 className="text-2xl font-bold text-gray-900">Товар с дефектом</h2>
          <p>Если обнаружен брак, свяжитесь с поддержкой — согласуем замену, ремонт или возврат денежных средств.</p>
          <h2 className="text-2xl font-bold text-gray-900">Как оформить</h2>
          <p>Отправьте запрос через страницу контактов или позвоните по телефону +7 (999) 123-45-67.</p>
        </div>
      </div>
    </div>
  );
};

export default ReturnsPage;
