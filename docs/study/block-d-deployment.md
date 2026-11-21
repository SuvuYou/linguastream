# Block D: deployment and operations

**When:** before Demo step D1, the first deployment (D-090). Until then everything runs locally. **Hours:** about 26.
**Block exercise:** deploy the current app to the VPS with Compose and Caddy from a GitHub Actions workflow, then restore last night's backup into a fresh database.

## 1. Docker (#6), the rest of it · ~6 h

Running Postgres locally with Compose was covered in Block B (section 5).

**Learn**
- Images and layers, multi-stage builds, small images, `.dockerignore`.
- Next.js standalone output in a container.
- Compose: services, networks, volumes, health checks, `depends_on`, memory limits, restart policies.
- Postgres and Redis in Compose with persistent volumes.

**Exercise:** a Compose file with web, api, postgres and redis that comes up cleanly with one command and survives a restart without losing data.

**Resources**
- [Docker get started](https://docs.docker.com/get-started/)
- [Multi-stage builds](https://docs.docker.com/build/building/multi-stage/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Next.js `output: "standalone"`](https://nextjs.org/docs/app/api-reference/config/next-config-js/output)

**You know it when** you can rebuild everything from the repository on a new machine.

## 2. Linux server basics and Caddy · ~6 h

**Learn**
- SSH keys, a non-root user, firewall (`ufw`), automatic security updates.
- Reading logs (`journalctl`, `docker logs`), disk and memory checks.
- Caddy: automatic TLS, `reverse_proxy`, path routing (`/api/*` → NestJS, D-053).

**Exercise:** set up a fresh VPS by hand from a checklist, then write the checklist down.

**Resources**
- [Initial server setup with Ubuntu (DigitalOcean)](https://www.digitalocean.com/community/tutorials/initial-server-setup-with-ubuntu)
- [Caddy documentation](https://caddyserver.com/docs/)
- [Caddy `reverse_proxy`](https://caddyserver.com/docs/caddyfile/directives/reverse_proxy)

**You know it when** the server only accepts SSH with your key and serves the app over HTTPS.

## 3. CI/CD with GitHub Actions (#7) · ~6 h

**Learn**
- Workflows, jobs, caching, matrix builds, secrets and environments.
- Building and pushing images to a registry (GHCR).
- Deploying over SSH: pull, migrate, restart; rolling back.

**Exercise:** a workflow that on merge to `master` builds both images, pushes them, and deploys.

**Resources**
- [GitHub Actions docs](https://docs.github.com/en/actions)
- [docker/build-push-action](https://github.com/docker/build-push-action)
- [appleboy/ssh-action](https://github.com/appleboy/ssh-action)

**You know it when** a merge reaches production without you touching the server, and you know how to roll back.

## 4. Postgres operations · ~3 h

**Learn**
- `pg_dump` and `pg_restore`; custom format; restoring into a new database.
- Copying backups off the server; retention (≤ 30 days, D-051).
- Re-applying the deletion log after a restore.

**Exercise:** a nightly backup script with retention, then a restore drill.

**Resources**
- [SQL dump](https://www.postgresql.org/docs/current/backup-dump.html)

**You know it when** you have restored a backup at least once (D-051).

## 5. Observability (#12) · ~5 h

**Learn**
- Structured JSON logs with pino; request IDs; never logging transcript text (guardrail 27).
- Sentry for Next.js and NestJS, with scrubbing.
- Health checks and an uptime monitor.

**Exercise:** trigger an error in the API and find it in Sentry with the request ID, and with no request body.

**Resources**
- [pino](https://getpino.io)
- [Sentry for Next.js](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Sentry for NestJS](https://docs.sentry.io/platforms/javascript/guides/nestjs/)
- [Sentry: scrubbing sensitive data](https://docs.sentry.io/platforms/javascript/data-management/sensitive-data/)

**You know it when** you can find out why a job failed last night without SSH-ing into the server.
