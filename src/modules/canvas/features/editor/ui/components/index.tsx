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
import { useUpdateProject } from "../../../projects/api/use-update-project";
import debounce from "lodash.debounce";
import { useWorkspaceId } from "@/modules/jira/features/workspaces/hooks/use-workspace-id";
import { useProjectId } from "@/modules/jira/features/tasks/hooks/use-project-id";

// Layout editort, resize canvas
interface Props {
  initialValues: {
    width: number;
    height: number;
    json: string;
  };
}
export const Editor = ({ initialValues }: Props) => {
  const [openProperties, setOpenProperties] = useState(true);
  const [openSidebarImage, setOpenSidebarImage] = useState(false);
  const [openSidebarSettings, setOpenSidebarSettings] = useState(false);
  const workspaceId = useWorkspaceId();
  const projectId = useProjectId();
  const ref = useRef<fabric.Canvas>(null);
  const { mutate } = useUpdateProject({ workspaceId, projectId });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSave = useCallback(
    debounce((values: { json: string; height: number; width: number }) => {
      mutate(values);
    }, 500),
    [mutate]
  );

  const { editor, init } = useEditor({
    defaultHeight: initialValues.height,
    defaultWidth: initialValues.width,
    defaultState: initialValues.json,
    saveCallback: debouncedSave,
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
      <div className="absolute h-full w-full top-[0px] flex">
        <Navbar editor={editor} />
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
