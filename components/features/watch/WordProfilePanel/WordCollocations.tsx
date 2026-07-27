"use client";

interface Props {
  collocations: string[];
}

export default function WordCollocations({ collocations }: Props) {
  return (
    <>
      {collocations.length > 0 && (
        <div className="pl-4 border-l-2 border-secondary">
          <div className="text-base text-primary-foreground uppercase tracking-wider mb-2">
            Collocations
          </div>
          <div className="flex flex-col gap-2 pl-2">
            {collocations.map((collocation) => (
              <span
                key={collocation}
                className="text-sm text-primary-foreground pl-2 border-l-6 border-secondary"
              >
                {collocation}
              </span>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
