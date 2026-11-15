import type { Metadata } from "next";
import { DemoGallery, HomeHero, ProjectsDashboard } from "@/features/home";

export const metadata: Metadata = { title: { absolute: "ObraKadabra" } };

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <DemoGallery />
      <ProjectsDashboard />
    </>
  );
}
