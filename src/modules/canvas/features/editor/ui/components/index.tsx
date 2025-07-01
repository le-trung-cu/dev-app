"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import { Canvas } from "./canvas";
import { Toolbar } from "./toolbar";
import { Navbar } from "./navbar";
import { Sidebar } from "./sidebar";
import { useEditor } from "../../hooks/use-editor";
import { SidebarProperties } from "./sidebar-properties";
import { SidebarImages } from "./sidebar-images";
import { SidebarSettings } from "./sidebar-settings";

// Layout editort, resize canvas
interface Props {
  initialValues: {
    width: number;
    height: number;
  };
}
export const Editor = ({ initialValues }: Props) => {
  const [openProperties, setOpenProperties] = useState(true);
  const [openSidebarImage, setOpenSidebarImage] = useState(false);
  const [openSidebarSettings, setOpenSidebarSettings] = useState(false);
  const ref = useRef<fabric.Canvas>(null);

  const { editor, init } = useEditor({
    defaultHeight: initialValues.height,
    defaultWidth: initialValues.width,
  });
  const containerRef = useRef<HTMLDivElement>(null);

  const onLoad = useCallback(
    (canvas: fabric.Canvas) => {
      init({ canvas, container: containerRef.current! });
    },
    [ref]
  );

  return (
    <div className="relative h-screen flex flex-col w-full">
      <Navbar editor={editor}/>
      <div className="absolute h-[calc(100%-68px)] w-full top-[0px] flex">
        <SidebarImages
          editor={editor}
          open={openSidebarImage}
          onOpenChange={setOpenSidebarImage}
        />
        <main className="bg-muted flex-1 overflow-auto">
          <div ref={containerRef} className="h-[calc(100%-124px)] bg-muted">
            <Canvas ref={ref} onLoad={onLoad} />
          </div>
        </main>
        <Toolbar
          editor={editor}
          onOpenSidebarImages={() => setOpenSidebarImage(true)}
          setOpenSidebarSettings={() => setOpenSidebarSettings(true)}
        />
        {editor && !openSidebarSettings && (
          <SidebarProperties
            open={openProperties}
            onOpenChange={setOpenProperties}
            editor={editor}
          />
        )}
        {editor && openSidebarSettings && (
          <SidebarSettings
            open={openSidebarSettings}
            onOpenChange={setOpenSidebarSettings}
            editor={editor}
          />
        )}
      </div>
    </div>
  );
};
