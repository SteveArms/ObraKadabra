import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

export const metadata: Metadata = { title: "Shared view" };

export default function SharedPage() {
  return <PlaceholderPage title="Shared view" description="A read-only view of the project for clients and family." />;
}
