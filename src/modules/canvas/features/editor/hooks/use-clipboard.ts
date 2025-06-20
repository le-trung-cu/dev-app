import { useCallback, useRef } from "react";

export const useClipboard = ({ canvas }: { canvas: fabric.Canvas | null }) => {
  const clipboard = useRef<any>(null);

  const copy = useCallback(() => {
    canvas?.getActiveObject()?.clone((cloned: any) => {
      clipboard.current = cloned;
    });
  }, [canvas]);

  const paste = useCallback(() => {
    if (!clipboard.current) return;

    clipboard.current.clone((cloned: any) => {
      canvas?.discardActiveObject();
      cloned.set({
        left: cloned.left + 10,
        top: cloned.top + 10,
        evented: true,
      });

      if (cloned.type === "activeSelection") {
        cloned.canvas = canvas;
        cloned.forEachObject((obj: any) => {
          canvas?.add(obj);
        });
        cloned.setCoords();
      } else {
        canvas?.add(cloned);
      }

      clipboard.current.top += 10;
      clipboard.current.left += 10;

      canvas?.setActiveObject(cloned);
      canvas?.requestRenderAll();
    });
  }, [canvas]);

  return { copy, paste };
};
