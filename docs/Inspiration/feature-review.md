# Feature review

Built from your notes in the screenshot `.md` files (likes and dislikes). Not assigned to pages yet. Refs link to the notes.

**How to read the columns**

- **Feasible:** ✅ yes · ⚠️ yes, with a catch (see notes) · ⛔ blocked by a guardrail or open decision as things stand
- **Effort** (rough, one developer): **S** under a day · **M** 2–5 days · **L** 1–2 weeks · **XL** more. "After X" means it needs that part of the roadmap built first; the effort is for the feature on top.
- **Necessity:** **Must** (core loop or a differentiator) · **Should** (clear value, not blocking) · **Could** (polish, nice to have) · **Later** (needs a decision or is out of scope for now)

## Player and subtitles

| # | Feature | Refs | Feasible | Effort | Necessity | Notes |
|---|---|---|---|---|---|---|
| 1 | Show / blur / hide per track, from one button on the player controls | [1](subtitle-display/trancy-show-blur-hide-per-track.md), [2](subtitle-display/lingopie-subtitle-toggles-auto-pause-shortcuts.md), [3](subtitle-display/fluentai-blur-live-highlight-join-cues.md) | ✅ | S | Must | Per-track toggle exists today; blur and the control are new. You called this "the best way". |
| 2 | Previous / repeat / next line, with keys | [1](playback-controls/languagereactor-next-subtitle-key.md) | ✅ | S | Must | YouTube player API seek |
| 3 | Playback modes: normal / pause after each line / repeat each line | [1](playback-controls/fluentai-mode-pause-or-repeat-each-line.md), [2](playback-controls/fluentai-pause-on-subtitle-hover.md) | ✅ | S–M | Must | The embedded player only reports time by polling, so the pause lands within ~0.2 s of the line end. Fine in practice. |
| 4 | Player + transcript sidebar layout | [1](player-layout/trancy-player-with-transcript-sidebar.md) | ✅ | M | Must | Exists; this is a redesign target |
| 5 | Subtitle style per track: size, colour, background colour, background opacity, font, bold, outline, reset | [1](subtitle-display/trancy-caption-style-per-track.md), [2](subtitle-display/fluentai-subtitle-settings-visibility-style-translation.md) | ✅ | S–M | Should | Basic styling exists. You noted FluentAI lacks background colour and subtitle opacity: include both. |
| 6 | Number input with −/+ buttons that is also typeable | [1](translation-sources/fluentai-engine-fallback-order-status-keys.md) | ✅ | S | Should | One shared component, used by the style settings |
| 7 | Action buttons on subtitle hover: replay line, copy, save line, breakdown | [1](subtitle-display/fluentai-subtitle-settings-visibility-style-translation.md) | ✅ | S–M | Should | "Play audio" = replay the original clip, not AI voice (you disliked AI voice) |
| 8 | Player quick menu: tracks, blur, size, languages, speed, volume, playback mode, all settings. Theater mode as its own icon. | [1](playback-controls/fluentai-player-quick-menu.md) | ✅ | M | Should | Without Import subtitles, Send feedback, Open dashboard |
| 9 | Pause while the pointer is over the subtitles, resume on leave | [1](playback-controls/fluentai-pause-on-subtitle-hover.md) | ✅ | S | Should | |
| 10 | A–B loop picked from transcript lines | [1](playback-controls/trancy-ab-loop-pick-lines.md), [2](playback-controls/trancy-ab-loop-active.md) | ✅ | M | Should | Same polling caveat as #3 |
| 11 | Collapsible sidebar with a transition | [1](player-layout/trancy-sidebar-collapsed-blurred-translation.md) | ✅ | S | Should | |
| 12 | Read-along: word-by-word highlight, toggle + styles (underline, highlighter, fill, focus) | [1](subtitle-display/trancy-read-along-toggle.md), [2](subtitle-display/trancy-read-along-highlight-styles.md), [3](subtitle-display/trancy-caption-style-per-track.md), [4](subtitle-display/fluentai-blur-live-highlight-join-cues.md) | ✅ | M–L | Could | Interpolate between word timestamps: YouTube auto-captions give each word a start offset, so a word stays lit from its offset until the next word's. Manual captions only have line start and end, so word times inside the line are spread by text length. Capture must keep the word offsets. |
| 13 | Hide controls when idle | [1](playback-controls/fluentai-pause-on-subtitle-hover.md) | ✅ | S | Could | |
| 14 | Fullscreen / theater mode with our subtitles | [1](player-layout/trancy-theater-mode-ambient-background.md) | ⚠️ research | M | Could | Needs research. Two routes: (a) fullscreen YouTube's iframe itself (allowed), but then only YouTube's own player is shown and our overlay, which sits outside the iframe, is hidden; (b) fullscreen our own container holding the iframe and the overlay. Ambient glow can't sample the video (cross-origin), so a blurred thumbnail. |
| 15 | Progress toast with steps for processing | [1](own-media/fluentai-ai-subtitles-step-1-extract-audio.md), [2](own-media/fluentai-ai-subtitles-step-2-upload.md) | ✅ | S | Must | After the SSE progress in step 3; applies to transfers, not only uploads |

