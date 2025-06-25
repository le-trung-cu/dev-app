"use client";
import { useEffect, useRef, useState } from "react";
import rough from "roughjs";
import { RoughCanvas } from "roughjs/bin/canvas";
import { toast } from "sonner";
import { moveAllLeft, moveOneLeft } from "./zindex";

var generator = rough.generator();

export default function EditorPage() {
  const [elementType, setElementType] = useState("rectangle");
  const canvas = useRef<HTMLCanvasElement>(null);
  const container = useRef<HTMLDivElement>(null);
  const draggingElement = useRef<Element>(null);
  const elements = useRef<Element[]>([]);
  const state = useRef<{
    scrollX: number;
    scrollY: number;
  }>({ scrollX: 0, scrollY: 0 });

  function onRadioChange(e: any) {
    clearSelected();
    setElementType(e.target.value);
  }

  useEffect(() => {
    function handleKeypress(e: KeyboardEvent) {
      console.log(e);
      e.preventDefault();
      if (e.key === "Backspace") {
        for (let i = elements.current.length - 1; i >= 0; i--) {
          if (elements.current[i].isSelected) {
            elements.current.splice(i, 1);
          }
        }
      }
      if (["ArrowUp", "ArrowLeft", "ArrowDown", "ArrowRight"].includes(e.key)) {
        const step = e.shiftKey ? 5 : 1;
        const direct = ["ArrowDown", "ArrowRight"].includes(e.key) ? 1 : -1;
        const offset = direct * step;

        if (["ArrowUp", "ArrowDown"].includes(e.key)) {
          elements.current.forEach((element) => {
            if (element.isSelected) {
              element.y += offset;
            }
          });
        } else {
          elements.current.forEach((element) => {
            if (element.isSelected) {
              element.x += offset;
            }
          });
        }
      }
      
      // Send backwards: Cmd-Shift-Alt-B
      if (e.metaKey && e.shiftKey && e.altKey && e.code === "KeyB") {
        const indicates = getIndicates();
        moveOneLeft(elements.current, indicates);
        // Send to back: Cmd-Shift-B
      } else if (e.metaKey && e.shiftKey && e.code === "KeyB") {
        const indicates = getIndicates();
        moveAllLeft(elements.current, indicates);
      // Select all: Cmd-A
      }else if (e.metaKey  && e.code === "KeyA") {
        elements.current.forEach((el) => (el.isSelected = true));
      }
      draw();

      function getIndicates() {
        const indicates = new Array<number>();
        elements.current.forEach((el, idx) => {
          if (el.isSelected) {
            indicates.push(idx);
          }
        });

        return indicates;
      }
    }

    async function handleCopy() {
      const selectedElements = elements.current.filter((el) => el.isSelected);

      await navigator.clipboard.writeText(
        JSON.stringify({ elements: selectedElements })
      );
    }

    async function handleCut() {
      const selectedElements = elements.current.filter((el) => el.isSelected);
      await navigator.clipboard.writeText(
        JSON.stringify({ elements: selectedElements })
      );
      for (let i = elements.current.length - 1; i >= 0; --i) {
        if (elements.current[i].isSelected) elements.current.splice(i, 1);
      }
      draw();
    }

    async function handlePaste() {
      const elementStr = await navigator.clipboard.readText();
      const _elements = JSON.parse(elementStr);
      _elements.elements?.forEach((element: Element) => {
        element.x += 10;
        element.y += 10;
        generateShape(element);
      });
      elements.current.push(..._elements.elements);
      draw();
    }

    document.addEventListener("keydown", handleKeypress);

    document.addEventListener("copy", handleCopy);
    document.addEventListener("cut", handleCut);
    document.addEventListener("paste", handlePaste);

    return () => {
      document.removeEventListener("keydown", handleKeypress);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("cut", handleCut);
      document.removeEventListener("paste", handlePaste);
    };
  }, []);

  function draw() {
    if (!canvas.current) return;
    const rc = rough.canvas(canvas.current);
    const context = canvas.current.getContext("2d")!;

    context?.clearRect(0.5, 0.5, canvas.current?.width, canvas.current?.height);
    context.save();
    // This translation ensures that 1px lines are rendered sharply on the canvas,
    // preventing blurry or double-width lines due to subpixel rendering.
    context.translate(0.5, 0.5);
    elements.current.forEach((element) => {
      element.draw(rc, context, state.current);
    });

    const padding = 5;
    context.strokeStyle = "blue";
    context.setLineDash([6, 6]);
    elements.current.forEach((element) => {
      if (element.isSelected) {
        const elementNormal = getBoundingBox(element);
        context.strokeRect(
          elementNormal.x - padding + state.current.scrollX,
          elementNormal.y - padding + state.current.scrollY,
          elementNormal.width + 2 * padding,
          elementNormal.height + 2 * padding
        );
      }
    });
    context.restore();

    console.log(
      state.current,
      canvas.current.width - 200,
      -state.current.scrollX / (1 + Math.pow(state.current.scrollX, 2))
    );

    // draw scrollbar
    const width = canvas.current.width;
    const height = canvas.current.height;
    const { scrollX, scrollY } = state.current;
    context.save();
    context.fillStyle = SCROLLBAR_COLOR;
    const { vertical, horizontal } = getScrollbars(
      width,
      height,
      scrollX,
      scrollY
    );
    context.fillRect(vertical.x, vertical.y, vertical.width, vertical.height);
    context.fillRect(
      horizontal.x,
      horizontal.y,
      horizontal.width,
      horizontal.height
    );
    context.restore();
  }

  function clearSelected() {
    elements.current.forEach((element) => {
      element.isSelected = false;
    });
  }

  useEffect(() => {
    draw();
  });

  return (
    <div className="h-screen w-screen flex flex-col">
      <div className="flex gap-10 p-10">
        <label>
          <input
            type="radio"
            name="elementType"
            value="rectangle"
            checked={elementType === "rectangle"}
            onChange={onRadioChange}
          />
          rectangle
        </label>
        <label>
          <input
            type="radio"
            name="elementType"
            value="selection"
            checked={elementType === "selection"}
            onChange={onRadioChange}
          />
          selection
        </label>
      </div>
      <div className="flex-1 relative" onCopy={(e) => console.log("Copy...")}>
        <div
          ref={(elem) => {
            if (elem) {
              canvas.current!.width = elem.clientWidth;
              canvas.current!.height = elem.clientHeight;
            }
          }}
          className="h-full absolute inset-0"
        >
          <canvas
            className="touch-none"
            ref={(elem) => {
              canvas.current = elem;
              const onWheel = (e: WheelEvent) => {
                e.preventDefault();
                const { deltaX, deltaY } = e;
                state.current.scrollX -=
                  Math.sign(deltaX) * Math.min(20, Math.abs(deltaX * 0.5));
                state.current.scrollY -=
                  Math.sign(deltaY) * Math.min(20, Math.abs(deltaY * 0.5));
                draw();
              };
              canvas.current?.addEventListener("wheel", onWheel, {
                passive: false,
              });
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              if (!canvas.current) return;
              const { x, y } = getMousePosition(e, state.current);
              const element = newElement(elementType, x, y);
              let isDraggingElements = false;
              const cursorStyle = document.documentElement.style.cursor;

              if (elementType === "selection") {
                const hitElement = elements.current.find((element) => {
                  return hitTest(element, x, y);
                });

                //If we click on something
                if (hitElement) {
                  if (hitElement.isSelected) {
                    // If that element is already selected, do nothing,
                    // we're likely going to drag it
                  } else {
                    // We unselect every other elements unless shift is pressed
                    if (!e.shiftKey) {
                      clearSelected();
                    }
                    hitElement.isSelected = true;
                  }
                } else {
                  clearSelected();
                }

                isDraggingElements = elements.current.some((element) => {
                  return element.isSelected;
                });
                if (isDraggingElements) {
                  document.documentElement.style.cursor = "move";
                }
              }

              generateShape(element);
              elements.current.push(element);
              draggingElement.current = element;

              let lastX = x;
              let lastY = y;

              const onMouseMove = (e: MouseEvent) => {
                const target = e.target;
                if (!(target instanceof HTMLElement)) {
                  return;
                }
                const { x, y } = getMousePosition(e, state.current);

                if (isDraggingElements) {
                  const selectedElements = elements.current.filter(
                    (el) => el.isSelected
                  );
                  if (selectedElements.length) {
                    selectedElements.forEach((element) => {
                      element.x += x - lastX;
                      element.y += y - lastY;
                    });

                    lastX = x;
                    lastY = y;
                    draw();
                    return;
                  }
                }
                if (!draggingElement.current) return;

                let width = x - draggingElement.current.x;
                let height = y - draggingElement.current.y;
                draggingElement.current.width = width;
                // Make a perfect square or circle when shift is enabled
                draggingElement.current.height = e.shiftKey ? width : height;
                generateShape(draggingElement.current);

                if (elementType === "selection") {
                  setSelected(draggingElement.current, elements.current);
                }
                draw();
              };

              const onMouseUp = (e: MouseEvent) => {
                if (!canvas.current) return;

                window.removeEventListener("mousemove", onMouseMove);
                window.removeEventListener("mouseup", onMouseUp);

                document.documentElement.style.cursor = cursorStyle;

                // if no element is clicked, clear the selection and redraw
                if (!draggingElement.current) {
                  clearSelected();
                  draw();
                  return;
                }

                if (elementType === "selection") {
                  if (isDraggingElements) {
                    isDraggingElements = false;
                  }
                  elements.current.pop();
                } else {
                  draggingElement.current.isSelected = true;
                }
                draggingElement.current = null;
                setElementType("selection");
                draw();
              };

              window.addEventListener("mousemove", onMouseMove);
              window.addEventListener("mouseup", onMouseUp);
              draw();
            }}
          />
        </div>
      </div>
    </div>
  );
}

