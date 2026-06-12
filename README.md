# Keepstr

**Keepstr** is a decentralized bookmark manager built on the [Nostr](https://nostr.com) protocol. Save, organize, and optionally share bookmarks — with no server, no sign-up, and no vendor lock-in. Your data lives on Nostr relays and is encrypted by default.

[![Edit with Shakespeare](https://shakespeare.diy/badge.svg)](https://shakespeare.diy/clone?url=https%3A%2F%2Fgithub.com%2Fkegib%2Fpinstr.git)

---

## Features

- **Private by default** — All bookmarks and collections are [NIP-44](https://github.com/nostr-protocol/nips/blob/master/44.md) encrypted to your own key. Only you can read them.
- **Public sharing** — Toggle any bookmark or collection public. Public items appear on your shareable profile page at `/p/<npub>` and sync to standard NIP-51 bookmark lists.
- **Collections** — Organize bookmarks into color-coded, emoji-labeled collections with full CRUD.
- **Full-text search** — Instant local search across title, description, notes, URL, and tags using [MiniSearch](https://lucaong.github.io/minisearch/) with fuzzy matching.
- **Auto-metadata scraping** — Paste a URL and title, description, image, and favicon are scraped automatically (with CORS proxy fallback).
- **Browser bookmark import** — Import from Chrome, Firefox, or Safari via the Netscape Bookmark HTML format, with folder → collection mapping.
- **Command palette** — `Cmd+K` / `Ctrl+K` for quick navigation, search, and actions.
- **Nostr sync** — On login, existing events are pulled from relays and merged with local IndexedDB. All saves publish immediately to your configured relays.
- **Offline-capable** — All data is stored locally in IndexedDB via [Dexie](https://dexie.org/). The app works without a network connection after first load.
- **No server required** — The entire backend is the Nostr relay network.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite |
| Styling | TailwindCSS v4 + shadcn/ui |
| Nostr | Nostrify (`@nostrify/react`) |
| Local DB | Dexie v4 (IndexedDB) |
| Search | MiniSearch v7 |
| Encryption | NIP-44 via `nostr-tools` |
| IDs | nanoid v5 |
| Toasts | Sonner |
| Dates | date-fns |
| Language | TypeScript (strict) |

---

## Getting Started

### Prerequisites

- Node.js 22+
- npm

### Install & Run

```bash
git clone https://github.com/kegib/pinstr.git
cd pinstr
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Build

```bash
npm run build
```

Output is in `dist/`. The app is a fully static SPA — deploy to any static host (Netlify, Vercel, Cloudflare Pages, nsite, etc.).

---

## Usage

### Logging In

Keepstr uses your Nostr identity. Three login methods are supported:

1. **Browser extension (NIP-07)** — Recommended. Works with [Alby](https://getalby.com), [nos2x](https://github.com/fiatjaf/nos2x), [Nostore](https://apps.apple.com/app/nostore/id1666553677), and others.
2. **Private key (nsec)** — Paste your `nsec1...` key directly. Use only on trusted, private devices. The key is never persisted to storage.
3. **Generate new keys** — Creates a fresh keypair. Save your `nsec` somewhere safe before continuing.

### Saving a Bookmark

Click **Add** in the top bar or press `Cmd+K → New Bookmark`. Paste a URL — title, description, image, and favicon are auto-filled. Add tags, assign to collections, write private notes, and choose public or private visibility.

### Collections

Go to **Collections** in the sidebar to create and manage collections. Each collection has a name, emoji icon, color accent, and optional description. Bookmarks can belong to multiple collections.

### Search

Click the search bar (or press `Cmd+K`) to search across all your bookmarks. Searches title, description, notes, URL, and tags with fuzzy matching.

### Importing Bookmarks

Go to **Import** in the sidebar. Export your bookmarks from your browser:

- **Chrome:** Bookmark manager → `⋮` menu → Export bookmarks
- **Firefox:** Bookmarks → Manage bookmarks → Import & Backup → Export Bookmarks to HTML
- **Safari:** File → Export Bookmarks

Drop the `.html` file into the import wizard, map folders to Keepstr collections, and click Import.

### Public Profile

Any user with public bookmarks or collections has a shareable profile page at:

```
/p/<npub>
```

This page is publicly accessible with no login required. It shows the user's Nostr profile and their public collections and bookmarks fetched live from relays.

### Settings

Configure relays, default privacy, theme (light/dark/system), and export your bookmarks as JSON.

---

## Nostr Event Schema

Keepstr uses **kind 30078** (NIP-78 addressable application data) for all data. See [`NIP.md`](./NIP.md) for the full event schema specification, including:

- Private bookmark events (NIP-44 encrypted content)
- Public bookmark events (plaintext content + metadata tags)
- Private/public collection events
- Encrypted settings events
- NIP-51 hybrid sync (kind 10003 bookmark lists, kind 30003 bookmark sets)
- NIP-09 deletion events

### Relay Filter

To query all Keepstr data for a user with any relay client:

```json
{ "kinds": [30078], "authors": ["<pubkey hex>"], "#L": ["keepstr"] }
```

---

## Privacy Model

| Scenario | What's stored on relays |
|---|---|
| Private bookmark | Encrypted blob. Only `d`, `L`, `l` tags are visible — no URL, title, or any metadata. |
| Public bookmark | Full plaintext. URL, title, description, image, tags all indexed and visible. |
| Private collection | Encrypted blob. Name, icon, color hidden. |
| Public collection | Name and description visible. |
| Settings | Always encrypted. |

Making something private strips all metadata tags, re-encrypts, and removes it from NIP-51 lists. Making something public does the reverse.

---

## Project Structure

```
src/
├── components/
│   ├── pinstr/          # Keepstr-specific UI components
│   │   ├── AppNavBar.tsx
│   │   ├── AppSidebar.tsx
│   │   ├── BookmarkCard.tsx
│   │   ├── BookmarkGrid.tsx
│   │   ├── CollectionCard.tsx
│   │   ├── CollectionGrid.tsx
│   │   ├── CollectionModal.tsx
│   │   ├── CommandPalette.tsx
│   │   ├── ConfirmDialog.tsx
│   │   ├── ImportWizard.tsx
│   │   ├── RequireAuth.tsx
│   │   ├── SaveBookmarkModal.tsx
│   │   └── TagBadge.tsx
│   └── ui/              # shadcn/ui primitives
├── hooks/
│   ├── useBookmarks.ts       # Bookmark CRUD + IndexedDB
│   ├── useCollections.ts     # Collection CRUD + IndexedDB
│   ├── usePinstrSearch.ts    # MiniSearch integration
│   ├── usePinstrSettings.ts  # User settings persistence
│   └── usePinstrSync.ts      # Nostr relay sync engine
├── lib/
│   ├── db.ts            # Dexie database schema
│   ├── encryption.ts    # NIP-44 encrypt/decrypt
│   ├── events.ts        # Nostr event builders & parsers
│   ├── importParser.ts  # Netscape HTML bookmark parser
│   ├── scraper.ts       # Open Graph metadata scraper
│   ├── search.ts        # MiniSearch configuration
│   └── types.ts         # TypeScript type definitions
└── pages/
    ├── Index.tsx             # Landing page
    ├── LoginPage.tsx         # Login page
    ├── app/
    │   ├── AppLayout.tsx         # Protected layout + modal orchestration
    │   ├── AppDashboard.tsx      # All bookmarks
    │   ├── AppSearch.tsx         # Search results
    │   ├── AppCollections.tsx    # Collections list
    │   ├── AppCollectionDetail.tsx
    │   ├── AppBookmarkDetail.tsx
    │   ├── AppNew.tsx            # New bookmark redirect
    │   ├── AppImport.tsx         # Import wizard
    │   └── AppSettings.tsx       # Settings page
    └── p/
        └── PublicProfile.tsx     # Public profile (/p/:npub)
```

---

## License

MIT
