---
name: LinguaStream
description: Learn a language from the YouTube videos you already watch; every word tied to the moment it was heard.
colors:
  accent: "#83BAE7"
  bg: "#141416"
  panel: "#1A1A1D"
  raised: "#1E1E22"
  raised-2: "#2A2A2F"
  inset: "#111113"
  line: "#26262B"
  text: "#F4F4F5"
  text-2: "#B4B4BB"
  text-3: "#9A9AA3"
  on-accent: "#141416"
  unknown: "#FFB4A3"
  learning: "#FFE08A"
  known: "#9EE6B8"
  destructive: "#FF8A80"
  warning: "#F2B880"
  control-off: "#3A3A40"
  subtitle-backing: "#08080A"
typography:
  page-title:
    fontFamily: "Onest, system-ui, sans-serif"
    fontSize: "26px"
    fontWeight: 700
    letterSpacing: "-0.01em"
  dialog-title:
    fontFamily: "Onest, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 700
  header-title:
    fontFamily: "Onest, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 600
  body:
    fontFamily: "Onest, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.4
  label:
    fontFamily: "Onest, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
  section-caps:
    fontFamily: "Onest, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 600
    letterSpacing: "0.06em"
  subtitle-target:
    fontFamily: "Onest, system-ui, sans-serif"
    fontSize: "clamp(17px, 5.4cqi, 28px)"
    fontWeight: 600
    lineHeight: 1.5
  subtitle-translation:
    fontFamily: "Onest, system-ui, sans-serif"
    fontSize: "clamp(13px, 3.8cqi, 19px)"
    fontWeight: 400
  transcript:
    fontFamily: "Onest, system-ui, sans-serif"
    fontSize: "13px"
    lineHeight: 1.45
  mono:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "12px"
rounded:
  xs: "6px"
  sm: "8px"
  md: "10px"
  lg: "12px"
  xl: "14px"
  popover: "16px"
  panel: "18px"
  dialog: "22px"
  full: "999px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "20px"
  "6": "24px"
  "8": "32px"
components:
  button:
    backgroundColor: "{colors.raised-2}"
    textColor: "{colors.text}"
    rounded: "{rounded.lg}"
    padding: "0 16px"
    height: "40px"
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.lg}"
    padding: "0 16px"
    height: "40px"
  button-sm:
    rounded: "{rounded.lg}"
    padding: "0 10px"
    height: "32px"
  button-lg:
    height: "44px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.text-2}"
    rounded: "{rounded.lg}"
    height: "32px"
  input:
    backgroundColor: "{colors.inset}"
    textColor: "{colors.text}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "0 10px"
    height: "38px"
  segmented:
    backgroundColor: "{colors.inset}"
    rounded: "{rounded.md}"
    padding: "4px"
  segmented-selected:
    backgroundColor: "{colors.raised-2}"
    textColor: "{colors.text}"
    rounded: "{rounded.sm}"
    height: "30px"
  tab-active:
    backgroundColor: "color-mix(in srgb, #83BAE7 18%, transparent)"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
    height: "34px"
  card:
    backgroundColor: "{colors.raised}"
    rounded: "{rounded.lg}"
    padding: "12px 16px"
  settings-group:
    backgroundColor: "{colors.raised}"
    rounded: "{rounded.xl}"
  side-panel:
    backgroundColor: "{colors.panel}"
    rounded: "{rounded.panel}"
  word-unknown:
    backgroundColor: "{colors.unknown}"
    rounded: "{rounded.xs}"
    padding: "0 4px"
  word-learning:
    backgroundColor: "{colors.learning}"
    rounded: "{rounded.xs}"
    padding: "0 4px"
  word-selected:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.xs}"
    padding: "0 4px"
  pill:
    textColor: "{colors.text-2}"
    rounded: "{rounded.xs}"
    padding: "2px 6px"
---

