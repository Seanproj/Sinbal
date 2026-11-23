import type { Currency, Shoe } from "./schema";

const fmt: Record<Currency, Intl.NumberFormat> = {
  EUR: new Intl.NumberFormat("ko-KR", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }),
  KRW: new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW", maximumFractionDigits: 0 }),
};

export function formatMoney(amount: number, currency: Currency): string {
  return fmt[currency].format(amount);
}

export function priceOf(shoe: Shoe, currency: Currency): number {
  return currency === "EUR" ? shoe.price.eur : shoe.price.krw;
}

export function formatPrice(shoe: Shoe, currency: Currency): string {
  return formatMoney(priceOf(shoe, currency), currency);
}

export const fullName = (s: Shoe) => `${s.brand} ${s.model}`;
