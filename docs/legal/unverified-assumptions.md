# Unverified legal assumptions

No lawyer consultation is planned (D-015). The design rests on these assumptions. If a lawyer is consulted later, these are the questions to bring.

1. **Storing captions a user captured, per user, is a private copy made by the user** (§53(1) sentence 1 UrhG). Basis: the Federal Court of Justice's recorder cases (Internet-Radiorecorder, I ZR 32/19, 2020; Internet-Radiorecorder II, I ZR 14/21, 2024), where the customer alone is the maker of a copy produced by a fully automated service, and the provider isn't liable without an unlawful act by the user. Those cases were about radio and TV recording; captions from YouTube are untested.
2. **Passively copying the player's caption response isn't circumvention of a technical measure** (§95a UrhG). Untested. This is the weakest point.
3. **Sending the text to processors** (translation, Gemini) counts as part of the user's automated copying process. Untested, low risk.
4. **YouTube's terms of service** are a contract matter, not copyright. Google can still remove the extension from the Chrome Web Store or send a cease-and-desist letter.
5. **DSA:** the app is a hosting service, not an online platform; whether a private individual counts as a micro enterprise (transparency report exemption) is unclear.
6. **A one-time in-app consent prompt before loading the YouTube player** is sufficient under §25 TDDDG without a site-wide banner.
7. **Cross-user aggregate lemma statistics** (no text) would be acceptable for discovery. Not built until checked.
8. **The §97a(3) UrhG cost cap** would apply to the operator of a free service that is also a portfolio piece.
9. **Capturing from an embedded player on our own site** (D-028) is the same passive copy as on youtube.com. Not analysed yet; do not build before checking guardrails 12–15 against it.
10. **Sharing the private instance with personally known friends** stays within private use (§53). From memory, not verified.
11. **Processing text on the server without storing it** (public edition) is a temporary copy under §44a UrhG. Untested.
12. **Assumption 8 is doubtful:** the fee cap needs a natural person not acting commercially or professionally and can be set aside as inequitable (D-034).
13. **The private instance needs no Impressum** because it is login-gated, has no public sign-up and is not promoted (D-035). Unverified; it stops being true the moment the instance is offered to people the developer does not know.