## Transcript panel

| # | Feature | Refs | Feasible | Effort | Necessity | Notes |
|---|---|---|---|---|---|---|
| 16 | Transcript with words coloured by status, current word highlighted, translation on hover | [1](transcript-panel/languagereactor-transcript-colored-words-hover-gloss.md), [2](transcript-panel/lingopie-read-along-explain-save-grammar-index.md) | ✅ | M | Must | After word statuses (step 1/5). You disliked Lingopie's list having no word highlight. |
| 17 | "Explain" a line or word with AI | [1](transcript-panel/lingopie-read-along-explain-save-grammar-index.md), [2](ai-explanations/lingopie-line-explanation-and-chat.md) | ✅ | M | Later (bottom list) | Allowed as a one-shot exception to "no AI chat" (D-044); bottom of the list. Costs go through the AI limiter. |

## Word lookup

| # | Feature | Refs | Feasible | Effort | Necessity | Notes |
|---|---|---|---|---|---|---|
| 18 | Quick popup on click: glosses, status buttons, save; blur-in animation; clicked word stays highlighted | [1](word-popup/fluentai-mini-popup-status-known.md), [2](word-popup/fluentai-mini-popup-status-learning.md), [3](word-popup/languagereactor-click-popup-glosses-status.md), [4](word-popup/trancy-click-popup-pos-glosses.md), [5](word-popup/lingopie-phrase-popup-listen-speak-explain.md) | ✅ | M | Must | The word panel exists; this becomes its first level, fed by the instant layer (step 4) |
| 19 | Two levels: simple popup, then detailed sidebar | [1](word-details/trancy-ai-definition-on-youtube.md), [2](word-details/trancy-ai-definition-senses-etymology-phrases.md) | ✅ | M | Must | |
| 20 | Details in tabs, not one long scroll; extra examples in their own tab | [1](word-details/trancy-ai-definition-synonyms-related.md), [2](word-details/trancy-ai-definition-ipa-forms.md) | ✅ | S | Must | A layout rule from your dislikes, cheap to follow from the start |
| 21 | Status toggle and frequency rank in the details | [1](word-details/languagereactor-dictionary-panel-ai-grammar-examples.md) | ✅ | S | Must | After `UserWord` and the frequency table |
| 22 | Right-click cycles status: unknown → learning → known → ignored | [1](word-popup/languagereactor-click-popup-glosses-status.md) | ✅ | S | Must | |
| 23 | Senses each with an example, forms, etymology, IPA | [1](word-details/trancy-ai-definition-ipa-forms.md), [2](word-details/trancy-ai-definition-senses-etymology-phrases.md) | ✅ | M | Must (senses, forms) / Should (rest) | All in Wiktextract, free, no AI needed. After the import (step 4). |
| 24 | Phrases, synonyms / antonyms, related words | [1](word-details/trancy-ai-definition-synonyms-related.md), [2](word-details/tubevocab-collocations-synonyms-common-mistake.md), [3](word-details/tubevocab-contextual-meaning-usage-tips.md) | ✅ | S | Should | Also in Wiktextract (derived terms, multiword expressions, synonyms). Only a tab once the import exists. |
| 25 | Compact grammar badges (POS, gender, number, case) | [1](word-popup/lingopie-popup-grammar-tags.md) | ✅ | S | Should | From spaCy morphology (step 3) |
| 26 | Phrase detection: verb phrases and separable verbs shown as one item, with a breakdown of parts and lemmas | [1](word-popup/lingopie-phrase-breakdown-lemma-features.md) | ⚠️ | L | Should | spaCy `sm` (D-050) marks separable prefixes (`svp`), Wiktextract lists multiword expressions; a larger model only if accuracy is poor. Contents still to be decided. |
| 27 | Pick a phrase by hand (Shift-click words, save as one) | [1](word-popup/fluentai-gesture-settings-hover-click-shift.md) | ✅ | M | Later (bottom list) | Good feature, bottom of the list. Cards need to hold a multi-word item. |
| 28 | Usage tips / common mistakes, only when there is something real to say | [1](word-details/tubevocab-collocations-synonyms-common-mistake.md), [2](word-details/tubevocab-contextual-meaning-usage-tips.md) | ✅ | M | Could | LLM call allowed to return nothing; cached per lemma (dictionary data, not user content, so the cache can be shared). |
| 29 | Customisable gestures: hover / click / right-click / Shift-click → action | [1](word-popup/fluentai-gesture-settings-hover-click-shift.md) | ✅ | M | Could | |
| 30 | Popup size setting | [1](translation-sources/fluentai-engine-fallback-order-status-keys.md) | ✅ | S | Could | |
| 31 | Extension: look up any word on any web page (YouTube titles, comments, other sites), with trigger options (button, Alt+select, direct) | [1](web-page-lookup/trancy-noun-popup-on-youtube-title.md), [2](web-page-lookup/trancy-verb-popup-on-page.md), [3](web-page-lookup/trancy-web-page-translation-settings.md) | ✅ | M | Should (later) | Plain translation of selected words on any website, added later (D-043). Capture stays youtube.com-only; lookup sends only the selected word or phrase. |

