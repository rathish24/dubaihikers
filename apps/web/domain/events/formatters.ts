const currencyFormatter = new Intl.NumberFormat("en-AE", {
  style: "currency",
  currency: "AED",
  currencyDisplay: "code",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "2-digit",
  month: "short",
  timeZone: "UTC",
});

export function formatMoney(amount: number): string {
  return currencyFormatter.format(amount);
}

export function formatEventDate(date: string): string {
  return dateFormatter.format(new Date(`${date}T00:00:00Z`));
}

export function splitEventDate(date: string): { weekday: string; dayMonth: string } {
  const parts = dateFormatter.formatToParts(new Date(date + "T00:00:00Z"));
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "";
  return { weekday: value("weekday"), dayMonth: (value("day") + " " + value("month")).trim() };
}
