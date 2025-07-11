import { authClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";

export const useGetCurrent = () => {
  const query = useQuery({
    queryKey: ["current"],
    queryFn: async () => {
      try {
        const section = await authClient.getSession();
        return section.data;
      } catch {
        return null;
      }
    },
    throwOnError: true,
  });

  return query;
};
