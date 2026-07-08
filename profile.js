/**
 * profile.js — <nostr-profile>, a profile card for any pubkey.
 * No build step.
 *
 * Part of https://github.com/nostr-client — one repo, one thing.
 * License: AGPL-3.0-or-later
 *
 * Usage:
 *   <script type="module" src="https://nostr-client.github.io/profile/profile.js"></script>
 *   <nostr-profile pubkey="<hex>"></nostr-profile>
 *
 * Composability: if the page also imported contacts.js, the card grows a
 * follow button. Pair with <nostr-feed authors="<hex>"> for a profile page.
 */

import { defaultPool } from 'https://nostr-client.github.io/pool/pool.js'
import { profiles, renderContentInto } from 'https://nostr-client.github.io/note/note.js'
import { npubEncode, npubShort } from 'https://nostr-client.github.io/nip19/nip19.js'

const HEX64 = /^[0-9a-f]{64}$/

const TEMPLATE = /* html */ `
<style>
  :host { display: block;
    font-family: var(--nc-font, ui-sans-serif, system-ui, sans-serif);
    font-size: .95rem; color: var(--nc-ink, #201d26); }
  .card { background: var(--nc-surface, #fff); border: 1px solid var(--nc-line, #e9e6e0);
    border-radius: var(--nc-radius, 14px); overflow: hidden;
    box-shadow: var(--nc-shadow, 0 1px 2px rgb(32 27 51 / 4%), 0 6px 24px -10px rgb(32 27 51 / 10%)); }
  .banner { height: 7.5rem; background: var(--nc-accent-soft, #f2ecfd);
    background-size: cover; background-position: center; }
  .inner { padding: 0 1.2rem 1.1rem; }
  .toprow { display: flex; justify-content: space-between; align-items: flex-end;
    margin-top: -2.4rem; }
  .avatar { width: 76px; height: 76px; border-radius: 50%; object-fit: cover;
    background: var(--nc-inset, #f4f2ee); border: 3px solid var(--nc-surface, #fff); }
  .names { margin-top: .7rem; }
  .name { font-weight: 700; font-size: 1.1rem; }
  .nip05 { color: var(--nc-soft, #6d6a76); font-size: .85rem; }
  .npub { font-family: var(--nc-mono, ui-monospace, monospace); font-size: .75rem;
    color: var(--nc-faint, #a8a4b0); margin-top: .15rem; cursor: pointer; }
  .npub:hover { color: var(--nc-soft, #6d6a76); }
  .about { margin-top: .7rem; line-height: 1.55; white-space: pre-wrap;
    overflow-wrap: anywhere; font-family: var(--nc-font-content, inherit); }
  .about a { color: var(--nc-accent, #7c3aed); }
  .about img { max-width: 100%; border-radius: 8px; }
  .links { margin-top: .6rem; font-size: .85rem; display: flex; gap: 1rem; flex-wrap: wrap; }
  .links a { color: var(--nc-accent, #7c3aed); }
</style>
<div class="card">
  <div class="banner" id="banner"></div>
  <div class="inner">
    <div class="toprow">
      <img class="avatar" id="avatar" alt="">
      <span id="actions"></span>
    </div>
    <div class="names">
      <div class="name" id="name"></div>
      <div class="nip05" id="nip05"></div>
      <div class="npub" id="npub" title="click to copy"></div>
    </div>
    <div class="about" id="about"></div>
    <div class="links" id="links"></div>
  </div>
</div>
`

class NostrProfile extends HTMLElement {
  static observedAttributes = ['pubkey']

  constructor() {
    super()
    this.attachShadow({ mode: 'open' }).innerHTML = TEMPLATE
    this.$ = (id) => this.shadowRoot.getElementById(id)
    this.pool = null
  }

  connectedCallback() { this._render() }
  attributeChangedCallback(_n, o, n) { if (o !== n && this.isConnected) this._render() }

  get _pubkey() { return (this.getAttribute('pubkey') || '').toLowerCase() }

  _render() {
    const pubkey = this._pubkey
    if (!HEX64.test(pubkey)) return
    const npub = npubEncode(pubkey)

    this.$('name').textContent = npubShort(pubkey)
    this.$('npub').textContent = npub
    this.$('npub').onclick = () => navigator.clipboard?.writeText(npub)
    this.$('nip05').textContent = ''
    this.$('about').innerHTML = ''
    this.$('links').innerHTML = ''
    this.$('avatar').removeAttribute('src')
    this.$('banner').style.backgroundImage = ''

    // optional enhancements: tip + follow buttons if their modules are on the page
    this.$('actions').innerHTML = ''
    if (customElements.get('nostr-tip')) {
      const tip = document.createElement('nostr-tip')
      tip.setAttribute('pubkey', pubkey)
      this.$('actions').append(tip, ' ')
    }
    if (customElements.get('nostr-follow-button')) {
      const btn = document.createElement('nostr-follow-button')
      btn.setAttribute('pubkey', pubkey)
      this.$('actions').append(btn)
    }

    profiles(this.pool ?? defaultPool()).get(pubkey, (profile) => {
      if (!profile || this._pubkey !== pubkey) return
      const display = profile.display_name || profile.name
      if (display) this.$('name').textContent = display
      if (profile.nip05) this.$('nip05').textContent = '✓ ' + profile.nip05.replace(/^_@/, '')
      if (profile.picture) this.$('avatar').src = profile.picture
      if (profile.banner) this.$('banner').style.backgroundImage = `url("${profile.banner.replaceAll('"', '').replaceAll('\\', '')}")`
      if (profile.about) renderContentInto(this.$('about'), profile.about, { maxLength: 600 })
      const links = this.$('links')
      if (profile.website) {
        const a = document.createElement('a')
        try {
          const url = new URL(profile.website.startsWith('http') ? profile.website : 'https://' + profile.website)
          a.href = url.href
          a.textContent = url.host + (url.pathname !== '/' ? url.pathname : '')
          a.target = '_blank'
          a.rel = 'noopener noreferrer'
          links.append(a)
        } catch {}
      }
      if (profile.lud16) {
        const span = document.createElement('span')
        span.textContent = '⚡ ' + profile.lud16
        links.append(span)
      }
    })
  }
}

if (!customElements.get('nostr-profile')) customElements.define('nostr-profile', NostrProfile)
