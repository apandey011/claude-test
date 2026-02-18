import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TempToggle from "./TempToggle";

describe("TempToggle", () => {
  it("shows °F when useFahrenheit is true", () => {
    render(<TempToggle useFahrenheit={true} onToggle={() => {}} />);
    expect(screen.getByRole("button")).toHaveTextContent("°F");
  });

  it("shows °C when useFahrenheit is false", () => {
    render(<TempToggle useFahrenheit={false} onToggle={() => {}} />);
    expect(screen.getByRole("button")).toHaveTextContent("°C");
  });

  it("calls onToggle when clicked", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(<TempToggle useFahrenheit={true} onToggle={onToggle} />);

    await user.click(screen.getByRole("button"));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});
