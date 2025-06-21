"use client";
import { useEffect, useRef, useState } from "react";
import rough from "roughjs";
import { RoughCanvas } from "roughjs/bin/canvas";

const generator = rough.generator();

export default function EditorPage() {
  const [elementType, setElementType] = useState("");
  const canvas = useRef<HTMLCanvasElement>(null);
  const container = useRef<HTMLDivElement>(null);
  const draggingElement = useRef<Element>(null);
  const elements = useRef<Element[]>([]);

  function onRadioChange(e: any) {
    setElementType(e.target.value);
  }

  useEffect(() => {
    function handleKeypress(e: KeyboardEvent) {
      console.log("handleKeypress", e.key, { shiftKey: e.shiftKey }, e.keyCode);

      // if (e.defaultPrevented) {
      //   return;
      // }
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
              generateShape(element);
            }
          });
        } else {
          elements.current.forEach((element) => {
            if (element.isSelected) {
              element.x += offset;
              generateShape(element);
            }
          });
        }
      }
      draw();
    }
    document.addEventListener("keydown", handleKeypress);

    return () => {
      document.removeEventListener("keydown", handleKeypress);
    };
  }, []);

  function draw() {
    if (!canvas.current) return;
    const rc = rough.canvas(canvas.current);
    const context = canvas.current.getContext("2d")!;

    context?.clearRect(0, 0, canvas.current?.width, canvas.current?.height);
    context.save();
    // This translation ensures that 1px lines are rendered sharply on the canvas,
    // preventing blurry or double-width lines due to subpixel rendering.
    context.translate(0.5, 0.5);
    elements.current.forEach((element) => {
      element.draw(rc, context);
    });

    const padding = 5;
    context.strokeStyle = "blue";
    context.setLineDash([6, 6]);
    elements.current.forEach((element) => {
      if (element.isSelected) {
        const elementNormal = normalize(element);
        context.strokeRect(
          elementNormal.x - padding,
          elementNormal.y - padding,
          elementNormal.width + 2 * padding,
          elementNormal.height + 2 * padding
        );
      }
    });
    context.restore();
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
      <div className="flex-1 relative">
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
            className=""
            ref={canvas}
            onMouseDown={(e) => {
              const { left, top } = (
                e.target as HTMLCanvasElement
              ).getBoundingClientRect();
              const x = e.clientX - left;
              const y = e.clientY - top;

              const element = newElement(elementType, x, y);
              elements.current.push(element);
              draggingElement.current = element;
              draw();
            }}
            onMouseMove={(e) => {
              if (!!draggingElement.current) {
                const { left, top } = (
                  e.target as HTMLCanvasElement
                ).getBoundingClientRect();

                const width = e.clientX - left - draggingElement.current.x;
                const height = e.clientY - top - draggingElement.current.y;
                draggingElement.current.width = width;
                draggingElement.current.height = height;

                if (draggingElement.current.type === "selection") {
                  setSelected(draggingElement.current, elements.current);
                }
                generateShape(draggingElement.current);
                draw();
              }
            }}
            onMouseUp={(e) => {
              if (!!draggingElement.current) {
                if (draggingElement.current.type === "selection") {
                  elements.current.pop();
                }
                draggingElement.current = null;
                draw();
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}

function newElement(type: string, x: number, y: number) {
  const element = {
    isSelected: false,
    type,
    x,
    y,
    width: 0,
    height: 0,
    draw: (rc: RoughCanvas, context: CanvasRenderingContext2D) => {},
  };

  generateShape(element);

  return element;
}

type Element = ReturnType<typeof newElement>;

function generateShape(element: Element) {
  if (element.type === "selection") {
    element.draw = (rc: RoughCanvas, context: CanvasRenderingContext2D) => {
      context.fillStyle = "rgba(0, 0, 255, 0.10)";
      context.fillRect(element.x, element.y, element.width, element.height);
    };
  } else if (element.type === "rectangle") {
    const shape = generator.rectangle(0, 0, element.width, element.height);

    element.draw = (rc: RoughCanvas, context: CanvasRenderingContext2D) => {
      context.translate(element.x, element.y);
      rc.draw(shape);
      context.translate(-element.x, -element.y);
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
  const selectionNormal = normalize(selection);

  for (const element of elements) {
    if (element.type !== "selection") {
      const elementNormal = normalize(element);
      element.isSelected = isInside(elementNormal, selectionNormal);
    }
  }
}

function isInside(
  element: Pick<Element, "x" | "y" | "width" | "height">,
  container: Pick<Element, "x" | "y" | "width" | "height">
) {
  return (
    element.x >= container.x &&
    element.y >= container.y &&
    element.x + element.width <= container.x + container.width &&
    element.y + element.height <= container.y + container.height
  );
}

function normalize(element: Element) {
  const top = element.height >= 0 ? element.y : element.y + element.height;
  const left = element.width >= 0 ? element.x : element.x + element.width;

  const width = Math.abs(element.width);
  const height = Math.abs(element.height);

  return { x: left, y: top, width, height };
}
