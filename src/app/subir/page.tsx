import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

export const metadata: Metadata = { title: "Upload plan" };

export default function UploadPage() {
  return <PlaceholderPage title="Upload plan" description="Upload a photo of your floor plan, set its scale and add the project details." />;
}
