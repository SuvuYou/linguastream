"use client";

import { usePathname, useRouter } from "next/navigation";
import { useRef } from "react";

export default function UnregisteredCheckbox({
  shouldShowUnregistered,
}: {
  shouldShowUnregistered: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      if (isChecked) {
        router.replace(`${pathname}?unreg=true`);
      } else {
        router.replace(pathname);
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