function getMousePosition(
  e: MouseEvent | React.MouseEvent<HTMLCanvasElement, MouseEvent>,
  { scrollX, scrollY }: { scrollX: number; scrollY: number }
) {
  const { left, top } = (e.target as HTMLCanvasElement).getBoundingClientRect();
  const x = e.clientX - left - scrollX;
  const y = e.clientY - top - scrollY;

  return { x, y };
}

type SceneState = {
  scrollX: number;
  scrollY: number;
  // null indicates transparent bg
  // viewBackgroundColor: string | null;
};

function newElement(type: string, x: number, y: number) {
  const element = {
    isSelected: false,
    type,
    x,
    y,
    width: 0,
    height: 0,
    draw: (
      rc: RoughCanvas,
      context: CanvasRenderingContext2D,
      sceneState: SceneState
    ) => {},
  };

  generateShape(element);

  return element;
}

type Element = ReturnType<typeof newElement>;

function generateShape(element: Element) {
  if (element.type === "selection") {
    element.draw = (rc, context, { scrollX, scrollY }) => {
      context.fillStyle = "rgba(0, 0, 255, 0.10)";
      context.fillRect(
        element.x + scrollX,
        element.y + scrollY,
        element.width,
        element.height
      );
    };
  } else if (element.type === "rectangle") {
    const shape = generator.rectangle(0, 0, element.width, element.height, {
      fill: "red",
      fillStyle: "zigzag",
    });

    element.draw = (rc, context, { scrollX, scrollY }) => {
      context.translate(element.x + scrollX, element.y + scrollY);
      rc.draw(shape);
      context.translate(-element.x - scrollX, -element.y - scrollY);
    };
  }
}

