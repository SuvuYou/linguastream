"use client";

import PlayerSmall, {
  PlayableMediaItem,
} from "@/components/features/player/PlayerSmall";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getLanguageLabel } from "@/helpers/language-helpers";
import { DeckDetailCard } from "@/hooks/useDeckCards";
import { SquareArrowOutUpRight } from "lucide-react";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import YouTubePlayerSmall from "../player/YouTubePlayerSmall";

interface Props {
  card: DeckDetailCard;
  cardSelection: {
    selected: Set<string>;
    toggle: (id: string) => void;
  };
}

const adaptCardStructureToPlayableItem = (
  card: DeckDetailCard,
): PlayableMediaItem => ({
  ...card,
  media_title: card.word,
  source_text: card.context_text,
  translation_text: card.context_translation ?? "",
});

export default function CardAccordionItem({ card, cardSelection }: Props) {
  return (
    <AccordionItem value={card.id} className="border-border">
      <AccordionTrigger className="pr-8 pl-6 py-3 hover:bg-card hover:no-underline hover:cursor-pointer">
        <div className="flex items-center gap-4 w-full text-left">
          <Checkbox
            checked={cardSelection.selected.has(card.id)}
            onCheckedChange={() => cardSelection.toggle(card.id)}
            onClick={(e) => e.stopPropagation()}
            className="mt-0.5 mr-2"
          />
          <span className="text-lg font-medium text-primary-foreground w-40 truncate">
            {card.lemma}
          </span>
          <span className="text-base text-muted-foreground flex-1 truncate">
            {card.word_translation}
          </span>
          <Badge variant="outline" className="text-sm shrink-0 h-8 px-4 ">
            {getLanguageLabel(card.source_language)}
          </Badge>
        </div>
        <div className="text-sm flex-1 h-8 basis-18">
          <Button asChild size="xs" variant="outline">
            <Link
              href={`/watch/${card.media_content_id}?t=${card.start_ms}`}
              target="_blank"
              onClick={(e) => e.stopPropagation()}
              className="w-full h-full"
            >
              <SquareArrowOutUpRight className="size-4" />
            </Link>
          </Button>
        </div>
      </AccordionTrigger>

      <AccordionContent className="px-4 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_2fr_3fr] gap-6 pt-2 overflow-scroll">
          <div className="flex flex-col gap-4">
            {card.contextual_definition && (
              <div className="border-l-2 border-primary pl-4">
                <div className="text-base text-primary-foreground uppercase tracking-wider mb-2">
                  Definition
                </div>
                <p className="text-sm text-primary-foreground leading-6 mt-2">
                  {card.contextual_definition}
                </p>
              </div>
            )}
            {card.word_profile &&
              card.word_profile.forms &&
              Object.keys(card.word_profile.forms).length > 0 && (
                <div className="border-l-2 border-primary pl-4">
                  <div className="text-base text-primary-foreground uppercase tracking-wider mb-2">
                    Forms
                  </div>
                  <div className="flex flex-col gap-2">
                    {Object.entries(card.word_profile.forms).map(
                      ([label, value]) => (
                        <div key={label} className="flex gap-4 text-sm">
                          <span className="text-primary-foreground w-24 shrink-0">
                            {label}
                          </span>
                          <span className="text-primary-foreground">
                            {value}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}
          </div>

          {card.word_profile && (
            <div className="flex flex-col gap-4">
              {card.word_profile.lexical_family.length > 0 && (
                <div className="border-l-2 border-secondary pl-4">
                  <div className="text-base text-primary-foreground uppercase tracking-wider mb-2">
                    Lexical Family
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {card.word_profile.lexical_family.map((item) => (
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

              {card.word_profile.collocations.length > 0 && (
                <div className="border-l-2 border-secondary pl-4">
                  <div className="text-base text-primary-foreground uppercase tracking-wider mb-2">
                    Collocations
                  </div>
                  <div className="flex flex-col gap-2">
                    {card.word_profile.collocations.map((item) => (
                      <span
                        key={item.phrase}
                        className="text-sm text-primary-foreground pl-2 border-l-6 border-secondary"
                      >
                        {item.phrase} {"->"} {item.translation}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col gap-3 ">
            <div className="border-l-2 border-contrast pl-4">
              <div className="text-base text-primary-foreground uppercase tracking-wider mb-2">
                Context
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-sm text-primary-foreground mb-2!">
                  {highlightWord(card.context_text, card.word)}
                </p>
                {card.context_translation && (
                  <p className="text-sm text-muted-foreground italic">
                    {card.context_translation}
                  </p>
                )}
              </div>
            </div>

            {card.streamUrl && (
              <div className="border-l-2 border-contrast pl-4">
                <div className="w-full bg-black aspect-video">
                  <PlayerSmall
                    streamUrl={card.streamUrl}
                    mediaItem={adaptCardStructureToPlayableItem(card)}
                  />
                </div>
              </div>
            )}
            {card.videoId && (
              <div className="border-l-2 border-contrast pl-4">
                <div className="w-full bg-black aspect-video">
                  <YouTubePlayerSmall
                    videoId={card.videoId}
                    mediaItem={adaptCardStructureToPlayableItem(card)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

function highlightWord(text: string, word: string) {
  if (!word) return text;

  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");

  return text.split(regex).map((part, index) =>
    regex.test(part) ? (
      <mark
        key={index}
        className="bg-vibrant/75 text-primary-foreground rounded px-1"
      >
        {part}
      </mark>
    ) : (
      part
    ),
  );
}
