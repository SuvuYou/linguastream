"use client";

import { useState } from "react";
import AddContentModal from "@/components/features/personal-library/AddContentModal/AddContentModal";
import { PERSONAL_LIBRARY_PARAMS_SCHEMA } from "@/helpers/params-schema";
import { useZodSearchParams } from "@/hooks/useZodSearchParams";
import SearchBar from "../primitives/SearchBar";
import CardsGrid from "../features/personal-library/Grid/CardsGrid";
import LanguageFilter from "../features/library/LanguageFilter";
import { useLibraryLanguages } from "@/hooks/useLibraryLanguages";
import SourceUploadFilter from "../features/personal-library/SourceUploadFilter";
import { Separator } from "../ui/separator";

export default function PersonalLibraryPage() {
  const personalLibraryParams = useZodSearchParams(
    PERSONAL_LIBRARY_PARAMS_SCHEMA,
  );

  const [addModalOpen, setAddModalOpen] = useState(false);

  const languages = useLibraryLanguages();

  return (
    <section className="flex h-full w-full flex-col bg-background m-2 p-2 rounded-l-lg">
      <div className="flex items-center min-h-10 px-4 pb-4 pt-2 gap-4">
        <SearchBar placeholder="Search the library..." />
        <LanguageFilter
          source={languages.source}
          translation={languages.translation}
          isLoading={languages.isLoading || languages.isFetching}
          isError={languages.isError}
        />

        {languages.isLoading || languages.isFetching ? null : (
          <SourceUploadFilter
            type={{
              value: personalLibraryParams.params.type ?? "all",
              onChange: (value) => {
                personalLibraryParams.set({ type: value, page: 0 });
              },
            }}
          />
        )}
      </div>

      <Separator />

      <CardsGrid
        isLanguagesLoading={languages.isLoading || languages.isFetching}
        openAddModal={() => setAddModalOpen(true)}
      />

      <AddContentModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
      />
    </section>
  );
}
