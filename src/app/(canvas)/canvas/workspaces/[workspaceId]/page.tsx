import { Banner } from "./banner";
import { TemplatesSection } from "./templates-section";

export default function WorkspaceIdPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <Banner/>
      <TemplatesSection />
    </div>
  );
}
