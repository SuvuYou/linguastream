import { SubtitleSearchDocument } from "@/lib/db-helpers/search";

export interface SearchResponse {
  results: SubtitleSearchDocument[];
}
