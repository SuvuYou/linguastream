# Block C: NestJS API and auth

**When:** before Core step B0 (API and auth), the first Core step; publishing a package before B1 (D-090). **Hours:** about 43.
**Block exercise:** the first NestJS module (captures or vocabulary) with a guard that accepts the session cookie or an ID token (D-053), Zod validation, and integration tests.

## 1. Node.js + TS server (#1) · ~15 h

**Learn**
- The event loop, async/await pitfalls, streams.
- A plain Express or Fastify server first: routing, middleware, error handling, config from the environment.
- Graceful shutdown, which the worker needs so jobs aren't cut off.

**Exercise:** a 100-line Express server with an error middleware, env config and graceful shutdown, then the same in NestJS to see what the framework adds.

**Resources**
- [Node.js Learn](https://nodejs.org/en/learn)
- [Express guide](https://expressjs.com/en/guide/routing.html)
- [Node.js best practices](https://github.com/goldbergyoni/nodebestpractices)

**You know it when** you can explain what happens to a request from the socket to your handler and back.

## 2. REST API design (#2) · ~8 h

**Learn**
- Resource naming, methods, status codes, error format.
- Pagination (cursor vs offset), filtering and sorting (the vocabulary filters, D-058).
- Validation at the edge with Zod; shared schemas (`packages/contracts`).
- Idempotency: the same capture sent twice is one job (D-022).

**Exercise:** design the routes for vocabulary, connections and decks on paper, with status codes and error cases, before writing code.

**Resources**
- [Microsoft REST API guidelines](https://github.com/microsoft/api-guidelines)
- [HTTP status codes (MDN)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
- [Zod](https://zod.dev)

**You know it when** every route has a defined error response and a test for it.

## 3. NestJS (#8) · ~10 h

**Learn**
- Modules, providers, dependency injection.
- Controllers, pipes (Zod validation), guards (auth), interceptors (logging), exception filters.
- Configuration, lifecycle hooks, testing with the testing module.

**Exercise:** a `vocabulary` module with a controller, a service and a guard, tested with Supertest.

**Resources**
- [NestJS documentation](https://docs.nestjs.com/)

**You know it when** you can add a module without copying another one.

## 4. Auth (#4) · ~8 h

**Learn**
- Sessions vs tokens; cookie flags (`HttpOnly`, `Secure`, `SameSite`).
- One guard accepting the session cookie or an ID token (D-053).
- Forwarding the cookie from Next.js server components to NestJS.
- Revocation on logout and account deletion; basic authorisation (every query scoped by `user_id`).

**Exercise:** the D-053 guard with tests for: valid cookie, valid ID token, revoked session, missing auth.

**Resources**
- [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [Introduction to JWT](https://jwt.io/introduction)

**You know it when** no route can return another user's data, and a test proves it.

## 5. Publishing a package · ~2 h

**Learn**
- Semantic versioning; building a TS package with types.
- Publishing to GitHub Packages and installing it from another repository (the extension, D-054).
- Changesets for version bumps.

**Exercise:** publish `packages/contracts` 0.1.0 and install it in an empty project.

**Resources**
- [GitHub Packages: npm registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry)
- [Changesets](https://github.com/changesets/changesets)

**You know it when** changing a schema in the main repo and bumping the version updates the extension through one install.
