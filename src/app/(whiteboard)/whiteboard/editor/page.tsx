
"use client";
import { useEffect, useRef, useState } from "react";
import rough from "roughjs";
import { RoughCanvas } from "roughjs/bin/canvas";

const generator = rough.generator();

export default function EditorPage() {
  const [elementType, setElementType] = useState("");
  const canvas = useRef<HTMLCanvasElement>(null);
  const container = useRef<HTMLDivElement>(null);
  const draggingElement = useRef<ReturnType<typeof newElement>>(null);
  const elements = useRef<ReturnType<typeof newElement>[]>([]);

  function onRadioChange(e: any) {
    setElementType(e.target.value);
  }

  function draw() {
    const rc = rough.canvas(canvas.current);
    const context = canvas.current?.getContext("2d");
    context?.clearRect(0, 0, canvas.current?.width, canvas.current?.height);

    elements.current.forEach((element) => {
      element.draw(rc, context);
    });
  }

  useEffect(() => {
    draw();
  })

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

                if(draggingElement.current.type === "selection") {
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

function generateShape(element: {
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  draw: (rc: RoughCanvas, context: CanvasRenderingContext2D) => void;
}) {
  if (element.type === "selection") {
    element.draw = (rc: RoughCanvas, context: CanvasRenderingContext2D) => {
      console.log("ttttt");
      context.fillStyle = "rgba(0, 0, 255, 0.10)";
      context.fillRect(element.x, element.y, element.width, element.height);
    };
  } else if (element.type === "rectangle") {
    const shape = generator.rectangle(
      element.x,
      element.y,
      element.width,
      element.height
    );
    element.draw = (rc: RoughCanvas, context: CanvasRenderingContext2D) => {
      rc.draw(shape);
    };
  }
}



  function setSelected(current: { type: string; x: number; y: number; width: number; height: number; draw: (rc: RoughCanvas, context: CanvasRenderingContext2D) => void; }, current1: { type: string; x: number; y: number; width: number; height: number; draw: (rc: RoughCanvas, context: CanvasRenderingContext2D) => void; }[]) {
    console.log(JSON.stringify(current))
  }
