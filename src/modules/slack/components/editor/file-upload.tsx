import { Hint } from "@/components/hint";
import { useUploadThing } from "@/lib/uploadthing";
import { Loader2, TriangleAlert, XIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

interface FileUploadProps {
  file?: File;
  fileName: string;
  fileContent: string;
  url?: string;
  onRemove?: () => void;
  onClientUploadComplete?: (url: string) => void;
}

export const FileUpload = ({
  file,
  fileContent,
  fileName,
  url,
  onRemove,
  onClientUploadComplete,
}: FileUploadProps) => {
  const [uploadStatus, setUploadStatus] = useState("");

  const { startUpload, routeConfig, isUploading } = useUploadThing(
    "imageUploader",
    {
      onClientUploadComplete: (result) => {
        // alert("uploaded successfully!");
        onClientUploadComplete?.(result[0].ufsUrl);
        setUploadStatus("isSuccess");
      },
      onUploadError: () => {
        setUploadStatus("isError");
      },
      onUploadBegin: () => {
        setUploadStatus("isPending");
      },
    }
  );

  useEffect(() => {
    if (file) {
      console.log("call uploadthing");
      startUpload([file]);
    }
  }, [file]);

  if (isUploading) {
    return (
      <div
        key={fileName}
        className="h-[100px] w-[80px] relative group overflow-clip"
      >
        <Image fill alt={fileName} src={fileContent} className="object-cover" />
        <Hint label="Xoá">
          <XIcon
            className="absolute top-0 right-0  rounded-full border border-gray-700 bg-background hidden group-hover:inline-flex cursor-pointer z-10"
            onClick={() => onRemove?.()}
          />
        </Hint>
        <div className="absolute inset-0 bg-white/30 flex justify-center items-center">
          <Loader2 className="animate-spin text-white" />
        </div>
      </div>
    );
  }

  if (uploadStatus === "isError") {
    return (
      <div
        key={fileName}
        className="h-[100px] w-[80px] relative group overflow-clip"
      >
        <Image fill alt={fileName} src={fileContent} className="object-cover" />
        <Hint label="Xoá">
          <XIcon
            className="absolute top-0 right-0  rounded-full border border-gray-700 bg-background hidden group-hover:inline-flex cursor-pointer z-10"
            onClick={() => onRemove?.()}
          />
        </Hint>
        <div className="absolute inset-0 bg-white/80 flex justify-center items-center">
          <div className="flex items-center gap-2">
            <TriangleAlert className="text-red-500" />
            <span className="text-red-500 text-xs">Error</span>
          </div>
        </div>
      </div>
    );
  }

  if (!!url) {
    return (
      <div
        key={fileName}
        className="h-[100px] w-[80px] relative group overflow-clip shadow border rounded-xs"
      >
        <Image
          fill
          sizes="80px"
          alt={fileName}
          src={url}
          className="absolute inset-0 object-cover"
        />
        <Hint label="Xoá">
          <XIcon
            className="absolute top-0 right-0  rounded-full border border-gray-700 bg-background hidden group-hover:inline-flex cursor-pointer z-10"
            onClick={() => onRemove?.()}
          />
        </Hint>
      </div>
    );
  }
};
