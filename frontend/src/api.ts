import { MultiRouteResponse } from "./types";

const API_BASE = import.meta.env.VITE_API_BASE || "";

export async function fetchRouteWeather(
  origin: string,
  destination: string,
  departureTime?: string
): Promise<MultiRouteResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);

  try {
    const response = await fetch(`${API_BASE}/api/route-weather`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        origin,
        destination,
        departure_time: departureTime || null,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      let message = "Failed to fetch route weather";
      try {
        const error = await response.json();
        message = error.detail || message;
      } catch {
        // response body wasn't JSON
      }
      throw new Error(message);
    }

    return response.json();
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error("Request timed out — please try again");
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}
