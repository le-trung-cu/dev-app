import { auth } from "@/lib/auth";
import { Banner } from "./banner";
import { ProjectsSection } from "./projects-section";
import { TemplatesSection } from "./templates-section";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function WorkspaceIdPage() {
  const current = await auth.api.getSession({
    headers: await headers(),
  });
  if (!current) redirect("/sign-in");
  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <Banner />
      <TemplatesSection />
      <ProjectsSection />
    </div>
  );
}
