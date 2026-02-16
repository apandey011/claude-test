import { RouteRecommendation, RouteWithWeather } from "../types";

interface Props {
  recommendation: RouteRecommendation;
  routes: RouteWithWeather[];
  selectedRouteIndex: number | null;
  onRouteSelect: (index: number) => void;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export default function RouteRecommendationBanner({
  recommendation,
  routes,
  selectedRouteIndex,
  onRouteSelect,
}: Props) {
  const recIdx = recommendation.recommended_route_index;
  const recScore = recommendation.scores[recIdx];

  return (
    <div className="recommendation-banner">
      <div className="recommendation-header">
        <span className="recommendation-badge">Recommended</span>
        <span className="recommendation-reason">
          {recScore.recommendation_reason}
        </span>
      
      <span className="route-scores">
        {routes.map((route, idx) => {
          const score = recommendation.scores[idx];
          const isRecommended = idx === recIdx;
          const isSelected = idx === selectedRouteIndex;
          return (
            <button
              key={idx}
              className={`route-score-chip${isRecommended ? " recommended" : ""}${isSelected ? " selected" : ""}`}
              onClick={() => onRouteSelect(route.route_index)}
            >
              <span className="score-value">
                {Math.round(score.overall_score)}
              </span>
              <span className="score-label">
                {route.summary || `Route ${idx + 1}`}
              </span>
              <span className="score-detail">
                {formatDuration(route.total_duration_minutes)}
              </span>
            </button>
          );
        })}
      </span>
    </div>
  </div>
  );
}
