import React, { useState, useEffect, useRef } from 'react';
import { FiMapPin, FiSearch, FiNavigation, FiX, FiLoader, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

const GOOGLE_MAPS_API_KEY = 'AIzaSyDOBNaTunlFvTAVY2f9t9RFurRsqL_6pwM';

const LocationPicker = ({ onLocationSelect, currentAddress }) => {
  const [isOpen,      setIsOpen]      = useState(false);
  const [search,      setSearch]      = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [locating,    setLocating]    = useState(false);
  const [selected,    setSelected]    = useState(currentAddress || '');
  const [mapReady,    setMapReady]    = useState(false);
  const [searching,   setSearching]   = useState(false);
  const [geoError,    setGeoError]    = useState('');
  const mapRef       = useRef(null);
  const mapInstance  = useRef(null);
  const markerRef    = useRef(null);
  const scriptLoaded = useRef(false);
  const searchTimer  = useRef(null);

  useEffect(() => {
    if (scriptLoaded.current) return;
    scriptLoaded.current = true;
    if (window.google?.maps) { setMapReady(true); return; }
    window.__mapsReady = () => setMapReady(true);
    const script   = document.createElement('script');
    script.src     = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=__mapsReady`;
    script.async   = true;
    script.defer   = true;
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!isOpen || !mapReady || !mapRef.current || mapInstance.current) return;
    const nairobi = { lat: -1.2921, lng: 36.8219 };
    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      center: nairobi, zoom: 13,
      streetViewControl: false, mapTypeControl: false, fullscreenControl: false,
    });
    markerRef.current = new window.google.maps.Marker({
      map: mapInstance.current, draggable: true, position: nairobi,
    });
    mapInstance.current.addListener('click', (e) => {
      markerRef.current.setPosition(e.latLng);
      reverseGeocode(e.latLng.lat(), e.latLng.lng());
    });
    markerRef.current.addListener('dragend', (e) => {
      reverseGeocode(e.latLng.lat(), e.latLng.lng());
    });
  }, [isOpen, mapReady]);

  useEffect(() => {
    if (!isOpen) { mapInstance.current = null; markerRef.current = null; }
  }, [isOpen]);

  const reverseGeocode = async (lat, lng) => {
    try {
      const res  = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      if (data.display_name) {
        setSelected(data.display_name);
        setSearch(data.display_name);
        setSuggestions([]);
      }
    } catch {}
  };

  const handleSearch = (value) => {
    setSearch(value);
    setSuggestions([]);
    if (!value.trim()) return;
    clearTimeout(searchTimer.current);
    setSearching(true);
    searchTimer.current = setTimeout(async () => {
      try {
        const res  = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(value)}&countrycodes=ke&format=json&limit=5`,
          { headers: { 'Accept-Language': 'en' } }
        );
        const data = await res.json();
        setSuggestions(data || []);
      } catch {
        setSuggestions([]);
      } finally {
        setSearching(false);
      }
    }, 500);
  };

  const handleSelectSuggestion = (item) => {
    const lat  = parseFloat(item.lat);
    const lng  = parseFloat(item.lon);
    if (mapInstance.current && markerRef.current) {
      mapInstance.current.setCenter({ lat, lng });
      mapInstance.current.setZoom(16);
      markerRef.current.setPosition({ lat, lng });
    }
    setSelected(item.display_name);
    setSearch(item.display_name);
    setSuggestions([]);
  };

  const handleMyLocation = () => {
    setGeoError('');

    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setGeoError('Your browser does not support location services.');
      return;
    }

    // Check if we're on HTTPS (required for geolocation)
    if (window.location.protocol !== 'https:' &&
        window.location.hostname !== 'localhost') {
      setGeoError('Location requires HTTPS. Please use the search box instead.');
      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        if (mapInstance.current && markerRef.current) {
          mapInstance.current.setCenter({ lat, lng });
          mapInstance.current.setZoom(16);
          markerRef.current.setPosition({ lat, lng });
        }
        reverseGeocode(lat, lng);
        setLocating(false);
        setGeoError('');
      },
      (error) => {
        setLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setGeoError(
              'Location permission denied. Please allow location access in your browser settings, or use the search box.'
            );
            break;
          case error.POSITION_UNAVAILABLE:
            setGeoError('Location unavailable. Please use the search box.');
            break;
          case error.TIMEOUT:
            setGeoError('Location request timed out. Please try again.');
            break;
          default:
            setGeoError('Could not get location. Please use the search box.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout:            10000,
        maximumAge:         0,
      }
    );
  };

  const handleConfirm = () => {
    if (!selected) { toast.error('Please select a location'); return; }
    onLocationSelect(selected);
    setIsOpen(false);
    toast.success('Location set!');
  };

  // Popular Nairobi locations for quick selection
  const quickLocations = [
    { name: 'CBD Nairobi',      lat: -1.2864, lng: 36.8172 },
    { name: 'Westlands',        lat: -1.2676, lng: 36.8038 },
    { name: 'Kilimani',         lat: -1.2921, lng: 36.7873 },
    { name: 'Kasarani',         lat: -1.2204, lng: 36.8985 },
    { name: 'Embakasi',         lat: -1.3214, lng: 36.9045 },
    { name: 'Ngong Road',       lat: -1.3031, lng: 36.7742 },
    { name: 'Karen',            lat: -1.3191, lng: 36.7076 },
    { name: 'South B/C',        lat: -1.3103, lng: 36.8339 },
  ];

  const handleQuickLocation = (loc) => {
    if (mapInstance.current && markerRef.current) {
      mapInstance.current.setCenter({ lat: loc.lat, lng: loc.lng });
      mapInstance.current.setZoom(15);
      markerRef.current.setPosition({ lat: loc.lat, lng: loc.lng });
    }
    reverseGeocode(loc.lat, loc.lng);
  };

  return (
    <>
      {/* Trigger */}
      <button type="button" onClick={() => setIsOpen(true)}
        className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl
                   border-2 border-gray-200 dark:border-gray-700 bg-white
                   dark:bg-gray-800 hover:border-primary transition text-left group">
        <FiMapPin size={20}
          className={`flex-shrink-0 transition
            ${selected ? 'text-primary' : 'text-gray-400 group-hover:text-primary'}`} />
        <div className="flex-1 min-w-0">
          {selected ? (
            <>
              <p className="text-xs text-primary font-semibold mb-0.5">
                Delivery location set
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
                {selected}
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Click to set delivery location
              </p>
              <p className="text-xs text-gray-400">Search or pin on map</p>
            </>
          )}
        </div>
        {selected && (
          <span className="text-xs text-primary font-medium flex-shrink-0">
            Change
          </span>
        )}
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center
                        justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg
                          overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">

            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b
                            border-gray-100 dark:border-gray-800 sticky top-0
                            bg-white dark:bg-gray-900 z-10">
              <h3 className="font-heading font-bold text-lg dark:text-white">
                Set Delivery Location
              </h3>
              <button onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100
                           dark:hover:bg-gray-800 transition">
                <FiX size={20} className="dark:text-white" />
              </button>
            </div>

            <div className="p-4 space-y-4">

              {/* Search */}
              <div>
                <div className="relative">
                  {searching
                    ? <FiLoader className="absolute left-3 top-1/2 -translate-y-1/2
                                           text-primary animate-spin" size={18} />
                    : <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2
                                           text-gray-400" size={18} />
                  }
                  <input type="text" value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search location e.g. Westlands, Nairobi..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2
                               border-gray-200 dark:border-gray-700 bg-gray-50
                               dark:bg-gray-800 dark:text-white text-sm
                               focus:outline-none focus:border-primary transition" />
                </div>

                {/* Suggestions */}
                {suggestions.length > 0 && (
                  <div className="mt-2 bg-white dark:bg-gray-800 rounded-xl border
                                  border-gray-200 dark:border-gray-700 overflow-hidden
                                  shadow-lg max-h-48 overflow-y-auto">
                    {suggestions.map((s, i) => (
                      <button key={i} type="button"
                        onClick={() => handleSelectSuggestion(s)}
                        className="w-full flex items-start gap-3 px-4 py-3
                                   text-left hover:bg-pink-50 dark:hover:bg-gray-700
                                   transition border-b border-gray-50
                                   dark:border-gray-700 last:border-0">
                        <FiMapPin size={14}
                          className="text-primary mt-0.5 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium dark:text-white truncate">
                            {s.display_name.split(',')[0]}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {s.display_name}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* My location button */}
              <button type="button" onClick={handleMyLocation} disabled={locating}
                className="flex items-center gap-2 text-sm text-primary font-medium
                           hover:underline disabled:opacity-60">
                <FiNavigation size={15}
                  className={locating ? 'animate-spin' : ''} />
                {locating ? 'Getting your location...' : 'Use my current location'}
              </button>

              {/* Geo error */}
              {geoError && (
                <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20
                                border border-red-200 dark:border-red-800 rounded-xl
                                p-3">
                  <FiAlertCircle size={16}
                    className="text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-red-600 dark:text-red-400">{geoError}</p>
                </div>
              )}

              {/* Quick locations */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase
                              tracking-wide mb-2">
                  Popular Nairobi Areas
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {quickLocations.map((loc) => (
                    <button key={loc.name} type="button"
                      onClick={() => handleQuickLocation(loc)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg
                                 border border-gray-200 dark:border-gray-700
                                 text-left hover:border-primary hover:bg-pink-50
                                 dark:hover:bg-pink-900/20 transition">
                      <FiMapPin size={12} className="text-primary flex-shrink-0" />
                      <span className="text-xs font-medium dark:text-white">
                        {loc.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Map */}
              <div className="relative rounded-xl overflow-hidden border border-gray-200
                              dark:border-gray-700">
                <div ref={mapRef} className="w-full h-52" />
                {!mapReady && (
                  <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800
                                  flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-8 h-8 border-4 border-primary
                                      border-t-transparent rounded-full animate-spin
                                      mx-auto mb-2" />
                      <p className="text-xs text-gray-500">Loading map...</p>
                    </div>
                  </div>
                )}
                <p className="absolute bottom-2 left-2 right-2 text-center text-xs
                              bg-white/80 dark:bg-gray-900/80 px-2 py-1 rounded-lg
                              text-gray-500">
                  Click on map or drag the pin to set location
                </p>
              </div>

              {/* Selected location */}
              {selected && (
                <div className="flex items-start gap-2 bg-pink-50
                                dark:bg-pink-900/20 border border-pink-200
                                dark:border-pink-800 rounded-xl p-3">
                  <FiMapPin size={16}
                    className="text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-primary mb-0.5">
                      Selected Location
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {selected}
                    </p>
                  </div>
                </div>
              )}

              {/* Confirm */}
              <button type="button" onClick={handleConfirm} disabled={!selected}
                className="w-full py-3 bg-primary text-white font-bold rounded-xl
                           hover:bg-primary-dark transition disabled:opacity-50
                           disabled:cursor-not-allowed">
                Confirm Location
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LocationPicker;
