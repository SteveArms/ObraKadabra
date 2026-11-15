import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { HowItWorksDialog } from "./HowItWorksDialog";

const TRUST_POINTS = [
  { icon: "engineering", text: "Built for self-builders and site foremen" },
  { icon: "payments", text: "Costs in soles with editable reference prices" },
  { icon: "view_in_ar", text: "Your home in 3D, week by week" },
];

export function HomeHero() {
  return (
    <div className="px-gutter pt-space-lg lg:px-gutter-desktop">
      <section aria-labelledby="home-title" className="flex flex-col gap-space-lg rounded-2xl bg-surface-container-low p-space-lg md:p-10">
        <p className="flex items-center gap-1.5 self-start rounded-full bg-surface-container-high px-space-sm py-1 font-mono text-label-numeric-sm tracking-[0.05em] text-primary uppercase">
          <Icon name="auto_fix_high" size={16} filled className="text-secondary" />
          From 2D plan to 4D/5D model
        </p>
        <h1 id="home-title" className="max-w-[22ch] font-display text-display-lg-mobile text-balance md:text-display-lg">
          Upload your plan and, <span className="text-primary underline decoration-secondary-container decoration-4 underline-offset-4">abracadabra</span>, your
          home rises in 3D with its cost and schedule.
        </h1>
        <p className="max-w-[65ch] text-body-lg text-pretty text-on-surface-variant">
          Watch your home being built week by week, see the budget in soles (S/) and get the list of materials to buy.
        </p>
        <div className="flex flex-wrap items-center gap-space-sm">
          <Link href="/subir" data-testid="hero-upload" className={buttonClasses("milestone", "min-h-12 px-space-lg text-body-lg")}>
            <Icon name="upload_file" />
            Upload my plan
          </Link>
          <HowItWorksDialog />
        </div>
        <ul className="grid gap-space-xs text-body-md text-on-surface-variant sm:grid-cols-3">
          {TRUST_POINTS.map((point) => (
            <li key={point.text} className="flex items-center gap-space-xs rounded-md bg-surface-container-lowest px-space-sm py-space-xs">
              <Icon name={point.icon} size={18} className="text-primary" />
              {point.text}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
