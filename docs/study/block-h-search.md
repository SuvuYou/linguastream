# Block H: library search

**When:** before Essential step C2 (library search and connections, D-067). **Hours:** about 10. Part of the transition plan's #3 (SQL + PostgreSQL); part 1 is in Block B.
**Block exercise:** search a word or a phrase across every line of your library and return the clips, ranked, in under 100 ms on a few hundred videos, using lemma arrays for single words and full-text search for phrases.

## 1. Full-text search · ~6 h

**Learn**
- `tsvector` and `tsquery`, the `german` configuration and what its stemming does to separable verbs and compounds.
- Generated `tsvector` columns with a GIN index; `ts_rank` and `ts_headline` for highlighting.
- Phrase queries (`<->`) and when lemma arrays (D-052) are the better tool.

**Resources**
- [Full text search](https://www.postgresql.org/docs/current/textsearch.html)
- [Controlling text search](https://www.postgresql.org/docs/current/textsearch-controls.html)

## 2. `pg_trgm` · ~4 h

**Learn**
- Trigram similarity, `%` and `similarity()`, GIN vs GiST trigram indexes.
- Using it for "did you mean" and partial phrase search only (D-067), not as the main index.

**Resources**
- [pg_trgm](https://www.postgresql.org/docs/current/pgtrgm.html)

**You know it when** you can explain, for a given query, whether lemma arrays, full-text search or trigrams answer it, and the query plan agrees.
