import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import CanvasHome from "./canvas-home";

export default async function Page() {
  const current = await auth.api.getSession({
    headers: await headers(),
  });
  if(!current) redirect("/sign-in");

  return <CanvasHome/>
}