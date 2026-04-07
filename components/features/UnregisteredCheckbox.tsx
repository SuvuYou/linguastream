"use client";

import { PUBLIC_LIBRARY_PARAMS_SCHEMA } from "@/helpers/params-schema";
import { useZodSearchParams } from "@/hooks/useZodSearchParams";
import { useRef } from "react";

export default function UnregisteredCheckbox({
  shouldShowUnregistered,
}: {
  shouldShowUnregistered: boolean;
}) {
  const searchParams = useZodSearchParams(PUBLIC_LIBRARY_PARAMS_SCHEMA);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      if (isChecked) {
        searchParams.set({ unreg: true });
      } else {
        searchParams.remove("unreg");
      }
    }, 100);
  };

  return (
    <label className="flex items-center gap-2 text-xs text-secondary-text cursor-pointer">
      <input
        type="checkbox"
        checked={shouldShowUnregistered}
        className="accent-active-border"
        onChange={handleToggle}
      />
      Unregistered only
    </label>
  );
}
