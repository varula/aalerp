import { Boxes, ClipboardList, GitBranch, CalendarRange } from "lucide-react";

interface Section {
  icon: React.ElementType;
  title: string;
  body: string;
}

const SECTIONS: Section[] = [
  {
    icon: Boxes,
    title: "What is ERP?",
    body:
      "Enterprise Resource Planning (ERP) helps an organization use its resources — people, machines, materials and money — to the best possible effect. It evolved from MRP → MRPII → today's ERP as demand for functionality grew.",
  },
  {
    icon: ClipboardList,
    title: "MRP — Material Requirements Planning",
    body:
      "A computerized approach to planning material acquisition for production. Traditionally used in discrete manufacturing, MRP is built around two artefacts: the Bill of Materials (BOM) and the Master Production Schedule (MPS).",
  },
  {
    icon: GitBranch,
    title: "BOM — Bill of Materials",
    body:
      "Describes the parent/child relationship between an assembly and its components or raw materials. Example: a stool → legs + seat; the seat itself → frame + cushion. Every product is exploded down to raw materials or purchased components.",
  },
  {
    icon: CalendarRange,
    title: "MPS — Master Production Schedule",
    body:
      "A spreadsheet that projects demand for each product over time (time periods as columns, products as rows). A BOM Processor (BOMP) then uses it to compute the required quantity of every component and material.",
  },
];

export function ErpHelpContent() {
  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground leading-relaxed">
        A quick reference on the concepts that underpin production planning in this app.
      </p>

      <div className="space-y-3">
        {SECTIONS.map(({ icon: Icon, title, body }) => (
          <div key={title} className="flex gap-3">
            <div className="h-8 w-8 shrink-0 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-semibold text-foreground leading-tight">{title}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed mt-1">{body}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg bg-muted/50 border border-border/60 px-3 py-2">
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          In <span className="font-medium text-foreground">Armana OS</span>, the Cutting, Sewing
          and Finishing planning modules apply these MRP concepts to denim production.
        </p>
      </div>
    </div>
  );
}

export default ErpHelpContent;
