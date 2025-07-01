import {
  Ref,
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { fabric } from "fabric";
import { useAutoResize } from "./use-auto-resize";
import { useCanvasEvents } from "./use-canvas-events";
import { useClipboard } from "./use-clipboard";
import { HistoryType, useHistory } from "./use-history";
import { createFilter, downloadFile, transformText } from "../utils";
import { nanoid } from "nanoid";
import { useHotKeys } from "./use-hotkeys";
import { JSON_KEYS } from "../types";

interface Props {
  defaultHeight: number;
  defaultWidth: number;
}

export interface EditorProperties {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  selectedObjects?: fabric.Object[];
  background?: string;
  text?: string;
  fontWeight?: string | number;
  fontFamily?: string;
  fontSize?: number;
  fontStyle?: "" | "normal" | "italic" | "oblique";
  textAlign?: string;
  linethrough?: boolean;
  underline?: boolean;
  objectType?: "textbox" | "image";
  top?: number;
  width?: number;
  height?: number;
  scaleX?: number;
  scaleY?: number;
  filters?: fabric.IBaseFilter[];
}
export const useEditor = ({ defaultHeight, defaultWidth }: Props) => {
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  // const [selectedObjects, setSelectedObjects] = useState<fabric.Object[]>([]);
  const editorProperties = useRef<EditorProperties>({
    // strokeWidth: 0,
    selectedObjects: [],
    objectType: undefined,
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
      callback();
      watchers.current[name].add(callback);
      console.log({ watchers });
    },
    []
  );

  const unregisterWatcher = useCallback(
    <K extends keyof EditorProperties>(name: K, callback: () => void) => {
      watchers.current[name]?.delete(callback);
    },
    []
  );

  const setSelectedObjects = useCallback((objects: fabric.Object[]) => {
    const selectedObject = objects.length > 0 ? objects[0] : null;
    const newProperties: EditorProperties = {};

    if (selectedObject) {
      newProperties.fill =
        (selectedObject.get("fill") as string) || "rgba(0, 0, 0, 1)";
      newProperties.stroke = selectedObject.get("stroke") || "rgba(0, 0, 0, 1)";
      newProperties.strokeWidth = selectedObject.get("strokeWidth") || 0;
      newProperties.top = selectedObject.get("top");
      newProperties.width = selectedObject.get("width");
      newProperties.height = selectedObject.get("height");
      newProperties.scaleX = selectedObject.get("scaleX");
      newProperties.scaleY = selectedObject.get("scaleY");
    }

    const textbox = selectedObject as fabric.Textbox;
    const image = selectedObject as fabric.Image;
    if (objects.length === 1 && textbox && textbox.get("text") !== undefined) {
      newProperties.objectType = "textbox";
      newProperties.text = textbox.get("text");
      newProperties.fontWeight = textbox.get("fontWeight");
      newProperties.fontFamily = textbox.get("fontFamily");
      newProperties.fontStyle = textbox.get("fontStyle");
      newProperties.fontSize = textbox.get("fontSize");
      newProperties.linethrough = textbox.get("linethrough");
      newProperties.underline = textbox.get("underline");
      newProperties.textAlign = textbox.get("textAlign");
    } else if (objects.length === 1 && image && image.isType("image")) {
      newProperties.objectType = "image";
      newProperties.filters = image.get("filters");
    }

    console.log({ fill: newProperties.fill, ff: selectedObject?.get("fill") });

    setEditorProperty("fill", newProperties.fill);
    setEditorProperty("stroke", newProperties.stroke);
    setEditorProperty("objectType", newProperties.objectType);
    setEditorProperty("text", newProperties.text);
    setEditorProperty("strokeWidth", newProperties.strokeWidth);
    setEditorProperty("width", newProperties.width);
    setEditorProperty("height", newProperties.height);
    setEditorProperty("scaleX", newProperties.scaleX);
    setEditorProperty("scaleY", newProperties.scaleY);
    setEditorProperty("fontWeight", newProperties.fontWeight);
    setEditorProperty("fontFamily", newProperties.fontFamily);
    setEditorProperty("fontStyle", newProperties.fontStyle);
    setEditorProperty("fontSize", newProperties.fontSize);
    setEditorProperty("linethrough", newProperties.linethrough);
    setEditorProperty("underline", newProperties.underline);

    setEditorProperty("filters", newProperties.filters);

    setEditorProperty("selectedObjects", objects);
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

  useHotKeys({
    canvas,
    undo: history.undo,
    redo: history.redo,
    copy,
    paste,
    save: history.save,
  });

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
      unregisterWatcher,
    });
  }, [canvas, setEditorProperty, autoZoom, history]);

  return { editor, init };
};

