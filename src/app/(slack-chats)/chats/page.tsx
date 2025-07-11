import { auth } from "@/lib/auth";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ClientRender } from "./client-render";
import { getWorkspaces } from "@/modules/jira/features/workspaces/server/queries";



export default async function Home() {
  const current = await auth.api.getSession({
    headers: await headers(),
  });
  if (!current?.user?.id) return redirect("/sign-in");

  const queryClient = new QueryClient();
  const workspaces = await queryClient.fetchQuery({
    queryKey: ["workspaces"],
    queryFn: () => getWorkspaces(current.user.id),
  });

  if(workspaces?.length > 0) {
    redirect(`/chats/workspaces/${workspaces[0].id}`)
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ClientRender />
    </HydrationBoundary>
  );
}
