import { useParams } from "next/navigation";

export const useProjectId = () => {
  const { projectId } = useParams();
  return parseInt(projectId as string);
};
