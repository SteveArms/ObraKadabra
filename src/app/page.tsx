import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

export const metadata: Metadata = { title: { absolute: "ObraKadabra" } };

export default function HomePage() {
  return <PlaceholderPage title="Home" description="Upload a floor plan or open a demo to watch your home get built week by week." />;
}
