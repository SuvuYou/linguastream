# Public pages (what scanners can see)

Applies to the demo and, if revived, the public edition (D-038). For the private instance's login page, see D-039.

17. **Public pages make zero third-party requests:** landing, Impressum, privacy policy, attributions, report form. Fonts are self-hosted via `next/font`; no CDNs, no analytics, no embeds.
18. **Login is a modal on the landing page.** The Firebase SDK is loaded with a dynamic `import()` only when the user opens the sign-in modal, not on page load. The privacy policy lists Firebase Auth as strictly necessary for logging in.
19. **The YouTube player loads only inside the logged-in app, after the user opens a video, and only after a one-time consent prompt** ("Videos are played through YouTube; Google receives your IP address and may store data on your device. [Allow and play]"). The choice is remembered and can be withdrawn in settings; without consent the player isn't loaded. `youtube-nocookie.com` still connects to Google, stores data on the device and sends the user's IP, so YouTube/Google is named in the privacy policy as a recipient. "nocookie" is not an exemption.
20. **Sentry and any other third-party script load only in the logged-in app.**
21. **No cookie banner, because nothing besides YouTube needs consent.** Only strictly necessary storage (session cookie, Firebase auth, user preferences). No analytics, ads or marketing pixels: usage numbers come from our own database. Sentry without session replay. Adding anything that stores data on the device for non-essential purposes needs consent, a privacy policy update, and likely a banner.
22. **Impressum and privacy policy are one click away on every page**, including the sign-in modal. The Impressum carries the developer's real name and address (D-015).
