import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { updateWorkspaceSchema } from "../../../schema";
import { Workspace } from "@/generated/prisma-jira-database/jira-database-client-types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Props {
  initialValues: Workspace;
}
export const EditWorkspace = ({ initialValues }: Props) => {
  const form = useForm({
    resolver: zodResolver(updateWorkspaceSchema),
    defaultValues: {
      name: initialValues.name,
    },
  });
  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin chung</CardTitle>
        <CardDescription></CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form>
            <FormField control={form.control}
            name="name" render={({field}) => (
              <FormItem>
                <FormLabel>Tên</FormLabel>
                <Input {...field}/>
              </FormItem>
            )} />
            <CardFooter className="justify-end mt-10 px-0">
              <Button>Lưu thay đổi</Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
