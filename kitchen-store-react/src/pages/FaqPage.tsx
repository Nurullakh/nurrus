import React from "react";
import { Link } from "react-router-dom";

const faqItems = [
  {
    question: "Можно ли изменить адрес доставки после оформления заказа?",
    answer:
      "Да, до передачи заказа в доставку адрес можно изменить через поддержку по телефону или через форму на странице контактов.",
  },
  {
    question: "Как отследить заказ?",
    answer:
      "После оформления заказ отображается в личном кабинете, а при передаче в доставку там появится трек-номер и статус.",
  },
  {
    question: "Что делать, если товар пришел поврежденным?",
    answer:
      "Не принимайте поврежденный товар, зафиксируйте проблему у курьера и сразу свяжитесь с поддержкой — мы оформим замену или возврат.",
  },
  {
    question: "Можно ли оформить самовывоз?",
    answer:
      "Да, при оформлении выберите способ доставки «Самовывоз». После готовности заказа отправим уведомление.",
  },
  {
    question: "Как работает возврат и обмен?",
    answer:
      "Условия возврата зависят от категории товара и состояния упаковки. Подробные правила описаны на странице возврата.",
  },
  {
    question: "Есть ли гарантия на мебель и технику?",
    answer:
      "Да, на все товары действует гарантия производителя. Гарантийные сроки и условия смотрите на странице гарантии.",
  },
];

const FaqPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-3">FAQ</h1>
        <p className="text-gray-600 mb-8">
          Частые вопросы по заказам, доставке, оплате, возврату и гарантии.
        </p>

        <div className="bg-white rounded-lg shadow divide-y">
          {faqItems.map((item) => (
            <details key={item.question} className="p-6">
              <summary className="font-semibold cursor-pointer">{item.question}</summary>
              <p className="mt-3 text-gray-600">{item.answer}</p>
            </details>
          ))}
        </div>

        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Нужна помощь по заказу?</h2>
          <div className="flex flex-wrap gap-3">
            <Link to="/contacts" className="px-5 py-3 bg-[#4b8839] text-white rounded-lg font-semibold">
              Написать в поддержку
            </Link>
            <a href="tel:+79991234567" className="px-5 py-3 border border-gray-300 rounded-lg font-semibold">
              +7 (999) 123-45-67
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaqPage;
