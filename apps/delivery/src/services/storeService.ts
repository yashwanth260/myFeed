import { FeedoStoreItem } from '../types';
import { mockFeedoStoreItems } from '../data/mockProfile';

const STORAGE_KEY_PRODUCTS = 'feedo_partner_store_products_v2';
const DB_NAME = 'FeedoPartnerStoreDB';
const DB_VERSION = 1;
const STORE_NAME = 'products';

export const STORE_CATEGORIES = [
  'Official Gear',
  'Apparel',
  'Weather Protection',
  'Accessories',
  'Safety Gear',
  'Vehicle Care',
] as const;

export const STORE_PICKUP_HUBS = [
  'Indiranagar Partner Hub',
  'Koramangala Hub',
  'HSR Layout Hub',
  'Whitefield Hub',
  'Jayanagar Hub',
  'Electronic City Hub',
] as const;

export const INITIAL_STORE_PRODUCTS: FeedoStoreItem[] = mockFeedoStoreItems.map((item) => ({
  ...item,
  images: item.imageUrl ? [item.imageUrl] : [],
  pickupHub: 'Indiranagar Partner Hub',
  isVisible: true,
  createdAt: '2026-10-01T00:00:00.000Z',
  updatedAt: '2026-10-01T00:00:00.000Z',
}));

type StoreListener = (products: FeedoStoreItem[]) => void;

