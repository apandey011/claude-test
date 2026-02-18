import type {
  WeatherData,
  Waypoint,
  RouteWithWeather,
  MultiRouteResponse,
  RouteRecommendation,
  WeatherAdvisory,
} from "../types";

export function makeWeatherData(overrides?: Partial<WeatherData>): WeatherData {
  return {
    temperature_c: 18.5,
    apparent_temperature_c: 16.2,
    precipitation_mm: 0.0,
    precipitation_probability: 10,
    weather_code: 1,
    weather_description: "Mainly clear",
    wind_speed_kmh: 12.5,
    humidity_percent: 55,
    ...overrides,
  };
}

export function makeWaypoint(overrides?: Partial<Waypoint>): Waypoint {
  return {
    location: { lat: 37.7749, lng: -122.4194 },
    minutes_from_start: 0,
    estimated_time: "2026-02-16T10:00:00Z",
    weather: makeWeatherData(),
    ...overrides,
  };
}

export function makeRoute(overrides?: Partial<RouteWithWeather>): RouteWithWeather {
  return {
    route_index: 0,
    overview_polyline: "a~l~Fjk~uOwHJy@P",
    summary: "via I-5 S",
    total_duration_minutes: 350,
    total_distance_km: 612.3,
    waypoints: [
      makeWaypoint({ minutes_from_start: 0, estimated_time: "2026-02-16T10:00:00Z" }),
      makeWaypoint({
        minutes_from_start: 15,
        estimated_time: "2026-02-16T10:15:00Z",
        location: { lat: 37.5, lng: -122.2 },
      }),
      makeWaypoint({
        minutes_from_start: 30,
        estimated_time: "2026-02-16T10:30:00Z",
        location: { lat: 37.2, lng: -122.0 },
      }),
    ],
    ...overrides,
  };
}

export function makeRecommendation(overrides?: Partial<RouteRecommendation>): RouteRecommendation {
  return {
    recommended_route_index: 0,
    scores: [
      {
        overall_score: 85.2,
        duration_score: 90,
        weather_score: 80,
        recommendation_reason: "Best overall weather conditions",
      },
    ],
    advisories: [[]],
    ...overrides,
  };
}

export function makeAdvisory(overrides?: Partial<WeatherAdvisory>): WeatherAdvisory {
  return {
    type: "heavy_rain",
    severity: "warning",
    message: "Heavy rain expected along this route",
    ...overrides,
  };
}

export function makeRouteData(overrides?: Partial<MultiRouteResponse>): MultiRouteResponse {
  return {
    origin_address: "San Francisco, CA, USA",
    destination_address: "Los Angeles, CA, USA",
    routes: [makeRoute()],
    recommendation: makeRecommendation(),
    ...overrides,
  };
}
