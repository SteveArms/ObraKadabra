import { Tabs } from "@/components/ui/Tabs";

const TABS = [
  { id: "summary", label: "Summary", note: "Stage, progress and cost for the selected week." },
  { id: "cost", label: "Cost", note: "S-curve and cost per work item." },
  { id: "materials", label: "Materials", note: "What to buy each week." },
  { id: "gantt", label: "Gantt", note: "Stage schedule week by week." },
];

function PanelSkeleton({ note }: { note: string }) {
  return (
    <div aria-busy="true" className="flex flex-col gap-space-sm">
      <p className="text-body-md text-on-surface-variant">{note} Available once the schedule is ready.</p>
      {[0, 1, 2].map((row) => (
        <div key={row} className="h-16 rounded-lg bg-surface-container motion-safe:animate-pulse" />
      ))}
    </div>
  );
}

// TODO: fill each tab with schedule, cost and material data in phase 3
export function WorkspacePanel() {
  return (
    <aside aria-label="Project panel" data-testid="workspace-panel" className="flex flex-col gap-space-md bg-surface-container-low p-space-sm lg:p-space-md">
      <Tabs label="Project data" items={TABS.map((tab) => ({ id: tab.id, label: tab.label, content: <PanelSkeleton note={tab.note} /> }))} />
    </aside>
  );
}
