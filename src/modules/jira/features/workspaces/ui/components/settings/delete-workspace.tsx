import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export const DeleteWorkspace = () => {
  return <Card>
    <CardHeader>
      <CardTitle>Xoá workspace</CardTitle>
      <CardDescription></CardDescription>
    </CardHeader>
    <CardContent>
    </CardContent>
    <CardFooter>
      <Button variant="destructive">Xoá workspace</Button>
    </CardFooter>
  </Card>
}