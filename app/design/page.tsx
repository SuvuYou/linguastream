"use client";

import { useState } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Empty } from "@/components/ui/empty";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon } from "@/components/ui/input-group";
import { Item } from "@/components/ui/item";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Progress } from "@/components/ui/progress";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Sonner } from "@/components/ui/sonner";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-12">
      <p className="mb-3 border-b border-border pb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        {title}
      </p>
      {children}
    </section>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function DesignPage() {
  const [checked1, setChecked1] = useState(true);
  const [checked2, setChecked2] = useState(false);
  const [switchOn1, setSwitchOn1] = useState(true);
  const [switchOn2, setSwitchOn2] = useState(false);
  const [activePage, setActivePage] = useState(1);

  return (
    <>
      {/* Sonner portal — place once at root level in real app */}
      <Sonner />

      <div className="mx-auto max-w-4xl px-6 py-10 pb-20">
        <h1 className="mb-1 text-2xl font-bold tracking-tight">
          Component Showcase
        </h1>
        <p className="mb-12 text-sm text-muted-foreground">
          All shadcn/ui components — style them coherently here.
        </p>

        {/* ── BUTTON ── */}
        <Section title="Button">
          <div className="flex flex-wrap gap-2">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button disabled>Disabled</Button>
            <Button variant="outline">
              <span className="mr-1">🔔</span> With Icon
            </Button>
          </div>
        </Section>

        {/* ── LABEL & BADGE ── */}
        <Section title="Label & Badge">
          <div className="flex flex-wrap items-center gap-3">
            <Label>Form label</Label>
            <Badge variant="default">Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
          </div>
        </Section>

        {/* ── INPUT / FIELD / INPUT-GROUP ── */}
        <Section title="Input, Field & Input Group">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" />
              <p className="text-[11px] text-muted-foreground">
                We&apos;ll never share your email.
              </p>
            </Field>

            <Field>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                defaultValue="taken_name"
                aria-invalid
                className="border-destructive focus-visible:ring-destructive"
              />
              <p className="text-[11px] text-destructive">
                Username is already taken.
              </p>
            </Field>

            <Field>
              <Label>URL with prefix</Label>
              <InputGroup>
                <InputGroupAddon>https://</InputGroupAddon>
                <Input placeholder="yoursite.com" className="rounded-l-none" />
              </InputGroup>
            </Field>

            <Field>
              <Label>Amount with suffix</Label>
              <InputGroup>
                <Input placeholder="Amount" className="rounded-r-none" />
                <InputGroupAddon className="rounded-l-none border-l-0">
                  USD
                </InputGroupAddon>
              </InputGroup>
            </Field>
          </div>
        </Section>

        {/* ── TEXTAREA ── */}
        <Section title="Textarea">
          <Field className="max-w-md">
            <Label htmlFor="msg">Message</Label>
            <Textarea id="msg" placeholder="Write something..." rows={3} />
            <p className="text-[11px] text-muted-foreground">
              Max 500 characters
            </p>
          </Field>
        </Section>

        {/* ── CHECKBOX & SWITCH ── */}
        <Section title="Checkbox & Switch">
          <div className="flex flex-wrap gap-12">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="terms"
                  checked={checked1}
                  onCheckedChange={(v) => setChecked1(!!v)}
                />
                <Label htmlFor="terms">Accept terms</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="updates"
                  checked={checked2}
                  onCheckedChange={(v) => setChecked2(!!v)}
                />
                <Label htmlFor="updates">Subscribe to updates</Label>
              </div>
              <div className="flex items-center gap-2 opacity-50">
                <Checkbox id="req" checked disabled />
                <Label htmlFor="req">Required (disabled)</Label>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Switch
                  id="notif"
                  checked={switchOn1}
                  onCheckedChange={setSwitchOn1}
                />
                <Label htmlFor="notif">Notifications</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="dark"
                  checked={switchOn2}
                  onCheckedChange={setSwitchOn2}
                />
                <Label htmlFor="dark">Dark mode</Label>
              </div>
              <div className="flex items-center gap-2 opacity-50">
                <Switch id="auto" checked disabled />
                <Label htmlFor="auto">Auto-save (disabled)</Label>
              </div>
            </div>
          </div>
        </Section>

        {/* ── CARD ── */}
        <Section title="Card">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Basic Card</CardTitle>
                <CardDescription>With header and footer</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Card body content goes here. Use it to display any
                  information.
                </p>
              </CardContent>
              <CardFooter className="gap-2">
                <Button size="sm">Save</Button>
                <Button size="sm" variant="ghost">
                  Cancel
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue</CardTitle>
                <CardDescription>Monthly overview</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">$12,400</p>
                <p className="mt-1 text-xs text-green-500">
                  ↑ 8.2% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Team</CardTitle>
                <CardDescription>3 members online</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 pt-0">
                {[
                  {
                    name: "Alice",
                    role: "Admin",
                    color: "from-indigo-500 to-purple-500",
                  },
                  {
                    name: "Bob",
                    role: "Editor",
                    color: "from-emerald-500 to-teal-500",
                  },
                ].map((m) => (
                  <div key={m.name} className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br text-xs font-bold text-white ${m.color}`}
                    >
                      {m.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{m.name}</p>
                      <p className="text-xs text-muted-foreground">{m.role}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </Section>

        {/* ── ALERT ── */}
        <Section title="Alert">
          <div className="flex flex-col gap-3">
            <Alert>
              <AlertTitle>ℹ️ Info</AlertTitle>
              <AlertDescription>
                Your changes have been saved to draft.
              </AlertDescription>
            </Alert>
            <Alert className="border-green-800 bg-green-950 text-green-200 [&>svg]:text-green-400">
              <AlertTitle>✅ Success</AlertTitle>
              <AlertDescription>
                Account created successfully. Welcome aboard!
              </AlertDescription>
            </Alert>
            <Alert className="border-yellow-800 bg-yellow-950 text-yellow-200">
              <AlertTitle>⚠️ Warning</AlertTitle>
              <AlertDescription>
                Your free plan expires in 3 days.
              </AlertDescription>
            </Alert>
            <Alert variant="destructive">
              <AlertTitle>❌ Error</AlertTitle>
              <AlertDescription>
                Failed to process payment. Please try again.
              </AlertDescription>
            </Alert>
          </div>
        </Section>

        {/* ── SEPARATOR ── */}
        <Section title="Separator">
          <p className="text-sm text-muted-foreground">Above the separator</p>
          <Separator className="my-3" />
          <p className="text-sm text-muted-foreground">Below the separator</p>
          <div className="mt-4 flex h-8 items-center gap-3">
            <span className="text-sm text-muted-foreground">Left</span>
            <Separator orientation="vertical" />
            <span className="text-sm text-muted-foreground">Center</span>
            <Separator orientation="vertical" />
            <span className="text-sm text-muted-foreground">Right</span>
          </div>
        </Section>

        {/* ── PROGRESS ── */}
        <Section title="Progress">
          <div className="flex max-w-md flex-col gap-5">
            {[
              { label: "Upload progress", value: 72, color: "" },
              {
                label: "Profile complete",
                value: 45,
                color: "[&>div]:bg-green-500",
              },
              {
                label: "Storage used",
                value: 91,
                color: "[&>div]:bg-destructive",
              },
            ].map(({ label, value, color }) => (
              <div key={label}>
                <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                  <span>{label}</span>
                  <span>{value}%</span>
                </div>
                <Progress value={value} className={color} />
              </div>
            ))}
          </div>
        </Section>

        {/* ── SKELETON ── */}
        <Section title="Skeleton">
          <div className="flex max-w-sm flex-col gap-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex flex-col gap-2 flex-1">
                <Skeleton className="h-3 w-3/5" />
                <Skeleton className="h-3 w-2/5" />
              </div>
            </div>
            <Skeleton className="h-20 w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-7 w-20 rounded-full" />
              <Skeleton className="h-7 w-20 rounded-full" />
            </div>
          </div>
        </Section>

        {/* ── SPINNER ── */}
        <Section title="Spinner">
          <div className="flex items-center gap-6">
            <Spinner />
            <Spinner />
            <Spinner />
          </div>
        </Section>

        {/* ── TABS ── */}
        <Section title="Tabs">
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            <TabsContent
              value="overview"
              className="text-sm text-muted-foreground"
            >
              This is the Overview tab. Show summary information here.
            </TabsContent>
            <TabsContent
              value="analytics"
              className="text-sm text-muted-foreground"
            >
              Analytics data goes here — charts, metrics, trends.
            </TabsContent>
            <TabsContent
              value="settings"
              className="text-sm text-muted-foreground"
            >
              Configure your preferences and account settings.
            </TabsContent>
          </Tabs>
        </Section>

        {/* ── ACCORDION ── */}
        <Section title="Accordion">
          <Accordion
            type="single"
            collapsible
            defaultValue="item-1"
            className="max-w-lg"
          >
            <AccordionItem value="item-1">
              <AccordionTrigger>What is shadcn/ui?</AccordionTrigger>
              <AccordionContent>
                shadcn/ui is a set of re-usable components built using Radix UI
                and Tailwind CSS. You copy the code into your project and own it
                outright.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Is it free to use?</AccordionTrigger>
              <AccordionContent>
                Yes — completely free and open source under the MIT license, in
                personal and commercial projects.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>
                How do I customize components?
              </AccordionTrigger>
              <AccordionContent>
                Since you own the code, just edit it directly. All design tokens
                live in your globals.css as CSS variables.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Section>

        {/* ── DROPDOWN MENU ── */}
        <Section title="Dropdown Menu">
          <div className="flex flex-wrap gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Actions ▾</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>✏️ Edit</DropdownMenuItem>
                <DropdownMenuItem>📋 Duplicate</DropdownMenuItem>
                <DropdownMenuItem>📤 Export</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  🗑 Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary">My Account ▾</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>👤 Profile</DropdownMenuItem>
                <DropdownMenuItem>⚙️ Settings</DropdownMenuItem>
                <DropdownMenuItem>💳 Billing</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>🚪 Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </Section>

        {/* ── DIALOG ── */}
        <Section title="Dialog">
          <div className="flex flex-wrap gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button>Open Dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
                  <DialogDescription>
                    Make changes to your profile here. Click save when
                    you&apos;re done.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-3 py-2">
                  <Field>
                    <Label>Name</Label>
                    <Input defaultValue="Alice Smith" />
                  </Field>
                  <Field>
                    <Label>Email</Label>
                    <Input defaultValue="alice@example.com" />
                  </Field>
                </div>
                <DialogFooter>
                  <Button variant="ghost">Cancel</Button>
                  <Button>Save changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive">Confirm Delete</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete item?</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. This will permanently delete
                    the item from your account.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="ghost">Cancel</Button>
                  <Button variant="destructive">Delete</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </Section>

        {/* ── DRAWER ── */}
        <Section title="Drawer">
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="outline">Open Drawer (Bottom)</Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Quick Actions</DrawerTitle>
                <DrawerDescription>
                  Choose an action to perform on the selected items.
                </DrawerDescription>
              </DrawerHeader>
              <div className="flex flex-col gap-2 px-4">
                <Button variant="outline" className="w-full">
                  📋 Duplicate
                </Button>
                <Button variant="outline" className="w-full">
                  📤 Export as CSV
                </Button>
                <Button variant="destructive" className="w-full">
                  🗑 Delete selected
                </Button>
              </div>
              <DrawerFooter>
                <DrawerClose asChild>
                  <Button variant="ghost">Cancel</Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </Section>

        {/* ── SHEET ── */}
        <Section title="Sheet">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">Open Sheet (Right)</Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
                <SheetDescription>
                  Narrow down results using these filters.
                </SheetDescription>
              </SheetHeader>
              <div className="flex flex-col gap-4 py-4">
                <Field>
                  <Label>Status</Label>
                  <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring">
                    <option>All</option>
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </Field>
                <Field>
                  <Label>Date range</Label>
                  <Input type="date" />
                </Field>
                <div className="flex items-center gap-2">
                  <Checkbox id="mine" defaultChecked />
                  <Label htmlFor="mine">Only show mine</Label>
                </div>
              </div>
              <SheetFooter>
                <SheetClose asChild>
                  <Button className="w-full">Apply filters</Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </Section>

        {/* ── SCROLL AREA ── */}
        <Section title="Scroll Area">
          <ScrollArea className="h-32 w-72 rounded-md border p-3">
            <p className="mb-2 text-sm font-medium">Recent activity</p>
            {[
              "File uploaded",
              "Comment added",
              "Status changed to Active",
              "Export completed",
              "New member joined",
              "Settings updated",
              "Report generated",
              "Integration connected",
              "Webhook triggered",
              "Backup finished",
            ].map((a, i) => (
              <p
                key={i}
                className="border-b border-border py-1.5 text-xs text-muted-foreground last:border-0"
              >
                {i + 1}. {a}
              </p>
            ))}
          </ScrollArea>
        </Section>

        {/* ── ITEM ── */}
        <Section title="Item">
          <Card className="max-w-sm divide-y divide-border p-2">
            {[
              {
                name: "Claire Smith",
                email: "claire@company.com",
                status: "Active",
                statusClass: "bg-green-950 text-green-400",
                color: "from-indigo-500 to-purple-500",
              },
              {
                name: "David Park",
                email: "david@company.com",
                status: "Pending",
                statusClass: "bg-yellow-950 text-yellow-400",
                color: "from-amber-500 to-red-500",
              },
              {
                name: "Emma Johnson",
                email: "emma@company.com",
                status: "Inactive",
                statusClass: "bg-secondary text-secondary-foreground",
                color: "from-emerald-500 to-cyan-500",
              },
            ].map((u) => (
              <Item key={u.name} className="flex items-center gap-3 py-2">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br text-xs font-bold text-white ${u.color}`}
                >
                  {u.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{u.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {u.email}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${u.statusClass}`}
                >
                  {u.status}
                </span>
              </Item>
            ))}
          </Card>
        </Section>

        {/* ── PAGINATION ── */}
        <Section title="Pagination">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setActivePage((p) => Math.max(1, p - 1));
                  }}
                />
              </PaginationItem>
              {[1, 2, 3].map((n) => (
                <PaginationItem key={n}>
                  <PaginationLink
                    href="#"
                    isActive={activePage === n}
                    onClick={(e) => {
                      e.preventDefault();
                      setActivePage(n);
                    }}
                  >
                    {n}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setActivePage(8);
                  }}
                  isActive={activePage === 8}
                >
                  8
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setActivePage((p) => Math.min(8, p + 1));
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </Section>

        {/* ── RESIZABLE ── */}
        <Section title="Resizable">
          <ResizablePanelGroup className="max-w-lg rounded-md border">
            <ResizablePanel defaultSize={50}>
              <div className="flex h-24 items-center justify-center p-4 text-sm text-muted-foreground">
                Panel A
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={50}>
              <div className="flex h-24 items-center justify-center p-4 text-sm text-muted-foreground">
                Panel B
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </Section>

        {/* ── EMPTY ── */}
        <Section title="Empty">
          <Empty className="max-w-sm rounded-md border border-dashed p-8 text-center">
            <div className="mb-2 text-4xl opacity-40">📭</div>
            <p className="font-medium">No results found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try adjusting your search or filters.
            </p>
            <Button size="sm" className="mt-4">
              Clear filters
            </Button>
          </Empty>
        </Section>

        {/* ── SONNER (TOAST) ── */}
        <Section title="Sonner (Toast)">
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() =>
                toast("Done", { description: "Your file has been saved." })
              }
            >
              Default
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() =>
                toast.success("Success", {
                  description: "Profile updated successfully.",
                })
              }
            >
              Success
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() =>
                toast.warning("Warning", {
                  description: "Storage nearly full.",
                })
              }
            >
              Warning
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() =>
                toast.error("Error", { description: "Failed to connect." })
              }
            >
              Error
            </Button>
          </div>
        </Section>
      </div>
    </>
  );
}
