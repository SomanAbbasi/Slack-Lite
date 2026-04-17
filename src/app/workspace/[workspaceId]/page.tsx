

"use client";

import { useParams } from "next/navigation";

const WorkspaceIdPage = () => {
  const params = useParams<{ workspaceId: string }>();
  const workspaceId = params?.workspaceId;

  return (
    <div>
      ID:{workspaceId}
    </div>
  )
}

export default WorkspaceIdPage;