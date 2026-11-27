# NLP service

spaCy (`de_core_news_sm`) behind one HTTP route, used only by the processing worker (change 024, D-102).

- `POST /analyse` `{ "sentences": ["…", …] }` → tokens per sentence: `start` (character offset), `text`, `lemma`, `pos`, `tag`, `morph`, `dep`, `head` (token index in the sentence). At most 500 sentences per call.
- `GET /health`

It stores nothing and logs no text (`--no-access-log`).

```bash
docker compose up -d nlp                       # http://localhost:8100
docker compose build --build-arg DEV=true nlp && docker compose run --rm nlp python -m pytest -q
```
