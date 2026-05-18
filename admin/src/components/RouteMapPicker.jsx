import { useEffect, useRef, useState } from 'react';
import { importLibrary, setOptions } from '@googlemaps/js-api-loader';

import LocationSearchInput from './LocationSearchInput';
import { reverseGeocodeLocation } from '../services/geocoding';

const DEFAULT_CENTER = { lat: 14.6096, lng: 120.9904 };

let googleMapsLoadPromise = null;
let configuredApiKey = null;

function loadGoogleMaps(apiKey) {
  if (configuredApiKey !== apiKey) {
    configuredApiKey = apiKey;
    googleMapsLoadPromise = null;
  }

  if (!googleMapsLoadPromise) {
    setOptions({
      key: apiKey,
      v: 'weekly',
      libraries: ['geometry'],
    });

    googleMapsLoadPromise = Promise.all([importLibrary('maps'), importLibrary('geometry')]);
  }

  return googleMapsLoadPromise;
}

function parseCoordinate(value, fallback) {
  const number = Number(value);

  return Number.isFinite(number) ? number : fallback;
}

function decodePolyline(encodedPath) {
  if (!window.google?.maps?.geometry?.encoding || !encodedPath) {
    return [];
  }

  return window.google.maps.geometry.encoding
    .decodePath(encodedPath)
    .map((point) => ({ lat: point.lat(), lng: point.lng() }));
}

