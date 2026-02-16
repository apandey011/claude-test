import { useState } from "react";
import { APIProvider } from "@vis.gl/react-google-maps";
import { fetchRouteWeather } from "./api";
import { MultiRouteResponse } from "./types";
import LocationForm from "./components/LocationForm";
import RouteMap from "./components/RouteMap";
import RouteRecommendationBanner from "./components/RouteRecommendationBanner";
import TempToggle from "./components/TempToggle";
import WeatherPanel from "./components/WeatherPanel";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

export default function App() {
  const [routeData, setRouteData] = useState<MultiRouteResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useFahrenheit, setUseFahrenheit] = useState(true);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState<number | null>(null);
  const [selectedWaypointIdx, setSelectedWaypointIdx] = useState<number | null>(null);

  const selectedRoute =
    routeData && selectedRouteIndex !== null
      ? routeData.routes[selectedRouteIndex]
      : null;

  async function handleSubmit(
    origin: string,
    destination: string,
    departureTime?: string
  ) {
    setLoading(true);
    setError(null);
    setSelectedRouteIndex(null);
    setSelectedWaypointIdx(null);
    try {
      const data = await fetchRouteWeather(origin, destination, departureTime);
      setRouteData(data);
      if (data.recommendation) {
        setSelectedRouteIndex(data.recommendation.recommended_route_index);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function handleRouteSelect(index: number) {
    setSelectedRouteIndex(index);
    setSelectedWaypointIdx(null);
  }

  return (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <h1>Route Weather</h1>
          <p>See the weather along your drive at 15-minute intervals</p>
        </div>
        <TempToggle
          useFahrenheit={useFahrenheit}
          onToggle={() => setUseFahrenheit((f) => !f)}
        />
      </header>

      <LocationForm onSubmit={handleSubmit} loading={loading} />

      {error && <div className="error-banner">{error}</div>}

      {routeData && (
        <div className="route-summary">
          <span>
            {routeData.origin_address} &rarr; {routeData.destination_address}
          </span>
          {selectedRoute && (
            <span>
              {selectedRoute.summary && `${selectedRoute.summary} · `}
              {selectedRoute.total_duration_minutes} min &middot;{" "}
              {selectedRoute.total_distance_km} km
            </span>
          )}
        </div>
      )}

      {routeData && routeData.recommendation && (
        <RouteRecommendationBanner
          recommendation={routeData.recommendation}
          routes={routeData.routes}
          selectedRouteIndex={selectedRouteIndex}
          onRouteSelect={handleRouteSelect}
        />
      )}

      <div className="main-content">
        <div className="map-container">
          <RouteMap
            routeData={routeData}
            selectedRouteIndex={selectedRouteIndex}
            recommendedRouteIndex={routeData?.recommendation?.recommended_route_index ?? null}
            onRouteSelect={handleRouteSelect}
            useFahrenheit={useFahrenheit}
            selectedWaypointIdx={selectedWaypointIdx}
            onSelectWaypoint={setSelectedWaypointIdx}
            onDeselectWaypoint={() => setSelectedWaypointIdx(null)}
          />
        </div>
        {selectedRoute && (
          <WeatherPanel
            waypoints={selectedRoute.waypoints}
            useFahrenheit={useFahrenheit}
            onSelectWaypoint={setSelectedWaypointIdx}
            onClose={() => { setSelectedRouteIndex(null); setSelectedWaypointIdx(null); }}
            advisories={
              routeData?.recommendation && selectedRouteIndex !== null
                ? routeData.recommendation.advisories[selectedRouteIndex] ?? []
                : []
            }
          />
        )}
      </div>
    </div>
    </APIProvider>
  );
}
