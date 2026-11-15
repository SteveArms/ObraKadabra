import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

export const metadata: Metadata = { title: "Log progress" };

export default function ProgressPage() {
  return <PlaceholderPage title="Log progress" description="Add a site photo to record how far each stage has advanced." />;
}
