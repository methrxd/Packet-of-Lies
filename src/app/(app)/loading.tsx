import { WorkspaceLoadingState } from "@/components/app/workspace-loading-state";

export default function AppLoading() {
  return (
    <WorkspaceLoadingState
      eyebrow="Loading workspace"
      title="Preparing your dashboard"
      description="Syncing case activity, reports, and analyst workspace state."
    />
  );
}

