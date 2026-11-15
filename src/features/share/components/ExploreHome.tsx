import { TimelineTrack } from "@/features/schedule";
import { Viewer } from "@/features/viewer-3d";
import type { Project } from "@/schemas/project";
import type { Schedule } from "@/schemas/schedule";

// Read-only: the compact viewer has no toolbar or element details, and the slider only changes what is shown
export function ExploreHome({ project, schedule, glbUrl }: { project: Project; schedule: Schedule; glbUrl?: string }) {
  return (
    <section aria-labelledby="explore-home" className="flex flex-col gap-space-md rounded-xl bg-surface-container-lowest p-space-md shadow-sm md:p-space-lg">
      <div className="flex flex-col gap-1">
        <h2 id="explore-home" className="font-display text-headline-sm">
          Explore your home in 3D
        </h2>
        <p className="text-body-md text-pretty text-on-surface-variant">Drag to turn the house around. Slide the timeline to watch it go up, week by week.</p>
      </div>
      <Viewer plan={project.floorPlan} glbUrl={glbUrl} compact className="h-[50dvh] min-h-72 rounded-lg md:h-[32rem]" />
      <div className="rounded-lg bg-surface-container-low px-space-md pb-space-sm">
        <TimelineTrack schedule={schedule} />
      </div>
    </section>
  );
}
