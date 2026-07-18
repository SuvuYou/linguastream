"use client";

interface Props {
  isLoading: boolean;
  definition: string | null;
}

export default function WordDefinition({ isLoading, definition }: Props) {
  return (
    <div>
      <div className="text-xs text-secondary-text uppercase tracking-wider mb-1">
        Definition
      </div>
      {isLoading ? (
        <div className="text-xs text-secondary-text animate-pulse">
          Generating...
        </div>
      ) : definition ? (
        <p className="text-sm text-primary-text leading-snug">{definition}</p>
      ) : null}
    </div>
  );
}
