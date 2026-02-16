import { useEffect, useImperativeHandle, useRef, forwardRef } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";

interface Props {
  placeholder: string;
  onPlaceSelect?: (query: string) => void;
  onManualEdit?: () => void;
  required?: boolean;
}

const PlaceAutocomplete = forwardRef<HTMLInputElement, Props>(
  ({ placeholder, onPlaceSelect, onManualEdit, required }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
    const places = useMapsLibrary("places");

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
      });
    }, [places]);

    return (
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        onInput={onManualEdit}
        required={required}
      />
    );
  },
);

export default PlaceAutocomplete;
