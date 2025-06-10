import { useGetWorkspaces } from "../../api/use-get-workspaces"

export const WorkspaceSwitcher = () => {
  const {data}  = useGetWorkspaces();
  return (
    <div>
      {JSON.stringify(data)}
    </div>
  )
}