import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

export const useConfirm = () => {
  const [promise, setPromise] = useState<{
    resolve: (confirm: boolean) => unknown;
  } | null>(null);
  const [content, setContent] = useState<{
    title: string;
    description: string;
  }>();

  const confirm = async (alert: { title: string; description: string }) => {
    setContent(alert);
    return new Promise((res, rej) => {
      setPromise({
        resolve: (confirm: boolean) => res(confirm),
      });
    }) as Promise<boolean>;
  };

  const open = promise !== null;

  const onCancel = () => {
    promise?.resolve(false);
    setPromise(null);
  };

  const onConfirm = () => {
    promise?.resolve(true);
    setPromise(null);
  };

  const ConfirmComponent = () => {
    return (
      <Dialog open={open} onOpenChange={onCancel}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{content?.title}</DialogTitle>
            <DialogDescription>{content?.description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Huỷ</Button>
            </DialogClose>
            <Button variant="destructive" onClick={onConfirm}>
              Đồng ý
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  return [ConfirmComponent, confirm] as const;
};
