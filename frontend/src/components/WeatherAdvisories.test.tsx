import { render, screen } from "@testing-library/react";
import WeatherAdvisories from "./WeatherAdvisories";
import { makeAdvisory } from "../test/fixtures";

describe("WeatherAdvisories", () => {
  it("renders nothing when advisories array is empty", () => {
    const { container } = render(<WeatherAdvisories advisories={[]} />);
    expect(container.innerHTML).toBe("");
  });

  it("renders a single warning advisory", () => {
    const advisory = makeAdvisory({ severity: "warning", message: "Fog ahead" });
    render(<WeatherAdvisories advisories={[advisory]} />);
    expect(screen.getByText("Fog ahead")).toBeInTheDocument();
  });

  it("renders a single danger advisory", () => {
    const advisory = makeAdvisory({ severity: "danger", message: "Severe thunderstorm" });
    render(<WeatherAdvisories advisories={[advisory]} />);
    expect(screen.getByText("Severe thunderstorm")).toBeInTheDocument();
  });

  it("renders multiple advisories", () => {
    const advisories = [
      makeAdvisory({ severity: "warning", message: "High winds" }),
      makeAdvisory({ severity: "danger", message: "Heavy snow" }),
    ];
    render(<WeatherAdvisories advisories={advisories} />);
    expect(screen.getByText("High winds")).toBeInTheDocument();
    expect(screen.getByText("Heavy snow")).toBeInTheDocument();
  });

  it("uses correct icon for each severity", () => {
    const advisories = [
      makeAdvisory({ severity: "warning", message: "Wind warning" }),
      makeAdvisory({ severity: "danger", message: "Storm danger" }),
    ];
    const { container } = render(<WeatherAdvisories advisories={advisories} />);
    const icons = container.querySelectorAll(".advisory-icon");
    // warning icon is "⚠" (U+26A0), danger icon is "⚠️" (U+26A0 + U+FE0F)
    expect(icons[0].textContent).toBe("\u26A0");
    expect(icons[1].textContent).toBe("\u26A0\uFE0F");
  });
});
