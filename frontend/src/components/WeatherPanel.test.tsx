import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import WeatherPanel from "./WeatherPanel";
import { makeWaypoint, makeAdvisory } from "../test/fixtures";

function makeWaypoints(count: number) {
  return Array.from({ length: count }, (_, i) =>
    makeWaypoint({
      minutes_from_start: i * 15,
      estimated_time: `2026-02-16T${String(10 + Math.floor((i * 15) / 60)).padStart(2, "0")}:${String((i * 15) % 60).padStart(2, "0")}:00Z`,
      location: { lat: 37.77 - i * 0.1, lng: -122.42 + i * 0.1 },
    })
  );
}

describe("WeatherPanel", () => {
  const defaultProps = {
    useFahrenheit: false,
    onSelectWaypoint: vi.fn(),
    onClose: vi.fn(),
  };

  it("renders all waypoints", () => {
    const waypoints = makeWaypoints(4);
    const { container } = render(
      <WeatherPanel {...defaultProps} waypoints={waypoints} />
    );
    const rows = container.querySelectorAll(".panel-row");
    expect(rows).toHaveLength(4);
  });

  it("labels the first waypoint as 'Start'", () => {
    const waypoints = makeWaypoints(3);
    render(<WeatherPanel {...defaultProps} waypoints={waypoints} />);
    expect(screen.getByText("Start")).toBeInTheDocument();
  });

  it("labels the last waypoint as 'Arrive'", () => {
    const waypoints = makeWaypoints(3);
    render(<WeatherPanel {...defaultProps} waypoints={waypoints} />);
    expect(screen.getByText("Arrive")).toBeInTheDocument();
  });

  it("shows duration compact format for middle waypoints", () => {
    const waypoints = makeWaypoints(3);
    render(<WeatherPanel {...defaultProps} waypoints={waypoints} />);
    // Middle waypoint is at 15 minutes -> "+0:15"
    expect(screen.getByText("+0:15")).toBeInTheDocument();
  });

  it("displays temperature in the correct unit", () => {
    const waypoints = [makeWaypoint({ weather: { temperature_c: 20, apparent_temperature_c: 18, precipitation_mm: 0, precipitation_probability: 10, weather_code: 0, weather_description: "Clear", wind_speed_kmh: 10, humidity_percent: 50 } })];
    render(
      <WeatherPanel {...defaultProps} waypoints={waypoints} useFahrenheit={true} />
    );
    // toF(20) = 68
    expect(screen.getByText("68°F")).toBeInTheDocument();
  });

  it("calls onSelectWaypoint when a row is clicked", async () => {
    const user = userEvent.setup();
    const onSelectWaypoint = vi.fn();
    const waypoints = makeWaypoints(3);
    const { container } = render(
      <WeatherPanel {...defaultProps} waypoints={waypoints} onSelectWaypoint={onSelectWaypoint} />
    );
    const rows = container.querySelectorAll(".panel-row");
    await user.click(rows[1]);
    expect(onSelectWaypoint).toHaveBeenCalledWith(1);
  });

  it("calls onClose when close button is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const waypoints = makeWaypoints(2);
    render(
      <WeatherPanel {...defaultProps} waypoints={waypoints} onClose={onClose} />
    );
    await user.click(screen.getByLabelText("Close"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renders advisories when provided", () => {
    const waypoints = makeWaypoints(2);
    const advisories = [makeAdvisory({ message: "Heavy rain expected" })];
    render(
      <WeatherPanel {...defaultProps} waypoints={waypoints} advisories={advisories} />
    );
    expect(screen.getByText("Heavy rain expected")).toBeInTheDocument();
  });

  it("does not render advisories section when array is empty", () => {
    const waypoints = makeWaypoints(2);
    const { container } = render(
      <WeatherPanel {...defaultProps} waypoints={waypoints} advisories={[]} />
    );
    expect(container.querySelector(".advisories")).not.toBeInTheDocument();
  });

  it("applies panel-row-endpoint class to first and last rows", () => {
    const waypoints = makeWaypoints(3);
    const { container } = render(
      <WeatherPanel {...defaultProps} waypoints={waypoints} />
    );
    const rows = container.querySelectorAll(".panel-row");
    expect(rows[0]).toHaveClass("panel-row-endpoint");
    expect(rows[1]).not.toHaveClass("panel-row-endpoint");
    expect(rows[2]).toHaveClass("panel-row-endpoint");
  });
});
