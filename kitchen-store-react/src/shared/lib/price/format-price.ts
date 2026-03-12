const priceFormatter = new Intl.NumberFormat("ru-RU", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export const formatPrice = (value: number | string | null | undefined): string => {
  const numericValue =
    typeof value === "string" ? Number(value.replace(",", ".")) : value;

  if (!Number.isFinite(numericValue)) {
    return "0";
  }

  return priceFormatter.format(Math.round(Number(numericValue)));
};
