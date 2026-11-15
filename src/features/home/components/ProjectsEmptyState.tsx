import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";

export function ProjectsEmptyState() {
  return (
    <Card data-testid="projects-empty" className="flex flex-col items-start gap-space-sm">
      <Icon name="folder_open" size={32} className="text-primary" />
      <div className="flex flex-col gap-1">
        <p className="font-display text-headline-sm">No projects yet</p>
        <p className="max-w-[60ch] text-body-md text-pretty text-on-surface-variant">
          Upload a floor plan to see its 3D model, budget and schedule here. Or open one of the demos above.
        </p>
      </div>
      <Link href="/subir" className={buttonClasses("primary")}>
        <Icon name="upload_file" />
        Upload a plan
      </Link>
    </Card>
  );
}
