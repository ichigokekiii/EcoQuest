import { useEffect, useId, useRef, useState } from 'react';

import { searchLocations } from '../services/geocoding';

const SEARCH_DELAY_MS = 300;

export default function LocationSearchInput({
  disabled = false,
  label,
  onFocus,
  onSelect,
  placeholder,
  value = '',
}) {
  const listboxId = useId();
  const blurTimeoutRef = useRef(null);
  const requestIdRef = useRef(0);

  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const trimmedQuery = inputValue.trim();

    if (disabled || trimmedQuery.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      setSearchError('');
      return undefined;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    const timeoutId = window.setTimeout(async () => {
      setIsSearching(true);
      setSearchError('');

      try {
        const result = await searchLocations(trimmedQuery);

        if (requestIdRef.current !== requestId) {
          return;
        }

        setSuggestions(result.suggestions || []);
        setIsOpen((result.suggestions || []).length > 0);
      } catch (error) {
        if (requestIdRef.current !== requestId) {
          return;
        }

        setSuggestions([]);
        setIsOpen(false);
        setSearchError(error.response?.data?.message || 'Unable to load location suggestions.');
      } finally {
        if (requestIdRef.current === requestId) {
          setIsSearching(false);
        }
      }
    }, SEARCH_DELAY_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [disabled, inputValue]);

  function handleSelect(suggestion) {
    setInputValue(suggestion.description);
    setSuggestions([]);
    setIsOpen(false);
    setSearchError('');
    onSelect?.(suggestion);
  }

  async function handleEnter(event) {
    if (event.key !== 'Enter') {
      return;
    }

    event.preventDefault();

    const trimmedQuery = inputValue.trim();

    if (!trimmedQuery) {
      return;
    }

    if (suggestions.length > 0) {
      handleSelect(suggestions[0]);
      return;
    }

    setIsSearching(true);
    setSearchError('');

    try {
      const result = await searchLocations(trimmedQuery);
      const firstSuggestion = result.suggestions?.[0];

      if (!firstSuggestion) {
        setSearchError('Could not find that location. Try a different search.');
        return;
      }

      handleSelect(firstSuggestion);
    } catch (error) {
      setSearchError(error.response?.data?.message || 'Unable to find that location.');
    } finally {
      setIsSearching(false);
    }
  }

  function handleBlur() {
    blurTimeoutRef.current = window.setTimeout(() => {
      setIsOpen(false);
    }, 150);
  }

  function handleFocus(event) {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
    }

    onFocus?.(event);

    if (suggestions.length > 0) {
      setIsOpen(true);
    }
  }

  return (
    <label className="field route-map-search-field location-search-field">
      <span className="route-map-search-label">{label}</span>
      <div className="location-search-control">
        <input
          aria-autocomplete="list"
          aria-controls={isOpen ? listboxId : undefined}
          aria-expanded={isOpen}
          autoComplete="off"
          disabled={disabled}
          onBlur={handleBlur}
          onChange={(event) => setInputValue(event.target.value)}
          onFocus={handleFocus}
          onKeyDown={handleEnter}
          placeholder={placeholder}
          role="combobox"
          value={inputValue}
        />

        {isOpen ? (
          <ul className="location-search-suggestions" id={listboxId} role="listbox">
            {suggestions.map((suggestion) => (
              <li key={`${suggestion.placeId}-${suggestion.lat}-${suggestion.lng}`} role="option">
                <button
                  className="location-search-option"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => handleSelect(suggestion)}
                  type="button"
                >
                  {suggestion.description}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {isSearching ? <span className="location-search-status muted">Searching...</span> : null}
      {searchError ? <span className="location-search-status error">{searchError}</span> : null}
    </label>
  );
}
