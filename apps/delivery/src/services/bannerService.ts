export interface BannerItemData {
  id: string;
  badge: string;
  title: string;
  description: string;
  ctaText: string;
  actionDestination: 'care' | 'help' | 'store' | 'orders' | 'profile';
  accentColor: string;
  tagColor: string;
  illustrationBg: string;
  iconName: 'ShieldCheck' | 'Wrench' | 'Package' | 'HeartPulse' | 'Users';
  imageUrl?: string;
  imageReferenceId?: string;
  isVisible: boolean;
  updatedAt?: string;
}

export const INITIAL_FIVE_BANNERS: BannerItemData[] = [
  {
    id: 'banner-1',
    badge: 'Partner Safety',
    title: '24/7 On-Road Assistance Active',
    description: 'Ride with peace of mind. Emergency SOS and instant support are just a tap away.',
    iconName: 'ShieldCheck',
    ctaText: 'Safety Guide',
    actionDestination: 'care',
    accentColor: '#D97706',
    tagColor: 'bg-amber-50 text-amber-900 border-amber-300',
    illustrationBg: 'from-amber-50/90 via-amber-100/30 to-white',
    isVisible: true,
  },
  {
    id: 'banner-2',
    badge: 'Vehicle Care',
    title: 'Vehicle & EV Partner Support',
    description: 'Access partner service centers for bike tune-ups, tire checks, and quick battery swaps.',
    iconName: 'Wrench',
    ctaText: 'Find Service Hub',
    actionDestination: 'orders',
    accentColor: '#0284C7',
    tagColor: 'bg-sky-50 text-sky-900 border-sky-300',
    illustrationBg: 'from-sky-50/90 via-sky-100/30 to-white',
    isVisible: true,
  },
  {
    id: 'banner-3',
    badge: 'Official Gear',
    title: 'Feedo Weatherproof Delivery Gear',
    description: 'Keep food fresh and protected with official insulated delivery bags and rainwear.',
    iconName: 'Package',
    ctaText: 'Check Partner Gear',
    actionDestination: 'store',
    accentColor: '#CA8A04',
    tagColor: 'bg-amber-50 text-amber-900 border-amber-300',
    illustrationBg: 'from-yellow-50/90 via-amber-100/30 to-white',
    isVisible: true,
  },
  {
    id: 'banner-4',
    badge: 'Healthcare & Wellness',
    title: 'Partner Care & Coverage Support',
    description: 'On-duty accident protection and complimentary telehealth consultations for active riders.',
    iconName: 'HeartPulse',
    ctaText: 'View Care Policy',
    actionDestination: 'profile',
    accentColor: '#E11D48',
    tagColor: 'bg-rose-50 text-rose-900 border-rose-300',
    illustrationBg: 'from-rose-50/90 via-rose-100/30 to-white',
    isVisible: true,
  },
  {
    id: 'banner-5',
    badge: 'Fleet Community',
    title: 'Hub Meetups & Rider Support',
    description: 'Connect with local area fleet managers and top-rated delivery partners in your cluster.',
    iconName: 'Users',
    ctaText: 'Join Fleet Network',
    actionDestination: 'help',
    accentColor: '#9333EA',
    tagColor: 'bg-purple-50 text-purple-900 border-purple-300',
    illustrationBg: 'from-purple-50/90 via-purple-100/30 to-white',
    isVisible: true,
  },
];

const STORAGE_KEY_BANNERS = 'feedo_home_banners_v1';
const DB_NAME = 'FeedoBannerDB';
const DB_VERSION = 1;
const STORE_NAME = 'banners';

type BannerListener = (banners: BannerItemData[]) => void;

