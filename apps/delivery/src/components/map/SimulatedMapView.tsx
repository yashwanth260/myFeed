// Source: Google Maps Platform Code Assist
// Internal Usage Tracking ID: gmp_git_agentskills_v1

import React, { useState, useEffect, useRef } from 'react';
import {
  Navigation,
  MapPin,
  Store,
  User,
  Compass,
  Layers,
  ExternalLink,
  RefreshCw,
  Globe,
  Sparkles,
} from 'lucide-react';
import { StoreInfo, CustomerInfo, GPSState } from '../../types';
import {
  loadGoogleMapsScript,
  FEEDO_LUXURY_DARK_MAP_STYLE,
} from '../../services/googleMapsService';

interface SimulatedMapViewProps {
  store: StoreInfo;
  customer?: CustomerInfo;
  currentStep: 'GOING_TO_PICKUP' | 'PICKUP_VERIFICATION' | 'GOING_TO_CUSTOMER' | 'DELIVERY_OTP' | string;
  gpsState?: GPSState;
  onArrivedClick?: () => void;
  heightClass?: string;
}

export const SimulatedMapView: React.FC<SimulatedMapViewProps> = ({
  store,
  customer,
  currentStep,
  gpsState = 'NORMAL',
  heightClass = 'h-72 sm:h-96',
}) => {
  const [mapMode, setMapMode] = useState<'google' | 'svg'>('google');
  const [isGoogleMapsReady, setIsGoogleMapsReady] = useState(false);
  const [mapStyleType, setMapStyleType] = useState<'dark' | 'satellite'>('dark');
  const [isCentered, setIsCentered] = useState(true);
  const [isRefreshingGps, setIsRefreshingGps] = useState(false);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);

  // Rider coordinates (initialized to Bengaluru center or store proximity)
  const [riderCoords, setRiderCoords] = useState<{ lat: number; lng: number }>({
    lat: store.lat ? store.lat - 0.006 : 12.9750,
    lng: store.lng ? store.lng - 0.005 : 77.6350,
  });

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const googleMapRef = useRef<any | null>(null);
  const markersRef = useRef<any[]>([]);
  const polylineRef = useRef<any[]>([]);

  // Delivery security & privacy: only reveal customer after pickup verification
  const isHeadingToCustomer =
    currentStep === 'GOING_TO_CUSTOMER' ||
    currentStep === 'ARRIVED_AT_CUSTOMER' ||
    currentStep === 'DELIVERY_OTP';

  const destinationName = isHeadingToCustomer ? customer?.name || 'Customer Location' : store.name;
  const destinationAddress = isHeadingToCustomer ? customer?.address || 'Customer Delivery Address' : store.address;

  const currentNavInstruction = isHeadingToCustomer
    ? 'In 150m, turn right onto 12th Main Rd toward Customer Gate'
    : 'In 300m, take second exit at roundabout onto 100 Feet Rd';

  // Live Continuous Device GPS Geolocation
  useEffect(() => {
    if (!('geolocation' in navigator)) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setRiderCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        if (pos.coords.accuracy) {
          setGpsAccuracy(Math.round(pos.coords.accuracy));
        }
      },
      (err) => {
        // Geolocation denied or unavailable; graceful fallback to default delivery fleet coordinates
        console.warn('Live GPS watch notice:', err.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  // Load Google Maps API script
  useEffect(() => {
    let isMounted = true;
    loadGoogleMapsScript()
      .then((maps) => {
        if (isMounted && maps) {
          setIsGoogleMapsReady(true);
        }
      })
      .catch(() => {
        if (isMounted) {
          setMapMode('svg');
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Initialize and update Google Map instance
  useEffect(() => {
    const google = typeof window !== 'undefined' ? window.google : null;
    if (!isGoogleMapsReady || !mapContainerRef.current || !google?.maps) {
      return;
    }

    const storeLatLng = { lat: store.lat || 12.9784, lng: store.lng || 77.6408 };
    const customerLatLng = isHeadingToCustomer && customer
      ? { lat: customer.lat || 12.9716, lng: customer.lng || 77.6475 }
      : null;

    // Create Map if not created yet
    if (!googleMapRef.current) {
      googleMapRef.current = new google.maps.Map(mapContainerRef.current, {
        center: storeLatLng,
        zoom: 15,
        mapTypeId: mapStyleType === 'satellite' ? google.maps.MapTypeId.HYBRID : google.maps.MapTypeId.ROADMAP,
        styles: mapStyleType === 'dark' ? FEEDO_LUXURY_DARK_MAP_STYLE : undefined,
        disableDefaultUI: true,
        zoomControl: false,
        fullscreenControl: false,
        streetViewControl: false,
        mapTypeControl: false,
        backgroundColor: '#0c0c0e',
      });
    } else {
      googleMapRef.current.setMapTypeId(
        mapStyleType === 'satellite' ? google.maps.MapTypeId.HYBRID : google.maps.MapTypeId.ROADMAP
      );
      googleMapRef.current.setOptions({
        styles: mapStyleType === 'dark' ? FEEDO_LUXURY_DARK_MAP_STYLE : undefined,
      });
      google.maps.event.trigger(googleMapRef.current, 'resize');
    }

    const map = googleMapRef.current;

    // Clear previous markers & polylines
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    polylineRef.current.forEach((p) => p.setMap(null));
    polylineRef.current = [];

    const bounds = new google.maps.LatLngBounds();
    bounds.extend(riderCoords);
    bounds.extend(storeLatLng);
    if (customerLatLng) {
      bounds.extend(customerLatLng);
    }

    // 1. Rider Live Location Marker (Gold Directional Arrow)
    const riderMarker = new google.maps.Marker({
      position: riderCoords,
      map,
      title: 'Your Live Location (Feedo Partner)',
      icon: {
        path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
        scale: 6,
        fillColor: '#F5D76E',
        fillOpacity: 1,
        strokeColor: '#000000',
        strokeWeight: 2,
        rotation: isHeadingToCustomer ? 60 : 35,
      },
      zIndex: 10,
    });
    markersRef.current.push(riderMarker);

    // 2. Store / Restaurant Marker (Pickup Pin)
    const storeMarker = new google.maps.Marker({
      position: storeLatLng,
      map,
      title: `${store.name} (Pickup Restaurant)`,
      icon: {
        path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
        scale: 1.6,
        fillColor: '#E65100',
        fillOpacity: 1,
        strokeColor: '#FFFFFF',
        strokeWeight: 1.5,
        anchor: new google.maps.Point(12, 22),
      },
      zIndex: 8,
    });
    markersRef.current.push(storeMarker);

    // 3. Customer Destination Marker (Revealed only after pickup verification)
    if (customerLatLng && customer) {
      const customerMarker = new google.maps.Marker({
        position: customerLatLng,
        map,
        title: `${customer.name} (Delivery Destination)`,
        icon: {
          path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
          scale: 1.6,
          fillColor: '#10B981',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 1.5,
          anchor: new google.maps.Point(12, 22),
        },
        zIndex: 9,
      });
      markersRef.current.push(customerMarker);
    }

    // 4. Gold Trajectory Polyline
    const pathCoordinates = customerLatLng
      ? [riderCoords, storeLatLng, customerLatLng]
      : [riderCoords, storeLatLng];

    const routePolyline = new google.maps.Polyline({
      path: pathCoordinates,
      geodesic: true,
      strokeColor: '#D4AF37',
      strokeOpacity: 0.9,
      strokeWeight: 4,
      map,
    });
    polylineRef.current.push(routePolyline);

    // Camera auto-fit
    map.fitBounds(bounds, { top: 70, right: 30, bottom: 40, left: 30 });
  }, [isGoogleMapsReady, mapMode, mapStyleType, store, customer, isHeadingToCustomer, riderCoords]);

  const handleOpenGoogleMaps = () => {
    const query = encodeURIComponent(`${destinationName}, ${destinationAddress}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const handleRecenter = () => {
    setIsCentered(true);
    const google = typeof window !== 'undefined' ? window.google : null;
    if (googleMapRef.current && google?.maps) {
      const bounds = new google.maps.LatLngBounds();
      bounds.extend(riderCoords);
      bounds.extend({ lat: store.lat || 12.9784, lng: store.lng || 77.6408 });
      if (isHeadingToCustomer && customer) {
        bounds.extend({ lat: customer.lat || 12.9716, lng: customer.lng || 77.6475 });
      }
      googleMapRef.current.fitBounds(bounds, { top: 70, right: 30, bottom: 40, left: 30 });
    }
  };

  const handleRefreshGps = () => {
    setIsRefreshingGps(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setRiderCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          if (pos.coords.accuracy) {
            setGpsAccuracy(Math.round(pos.coords.accuracy));
          }
          setIsRefreshingGps(false);
          handleRecenter();
        },
        () => {
          setIsRefreshingGps(false);
        },
        { timeout: 4000 }
      );
    } else {
      setTimeout(() => setIsRefreshingGps(false), 500);
    }
  };

  return (
    <div
      className={`relative w-full ${heightClass} rounded-3xl overflow-hidden border border-[#252525] bg-[#080808] shadow-2xl font-sans`}
    >
      {/* Real Google Map Viewport */}
      <div
        ref={mapContainerRef}
        className="w-full h-full"
        style={{
          display: mapMode === 'google' && isGoogleMapsReady ? 'block' : 'none',
          minHeight: '100%',
        }}
      />

      {/* Luxury Dark SVG Canvas Map (Fallback & Toggle View) */}
      {(mapMode === 'svg' || !isGoogleMapsReady) && (
        <svg
          className="w-full h-full object-cover select-none"
          viewBox="0 0 800 450"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="mapBgGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#080808" />
              <stop offset="100%" stopColor="#141414" />
            </linearGradient>

            <linearGradient id="goldRouteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F5D76E" />
              <stop offset="100%" stopColor="#D4AF37" />
            </linearGradient>

            <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <rect width="800" height="450" fill="url(#mapBgGold)" />

          <path d="M 50 40 Q 180 20 220 120 T 100 240 Z" fill="#141414" opacity="0.6" />
          <path d="M 550 180 Q 700 120 760 300 T 600 400 Z" fill="#141414" opacity="0.5" />
          <path d="M 320 10 Q 420 30 400 90 T 280 80 Z" fill="#1a1a1a" opacity="0.4" />

          <path
            d="M 0 350 Q 200 310 400 360 T 800 300"
            fill="none"
            stroke="#0D1B2A"
            strokeWidth="28"
            opacity="0.8"
          />

          <path
            d="M 120 380 Q 250 200 420 180 T 680 90"
            fill="none"
            stroke="#D4AF37"
            strokeWidth="5"
            strokeLinecap="round"
            filter="url(#goldGlow)"
          />
          <path
            d="M 120 380 Q 250 200 420 180 T 680 90"
            fill="none"
            stroke="url(#goldRouteGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Store Pin (SVG) */}
          <g transform="translate(420, 180)">
            <circle r="22" fill="#E65100" opacity="0.2" className="animate-ping" />
            <circle r="14" fill="#E65100" stroke="#FFFFFF" strokeWidth="2" />
            <foreignObject x="-9" y="-9" width="18" height="18">
              <Store size={18} className="text-white" />
            </foreignObject>
          </g>

          {/* Customer Pin (SVG) - only shown when heading to customer */}
          {isHeadingToCustomer && customer && (
            <g transform="translate(680, 90)">
              <circle r="20" fill="#10B981" opacity="0.2" className="animate-ping" />
              <circle r="13" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
              <foreignObject x="-8" y="-8" width="16" height="16">
                <User size={16} className="text-white" />
              </foreignObject>
            </g>
          )}

          {/* Rider Live Location (SVG) */}
          <g transform="translate(120, 380)">
            <circle r="26" fill="#D4AF37" opacity="0.25" className="animate-ping" />
            <circle r="15" fill="#D4AF37" stroke="#080808" strokeWidth="2" />
            <foreignObject x="-8" y="-8" width="16" height="16">
              <Navigation size={16} className="text-[#080808] transform rotate-45" />
            </foreignObject>
          </g>
        </svg>
      )}

      {/* Top Floating Turn-by-Turn Navigation Bar in Black & Gold */}
      <div className="absolute top-3 left-3 right-3 bg-[#151515]/95 backdrop-blur-md border border-[#D4AF37]/40 rounded-2xl p-3 flex items-center justify-between shadow-2xl z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#F5D76E] text-[#080808] flex items-center justify-center font-bold shadow-md shadow-[#D4AF37]/20">
            <Navigation size={18} className="transform rotate-45" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>{currentNavInstruction}</span>
            </div>
            <div className="text-[11px] text-[#A1A1A1] truncate max-w-[180px] sm:max-w-sm">
              Target: <span className="text-[#F5D76E] font-bold">{destinationName}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Map View Switcher: Google Map vs SVG Canvas */}
          {isGoogleMapsReady && (
            <button
              onClick={() => setMapMode(mapMode === 'google' ? 'svg' : 'google')}
              className="py-1 px-2 rounded-xl bg-[#1C1C1C] hover:bg-[#252525] border border-[#D4AF37]/40 text-[#F5D76E] text-[10px] font-bold flex items-center gap-1 shadow-md transition-all cursor-pointer"
              title="Toggle Google Maps / SVG View"
            >
              {mapMode === 'google' ? (
                <>
                  <Globe size={11} className="text-emerald-400" />
                  <span className="hidden xs:inline">Google Map</span>
                </>
              ) : (
                <>
                  <Sparkles size={11} className="text-amber-400" />
                  <span className="hidden xs:inline">Luxury Canvas</span>
                </>
              )}
            </button>
          )}

          {/* External Google Maps Button */}
          <button
            onClick={handleOpenGoogleMaps}
            className="py-1.5 px-2.5 rounded-xl bg-[#1C1C1C] hover:bg-[#252525] border border-[#D4AF37]/40 text-[#F5D76E] text-[10px] font-bold flex items-center gap-1 shadow-md transition-all cursor-pointer"
            title="Open in Google Maps App"
          >
            <ExternalLink size={12} />
            <span className="hidden xs:inline">Navigate</span>
          </button>

          <div className="text-right pl-2 border-l border-[#252525]">
            <div className="text-xs font-black text-[#F5D76E]">2.4 km</div>
            <div className="text-[10px] text-[#A1A1A1]">ETA 8 min</div>
          </div>
        </div>
      </div>

      {/* Geofence Status Badge if active */}
      {gpsState === 'ARRIVED' && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-[#D4AF37] to-[#F5D76E] text-[#080808] font-black text-xs px-3.5 py-1.5 rounded-full shadow-2xl border border-white flex items-center gap-1.5 animate-bounce z-10">
          <MapPin size={14} />
          <span>GEOFENCE MATCHED — ARRIVED AT LOCATION</span>
        </div>
      )}

      {/* Map Control Buttons (Bottom Right) */}
      <div className="absolute bottom-3 right-3 flex flex-col gap-2 z-10">
        <button
          onClick={handleRecenter}
          className={`p-2.5 rounded-xl border backdrop-blur-md shadow-lg transition-colors cursor-pointer ${
            isCentered
              ? 'bg-[#D4AF37] text-[#080808] border-[#F5D76E] font-bold'
              : 'bg-[#151515]/90 text-[#A1A1A1] border-[#252525] hover:text-white'
          }`}
          title="Recenter Map"
        >
          <Compass size={18} />
        </button>
        <button
          onClick={() => setMapStyleType(mapStyleType === 'dark' ? 'satellite' : 'dark')}
          className="p-2.5 rounded-xl bg-[#151515]/90 text-[#A1A1A1] border border-[#252525] hover:text-white backdrop-blur-md shadow-lg cursor-pointer"
          title="Toggle Dark / Satellite Layers"
        >
          <Layers size={18} />
        </button>
      </div>

      {/* GPS Accuracy & Permission Pill (Bottom Left) */}
      <div className="absolute bottom-3 left-3 bg-[#151515]/95 backdrop-blur-md border border-[#252525] rounded-xl px-3 py-1.5 text-[10px] font-semibold text-[#A1A1A1] flex items-center gap-2 z-10 shadow-lg">
        <span className="w-2 h-2 rounded-full bg-[#35B879] animate-pulse" />
        <span>Live GPS {gpsAccuracy ? `(±${gpsAccuracy}m)` : '(±3m)'}</span>
        <button
          onClick={handleRefreshGps}
          className="text-[#F5D76E] hover:text-white flex items-center gap-0.5 ml-1 font-bold cursor-pointer"
          title="Refresh GPS Coordinates"
        >
          <RefreshCw size={10} className={isRefreshingGps ? 'animate-spin' : ''} />
          <span>Sync</span>
        </button>
      </div>
    </div>
  );
};
