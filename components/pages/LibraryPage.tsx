"use client";

import SyncButton from "@/components/features/admin/SyncButton";
import UnregisteredCheckbox from "@/components/features/admin/UnregisteredCheckbox";
import LanguageFilter from "@/components/features/library/LanguageFilter";
import SearchBar from "@/components/features/library/SearchBar";
import { useUser } from "@/hooks/useUser";
import LibraryGrid from "../features/library/LibraryGrid";

export default function LibraryPage() {
  const userData = useUser();

  const isAdmin = userData.data?.is_admin;

  return (
    <>
      <div className="flex items-center h-10 border-b border-primary-border px-4 gap-4">
        <SearchBar />
        <LanguageFilter />
      </div>
      <div className="ml-auto flex items-center gap-4 px-4">
        {isAdmin && <SyncButton />}
        {isAdmin && <UnregisteredCheckbox />}
      </div>
      <LibraryGrid />
      {/* TODO: Pagination controls should go here */}
    </>
  );
}