class BannerService {
  private listeners: Set<BannerListener> = new Set();
  private dbPromise: Promise<IDBDatabase> | null = null;
  private memoryCache: BannerItemData[] | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initDB();
    }
  }

  private initDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        reject(new Error('IndexedDB not supported in browser.'));
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
        console.error('Failed to open FeedoBannerDB IndexedDB', event.target.error);
        reject(event.target.error);
      };
    });

    return this.dbPromise;
  }

  /**
   * Synchronous getter for instant hydration
   */
  public getBannersSync(): BannerItemData[] {
    if (this.memoryCache) return this.memoryCache;

    try {
      const stored = localStorage.getItem(STORAGE_KEY_BANNERS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.memoryCache = parsed;
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse cached banners from localStorage', e);
    }

    this.memoryCache = [...INITIAL_FIVE_BANNERS];
    return this.memoryCache;
  }

  /**
   * Asynchronous getter from IndexedDB or LocalStorage
   */
  public async getBanners(): Promise<BannerItemData[]> {
    try {
      const db = await this.initDB();
      const banners = await new Promise<BannerItemData[]>((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const req = store.getAll();

        req.onsuccess = () => {
          resolve((req.result as BannerItemData[]) || []);
        };
        req.onerror = () => {
          reject(req.error);
        };
      });

      if (banners && banners.length === 5) {
        this.memoryCache = banners;
        this.saveToLocalStorage(banners);
        return banners;
      }
    } catch (err) {
      console.warn('IndexedDB read failed for banners, falling back to localStorage', err);
    }

    const cached = this.getBannersSync();
    this.seedInitialBanners(cached).catch(() => {});
    return cached;
  }

  private async seedInitialBanners(banners: BannerItemData[]): Promise<void> {
    try {
      const db = await this.initDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      for (const b of banners) {
        store.put(b);
      }
    } catch {
      // Ignored
    }
  }

  private saveToLocalStorage(banners: BannerItemData[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_BANNERS, JSON.stringify(banners));
    } catch (e) {
      console.warn('Could not cache banners to localStorage', e);
    }
  }

  /**
   * Saves or updates a specific banner among the five existing banners.
   */
  public async saveBanner(banner: BannerItemData): Promise<BannerItemData> {
    const all = await this.getBanners();
    const updated = all.map((b) =>
      b.id === banner.id
        ? {
            ...b,
            ...banner,
            updatedAt: new Date().toISOString(),
          }
        : b
    );

    this.memoryCache = updated;
    this.saveToLocalStorage(updated);

    try {
      const db = await this.initDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      for (const b of updated) {
        store.put(b);
      }
    } catch (e) {
      console.warn('IndexedDB write failed during banner save', e);
    }

    this.notifyListeners(updated);
    return banner;
  }

  /**
   * Direct Device Banner Image Upload:
   * Validates format (JPG, JPEG, PNG, WebP) and file size (< 10MB).
   * Compresses image via canvas for persistent offline storage and instant display.
   */
  public async uploadBannerImage(
    file: File,
    onProgress?: (percent: number) => void
  ): Promise<{ url: string; referenceId: string; name: string; size: number }> {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type.toLowerCase())) {
      throw new Error(`Unsupported format "${file.type}". Supported formats: JPG, JPEG, PNG, WebP.`);
    }

    const maxSizeBytes = 10 * 1024 * 1024; // 10 MB limit
    if (file.size > maxSizeBytes) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      throw new Error(`File size (${sizeMb} MB) exceeds maximum allowed limit of 10 MB.`);
    }

    onProgress?.(20);

    const base64Raw = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read device banner image.'));
      reader.readAsDataURL(file);
    });

    onProgress?.(55);

    // Optimize image for high-definition mobile banner presentation (1600x900 landscape or aspect fit)
    const optimizedUrl = await this.optimizeImage(base64Raw, 1600, 900, 0.88);

    onProgress?.(90);

    await new Promise((r) => setTimeout(r, 200));

    onProgress?.(100);

    const referenceId = `BANNER-IMG-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    return {
      url: optimizedUrl,
      referenceId,
      name: file.name,
      size: file.size,
    };
  }

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
        const mimeType = src.startsWith('data:image/png') ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(mimeType, quality);
        resolve(dataUrl);
      };
      img.onerror = () => resolve(src);
      img.src = src;
    });
  }

  /**
   * Reset the five banners to initial default configuration
   */
  public async resetToDefaults(): Promise<BannerItemData[]> {
    this.memoryCache = [...INITIAL_FIVE_BANNERS];
    this.saveToLocalStorage(this.memoryCache);

    try {
      const db = await this.initDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).clear();
      for (const b of this.memoryCache) {
        tx.objectStore(STORE_NAME).put(b);
      }
    } catch {
      // Ignored
    }

    this.notifyListeners(this.memoryCache);
    return this.memoryCache;
  }

  public subscribe(listener: BannerListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(banners: BannerItemData[]): void {
    this.listeners.forEach((listener) => {
      try {
        listener(banners);
      } catch (err) {
        console.error('Error notifying banner listener', err);
      }
    });
  }
}

export const bannerService = new BannerService();

