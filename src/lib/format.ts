const integer = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const plural = new Intl.PluralRules("en-US");
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
