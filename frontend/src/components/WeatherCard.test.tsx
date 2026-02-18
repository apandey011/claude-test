import { render, screen } from "@testing-library/react";
import WeatherCard from "./WeatherCard";
import { makeWaypoint } from "../test/fixtures";

describe("WeatherCard", () => {
  it("shows temperature in Celsius when useFahrenheit is false", () => {
    const wp = makeWaypoint({ weather: { temperature_c: 20, apparent_temperature_c: 18, precipitation_mm: 0, precipitation_probability: 10, weather_code: 0, weather_description: "Clear sky", wind_speed_kmh: 10, humidity_percent: 50 } });
    render(<WeatherCard waypoint={wp} useFahrenheit={false} />);
    expect(screen.getByText("20°C")).toBeInTheDocument();
  });

  it("shows temperature in Fahrenheit when useFahrenheit is true", () => {
    const wp = makeWaypoint({ weather: { temperature_c: 20, apparent_temperature_c: 18, precipitation_mm: 0, precipitation_probability: 10, weather_code: 0, weather_description: "Clear sky", wind_speed_kmh: 10, humidity_percent: 50 } });
    render(<WeatherCard waypoint={wp} useFahrenheit={true} />);
    // toF(20) = 68
    expect(screen.getByText("68°F")).toBeInTheDocument();
  });

  it("shows feels-like temperature", () => {
    const wp = makeWaypoint({ weather: { temperature_c: 20, apparent_temperature_c: 15, precipitation_mm: 0, precipitation_probability: 10, weather_code: 0, weather_description: "Clear sky", wind_speed_kmh: 10, humidity_percent: 50 } });
    render(<WeatherCard waypoint={wp} useFahrenheit={false} />);
    expect(screen.getByText("Feels like 15°C")).toBeInTheDocument();
  });

  it("shows wind in mph when useFahrenheit is true", () => {
    const wp = makeWaypoint({ weather: { temperature_c: 20, apparent_temperature_c: 18, precipitation_mm: 0, precipitation_probability: 10, weather_code: 0, weather_description: "Clear sky", wind_speed_kmh: 16.09, humidity_percent: 50 } });
    render(<WeatherCard waypoint={wp} useFahrenheit={true} />);
    // toMph(16.09) = 10
    expect(screen.getByText("Wind: 10 mph")).toBeInTheDocument();
  });

  it("shows wind in km/h when useFahrenheit is false", () => {
    const wp = makeWaypoint({ weather: { temperature_c: 20, apparent_temperature_c: 18, precipitation_mm: 0, precipitation_probability: 10, weather_code: 0, weather_description: "Clear sky", wind_speed_kmh: 12.5, humidity_percent: 50 } });
    render(<WeatherCard waypoint={wp} useFahrenheit={false} />);
    expect(screen.getByText("Wind: 13 km/h")).toBeInTheDocument();
  });

  it("shows correct emoji for clear sky (code 0)", () => {
    const wp = makeWaypoint({ weather: { temperature_c: 20, apparent_temperature_c: 18, precipitation_mm: 0, precipitation_probability: 10, weather_code: 0, weather_description: "Clear sky", wind_speed_kmh: 10, humidity_percent: 50 } });
    const { container } = render(<WeatherCard waypoint={wp} useFahrenheit={false} />);
    const emojiSpan = container.querySelector(".weather-emoji");
    expect(emojiSpan?.textContent).toBe("\u2600\uFE0F");
  });

  it("shows precipitation probability", () => {
    const wp = makeWaypoint({ weather: { temperature_c: 20, apparent_temperature_c: 18, precipitation_mm: 0, precipitation_probability: 45, weather_code: 0, weather_description: "Clear sky", wind_speed_kmh: 10, humidity_percent: 50 } });
    render(<WeatherCard waypoint={wp} useFahrenheit={false} />);
    expect(screen.getByText("Precip: 45%")).toBeInTheDocument();
  });

  it("shows humidity percentage", () => {
    const wp = makeWaypoint({ weather: { temperature_c: 20, apparent_temperature_c: 18, precipitation_mm: 0, precipitation_probability: 10, weather_code: 0, weather_description: "Clear sky", wind_speed_kmh: 10, humidity_percent: 72 } });
    render(<WeatherCard waypoint={wp} useFahrenheit={false} />);
    expect(screen.getByText("Humidity: 72%")).toBeInTheDocument();
  });

  it("shows weather description", () => {
    const wp = makeWaypoint({ weather: { temperature_c: 20, apparent_temperature_c: 18, precipitation_mm: 0, precipitation_probability: 10, weather_code: 3, weather_description: "Overcast", wind_speed_kmh: 10, humidity_percent: 50 } });
    render(<WeatherCard waypoint={wp} useFahrenheit={false} />);
    expect(screen.getByText("Overcast")).toBeInTheDocument();
  });

  it("shows minutes from start in time display", () => {
    const wp = makeWaypoint({ minutes_from_start: 30 });
    render(<WeatherCard waypoint={wp} useFahrenheit={false} />);
    const timeSpan = screen.getByText(/^\+30 min/);
    expect(timeSpan).toBeInTheDocument();
  });

  it("handles negative temperature correctly", () => {
    const wp = makeWaypoint({ weather: { temperature_c: -5, apparent_temperature_c: -10, precipitation_mm: 2, precipitation_probability: 80, weather_code: 71, weather_description: "Snow", wind_speed_kmh: 20, humidity_percent: 90 } });
    render(<WeatherCard waypoint={wp} useFahrenheit={false} />);
    expect(screen.getByText("-5°C")).toBeInTheDocument();
    expect(screen.getByText("Feels like -10°C")).toBeInTheDocument();
  });
});
