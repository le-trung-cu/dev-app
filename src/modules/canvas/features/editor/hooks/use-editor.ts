import { Ref, RefObject, useCallback, useMemo, useRef, useState } from "react";
import { fabric } from "fabric";
import { useAutoResize } from "./use-auto-resize";
import { useCanvasEvents } from "./use-canvas-events";
import { useClipboard } from "./use-clipboard";
import { HistoryType, useHistory } from "./use-history";

interface Props {
  defaultHeight: number;
  defaultWidth: number;
}

export interface EditorProperties {
  fill?: string;
  stroke?: string;
  selectedObjects?: fabric.Object[];
  background?: string;
}
export const useEditor = ({ defaultHeight, defaultWidth }: Props) => {
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  // const [selectedObjects, setSelectedObjects] = useState<fabric.Object[]>([]);
  const editorProperties = useRef<EditorProperties>({
    fill: "#000",
    stroke: "#000",
    selectedObjects: [],
  });

  const watchers = useRef<Record<string, Set<() => void>>>({});

  const setEditorProperty = useCallback(
    <K extends keyof EditorProperties>(name: K, value: EditorProperties[K]) => {
      if (editorProperties.current[name] === value) return;
      editorProperties.current[name] = value as any;
      watchers.current[name]?.forEach((cb) => cb());
    },
    []
  );

  const registerWatcher = useCallback(
    <K extends keyof EditorProperties>(name: K, callback: () => void) => {
      if (!watchers.current[name]) {
        watchers.current[name] = new Set();
      }

      watchers.current[name].add(callback);

      return () => {
        watchers.current[name].delete(callback);
      };
    },
    []
  );

  const setSelectedObjects = useCallback((objects: fabric.Object[]) => {
    editorProperties.current["selectedObjects"] = objects;
    if (objects.length > 0) {
      const selectedObject = objects[0];
      if (!selectedObject) {
        setEditorProperty("fill", "#000");
        setEditorProperty("stroke", "#000");
      } else {
        const fillValue = (selectedObject.get("fill") as string) || "#000";
        const strokeValue = (selectedObject.get("stroke") as string) || "#000";
        setEditorProperty("fill", fillValue);
        setEditorProperty("stroke", strokeValue);
      }
    }
  }, []);

  const init = useCallback(
    ({
      canvas,
      container,
    }: {
      canvas: fabric.Canvas;
      container: HTMLDivElement;
    }) => {
      fabric.Object.prototype.set({
        // default initial properties values of fabric Object,
      });
      canvas.setDimensions({
        width: container.offsetWidth,
        height: container.offsetHeight,
      });
      const initialWokspace = new fabric.Rect({
        width: defaultHeight,
        height: defaultWidth,
        name: "workspace",
        fill: "white",
        selectable: false,
        hasControls: false,
        shadow: new fabric.Shadow({
          color: "rgba(0,0,0,0.8)",
          blur: 5,
        }),
      });
      (canvas as any).xworkspace = initialWokspace;
      setContainer(container);
      setCanvas(canvas);
      canvas.add(initialWokspace);
      canvas.centerObject(initialWokspace);
      canvas.clipPath = initialWokspace;

      history.init(canvas);
    },
    []
  );

  const history = useHistory({ canvas });

  const { copy, paste } = useClipboard({ canvas });

  const { autoZoom } = useAutoResize({ canvas, container });

  useCanvasEvents({
    canvas,
    save: history.save,
    setSelectedObjects,
    setEditorProperty,
  });

  const editor = useMemo(() => {
    if (!canvas) return null;

    return buildEditor({
      canvas,
      autoZoom,
      copy,
      paste,
      history,
      editorProperties,
      setEditorProperty,
      registerWatcher,
    });
  }, [canvas, setEditorProperty, autoZoom, history]);

  return { editor, init };
};

