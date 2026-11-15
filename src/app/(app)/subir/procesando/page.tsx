import type { Metadata } from "next";
import { ProcessingView } from "@/features/upload";

export const metadata: Metadata = { title: "Reading your plan" };

export default function ProcessingPage() {
  return <ProcessingView />;
}