## Word colouring and words in a video

| # | Feature | Refs | Feasible | Effort | Necessity | Notes |
|---|---|---|---|---|---|---|
| 32 | Words of this video in global frequency bands, sorted by count in the video within each band, colour-coded, translation on hover | [1](words-in-video/languagereactor-words-by-count-and-status.md), [2](words-in-video/languagereactor-words-by-frequency-rank.md) | ✅ | M | Must | This is the planned ranked word list (step 5) |
| 33 | Status colours: per status, light and dark variants, background or text mode, on/off per status, reset | [1](word-coloring/fluentai-status-colors-and-word-stats.md) | ✅ | M | Should | Basic colouring is Must and already planned; the settings on top are Should |
| 34 | Suggested words: unknown words worth learning next (common overall, frequent in this video) | [1](word-coloring/languagereactor-word-color-and-display-settings.md) | ✅ | M | Should | After the frequency table and lemma counts |
| 35 | Words saved from this video, translation hidden behind an eye or hover | [1](words-in-video/lingopie-my-vocab-in-video-quiz.md) | ✅ | S | Should | Cards already store their video |
| 36 | Better colour picker (you liked the look, not the UX) | [1](word-coloring/fluentai-status-color-picker.md) | ✅ | S | Could | |
| 37 | Colour by part of speech, in the grammar breakdown (toggle against status colours later) | [1](word-coloring/lingopie-color-by-part-of-speech.md) | ✅ | S | Could | After spaCy. You put the toggle out of scope. |

## Vocabulary notebook

