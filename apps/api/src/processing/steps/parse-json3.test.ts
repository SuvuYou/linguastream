import { ProcessingError } from "../processing-error";
import { parseJson3 } from "./parse-json3";

const json3 = (events: unknown[]) => JSON.stringify({ events });

describe("parseJson3", () => {
  it("turns caption events into lines with joined, trimmed text", () => {
    const lines = parseJson3(
      json3([
        { tStartMs: 0, dDurationMs: 5000, id: 1, wpWinPosId: 1 },
        { tStartMs: 160, dDurationMs: 3000, wWinId: 1, segs: [{ utf8: "Guten" }, { utf8: " Morgen", tOffsetMs: 400 }] },
        { tStartMs: 2500, dDurationMs: 40, wWinId: 1, aAppend: 1, segs: [{ utf8: "\n" }] },
        { tStartMs: 2540, dDurationMs: 2000, wWinId: 1, segs: [{ utf8: "aus\nHamburg!  " }] },
      ]),
    );

    expect(lines).toEqual([
      { index: 0, startMs: 160, endMs: 2540, text: "Guten Morgen" },
      { index: 1, startMs: 2540, endMs: 4540, text: "aus Hamburg!" },
    ]);
  });

  it("ends a line where its own duration ends when the next starts later", () => {
    const lines = parseJson3(
      json3([
        { tStartMs: 1000, dDurationMs: 1500, segs: [{ utf8: "Eins" }] },
        { tStartMs: 4000, segs: [{ utf8: "Zwei" }] },
      ]),
    );

    expect(lines.map((l) => [l.startMs, l.endMs])).toEqual([
      [1000, 2500],
      [4000, 6000],
    ]);
  });

  it("sorts cues and keeps every line at least 1 ms long", () => {
    const lines = parseJson3(
      json3([
        { tStartMs: 3000, dDurationMs: 1000, segs: [{ utf8: "Später" }] },
        { tStartMs: 3000, dDurationMs: 1000, segs: [{ utf8: "Gleichzeitig" }] },
        { tStartMs: 1000, dDurationMs: 1000, segs: [{ utf8: "Zuerst" }] },
      ]),
    );

    expect(lines.map((l) => l.index)).toEqual([0, 1, 2]);
    expect(lines[0]!.text).toBe("Zuerst");
    expect(lines.every((l) => l.endMs > l.startMs)).toBe(true);
  });

  it("rejects text that isn't json3 without a retry", () => {
    for (const raw of ["<transcript/>", JSON.stringify({ nope: [] })]) {
      expect(() => parseJson3(raw)).toThrow(ProcessingError);
      try {
        parseJson3(raw);
      } catch (err) {
        expect(err).toMatchObject({ code: "invalid_track", retryable: false });
      }
    }
  });

  it("rejects a track without any text", () => {
    expect(() => parseJson3(json3([{ tStartMs: 0, segs: [{ utf8: " \n " }] }]))).toThrow(
      expect.objectContaining({ code: "empty_track", retryable: false }),
    );
  });

  it("never puts transcript text into the error message", () => {
    try {
      parseJson3("Geheimer Satz, kein JSON");
    } catch (err) {
      expect((err as Error).message).toBe("invalid_track");
    }
  });
});
