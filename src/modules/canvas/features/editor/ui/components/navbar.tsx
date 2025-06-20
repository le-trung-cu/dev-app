import { CiCloud, CiCloudOn, CiFileOn } from "react-icons/ci";
import { BsCloudCheck } from "react-icons/bs";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { ChevronDown, MousePointerClick, Redo2, Undo2 } from "lucide-react";
import Image from "next/image";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { FaSoundcloud } from "react-icons/fa";

export const Navbar = () => {
  return (
    <nav className="h-[68px] border-b flex items-center">
      <div className="w-[68px] flex justify-center items-center">
        <Image src="/figma-logo-22789.svg" alt="logo" width={30} height={30} />
      </div>
      <Menubar className="border-none p-0 shadow-none">
        <MenubarMenu>
          <MenubarTrigger className="">
            Tệp tin <ChevronDown className="text-muted-foreground size-4" />
          </MenubarTrigger>
          <MenubarContent>
            <MenubarItem>
              <CiFileOn className="size-6" />
              <div>
                <div>Mở file JSON</div>
                <div className="text-xs text-muted-foreground">
                  Mở một file JSON trên máy tính của bạn
                </div>
              </div>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarSeparator />
      </Menubar>
      <Separator orientation="vertical" className="h-6 ml-3 mr-1" />
      <Button variant="ghost" className="">
        <MousePointerClick className="size-6" />
      </Button>
      <Button variant="ghost" className="">
        <Undo2 className="size-6" />
      </Button>
      <Button variant="ghost" className="">
        <Redo2 className="size-6" />
      </Button>
      <Separator orientation="vertical" className="h-6 ml-3 mr-1" />

      <div className="flex items-center gap-2 px-3">
        <BsCloudCheck className="size-6" />
        <span className="text-muted-foreground text-xs">Saved</span>
      </div>
    </nav>
  );
};
