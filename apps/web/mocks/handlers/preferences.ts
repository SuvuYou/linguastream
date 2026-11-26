import {
  DEFAULT_PREFERENCES,
  getPreferencesRoute,
  updatePreferencesRoute,
  type RequestBody,
  type UserPreferences,
} from "@linguastream/contracts";
import { mockRoute } from "../mockRoute";

let preferences: UserPreferences = structuredClone(DEFAULT_PREFERENCES);

export function resetMockPreferences() {
  preferences = structuredClone(DEFAULT_PREFERENCES);
}

export const preferencesHandlers = [
  mockRoute(getPreferencesRoute, () => preferences),
  mockRoute(updatePreferencesRoute, ({ body }) => {
    const change = body as RequestBody<typeof updatePreferencesRoute>;
    preferences = {
      subtitle_visibility: {
        ...preferences.subtitle_visibility,
        ...change.subtitle_visibility,
      },
    };
    return preferences;
  }),
];
