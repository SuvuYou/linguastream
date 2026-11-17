# Backups and deletion

- Account or video deletion removes data from all live tables immediately, in one transaction, and records the user ID in a deletion log.
- Account or video deletion: a deleted video takes its connections with it; the words stay (D-047).
- Backups (D-051): a nightly `pg_dump` copied to storage off the server, plus the provider's server snapshots. Both expire on a fixed cycle, documented in the privacy note (target ≤ 30 days). A restore is practised at least once.
- Restoring a backup re-applies the deletion log before the app goes back online.
- Why not delete from backups directly: a backup is a snapshot file; removing one user means rewriting every backup, and backups exist to recover from bad migrations or provider failures. A short, documented expiry is the accepted approach.
