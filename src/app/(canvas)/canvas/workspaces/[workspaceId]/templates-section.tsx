"use client";

import { useRouter } from "next/navigation";
import { Loader, TriangleAlert } from "lucide-react";
import { TemplateCard } from "./template-card";
import { useCreateProject } from "@/modules/canvas/features/projects/api/use-create-project";
import { ResponseType, useGetTemplates } from "@/modules/canvas/features/projects/api/use-get-templates";
import { useWorkspaceId } from "@/modules/jira/features/workspaces/hooks/use-workspace-id";

export const TemplatesSection = () => {
  const router = useRouter();
  const mutation = useCreateProject();
  const workspaceId = useWorkspaceId();

  const { data, isLoading, isError } = useGetTemplates({
    page: "1",
    limit: "4",
  });

  const onClick = (template: ResponseType["projects"][number]) => {
    mutation.mutate(
      {
        workspaceId,
        json: {
          name: `${template.name} project`,
          json: template.json,
          width: template.width,
          height: template.height,
        },
      },
      {
        onSuccess: ({ project }) => {
          router.push(`/canvas/workspaces/${workspaceId}/editor/${project.id}`);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Bắt đầu với một mẫu sẵn có</h3>
        <div className="flex items-center justify-center h-32">
          <Loader className="size-6 text-muted-foreground animate-spin" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Bắt đầu với một mẫu sẵn có</h3>
        <div className="flex flex-col gap-y-4 items-center justify-center h-32">
          <TriangleAlert className="size-6 text-muted-foreground" />
          <p>Failed to load templates</p>
        </div>
      </div>
    );
  }

  if (!data?.length) {
    return null;
  }

  return (
    <div>
      <h3 className="font-semibold text-lg">Bắt đầu với một mẫu sẵn có</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 mt-4 gap-4">
        {data?.map((template) => (
          <TemplateCard
            key={template.id}
            title={template.name}
            imageSrc={template.thumbnailUrl || ""}
            onClick={() => onClick(template)}
            disabled={mutation.isPending}
            description={`${template.width} x ${template.height} px`}
            width={template.width}
            height={template.height}
            isPro={false}
          />
        ))}
      </div>
    </div>
  );
};
