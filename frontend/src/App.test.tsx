import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { forwardRef } from "react";
import App from "./App";
import { fetchRouteWeather } from "./api";
import { makeRouteData } from "./test/fixtures";

vi.mock("./api", () => ({
  fetchRouteWeather: vi.fn(),
}));

vi.mock("@vis.gl/react-google-maps", () => ({
  APIProvider: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("./components/RouteMap", () => ({
  default: () => <div data-testid="route-map" />,
}));

vi.mock("./components/LocationForm", () => {
  return {
    default: forwardRef(function MockLocationForm(props: any, _ref: any) {
      return (
        <div data-testid="location-form">
          <button
            data-testid="mock-submit"
            onClick={() =>
              props.onSubmit("SF", "LA", undefined, "San Francisco", "Los Angeles")
            }
          >
            Submit
          </button>
        </div>
      );
    }),
    LocationFormHandle: {},
  };
});

vi.mock("./components/WeatherPanel", () => ({
  default: (props: any) => (
    <div data-testid="weather-panel">
      <button data-testid="panel-close" onClick={props.onClose}>Close</button>
    </div>
  ),
}));

vi.mock("./components/RouteRecommendationBanner", () => ({
  default: () => <div data-testid="recommendation-banner" />,
}));

const mockFetchRouteWeather = vi.mocked(fetchRouteWeather);

describe("App", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("renders header and no error or route summary on initial load", () => {
    render(<App />);
    expect(screen.getByText(/Route Weather/)).toBeInTheDocument();
    expect(screen.queryByText(/→/)).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows loading state while fetching", async () => {
    // Return a promise that never resolves to keep loading state
    let resolvePromise: (value: any) => void;
    mockFetchRouteWeather.mockReturnValue(
      new Promise((resolve) => {
        resolvePromise = resolve;
      })
    );

    render(<App />);
    const user = userEvent.setup();
    await user.click(screen.getByTestId("mock-submit"));

    expect(screen.getByText("Finding routes and weather...")).toBeInTheDocument();

    // Clean up by resolving
    resolvePromise!(makeRouteData());
    await waitFor(() => {
      expect(screen.queryByText("Finding routes and weather...")).not.toBeInTheDocument();
    });
  });

  it("shows route data after successful submit", async () => {
    const data = makeRouteData({
      origin_address: "San Francisco, CA, USA",
      destination_address: "Los Angeles, CA, USA",
    });
    mockFetchRouteWeather.mockResolvedValue(data);

    render(<App />);
    const user = userEvent.setup();
    await user.click(screen.getByTestId("mock-submit"));

    await waitFor(() => {
      expect(screen.getByText(/San Francisco, CA, USA/)).toBeInTheDocument();
      expect(screen.getByText(/Los Angeles, CA, USA/)).toBeInTheDocument();
    });
  });

  it("shows error banner on API error", async () => {
    mockFetchRouteWeather.mockRejectedValue(new Error("Server error"));

    render(<App />);
    const user = userEvent.setup();
    await user.click(screen.getByTestId("mock-submit"));

    await waitFor(() => {
      expect(screen.getByText("Server error")).toBeInTheDocument();
    });
  });

  it("clears error when dismiss button is clicked", async () => {
    mockFetchRouteWeather.mockRejectedValue(new Error("Server error"));

    render(<App />);
    const user = userEvent.setup();
    await user.click(screen.getByTestId("mock-submit"));

    await waitFor(() => {
      expect(screen.getByText("Server error")).toBeInTheDocument();
    });

    await user.click(screen.getByLabelText("Dismiss"));

    expect(screen.queryByText("Server error")).not.toBeInTheDocument();
  });

  it("toggles temperature unit", async () => {
    render(<App />);
    const user = userEvent.setup();

    // Default is Fahrenheit (true), so button shows "°F"
    const toggleBtn = screen.getByText("°F");
    expect(toggleBtn).toBeInTheDocument();

    await user.click(toggleBtn);
    expect(screen.getByText("°C")).toBeInTheDocument();
  });

  it("shows route summary with origin and destination after submit", async () => {
    const data = makeRouteData({
      origin_address: "San Francisco, CA, USA",
      destination_address: "Los Angeles, CA, USA",
    });
    mockFetchRouteWeather.mockResolvedValue(data);

    render(<App />);
    const user = userEvent.setup();
    await user.click(screen.getByTestId("mock-submit"));

    await waitFor(() => {
      const summary = screen.getByText(/San Francisco, CA, USA/);
      expect(summary).toBeInTheDocument();
    });
    // Both addresses appear in the route-summary span
    expect(screen.getByText(/Los Angeles, CA, USA/)).toBeInTheDocument();
  });

  it("renders the route map component", () => {
    render(<App />);
    expect(screen.getByTestId("route-map")).toBeInTheDocument();
  });

  it("shows recommendation banner when route data has recommendation", async () => {
    const data = makeRouteData();
    mockFetchRouteWeather.mockResolvedValue(data);

    render(<App />);
    const user = userEvent.setup();
    await user.click(screen.getByTestId("mock-submit"));

    await waitFor(() => {
      expect(screen.getByTestId("recommendation-banner")).toBeInTheDocument();
    });
  });

  it("shows weather panel when a route is selected", async () => {
    const data = makeRouteData();
    mockFetchRouteWeather.mockResolvedValue(data);

    render(<App />);
    const user = userEvent.setup();
    await user.click(screen.getByTestId("mock-submit"));

    await waitFor(() => {
      // recommendation auto-selects the recommended route
      expect(screen.getByTestId("weather-panel")).toBeInTheDocument();
    });
  });
});
