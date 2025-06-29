import { useEvent } from "react-use";
import { fabric } from "fabric";

interface UseHotKeysProps {
  canvas: fabric.Canvas | null;
  undo: () => void;
  redo: () => void;
  save: (skip?: boolean) => void;
  copy: () => void;
  paste: () => void;
}

export const useHotKeys = ({
  canvas,
  undo,
  redo,
  save,
  copy,
  paste,
}: UseHotKeysProps) => {
  useEvent("keydown", (event: React.KeyboardEvent) => {
    const isCtrlKey = event.ctrlKey || event.metaKey;
    const isBackspace = event.key === "Backspace";
    const isInput = ["INPUT", "TEXTAREA"].includes(
      (event.target as HTMLElement).tagName
    );
    if (isInput) return;

    if (isBackspace) {
      canvas?.remove(...canvas.getActiveObjects());
      canvas?.discardActiveObject();
    }

    if (isCtrlKey && event.key === "z") {
      event.preventDefault();
      undo();
    }

    if (isCtrlKey && event.key === "y") {
      event.preventDefault();
      redo();
    }

    if (isCtrlKey && event.key === "c") {
      event.preventDefault();
      copy();
    }

    if (isCtrlKey && event.key === "v") {
      event.preventDefault();
      paste();
    }

    if (isCtrlKey && event.key === "s") {
      event.preventDefault();
      save(true);
    }

    if (isCtrlKey && event.key === "a") {
      event.preventDefault();
      if (canvas) {
        canvas.discardActiveObject();
        const allObjects = canvas
          .getObjects()
          .filter((object) => object.selectable);
        canvas.setActiveObject(
          new fabric.ActiveSelection(allObjects, { canvas })
        );
        canvas.renderAll();
      }
    }
  });
};
