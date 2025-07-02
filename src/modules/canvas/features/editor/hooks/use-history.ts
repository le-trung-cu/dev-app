import { useCallback, useMemo, useRef, useState } from "react";
import { JSON_KEYS } from "../types";

interface UseHistoryProps {
  canvas: fabric.Canvas | null;
  saveCallback?: (values: {
    json: string;
    height: number;
    width: number;
  }) => void;
}

export const useHistory = ({ canvas, saveCallback }: UseHistoryProps) => {
  const [historyIndex, setHistoryIndex] = useState(0);
  const historyStack = useRef<string[]>([]);
  const isOff = useRef(false);
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < historyStack.current.length - 1;
  const save = useCallback(
    (offHistory = false) => {
      if (!canvas) return;
      const value = canvas.toJSON(JSON_KEYS);
      const json = JSON.stringify(value);
      if (!offHistory && !isOff.current) {
        historyStack.current.push(json);
        setHistoryIndex(historyStack.current.length - 1);
      }

      const workspace = canvas
        .getObjects()
        .find((object) => object.name === "clip");
      const height = workspace?.height || 0;
      const width = workspace?.width || 0;

      saveCallback?.({ json, height, width });
    },
    [canvas, saveCallback]
  );

  const undo = useCallback(() => {
    if (!canvas) return;
    if (canUndo) {
      isOff.current = true;
      canvas.clear().renderAll();
      const previousIndex = historyIndex - 1;
      const value = historyStack.current[previousIndex];
      canvas.loadFromJSON(value, () => {
        canvas.renderAll();
        setHistoryIndex(previousIndex);
        isOff.current = false;
      });
    }
  }, [canvas, canUndo, historyIndex]);

  const redo = useCallback(() => {
    if (!canvas) return;
    if (canRedo) {
      isOff.current = true;
      canvas.clear().renderAll();
      const nextIndex = historyIndex + 1;
      const value = historyStack.current[nextIndex];
      canvas.loadFromJSON(value, () => {
        canvas.renderAll();
        isOff.current = false;
        setHistoryIndex(nextIndex);
      });
    }
  }, [canvas, canRedo, historyIndex]);

  const init = useCallback((initialCanvas: fabric.Canvas) => {
    const currentState = JSON.stringify(initialCanvas.toJSON(JSON_KEYS));
    historyStack.current = [currentState];
    setHistoryIndex(0);
  }, []);

  const history = useMemo(() => {
    return {
      init,
      save,
      undo,
      redo,
      canUndo,
      canRedo,
    };
  }, [init, save, undo, redo, canUndo, canRedo]);

  return history;
};

export type HistoryType = ReturnType<typeof useHistory>;
