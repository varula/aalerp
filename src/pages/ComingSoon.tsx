import { useOutletContext } from "react-router-dom";
import { Construction } from "lucide-react";

interface Props {
  title: string;
  description?: string;
}

export default function ComingSoon({ title, description }: Props) {
  const { selectedFactory } = useOutletContext<{ selectedFactory: string }>();

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
      <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center">
        <Construction className="h-8 w-8 text-muted-foreground" />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground mt-1">{description || "This module is under development"}</p>
      </div>
      <p className="text-xs text-muted-foreground/60 max-w-md">
        This page will be available soon with full factory data integration, real-time tracking, and comprehensive analytics.
      </p>
    </div>
  );
}
