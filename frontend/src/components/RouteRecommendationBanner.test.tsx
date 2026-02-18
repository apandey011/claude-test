import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RouteRecommendationBanner from "./RouteRecommendationBanner";
import { makeRoute, makeRecommendation } from "../test/fixtures";

describe("RouteRecommendationBanner", () => {
  const twoRoutes = [
    makeRoute({ route_index: 0, summary: "via I-5 S", total_duration_minutes: 350 }),
    makeRoute({ route_index: 1, summary: "via US-101 S", total_duration_minutes: 390 }),
  ];

  const recommendation = makeRecommendation({
    recommended_route_index: 0,
    scores: [
      { overall_score: 85.7, duration_score: 90, weather_score: 80, recommendation_reason: "Best weather and shortest drive" },
      { overall_score: 72.3, duration_score: 70, weather_score: 75, recommendation_reason: "Longer route with moderate weather" },
    ],
    advisories: [[], []],
  });

  const defaultProps = {
    recommendation,
    routes: twoRoutes,
    selectedRouteIndex: 0,
    onRouteSelect: vi.fn(),
  };

  it("renders 'Recommended' badge", () => {
    render(<RouteRecommendationBanner {...defaultProps} />);
    expect(screen.getByText("Recommended")).toBeInTheDocument();
  });

  it("shows recommendation reason", () => {
    render(<RouteRecommendationBanner {...defaultProps} />);
    expect(screen.getByText("Best weather and shortest drive")).toBeInTheDocument();
  });

  it("renders one chip per route", () => {
    const { container } = render(<RouteRecommendationBanner {...defaultProps} />);
    const chips = container.querySelectorAll(".route-score-chip");
    expect(chips).toHaveLength(2);
  });

  it("applies 'recommended' class to the recommended chip", () => {
    const { container } = render(<RouteRecommendationBanner {...defaultProps} />);
    const chips = container.querySelectorAll(".route-score-chip");
    expect(chips[0]).toHaveClass("recommended");
    expect(chips[1]).not.toHaveClass("recommended");
  });

  it("applies 'selected' class to the selected chip", () => {
    const { container } = render(
      <RouteRecommendationBanner {...defaultProps} selectedRouteIndex={1} />
    );
    const chips = container.querySelectorAll(".route-score-chip");
    expect(chips[0]).not.toHaveClass("selected");
    expect(chips[1]).toHaveClass("selected");
  });

  it("calls onRouteSelect with route_index on chip click", async () => {
    const user = userEvent.setup();
    const onRouteSelect = vi.fn();
    const { container } = render(
      <RouteRecommendationBanner {...defaultProps} onRouteSelect={onRouteSelect} />
    );
    const chips = container.querySelectorAll(".route-score-chip");
    await user.click(chips[1]);
    expect(onRouteSelect).toHaveBeenCalledWith(1);
  });

  it("shows rounded overall score", () => {
    render(<RouteRecommendationBanner {...defaultProps} />);
    // 85.7 rounds to 86, 72.3 rounds to 72
    expect(screen.getByText("86")).toBeInTheDocument();
    expect(screen.getByText("72")).toBeInTheDocument();
  });

  it("uses route summary text or falls back to 'Route N'", () => {
    const routesWithoutSummary = [
      makeRoute({ route_index: 0, summary: "via I-5 S" }),
      makeRoute({ route_index: 1, summary: "" }),
    ];
    render(
      <RouteRecommendationBanner
        {...defaultProps}
        routes={routesWithoutSummary}
      />
    );
    expect(screen.getByText("via I-5 S")).toBeInTheDocument();
    expect(screen.getByText("Route 2")).toBeInTheDocument();
  });
});
