"use client";

import { Button } from "@/components/ui/button";
import { useGetCurrent } from "@/modules/auth/api/use-get-current";
import { UserButton } from "@/modules/auth/ui/components/user-button";
import { Loader } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  const { data: current, isLoading } = useGetCurrent();

  return (
    <div>
      <nav className="flex justify-end p-5 shadow border-muted-foreground">
        {!!current?.user ? (
          <UserButton user={current.user} />
        ) : (
          <>
            <Button asChild variant="outline">
             {isLoading? <Loader className=""/> : <Link href="/sign-in">Sign in</Link>}
            </Button>
          </>
        )}
      </nav>
      <div className="flex justify-center mt-20 gap-10">
        <Link
          href={`/jira`}
          className="flex flex-col justify-between items-center gap-5 p-2 border rounded-sm"
        >
          <Image
            src="/atlassian_jira_logo_icon_170511.svg"
            alt="logo"
            width={100}
            height={100}
          />
          <span>Quản lý dự án</span>
        </Link>
        <Link
          href={`/canvas`}
          className="flex flex-col justify-between items-center gap-5 p-2 border rounded-sm"
        >
          <Image
            src="/figma-logo-22789.svg"
            alt="logo"
            width={100}
            height={100}
          />
          <span>Tạo file thiết kế</span>
        </Link>
        <Link
          href={`/chats`}
          className="flex flex-col justify-between items-center gap-5 p-2 border rounded-sm"
        >
          <Image src="/chats.svg" alt="logo" width={100} height={100} />
          <span>Trò chuyện</span>
        </Link>
      </div>
    </div>
  );
}
