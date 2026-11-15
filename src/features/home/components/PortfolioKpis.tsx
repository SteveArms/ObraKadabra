import { KpiCard } from "@/components/ui/KpiCard";
import { formatArea, formatCount, formatSoles } from "@/lib/format";
import type { PortfolioTotals } from "../utils";

export function PortfolioKpis({ totals }: { totals: PortfolioTotals }) {
  return (
    <section aria-labelledby="kpis-title" data-testid="portfolio-kpis" className="flex flex-col gap-space-sm">
      <h3 id="kpis-title" className="font-display text-headline-sm">
        Your projects in numbers
      </h3>
      <div className="grid grid-cols-2 gap-space-sm md:grid-cols-4">
        <KpiCard label="Projects" value={formatCount(totals.projects, "project", "projects")} />
        <KpiCard label="Total shell budget" value={formatSoles(totals.totalBudget)} />
        <KpiCard label="Built area" value={formatArea(totals.builtArea)} />
        <KpiCard
          label="Average duration"
          value={totals.averageWeeks === null ? "—" : formatCount(totals.averageWeeks, "week", "weeks")}
        />
      </div>
    </section>
  );
}
