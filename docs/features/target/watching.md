# Watching (target) ⚠ under discussion

| Feature | Type | Where | Status | Notes |
|---|---|---|---|---|
| YouTube player with custom subtitle overlay | UI | Watch page | ✅ | Check against YouTube's developer policies before the demo shows it publicly (Q-21). |
| Consent prompt before the YouTube player loads | UI + Compliance | Watch page | ⬜ | Guardrail 19. Required on the demo (D-038). |
| Dual subtitles, per-track toggle and styling | UI | Watch page | ✅ | |
| Subtitle sidebar: click to seek, auto-scroll, filter | UI | Watch page | ✅ | Client-side filter |
| Windowed subtitle loading | Backend | Watch page | ⬜ | Never committed; needs indexes |
| Show / blur / hide per track, from one player control (feature review #1) | UI | Watch page | ⬜ |  |
| Previous / repeat / next line, with keys (feature review #2) | UI | Watch page | ⬜ |  |
| Player + transcript sidebar layout, redesigned (feature review #4) | UI | Watch page | 🟡 | Design: Theme Studio, lines grouped under time markers (D-089) |
| Transcript text size S / M / L, set in the player settings panel and in Settings | UI | Watch page, Settings | ⬜ | D-089; 13 px default |
| Transcript: words coloured by status, current word highlighted, translation on hover (feature review #16) | UI | Watch page | ⬜ | Needs word statuses (`target/vocabulary.md`) |
| Playback modes: normal / pause after each line / repeat each line (feature review #3) | UI | Watch page | ⬜ | Polling: the pause lands within ~0.2 s of the line end |
| Subtitle style per track: size, colours, background colour and opacity, font, bold, outline, reset (feature review #5) | UI | Watch page | 🟡 | Basic styling exists |
| Number input with −/+ buttons that is also typeable (feature review #6) | UI | Settings | ⬜ | One shared component for the style settings |
| Action buttons on subtitle hover: replay line, copy, save line, breakdown (feature review #7) | UI | Watch page | ⬜ | Replay = the original clip, no AI voice |
| Player quick menu: tracks, blur, size, languages, speed, volume, playback mode, settings (feature review #8) | UI | Watch page | ⬜ |  |
| Pause while the pointer is over the subtitles (feature review #9) | UI | Watch page | ⬜ |  |
| A–B loop picked from transcript lines (feature review #10) | UI | Watch page | ⬜ |  |
| Collapsible sidebar with a transition (feature review #11) | UI | Watch page | ⬜ |  |
| Read-along: word-by-word highlight with styles (feature review #12) | UI | Watch page | ⬜ | Needs word timings; uploaded tracks may only allow line-level (D-073) |
| Hide controls when idle (feature review #13) | UI | Watch page | ⬜ |  |
| Fullscreen / theater mode with our subtitles (feature review #14) | UI | Watch page | ❔ | Research which route keeps our subtitles visible |

Word coloring, the ranked word list and coverage: `target/vocabulary.md`. Clickable words and the word panel: `target/word-lookup.md`.
