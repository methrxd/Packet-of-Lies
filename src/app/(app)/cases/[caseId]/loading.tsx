import { WorkspaceLoadingState } from "@/components/app/workspace-loading-state";

export default function CaseDetailLoading() {
  return (
    <WorkspaceLoadingState
      eyebrow="Loading case detail"
      title="Syncing case timeline and evidence"
      description="Fetching latest findings, mitigations, comments, and activity."
    />
  );
}
