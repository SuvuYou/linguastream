"use client";

import SyncButton from "@/components/features/admin/SyncButton";
import UnregisteredCheckbox from "@/components/features/admin/UnregisteredCheckbox";
import LanguageFilter from "@/components/features/library/LanguageFilter";
import SearchBar from "@/components/features/library/SearchBar";
import LibraryGrid from "@/components/features/library/LibraryGrid";
import Reindex from "@/components/features/admin/Reindex";
import { useUser } from "@/hooks/useUser";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export default function LibraryPage() {
  const userData = useUser();

  const isAdmin = userData.data?.is_admin;

  return (
    <section className="flex h-full w-full flex-col bg-background m-2 p-2 rounded-l-lg">
      <div className="flex items-center min-h-10 px-4 pb-4 pt-2 gap-4">
        <SearchBar />
        <LanguageFilter />
        <div className="ml-auto flex items-center gap-4">
          {isAdmin && <SyncButton />}
          {isAdmin && <Reindex />}
          {isAdmin && <UnregisteredCheckbox />}
        </div>
      </div>

      <Separator />

      <ScrollArea className="flex-1">
        <LibraryGrid />
      </ScrollArea>
    </section>
  );
}
