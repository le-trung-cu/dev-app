import { auth } from "@/lib/auth";
import { WorkspaceHome } from "@/modules/jira/features/workspaces/ui/views/home";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function WorkspaceIdPage() {
  const current = await auth.api.getSession({
    headers: await headers()
  });

  if(!current) redirect('sign-in');
  
  return <div>
    <WorkspaceHome/>
  </div>;
}
