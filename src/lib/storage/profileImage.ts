const DB_NAME = 'harmony-lab';
const STORE_NAME = 'profile-images';
const DB_VERSION = 1;

interface ProfileImageRecord {
  id: string;
  dataUrl: string;
}

function openDatabase(): Promise<IDBDatabase> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.reject(new Error('IndexedDB is not available in this environment.'));
  }

  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(request.error ?? new Error('Failed to open IndexedDB.'));
    };

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };
  });
}

function generateImageId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `profile-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function saveProfileImage(dataUrl: string): Promise<string> {
  const db = await openDatabase();
  const id = generateImageId();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put({ id, dataUrl } satisfies ProfileImageRecord);

    request.onerror = () => {
      reject(request.error ?? new Error('Failed to save profile image.'));
    };

    transaction.oncomplete = () => {
      db.close();
      resolve(id);
    };

    transaction.onabort = () => {
      db.close();
      reject(transaction.error ?? new Error('Failed to save profile image.'));
    };
  });
}

export async function getProfileImage(id: string): Promise<string | null> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onerror = () => {
      reject(request.error ?? new Error('Failed to read profile image.'));
    };

    request.onsuccess = () => {
      const record = request.result as ProfileImageRecord | undefined;
      resolve(record?.dataUrl ?? null);
    };

    transaction.oncomplete = () => {
      db.close();
    };

    transaction.onabort = () => {
      db.close();
      reject(transaction.error ?? new Error('Failed to read profile image.'));
    };
  });
}

export async function deleteProfileImage(id: string): Promise<void> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onerror = () => {
      reject(request.error ?? new Error('Failed to delete profile image.'));
    };

    transaction.oncomplete = () => {
      db.close();
      resolve();
    };

    transaction.onabort = () => {
      db.close();
      reject(transaction.error ?? new Error('Failed to delete profile image.'));
    };
  });
}