interface BuildEditorProps {
  canvas: fabric.Canvas;
  autoZoom: () => void;
  copy: () => void;
  paste: () => void;
  history: HistoryType;
  editorProperties: RefObject<EditorProperties>;
  setEditorProperty: <K extends keyof EditorProperties>(
    name: K,
    value: EditorProperties[K]
  ) => void;
  registerWatcher: <K extends keyof EditorProperties>(
    name: K,
    callback: () => void
  ) => void;
  unregisterWatcher: <K extends keyof EditorProperties>(
    name: K,
    callback: () => void
  ) => void;
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
  unregisterWatcher,
}: BuildEditorProps) {
  const generateSaveOptions = () => {
    const { width, height, left, top } = getWorkspace() as fabric.Rect;

    return {
      name: "Image",
      format: "png",
      quality: 1,
      width,
      height,
      left,
      top,
    };
  };

  const savePng = () => {
    const options = generateSaveOptions();

    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    const dataUrl = canvas.toDataURL(options);

    downloadFile(dataUrl, "png");
    autoZoom();
  };

  const saveSvg = () => {
    const options = generateSaveOptions();

    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    const dataUrl = canvas.toDataURL(options);

    downloadFile(dataUrl, "svg");
    autoZoom();
  };

  const saveJson = () => {
    const dataUrl = canvas.toJSON(JSON_KEYS);

    transformText(dataUrl.objects);
    const fileString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(dataUrl, null, "\t")
    )}`;
    downloadFile(fileString, "json");
  };

   const loadJson = (json: string) => {
    const data = JSON.parse(json);

    canvas.loadFromJSON(data, () => {
      autoZoom();
    });
  };


  const center = (object: fabric.Object) => {
    const workpsace = getWorkspace();
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
    return canvas.getObjects().find(object => object.name === "workspace") as fabric.Rect;
  };

  return {
    canvas,
    getWorkspace,
    savePng,
    saveSvg,
    saveJson,
    loadJson,
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
    changeStrokeWidth: (value: number) => {
      canvas.getActiveObjects().forEach((object) => {
        object.set({ strokeWidth: value });
      });
      setEditorProperty("strokeWidth", value);
      canvas.renderAll();
    },
    changeText: (value: string) => {
      canvas.getActiveObjects().forEach((object) => {
        const textbox = object as fabric.Textbox;
        if (textbox.get("text") !== undefined) {
          textbox.set({ text: value });
        }
      });
      setEditorProperty("text", value);
      canvas.renderAll();
    },
    changeFontWeight: (value: string) => {
      let fontWeight = 400;
      if (!isNaN(parseInt(value))) fontWeight = parseInt(value);
      canvas.getActiveObjects().forEach((object) => {
        const textbox = object as fabric.Textbox;
        if (textbox.get("text") !== undefined) {
          textbox.set({ fontWeight });
        }
      });
      setEditorProperty("fontWeight", fontWeight);
      canvas.renderAll();
    },
    changeFontFamily: (value: string) => {
      canvas.getActiveObjects().forEach((object) => {
        const textbox = object as fabric.Textbox;
        if (textbox.get("text") !== undefined) {
          textbox.set({ fontFamily: value });
        }
      });
      setEditorProperty("fontFamily", value);
      canvas.renderAll();
    },
    changeFontStyle: (value: EditorProperties["fontStyle"]) => {
      canvas.getActiveObjects().forEach((object) => {
        const textbox = object as fabric.Textbox;
        if (textbox.get("text") !== undefined) {
          textbox.set({ fontStyle: value });
        }
      });
      setEditorProperty("fontStyle", value);
      canvas.renderAll();
    },
    changeFontSize: (value: EditorProperties["fontSize"]) => {
      canvas.getActiveObjects().forEach((object) => {
        const textbox = object as fabric.Textbox;
        if (textbox.get("text") !== undefined) {
          textbox.set({ fontSize: value });
        }
      });
      setEditorProperty("fontSize", value);
      canvas.renderAll();
    },
    changeUnderline: (value: EditorProperties["underline"]) => {
      canvas.getActiveObjects().forEach((object) => {
        const textbox = object as fabric.Textbox;
        if (textbox.get("text") !== undefined) {
          textbox.set({ underline: value });
        }
      });
      setEditorProperty("underline", value);
      canvas.renderAll();
    },
    changeLinethrough: (value: EditorProperties["linethrough"]) => {
      canvas.getActiveObjects().forEach((object) => {
        const textbox = object as fabric.Textbox;
        if (textbox.get("text") !== undefined) {
          textbox.set({ linethrough: value });
        }
      });
      setEditorProperty("linethrough", value);
      canvas.renderAll();
    },
    changeTextAlign: (value: EditorProperties["textAlign"]) => {
      canvas.getActiveObjects().forEach((object) => {
        const textbox = object as fabric.Textbox;
        if (textbox.get("text") !== undefined) {
          textbox.set({ textAlign: value });
        }
      });
      setEditorProperty("textAlign", value);
      canvas.renderAll();
    },
    changeWidth: (value: number) => {
      canvas.getActiveObjects().forEach((object) => {
        object.set({ width: value });
      });
      setEditorProperty("width", value);
      canvas.renderAll();
    },
    changeHeight: (value: number) => {
      canvas.getActiveObjects().forEach((object) => {
        object.set({ height: value });
      });
      setEditorProperty("height", value);
      canvas.renderAll();
    },
    changeScaleX: (value: number) => {
      canvas.getActiveObjects().forEach((object) => {
        object.set({ scaleX: value });
      });
      setEditorProperty("scaleX", value);
      canvas.renderAll();
    },
    changeScaleY: (value: number) => {
      canvas.getActiveObjects().forEach((object) => {
        object.set({ scaleY: value });
      });
      setEditorProperty("scaleY", value);
      canvas.renderAll();
    },
    addRectangle: () => {
      const color = "rgba(0, 0, 0, 1)";
      const object = new fabric.Rect({
        left: 100,
        top: 100,
        width: 400,
        height: 500,
        strokeWidth: editorProperties.current.strokeWidth ?? 0,
        stroke: editorProperties.current.stroke ?? color,
        fill: editorProperties.current.fill ?? color,
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
    addFilter: (value: string) => {
      const filter = createFilter(value);
      if (filter) {
        const object = canvas.getActiveObject() as fabric.Image;
        if (!object.filters) {
          object.filters = [];
        }
        filter.setOptions({ id: nanoid(), name: value });
        object.filters.push(filter);
        const filters = [...object.filters];
        object.applyFilters();
        setEditorProperty("filters", filters);
        canvas.renderAll();
      }
    },
    changeFilter: (id: string, value: string) => {
      const filter = createFilter(value);
      const object = canvas.getActiveObject() as fabric.Image;
      const filterIdx = object.filters?.findIndex(
        (item) => (item as any).id === id
      );

      if (
        filter &&
        filterIdx !== undefined &&
        filterIdx >= 0 &&
        object.filters
      ) {
        filter.setOptions({ id: nanoid(), name: value });
        object.filters.splice(filterIdx, 1, filter);
        const filters = [...object.filters];
        object.applyFilters();
        setEditorProperty("filters", filters);
        canvas.renderAll();
      }
    },
    deleteFilter: (id: string) => {
      const object = canvas.getActiveObject() as fabric.Image;

      const filterIdx = object.filters?.findIndex(
        (item) => (item as any).id === id
      );

      if (filterIdx !== undefined && filterIdx >= 0 && object.filters) {
        object.filters?.splice(filterIdx, 1);
        object.applyFilters();
        const filters = [...object.filters];
        object.applyFilters();
        setEditorProperty("filters", filters);
        canvas.renderAll();
      }
    },
    addText: (value: string = "Text") => {
      const object = new fabric.Textbox(value, {
        fill: editorProperties.current.fill ?? "#000",
        fontFamily: "Arial",
        fontWeight: 400,
      });
      addToCanvas(object);
    },
    useWatch: <K extends keyof EditorProperties>(
      name: K
    ): EditorProperties[K] => {
      const [value, setValue] = useState<EditorProperties[K]>();
      const onValueChange = useCallback(() => {
        console.log("onValueChange", name, editorProperties.current[name]);
        setValue(editorProperties.current[name]);
      }, []);

      useEffect(() => {
        registerWatcher(name, onValueChange);
        console.log("register", name);

        return () => {
          unregisterWatcher(name, onValueChange);
          console.log("unregister", name);
        };
        // registerWatcher(name, () => {
        //   setValue(editorProperties.current[name]);
        // })
      }, [registerWatcher, unregisterWatcher]);
      return value;
    },
    setEditorProperty,
  };
}

export type Editor = ReturnType<typeof buildEditor>;
