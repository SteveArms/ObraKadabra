import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { SharedFromDevice, SharedHome } from "@/features/share";
import { getDemoModelUrl } from "@/lib/projects/demo-models";
import { loadSharedProject } from "@/lib/projects/shared-server";
import { requestTime } from "@/lib/request-time";

const DESCRIPTION = "Follow the build week by week: overall progress, the home in 3D and the latest photo from the site.";

export async function generateMetadata({ params }: PageProps<"/compartir/[token]">): Promise<Metadata> {
  const { token } = await params;
  const result = await loadSharedProject(token).catch(() => undefined);
  const name = result?.status === "found" ? result.shared.project.name : undefined;
  const title = name ? `Our future home · ${name}` : "Our future home";
  return {
    title,
    description: DESCRIPTION,
    robots: { index: false, follow: false },
    openGraph: { title, description: DESCRIPTION, type: "website", siteName: "ObraKadabra", locale: "en_US" },
    twitter: { card: "summary_large_image", title, description: DESCRIPTION },
  };
}

async function SharedContent({ token }: { token: string }) {
  const now = await requestTime();
  const result = await loadSharedProject(token);
  if (result.status === "missing") notFound();
  if (result.status === "on-device") return <SharedFromDevice token={token} />;
  return <SharedHome shared={result.shared} now={now} glbUrl={getDemoModelUrl(result.shared.project.id)} />;
}

export default function SharedPage({ params }: PageProps<"/compartir/[token]">) {
  return (
    <Suspense fallback={<p className="px-gutter py-space-xl text-body-md lg:px-gutter-desktop">Opening the home…</p>}>
      {params.then(({ token }) => (
        <SharedContent token={token} />
      ))}
    </Suspense>
  );
}
