import { SubtitleSearchDocument } from "@/lib/db-helpers/search";

export interface SearchResponse {
  results: SubtitleSearchDocument[];
  page: number;
  totalPages: number;
  totalHits: number;
  hitsPerPage: number;
}