export default function RouteMapPicker({
  value,
  onChange,
  readOnly = false,
  layout = 'stacked',
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const startMarkerRef = useRef(null);
  const endMarkerRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const directionsServiceRef = useRef(null);
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  const activePinModeRef = useRef('start');
  const updateRouteFromMarkersRef = useRef(null);
  const readOnlyRef = useRef(readOnly);

  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState('');
  const [activePinMode, setActivePinMode] = useState('start');
  const [routingMessage, setRoutingMessage] = useState('');

  valueRef.current = value;
  onChangeRef.current = onChange;
  activePinModeRef.current = activePinMode;
  readOnlyRef.current = readOnly;

  const mapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_WEB_API_KEY;

  useEffect(() => {
    const apiKey = mapsApiKey;

    if (!apiKey) {
      setMapError('Add VITE_GOOGLE_MAPS_WEB_API_KEY to the repo root .env file.');
      return undefined;
    }

    setMapError('');

    let cancelled = false;

    async function updateRouteFromMarkers(partialUpdate, options = {}) {
      const currentValue = valueRef.current;
      const nextValue = {
        ...currentValue,
        ...partialUpdate,
      };

      const origin = {
        lat: parseCoordinate(nextValue.startLat, DEFAULT_CENTER.lat),
        lng: parseCoordinate(nextValue.startLng, DEFAULT_CENTER.lng),
      };
      const destination = {
        lat: parseCoordinate(nextValue.endLat, DEFAULT_CENTER.lat + 0.01),
        lng: parseCoordinate(nextValue.endLng, DEFAULT_CENTER.lng + 0.01),
      };

      if (!options.skipReverseGeocode) {
        const reverseTargets = [];

        if (partialUpdate.startLat !== undefined || partialUpdate.startLng !== undefined) {
          reverseTargets.push(['startLocationName', origin.lat, origin.lng]);
        }

        if (partialUpdate.endLat !== undefined || partialUpdate.endLng !== undefined) {
          reverseTargets.push(['endLocationName', destination.lat, destination.lng]);
        }

        await Promise.all(
          reverseTargets.map(async ([fieldName, lat, lng]) => {
            try {
              const result = await reverseGeocodeLocation(lat, lng);

              if (result.address) {
                nextValue[fieldName] = result.address;
              }
            } catch {
              // Keep coordinates even if reverse geocoding fails.
            }
          })
        );
      }

      if (!directionsServiceRef.current) {
        onChangeRef.current?.({
          ...nextValue,
          path: nextValue.path || [],
        });
        return;
      }

      setRoutingMessage('Calculating route...');

      directionsServiceRef.current.route(
        {
          origin,
          destination,
          travelMode: window.google.maps.TravelMode.WALKING,
        },
        (result, status) => {
          if (status !== 'OK' || !result?.routes?.[0]) {
            setRoutingMessage('Could not calculate a walking route. Adjust the pins and try again.');
            onChangeRef.current?.({
              ...nextValue,
              path: [],
            });
            return;
          }

          directionsRendererRef.current?.setDirections(result);

          const leg = result.routes[0].legs[0];
          const path = decodePolyline(result.routes[0].overview_polyline?.points);

          setRoutingMessage(
            path.length
              ? `Route ready · ${(leg.distance.value / 1000).toFixed(2)} km · ${Math.round(
                  leg.duration.value / 60
                )} min walk`
              : 'Route markers updated.'
          );

          onChangeRef.current?.({
            ...nextValue,
            startLocationName: nextValue.startLocationName || leg.start_address,
            endLocationName: nextValue.endLocationName || leg.end_address,
            distanceKm: (leg.distance.value / 1000).toFixed(2),
            estimatedTimeMinutes: String(Math.max(Math.round(leg.duration.value / 60), 1)),
            path,
          });

          const bounds = new window.google.maps.LatLngBounds();
          bounds.extend(origin);
          bounds.extend(destination);
          mapRef.current?.fitBounds(bounds, 72);
        }
      );
    }

    updateRouteFromMarkersRef.current = updateRouteFromMarkers;

    async function initializeMap() {
      try {
        await loadGoogleMaps(apiKey);

        if (cancelled || !mapContainerRef.current) {
          return;
        }

        const startLat = parseCoordinate(valueRef.current.startLat, DEFAULT_CENTER.lat);
        const startLng = parseCoordinate(valueRef.current.startLng, DEFAULT_CENTER.lng);
        const endLat = parseCoordinate(valueRef.current.endLat, DEFAULT_CENTER.lat + 0.01);
        const endLng = parseCoordinate(valueRef.current.endLng, DEFAULT_CENTER.lng + 0.01);
        const isReadOnly = readOnlyRef.current;

        const map = new window.google.maps.Map(mapContainerRef.current, {
          center: { lat: startLat, lng: startLng },
          zoom: 14,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          gestureHandling: isReadOnly ? 'none' : 'auto',
          draggable: !isReadOnly,
          zoomControl: !isReadOnly,
        });

        const directionsService = new window.google.maps.DirectionsService();
        const directionsRenderer = new window.google.maps.DirectionsRenderer({
          map,
          suppressMarkers: true,
          polylineOptions: {
            strokeColor: '#22C55E',
            strokeWeight: 5,
          },
        });

        const startMarker = new window.google.maps.Marker({
          map,
          position: { lat: startLat, lng: startLng },
          draggable: !isReadOnly,
          label: 'A',
          title: 'Starting location',
        });

        const endMarker = new window.google.maps.Marker({
          map,
          position: { lat: endLat, lng: endLng },
          draggable: !isReadOnly,
          label: 'B',
          title: 'End location',
        });

        mapRef.current = map;
        directionsServiceRef.current = directionsService;
        directionsRendererRef.current = directionsRenderer;
        startMarkerRef.current = startMarker;
        endMarkerRef.current = endMarker;

        if (!isReadOnly) {
          startMarker.addListener('dragend', () => {
            const position = startMarker.getPosition();
            updateRouteFromMarkers({
              startLat: position.lat(),
              startLng: position.lng(),
            });
          });

          endMarker.addListener('dragend', () => {
            const position = endMarker.getPosition();
            updateRouteFromMarkers({
              endLat: position.lat(),
              endLng: position.lng(),
            });
          });

          map.addListener('click', (event) => {
            if (activePinModeRef.current === 'start') {
              startMarker.setPosition(event.latLng);
              updateRouteFromMarkers({
                startLat: event.latLng.lat(),
                startLng: event.latLng.lng(),
              });
              return;
            }

            endMarker.setPosition(event.latLng);
            updateRouteFromMarkers({
              endLat: event.latLng.lat(),
              endLng: event.latLng.lng(),
            });
          });
        }

        setMapReady(true);
        updateRouteFromMarkers({}, { skipReverseGeocode: true });
      } catch (error) {
        if (!cancelled) {
          setMapError(error.message || 'Unable to load Google Maps.');
        }
      }
    }

    initializeMap();

    return () => {
      cancelled = true;
      updateRouteFromMarkersRef.current = null;
    };
  }, [readOnly, mapsApiKey]);

  useEffect(() => {
    if (!mapReady || !startMarkerRef.current || !endMarkerRef.current) {
      return;
    }

    const startLat = parseCoordinate(value.startLat, DEFAULT_CENTER.lat);
    const startLng = parseCoordinate(value.startLng, DEFAULT_CENTER.lng);
    const endLat = parseCoordinate(value.endLat, DEFAULT_CENTER.lat + 0.01);
    const endLng = parseCoordinate(value.endLng, DEFAULT_CENTER.lng + 0.01);

    startMarkerRef.current.setPosition({ lat: startLat, lng: startLng });
    endMarkerRef.current.setPosition({ lat: endLat, lng: endLng });
  }, [mapReady, value.endLat, value.endLng, value.startLat, value.startLng]);

  function handleLocationSelect(type, suggestion) {
    const marker = type === 'start' ? startMarkerRef.current : endMarkerRef.current;

    marker?.setPosition({ lat: suggestion.lat, lng: suggestion.lng });

    updateRouteFromMarkersRef.current?.(
      {
        ...(type === 'start'
          ? {
              startLat: suggestion.lat,
              startLng: suggestion.lng,
              startLocationName: suggestion.description,
            }
          : {
              endLat: suggestion.lat,
              endLng: suggestion.lng,
              endLocationName: suggestion.description,
            }),
      },
      { skipReverseGeocode: true }
    );
  }

  const searchFields = (
    <div
      className={layout === 'overlay' ? 'route-map-search-overlay' : 'route-map-search-grid'}
    >
      <LocationSearchInput
        disabled={readOnly}
        label="Starting Location"
        onFocus={() => setActivePinMode('start')}
        onSelect={(suggestion) => handleLocationSelect('start', suggestion)}
        placeholder="Search where the route begins"
        value={value.startLocationName}
      />
      <LocationSearchInput
        disabled={readOnly}
        label="End Location"
        onFocus={() => setActivePinMode('end')}
        onSelect={(suggestion) => handleLocationSelect('end', suggestion)}
        placeholder="Search where the route ends"
        value={value.endLocationName}
      />
    </div>
  );

  return (
    <div className={`route-map-picker${layout === 'overlay' ? ' route-map-picker-overlay' : ''}`}>
      {!readOnly && layout !== 'overlay' ? (
        <div className="route-map-toolbar">
          <button
            className={`filter-pill${activePinMode === 'start' ? ' active' : ''}`}
            onClick={() => setActivePinMode('start')}
            type="button"
          >
            Pin Start
          </button>
          <button
            className={`filter-pill${activePinMode === 'end' ? ' active' : ''}`}
            onClick={() => setActivePinMode('end')}
            type="button"
          >
            Pin End
          </button>
          <span className="muted route-map-hint">
            Search above the map or click to place the active pin, then drag markers to fine-tune.
          </span>
        </div>
      ) : null}

      {layout === 'overlay' && !readOnly ? (
        <p className="muted route-map-nav-hint">
          Type in Starting Location or End Location for suggestions. Press Enter to drop a pin. When
          both are set, the walking route appears on the map.
        </p>
      ) : null}

      {mapError ? <p className="error">{mapError}</p> : null}

      {!mapError && layout === 'overlay' ? (
        <div className="route-map-stage">
          {searchFields}
          <div className="route-map-canvas" ref={mapContainerRef} />
        </div>
      ) : null}

      {!mapError && layout !== 'overlay' ? (
        <>
          {searchFields}
          <div className="route-map-canvas" ref={mapContainerRef} />
        </>
      ) : null}

      {mapError && layout === 'overlay' ? (
        <div className="route-map-stage route-map-stage-error">{searchFields}</div>
      ) : null}

      {routingMessage ? <p className="muted route-map-status">{routingMessage}</p> : null}
    </div>
  );
}
