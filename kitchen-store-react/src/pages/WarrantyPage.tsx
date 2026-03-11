import React from "react";

const WarrantyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-6">Гарантия</h1>
        <div className="bg-white rounded-lg shadow p-8 space-y-5 text-gray-700">
          <p>
            На товары NURRUS действует гарантия производителя. Срок зависит от категории товара и указывается в
            документах к заказу.
          </p>
          <h2 className="text-2xl font-bold text-gray-900">Что покрывает гарантия</h2>
          <p>Производственные дефекты материалов, комплектующих и сборки при соблюдении условий эксплуатации.</p>
          <h2 className="text-2xl font-bold text-gray-900">Что не покрывает гарантия</h2>
          <p>Повреждения из-за неправильной сборки, эксплуатации, самостоятельного ремонта и внешних воздействий.</p>
          <h2 className="text-2xl font-bold text-gray-900">Как обратиться по гарантии</h2>
          <p>Подготовьте номер заказа, фото/видео дефекта и отправьте обращение через контакты.</p>
          <h2 className="text-2xl font-bold text-gray-900">Срок рассмотрения</h2>
          <p>Первичный ответ в течение 1 рабочего дня, полное решение — по результатам диагностики.</p>
        </div>
      </div>
    </div>
  );
};

export default WarrantyPage;
