import { auth } from "@/lib/auth";
import { ProjectHome } from "@/modules/jira/features/tasks/ui/views/home";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function ProjectIdPage() {
  const current = await auth.api.getSession({
    headers: await headers(),
  });

  if (!current) redirect("/sign-in");
  return (
    <div>
      <ProjectHome />
    </div>
  );
}
