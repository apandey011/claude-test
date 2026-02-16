import { MultiRouteResponse } from "./types";

const API_BASE = "http://localhost:8000";

export async function fetchRouteWeather(
  origin: string,
  destination: string,
  departureTime?: string
): Promise<MultiRouteResponse> {
  const response = await fetch(`${API_BASE}/api/route-weather`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      origin,
      destination,
      departure_time: departureTime || null,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to fetch route weather");
  }

  return response.json();
}
