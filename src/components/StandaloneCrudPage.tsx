import { CrudDataTable } from "@/components/CrudModule";
import { standaloneCrudModules } from "@/lib/standalone-modules";

export function StandaloneCrudPage({ moduleKey }: { moduleKey: string }) {
  const mod = standaloneCrudModules[moduleKey];
  if (!mod) return <div className="p-6 text-muted-foreground">Module not found.</div>;
  return <CrudDataTable module={mod} sectionSlug={mod.sectionSlug} hideBackButton />;
}
