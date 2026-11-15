"use client";

import { useMemo } from "react";
import { formatSoles } from "@/lib/format";
import { costCurve, plannedCostAt } from "@/lib/schedule";
import type { ActualProgress, Schedule } from "@/schemas/schedule";
import { costByItem } from "../utils";
import { CostByItemList } from "./CostByItemList";
import { SCurve } from "./SCurve";

export function CostPanel({ schedule, week, progress }: { schedule: Schedule; week: number; progress?: ActualProgress }) {
  const points = useMemo(() => costCurve(schedule, progress), [schedule, progress]);
  const items = useMemo(() => costByItem(schedule, week), [schedule, week]);
  return (
    <div className="flex flex-col gap-space-md">
      <dl className="grid grid-cols-2 gap-space-sm">
        <div>
          <dt className="text-body-sm text-on-surface-variant">Planned to date</dt>
          <dd className="font-mono text-label-numeric-lg tabular-nums">{formatSoles(plannedCostAt(schedule, week))}</dd>
        </div>
        <div>
          <dt className="text-body-sm text-on-surface-variant">Shell budget</dt>
          <dd data-testid="cost-total" className="font-mono text-label-numeric-lg tabular-nums">
            {formatSoles(schedule.totalCost)}
          </dd>
        </div>
      </dl>
      <SCurve points={points} week={week} total={schedule.totalCost} />
      <CostByItemList items={items} />
    </div>
  );
}
