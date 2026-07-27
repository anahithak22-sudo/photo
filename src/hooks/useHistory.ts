import { useCallback, useEffect, useState } from "react";
import type { Project } from "@/lib/types";
import { getProjects, deleteProject as deleteProjectStorage, updateProject } from "@/lib/storage";

export function useHistory() {
  const [projects, setProjects] = useState<Project[]>([]);

  const refresh = useCallback(() => {
    setProjects([...getProjects()].sort((a, b) => b.createdAt - a.createdAt));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const remove = useCallback(
    async (id: string) => {
      await deleteProjectStorage(id);
      refresh();
    },
    [refresh]
  );

  const rename = useCallback(
    (id: string, title: string) => {
      updateProject(id, { title });
      refresh();
    },
    [refresh]
  );

  return { projects, refresh, remove, rename };
}
