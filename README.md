# profile

`<nostr-profile>` — a profile card for any pubkey: banner, avatar, name,
NIP-05, about, links. **No build step.** One file: [`profile.js`](profile.js).

Part of [nostr-client](https://github.com/nostr-client) — a modular, composable
nostr client where each repo does one thing.

**Live demo:** https://nostr-client.github.io/profile/

## Use

```html
<script type="module" src="https://nostr-client.github.io/profile/profile.js"></script>
<nostr-profile pubkey="<hex>"></nostr-profile>
```

A full profile *page* is just composition:

```html
<nostr-profile pubkey="<hex>"></nostr-profile>
<nostr-feed authors="<hex>"></nostr-feed>
```

If the page imported [contacts](https://github.com/nostr-client/contacts),
the card grows a follow button automatically — same optional-enhancement
pattern as reactions on note cards.

npub appears once, as display text you can click to copy — every API here is
hex, as everywhere in nostr-client.

## License

AGPL-3.0-or-later
