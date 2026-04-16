"use client";

import { PUBLIC_LIBRARY_PARAMS_SCHEMA } from "@/helpers/params-schema";
import { useZodSearchParams } from "@/hooks/useZodSearchParams";

export default function UnregisteredCheckbox() {
  const searchParams = useZodSearchParams(PUBLIC_LIBRARY_PARAMS_SCHEMA);
  const checked = searchParams.params.unreg;

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;

    if (isChecked) {
      searchParams.set({ unreg: true });
    } else {
      searchParams.remove("unreg");
    }
  };

  return (
    <label className="flex items-center gap-2 text-xs text-secondary-text cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        className="accent-active-border"
        onChange={handleToggle}
      />
      Unregistered only
    </label>
  );
}
