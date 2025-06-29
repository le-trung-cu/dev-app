import { IEvent } from "fabric/fabric-impl";
import { useEffect } from "react";
import { EditorProperties } from "./use-editor";

interface UseCanvasEventsProps {
  canvas: fabric.Canvas | null;
  save: () => void;
  setSelectedObjects: (objects: fabric.Object[]) => void;
  setEditorProperty: <K extends keyof EditorProperties>(
    name: K,
    value: EditorProperties[K]
  ) => void;
}

export const useCanvasEvents = ({
  save,
  canvas,
  setSelectedObjects,
  setEditorProperty,
}: UseCanvasEventsProps) => {
  useEffect(() => {
    if (canvas) {
      function handler(e: IEvent<MouseEvent>) {
        setSelectedObjects(e.selected || []);
      }
      function saveHandler() {
        save();
      }
      canvas.on("after:render", () => {
        setSelectedObjects(canvas.getActiveObjects())
      });
      canvas.on("object:added", saveHandler);
      canvas.on("object:modified", saveHandler);
      canvas.on("object:removed", saveHandler);

      canvas.on("selection:created", handler);
      canvas.on("selection:updated", handler);
      canvas.on("selection:cleared", (e) => {
        setSelectedObjects([]);
      });
    }

    return () => {
      if (canvas) {
        canvas.off("after:render");
        canvas.off("object:added");
        canvas.off("object:modified");
        canvas.off("object:removed");
        canvas.off("selection:created");
        canvas.off("selection:updated");
        canvas.off("selection:cleared");
      }
    };
  }, [canvas, setSelectedObjects]);
};