class StoreService {
  private listeners: Set<StoreListener> = new Set();
  private dbPromise: Promise<IDBDatabase> | null = null;
  private memoryCache: FeedoStoreItem[] | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initDB();
    }
  }

  private initDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        reject(new Error('IndexedDB is not supported in this browser.'));
        return;
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result as IDBDatabase;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };

      request.onsuccess = (event: any) => {
        resolve(event.target.result as IDBDatabase);
      };

      request.onerror = (event: any) => {
        console.error('Failed to open FeedoStoreDB IndexedDB', event.target.error);
        reject(event.target.error);
      };
    });

    return this.dbPromise;
  }

  /**
   * Synchronous fallback getter for instant page hydration
   */
  public getProductsSync(): FeedoStoreItem[] {
    if (this.memoryCache) return this.memoryCache;

    try {
      const stored = localStorage.getItem(STORAGE_KEY_PRODUCTS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.memoryCache = parsed;
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse cached store products from localStorage', e);
    }

    this.memoryCache = [...INITIAL_STORE_PRODUCTS];
    return this.memoryCache;
  }

  /**
   * Asynchronously retrieves all products from IndexedDB or LocalStorage
   */
  public async getProducts(): Promise<FeedoStoreItem[]> {
    try {
      const db = await this.initDB();
      const products = await new Promise<FeedoStoreItem[]>((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const req = store.getAll();

        req.onsuccess = () => {
          resolve((req.result as FeedoStoreItem[]) || []);
        };
        req.onerror = () => {
          reject(req.error);
        };
      });

      if (products && products.length > 0) {
        this.memoryCache = products;
        this.saveToLocalStorage(products);
        return products;
      }
    } catch (err) {
      console.warn('IndexedDB read failed, falling back to localStorage', err);
    }

    // Fallback to localStorage / initial products
    const cached = this.getProductsSync();
    // Seed to IndexedDB in background
    this.seedInitialProducts(cached).catch(() => {});
    return cached;
  }

  /**
   * Seed initial products into IndexedDB
   */
  private async seedInitialProducts(products: FeedoStoreItem[]): Promise<void> {
    try {
      const db = await this.initDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      for (const p of products) {
        store.put(p);
      }
    } catch {
      // Ignored
    }
  }

  private saveToLocalStorage(products: FeedoStoreItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
    } catch (e) {
      console.warn('Could not cache store products to localStorage', e);
    }
  }

  /**
   * Saves or updates a product in IndexedDB and LocalStorage vault.
   */
  public async saveProduct(product: FeedoStoreItem): Promise<FeedoStoreItem> {
    const allProducts = await this.getProducts();
    const existingIndex = allProducts.findIndex((p) => p.id === product.id);

    const now = new Date().toISOString();
    const updatedProduct: FeedoStoreItem = {
      ...product,
      pickupHub: product.pickupHub || 'Indiranagar Partner Hub',
      isVisible: product.isVisible !== false,
      images: product.images && product.images.length > 0 ? product.images : (product.imageUrl ? [product.imageUrl] : []),
      imageUrl: product.images && product.images.length > 0 ? product.images[0] : product.imageUrl,
      updatedAt: now,
      createdAt: product.createdAt || (existingIndex >= 0 ? allProducts[existingIndex].createdAt : now),
    };

    let updatedList: FeedoStoreItem[];
    if (existingIndex >= 0) {
      updatedList = [...allProducts];
      updatedList[existingIndex] = updatedProduct;
    } else {
      updatedList = [updatedProduct, ...allProducts];
    }

    this.memoryCache = updatedList;
    this.saveToLocalStorage(updatedList);

    try {
      const db = await this.initDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(updatedProduct);
    } catch (e) {
      console.warn('IndexedDB write failed during product save', e);
    }

    this.notifyListeners(updatedList);
    return updatedProduct;
  }

  /**
   * Deletes a product by ID.
   */
  public async deleteProduct(id: string): Promise<boolean> {
    const allProducts = await this.getProducts();
    const filtered = allProducts.filter((p) => p.id !== id);

    this.memoryCache = filtered;
    this.saveToLocalStorage(filtered);

    try {
      const db = await this.initDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(id);
    } catch (e) {
      console.warn('IndexedDB delete failed', e);
    }

    this.notifyListeners(filtered);
    return true;
  }

  /**
   * Direct Device Photo Upload:
   * Validates format (JPG, JPEG, PNG, WebP) and file size (< 10MB).
   * Generates compressed/optimized base64 Data URL for persistent offline display.
   */
  public async uploadProductPhoto(
    file: File,
    onProgress?: (percent: number) => void
  ): Promise<{ url: string; referenceId: string; name: string; size: number }> {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      throw new Error(`Unsupported format "${file.type}". Supported formats: JPG, JPEG, PNG, WebP.`);
    }

    const maxSizeBytes = 10 * 1024 * 1024; // 10 MB limit
    if (file.size > maxSizeBytes) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      throw new Error(`File size (${sizeMb} MB) exceeds maximum allowed limit of 10 MB.`);
    }

    onProgress?.(15);

    // Read file via FileReader
    const base64Raw = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read device photo file.'));
      reader.readAsDataURL(file);
    });

    onProgress?.(45);

    // Optimize/compress image via canvas so storage and rendering remain blazing fast
    const optimizedUrl = await this.optimizeImage(base64Raw, 1200, 1200, 0.88);

    onProgress?.(85);

    // Artificial short wait to show progress completion
    await new Promise((r) => setTimeout(r, 200));

    onProgress?.(100);

    const referenceId = `IMG-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    return {
      url: optimizedUrl,
      referenceId,
      name: file.name,
      size: file.size,
    };
  }

  /**
   * Compresses and resizes image on client canvas for fast display and compact storage
   */
  private optimizeImage(
    src: string,
    maxWidth: number,
    maxHeight: number,
    quality: number
  ): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(src);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Use image/webp if supported, or fallback to image/jpeg
        const mimeType = src.startsWith('data:image/png') ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(mimeType, quality);
        resolve(dataUrl);
      };
      img.onerror = () => resolve(src);
      img.src = src;
    });
  }

  /**
   * Reset store products to initial default items
   */
  public async resetToDefaults(): Promise<FeedoStoreItem[]> {
    this.memoryCache = [...INITIAL_STORE_PRODUCTS];
    this.saveToLocalStorage(this.memoryCache);

    try {
      const db = await this.initDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).clear();
      for (const p of this.memoryCache) {
        tx.objectStore(STORE_NAME).put(p);
      }
    } catch {
      // Ignored
    }

    this.notifyListeners(this.memoryCache);
    return this.memoryCache;
  }

  /**
   * Subscribes to product changes across components
   */
  public subscribe(listener: StoreListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(products: FeedoStoreItem[]): void {
    this.listeners.forEach((listener) => {
      try {
        listener(products);
      } catch (err) {
        console.error('Error notifying store subscriber', err);
      }
    });
  }
}

export const storeService = new StoreService();

