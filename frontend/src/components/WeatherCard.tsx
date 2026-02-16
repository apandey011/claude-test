import { Waypoint } from "../types";

interface Props {
  waypoint: Waypoint;
  useFahrenheit: boolean;
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

function toMph(kmh: number): number {
  return Math.round(kmh * 0.621371);
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function WeatherCard({ waypoint, useFahrenheit }: Props) {
  const { weather, minutes_from_start, estimated_time } = waypoint;

  const temp = useFahrenheit ? toF(weather.temperature_c) : Math.round(weather.temperature_c);
  const feelsLike = useFahrenheit ? toF(weather.apparent_temperature_c) : Math.round(weather.apparent_temperature_c);
  const unit = useFahrenheit ? "\u00B0F" : "\u00B0C";
  const wind = useFahrenheit
    ? `${toMph(weather.wind_speed_kmh)} mph`
    : `${Math.round(weather.wind_speed_kmh)} km/h`;

  return (
    <div className="weather-card">
      <div className="weather-card-header">
        <span className="weather-emoji">{weatherEmoji(weather.weather_code)}</span>
        <span className="weather-time">
          +{minutes_from_start} min ({formatTime(estimated_time)})
        </span>
      </div>
      <div className="weather-temp">{temp}{unit}</div>
      <div className="weather-desc">{weather.weather_description}</div>
      <div className="weather-details">
        <span>Feels like {feelsLike}{unit}</span>
        <span>Precip: {weather.precipitation_probability}%</span>
        <span>Wind: {wind}</span>
        <span>Humidity: {weather.humidity_percent}%</span>
      </div>
    </div>
  );
}
