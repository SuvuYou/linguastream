import { LANGUAGES } from "@/lib/languages";
import { useState, useTransition } from "react";

export default function AddToLibraryModal(props: {
  jellyfinId: string;
  title: string;
  OnSuccess: () => void;
  OnClose: () => void;
}) {
  const { jellyfinId, title, OnSuccess, OnClose } = props;

  const [sourceLanguage, setSourceLanguage] = useState("de");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    startTransition(async () => {
      const response = await fetch("/api/media-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          jellyfin_id: jellyfinId,
          source_language: sourceLanguage,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(
          errorData.message || "An error occurred while adding to library.",
        );
      }

      OnSuccess();
    });
  }

  return (
    <div
      className="fixed inset-0 bg-background flex items-center justify-center z-50"
      onClick={OnClose}
    >
      <div
        className="bg-background border border-primary-border w-full max-w-sm p-6 flex flex-col gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <div className="text-xs text-secondary-text mb-1">
            Adding to library
          </div>
          <div className="text-sm font-medium truncate">{title}</div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-secondary-text">
              Source language
            </label>
            <select
              value={sourceLanguage}
              onChange={(e) => setSourceLanguage(e.target.value)}
              className="bg-background border border-primary-border text-sm text-primary-text px-3 py-2 outline-none"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && <div className="text-xs text-red-400">{error}</div>}

        <div className="flex gap-2 justify-end">
          <button
            onClick={OnClose}
            className="px-4 py-2 text-sm text-secondary-text hover:text-primary-text transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="px-4 py-2 text-sm bg-active-border text-bacbg-background font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Adding..." : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
