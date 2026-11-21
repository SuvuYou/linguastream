# Block G: quality

**When:** frontend testing next to Block F; load testing before Demo step D2; Playwright before Important step E5. **Hours:** about 14.
**Block exercise:** an E2E test of the Core flow (open a video, look up a word, save it, review it) running in CI, plus a load test whose numbers go in the README.

## 1. Frontend testing · ~6 h

**Learn**
- Testing Library: query by role, test behaviour not implementation.
- Mocking the network at the boundary.

**Exercise:** tests for the full popup: shows the dictionary translation, badges, and saves on click.

**Resources**
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Common mistakes with React Testing Library](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

**You know it when** refactoring a component's internals doesn't break its tests.

## 2. Playwright · ~4 h

**Learn**
- Locators, auto-waiting, fixtures, authenticated state.
- Running in CI with traces on failure.

**Exercise:** the Core flow E2E, against a seeded test database.

**Resources**
- [Playwright docs](https://playwright.dev/docs/intro)

**You know it when** a failing E2E run in CI gives you a trace that shows what broke.

## 3. Load testing · ~4 h

**Learn**
- Scenarios that match real use (watching, lookups, reviews), not just hammering one route.
- Reading latency percentiles and finding the bottleneck.

**Exercise:** a k6 script for 50 simultaneous users doing the Core flow against a staging copy.

**Resources**
- [k6 documentation](https://grafana.com/docs/k6/latest/)

**You know it when** you can state in the README how many users the server handles and what limits it.
