"use client";

export default function AddNewCard({ onAdd }: { onAdd: () => void }) {
  return (
    <div
      onClick={onAdd}
      className="relative border border-dashed border-primary-border p-4 flex flex-col items-center justify-center aspect-video cursor-pointer hover:bg-background-hover transition-colors gap-2"
    >
      <div className="w-10 h-10 rounded-full border border-primary-border flex items-center justify-center text-secondary-text text-xl">
        +
      </div>
      <span className="text-xs text-secondary-text">Add Content</span>
    </div>
  );
}
