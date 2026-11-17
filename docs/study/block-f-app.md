# Block F: learner-facing app

**When:** before the watch page, popups, vocabulary and review work. **Hours:** about 40 (a refresher: you know React and TypeScript already).
**Block exercise:** the small and full popups (D-056) reading from the word pack (D-058), keyboard accessible, with status changes that update the colouring instantly.

## 1. Next.js · ~10 h

**Learn**
- App Router: layouts, server and client components, where data is fetched.
- Caching and revalidation; why pages that call NestJS should not cache user data.
- Calling NestJS from server components with the forwarded cookie (D-053).

**Exercise:** a server-rendered vocabulary page that fetches from NestJS and a client component that filters it.

**Resources**
- [Next.js docs](https://nextjs.org/docs)
- [Next.js Learn](https://nextjs.org/learn)

**You know it when** you can say for each component whether it runs on the server or in the browser, and why.

## 2. React + TypeScript refresh · ~12 h

**Learn**
- Rendering and re-rendering; when effects are wrong ("you might not need an effect").
- Generics, discriminated unions and utility types for the event bus and contracts.
- Performance: memoisation only where measured.

**Exercise:** refactor one existing component that uses `useEffect` for derived state.

**Resources**
- [react.dev Learn](https://react.dev/learn)
- [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)
- [TypeScript handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

**You know it when** your components have no effects that only copy props into state.

## 3. TanStack Query · ~3 h

**Learn**
- Query keys, invalidation, stale time.
- Optimistic updates (status changes, Save) with rollback.

**Exercise:** right-click status cycling (D-056) with an optimistic update and rollback on error.

**Resources**
- [TanStack Query docs](https://tanstack.com/query/latest/docs/framework/react/overview)
- [Practical React Query (TkDodo)](https://tkdodo.eu/blog/practical-react-query)

**You know it when** a failed save visibly reverts without a page reload.

## 4. Tailwind + shadcn/ui + Radix · ~5 h

**Learn**
- Radix popovers, tabs, dialogs: focus management and positioning.
- shadcn components as owned code; theming with CSS variables (light and dark).

**Exercise:** the sidebar with its four tabs (D-056) as an accessible Radix tabs component.

**Resources**
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/docs)
- [Radix Primitives](https://www.radix-ui.com/primitives/docs/overview/introduction)

**You know it when** the popups work with the keyboard alone.

## 5. i18n with next-intl · ~2 h

**Learn**
- Message files, locale detection, formatting dates and numbers.
- Keeping UI strings out of components from the start (D-057).

**Exercise:** move one page's strings into `en.json` and add a placeholder `uk.json`.

**Resources**
- [next-intl: App Router setup](https://next-intl.dev/docs/getting-started/app-router) (the "without i18n routing" variant fits: the locale comes from the user's setting, D-057)

**You know it when** adding Ukrainian later means translating one file, not touching components.

## 6. Performance and accessibility · ~8 h

**Learn**
- Core Web Vitals; measuring with Lighthouse and the Performance panel.
- Code splitting; loading the word pack once (D-058).
- ARIA patterns for popovers and tabs; keyboard navigation; focus traps.

**Exercise:** profile the watch page with a one-hour video and fix the slowest interaction.

**Resources**
- [Web Vitals (web.dev)](https://web.dev/articles/vitals)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)

**You know it when** the small popup opens with no network request and no visible delay.
