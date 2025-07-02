import { fabric } from "fabric";
import { useEffect, useRef } from "react";
import { useHistory } from "./use-history";

interface UseLoadStateProps {
  autoZoom: () => void;
  canvas: fabric.Canvas | null;
  initialState: React.RefObject<string | undefined>;
  history: ReturnType<typeof useHistory>;
}

export const useLoadState = ({
  canvas,
  autoZoom,
  initialState,
  history,
}: UseLoadStateProps) => {
  const initialized = useRef(false);
  const initHistory = history.init;

  useEffect(() => {
    if (!initialized.current && initialState.current && canvas) {
      const data = JSON.parse(initialState.current);
      canvas.loadFromJSON(data, () => {
        initHistory(canvas);
        autoZoom();
      });
    }
  }, [
    canvas,
    autoZoom,
    initialState, // no need, this is a ref
    initHistory, // no need, this is a useCallback
  ]);
};
