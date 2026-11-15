type PlaceholderPageProps = {
  title: string;
  description: string;
};

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <section className="flex w-full flex-col gap-space-xs px-gutter py-space-xl lg:px-gutter-desktop">
      <h1 className="font-display text-headline-lg-mobile text-balance md:text-headline-lg">{title}</h1>
      <p className="max-w-[65ch] text-body-lg text-pretty text-on-surface-variant">{description}</p>
    </section>
  );
}
