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

interface Props {
  card: DeckDetailCard;
}

const adaptCardStructureToPlayableItem = (
  card: DeckDetailCard,
): PlayableMediaItem => ({
  ...card,
  media_title: card.word,
  source_text: card.context_text,
  translation_text: card.context_translation ?? "",
});

export default function CardAccordionItem({ card }: Props) {
  return (
    <AccordionItem value={card.id} className="border-border">
      <AccordionTrigger className="px-8 py-3 hover:bg-card hover:no-underline hover:cursor-pointer">
        <div className="flex items-center gap-4 w-full text-left">
          <span className="text-lg font-medium text-primary-foreground w-40 truncate">
            {card.word}
          </span>
          <span className="text-base text-muted-foreground flex-1 truncate">
            {card.word_translation}
          </span>
          <Badge variant="outline" className="text-sm shrink-0 h-8 px-4 ">
            {getLanguageLabel(card.source_language)}
          </Badge>
        </div>
        <Button
          size="xs"
          variant="outline"
          className="text-sm flex-1 h-8 basis-18"
          onClick={() =>
            window.open(
              `/watch/${card.media_content_id}?t=${card.start_ms}`,
              "_blank",
            )
          }
        >
          <SquareArrowOutUpRight className="size-4" />
        </Button>
      </AccordionTrigger>

      <AccordionContent className="px-4 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_2fr] gap-6 pt-2 overflow-scroll">
          <div className="flex flex-col gap-4">
            <div className="border-l-2 border-primary pl-4">
              <div className="text-base text-primary-foreground uppercase tracking-wider mb-2">
                Translation
              </div>
              <p className="text-sm text-primary-foreground">
                {card.word_translation}
              </p>
            </div>

            {card.contextual_definition && (
              <div className="border-l-2 border-primary pl-4">
                <div className="text-base text-primary-foreground uppercase tracking-wider mb-2">
                  Definition
                </div>
                <p className="text-sm text-primary-foreground mt-2">
                  {card.contextual_definition}
                </p>
              </div>
            )}

            {card.word_profile &&
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
                    {card.word_profile.lexical_family.map((w) => (
                      <Badge key={w} variant="outline" className="text-sm">
                        {w}
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
                    {card.word_profile.collocations.map((c) => (
                      <span
                        key={c}
                        className="text-sm text-primary-foreground border-l-4 border-secondary pl-2"
                      >
                        {c}
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
                  {card.context_text}
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
                    shouldShowSubtitles={false}
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
