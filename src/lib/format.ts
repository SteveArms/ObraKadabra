const integer = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const plural = new Intl.PluralRules("en-US");
const percent = new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 1 });
const oneDecimal = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

export function formatSoles(amount: number): string {
  return `S/ ${integer.format(Math.round(amount))}`;
}

export function formatArea(squareMeters: number): string {
  return `${oneDecimal.format(squareMeters)} m²`;
}

export function formatCount(value: number, singular: string, pluralForm: string): string {
  return `${integer.format(value)} ${plural.select(value) === "one" ? singular : pluralForm}`;
}

export function formatPercent(ratio: number): string {
  return percent.format(ratio);
}

const meters = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function formatMeters(value: number): string {
  return `${meters.format(value)} m`;
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

const megabytes = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

export function formatBytes(bytes: number): string {
  return bytes < 1024 * 1024 ? `${integer.format(Math.ceil(bytes / 1024))} KB` : `${megabytes.format(bytes / 1024 / 1024)} MB`;
}
