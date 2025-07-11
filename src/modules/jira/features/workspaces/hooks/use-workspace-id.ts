import { useParams } from "next/navigation";

export const useWorkspaceId = () => {
  const { workspaceId } = useParams() as any;
  return workspaceId as string;
};