| # | Feature | Refs | Feasible | Effort | Necessity | Notes |
|---|---|---|---|---|---|---|
| 38 | Filters: status, source video, list, search; sort by date or frequency | [1](vocabulary-notebook/fluentai-notebook-status-tabs-source.md), [2](vocabulary-notebook/fluentai-notebook-filter-by-video.md), [3](vocabulary-notebook/languagereactor-saved-words-rank-context-tags.md) | ✅ | M | Must | |
| 39 | Saved context with the word highlighted, link to the source moment | [1](vocabulary-notebook/languagereactor-saved-words-rank-context-tags.md) | ✅ | S | Must | Cards already copy their sentence and keep the clip times |
| 40 | Edit a word: own translation, note, reset to dictionary | [1](vocabulary-notebook/lingopie-edit-personal-translation-note.md), [2](vocabulary-notebook/lingopie-word-detail-last-occurrence.md), [3](vocabulary-notebook/lingopie-word-detail-clip-practice-games.md) | ✅ | S | Must | |
| 41 | Quick status change from the list | [1](vocabulary-notebook/lingopie-vocab-srs-stage-buttons.md), [2](vocabulary-notebook/lingopie-word-detail-last-occurrence.md) | ✅ | S | Should | Decided (D-041): word status and FSRS are separate systems. A word can be "learning" while its card waits a month. Status buttons just set the status. |
| 42 | Hide meanings (eye toggle) to test yourself | [1](vocabulary-notebook/trancy-hide-meanings-self-test.md) | ✅ | S | Should | |
| 43 | Bulk actions: set status, add to list, export, delete | [1](vocabulary-notebook/fluentai-notebook-bulk-actions.md) | ✅ | M | Should | Export limited to one context sentence per card (guardrail 6) |
| 44 | Lists with name, description, icon and colour | [1](vocabulary-notebook/fluentai-create-list-icon-color-ai.md) | ✅ | S–M | Should | Decided (D-045): lists are decks. One global vocabulary; a word can be in several decks. |
| 45 | Filter by grammar: POS, gender, tense, number, person | [1](vocabulary-notebook/lingopie-filter-by-grammar-features.md) | ✅ | M | Could | After spaCy; stored per saved occurrence |
| 46 | Book-cover hover animation for lists | [1](vocabulary-notebook/trancy-word-list-book-cover-animation.md) | ✅ | S | Could | CSS only |
| 47 | Ready-made word lists (Goethe A1–B1 …) | [1](vocabulary-notebook/trancy-goethe-word-lists-srs-stages.md) | ⚠️ | M | Later (bottom list) | Later, from an openly licensed word list (the Goethe-Institut lists themselves are copyrighted, guardrail 9). |

## Review

| # | Feature | Refs | Feasible | Effort | Necessity | Notes |
|---|---|---|---|---|---|---|
| 48 | Card editing, inline | [1](flashcard-review/fluentai-card-inline-edit.md), [2](flashcard-review/fluentai-card-front-context-clip.md) | ✅ | M | Must | Already planned (step 7) |
| 49 | Session direction: word → meaning or meaning → word | [1](flashcard-review/fluentai-review-settings-mode-direction.md) | ✅ | S | Should | Decided (D-042): direction is only display; one schedule per card. |
| 50 | Session summary with undo last review | [1](flashcard-review/fluentai-session-summary-undo.md) | ✅ | S–M | Should | Keep the card's previous FSRS state to restore |
| 51 | Card layout: reorder and hide sections (hide, not delete, as you noted) | [1](flashcard-review/fluentai-card-back-custom-layout.md) | ✅ | M | Could | |

## Library, onboarding, discovery

