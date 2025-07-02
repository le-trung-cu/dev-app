import { auth } from "@/lib/auth";
import EditorView from "@/modules/canvas/features/editor/ui/views/editor-view";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function EditorPage() {
  const current = await auth.api.getSession({
    headers: await headers(),
  });
  if (!current) redirect("/sign-in");
  return <EditorView />;
}
