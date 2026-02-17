import { FormEvent, forwardRef, useImperativeHandle, useRef, useState } from "react";
import PlaceAutocomplete from "./PlaceAutocomplete";

function getLocalDateTimeString(date: Date = new Date()): string {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

function getStartOfTodayString(): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return getLocalDateTimeString(today);
}

function getMaxDateTimeString(): string {
  const max = new Date();
  max.setDate(max.getDate() + 10);
  return getLocalDateTimeString(max);
}

export interface LocationFormHandle {
  fillAndSubmit: (
    origin: string,
    destination: string,
    originDisplay: string,
    destinationDisplay: string,
    departureTime?: string
  ) => void;
}

interface Props {
  onSubmit: (
    origin: string,
    destination: string,
    departureTime?: string,
    originDisplay?: string,
    destinationDisplay?: string
  ) => void;
  loading: boolean;
}

export default forwardRef<LocationFormHandle, Props>(
  function LocationForm({ onSubmit, loading }, ref) {
  const originRef = useRef<HTMLInputElement>(null);
  const destinationRef = useRef<HTMLInputElement>(null);
  const originQueryRef = useRef<string>("");
  const destinationQueryRef = useRef<string>("");
  const [departureTime, setDepartureTime] = useState(getLocalDateTimeString());
  const [validationError, setValidationError] = useState<string | null>(null);

  useImperativeHandle(ref, () => ({
    fillAndSubmit(origin, destination, originDisplay, destinationDisplay, dept) {
      if (originRef.current) originRef.current.value = originDisplay;
      if (destinationRef.current) destinationRef.current.value = destinationDisplay;
      originQueryRef.current = origin;
      destinationQueryRef.current = destination;
      if (dept) setDepartureTime(dept);
      onSubmit(origin, destination, dept, originDisplay, destinationDisplay);
    },
  }));

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setTimeout(() => {
      const originText = originRef.current?.value.trim() || "";
      const destText = destinationRef.current?.value.trim() || "";
      if (!originText || !destText) {
        setValidationError("Please enter both origin and destination.");
        return;
      }
      if (originText === destText) {
        setValidationError("Origin and destination must be different.");
        return;
      }
      setValidationError(null);
      onSubmit(
        originQueryRef.current || originText,
        destinationQueryRef.current || destText,
        departureTime || undefined,
        originText,
        destText
      );
    }, 0);
  }

  return (
    <form className="location-form" onSubmit={handleSubmit}>
      <div className="form-fields">
        <PlaceAutocomplete
          ref={originRef}
          placeholder="Starting location"
          onPlaceSelect={(q) => { originQueryRef.current = q; setValidationError(null); }}
          onManualEdit={() => { originQueryRef.current = ""; setValidationError(null); }}
          onCurrentLocation={(lat, lng) => { originQueryRef.current = `${lat},${lng}`; setValidationError(null); }}
          required
        />
        <button
          type="button"
          className="swap-button"
          title="Swap origin and destination"
          onClick={() => {
            const tmpVal = originRef.current?.value ?? "";
            if (originRef.current) originRef.current.value = destinationRef.current?.value ?? "";
            if (destinationRef.current) destinationRef.current.value = tmpVal;
            const tmpQuery = originQueryRef.current;
            originQueryRef.current = destinationQueryRef.current;
            destinationQueryRef.current = tmpQuery;
            setValidationError(null);
          }}
        >
          ⇄
        </button>
        <PlaceAutocomplete
          ref={destinationRef}
          placeholder="Destination"
          onPlaceSelect={(q) => { destinationQueryRef.current = q; setValidationError(null); }}
          onManualEdit={() => { destinationQueryRef.current = ""; setValidationError(null); }}
          onCurrentLocation={(lat, lng) => { destinationQueryRef.current = `${lat},${lng}`; setValidationError(null); }}
          required
        />
        <input
          type="datetime-local"
          value={departureTime}
          min={getStartOfTodayString()}
          max={getMaxDateTimeString()}
          onChange={(e) => setDepartureTime(e.target.value)}
          title="Departure time (optional, defaults to now)"
        />
      </div>
      <button type="submit" disabled={loading}>
        {loading ? "Loading..." : "Get Route Weather"}
      </button>
      {validationError && (
        <div className="validation-error">{validationError}</div>
      )}
    </form>
  );
});