/**
 * Updates the `isSelected` property of each element in the provided array based on whether
 * the element is inside the given selection area.
 *
 * The function accounts for elements that may have negative width or height, which can occur
 * if they were drawn from right to left or bottom to top.
 *
 * @param selection - The selection area, represented as an `Element`, used to determine which elements are selected.
 * @param elements - An array of `Element` objects to be checked and updated for selection status.
 */
function setSelected(selection: Element, elements: Element[]) {
  /**
   * if element was draw from right to left then the width was negative.
   * it was the same with height
   */
  const selectionNormal = getBoundingBox(selection);

  for (const element of elements) {
    if (element.type !== "selection") {
      const elementNormal = getBoundingBox(element);
      element.isSelected = isInside(elementNormal, selectionNormal);
    }
  }
}

function getBoundingBox(element: Element) {
  const top = element.height >= 0 ? element.y : element.y + element.height;
  const left = element.width >= 0 ? element.x : element.x + element.width;

  const width = Math.abs(element.width);
  const height = Math.abs(element.height);

  return { x: left, y: top, width, height };
}
type BoundingBox = ReturnType<typeof getBoundingBox>;

function isInside(element: BoundingBox, container: BoundingBox) {
  return (
    element.x >= container.x &&
    element.y >= container.y &&
    element.x + element.width <= container.x + container.width &&
    element.y + element.height <= container.y + container.height
  );
}

