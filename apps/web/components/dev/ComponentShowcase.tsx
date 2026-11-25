"use client";

import * as React from "react";
import {
  BookmarkIcon,
  InboxIcon,
  InfoIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PlayIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
  TriangleAlertIcon,
} from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Input } from "@/components/ui/input";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { Kbd } from "@/components/ui/kbd";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationSummary,
} from "@/components/ui/pagination";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectGroup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Sonner } from "@/components/ui/sonner";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="flex scroll-mt-20 flex-col gap-4">
      <h2 className="text-[11px] font-semibold tracking-[0.06em] text-text-3 uppercase">
        {title}
      </h2>
      <div className="flex flex-col gap-5 rounded-xl bg-panel p-5">
        {children}
      </div>
    </section>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-6">
      <span className="w-32 shrink-0 text-[13px] text-text-3">{label}</span>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

const SECTIONS = [
  ["tokens", "Tokens"],
  ["buttons", "Buttons"],
  ["fields", "Form fields"],
  ["choices", "Choice controls"],
  ["tabs", "Tabs"],
  ["badges", "Badges"],
  ["pagination", "Pagination"],
  ["surfaces", "Surfaces"],
  ["floating", "Floating layers"],
] as const;

const SWATCHES = [
  ["bg-background", "background"],
  ["bg-panel", "panel"],
  ["bg-raised", "raised"],
  ["bg-raised-2", "raised-2"],
  ["bg-inset", "inset"],
  ["bg-border", "line"],
  ["bg-primary", "accent"],
  ["bg-unknown", "unknown"],
  ["bg-learning", "learning"],
  ["bg-known", "known"],
  ["bg-destructive", "destructive"],
  ["bg-warning", "warning"],
] as const;

