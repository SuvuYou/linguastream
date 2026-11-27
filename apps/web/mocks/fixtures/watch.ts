import type { Line, VideoDetail } from "@linguastream/contracts";

export const MOCK_VIDEO_IDS = {
  normal: "0190f3c2-7d1a-7c00-8a00-000000000001",
  long: "0190f3c2-7d1a-7c00-8a00-000000000002",
  noTranslation: "0190f3c2-7d1a-7c00-8a00-000000000003",
  preparing: "0190f3c2-7d1a-7c00-8a00-000000000004",
  failed: "0190f3c2-7d1a-7c00-8a00-000000000005",
} as const;

const SENTENCES: [string, string][] = [
  ["Guten Morgen aus Hamburg!", "Good morning from Hamburg!"],
  [
    "Heute zeige ich euch, wie die Einheimischen frühstücken.",
    "Today I'll show you how the locals have breakfast.",
  ],
  [
    "Wir fangen am Hafen an, weil es da morgens noch ruhig ist.",
    "We start at the harbour, because it's still quiet there in the morning.",
  ],
  [
    "Das Café hier gibt es seit über fünfzig Jahren.",
    "This café has been here for over fifty years.",
  ],
  [
    "Ein Franzbrötchen solltet ihr unbedingt probieren.",
    "You should definitely try a Franzbrötchen.",
  ],
  [
    "Es ist ein bisschen wie eine Zimtschnecke, nur flacher.",
    "It's a bit like a cinnamon roll, only flatter.",
  ],
  [
    "Sonntags ist hier alles voll, deshalb kommen wir früh.",
    "On Sundays it's packed here, so we come early.",
  ],
  [
    "Danach laufen wir zum Fischmarkt rüber.",
    "Then we walk over to the fish market.",
  ],
  [
    "Der Markt öffnet um fünf Uhr morgens.",
    "The market opens at five in the morning.",
  ],
  [
    "Viele Leute kommen direkt von einer Party hierher.",
    "Lots of people come here straight from a party.",
  ],
  [
    "Ein Fischbrötchen zum Frühstück? Warum nicht!",
    "A fish sandwich for breakfast? Why not!",
  ],
  [
    "Ich nehme eins mit Matjes und Zwiebeln.",
    "I'll take one with matjes herring and onions.",
  ],
  [
    "Die Verkäufer rufen ihre Angebote laut über den Platz.",
    "The sellers shout their offers across the square.",
  ],
  [
    "Wenn ihr Glück habt, bekommt ihr einen Korb Obst geschenkt.",
    "If you're lucky, you'll get a basket of fruit for free.",
  ],
  ["Jetzt brauche ich erst mal einen Kaffee.", "Now I need a coffee first."],
  [
    "Gleich um die Ecke gibt es eine kleine Rösterei.",
    "Just around the corner there's a small roastery.",
  ],
  [
    "Der Besitzer röstet die Bohnen jeden Morgen selbst.",
    "The owner roasts the beans himself every morning.",
  ],
  [
    "Probiert mal den Filterkaffee, der ist richtig gut.",
    "Try the filter coffee, it's really good.",
  ],
  [
    "Hamburg ist im Winter oft grau, aber das stört hier keinen.",
    "Hamburg is often grey in winter, but nobody here minds.",
  ],
  [
    "Zum Schluss fahren wir mit der Fähre über die Elbe.",
    "Finally we take the ferry across the Elbe.",
  ],
  [
    "Das kostet nur ein normales Busticket.",
    "That only costs a normal bus ticket.",
  ],
  [
    "Von der Fähre aus sieht man die ganze Stadt.",
    "From the ferry you can see the whole city.",
  ],
  [
    "Das war mein perfekter Morgen in Hamburg.",
    "That was my perfect morning in Hamburg.",
  ],
  [
    "Schreibt mir, wo ihr am liebsten frühstückt!",
    "Write to me where you like to have breakfast best!",
  ],
];

