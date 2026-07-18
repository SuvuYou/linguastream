"use client";

import { Badge } from "@/components/ui/badge";

interface Props {
  lexicalFamily: string[];
}

export default function LexicalFamily({ lexicalFamily }: Props) {
  return (
    <>
      {lexicalFamily.length > 0 && (
        <div className="pl-4 border-l-2 border-contrast">
          <div className="text-base text-primary-foreground uppercase tracking-wider mb-2">
            Lexical Family
          </div>
          <div className="flex flex-wrap gap-1">
            {lexicalFamily.map((word) => (
              <Badge key={word} variant="outline" size="sm" className="text-sm">
                {word}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
