import { mkdir, readFile, rename, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import type { FavoriteStory } from '@/lib/favorites';
import { mergeFavorites } from '@/lib/favorites';

export type AccountUser = {
  id: string;
  provider: 'clerk';
  email?: string;
  emailVerified?: boolean;
  createdAt: string;
  updatedAt: string;
  lastSeenAt: string;
  newsletterSubscribedAt?: string;
  favorites: FavoriteStory[];
};

type AccountStore = {
  users: Record<string, AccountUser>;
};

export type AccountIdentity = {
  id: string;
  email?: string;
  emailVerified?: boolean;
};

const emptyStore = (): AccountStore => ({ users: {} });

function storePath() {
  return join(
    process.env.KIDZCOOP_DATA_DIR || join(process.cwd(), '.kidzcoop-data'),
    'account-store.json',
  );
}

async function readStore(): Promise<AccountStore> {
  try {
    const value = JSON.parse(await readFile(storePath(), 'utf8')) as AccountStore;
    return value && typeof value === 'object' && value.users ? value : emptyStore();
  } catch {
    return emptyStore();
  }
}

async function writeStore(store: AccountStore) {
  const path = storePath();
  await mkdir(dirname(path), { recursive: true });
  const temporaryPath = `${path}.tmp`;
  await writeFile(temporaryPath, JSON.stringify(store, null, 2));
  await rename(temporaryPath, path);
}

function normalizeFavorite(value: unknown): FavoriteStory | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;

  const item = value as Record<string, unknown>;
  const id = Number(item.id);
  const title = String(item.title || '').trim();
  const imagePath = String(item.image_path || '').trim();
  const language = String(item.language || '').trim();
  const path = String(item.path || '').trim();
  const savedAtValue = String(item.savedAt || '').trim();
  const savedAt = Number.isFinite(Date.parse(savedAtValue))
    ? savedAtValue
    : new Date().toISOString();

  if (!Number.isFinite(id) || !title || !imagePath || !language || !path) {
    return null;
  }

  return { id, title, image_path: imagePath, language, path, savedAt };
}

export function normalizeFavorites(values: unknown): FavoriteStory[] {
  if (!Array.isArray(values)) return [];
  return values
    .map(normalizeFavorite)
    .filter((favorite): favorite is FavoriteStory => favorite !== null);
}

export async function upsertAccount(identity: AccountIdentity) {
  const now = new Date().toISOString();
  const store = await readStore();
  const current = store.users[identity.id];

  const next: AccountUser = {
    id: identity.id,
    provider: 'clerk',
    createdAt: current?.createdAt || now,
    updatedAt: now,
    lastSeenAt: now,
    favorites: current?.favorites || [],
    ...(current?.newsletterSubscribedAt
      ? { newsletterSubscribedAt: current.newsletterSubscribedAt }
      : {}),
    ...(identity.email ? { email: identity.email } : current?.email ? { email: current.email } : {}),
    emailVerified: identity.emailVerified || current?.emailVerified || false,
  };

  store.users[identity.id] = next;
  await writeStore(store);
  return next;
}

export async function mergeAccountFavorites(identity: AccountIdentity, favorites: FavoriteStory[]) {
  const now = new Date().toISOString();
  const store = await readStore();
  const current = store.users[identity.id] || await upsertAccount(identity);
  const merged = mergeFavorites(current.favorites || [], favorites);
  const next: AccountUser = {
    ...current,
    ...(identity.email ? { email: identity.email } : {}),
    emailVerified: identity.emailVerified || current.emailVerified,
    favorites: merged,
    updatedAt: now,
    lastSeenAt: now,
  };

  store.users[identity.id] = next;
  await writeStore(store);
  return next;
}

export async function markNewsletterSubscribed(identity: AccountIdentity) {
  const now = new Date().toISOString();
  const store = await readStore();
  const current = store.users[identity.id] || await upsertAccount(identity);
  const next: AccountUser = {
    ...current,
    ...(identity.email ? { email: identity.email } : {}),
    emailVerified: identity.emailVerified || current.emailVerified,
    newsletterSubscribedAt: current.newsletterSubscribedAt || now,
    updatedAt: now,
    lastSeenAt: now,
  };

  store.users[identity.id] = next;
  await writeStore(store);
  return next;
}
