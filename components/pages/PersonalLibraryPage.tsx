"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AddContentModal from "@/components/features/personal-library/AddContentModal/AddContentModal";
import { PERSONAL_LIBRARY_PARAMS_SCHEMA } from "@/helpers/params-schema";
import { useZodSearchParams } from "@/hooks/useZodSearchParams";
import SearchBar from "../primitives/SearchBar";
import CardsGrid from "../features/personal-library/Grid/CardsGrid";

export default function PersonalLibraryPage() {
  const personalLibraryParams = useZodSearchParams(
    PERSONAL_LIBRARY_PARAMS_SCHEMA,
  );

  const [addModalOpen, setAddModalOpen] = useState(false);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-medium text-primary-text">
          Personal Library
        </h1>
        <p className="text-sm text-secondary-text mt-1">
          Your added content. Watch, learn, and review.
        </p>
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <Tabs
          value={personalLibraryParams.params.type || "all"}
          onValueChange={(v) => {
            personalLibraryParams.set({
              type: v as "all" | "yt" | "upload",
              page: 0,
            });
          }}
        >
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="yt">YouTube</TabsTrigger>
            <TabsTrigger value="upload">Uploads</TabsTrigger>
          </TabsList>
        </Tabs>

        <SearchBar placeholder="Search your library..." />
        <CardsGrid openAddModal={() => setAddModalOpen(true)} />
      </div>
      <AddContentModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
      />
    </div>
  );
}
