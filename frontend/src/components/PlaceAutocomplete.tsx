import { useEffect, useImperativeHandle, useRef, useState, forwardRef } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";

interface Props {
  placeholder: string;
  onPlaceSelect?: (query: string) => void;
  onManualEdit?: () => void;
  onCurrentLocation?: (lat: number, lng: number) => void;
  required?: boolean;
}

const PlaceAutocomplete = forwardRef<HTMLInputElement, Props>(
  ({ placeholder, onPlaceSelect, onManualEdit, onCurrentLocation, required }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const places = useMapsLibrary("places");
    const [showDropdown, setShowDropdown] = useState(false);
    const [geoLoading, setGeoLoading] = useState(false);

    useImperativeHandle(ref, () => inputRef.current!);

    useEffect(() => {
      if (!places || !inputRef.current) return;

      autocompleteRef.current = new places.Autocomplete(inputRef.current, {
        fields: ["formatted_address", "place_id"],
      });

      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current?.getPlace();
        if (place?.formatted_address && onPlaceSelect) {
          const query = place.place_id
            ? `place_id:${place.place_id}`
            : place.formatted_address;
          onPlaceSelect(query);
        }
        setShowDropdown(false);
      });
    }, [places]);

    // Close dropdown when clicking outside
    useEffect(() => {
      function handleClickOutside(e: MouseEvent) {
        if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
          setShowDropdown(false);
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    function handleFocus() {
      if (onCurrentLocation && !inputRef.current?.value) {
        setShowDropdown(true);
      }
    }

    function handleInput() {
      onManualEdit?.();
      // Hide dropdown once user starts typing (Google autocomplete takes over)
      if (inputRef.current?.value) {
        setShowDropdown(false);
      } else if (onCurrentLocation) {
        setShowDropdown(true);
      }
    }

    function handleUseLocation() {
      if (!navigator.geolocation || !onCurrentLocation) return;
      setGeoLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          onCurrentLocation(latitude, longitude);
          setShowDropdown(false);

          // Reverse geocode to show address instead of "Current Location"
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode(
            { location: { lat: latitude, lng: longitude } },
            (results, status) => {
              if (inputRef.current) {
                inputRef.current.value =
                  status === "OK" && results?.[0]?.formatted_address
                    ? results[0].formatted_address
                    : `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
              }
              setGeoLoading(false);
            },
          );
        },
        () => {
          setGeoLoading(false);
          setShowDropdown(false);
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
      );
    }

    return (
      <div className="place-autocomplete-wrapper" ref={wrapperRef}>
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          onFocus={handleFocus}
          onInput={handleInput}
          required={required}
        />
        {showDropdown && onCurrentLocation && (
          <div className="current-location-dropdown">
            <button
              type="button"
              className="current-location-option"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleUseLocation}
              disabled={geoLoading}
            >
              <span className="current-location-icon">{geoLoading ? "..." : "\u{1F4CD}"}</span>
              <span className="current-location-text">
                {geoLoading ? "Getting location..." : "Use current location"}
              </span>
            </button>
          </div>
        )}
      </div>
    );
  },
);

export default PlaceAutocomplete;
