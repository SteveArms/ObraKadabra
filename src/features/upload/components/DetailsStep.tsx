import type { DetailsErrors } from "../utils";
import { FloorHeightField, LevelsField, NameField, RoofTypeField } from "./DetailsFields";
import { NextStepHint } from "./NextStepHint";

export function DetailsStep({ errors }: { errors: DetailsErrors }) {
  return (
    <div className="grid gap-space-lg lg:grid-cols-[minmax(0,1fr)_minmax(18rem,26rem)]">
      <section aria-labelledby="details-title" className="flex flex-col gap-space-lg rounded-lg border border-line bg-surface-container-lowest p-space-lg">
        <h2 id="details-title" className="font-display text-headline-sm">Construction parameters</h2>
        <NameField error={errors.name} />
        <LevelsField error={errors.levels} />
        <div className="grid gap-space-lg sm:grid-cols-2">
          <FloorHeightField error={errors.floorHeight} />
          <RoofTypeField />
        </div>
      </section>
      <NextStepHint
        title="Next: the AI reads your plan"
        icon="auto_awesome"
        text="It finds walls, doors, windows, columns and rooms. Anything it is unsure about is flagged for you to confirm in the editor."
      />
    </div>
  );
}
