# Block E: processing pipeline

**When:** before Core steps B2 (the worker) and B3 (the dictionary import). **Hours:** about 26.
**Block exercise:** a capture goes in, a BullMQ job punctuates (D-064), analyses (spaCy), translates and indexes it, and the browser sees each step over SSE; killing the worker mid-job does not lose it.

## 1. Redis (#9) · ~5 h

**Learn**
- Data types; expiry; caching patterns (cache-aside).
- Rate limiting and quotas with counters (D-022).
- Persistence (AOF vs RDB) and what is lost on a crash.

**Exercise:** a fixed-window rate limiter and a monthly spend counter, both tested.

**Resources**
- [Redis documentation](https://redis.io/docs/latest/)
- [Redis persistence](https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/)
- [Redis University](https://university.redis.io/)

**You know it when** you can say what Redis loses if the server restarts with your settings.

## 2. Queues + event-driven basics (#10) · ~10 h

**Learn**
- Producers, workers, job states; retries with backoff; failed jobs and retrying them by hand.
- Idempotent jobs (a retry must not duplicate data); jobs carry IDs only (D-049).
- Concurrency and stalled jobs.
- Server-sent events for progress.

**Exercise:** a job that fails twice and succeeds the third time, with progress events visible in the browser.

**Resources**
- [BullMQ docs](https://docs.bullmq.io/)
- [NestJS queues](https://docs.nestjs.com/techniques/queues)
- [NestJS server-sent events](https://docs.nestjs.com/techniques/server-sent-events)
- [Using server-sent events (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events)

**You know it when** you can kill the worker at any point and every job still finishes exactly once.

## 3. Python and spaCy basics · ~6 h

**Learn**
- Enough Python: virtual environments, functions, JSON in and out, a CLI entry point.
- spaCy: `Doc`, `Token`, `lemma_`, `pos_`, `morph`, sentence boundaries.
- `de_core_news_sm` (D-050); turning a `Doc` into the per-line word JSON (D-052).

**Exercise:** a script that reads punctuated lines as JSON and prints the per-line word JSON with lemma, POS, morphology and offsets.

**Resources**
- [Python tutorial](https://docs.python.org/3/tutorial/)
- [spaCy 101](https://spacy.io/usage/spacy-101)
- [Advanced NLP with spaCy (free course)](https://course.spacy.io/)
- [Linguistic features](https://spacy.io/usage/linguistic-features)
- [German models](https://spacy.io/models/de)

**You know it when** the script's output matches the D-052 format for a real video.

## 4. LLMs in production · ~3 h

**Learn**
- Batching requests; when the Batch API is worth the delay (it costs half the standard price, with up to a day's turnaround: fine for backfills, not for a transfer the user is waiting on).
- Caching results (translation per video, glosses for everyone, D-060).
- Cost caps and the AI limiter; failure handling and retries.

**Exercise:** translate a whole video's sentences in batches, with a hard stop when a cost cap is reached.

**Resources**
- [Gemini batch mode](https://ai.google.dev/gemini-api/docs/batch-mode)
- [Gemini context caching](https://ai.google.dev/gemini-api/docs/caching)

**You know it when** a runaway job cannot cost more than the cap you set.

## 5. Postgres bulk loading (part of #3) · ~2 h

**Learn**
- `COPY ... FROM` (and Prisma's `$executeRaw` for it), why it is much faster than many `INSERT`s.
- Loading into a staging table, then moving rows with one `INSERT ... SELECT` in a transaction.
- Dropping and rebuilding indexes around a large load; `ANALYZE` afterwards.

**Exercise:** load spike 004's Wiktextract extract with `COPY` and compare the time with row-by-row inserts.

**Resources**
- [COPY](https://www.postgresql.org/docs/current/sql-copy.html)
- [Populating a database](https://www.postgresql.org/docs/current/populate.html)

**You know it when** the full dictionary import runs in minutes and can be repeated safely.
