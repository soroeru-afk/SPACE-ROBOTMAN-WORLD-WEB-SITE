// High-capacity IndexedDB storage for SPACE ROBOTMAN WORLD
// Enables offline PWA & fallback storage without 5MB localStorage quota limits.

import { AppData, defaultAppData } from "./defaultData";

const DB_NAME = "SpaceRobotmanDB";
const DB_VERSION = 1;
const STORE_APP = "appState";
const STORE_MEDIA = "localMedia";

export interface LocalMediaItem {
  id: string;
  name: string;
  category: "ART" | "CHAR" | "MOTION" | "LOGO";
  dataUrl: string;
  createdAt: number;
}

let dbPromise: Promise<IDBDatabase> | null = null;

export function getIDB(): Promise<IDBDatabase> {
  if (typeof window === "undefined" || !("indexedDB" in window)) {
    return Promise.reject(new Error("IndexedDB is not supported in this environment"));
  }

  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_APP)) {
          db.createObjectStore(STORE_APP, { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains(STORE_MEDIA)) {
          db.createObjectStore(STORE_MEDIA, { keyPath: "id" });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        console.warn("Failed to open IndexedDB:", request.error);
        reject(request.error);
      };
    });
  }

  return dbPromise;
}

/**
 * Save complete AppData to IndexedDB
 */
export async function saveAppDataToIndexedDB(data: Partial<AppData>): Promise<boolean> {
  try {
    const db = await getIDB();
    const existing = await loadAppDataFromIndexedDB();
    const merged = { ...defaultAppData, ...(existing || {}), ...data };

    return new Promise((resolve) => {
      const tx = db.transaction(STORE_APP, "readwrite");
      const store = tx.objectStore(STORE_APP);
      const putReq = store.put({ id: "current_app_data", data: merged, updatedAt: Date.now() });

      putReq.onsuccess = () => resolve(true);
      putReq.onerror = () => {
        console.warn("Failed to save app data to IndexedDB:", putReq.error);
        resolve(false);
      };
    });
  } catch (err) {
    console.warn("IndexedDB saveAppData error:", err);
    return false;
  }
}

/**
 * Load AppData from IndexedDB
 */
export async function loadAppDataFromIndexedDB(): Promise<AppData | null> {
  try {
    const db = await getIDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_APP, "readonly");
      const store = tx.objectStore(STORE_APP);
      const getReq = store.get("current_app_data");

      getReq.onsuccess = () => {
        if (getReq.result && getReq.result.data) {
          resolve(getReq.result.data as AppData);
        } else {
          resolve(null);
        }
      };

      getReq.onerror = () => {
        console.warn("Failed to read from IndexedDB:", getReq.error);
        resolve(null);
      };
    });
  } catch (err) {
    console.warn("IndexedDB loadAppData error:", err);
    return null;
  }
}

/**
 * Convert a File object into Base64 DataURL
 */
export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Save local media item to IndexedDB mediaStore
 */
export async function saveLocalMediaItem(
  file: File,
  category: "ART" | "CHAR" | "MOTION" | "LOGO",
  customName?: string
): Promise<LocalMediaItem> {
  const dataUrl = await readFileAsDataURL(file);
  const id = `local_${category.toLowerCase()}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const item: LocalMediaItem = {
    id,
    name: customName || file.name,
    category,
    dataUrl,
    createdAt: Date.now(),
  };

  try {
    const db = await getIDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_MEDIA, "readwrite");
      const store = tx.objectStore(STORE_MEDIA);
      const req = store.put(item);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.warn("Failed to write to mediaStore:", e);
  }

  return item;
}

/**
 * Load all stored local media items
 */
export async function loadAllLocalMedia(): Promise<LocalMediaItem[]> {
  try {
    const db = await getIDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_MEDIA, "readonly");
      const store = tx.objectStore(STORE_MEDIA);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  } catch (e) {
    return [];
  }
}
