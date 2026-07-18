"use client";

import { Badge } from "@/components/ui/badge";

interface Props {
  lexicalFamily: string[];
}

export default function LexicalFamily({ lexicalFamily }: Props) {
  return (
    <>
      {lexicalFamily.length > 0 && (
        <div>
          <div className="text-xs text-secondary-text uppercase tracking-wider mb-2">
            Lexical Family
          </div>
          <div className="flex flex-wrap gap-1">
            {lexicalFamily.map((word) => (
              <Badge key={word} variant="outline" className="text-xs">
                {word}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
