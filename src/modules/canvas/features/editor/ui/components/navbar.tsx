import { CiFileOn, CiSaveDown1, CiSaveDown2 } from "react-icons/ci";
import { BsDownload, BsFiletypeSvg } from "react-icons/bs";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { ChevronDown, FileJson, ImageIcon } from "lucide-react";
import Image from "next/image";
import { Editor } from "../../hooks/use-editor";
import { useFilePicker } from "use-file-picker";

interface NavbarProps {
  editor?: Editor | null;
}
export const Navbar = ({ editor }: NavbarProps) => {
  
  const { openFilePicker } = useFilePicker({
    accept: ".json",
    onFilesSuccessfullySelected: ({ plainFiles }: any) => {
      if (plainFiles && plainFiles.length > 0) {
        const file = plainFiles[0];
        const reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = () => {
          editor?.loadJson(reader.result as string);
        };
      }
    },
  });
  return (
    <nav className="size-[68px] fixed left-5 flex z-50 items-center">
      <Menubar className="border-none p-0 shadow-none bg-transparent hover:bg-black/20">
        <MenubarMenu>
          <MenubarTrigger>
            <div className="w-[40px] flex justify-center items-center hover:cursor-pointer">
              <Image
                src="/figma-logo-22789.svg"
                alt="logo"
                width={30}
                height={30}
              />
              <ChevronDown className="text-muted-foreground size-4" />
            </div>
          </MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={() => openFilePicker()}>
              <CiFileOn className="size-6" />
              <div>
                <div>Mở file JSON</div>
                <div className="text-xs text-muted-foreground">
                  Mở một file JSON trên máy tính của bạn
                </div>
              </div>
            </MenubarItem>
            <MenubarSub>
              <MenubarSubTrigger>
                <CiSaveDown2 className="size-6 mr-2 text-gray-500/90" />
                <div>Tải xuống</div>
              </MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem onClick={() => editor?.saveJson()}>
                  <FileJson className="size-5" /> Tải file JSON
                </MenubarItem>
                <MenubarItem onClick={() => editor?.savePng()}>
                  <ImageIcon className="size-5" /> Tải file PNG
                </MenubarItem>
                <MenubarItem onClick={() => editor?.saveSvg()}>
                  <BsFiletypeSvg className="size-5" /> Tải file Svg
                </MenubarItem>
              </MenubarSubContent>
            </MenubarSub>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </nav>
  );
};
