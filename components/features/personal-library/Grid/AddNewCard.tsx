"use client";

import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";

export default function AddNewCard({ onAdd }: { onAdd: () => void }) {
  return (
    <Card
      onClick={onAdd}
      className="h-full min-h-65 group justify-center items-center ring-0 rounded-2xl border-dashed border-2 border-border flex flex-col gap-4 hover:bg-muted hover:cursor-pointer active:bg-background transition-colors"
    >
      <div className="size-14 border-2 border-border rounded-full flex items-center justify-center group-hover:border-primary/50 group-hover:size-18 transition-all">
        <Plus className="size-8 text-primary-foreground group-hover:text-muted-foreground group-hover:size-10 transition-all" />
      </div>
      <p className="text-primary-foreground text-base group-hover:text-muted-foreground transition-colors select-none">
        Add Content
      </p>
    </Card>
  );
}
