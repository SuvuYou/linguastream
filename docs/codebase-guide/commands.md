# Commands

```bash
npm run dev            # dev server
npm run lint
npm run typecheck      # tsc with tsconfig.ci.json
npm test               # vitest watch
npm run test:coverage  # thresholds: lines/functions/statements 75, branches 70
npx prisma migrate dev # create and apply a migration
npx prisma studio
./ml/start-services.sh # WhisperX + LibreTranslate (local only)
```

Env vars: see the README table. `DEEPL_API_KEY` is used by the current code but missing from that table; it goes away when DeepL is removed (D-017). Only `.env.local` is used; tools outside Next.js load it explicitly via dotenv.
