"use client";

import type { DictionaryEntry, WordLookup, WordStatus } from "@linguastream/contracts";
import { ChevronLeft, X } from "lucide-react";
import { Tabs } from "radix-ui";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { describeMorph, flagName, genderName, groupForms } from "@/lib/watch/grammar";
import StatusPicker from "./StatusPicker";
import { Rank } from "./WordPopup";

function Badge({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <span className={`rounded-[calc(7px*var(--r))] bg-raised-2 px-2 py-1 text-xs ${accent ? "text-accent-text" : ""}`}>
      {children}
    </span>
  );
}

function Badges({ lookup }: { lookup: WordLookup }) {
  const entry = lookup.entries[0];
  const pos = entry?.pos ?? lookup.ai?.pos;
  const gender = genderName(entry?.gender ?? lookup.ai?.gender ?? null);
  const here = describeMorph(lookup.word.morph);
  return (
    <div className="flex flex-wrap gap-1.5">
      {pos && <Badge>{pos}</Badge>}
      {gender && <Badge>{gender}</Badge>}
      {entry?.plural && (
        <Badge>
          plural <span lang={lookup.language}>{entry.plural}</span>
        </Badge>
      )}
      {entry?.flags.map((flag) => <Badge key={flag}>{flagName(flag)}</Badge>)}
      {here && <Badge accent>here: {here}</Badge>}
    </div>
  );
}

function Meanings({ lookup }: { lookup: WordLookup }) {
  if (lookup.entries.length === 0 && lookup.ai?.gloss)
    return (
      <div className="flex flex-col gap-1 rounded-lg bg-raised px-4 py-3">
        <b className="text-base">{lookup.ai.gloss}</b>
        {lookup.ai.parts.length > 1 && (
          <span lang={lookup.language} className="text-[13px] text-text-2">
            {lookup.ai.parts.join(" + ")}
          </span>
        )}
        <span className="text-xs text-text-3">Not in the dictionary; written by AI.</span>
      </div>
    );
  if (lookup.entries.length === 0)
    return <p className="text-sm text-text-3">No dictionary entry for this word yet.</p>;
  const several = lookup.entries.length > 1;
  return lookup.entries.map((entry, n) => (
    <EntrySenses key={n} entry={entry} heading={several} language={lookup.language} />
  ));
}

function EntrySenses({ entry, heading, language }: { entry: DictionaryEntry; heading: boolean; language: string }) {
  return (
    <section className="flex flex-col gap-2" aria-label={`${entry.word}, ${entry.pos}`}>
      {heading && (
        <h3 className="px-1 pt-1 text-xs font-semibold tracking-wide text-text-3">
          <span lang={language}>{entry.word}</span> · {entry.pos}
        </h3>
      )}
      <ol className="flex flex-col gap-2">
        {entry.senses.map((sense, i) => (
          <li key={i} className="flex flex-col gap-1 rounded-lg bg-raised px-4 py-3">
            <span className="flex items-baseline gap-2">
              <span className="font-mono text-xs text-text-3">{i + 1}</span>
              <b className="text-base">{sense.gloss}</b>
            </span>
            {sense.tags.length > 0 && (
              <span className="text-[13px] text-text-2">{sense.tags.join(", ")}</span>
            )}
            {sense.example && (
              <span className="text-sm leading-[1.45]">
                <span lang={language}>{sense.example}</span>
                {sense.example_en && <span className="text-text-3"> — {sense.example_en}</span>}
              </span>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}

function Forms({ lookup }: { lookup: WordLookup }) {
  const groups = groupForms(lookup.forms);
  return (
    <dl className="flex flex-col">
      {groups.map((group) => (
        <div key={group.label} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3 border-t border-border px-1 py-2 first:border-t-0">
          <dt className="text-[13px] text-text-3">{group.label}</dt>
          <dd lang={lookup.language} className="text-sm font-medium">
            {group.forms.join(", ")}
          </dd>
        </div>
      ))}
    </dl>
  );
}

const TAB =
  "h-[38px] px-2 text-[13px] whitespace-nowrap text-text-3 transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring data-[state=active]:font-semibold data-[state=active]:text-foreground data-[state=active]:shadow-[inset_0_-2px_0_var(--primary)]";

export default function WordDetails({
  lemma,
  status,
  lookup,
  isError,
  onStatusChange,
  onClose,
}: {
  lemma: string;
  status: WordStatus | null;
  lookup: WordLookup | undefined;
  isError: boolean;
  onStatusChange(status: WordStatus): void;
  onClose(): void;
}) {
  const hasForms = !!lookup && groupForms(lookup.forms).length > 0;
  return (
    <aside
      aria-label="Word details"
      className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl bg-panel @max-[600px]:rounded-none"
    >
      <div className="flex items-center gap-1 px-2.5 pt-2.5 pb-2 text-[13px]">
        <Button variant="ghost" size="sm" onClick={onClose} className="gap-1 pr-2.5 pl-1.5">
          <ChevronLeft className="size-[18px]" /> Transcript
        </Button>
        <Button variant="ghost" size="icon-sm" aria-label="Close details" onClick={onClose} className="ml-auto">
          <X className="size-[18px]" />
        </Button>
      </div>
      <div className="flex flex-col gap-2.5 px-5 pt-2">
        <div className="flex flex-wrap items-baseline gap-2.5">
          <h2 lang={lookup?.language} className="text-[30px] leading-tight font-bold">
            {lemma}
          </h2>
          {lookup?.rank != null && (
            <span className="ml-auto">
              <Rank rank={lookup.rank} status={status} />
            </span>
          )}
        </div>
        {lookup && <Badges lookup={lookup} />}
        <StatusPicker value={status} onChange={onStatusChange} />
      </div>
      {isError ? (
        <p className="px-5 py-4 text-sm text-text-2">Couldn&apos;t load this word. Close and click it again.</p>
      ) : !lookup ? (
        <div className="flex flex-col gap-2 px-5 py-4" aria-hidden="true">
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
      ) : (
        <Tabs.Root defaultValue="meanings" className="flex min-h-0 flex-1 flex-col">
          <Tabs.List aria-label="Word detail sections" className="mt-4 flex gap-0.5 overflow-x-auto border-b border-border px-4 text-[13px]">
            <Tabs.Trigger value="meanings" className={TAB}>
              Meanings
            </Tabs.Trigger>
            {hasForms && (
              <Tabs.Trigger value="forms" className={TAB}>
                Forms
              </Tabs.Trigger>
            )}
          </Tabs.List>
          <Tabs.Content value="meanings" className="flex min-h-0 flex-1 flex-col gap-3 overflow-auto p-4 focus-visible:outline-none">
            <Meanings lookup={lookup} />
          </Tabs.Content>
          {hasForms && (
            <Tabs.Content value="forms" className="min-h-0 flex-1 overflow-auto p-4 focus-visible:outline-none">
              <Forms lookup={lookup} />
            </Tabs.Content>
          )}
        </Tabs.Root>
      )}
      <div className="flex gap-2 border-t border-border px-4 py-3 text-sm">
        <Button size="lg" disabled title="Saving words comes next" className="flex-1">
          Save word · coming soon
        </Button>
      </div>
    </aside>
  );
}
