import { Tabs } from "@/components/ui/Tabs";
import { CostPanel, MaterialsPanel } from "@/features/budget";
import { GanttPanel, SummaryPanel } from "@/features/schedule";
import type { ElementStatus, Schedule } from "@/schemas/schedule";

type WorkspacePanelProps = {
  schedule: Schedule;
  week: number;
  statuses: Record<string, ElementStatus>;
  projectName: string;
};

export function WorkspacePanel({ schedule, week, statuses, projectName }: WorkspacePanelProps) {
  const items = [
    { id: "summary", label: "Summary", content: <SummaryPanel schedule={schedule} week={week} statuses={statuses} /> },
    { id: "cost", label: "Cost", content: <CostPanel schedule={schedule} week={week} /> },
    { id: "materials", label: "Materials", content: <MaterialsPanel schedule={schedule} week={week} projectName={projectName} /> },
    { id: "gantt", label: "Gantt", content: <GanttPanel schedule={schedule} week={week} /> },
  ];
  return (
    <aside aria-label="Project panel" data-testid="workspace-panel" className="flex h-full flex-col gap-space-md bg-surface-container-low p-space-sm lg:p-space-md">
      <Tabs label="Project data" items={items} />
    </aside>
  );
}
