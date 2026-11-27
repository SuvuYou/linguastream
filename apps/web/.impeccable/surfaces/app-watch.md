---
version: 1
slug: "app-watch"
primary_target: "app/watch"
related_targets: []
---

# Watch page

Scope: `/watch/[videoId]`, the page a learner sits in for whole sessions on desktop and phone. Mode: Operate.
Job: watch a German video with dual subtitles and a transcript that follows playback; jump by clicking a line.
Constraints: DESIGN.md world fixed; Theme Studio "Reading" screen (D-089) is the composition; mock data until card [15].
Unresolved: Words / Saved tabs, text size, theater mode (later cards). Word popup and status colours built in change 033 (D-114).

## Direction contract
THESIS: A screening room for one video: the picture and the target-language line are the only bright things; everything else is quiet graphite that recedes until needed. Refuses the generic video-app layout with a busy sidebar of equal-weight cards.
OWN-WORLD: Graphite steps (inset, bg, panel, raised) without borders, one Screening Blue for what is playing or clickable, Onest for words, JetBrains Mono for every time, subtitles on near-black backing.
STORY: The learner sees the line being spoken and its translation, sees where it sits in the transcript, and moves through the video by clicking lines instead of scrubbing.
FIRST VIEWPORT: Header strip (back, title 16 px 600, channel · length in mono). Below, the player column fills the width left of a ≥360 px sidebar; subtitles sit low on the video, German line largest; control bar under the video, play button in accent. Sidebar lists time-marker groups with the current line tinted 13 % accent.
FORM: Two-column player + transcript (the Theme Studio variant E), 1 of 1; seed: none (pinned) "Player + transcript sidebar layout, redesigned (feature review #4) … Design: Theme Studio, lines grouped under time markers (D-089)".
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
