# Pinstr — Custom Nostr Event Schemas

Pinstr uses **kind 30078** (NIP-78 application-specific addressable data) for all data events.
Events are identified by `L`/`l` label tags and namespaced `d` tags.

## Kind 30078 — Pinstr Data Events

All Pinstr events include these label tags per NIP-32/NIP-78:
```json
["L", "pinstr"],
["l", "<type>", "pinstr"]
```

Where `<type>` is `bookmark`, `collection`, or `settings`.

### Private Bookmark (default)

The `d` tag is `pinstr/b/<nanoid>`. Content is NIP-44 encrypted to the user's own pubkey.
Tags are minimal to prevent metadata leakage.

```json
{
  "kind": 30078,
  "tags": [
    ["d", "pinstr/b/<nanoid>"],
    ["L", "pinstr"],
    ["l", "bookmark", "pinstr"]
  ],
  "content": "<NIP-44 encrypted JSON of BookmarkData>"
}
```

**BookmarkData schema** (encrypted JSON):
```typescript
interface BookmarkData {
  id: string;          // nanoid
  url: string;
  title: string;
  description: string;
  image: string | null; // og:image
  favicon: string | null;
  tags: string[];
  collections: string[]; // collection nanoid IDs
  notes: string;
  isPublic: boolean;
  savedAt: number;     // Unix ms
}
```

### Public Bookmark

Content is the user's personal notes (plaintext). All metadata in tags.

```json
{
  "kind": 30078,
  "tags": [
    ["d", "pinstr/b/<nanoid>"],
    ["L", "pinstr"],
    ["l", "bookmark", "pinstr"],
    ["r", "<url>"],
    ["title", "<title>"],
    ["description", "<description>"],
    ["image", "<og:image>"],
    ["t", "<tag1>"],
    ["collection", "<collection-nanoid>"],
    ["public", "true"]
  ],
  "content": "User's personal notes"
}
```

### Private Collection (default)

```json
{
  "kind": 30078,
  "tags": [
    ["d", "pinstr/c/<nanoid>"],
    ["L", "pinstr"],
    ["l", "collection", "pinstr"]
  ],
  "content": "<NIP-44 encrypted JSON of CollectionData>"
}
```

**CollectionData schema** (encrypted JSON):
```typescript
interface CollectionData {
  id: string;
  name: string;
  description: string;
  icon: string;       // emoji
  color: string;      // hex color
  isPublic: boolean;
  sortOrder: number;
}
```

### Public Collection

```json
{
  "kind": 30078,
  "tags": [
    ["d", "pinstr/c/<nanoid>"],
    ["L", "pinstr"],
    ["l", "collection", "pinstr"],
    ["title", "<name>"],
    ["description", "<description>"],
    ["public", "true"]
  ],
  "content": ""
}
```

### User Settings

Always encrypted to self.

```json
{
  "kind": 30078,
  "tags": [
    ["d", "pinstr/settings"],
    ["L", "pinstr"],
    ["l", "settings", "pinstr"]
  ],
  "content": "<NIP-44 encrypted JSON of UserSettings>"
}
```

## NIP-51 Hybrid Sync

- **Kind 10003** (NIP-51 bookmark list): Updated when public bookmarks change. Contains `["r", "<url>"]` tags for each public bookmark URL.
- **Kind 30003** (NIP-51 bookmark sets): One per public collection. Contains `["r", "<url>"]` tags for each public bookmark in the collection plus `["d", "<slug>"]`, `["name", "<name>"]`, `["description", "<desc>"]`.

## Deletion

Kind 5 events (NIP-09) referencing the event ID of the item to delete.

## Relay Filter

To query all Pinstr data for a user:
```json
{ "kinds": [30078], "authors": ["<pubkey>"], "#L": ["pinstr"] }
```
