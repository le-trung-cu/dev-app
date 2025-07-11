import { auth } from "@/lib/auth";
import { ChannelView } from "@/modules/slack/features/channels/ui/view/channel-view";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function ChannelIdPage() {
  const current = await auth.api.getSession({
    headers: await headers(),
  });

  if (!current) redirect("/sign-in");

  return (
    <ChannelView/>
  );
}
