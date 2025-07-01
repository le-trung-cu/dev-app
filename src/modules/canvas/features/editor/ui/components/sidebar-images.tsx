import { ScrollArea } from "@/components/ui/scroll-area";
import { useGetImages } from "@/modules/images/api/use-get-images";
import Image from "next/image";
import Link from "next/link";
import { Editor } from "../../hooks/use-editor";
import { UploadButton } from "@/lib/uploadthing";
import { cn } from "@/lib/utils";
import { XIcon } from "lucide-react";

interface SidebarImagesProps {
  editor?: Editor | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
export const SidebarImages = ({
  editor,
  open,
  onOpenChange,
}: SidebarImagesProps) => {
  const { data } = useGetImages();
  if (!open) return null;
  return (
    <div className={cn("w-[400px] relative flex flex-col h-full bg-red-3 z-50 bg-background")}>
      <div className="relative p-5 border-b shadow">
        <XIcon
          className="size-4 absolute top-4 right-2"
          onClick={() => onOpenChange(false)}
        />
        <div>
          <h3 className="font-semibold text-sm mb-2">Thêm hình ảnh</h3>
        </div>
        <UploadButton
          className="flex-row"
          endpoint="imageUploader"
          onClientUploadComplete={(res) => {
            editor?.addImage(res[0].ufsUrl);
          }}
          onUploadError={(error: Error) => {
            // Do something with the error.
            alert(`ERROR! ${error.message}`);
          }}
          content={{
            button: <span className="flex justify-center">Tải file từ máy tính</span>,
          }}
          appearance={{
            container: {
              width: "100%",
              paddingLeft: "15px",
              paddingRight: "15px",
            },

            button: {
              flex: "1",
            },
          }}
        />
      </div>

      <div className="flex-1 relative">
        <div className="absolute inset-0">
          <ScrollArea className="h-full">
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4">
                {data?.map((image) => (
                  <button
                    onClick={() => editor?.addImage(image.urls.regular)}
                    key={image.id}
                    className="relative w-full h-[100px] group hover:opacity-75 transition bg-muted rounded-sm overflow-hidden border"
                  >
                    <Image
                      fill
                      src={image.urls.small}
                      alt={image.alt_description || "Image"}
                      className="object-cover"
                    />
                    <Link
                      target="_blank"
                      href={image.links.html}
                      className="opacity-0 group-hover:opacity-100 absolute left-0 bottom-0 w-full text-[10px] truncate text-white hover:underline p-1 bg-black/50 text-left"
                    >
                      {image.user.name}
                    </Link>
                  </button>
                ))}
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};
