import { fabric } from "fabric";
import React, { useEffect, useRef } from "react";

const DEV_MODE = process.env.NODE_ENV === "development";
declare global {
  // @ts-nocheck
  var canvas: fabric.Canvas | undefined;
}


function patchFilterSerialization() {
  const filterTypes = fabric.Image.filters;

  Object.keys(filterTypes).forEach((key) => {
    // @ts-ignore
    const FilterClass = filterTypes[key];
    if (typeof FilterClass !== "function") return;

    const proto = FilterClass.prototype;

    // Tránh patch nhiều lần
    if (proto.__toObjectOverridden) return;

    const originalToObject = proto.toObject;

    proto.toObject = function () {
      return fabric.util.object.extend(originalToObject.call(this), {
        id: this.id,
        name: this.name,
      });
    };

    proto.__toObjectOverridden = true;

    // Patch fromObject (nếu bạn deserialize JSON)
    // @ts-ignore
    FilterClass.fromObject = function (object, callback) {
      const filter = new FilterClass(object);
      filter.id = object.id;
      filter.name = object.name;
      callback?.(filter);
      return filter;
    };
  });
}
patchFilterSerialization();

// Initial canvas
export const Canvas = React.forwardRef<
  fabric.Canvas,
  { onLoad?: (canvas: fabric.Canvas) => void }
>(({ onLoad }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    const canvas = new fabric.Canvas(canvasRef.current, {
      controlsAboveOverlay: true,
      preserveObjectStacking: true,
      selection: true,
      fireRightClick: true, // <-- enable firing of right click events
      fireMiddleClick: true, // <-- enable firing of middle click events
      stopContextMenu: true, // <--  prevent context menu from showing
    });
    // fabric({ devicePixelRatio: window.devicePixelRatio });

    DEV_MODE && (window.canvas = canvas);

    if (typeof ref === "function") {
      ref(canvas);
    } else if (typeof ref === "object" && ref) {
      ref.current = canvas;
    }

    // it is crucial `onLoad` is a dependency of this effect
    // to ensure the canvas is disposed and re-created if it changes
    onLoad?.(canvas);

    return () => {
      DEV_MODE && delete window.canvas;

      if (typeof ref === "function") {
        ref(null);
      } else if (typeof ref === "object" && ref) {
        ref.current = null;
      }
      // `dispose` is async
      // however it runs a sync DOM cleanup
      // its async part ensures rendering has completed
      // and should not affect react
      canvas.dispose();
    };
  }, [canvasRef, onLoad]);

  return <canvas ref={canvasRef} />;
});
