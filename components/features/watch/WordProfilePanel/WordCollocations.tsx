"use client";

interface Props {
  collocations: string[];
}

export default function WordCollocations({ collocations }: Props) {
  return (
    <>
      {collocations.length > 0 && (
        <div>
          <div className="text-xs text-secondary-text uppercase tracking-wider mb-2">
            Collocations
          </div>
          <div className="flex flex-col gap-1">
            {collocations.map((collocation) => (
              <span key={collocation} className="text-xs text-primary-text">
                {collocation}
              </span>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
