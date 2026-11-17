# Search (D-011, accepted by D-049)

Postgres full-text search with the German configuration (`tsvector` + GIN index) and `pg_trgm` for fuzzy matching, always filtered by `user_id`. Meilisearch is removed.

**Scope (D-067):** used only for free-text phrase search in the search overlay. Finding a word (connections, "find other cases", search by dictionary form) uses the per-line lemma arrays (D-052).