interface BuildEditorProps {
  canvas: fabric.Canvas;
  autoZoom: () => void;
  copy: () => void;
  paste: () => void;
  history: HistoryType,
  editorProperties: RefObject<Record<string, any>>;
  setEditorProperty: <K extends keyof EditorProperties>(
    name: K,
    value: EditorProperties[K]
  ) => void;
  registerWatcher: <K extends keyof EditorProperties>(
    name: K,
    callback: () => void
  ) => () => void;
}
function buildEditor({
  canvas,
  autoZoom,
  copy,
  paste,
  history,
  editorProperties,
  setEditorProperty,
  registerWatcher,
}: BuildEditorProps) {
  const center = (object: fabric.Object) => {
    const workpsace = (canvas as any).xworkspace as fabric.Object;
    const center = workpsace?.getCenterPoint();
    if (!center) return;
    // @ts-ignore
    canvas._centerObject(object, center);
  };

  const addToCanvas = (object: fabric.Object) => {
    if (!canvas) return;
    center(object);
    canvas.add(object);
    canvas.setActiveObject(object);
  };

  const getWorkspace = () => {
    return (canvas as any).xworkspace as fabric.Object;
  };

  return {
    canvas,
    getWorkspace,
    history,
    copy,
    paste,
    zoomIn: () => {
      let zoom = canvas.getZoom();
      zoom *= 1.1;
      if (zoom > 20) zoom = 20;
      if (zoom < 0.01) zoom = 0.01;
      const center = canvas.getCenter();
      canvas.zoomToPoint({ x: center.left, y: center.top }, zoom);
    },
    zoomOut: () => {
      let zoom = canvas.getZoom();
      zoom *= 0.9;
      if (zoom > 20) zoom = 20;
      if (zoom < 0.01) zoom = 0.01;
      const center = canvas.getCenter();
      canvas.zoomToPoint({ x: center.left, y: center.top }, zoom);
    },
    delete: () => {
      canvas.getActiveObjects().forEach((object) => canvas.remove(object));
      canvas.discardActiveObject();
      canvas.renderAll();
    },
    changeSize: (value: { width: number; height: number }) => {
      const workspace = getWorkspace();

      workspace?.set(value);
      autoZoom();
      // save();
    },
    changeBackground: (value: string) => {
      const workspace = getWorkspace();
      workspace?.set({ fill: value });
      setEditorProperty("background", value);
      canvas.renderAll();
      // save();
    },
    changeFillColor: (value: string) => {
      canvas.getActiveObjects().forEach((object) => {
        object.set({ fill: value });
      });
      setEditorProperty("fill", value);
      canvas.renderAll();
    },
    changeStrokeColor: (value: string) => {
      canvas.getActiveObjects().forEach((object) => {
        object.set({ stroke: value });
      });
      setEditorProperty("stroke", value);
      canvas.renderAll();
    },
    addRectangle: () => {
      const object = new fabric.Rect({
        left: 100,
        top: 100,
        width: 400,
        height: 500,
        stroke: "black",
        strokeWidth: 2,
      });

      addToCanvas(object);
    },
    addCircle: () => {
      const object = new fabric.Circle({
        left: 100,
        top: 100,
        width: 400,
        height: 500,
        stroke: "black",
        strokeWidth: 2,
        radius: 100,
      });

      addToCanvas(object);
    },
    addPolygon: () => {
      // create a polygon object
      var points = [
        {
          x: 3,
          y: 4,
        },
        {
          x: 16,
          y: 3,
        },
        {
          x: 30,
          y: 5,
        },
        {
          x: 25,
          y: 55,
        },
        {
          x: 19,
          y: 44,
        },
        {
          x: 15,
          y: 30,
        },
        {
          x: 15,
          y: 55,
        },
        {
          x: 9,
          y: 55,
        },
        {
          x: 6,
          y: 53,
        },
        {
          x: -2,
          y: 55,
        },
        {
          x: -4,
          y: 40,
        },
        {
          x: 0,
          y: 20,
        },
      ];
      var polygon = new fabric.Polygon(points, {
        left: 100,
        top: 100,
        fill: "black",
        strokeWidth: 1,
        stroke: "green",
        objectCaching: false,
        transparentCorners: false,
        cornerColor: "blue",
      });

      addToCanvas(polygon);
      let edit = false;
      polygon.on("mousedblclick", () => Edit(polygon));

      // define a function that can locate the controls.
      // this function will be used both for drawing and for interaction.
      function polygonPositionHandler(
        dim: { x: number; y: number },
        finalMatrix: any,
        fabricObject: any,
        pointIndex: number
      ) {
        var x = fabricObject.points[pointIndex].x - fabricObject.pathOffset.x,
          y = fabricObject.points[pointIndex].y - fabricObject.pathOffset.y;
        return fabric.util.transformPoint(
          new fabric.Point(x, y),
          fabric.util.multiplyTransformMatrices(
            fabricObject.canvas.viewportTransform,
            fabricObject.calcTransformMatrix()
          )
        );
      }

      function getObjectSizeWithStroke(object: {
        strokeUniform: any;
        scaleX: number;
        scaleY: number;
        strokeWidth: number;
        width: number;
        height: number;
      }) {
        var stroke = new fabric.Point(
          object.strokeUniform ? 1 / object.scaleX : 1,
          object.strokeUniform ? 1 / object.scaleY : 1
        ).multiply(object.strokeWidth);
        return new fabric.Point(
          object.width + stroke.x,
          object.height + stroke.y
        );
      }

      // define a function that will define what the control does
      // this function will be called on every mouse move after a control has been
      // clicked and is being dragged.
      // The function receive as argument the mouse event, the current trasnform object
      // and the current position in canvas coordinate
      // transform.target is a reference to the current object being transformed,
      function actionHandler(
        eventData: any,
        transform: any,
        x: number,
        y: number,
        pointIndex: number
      ) {
        var polygon = transform.target,
          currentControl = polygon.controls[polygon.__corner],
          mouseLocalPosition = polygon.toLocalPoint(
            new fabric.Point(x, y),
            "center",
            "center"
          ),
          polygonBaseSize = getObjectSizeWithStroke(polygon),
          size = polygon._getTransformedDimensions(0, 0),
          finalPointPosition = {
            x:
              (mouseLocalPosition.x * polygonBaseSize.x) / size.x +
              polygon.pathOffset.x,
            y:
              (mouseLocalPosition.y * polygonBaseSize.y) / size.y +
              polygon.pathOffset.y,
          };
        polygon.points[pointIndex] = finalPointPosition;
        return true;
      }

      // define a function that can keep the polygon in the same position when we change its
      // width/height/top/left.
      function anchorWrapper(anchorIndex: number, fn: CallableFunction) {
        return function (eventData: any, transform: any, x: any, y: any) {
          var fabricObject = transform.target,
            absolutePoint = fabric.util.transformPoint(
              new fabric.Point(
                fabricObject.points[anchorIndex].x - fabricObject.pathOffset.x,
                fabricObject.points[anchorIndex].y - fabricObject.pathOffset.y
              ),
              fabricObject.calcTransformMatrix()
            ),
            actionPerformed = fn(eventData, transform, x, y),
            newDim = fabricObject._setPositionDimensions({}),
            polygonBaseSize = getObjectSizeWithStroke(fabricObject),
            newX =
              (fabricObject.points[anchorIndex].x - fabricObject.pathOffset.x) /
              polygonBaseSize.x,
            newY =
              (fabricObject.points[anchorIndex].y - fabricObject.pathOffset.y) /
              polygonBaseSize.y;
          fabricObject.setPositionByOrigin(
            absolutePoint,
            newX + 0.5,
            newY + 0.5
          );
          return actionPerformed;
        };
      }

      function Edit(poly: fabric.Polygon) {
        // clone what are you copying since you
        // may want copy and paste on different moment.
        // and you do not want the changes happened
        // later to reflect on the copy.
        canvas.setActiveObject(poly);
        edit = !edit;
        if (edit) {
          var lastControl = points.length - 1;
          poly.cornerStyle = "circle";
          poly.cornerColor = "rgba(0,0,255,0.5)";
          poly.controls = points.reduce(function (
            acc: Record<string, any>,
            point,
            index
          ) {
            acc["p" + index] = new fabric.Control({
              positionHandler: (
                dim,
                finalMatrix,
                fabricObject,
                currentControl
              ) =>
                polygonPositionHandler(dim, finalMatrix, fabricObject, index),
              actionHandler: anchorWrapper(
                index > 0 ? index - 1 : lastControl,
                (eventData: any, transform: any, x: any, y: any) =>
                  actionHandler(eventData, transform, x, y, index)
              ),
              actionName: "modifyPolygon",
            });
            return acc;
          }, {});
        } else {
          poly.cornerColor = "blue";
          poly.cornerStyle = "rect";
          poly.controls = fabric.Object.prototype.controls;
        }
        poly.hasBorders = !edit;
        canvas.requestRenderAll();
      }
    },
    addImage: (value: string) => {
      fabric.Image.fromURL(
        value,
        function (image) {
          const workspace = getWorkspace();

          image.scaleToWidth(workspace?.width || 0);
          image.scaleToHeight(workspace?.height || 0);
          addToCanvas(image);
        },
        { crossOrigin: "anonymous" }
      );
    },
    useWatch: <K extends keyof EditorProperties>(
      name: K
    ): EditorProperties[K] => {
      const [value, setValue] = useState<EditorProperties[K]>();
      registerWatcher(name, () => {
        setValue(editorProperties.current[name]);
      });
      return value;
    },
    setEditorProperty,
  };
}

export type Editor = ReturnType<typeof buildEditor>;
