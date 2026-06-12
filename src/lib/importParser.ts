import type { ImportedBookmark } from './types';

/**
 * Parse Netscape Bookmark Format HTML files.
 * Recursively walks DL/DT elements to extract bookmarks and folder hierarchy.
 */
export function parseNetscapeBookmarkHtml(html: string): ImportedBookmark[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const results: ImportedBookmark[] = [];

  function walk(node: Element, folderPath: string[]) {
    // A <DL> contains <DT> children
    const children = Array.from(node.children);

    for (const child of children) {
      if (child.tagName === 'DT') {
        // Could contain an <A> (bookmark) or <H3> + <DL> (folder)
        const anchor = child.querySelector(':scope > A') as HTMLAnchorElement | null;
        const heading = child.querySelector(':scope > H3');
        const subDl = child.querySelector(':scope > DL');

        if (anchor) {
          const href = anchor.getAttribute('href');
          if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
            const addDateAttr = anchor.getAttribute('ADD_DATE');
            const addDate = addDateAttr ? parseInt(addDateAttr, 10) * 1000 : null;
            results.push({
              url: href,
              title: anchor.textContent?.trim() || href,
              addDate: addDate && !isNaN(addDate) ? addDate : null,
              folder: [...folderPath],
            });
          }
        } else if (heading && subDl) {
          const folderName = heading.textContent?.trim() || 'Untitled';
          walk(subDl, [...folderPath, folderName]);
        } else if (subDl) {
          // DL without a heading — walk it at the same level
          walk(subDl, folderPath);
        }
      } else if (child.tagName === 'DL') {
        walk(child, folderPath);
      }
    }
  }

  // Start from the top-level DL
  const topDl = doc.querySelector('DL');
  if (topDl) {
    walk(topDl, []);
  }

  return results;
}

/**
 * Get unique folder paths from imported bookmarks.
 */
export function getUniqueFolders(bookmarks: ImportedBookmark[]): string[][] {
  const seen = new Set<string>();
  const folders: string[][] = [];

  for (const bm of bookmarks) {
    if (bm.folder.length === 0) continue;
    const key = bm.folder.join('/');
    if (!seen.has(key)) {
      seen.add(key);
      folders.push(bm.folder);
    }
  }

  return folders;
}

/**
 * Get all bookmarks in a specific folder path.
 */
export function getBookmarksInFolder(
  bookmarks: ImportedBookmark[],
  folder: string[],
): ImportedBookmark[] {
  const key = folder.join('/');
  return bookmarks.filter((bm) => bm.folder.join('/') === key);
}
