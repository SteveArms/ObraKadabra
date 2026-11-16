// Intl formatters are built on first use: creating them all while the page loads costs a phone ~100 ms of blocked main thread
function lazy<T>(create: () => T): () => T {
  let value: T | undefined;
  return () => (value ??= create());
}

const integer = lazy(() => new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }));
const plural = lazy(() => new Intl.PluralRules("en-US"));
const percent = lazy(() => new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 1 }));
const wholePercent = lazy(() => new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 0 }));
const oneDecimal = lazy(() => new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }));
const meters = lazy(() => new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
// Plan dates are calendar days without a time zone, so they are formatted in UTC to never shift by one day
const day = lazy(() => new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }));
const month = lazy(() => new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric", timeZone: "UTC" }));

export function formatSoles(amount: number): string {
  return `S/ ${integer().format(Math.round(amount))}`;
}

export function formatArea(squareMeters: number): string {
  return `${oneDecimal().format(squareMeters)} m²`;
}

export function formatCount(value: number, singular: string, pluralForm: string): string {
  return `${integer().format(value)} ${plural().select(value) === "one" ? singular : pluralForm}`;
}

export function formatPercent(ratio: number): string {
  return percent().format(ratio);
}

// Floored so a house at 99.6% never reads as 100% before it is finished
export function formatWholePercent(ratio: number): string {
  return wholePercent().format(Math.floor(ratio * 100) / 100);
}

export function formatMeters(value: number): string {
  return `${meters().format(value)} m`;
}

export function formatScale(scale: number): string {
  return `1 px = ${scale.toFixed(4)} m`;
}

// Accepts "8", "8.00" and the comma decimals common in Peru ("8,00")
export function parseMeters(text: string): number | null {
  const value = Number(text.trim().replace(",", "."));
  return text.trim() !== "" && Number.isFinite(value) && value > 0 ? value : null;
}

// Variance from plan: "+S/ 140" ahead, "−S/ 300" behind (a real minus sign, not a hyphen)
export function formatSignedSoles(amount: number): string {
  const rounded = Math.round(amount);
  if (rounded === 0) return formatSoles(0);
  return `${rounded > 0 ? "+" : "−"}${formatSoles(Math.abs(rounded))}`;
}

export function formatBytes(bytes: number): string {
  return bytes < 1024 * 1024 ? `${integer().format(Math.ceil(bytes / 1024))} KB` : `${oneDecimal().format(bytes / 1024 / 1024)} MB`;
}

export function formatDate(isoDate: string): string {
  return day().format(new Date(`${isoDate.slice(0, 10)}T00:00:00Z`));
}

export function formatMonth(isoDate: string): string {
  return month().format(new Date(`${isoDate.slice(0, 10)}T00:00:00Z`));
}
