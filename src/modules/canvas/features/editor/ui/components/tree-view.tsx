import { useEffect, useState } from "react";

export const TreeView = ({ canvas }: { canvas?: fabric.Canvas | null }) => {
  const [tree, setTree] = useState<any>({});
  useEffect(() => {
    if (!canvas) return;
    console.log("TreeView");
    const handle = (e?: fabric.IEvent<Event>) => {
      const objects1 = canvas.getObjects();
      const tree: Record<any, any> = {};
      for (const obj of objects1 as any) {
        if (obj.xtype === "group") {
          if (tree[obj.xid]) {
            tree[obj.xid].object = obj;
          } else {
            tree[obj.xid] = {
              object: obj,
              children: [],
            };
          }
        }
        if (obj.xparent) {
          if (!tree[obj.xparent as string]) {
            tree[obj.xparent as string] = {
              children: [],
            };
          }
          tree[obj.xparent].children.push(obj);
        }
      }

      console.log(tree);
      setTree(tree);
    };
    handle();
    canvas.on("object:modified", handle);
    return () => {
      canvas.off("object:modified", handle);
    };
  }, [canvas]);
  return (
    <div className="fixed left-0 h-[500px] w-full bottom-0 bg-gray-400 overflow-x-auto">
      <RenderTree
        node={tree["group A"]}
        onClick={(obj) => {
          console.log({ click: obj });
          if (obj) {
            canvas?.setActiveObject(obj);
            canvas?.renderAll();
          }
        }}
      />
    </div>
  );
};

function RenderTree({ node, onClick }: { node: any; onClick: (e) => void }) {
  return (
    <div>
      <div onClick={() => onClick(node.object ?? node)}>{node?.object?.xname ?? node?.xname}</div>
      <div className="pl-3">
        {node?.children?.map((child, i) => (
          <RenderTree key={i} node={child} onClick={(e) => onClick(e)} />
        ))}
      </div>
    </div>
  );
}
