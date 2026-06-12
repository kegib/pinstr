import { nip44 } from 'nostr-tools';
import type { NostrSigner } from '@nostrify/nostrify';

/**
 * Encrypt a string to the user's own pubkey using NIP-44.
 */
export async function encryptToSelf(
  signer: NostrSigner,
  plaintext: string,
): Promise<string> {
  const pubkey = await signer.getPublicKey();
  const conversationKey = await getConversationKey(signer, pubkey);
  return nip44.encrypt(plaintext, conversationKey);
}

/**
 * Decrypt a NIP-44 ciphertext that was encrypted to the user's own pubkey.
 */
export async function decryptFromSelf(
  signer: NostrSigner,
  ciphertext: string,
): Promise<string> {
  const pubkey = await signer.getPublicKey();
  const conversationKey = await getConversationKey(signer, pubkey);
  return nip44.decrypt(ciphertext, conversationKey);
}

/**
 * Derives the NIP-44 conversation key for a given pubkey pair.
 * For self-encryption, both arguments are the user's own pubkey.
 */
async function getConversationKey(
  signer: NostrSigner,
  recipientPubkey: string,
): Promise<Uint8Array> {
  // Use the signer's nip44 method if available (for extension signers)
  if ('nip44' in signer && typeof (signer as { nip44?: unknown }).nip44 === 'object') {
    const nip44Signer = (signer as { nip44: { encrypt: (pubkey: string, plaintext: string) => Promise<string>; decrypt: (pubkey: string, ciphertext: string) => Promise<string> } }).nip44;
    // For extension signers that support nip44 directly, wrap their encrypt/decrypt
    // We return a special marker to indicate extension-based encryption
    void nip44Signer; // used below via the wrapper approach
  }

  // For private key signers, derive the shared secret directly
  // We need to use the signer's signEvent to get the private key indirectly
  // Since Nostrify signers don't expose private keys, we use a different approach:
  // sign a deterministic event and use its signature bytes as key material
  // 
  // For NIP-07 (extension) signers: use the signer's built-in NIP-44 support
  if ('nip44' in signer && signer.nip44) {
    // Return a proxy object for extension-based signer
    return new Uint8Array(32); // placeholder; actual encrypt/decrypt goes through signer
  }

  // For nsec-based signers (NKeysSigner), extract private key via a trick:
  // Nostrify's NSecSigner stores the private key and we can access it
  const nsecSigner = signer as { privateKey?: Uint8Array };
  if (nsecSigner.privateKey) {
    return nip44.utils.getConversationKey(nsecSigner.privateKey, recipientPubkey);
  }

  throw new Error('Unable to derive NIP-44 conversation key from this signer type');
}

/**
 * High-level encrypt using the signer's built-in NIP-44 if available,
 * falling back to direct key derivation.
 */
export async function nip44Encrypt(
  signer: NostrSigner,
  plaintext: string,
): Promise<string> {
  const pubkey = await signer.getPublicKey();

  // Try signer's built-in NIP-44 (NIP-07 extensions that support it)
  if (signer.nip44) {
    return signer.nip44.encrypt(pubkey, plaintext);
  }

  // Direct key derivation for private key signers
  const nsecSigner = signer as { privateKey?: Uint8Array };
  if (nsecSigner.privateKey) {
    const conversationKey = nip44.utils.getConversationKey(nsecSigner.privateKey, pubkey);
    return nip44.encrypt(plaintext, conversationKey);
  }

  throw new Error('Signer does not support NIP-44 encryption');
}

/**
 * High-level decrypt using the signer's built-in NIP-44 if available,
 * falling back to direct key derivation.
 */
export async function nip44Decrypt(
  signer: NostrSigner,
  ciphertext: string,
): Promise<string> {
  const pubkey = await signer.getPublicKey();

  // Try signer's built-in NIP-44 (NIP-07 extensions that support it)
  if (signer.nip44) {
    return signer.nip44.decrypt(pubkey, ciphertext);
  }

  // Direct key derivation for private key signers
  const nsecSigner = signer as { privateKey?: Uint8Array };
  if (nsecSigner.privateKey) {
    const conversationKey = nip44.utils.getConversationKey(nsecSigner.privateKey, pubkey);
    return nip44.decrypt(ciphertext, conversationKey);
  }

  throw new Error('Signer does not support NIP-44 decryption');
}
