# Backups and deletion

- Account or video deletion removes data from all live tables immediately, in one transaction, and records the user ID in a deletion log.
- Backups (Neon restore history and/or periodic `pg_dump`) expire on a fixed cycle, documented in the privacy policy (target ≤ 30 days).
- Restoring a backup re-applies the deletion log before the app goes back online.
- Why not delete from backups directly: a backup is a snapshot file; removing one user means rewriting every backup, and backups exist to recover from bad migrations or provider failures. A short, documented expiry is the accepted approach.
