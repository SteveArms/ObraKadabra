import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

export const metadata: Metadata = { title: "2D editor" };

export default function EditorPage() {
  return <PlaceholderPage title="2D editor" description="Review and correct the walls, openings and columns detected in your plan." />;
}
