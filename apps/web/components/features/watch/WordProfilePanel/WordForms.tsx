"use client";

interface Props {
  wordForms: Record<string, string>;
}

export default function WordForms({ wordForms }: Props) {
  return (
    <>
      {Object.keys(wordForms).length > 0 && (
        <div className="pl-4 border-l-2 border-vibrant">
          <div className="text-base text-primary-foreground uppercase tracking-wider mb-2">
            Forms
          </div>
          <div className="flex flex-col">
            {Object.entries(wordForms).map(([label, value], i) => (
              <div
                key={label}
                className={`flex gap-2 text-sm border-border border py-2.5 pl-4 ${i == 0 && "rounded-t-2xl"} ${i === Object.keys(wordForms).length - 1 && "rounded-b-2xl"} ${i !== Object.keys(wordForms).length - 1 && "border-b-0"}`}
              >
                <span className="text-primary-foreground w-32">{label}</span>
                <span className="text-primary-foreground">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
