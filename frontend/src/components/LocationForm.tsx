import { FormEvent, useRef, useState } from "react";
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

interface Props {
  onSubmit: (
    origin: string,
    destination: string,
    departureTime?: string
  ) => void;
  loading: boolean;
}

export default function LocationForm({ onSubmit, loading }: Props) {
  const originRef = useRef<HTMLInputElement>(null);
  const destinationRef = useRef<HTMLInputElement>(null);
  const originQueryRef = useRef<string>("");
  const destinationQueryRef = useRef<string>("");
  const [departureTime, setDepartureTime] = useState(getLocalDateTimeString());

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // Delay by a tick so Google's place_changed callback fires before we read the refs
    setTimeout(() => {
      const originText = originRef.current?.value.trim() || "";
      const destText = destinationRef.current?.value.trim() || "";
      if (!originText || !destText) return;
      onSubmit(
        originQueryRef.current || originText,
        destinationQueryRef.current || destText,
        departureTime || undefined
      );
    }, 0);
  }

  return (
    <form className="location-form" onSubmit={handleSubmit}>
      <div className="form-fields">
        <PlaceAutocomplete
          ref={originRef}
          placeholder="Starting location"
          onPlaceSelect={(q) => { originQueryRef.current = q; }}
          onManualEdit={() => { originQueryRef.current = ""; }}
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
          }}
        >
          ⇄
        </button>
        <PlaceAutocomplete
          ref={destinationRef}
          placeholder="Destination"
          onPlaceSelect={(q) => { destinationQueryRef.current = q; }}
          onManualEdit={() => { destinationQueryRef.current = ""; }}
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
    </form>
  );
}
