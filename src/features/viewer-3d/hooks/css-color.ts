// WebGL cannot use CSS variables, so materials read the resolved design token from the document
export function cssColor(variable: string): string {
  if (typeof document === "undefined") return "#9aa0a6";
  return getComputedStyle(document.documentElement).getPropertyValue(variable).trim() || "#9aa0a6";
}
