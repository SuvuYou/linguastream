"use client";

import { type DeckDetailCard } from "@/hooks/useDeckDetail";
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
import { LANGUAGES } from "@/helpers/const";
import { useAppStore } from "@/lib/initializations/store";

function getLangLabel(code: string) {
  return LANGUAGES.find((l) => l.code === code)?.label ?? code;
}

function formatTime(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return `${m}:${(s % 60).toString().padStart(2, "0")}`;
}

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
  const { setOverlayOpen } = useAppStore();

  return (
    <AccordionItem value={card.id} className="border-primary-border">
      <AccordionTrigger className="px-4 py-3 hover:bg-background-hover hover:no-underline">
        <div className="flex items-center gap-4 w-full text-left">
          <span className="text-sm font-medium text-primary-text w-40 truncate">
            {card.word}
          </span>
          <span className="text-sm text-secondary-text flex-1 truncate">
            {card.word_translation}
          </span>
          <Badge variant="outline" className="text-xs shrink-0">
            {getLangLabel(card.source_language)}
          </Badge>
        </div>
      </AccordionTrigger>

      <AccordionContent className="px-4 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="flex flex-col gap-4">
            <div>
              <div className="text-xs text-secondary-text uppercase tracking-wider mb-1">
                Translation
              </div>
              <p className="text-sm text-primary-text font-medium">
                {card.word_translation}
              </p>
              {card.contextual_definition && (
                <p className="text-xs text-secondary-text mt-1">
                  {card.contextual_definition}
                </p>
              )}
            </div>

            {card.word_profile &&
              Object.keys(card.word_profile.forms).length > 0 && (
                <div>
                  <div className="text-xs text-secondary-text uppercase tracking-wider mb-2">
                    Forms
                  </div>
                  <div className="flex flex-col gap-1">
                    {Object.entries(card.word_profile.forms).map(
                      ([label, value]) => (
                        <div key={label} className="flex gap-2 text-xs">
                          <span className="text-secondary-text w-24 shrink-0">
                            {label}
                          </span>
                          <span className="text-primary-text">{value}</span>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}
          </div>

          <div className="flex flex-col gap-3">
            <div className="text-xs text-secondary-text uppercase tracking-wider">
              Context
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm text-primary-text leading-relaxed">
                {card.context_text}
              </p>
              {card.context_translation && (
                <p className="text-xs text-secondary-text italic">
                  {card.context_translation}
                </p>
              )}
              <span className="text-xs text-secondary-text tabular-nums">
                {formatTime(card.start_ms)}
              </span>
            </div>

            {card.streamUrl && (
              <div className="h-32 w-full bg-black">
                <PlayerSmall
                  streamUrl={card.streamUrl}
                  mediaItem={adaptCardStructureToPlayableItem(card)}
                />
              </div>
            )}

            <div className="flex gap-2 mt-1">
              <Button
                size="sm"
                variant="outline"
                className="text-xs flex-1"
                onClick={() =>
                  window.open(
                    `/watch/${card.media_content_id}?t=${card.start_ms}`,
                    "_blank",
                  )
                }
              >
                Watch Clip
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-xs flex-1"
                // onClick={() => onFindOtherCases(card.word)}
                onClick={() => setOverlayOpen(true)}
              >
                Find Other Cases
              </Button>
            </div>
          </div>

          {/* col 3 — lexical family + collocations */}
          {card.word_profile && (
            <div className="flex flex-col gap-4">
              {card.word_profile.lexical_family.length > 0 && (
                <div>
                  <div className="text-xs text-secondary-text uppercase tracking-wider mb-2">
                    Lexical Family
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {card.word_profile.lexical_family.map((w) => (
                      <Badge key={w} variant="outline" className="text-xs">
                        {w}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {card.word_profile.collocations.length > 0 && (
                <div>
                  <div className="text-xs text-secondary-text uppercase tracking-wider mb-2">
                    Collocations
                  </div>
                  <div className="flex flex-col gap-1">
                    {card.word_profile.collocations.map((c) => (
                      <span key={c} className="text-xs text-primary-text">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
