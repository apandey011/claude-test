import { toF, toMph, weatherEmoji, formatDuration, formatDurationCompact, formatTime } from "./utils";

describe("toF", () => {
  it("converts 0°C to 32°F", () => {
    expect(toF(0)).toBe(32);
  });

  it("converts 100°C to 212°F", () => {
    expect(toF(100)).toBe(212);
  });

  it("converts -40°C to -40°F", () => {
    expect(toF(-40)).toBe(-40);
  });

  it("rounds 20.5°C to 69°F", () => {
    expect(toF(20.5)).toBe(69);
  });
});

describe("toMph", () => {
  it("converts 0 km/h to 0 mph", () => {
    expect(toMph(0)).toBe(0);
  });

  it("converts 100 km/h to 62 mph", () => {
    expect(toMph(100)).toBe(62);
  });

  it("converts 1.609 km/h to 1 mph", () => {
    expect(toMph(1.609)).toBe(1);
  });
});

describe("weatherEmoji", () => {
  it("returns sun for code 0", () => {
    expect(weatherEmoji(0)).toBe("\u2600\uFE0F");
  });

  it("returns cloud for code 3", () => {
    expect(weatherEmoji(3)).toBe("\u26C5");
  });

  it("returns fog for code 45", () => {
    expect(weatherEmoji(45)).toBe("\uD83C\uDF2B\uFE0F");
  });

  it("returns drizzle for code 55", () => {
    expect(weatherEmoji(55)).toBe("\uD83C\uDF26\uFE0F");
  });

  it("returns rain for code 67", () => {
    expect(weatherEmoji(67)).toBe("\uD83C\uDF27\uFE0F");
  });

  it("returns snow for code 77", () => {
    expect(weatherEmoji(77)).toBe("\u2744\uFE0F");
  });

  it("returns rain shower for code 82", () => {
    expect(weatherEmoji(82)).toBe("\uD83C\uDF26\uFE0F");
  });

  it("returns snow storm for code 86", () => {
    expect(weatherEmoji(86)).toBe("\uD83C\uDF28\uFE0F");
  });

  it("returns lightning for code 95", () => {
    expect(weatherEmoji(95)).toBe("\u26A1");
  });
});

describe("formatDuration", () => {
  it("formats 0 minutes as '0 min'", () => {
    expect(formatDuration(0)).toBe("0 min");
  });

  it("formats 45 minutes as '45 min'", () => {
    expect(formatDuration(45)).toBe("45 min");
  });

  it("formats 60 minutes as '1h'", () => {
    expect(formatDuration(60)).toBe("1h");
  });

  it("formats 90 minutes as '1h 30m'", () => {
    expect(formatDuration(90)).toBe("1h 30m");
  });

  it("formats 120 minutes as '2h'", () => {
    expect(formatDuration(120)).toBe("2h");
  });
});

describe("formatDurationCompact", () => {
  it("formats 0 as '+0:00'", () => {
    expect(formatDurationCompact(0)).toBe("+0:00");
  });

  it("formats 15 as '+0:15'", () => {
    expect(formatDurationCompact(15)).toBe("+0:15");
  });

  it("formats 90 as '+1:30'", () => {
    expect(formatDurationCompact(90)).toBe("+1:30");
  });
});

describe("formatTime", () => {
  it("returns a localized time string for a valid ISO string", () => {
    const result = formatTime("2026-02-16T10:00:00Z");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });
});
