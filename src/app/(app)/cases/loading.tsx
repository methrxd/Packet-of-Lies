import { WorkspaceLoadingState } from "@/components/app/workspace-loading-state";

export default function CasesLoading() {
  return (
    <WorkspaceLoadingState
      eyebrow="Loading cases"
      title="Fetching investigation queue"
      description="Loading case records, ownership, statuses, and response context."
    />
  );
}

