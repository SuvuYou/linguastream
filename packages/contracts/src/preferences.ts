import { z } from "zod";
import { defineRoute } from "./route.js";

export const TrackVisibility = z.enum(["show", "blur", "hide"]);

export type TrackVisibility = z.infer<typeof TrackVisibility>;

export const SubtitleVisibility = z.object({
  original: TrackVisibility,
  translation: TrackVisibility,
});

export type SubtitleVisibility = z.infer<typeof SubtitleVisibility>;

export const UserPreferences = z.object({
  subtitle_visibility: SubtitleVisibility,
});

export type UserPreferences = z.infer<typeof UserPreferences>;

export const DEFAULT_PREFERENCES: UserPreferences = {
  subtitle_visibility: { original: "show", translation: "show" },
};

export const getPreferencesRoute = defineRoute({
  method: "GET",
  path: "/api/preferences",
  response: UserPreferences,
});

export const updatePreferencesRoute = defineRoute({
  method: "PATCH",
  path: "/api/preferences",
  body: z.strictObject({
    subtitle_visibility: z
      .strictObject({
        original: TrackVisibility.optional(),
        translation: TrackVisibility.optional(),
      })
      .refine((value) => Object.keys(value).length > 0, {
        message: "Set at least one track",
      }),
  }),
  response: UserPreferences,
});
