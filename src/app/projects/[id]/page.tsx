import { ProjectDetailsComponent } from "@/components/project-details";

export default async function Details({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProjectDetailsComponent id={id} />;
}
