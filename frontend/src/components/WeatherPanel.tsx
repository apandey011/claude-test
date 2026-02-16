import { Waypoint, WeatherAdvisory } from "../types";
import WeatherAdvisories from "./WeatherAdvisories";

interface Props {
  waypoints: Waypoint[];
  useFahrenheit: boolean;
  onSelectWaypoint: (idx: number) => void;
  onClose: () => void;
  advisories?: WeatherAdvisory[];
}

function toF(c: number): number {
  return Math.round(c * 9 / 5 + 32);
}

function toMph(kmh: number): number {
  return Math.round(kmh * 0.621371);
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

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `+${h}:${String(m).padStart(2, "0")}`;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function WeatherPanel({ waypoints, useFahrenheit, onSelectWaypoint, onClose, advisories }: Props) {
  return (
    <div className="weather-panel">
      <div className="panel-header">
        <h3 className="panel-title">Weather Along Route</h3>
        <button className="panel-close" onClick={onClose} aria-label="Close">&times;</button>
      </div>
      {advisories && advisories.length > 0 && (
        <WeatherAdvisories advisories={advisories} />
      )}
      <div className="panel-list">
        {waypoints.map((wp, idx) => {
          const { weather } = wp;
          const temp = useFahrenheit
            ? toF(weather.temperature_c)
            : Math.round(weather.temperature_c);
          const unit = useFahrenheit ? "\u00B0F" : "\u00B0C";
          const wind = useFahrenheit
            ? `${toMph(weather.wind_speed_kmh)} mph`
            : `${Math.round(weather.wind_speed_kmh)} km/h`;

          const isFirst = idx === 0;
          const isLast = idx === waypoints.length - 1;

          return (
            <div
              key={idx}
              className={`panel-row ${isFirst || isLast ? "panel-row-endpoint" : ""}`}
              onClick={() => onSelectWaypoint(idx)}
            >
              <span className="panel-emoji">
                {weatherEmoji(weather.weather_code)}
              </span>
              <div className="panel-info">
                <span className="panel-time">
                  {isFirst
                    ? "Start"
                    : isLast
                      ? "Arrive"
                      : formatDuration(wp.minutes_from_start)}
                </span>
                <span className="panel-clock">{formatTime(wp.estimated_time)}</span>
              </div>
              <span className="panel-temp">
                {temp}{unit}
              </span>
              <span className="panel-wind">{wind}</span>
              <span className="panel-precip">
                {weather.precipitation_probability}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