| # | Feature | Refs | Feasible | Effort | Necessity | Notes |
|---|---|---|---|---|---|---|
| 52 | Button in the YouTube player that triggers the transfer | [1](playback-controls/trancy-youtube-learning-mode-handoff-button.md) | ✅ | S | Must | Already planned (step 3, D-021) |
| 53 | Placement by frequency band with a live preview text | [1](onboarding-placement/languagereactor-placement-by-frequency-band.md) | ✅ | M | Must | Already planned (D-005, Q-05) |
| 54 | Onboarding: learning, native (and UI) language in one step | [1](onboarding-placement/trancy-onboarding-native-language.md) | ✅ | S | Should | |
| 55 | Level per video: known %, difficulty band, "at my level / easier / harder" filter | [1](discover-catalog/fluentai-catalog-known-percent-per-video-difficulty-filter.md), [2](discover-catalog/other-catalog-by-cefr-level-and-speech-pace.md), [3](discover-catalog/lingopie-catalog-genre-rows-level-duration-filters.md) | ⚠️ | M | Later (bottom list) | Discovery page, bottom of the list. Works for videos in your library only (the server can't fetch transcripts of others, D-007, D-029). The grade is our own estimate from word frequency, not official CEFR. |
| 56 | Pick interests / channels for discovery | [1](onboarding-placement/trancy-onboarding-pick-youtube-channels.md) | ⚠️ | L | Later (bottom list) | Discovery page, bottom of the list. Needs the curated catalog (Q-08, metadata only). |
| 57 | Your uploads: list, rename, delete, metadata; local files only | [1](own-media/fluentai-recent-files-menu.md), [2](own-media/fluentai-empty-state-import-or-link.md), [3](own-media/fluentai-rename-file.md) | ✅ | L | Later (bottom list) | Designed (D-040), postponed (D-066). First item on the bottom list. Local files only. |

## Search

| # | Feature | Refs | Feasible | Effort | Necessity | Notes |
|---|---|---|---|---|---|---|
| 58 | Search a word or phrase across your library → clips; create a card from any clip | [1](word-search-in-videos/tubevocab-video-dictionary-search.md), [2](word-search-in-videos/tubevocab-results-clips-create-card.md) | ✅ | M–L | Must | Private library only (confirmed). Differentiator 1. |
| 59 | Word graph: a word linked to every video it appears in; play each moment with context | [1](word-search-in-videos/tubevocab-word-graph-videos.md), [2](word-search-in-videos/tubevocab-word-graph-play-context.md) | ✅ | M (connections) + L (graph) | Must (connections) / Later (graph, bottom list) | Connections: a lemma → occurrences index over your library, with the list of every video and moment a saved word appears in. Word colouring and search need the same index. The interactive graph view goes to the bottom of the list. |

## Account and settings

| # | Feature | Refs | Feasible | Effort | Necessity | Notes |
|---|---|---|---|---|---|---|
| 60 | Delete account, display name | [1](account-settings/fluentai-personal-info-delete-account.md) | ✅ | M | Must | Already planned (step 2) |
| 61 | Translation engine fallback order (internal) | [1](translation-sources/fluentai-engine-fallback-order-status-keys.md) | ✅ | M | Should | The provider interface (D-023) makes this a list of providers to try |
| 62 | Themes: light, dark, system (+ sepia) | [1](account-settings/fluentai-profile-languages-plan-theme.md) | ✅ | M | Should | Cheapest if done during the redesign |
| 63 | User-facing translation engine picker | [1](translation-sources/trancy-engine-picker-player.md), [2](translation-sources/trancy-engine-picker-youtube.md) | ✅ | M | Later (bottom list) | Possible. Each engine is another processor (privacy, guardrail 23) and another cost; switching engine means re-translating the track. |
| 64 | Usage page: per-feature usage against quotas | [1](account-settings/fluentai-usage-credits-per-feature.md), [2](account-settings/fluentai-profile-languages-plan-theme.md) | ✅ | M | Could | After quotas (D-022) |
| 65 | Signed-in devices (website, extension) with sign-out | [1](account-settings/fluentai-password-signed-in-devices.md) | ⚠️ | M | Later (bottom list) | Might not be implemented. Firebase can revoke all of a user's sessions but doesn't list them per device, so it needs our own session table. |
| 66 | Separate interface language | [1](account-settings/fluentai-learning-native-interface-language.md) | ✅ | L | Later | Translating the whole UI; English is enough for friends |
| 67 | Keyboard shortcuts for status (L / K / I) | [1](translation-sources/fluentai-engine-fallback-order-status-keys.md) | ✅ | S | Later | You put it last and out of scope |
| 68 | Stats: streak, accuracy, heatmap | [1](progress-stats/tubevocab-streak-accuracy-activity-heatmap.md) | ✅ | M | Later | You marked it probably out of scope |
| 69 | Word fix suggestions for misheard caption words | – (spike 002) | ⚠️ | M | Later (bottom list) | The captured text stays as it is; the model's suggested fixes are shown next to the words they would replace, visible to the user, never applied silently (D-076). Evidence: spike 002, where the model tried 4–68 word changes per video. |

## Must-haves in suggested order

Ordered by what each one needs first, following the roadmap steps. Items without a pipeline dependency can start now.

1. **Player basics, no dependencies:** show/blur/hide per track (#1), previous/repeat/next (#2), playback modes (#3), player + sidebar layout (#4).
2. **Word status:** right-click cycle (#22), coloured transcript (#16). Needs `UserWord` (step 1).
3. **Card and word editing:** edit word (#40), card editing (#48), saved context with link to source (#39).
4. **Transfer** (step 3): transfer button in the YouTube player (#52), progress toast (#15).
5. **Word lookup** (step 4): quick popup (#18), two levels (#19) in tabs (#20), senses and forms (#23), status toggle and frequency (#21).
6. **Vocabulary** (step 5): words of the video by frequency band (#32), placement (#53), notebook filters and sort (#38).
7. **Library search** (#58) and **connections** (#59, list of every place a word appears): differentiator 1.
8. **Account deletion** (#60), already in step 2.

## Bottom of the list

In this order. Uploads come first, as you set; the order among the rest is my suggestion.

1. Your uploads (#57)
2. Pick a phrase by hand (#27)
3. Discovery page: level per video (#55), interests (#56)
4. Word graph view (#59, graph part)
5. User-facing translation engine picker (#63)
6. "Explain" with AI (#17)
7. Ready-made word lists from an open source (#47)
8. Signed-in devices (#65), maybe never
9. Split German compounds missing from the dictionary (D-055)
10. Word fix suggestions for misheard caption words (#69)

## Still open

- **Fullscreen (#14):** research which route keeps our subtitles visible.
- **Phrase detection (#26):** starts from spaCy `sm` and Wiktextract (D-050); revisit if accuracy is poor.

## Design references (not features)

You liked the look of these; keep them for the redesign: FluentAI settings, popups, cards, account pages, player controls, loading toast and notebook ([example](account-settings/fluentai-profile-languages-plan-theme.md)); Trancy's glass UI menu ([ref](account-settings/trancy-user-menu.md)), player controls and caption settings ([ref](subtitle-display/trancy-caption-style-per-track.md)); the "other" catalog layout ([ref](discover-catalog/other-catalog-by-cefr-level-and-speech-pace.md)); Lingopie's compact badges ([ref](word-popup/lingopie-popup-grammar-tags.md)).

Disliked: Language Reactor's design throughout, Lingopie's subtitle track design, Trancy's long scrolling details.

## Explicitly not wanted

- Keep the subtitle visible after it's spoken ([ref](playback-controls/fluentai-pause-on-subtitle-hover.md))
- AI voice ([ref](translation-sources/fluentai-engine-fallback-order-status-keys.md))
- Word stats overlay on the video, sounds per status ([ref](word-coloring/fluentai-status-colors-and-word-stats.md))
- Outline as a status style ([ref](word-coloring/languagereactor-word-color-and-display-settings.md))
- Separate examples section next to per-sense examples ([ref](word-details/trancy-ai-definition-ipa-forms.md))
- Usage tips and common mistakes forced onto every word ([ref](word-details/tubevocab-contextual-meaning-usage-tips.md))
- Translation shown instantly in the per-video word list ([ref](words-in-video/lingopie-my-vocab-in-video-quiz.md))
