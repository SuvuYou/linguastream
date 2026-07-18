"use client";

import { useAppStore } from "@/lib/initializations/store";
import { useWordProfile } from "@/hooks/useWordProfile";
import { Badge } from "@/components/ui/badge";
import { useSaveCard } from "@/hooks/useSaveCard";
import SaveToDeck from "./SaveToDeck";
import WordCollocations from "./WordCollocations";
import LexicalFamily from "./LexicalFamily";
import WordForms from "./WordForms";
import WordDefinition from "./WordDefinition";
import { useDeckSelection } from "@/hooks/useDeckSelection";
import { useWordDefinition } from "@/hooks/useWordDefinition";

export default function WordProfilePanel() {
  const { activeWord, preferredTranslationLanguage } = useAppStore();

  const wordProfile = useWordProfile(activeWord);
  const wordDefinition = useWordDefinition(activeWord);

  const { decks, selectedDeckId, setSelectedDeckId } = useDeckSelection();

  const cardSaver = useSaveCard();

  if (!activeWord) {
    return (
      <div className="flex items-center justify-center h-full text-xs text-secondary-text px-4 text-center">
        Click a word in the subtitles to see its profile
      </div>
    );
  }

  const allowSave =
    preferredTranslationLanguage &&
    wordProfile.data?.id &&
    wordDefinition.data &&
    selectedDeckId;

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-4 py-3 border-b border-primary-border shrink-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-lg font-medium text-primary-text">
            {activeWord.word}
          </span>
          {wordProfile.data && (
            <Badge variant="outline" className="text-xs">
              {wordProfile.data.part_of_speech}
            </Badge>
          )}
        </div>
        <p className="text-xs text-secondary-text mt-1 leading-relaxed">
          {activeWord.context}
        </p>
      </div>

      <div className="flex flex-col gap-4 px-4 py-4 flex-1">
        <WordDefinition
          definition={wordDefinition.data?.definition ?? ""}
          isLoading={wordDefinition.isLoading}
        />

        {wordProfile.isLoading ? (
          <div className="text-xs text-secondary-text animate-pulse">
            Loading profile...
          </div>
        ) : wordProfile.data ? (
          <>
            <WordForms
              wordForms={
                (wordProfile.data?.forms ?? {}) as Record<string, string>
              }
            />
            <LexicalFamily lexicalFamily={wordProfile.data.lexical_family} />
            <WordCollocations collocations={wordProfile.data.collocations} />
          </>
        ) : null}
      </div>

      <SaveToDeck
        saver={cardSaver}
        handleSave={() =>
          !!allowSave &&
          cardSaver.save({
            activeWord,
            profileId: wordProfile.data?.id ?? "",
            definition: wordDefinition.data?.definition,
            deckId: selectedDeckId,
            translationLanguage: preferredTranslationLanguage,
          })
        }
        decks={decks}
        selectedDeckId={selectedDeckId}
        onSelectDeckId={setSelectedDeckId}
        allowSave={!!allowSave}
      />
    </div>
  );
}
