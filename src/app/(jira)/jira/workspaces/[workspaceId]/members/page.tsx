import { auth } from "@/lib/auth";
import { MembersView } from "@/modules/jira/features/members/ui/views/members-view";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function MembersPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) redirect("/sign-in");

  return <MembersView />;
}
