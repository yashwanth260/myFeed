// Source: Google Maps Platform Code Assist
// Internal Usage Tracking ID: gmp_git_agentskills_v1

let loadPromise: Promise<any | null> | null = null;

export const FEEDO_LUXURY_DARK_MAP_STYLE: any[] = [
  { elementType: 'geometry', stylers: [{ color: '#0f0f11' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0f0f11' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#888888' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#f5d76e' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#555555' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#131e15' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#3d6645' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#1f1f23' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#141416' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#d4af37' }, { weight: 1.5 }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#805e0a' }],
  },
  {
    featureType: 'road.arterial',
    elementType: 'geometry',
    stylers: [{ color: '#2a2a30' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#1a1a20' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#081424' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#264264' }],
  },
];

/**
 * Loads Google Maps JavaScript API asynchronously with singleton protection.
 */
export function loadGoogleMapsScript(apiKey?: string): Promise<any | null> {
  if (typeof window === 'undefined') {
    return Promise.resolve(null);
  }

  if (window.google?.maps) {
    return Promise.resolve(window.google.maps);
  }

  if (loadPromise) {
    return loadPromise;
  }

  const key = apiKey || import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyCFDvl-MIIlfJlkDFuBPXfQLwTz9RWZRy0';

  loadPromise = new Promise((resolve) => {
    const existing = document.querySelector('script[data-gmaps-loader="true"]') as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve(window.google?.maps || null));
      existing.addEventListener('error', () => resolve(null));
      return;
    }

    const script = document.createElement('script');
    script.setAttribute('data-gmaps-loader', 'true');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&v=weekly&libraries=places,geometry,marker&loading=async`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      resolve(window.google?.maps || null);
    };

    script.onerror = () => {
      console.warn('Google Maps script failed to load. Falling back to SVG luxury canvas map.');
      resolve(null);
    };

    document.head.appendChild(script);
  });

  return loadPromise;
}
