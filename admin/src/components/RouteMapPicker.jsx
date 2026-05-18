import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

const DEFAULT_CENTER = { lat: 14.6096, lng: 120.9904 };
const MAPS_LIBRARIES = ['places', 'geometry'];

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

export default function RouteMapPicker({ value, onChange }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const startMarkerRef = useRef(null);
  const endMarkerRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const directionsServiceRef = useRef(null);
  const startAutocompleteRef = useRef(null);
  const endAutocompleteRef = useRef(null);
  const startInputRef = useRef(null);
  const endInputRef = useRef(null);
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);

  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState('');
  const [activePinMode, setActivePinMode] = useState('start');
  const [routingMessage, setRoutingMessage] = useState('');

  valueRef.current = value;
  onChangeRef.current = onChange;

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_WEB_API_KEY;

    if (!apiKey) {
      setMapError('Add VITE_GOOGLE_MAPS_WEB_API_KEY to the repo root .env file.');
      return undefined;
    }

    let cancelled = false;
    const loader = new Loader({
      apiKey,
      version: 'weekly',
      libraries: MAPS_LIBRARIES,
    });

    async function initializeMap() {
      try {
        await loader.load();

        if (cancelled || !mapContainerRef.current) {
          return;
        }

        const startLat = parseCoordinate(valueRef.current.startLat, DEFAULT_CENTER.lat);
        const startLng = parseCoordinate(valueRef.current.startLng, DEFAULT_CENTER.lng);
        const endLat = parseCoordinate(valueRef.current.endLat, DEFAULT_CENTER.lat + 0.01);
        const endLng = parseCoordinate(valueRef.current.endLng, DEFAULT_CENTER.lng + 0.01);

        const map = new window.google.maps.Map(mapContainerRef.current, {
          center: { lat: startLat, lng: startLng },
          zoom: 14,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
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
          draggable: true,
          label: 'A',
          title: 'Start location',
        });

        const endMarker = new window.google.maps.Marker({
          map,
          position: { lat: endLat, lng: endLng },
          draggable: true,
          label: 'B',
          title: 'Destination',
        });

        mapRef.current = map;
        directionsServiceRef.current = directionsService;
        directionsRendererRef.current = directionsRenderer;
        startMarkerRef.current = startMarker;
        endMarkerRef.current = endMarker;

        if (startInputRef.current) {
          startAutocompleteRef.current = new window.google.maps.places.Autocomplete(
            startInputRef.current,
            { fields: ['geometry', 'name', 'formatted_address'] }
          );
          startAutocompleteRef.current.addListener('place_changed', () => {
            const place = startAutocompleteRef.current.getPlace();
            if (!place.geometry?.location) {
              return;
            }

            startMarker.setPosition(place.geometry.location);
            updateRouteFromMarkers({
              startLat: place.geometry.location.lat(),
              startLng: place.geometry.location.lng(),
              startLocationName:
                place.name || place.formatted_address || valueRef.current.startLocationName,
            });
          });
        }

        if (endInputRef.current) {
          endAutocompleteRef.current = new window.google.maps.places.Autocomplete(
            endInputRef.current,
            { fields: ['geometry', 'name', 'formatted_address'] }
          );
          endAutocompleteRef.current.addListener('place_changed', () => {
            const place = endAutocompleteRef.current.getPlace();
            if (!place.geometry?.location) {
              return;
            }

            endMarker.setPosition(place.geometry.location);
            updateRouteFromMarkers({
              endLat: place.geometry.location.lat(),
              endLng: place.geometry.location.lng(),
              endLocationName:
                place.name || place.formatted_address || valueRef.current.endLocationName,
            });
          });
        }

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
          if (activePinMode === 'start') {
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

        setMapReady(true);
        updateRouteFromMarkers({}, { skipReverseGeocode: true });
      } catch (error) {
        if (!cancelled) {
          setMapError(error.message || 'Unable to load Google Maps.');
        }
      }
    }

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

      if (!options.skipReverseGeocode && window.google?.maps?.Geocoder) {
        const geocoder = new window.google.maps.Geocoder();
        const reverseTargets = [];

        if (partialUpdate.startLat !== undefined || partialUpdate.startLng !== undefined) {
          reverseTargets.push(['startLocationName', origin]);
        }

        if (partialUpdate.endLat !== undefined || partialUpdate.endLng !== undefined) {
          reverseTargets.push(['endLocationName', destination]);
        }

        await Promise.all(
          reverseTargets.map(
            ([fieldName, location]) =>
              new Promise((resolve) => {
                geocoder.geocode({ location }, (results, status) => {
                  if (status === 'OK' && results[0]) {
                    nextValue[fieldName] = results[0].formatted_address;
                  }

                  resolve();
                });
              })
          )
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

    initializeMap();

    return () => {
      cancelled = true;
    };
  }, []);

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

    if (startInputRef.current && value.startLocationName) {
      startInputRef.current.value = value.startLocationName;
    }

    if (endInputRef.current && value.endLocationName) {
      endInputRef.current.value = value.endLocationName;
    }
  }, [mapReady, value.endLat, value.endLng, value.startLat, value.startLng, value.startLocationName, value.endLocationName]);

  return (
    <div className="route-map-picker">
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
          Pin Destination
        </button>
        <span className="muted route-map-hint">
          Search below or click the map to place the active pin, then drag markers to fine-tune.
        </span>
      </div>

      <div className="route-map-search-grid">
        <label className="field">
          <span>Start Search</span>
          <input defaultValue={value.startLocationName} placeholder="Search start location" ref={startInputRef} />
        </label>
        <label className="field">
          <span>Destination Search</span>
          <input defaultValue={value.endLocationName} placeholder="Search destination" ref={endInputRef} />
        </label>
      </div>

      {mapError ? <p className="error">{mapError}</p> : null}
      {!mapError ? <div className="route-map-canvas" ref={mapContainerRef} /> : null}
      {routingMessage ? <p className="muted route-map-status">{routingMessage}</p> : null}
    </div>
  );
}
