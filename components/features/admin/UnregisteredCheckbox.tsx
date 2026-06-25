"use client";

import { PUBLIC_LIBRARY_PARAMS_SCHEMA } from "@/helpers/params-schema";
import { useZodSearchParams } from "@/hooks/useZodSearchParams";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function UnregisteredCheckbox() {
  const searchParams = useZodSearchParams(PUBLIC_LIBRARY_PARAMS_SCHEMA);
  const checked = searchParams.params.unreg;

  const handleToggle = (checked: boolean) => {
    if (checked) {
      searchParams.set({ unreg: true });
    } else {
      searchParams.remove("unreg");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Checkbox
        id="unregistered-filter"
        checked={checked}
        onCheckedChange={handleToggle}
      />
      <Label
        htmlFor="unregistered-filter"
        className="text-xs text-secondary-text font-normal cursor-pointer"
      >
        Unregistered only
      </Label>
    </div>
  );
}
