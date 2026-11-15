import type { Metadata } from "next";
import { UploadWizard } from "@/features/upload";

export const metadata: Metadata = { title: "Upload plan" };

export default function UploadPage() {
  return <UploadWizard />;
}
