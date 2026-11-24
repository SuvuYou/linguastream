import { MergedContentItem } from "@/types";

export interface LibraryResponse {
  items: MergedContentItem[];
  total: number;
  pageCount: number;
}
