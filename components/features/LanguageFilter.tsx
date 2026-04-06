import { LANGUAGES } from "@/lib/languages";
import { useAppStore } from "@/lib/store";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function LanguageFilter(props: {
  availableSourceLanguages: string[];
  availableSubtitleLanguages: string[];
  selectedSourceLanguage: string;
  selectedSubtitleLanguage: string;
}) {
  const {
    availableSourceLanguages,
    availableSubtitleLanguages,
    selectedSourceLanguage,
    selectedSubtitleLanguage,
  } = props;

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { setPreferredSourceLanguage, setPreferredSubtitleLanguage } =
    useAppStore();

  useEffect(() => {
    setPreferredSourceLanguage(selectedSourceLanguage);
    setPreferredSubtitleLanguage(selectedSubtitleLanguage);
  }, [
    selectedSourceLanguage,
    selectedSubtitleLanguage,
    setPreferredSourceLanguage,
    setPreferredSubtitleLanguage,
  ]);

  const updateFilter = (type: "src" | "sub", value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(type, value);

    if (type === "src") setPreferredSourceLanguage(value);
    if (type === "sub") setPreferredSubtitleLanguage(value);

    router.replace(`${pathname}?${params}`);
  };

  function getLabel(code: string) {
    return LANGUAGES.find((lang) => lang.code === code)?.label ?? code;
  }

  return (
    <div className="flex items-center h-full divide-x divide-primary-border">
      <div className="flex items-center gap-2 px-4 h-full">
        <span className="text-xs text-secondary-text">Content</span>
        <select
          value={selectedSourceLanguage}
          onChange={(e) => updateFilter("src", e.target.value)}
          className="bg-transparent text-xs text-active-border outline-none cursor-pointer"
        >
          {availableSourceLanguages.map((code) => (
            <option key={code} value={code} className="bg-background">
              {getLabel(code)}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2 px-4 h-full">
        <span className="text-xs text-secondary-text">Subtitles</span>
        <select
          value={selectedSubtitleLanguage}
          onChange={(e) => updateFilter("sub", e.target.value)}
          className="bg-transparent text-xs text- outline-none cursor-pointer"
        >
          {availableSubtitleLanguages.map((code) => (
            <option key={code} value={code} className="bg-background">
              {getLabel(code)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