<!-- Source: design/theme-studio.html (mirrored to https://claude.ai/artifact/6s5x73XGns2eUGkGTRHWpF, D-089, D-091). When the Studio changes, update this file with it. -->

# Design System: LinguaStream

## Overview

**Creative North Star: "The Screening Room"**

LinguaStream is a dark room built around a video. Everything outside the player is graphite, quiet and low-contrast, so the eye goes to two places only: the picture and the words. Colour is earned. A single soft blue marks what you can act on right now (play, the active tab, the current transcript line, the selected word), and three pastel status hues mark how well you know each word. Nothing else in the interface is allowed to compete with them.

The density is that of a study tool, not a marketing site: 14 px body text, 4 px spacing steps, compact controls, many small panels that each do one job. Learners from A2 to B2 sit with it for whole sessions on desktop and on a phone, so the surfaces are calm and the reading text (subtitles, transcript) is the largest and highest-contrast thing on screen. Depth comes from tone, not lines: each layer is a slightly lighter graphite, and only floating things (popups, menus, dialogs) get glass and shadow.

The design reference is the Theme Studio (D-089): 21 screens with a live token editor. Its patterns come from the products studied in `docs/Inspiration/` (Language Reactor, Trancy, FluentAI, Lingopie, TubeVocab), reduced to one visual language.

**Key Characteristics:**
- Dark-first graphite surfaces stepped by tone (#111113 → #2A2A2F).
- One accent (#83BAE7) that is also the "now" colour: play button, active tab, current line.
- Word status shown as tinted backgrounds with dark ink, never as text colour alone on the video.
- Onest for everything readable, JetBrains Mono for times, ranks and counts.
- Glass and shadow only on floating layers over the video.
- Every screen works from phone width (container queries at 600 px) to desktop.

## Colors

A graphite neutral ramp, one cool blue accent, and three reserved pastel hues for word status.

### Primary
- **Screening Blue** (accent): the only interactive colour. Primary buttons, the play button, the active tab and nav item (as an 18 % tint), the current transcript line (13 % tint), the selected word, focus rings, A–B loop marks, progress. Text on solid accent uses **on-accent** (#141416, picked by luminance). Accent-coloured text uses a lighter mix (70 % white toward accent) for contrast on dark.

### Word status (reserved)
- **Coral** (unknown), **Butter** (learning), **Mint** (known): the colour of a word's status, and nothing else. On the video and in samples they are backgrounds with a dark ink (the status hue mixed 82–84 % toward black). In the transcript, where lines are dense, they become text colour. Ignored words have no colour. The user can change all three in Settings → Word colours.

### Feedback
- **Soft Red** (destructive): delete actions and failures, as a 12–16 % tint with red text.
- **Amber** (warning): warnings that aren't failures (missing translation, limits). Kept apart from the learning yellow.

### Neutral
- **Theatre Black** (bg): the page.
- **Graphite** (panel): side panels, dialogs, drawers.
- **Raised Graphite** (raised): cards, settings groups, the word-details meaning cards.
- **Lifted Graphite** (raised-2): default buttons, selected segment, badges, hover tips.
- **Well** (inset): inputs, search fields, segmented-control tracks, status picker track.
- **Hairline** (line): the few borders that remain (inputs, top nav divider, list separators).
- **Text** (text), **Secondary text** (text-2), **Tertiary text** (text-3): three steps only. Tertiary is for placeholders, time stamps, section captions and icons at rest.
- **Switch off** (control-off): the track of an unchecked switch and of a slider.
- **Subtitle backing** (subtitle-backing): behind subtitles on the video, at 78 % (target language) and 60 % (translation) opacity.

### Named Rules
**The One Voice Rule.** The accent marks what is active or actionable now. If something is blue, the user should be able to click it or it should be the thing playing.

**The Reserved Hues Rule.** Coral, butter and mint mean word status everywhere they appear. Review grades, list colours, warnings and demo banners don't borrow them. *Known gaps in the Studio, to fix in the colorize round:* review grade buttons (Again/Hard/Good), the danger red #FF8A80 written as a literal, the demo bar using `learning`, and list colours that repeat the status hexes.

**Implementation names.** In the web app the tokens keep shadcn's variable names (card [4b]): Studio `accent` → shadcn `--primary`, Studio `raised-2` → shadcn `--accent` (hover/selected surface), `panel` → `--card`/`--popover`, `line` → `--border`/`--input`, `text-3` → `--muted-foreground`. Studio-only tokens (status hues and inks, `inset`, `raised`, play/tab/current-row tokens) are added on top. The app is dark only for now; a light theme comes later (#62).

## Typography

**Display Font:** none; there is no display face.
**Body Font:** Onest (with Inter, system-ui, sans-serif), self-hosted, Cyrillic included.
**Label/Mono Font:** JetBrains Mono (with ui-monospace, monospace).

**Character:** Onest is a friendly, slightly rounded grotesque that stays readable for German compounds at subtitle sizes; the mono face makes numbers (0:17, #1240, ×3) scan as data, not prose.

### Hierarchy
- **Page title** (700, 26 px, −0.01em): one per page (Library, Vocabulary, Session done, a word on Connections).
- **Dialog title** (700, 20 px): dialogs and the sign-in card.
- **Header title** (600, 16 px): the video title in the watch-page header.
- **Body** (400, 14 px, 1.4): default UI text, list rows, settings labels (600 for the label line).
- **Label** (400, 13 px): secondary lines, toolbar fields, captions under rows.
- **Section caps** (600, 11 px, 0.06em, uppercase, text-3): settings sections (VISIBILITY, PLAYBACK) and side-nav headings.
- **Subtitle, target language** (600, 17–28 px via `cqi`, 1.5): the largest text on the watch page; scales with the player width.
- **Subtitle, translation** (400, 13–19 px via `cqi`): under the target line, lighter grey.
- **Transcript** (13 / 14 / 15.5 px for S / M / L, translation 11.5 / 12.5 / 13.5 px): set by the user in player settings or Settings, not in the sidebar.
- **Mono** (400, 11–13 px): times, ranks, counts, keyboard hints, numeric inputs.

### Named Rules
**The Numbers Are Mono Rule.** Times, frequency ranks, occurrence counts and usage figures are set in JetBrains Mono. Words and sentences never are.

**The Subtitles Win Rule.** On the watch page nothing is larger or brighter than the target-language subtitle line.

## Layout

A 4 px spacing grid (4, 8, 12, 16, 20, 24, 32). Pages pad 24 px (32 at the bottom) with 20 px between blocks; panels pad 16–20 px; rows pad 10–12 px.

- **App pages** (Library, Vocabulary, Review, Account): a top nav (logo, Library, Vocabulary, Review with due count, search with ⌘K, avatar) over a page column. The video grid is `auto-fill` with 240 px minimum columns and 16 px gaps.
- **Watch page:** a header (back, title, settings), then the player column and a side panel (min 360 px) with Transcript / Words / Saved tabs. Theater mode collapses the side panel and centres the video on a faint accent glow.
- **Settings:** one dialog (max 980 px) with a left section nav and a body column of grouped rows.
- **Vocabulary:** a list rail (lists with counts) beside the word list, paginated under the list; the edit drawer overlays the list as a sheet; bulk actions float at the bottom centre when words are selected.
- **Responsive:** layouts flex-wrap first, then `@container (max-width: 600px)` rules switch to single column, shrink subtitle padding, put grade buttons in a 2 × 2 grid and stretch floating bars edge to edge. Strings will be translated later, so nothing depends on English text length.

## Elevation & Depth

Tonal layering at rest, glass and shadow only for things that float. Surfaces step up in lightness (inset → bg → panel → raised → raised-2) instead of using borders. Floating layers over the video (word popup, line actions, subtitle visibility panel, player settings, processing toast, bulk bar) use a translucent graphite with `backdrop-filter: blur(16–22px)` and a 1 px white hairline at 8–12 % opacity.

### Shadow Vocabulary
- **Tip** (`box-shadow: 0 10px 24px rgba(0,0,0,.4)`): hover glosses.
- **Float** (`box-shadow: 0 16px 40px rgba(0,0,0,.5)`): toasts, word popup.
- **Panel** (`box-shadow: 0 24px 60px rgba(0,0,0,.55–.6)`): player settings, edit drawer.
- **Dialog** (`box-shadow: 0 30px 80px rgba(0,0,0,.6)`): settings and modal dialogs, the theater video.

### Named Rules
**The Flat-At-Rest Rule.** Anything that sits in the page flow has no shadow. A shadow means "this is above something and will go away".

## Shapes

Soft, rounded rectangles that scale with one user setting. Every radius is a base value multiplied by the radius scale `--r` (default 1, editable in the Studio): 6 px for chips, pills and word highlights; 8–10 px for segments, inputs and tabs; 12 px for buttons and cards; 14 px for settings groups; 16 px for popovers and toasts; 18 px for side panels; 20–22 px for dialogs. The larger the surface, the rounder its corners. Fully round shapes (999 px) are kept for status dots and the glass "Paused while you read" chip. Borders are rare: inputs, the ghost button, list dividers and the top nav underline.

## Components

### Buttons
- **Shape:** gently rounded (12 px × `--r`).
- **Default:** lifted graphite (raised-2) with primary text, 40 px tall, 16 px side padding, icon gap 8 px.
- **Primary:** solid accent with on-accent text, weight 600. One per area.
- **Sizes:** small (32 px, 13 px text) for row and toolbar actions; large (44 px) for the main action of a dialog or panel.
- **Ghost:** transparent with a hairline border and secondary text; fills with raised graphite on hover.
- **Focus:** 2 px accent outline, 2 px offset, on every focusable element.

### Segmented controls and tabs
- **Segmented:** an inset well (4 px padding) with transparent options; the selected one is lifted graphite with weight 600. Used for settings choices, transcript size, speed.
- **Tabs and nav:** transparent tertiary-text items; the current one gets the 18 % accent tint and accent-tinted text.
- **Option cards** (subtitle visibility, playback mode, highlight style): when selected, 18 % accent fill with a 45 % accent border.

### Cards / Containers
- **Corner Style:** 12 px (cards), 14 px (settings groups), 18 px (side panels).
- **Background:** raised graphite on panel graphite; no border.
- **Shadow Strategy:** none at rest (see Elevation).
- **Highlighted:** the "in this sentence" meaning card uses the current-row tint plus an inset 1 px accent ring.
- **Internal Padding:** 12 × 16 px.

### Inputs / Fields
- **Style:** inset well background, 1 px hairline border, 10 px radius, 38 px tall; placeholders in tertiary text.
- **Focus:** the shared accent outline.

### Navigation
- **Top nav:** a single row with a hairline underline; items are 36 px tall, 14 px, secondary text; the current page gets the accent tint. Review shows a due count. Search opens the ⌘K palette.
- **Settings nav:** section captions in caps, items as plain links, current item highlighted.

### Pagination
- **Where:** long lists (Library: 24 videos per page, Vocabulary: 25 words per page, and other lists as needed), right-aligned under the list.
- **Desktop:** a range summary on the left ("26–50 of 128 words", numbers in mono), then previous, page numbers with an ellipsis, next. Buttons are 32 px, 8 px radius, secondary text; hover fills with raised graphite.
- **Current page:** the same 18 % accent tint and accent text as the active tab.
- **Phone (container under 600 px):** the summary and page numbers hide; previous and next sit at the ends with "Page 2 of 6" between them.

### Word marks (signature component)
How a word looks depends on where it is. On the video: a status-coloured background with dark ink and a 6 px radius; the selected word is solid accent; a word being read along is underlined in accent. In the transcript: status as text colour. On cards and in Vocabulary: the saved word in bold inside its sentence. The **status picker** is a four-way segmented control (Unknown, Learning, Known, Ignore) in which the selected option fills with its status colour.

### Floating glass (signature component)
Word popup, line actions, subtitle visibility, player settings, toasts and the bulk bar share one recipe: translucent graphite, background blur, white hairline, a shadow from the vocabulary above, and a radius one step larger than the controls inside it.

## Do's and Don'ts

### Do:
- **Do** take every colour from a token; mix tints with `color-mix` from the accent (10, 14, 18, 35, 45 %).
- **Do** keep the accent for what is active or clickable now.
- **Do** show word status as a background with its ink on the video, and as text colour in the transcript.
- **Do** set times, ranks and counts in JetBrains Mono.
- **Do** write radii as a base value times `--r` and spacing on the 4 px grid.
- **Do** check each screen at 600 px container width.
- **Do** mark German and English text with the right `lang` attribute.

### Don't:
- **Don't** use coral, butter or mint for anything other than word status (grades, lists, warnings, banners).
- **Don't** hard-code colours (#D4D4D8, rgba whites); use a token.
- **Don't** put shadows or blur on surfaces that sit in the page flow.
- **Don't** add a second accent colour or gradients on controls.
- **Don't** make anything on the watch page bigger or brighter than the target subtitle line.
- **Don't** show real YouTube channels or creators in public pages or mockups.
