"use client";

import React, { useMemo, useState } from "react";
import { useCreateContactRequestMutation } from "@/features/contacts/api/contacts-api";
import { formatPrice } from "@/shared/lib/price/format-price";

type LayoutType = "straight" | "l_shape" | "u_shape" | "island";
type FacadeType = "laminate" | "mdf" | "acrylic" | "veneer";
type CountertopType = "chipboard" | "compact" | "quartz" | "stone";

const layoutLabels: Record<LayoutType, string> = {
  straight: "Прямая",
  l_shape: "Угловая",
  u_shape: "П-образная",
  island: "С островом",
};

const facadeLabels: Record<FacadeType, string> = {
  laminate: "ЛДСП / эконом",
  mdf: "МДФ пленка",
  acrylic: "Акрил",
  veneer: "Шпон / премиум",
};

const countertopLabels: Record<CountertopType, string> = {
  chipboard: "ЛДСП",
  compact: "Компакт-плита",
  quartz: "Кварц",
  stone: "Натуральный камень",
};

const KitchenConstructorPage: React.FC = () => {
  const [layout, setLayout] = useState<LayoutType>("straight");
  const [facade, setFacade] = useState<FacadeType>("mdf");
  const [countertop, setCountertop] = useState<CountertopType>("compact");
  const [width, setWidth] = useState<number>(3.2);
  const [depth, setDepth] = useState<number>(2.6);
  const [height, setHeight] = useState<number>(2.7);
  const [hasFridge, setHasFridge] = useState(true);
  const [hasOven, setHasOven] = useState(true);
  const [hasDishwasher, setHasDishwasher] = useState(true);
  const [hasHob, setHasHob] = useState(true);
  const [hasHood, setHasHood] = useState(true);
  const [budget, setBudget] = useState("200000");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [comment, setComment] = useState("");
  const [successText, setSuccessText] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [createContactRequest, { isLoading }] = useCreateContactRequestMutation();

  const calculations = useMemo(() => {
    const normalizedWidth = Math.max(1.6, width);
    const normalizedDepth = Math.max(1.6, depth);
    const area = normalizedWidth * normalizedDepth;

    const runLengthByLayout: Record<LayoutType, number> = {
      straight: normalizedWidth,
      l_shape: normalizedWidth + normalizedDepth - 0.6,
      u_shape: normalizedWidth * 2 + normalizedDepth - 1.2,
      island: normalizedWidth + normalizedDepth + 1.8,
    };

    const baseRateByLayout: Record<LayoutType, number> = {
      straight: 55000,
      l_shape: 62000,
      u_shape: 68000,
      island: 72000,
    };

    const facadeFactorByType: Record<FacadeType, number> = {
      laminate: 1,
      mdf: 1.2,
      acrylic: 1.35,
      veneer: 1.55,
    };

    const countertopFactorByType: Record<CountertopType, number> = {
      chipboard: 1,
      compact: 1.2,
      quartz: 1.35,
      stone: 1.6,
    };

    const appliancePrice =
      (hasFridge ? 52000 : 0) +
      (hasOven ? 34000 : 0) +
      (hasDishwasher ? 39000 : 0) +
      (hasHob ? 26000 : 0) +
      (hasHood ? 18000 : 0);

    const runLength = runLengthByLayout[layout];
    const baseKitchenCost = runLength * baseRateByLayout[layout];
    const materializedCost =
      baseKitchenCost * facadeFactorByType[facade] * countertopFactorByType[countertop];
    const installCost = materializedCost * 0.12;
    const total = Math.round(materializedCost + appliancePrice + installCost);

    const budgetValue = Number(budget) || 0;
    const budgetDiff = budgetValue - total;

    return {
      area,
      runLength,
      baseKitchenCost,
      appliancePrice,
      installCost,
      total,
      budgetDiff,
    };
  }, [layout, facade, countertop, width, depth, hasFridge, hasOven, hasDishwasher, hasHob, hasHood, budget]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setSuccessText("");

    try {
      const message = [
        "Новая заявка из конструктора кухни",
        "",
        `Планировка: ${layoutLabels[layout]}`,
        `Размеры помещения: ${width.toFixed(1)} x ${depth.toFixed(1)} x ${height.toFixed(1)} м`,
        `Фасады: ${facadeLabels[facade]}`,
        `Столешница: ${countertopLabels[countertop]}`,
        `Техника:`,
        `- Холодильник: ${hasFridge ? "да" : "нет"}`,
        `- Духовой шкаф: ${hasOven ? "да" : "нет"}`,
        `- Посудомойка: ${hasDishwasher ? "да" : "нет"}`,
        `- Варочная панель: ${hasHob ? "да" : "нет"}`,
        `- Вытяжка: ${hasHood ? "да" : "нет"}`,
        "",
        `Оценка стоимости: ${formatPrice(calculations.total)} ₽`,
        `Комментарий клиента: ${comment || "-"}`,
      ].join("\n");

      await createContactRequest({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        subject: "Заявка: Конструктор кухни",
        message,
      }).unwrap();

      setSuccessText("Заявка отправлена. Менеджер свяжется с вами для точного расчета.");
      setComment("");
    } catch {
      setSubmitError("Не удалось отправить заявку. Проверьте данные и повторите.");
    }
  };

  const budgetValue = Number(budget) || 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Конструктор кухни</h1>
          <p className="text-gray-600">
            Выберите планировку, материалы и технику. Получите оценку бюджета и отправьте проект менеджеру.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4">1. Параметры помещения</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className="block">
                  <span className="text-sm text-gray-600">Ширина, м</span>
                  <input
                    type="number"
                    min={1.6}
                    step={0.1}
                    value={width}
                    onChange={(e) => setWidth(Number(e.target.value) || 1.6)}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </label>
                <label className="block">
                  <span className="text-sm text-gray-600">Глубина, м</span>
                  <input
                    type="number"
                    min={1.6}
                    step={0.1}
                    value={depth}
                    onChange={(e) => setDepth(Number(e.target.value) || 1.6)}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </label>
                <label className="block">
                  <span className="text-sm text-gray-600">Высота, м</span>
                  <input
                    type="number"
                    min={2}
                    step={0.1}
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value) || 2)}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </label>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4">2. Конфигурация</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-sm text-gray-600">Планировка</span>
                  <select
                    value={layout}
                    onChange={(e) => setLayout(e.target.value as LayoutType)}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="straight">Прямая</option>
                    <option value="l_shape">Угловая</option>
                    <option value="u_shape">П-образная</option>
                    <option value="island">С островом</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm text-gray-600">Фасады</span>
                  <select
                    value={facade}
                    onChange={(e) => setFacade(e.target.value as FacadeType)}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="laminate">ЛДСП / эконом</option>
                    <option value="mdf">МДФ пленка</option>
                    <option value="acrylic">Акрил</option>
                    <option value="veneer">Шпон / премиум</option>
                  </select>
                </label>
                <label className="block md:col-span-2">
                  <span className="text-sm text-gray-600">Столешница</span>
                  <select
                    value={countertop}
                    onChange={(e) => setCountertop(e.target.value as CountertopType)}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="chipboard">ЛДСП</option>
                    <option value="compact">Компакт-плита</option>
                    <option value="quartz">Кварц</option>
                    <option value="stone">Натуральный камень</option>
                  </select>
                </label>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4">3. Техника</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="flex items-center gap-3 border rounded-lg p-3">
                  <input type="checkbox" checked={hasFridge} onChange={(e) => setHasFridge(e.target.checked)} />
                  <span>Холодильник</span>
                </label>
                <label className="flex items-center gap-3 border rounded-lg p-3">
                  <input type="checkbox" checked={hasOven} onChange={(e) => setHasOven(e.target.checked)} />
                  <span>Духовой шкаф</span>
                </label>
                <label className="flex items-center gap-3 border rounded-lg p-3">
                  <input
                    type="checkbox"
                    checked={hasDishwasher}
                    onChange={(e) => setHasDishwasher(e.target.checked)}
                  />
                  <span>Посудомоечная машина</span>
                </label>
                <label className="flex items-center gap-3 border rounded-lg p-3">
                  <input type="checkbox" checked={hasHob} onChange={(e) => setHasHob(e.target.checked)} />
                  <span>Варочная панель</span>
                </label>
                <label className="flex items-center gap-3 border rounded-lg p-3 md:col-span-2">
                  <input type="checkbox" checked={hasHood} onChange={(e) => setHasHood(e.target.checked)} />
                  <span>Вытяжка</span>
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4">Оценка проекта</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Площадь помещения</span>
                  <span>{calculations.area.toFixed(1)} м²</span>
                </div>
                <div className="flex justify-between">
                  <span>Длина кухни</span>
                  <span>{calculations.runLength.toFixed(1)} м</span>
                </div>
                <div className="flex justify-between">
                  <span>База кухни</span>
                  <span>{formatPrice(Math.round(calculations.baseKitchenCost))} ₽</span>
                </div>
                <div className="flex justify-between">
                  <span>Техника</span>
                  <span>{formatPrice(calculations.appliancePrice)} ₽</span>
                </div>
                <div className="flex justify-between">
                  <span>Сборка и монтаж</span>
                  <span>{formatPrice(Math.round(calculations.installCost))} ₽</span>
                </div>
                <div className="border-t pt-2 flex justify-between text-xl font-bold">
                  <span>Итого</span>
                  <span>{formatPrice(calculations.total)} ₽</span>
                </div>
              </div>

              <div className="mt-5">
                <label className="block text-sm text-gray-600 mb-1">Ваш бюджет, ₽</label>
                <input
                  type="number"
                  min={0}
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <p className={`text-sm mt-2 ${calculations.budgetDiff >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {budgetValue > 0
                    ? calculations.budgetDiff >= 0
                      ? `Укладываемся в бюджет, запас ${formatPrice(calculations.budgetDiff)} ₽`
                      : `Превышение бюджета на ${formatPrice(Math.abs(calculations.budgetDiff))} ₽`
                    : "Укажите бюджет для сравнения"}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4">Отправить проект</h2>
              {successText && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                  {successText}
                </div>
              )}
              {submitError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {submitError}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Имя"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+7 (999) 123-45-67"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  placeholder="Комментарий к проекту"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-[#4b8839] text-white rounded-lg font-semibold disabled:opacity-60"
                >
                  {isLoading ? "Отправка..." : "Отправить на расчет"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KitchenConstructorPage;
