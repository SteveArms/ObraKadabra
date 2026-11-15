export type NavItem = {
  id: string;
  label: string;
  shortLabel: string;
  href: string;
  icon: string;
};

export function getMainNavItems(projectId: string): NavItem[] {
  const project = `/proyecto/${projectId}`;
  return [
    { id: "home", label: "Home", shortLabel: "Home", href: "/", icon: "home" },
    { id: "upload", label: "Upload plan", shortLabel: "Upload", href: "/subir", icon: "upload_file" },
    { id: "editor", label: "2D editor", shortLabel: "Editor", href: `${project}/editor`, icon: "architecture" },
    { id: "workspace", label: "4D/5D workspace", shortLabel: "Workspace", href: project, icon: "view_in_ar" },
    { id: "progress", label: "Log progress", shortLabel: "Progress", href: `${project}/avance`, icon: "photo_camera" },
  ];
}

function matchesPath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

// The most specific match wins, so /proyecto/x/editor never also marks /proyecto/x
export function getActiveHref(pathname: string, hrefs: string[]): string | undefined {
  const normalized = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  return hrefs
    .filter((href) => matchesPath(normalized, href))
    .sort((a, b) => b.length - a.length)[0];
}

// Task flows own the bottom edge on phones with their action bar, so the tab bar steps aside there
const FOCUSED_FLOWS = ["/subir"];

export function isFocusedFlow(pathname: string): boolean {
  return FOCUSED_FLOWS.some((href) => matchesPath(pathname, href));
}
