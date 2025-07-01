import { Button } from "@/components/ui/button";
import { MoveRight } from "lucide-react";

export default function WorkspaceIdPage() {
  return (
    <section className="flex flex-col items-center pt-10">
      <h1 className="text-[8vw] lg:text-[120px]">
        Bạn muốn{" "}
        <span className="bg-gradient-to-r from-indigo-500 from-10%  to-sky-500 to-90% bg-clip-text text-transparent inline-block">
          thiết kế
        </span>{" "}
        gì?
      </h1>
      <p className="text-xl">Với Canva, bạn có thể thiết kế, tạo, in và làm việc trên mọi thứ.</p>
      <Button className="bg-gradient-to-r from-indigo-500 from-10%  to-sky-500 to-90% mt-10 cursor-pointer" size="lg">Bắt đầu thiết kế <MoveRight/></Button>
    </section>
  );
}
