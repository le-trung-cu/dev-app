import { useCallback, useEffect } from "react";
import { fabric } from "fabric";

interface UseAutoResizeProps {
  canvas: fabric.Canvas | null;
  container: HTMLDivElement | null;
}

export const useAutoResize = ({ canvas, container }: UseAutoResizeProps) => {
  /**
   * - resize kích thước canvas fix với container
   * - transform trên canvas để đảm bảo center của workspace trùng center của canvas
   */
  const autoZoom = useCallback(() => {
    console.log("autoZoom");
    if (!canvas || !container) return;

    const width = container.offsetWidth;
    const height = container.offsetHeight;

    canvas.setDimensions({ width, height });

    const center = canvas.getCenter();

    const workspace = (canvas as any).xworkspace as fabric.Object;
    if (!workspace) return;

    // @ts-ignore
    const scale = fabric.util.findScaleToFit(workspace, { width, height });
    const zoomRatio = 0.85;
    const zoom = zoomRatio * scale;
    // trong Fabric.js vewportTransform dùng để thiết lập phép biến đổi (transform)
    // cho toàn bộ canvas - phóng to, thu nhỏ, hoặc di chuyển
    // [0: scaleX, 1: skewY, 2: skewX, 3: scaleY, 4: translateX, 5: translateY ]
    canvas.setViewportTransform(fabric.iMatrix.concat());
    canvas.zoomToPoint(new fabric.Point(center.left, center.top), zoom);

    const workspaceCenter = workspace.getCenterPoint();
    const viewportTransform = canvas.viewportTransform;

    if (
      canvas.width === undefined ||
      canvas.height === undefined ||
      !viewportTransform
    )
      return;
    // transform canvas sao cho workspace về tâm của viewport
    // phần dịch chuyển (translateX, translateY) được tính là
    // khoảng cách từ tâm canvas đến tâm workspace, và khoảng
    // cách này phụ thuộc vào scale
    viewportTransform[4] =
      canvas.width / 2 - workspaceCenter.x * viewportTransform[0];
    viewportTransform[5] =
      canvas.height / 2 - workspaceCenter.y * viewportTransform[3];

    canvas.setViewportTransform(viewportTransform);
    workspace.clone((cloned: fabric.Rect) => {
      canvas.clipPath = cloned;
      canvas.requestRenderAll();
    });
  }, [canvas, container]);

  // observer container's size change
  useEffect(() => {
    let resizeObserver: ResizeObserver | null = null;

    if (canvas && container) {
      resizeObserver = new ResizeObserver(() => {
        autoZoom();
      });

      resizeObserver.observe(container);
    }

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [canvas, container, autoZoom]);

  return { autoZoom };
};
