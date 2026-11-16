import { PageSection } from "@/components/layout/PageSection";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { demoProjects } from "@/lib/projects";
import { DemoCard } from "./DemoCard";

export function DemoGallery() {
  return (
    <PageSection labelledBy="demos-title">
      <SectionHeading
        id="demos-title"
        overline="Interactive demos"
        icon="touch_app"
        title="Try a ready-made example"
        description="Explore without uploading a plan: the 3D model, material quantities and every construction stage."
      />
      <div className="grid grid-cols-1 gap-space-lg lg:grid-cols-2">
        {demoProjects().map((demo) => (
          <DemoCard key={demo.id} demo={demo} />
        ))}
      </div>
    </PageSection>
  );
}
