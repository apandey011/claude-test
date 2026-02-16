import { useEffect } from "react";
import {
  AdvancedMarker,
  InfoWindow,
  useAdvancedMarkerRef,
  useMap,
} from "@vis.gl/react-google-maps";
import { Waypoint } from "../types";
import WeatherCard from "./WeatherCard";

interface Props {
  waypoint: Waypoint;
  useFahrenheit: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onDeselect: () => void;
  scale: number;
  dimmed?: boolean;
}

function weatherEmoji(code: number): string {
  if (code === 0) return "\u2600\uFE0F";
  if (code <= 3) return "\u26C5";
  if (code <= 48) return "\uD83C\uDF2B\uFE0F";
  if (code <= 55) return "\uD83C\uDF26\uFE0F";
  if (code <= 67) return "\uD83C\uDF27\uFE0F";
  if (code <= 77) return "\u2744\uFE0F";
  if (code <= 82) return "\uD83C\uDF26\uFE0F";
  if (code <= 86) return "\uD83C\uDF28\uFE0F";
  return "\u26A1";
}

function toF(c: number): number {
  return Math.round(c * 9 / 5 + 32);
}

export default function WeatherMarker({ waypoint, useFahrenheit, isSelected, onSelect, onDeselect, scale, dimmed }: Props) {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const map = useMap();

  const { weather, location } = waypoint;

  useEffect(() => {
    if (isSelected && map) {
      map.panTo({ lat: location.lat, lng: location.lng });
    }
  }, [isSelected, map, location.lat, location.lng]);

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={{ lat: location.lat, lng: location.lng }}
        onClick={onSelect}
      >
        <div className={`marker-content${dimmed ? " marker-content-dimmed" : ""}`} style={{ transform: `scale(${scale})` }}>
          <span>{weatherEmoji(weather.weather_code)}</span>
          <span>{useFahrenheit ? toF(weather.temperature_c) : Math.round(weather.temperature_c)}&deg;</span>
        </div>
      </AdvancedMarker>

      {isSelected && (
        <InfoWindow anchor={marker} onCloseClick={onDeselect}>
          <WeatherCard waypoint={waypoint} useFahrenheit={useFahrenheit} />
        </InfoWindow>
      )}
    </>
  );
}
