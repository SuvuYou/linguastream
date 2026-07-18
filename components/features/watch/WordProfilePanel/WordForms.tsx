"use client";

interface Props {
  wordForms: Record<string, string>;
}

export default function WordForms({ wordForms }: Props) {
  return (
    <>
      {Object.keys(wordForms).length > 0 && (
        <div>
          <div className="text-xs text-secondary-text uppercase tracking-wider mb-2">
            Forms
          </div>
          <div className="flex flex-col gap-1">
            {Object.entries(wordForms).map(([label, value]) => (
              <div key={label} className="flex gap-2 text-xs">
                <span className="text-secondary-text w-28 shrink-0">
                  {label}
                </span>
                <span className="text-primary-text">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
