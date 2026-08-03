"use client";

import { Badge } from "@/components/ui/badge";
import { LexicalFamilyItem } from "@/types";

interface Props {
  lexicalFamily: LexicalFamilyItem[];
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
            {lexicalFamily.map((item) => (
              <Badge
                key={item.word}
                variant="outline"
                size="sm"
                className="text-sm"
              >
                {item.word} {"->"} {item.translation}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
