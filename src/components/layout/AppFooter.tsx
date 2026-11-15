export function AppFooter() {
  return (
    <footer className="border-t border-line bg-surface-container-low">
      <div className="mx-auto flex w-full flex-col gap-space-xs px-gutter py-space-lg text-body-sm text-on-surface-variant md:flex-row md:items-center md:justify-between lg:px-gutter-desktop">
        <p>
          <span className="font-display text-headline-sm text-primary">ObraKadabra</span>{" "}
          <span className="font-mono text-label-numeric-sm">© 2026 · Peru</span>
        </p>
        <p>4D/5D planning for self-built homes</p>
      </div>
    </footer>
  );
}
