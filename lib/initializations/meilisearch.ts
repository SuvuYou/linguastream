import { Meilisearch } from "meilisearch";

const MEILISEARCH_URL = process.env.MEILISEARCH_URL ?? "http://localhost:7700";
const MEILISEARCH_MASTER_KEY = process.env.MEILISEARCH_MASTER_KEY ?? "";

export const meili = new Meilisearch({
  host: MEILISEARCH_URL,
  apiKey: MEILISEARCH_MASTER_KEY,
});

export const SUBTITLE_INDEX = "subtitle_lines";
