import React from "react";

const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-6">Пользовательское соглашение</h1>
        <div className="bg-white rounded-lg shadow p-8 space-y-5 text-gray-700">
          <p>
            Настоящее соглашение регулирует использование сайта, оформление заказов и взаимодействие пользователя с
            интернет-магазином NURRUS.
          </p>
          <h2 className="text-2xl font-bold text-gray-900">Оформление заказа</h2>
          <p>Пользователь обязуется указывать корректные контактные данные и адрес доставки.</p>
          <h2 className="text-2xl font-bold text-gray-900">Цены и наличие</h2>
          <p>Цены и наличие могут меняться. Итоговые условия фиксируются в момент подтверждения заказа.</p>
          <h2 className="text-2xl font-bold text-gray-900">Ответственность сторон</h2>
          <p>Магазин несет ответственность в пределах действующего законодательства РФ и условий продажи.</p>
          <h2 className="text-2xl font-bold text-gray-900">Поддержка</h2>
          <p>По спорным вопросам: info@kitchenstore.ru, +7 (999) 123-45-67.</p>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