const LONG_SENTENCE: [string, string] = [
  "Und wenn ihr dann am späten Vormittag noch Hunger habt, was bei mir eigentlich immer der Fall ist, dann lohnt sich ein Abstecher in die Schanze, wo es unzählige kleine Läden gibt, die selbstgemachte Brötchen, Kuchen und Kaffeespezialitäten aus aller Welt anbieten.",
  "And if you're still hungry in the late morning, which is pretty much always the case for me, it's worth a detour to the Schanze, where there are countless little shops offering homemade rolls, cakes and coffee specialities from all over the world.",
];

export function buildLines(
  durationMs: number,
  options: { translated?: boolean; long?: boolean } = {},
): Line[] {
  const { translated = true, long = false } = options;
  const lines: Line[] = [];
  let start = 1200;
  let i = 0;
  while (start < durationMs - 2000) {
    const [text, translation] =
      long && i % 7 === 3 ? LONG_SENTENCE : SENTENCES[i % SENTENCES.length]!;
    const length = Math.min(9000, 1400 + text.length * 55);
    lines.push({
      index: i,
      start_ms: start,
      end_ms: start + length,
      text,
      translation: translated ? translation : null,
    });
    start += length + (i % 4 === 0 ? 900 : 250);
    i++;
  }
  return lines;
}

const MOCK_YOUTUBE_ID =
  process.env.NEXT_PUBLIC_MOCK_YOUTUBE_ID || "mockvideo00";

function video(
  id: string,
  fields: Partial<VideoDetail> & { durationMs: number },
): VideoDetail {
  const { durationMs, ...rest } = fields;
  return {
    id,
    youtube_video_id: MOCK_YOUTUBE_ID,
    title: "Ein Tag in Hamburg: Frühstück wie die Einheimischen",
    channel_name: "Nordlicht Reisen",
    duration_ms: durationMs,
    language: "de",
    track: {
      id: `${id}-track`,
      language: "de",
      is_auto_captions: true,
      status: "ready",
      line_count: 0,
    },
    translation_language: "en",
    translation: { language: "en", status: "ready", error_code: null, progress: null },
    ...rest,
  };
}

const NORMAL_MS = 12 * 60_000 + 48_000;
const LONG_MS = 3 * 60 * 60_000 + 7 * 60_000;

export const mockVideos: Record<string, { video: VideoDetail; lines: Line[] }> =
  Object.fromEntries(
    [
      {
        video: video(MOCK_VIDEO_IDS.normal, { durationMs: NORMAL_MS }),
        lines: buildLines(NORMAL_MS),
      },
      {
        video: video(MOCK_VIDEO_IDS.long, {
          durationMs: LONG_MS,
          title:
            "Der ultimative Hamburg-Guide für Frühaufsteher, Kaffeeliebhaber und alle, die einmal wie echte Hamburgerinnen und Hamburger in den Tag starten wollen – mit Fischmarkt, Franzbrötchen, Hafenfähre, Speicherstadt, Schanzenviertel und den besten versteckten Cafés, die in keinem Reiseführer stehen",
          channel_name:
            "Nordlicht Reisen – Städtereisen, Kulinarik und Alltag in Norddeutschland",
        }),
        lines: buildLines(LONG_MS, { long: true }),
      },
      {
        video: video(MOCK_VIDEO_IDS.noTranslation, {
          durationMs: NORMAL_MS,
          translation_language: null,
          translation: { language: "en", status: "none", error_code: null, progress: null },
        }),
        lines: buildLines(NORMAL_MS, { translated: false }),
      },
      {
        video: video(MOCK_VIDEO_IDS.preparing, {
          durationMs: NORMAL_MS,
          track: {
            id: "t-preparing",
            language: "de",
            is_auto_captions: true,
            status: "processing",
            line_count: 0,
          },
          translation_language: null,
          translation: null,
        }),
        lines: [],
      },
      {
        video: video(MOCK_VIDEO_IDS.failed, {
          durationMs: NORMAL_MS,
          track: {
            id: "t-failed",
            language: "de",
            is_auto_captions: true,
            status: "failed",
            line_count: 0,
          },
          translation_language: null,
          translation: null,
        }),
        lines: [],
      },
    ].map((entry) => {
      entry.video.track &&= {
        ...entry.video.track,
        line_count: entry.lines.length,
      };
      return [entry.video.id, entry];
    }),
  );