// https://stackoverflow.com/a/6853926/232122
function distanceBetweenPointAndSegment(
  x: number,
  y: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
) {
  const A = x - x1;
  const B = y - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A * C + B * D;
  const lenSquare = C * C + D * D;
  let param = -1;
  if (lenSquare !== 0) {
    // in case of 0 length line
    param = dot / lenSquare;
  }

  let xx, yy;
  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  const dx = x - xx;
  const dy = y - yy;
  return Math.sqrt(dx * dx + dy * dy);
}

function hitTest(element: Element, x: number, y: number) {
  // For shapes that are composed of lines, we only enable point-selection when the distance
  // of the click is less than x pixels of any of the lines that the shape is composed of
  const lineThreshold = 10;

  if (element.type === "rectangle") {
    const box = getBoundingBox(element);
    const x1 = box.x;
    const x2 = box.x + box.width;
    const y1 = box.y;
    const y2 = box.y + box.height;

    // (x1, y1) --A-- (x2, y1)
    //    |D             |B
    // (x1, y2) --C-- (x2, y2)
    return (
      distanceBetweenPointAndSegment(x, y, x1, y1, x2, y1) < lineThreshold || //A
      distanceBetweenPointAndSegment(x, y, x2, y1, x2, y2) < lineThreshold || // B
      distanceBetweenPointAndSegment(x, y, x1, y2, x2, y2) < lineThreshold || // C
      distanceBetweenPointAndSegment(x, y, x1, y1, x1, y2) < lineThreshold // D
    ); // D
  }
  throw new Error("Unimplemented type " + element.type);
}

const SCROLLBAR_WIDTH = 6;
const SCROLLBAR_MARGIN = 4;
const SCROLLBAR_COLOR = "rgba(0,0,0,0.3)";

function getScrollbars(
  canvasWidth: number,
  canvasHeight: number,
  scrollX: number,
  scrollY: number
) {
  // horizontal scrollbar
  const sceneWidth = canvasWidth + Math.abs(scrollX);
  const scrollWidth = (canvasWidth * canvasWidth) / sceneWidth;
  const scrollBarX = scrollX > 0 ? 0 : canvasWidth - scrollWidth;
  const horizontalScrollBar = {
    x: scrollBarX + SCROLLBAR_MARGIN,
    y: canvasHeight - SCROLLBAR_WIDTH - SCROLLBAR_MARGIN,
    width: scrollWidth,
    height: SCROLLBAR_WIDTH,
  };

  // vertical scrollbar
  const sceneHeight = canvasHeight + Math.abs(scrollY);
  const scrollBarHeight = (canvasHeight * canvasHeight) / sceneHeight;
  const scrollBarY = scrollY > 0 ? 0 : canvasHeight - scrollBarHeight;
  const verticalScrollBar = {
    x: canvasWidth - SCROLLBAR_WIDTH - SCROLLBAR_MARGIN,
    y: scrollBarY + SCROLLBAR_MARGIN,
    width: SCROLLBAR_WIDTH,
    height: scrollBarHeight - SCROLLBAR_WIDTH * 2,
  };

  return {
    horizontal: horizontalScrollBar,
    vertical: verticalScrollBar,
  };
}
