"use client";

interface Props {
  isLoading: boolean;
  definition: string | null;
  translation: string | null;
}

export default function WordDefinition({
  isLoading,
  definition,
  translation,
}: Props) {
  if (isLoading) {
    return (
      <div className="border-l-2 border-primary pl-4">
        <div className="text-sm text-primary-foreground animate-pulse">
          Generating definition...
        </div>
      </div>
    );
  }

  if (!definition) {
    return;
  }

  return (
    <>
      <div className="border-l-2 border-primary pl-4">
        <div className="text-base text-primary-foreground uppercase tracking-wider mb-2">
          Translation
        </div>
        <p className="text-sm text-muted-foreground leading-snug bg-card border-border border rounded-2xl p-4">
          {translation}
        </p>
      </div>
      <div className="border-l-2 border-primary pl-4">
        <div className="text-base text-primary-foreground uppercase tracking-wider mb-2">
          Definition
        </div>
        <p className="text-sm text-muted-foreground leading-snug bg-card border-border border rounded-2xl p-4">
          {definition}
        </p>
      </div>
    </>
  );
}