function PagerDemo() {
  const [page, setPage] = React.useState(2);
  const pageCount = 6;
  const pages: (number | "…")[] = [1, 2, 3, "…", 6];
  const from = (page - 1) * 25 + 1;
  const to = Math.min(page * 25, 128);

  return (
    <Pagination aria-label="Pages">
      <PaginationSummary>
        <b>
          {from}–{to}
        </b>{" "}
        of <b>128</b> words
      </PaginationSummary>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#pagination"
            aria-disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          />
        </PaginationItem>
        {pages.map((p, i) =>
          p === "…" ? (
            <PaginationItem key={`gap-${i}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={p}>
              <PaginationLink
                href="#pagination"
                isActive={p === page}
                onClick={() => setPage(p)}
              >
                {p}
              </PaginationLink>
            </PaginationItem>
          ),
        )}
        <PaginationItem>
          <PaginationNext
            href="#pagination"
            aria-disabled={page === pageCount}
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

export default function ComponentShowcase() {
  const [volume, setVolume] = React.useState([80]);

  return (
    <div className="min-h-screen">
      <Sonner position="bottom-left" />
      <header className="sticky top-0 z-40 flex flex-wrap items-center gap-1 border-b border-border bg-background/90 px-5 py-3 backdrop-blur-md">
        <b className="mr-3 text-sm">Components</b>
        {SECTIONS.map(([id, name]) => (
          <a
            key={id}
            href={`#${id}`}
            className="rounded-md px-2.5 py-1.5 text-[13px] text-text-2 hover:bg-raised hover:text-foreground"
          >
            {name}
          </a>
        ))}
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-10 px-5 py-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-[26px] font-bold tracking-[-0.01em]">
            Base components
          </h1>
          <p className="text-[13px] text-text-2">
            Every shadcn component restyled to the Theme Studio, in its main
            states. Development only.
          </p>
        </div>

        <Section id="tokens" title="Tokens">
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {SWATCHES.map(([cls, name]) => (
              <div key={name} className="flex flex-col gap-1.5">
                <span
                  className={`h-12 rounded-md border border-white/8 ${cls}`}
                />
                <span className="font-mono text-[11px] text-text-3">
                  {name}
                </span>
              </div>
            ))}
          </div>
          <Row label="Text">
            <span>text</span>
            <span className="text-text-2">text-2</span>
            <span className="text-text-3">text-3</span>
            <span className="text-accent-text">accent-text</span>
            <span className="font-mono text-xs text-text-3">
              0:17 · #1240 · ×3
            </span>
          </Row>
          <Row label="Word marks">
            <span className="text-lg font-semibold">
              Man sollte es{" "}
              <span className="rounded-xs bg-learning px-1 text-learning-ink">
                unbedingt
              </span>{" "}
              warm essen, das{" "}
              <span className="rounded-xs bg-unknown px-1 text-unknown-ink">
                Franzbrötchen
              </span>{" "}
              <span className="rounded-xs bg-primary px-1 text-primary-foreground">
                lohnt
              </span>{" "}
              sich.
            </span>
          </Row>
        </Section>

        <Section id="buttons" title="Buttons">
          <Row label="Variants">
            <Button>Save word</Button>
            <Button variant="secondary">Details</Button>
            <Button variant="outline">Hide meanings</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Delete account…</Button>
            <Button variant="link">Privacy note</Button>
          </Row>
          <Row label="Sizes">
            <Button size="xs" variant="secondary">
              xs
            </Button>
            <Button size="sm" variant="secondary">
              <PencilIcon />
              Small
            </Button>
            <Button variant="secondary">Default</Button>
            <Button size="lg">Large</Button>
          </Row>
          <Row label="Icon buttons">
            <Button size="icon-sm" variant="ghost" aria-label="More">
              <MoreHorizontalIcon />
            </Button>
            <Button size="icon" variant="ghost" aria-label="Save">
              <BookmarkIcon />
            </Button>
            <Button size="icon" aria-label="Play">
              <PlayIcon />
            </Button>
            <Button size="icon-lg" variant="secondary" aria-label="Add">
              <PlusIcon />
            </Button>
          </Row>
          <Row label="Disabled">
            <Button disabled>Save word</Button>
            <Button disabled variant="secondary">
              Details
            </Button>
            <Button disabled variant="outline">
              Outline
            </Button>
          </Row>
        </Section>

        <Section id="fields" title="Form fields">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sc-email">Email</Label>
              <Input id="sc-email" type="email" placeholder="you@example.com" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sc-filled">Your translation</Label>
              <Input
                id="sc-filled"
                defaultValue="absolutely (you really should)"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sc-invalid">Invalid</Label>
              <Input id="sc-invalid" aria-invalid defaultValue="not-an-email" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sc-disabled">Disabled</Label>
              <Input
                id="sc-disabled"
                disabled
                defaultValue="Read-only in the demo"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sc-search">Input group</Label>
              <InputGroup>
                <InputGroupAddon>
                  <SearchIcon />
                </InputGroupAddon>
                <InputGroupInput
                  id="sc-search"
                  placeholder="Search your videos"
                />
                <InputGroupAddon align="inline-end">
                  <Kbd>⌘K</Kbd>
                </InputGroupAddon>
              </InputGroup>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Select</Label>
              <Select defaultValue="recent">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Sort</SelectLabel>
                    <SelectItem value="recent">Recently watched</SelectItem>
                    <SelectItem value="added">Recently added</SelectItem>
                    <SelectItem value="known">Most words known</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Select, placeholder</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select deck" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="a">Hamburg trip</SelectItem>
                  <SelectItem value="b">Kitchen</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <Label htmlFor="sc-note">Note</Label>
              <Textarea
                id="sc-note"
                defaultValue='Often with sollte / musst: "Das musst du unbedingt sehen."'
              />
            </div>
          </div>
        </Section>

        <Section id="choices" title="Choice controls">
          <Row label="Switch">
            <Switch defaultChecked aria-label="On" />
            <Switch aria-label="Off" />
            <Switch size="sm" defaultChecked aria-label="Small" />
            <Switch disabled aria-label="Disabled" />
          </Row>
          <Row label="Checkbox">
            <label className="flex items-center gap-2 text-[13px] text-text-2">
              <Checkbox defaultChecked /> On card
            </label>
            <label className="flex items-center gap-2 text-[13px] text-text-2">
              <Checkbox /> Not selected
            </label>
            <label className="flex items-center gap-2 text-[13px] text-text-2">
              <Checkbox disabled /> Disabled
            </label>
          </Row>
          <Row label="Slider">
            <Slider
              className="w-48"
              value={volume}
              onValueChange={setVolume}
              max={100}
              aria-label="Volume"
            />
            <span className="w-10 font-mono text-xs text-text-3">
              {volume[0]}%
            </span>
          </Row>
          <Row label="Segmented">
            <ToggleGroup type="single" defaultValue="dark" aria-label="Theme">
              <ToggleGroupItem value="light">Light</ToggleGroupItem>
              <ToggleGroupItem value="dark">Dark</ToggleGroupItem>
              <ToggleGroupItem value="system">System</ToggleGroupItem>
            </ToggleGroup>
            <ToggleGroup type="single" defaultValue="1" aria-label="Speed">
              {["0.5", "0.75", "1", "1.25", "1.5"].map((s) => (
                <ToggleGroupItem key={s} value={s} className="font-mono">
                  {s}×
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </Row>
          <Row label="Option cards">
            <ToggleGroup
              type="single"
              variant="option"
              defaultValue="normal"
              className="w-80"
              aria-label="When a line ends"
            >
              <ToggleGroupItem value="normal">
                <PlayIcon />
                Normal
              </ToggleGroupItem>
              <ToggleGroupItem value="pause">Pause</ToggleGroupItem>
              <ToggleGroupItem value="repeat">Repeat</ToggleGroupItem>
            </ToggleGroup>
          </Row>
        </Section>

        <Section id="tabs" title="Tabs">
          <Tabs defaultValue="transcript" className="max-w-sm">
            <TabsList>
              <TabsTrigger value="transcript">Transcript</TabsTrigger>
              <TabsTrigger value="words">Words</TabsTrigger>
              <TabsTrigger value="saved">Saved</TabsTrigger>
            </TabsList>
            <TabsContent value="transcript" className="text-text-2">
              Tinted tabs: the sidebar on the watch page.
            </TabsContent>
            <TabsContent value="words" className="text-text-2">
              Words of this video.
            </TabsContent>
            <TabsContent value="saved" className="text-text-2">
              Saved words.
            </TabsContent>
          </Tabs>
          <Separator />
          <Tabs defaultValue="all">
            <TabsList variant="line" className="w-full">
              <TabsTrigger value="all">
                All <span className="font-normal text-text-3">128</span>
              </TabsTrigger>
              <TabsTrigger value="unknown">
                <i className="size-2 rounded-full bg-unknown" />
                Unknown
              </TabsTrigger>
              <TabsTrigger value="learning">
                <i className="size-2 rounded-full bg-learning" />
                Learning
              </TabsTrigger>
              <TabsTrigger value="known">
                <i className="size-2 rounded-full bg-known" />
                Known
              </TabsTrigger>
              <TabsTrigger value="disabled" disabled>
                Disabled
              </TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="pt-2 text-text-2">
              Underlined tabs: Vocabulary status tabs, word-detail sections.
            </TabsContent>
          </Tabs>
        </Section>

        <Section id="badges" title="Badges">
          <Row label="Variants">
            <Badge>Verb</Badge>
            <Badge variant="secondary">adverb</Badge>
            <Badge variant="accent">#1240 · B1</Badge>
            <Badge variant="solid">In this sentence</Badge>
            <Badge variant="destructive">Failed</Badge>
            <Badge variant="warning">No translation yet</Badge>
            <Badge variant="outline">YouTube</Badge>
          </Row>
          <Row label="Sizes">
            <Badge size="xs">xs</Badge>
            <Badge size="sm">sm</Badge>
            <Badge size="default">default</Badge>
            <Badge size="lg">lg</Badge>
          </Row>
          <Row label="Keyboard">
            <Kbd>Space</Kbd>
            <Kbd>A</Kbd>
            <Kbd>⌘K</Kbd>
            <Kbd>Esc</Kbd>
          </Row>
        </Section>

        <Section id="pagination" title="Pagination">
          <PagerDemo />
          <Separator />
          <div className="max-w-xs">
            <Pagination aria-label="Pages, phone width">
              <PaginationContent className="w-full justify-between">
                <PaginationItem>
                  <PaginationPrevious href="#pagination" />
                </PaginationItem>
                <PaginationItem className="text-[13px] text-text-2">
                  Page <b className="font-mono font-normal">2</b>{" "}
                  of <b className="font-mono font-normal">6</b>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#pagination" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </Section>

        <Section id="surfaces" title="Surfaces">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>absolutely, definitely</CardTitle>
                <CardDescription>Card · raised graphite</CardDescription>
              </CardHeader>
              <CardContent>
                Das musst du unbedingt sehen.{" "}
                <span className="text-text-3">
                  — You absolutely have to see that.
                </span>
              </CardContent>
              <CardFooter className="gap-2">
                <Button size="sm">Save</Button>
                <Button size="sm" variant="outline">
                  3 other places
                </Button>
              </CardFooter>
            </Card>
            <Card size="sm">
              <CardHeader>
                <CardTitle>Small card</CardTitle>
                <CardDescription>12 px radius, tighter padding</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="flex justify-between text-[13px]">
                  <span>Meaning picks (AI)</span>
                  <span className="font-mono text-text-3">340 / 1,000</span>
                </div>
                <Progress value={34} />
              </CardContent>
            </Card>
          </div>
          <div className="flex flex-col gap-2">
            <Item variant="muted">
              <ItemContent>
                <ItemTitle>Ein Tag in Hamburg</ItemTitle>
                <ItemDescription>Nordlicht Reisen · 4 saved</ItemDescription>
              </ItemContent>
              <ItemActions>
                <Button size="sm" variant="outline">
                  Open
                </Button>
              </ItemActions>
            </Item>
            <Item variant="outline">
              <ItemContent>
                <ItemTitle>Outline item</ItemTitle>
                <ItemDescription>Hairline border, no fill</ItemDescription>
              </ItemContent>
            </Item>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <Alert>
              <InfoIcon />
              <AlertTitle>Faster with the extension</AlertTitle>
              <AlertDescription>
                Open the video on YouTube and press Send to LinguaStream.
              </AlertDescription>
            </Alert>
            <Alert variant="destructive">
              <TriangleAlertIcon />
              <AlertTitle>Couldn’t prepare the video</AlertTitle>
              <AlertDescription>
                The translation step timed out.
              </AlertDescription>
            </Alert>
          </div>
          <Empty className="border border-border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <InboxIcon />
              </EmptyMedia>
              <EmptyTitle>No saved words yet</EmptyTitle>
              <EmptyDescription>
                Click a word in the subtitles and press Save word.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
          <Row label="Loading">
            <Spinner className="text-primary" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-10 w-24" />
          </Row>
        </Section>

        <Section id="floating" title="Floating layers">
          <Row label="Open">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="secondary">Dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add a video</DialogTitle>
                  <DialogDescription>
                    Paste a link to a German video.
                  </DialogDescription>
                </DialogHeader>
                <Input placeholder="https://www.youtube.com/watch?v=…" />
                <DialogFooter>
                  <Button variant="secondary">Cancel</Button>
                  <Button>Add and prepare</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Alert dialog</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Removes your words, cards, videos and sign-in. This cannot
                    be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction variant="destructive">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="secondary">Sheet</Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>unbedingt</SheetTitle>
                  <SheetDescription>Edit word</SheetDescription>
                </SheetHeader>
                <div className="flex flex-col gap-1.5 px-6">
                  <Label htmlFor="sc-sheet-tr">Your translation</Label>
                  <Input id="sc-sheet-tr" defaultValue="absolutely" />
                </div>
              </SheetContent>
            </Sheet>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="More actions">
                  <MoreHorizontalIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-52">
                <DropdownMenuLabel>Video</DropdownMenuLabel>
                <DropdownMenuItem>
                  <PlayIcon />
                  Open
                  <DropdownMenuShortcut>↵</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem>Prepare again</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">
                  <Trash2Icon />
                  Delete from library
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Next line">
                  <PlayIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Next line <Kbd>D</Kbd>
              </TooltipContent>
            </Tooltip>

            <Button
              variant="secondary"
              onClick={() =>
                toast("Preparing “Wie Deutsche wirklich frühstücken”", {
                  description: "Translating 60%",
                })
              }
            >
              Toast
            </Button>
            <Button
              variant="secondary"
              onClick={() => toast.error("The translation step timed out")}
            >
              Error toast
            </Button>
          </Row>
        </Section>
      </main>
    </div>
  );
}
