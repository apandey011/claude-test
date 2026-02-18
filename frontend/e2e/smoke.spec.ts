import { expect, test } from "@playwright/test";

const MOCK_RESPONSE = {
  origin_address: "San Francisco, CA, USA",
  destination_address: "Los Angeles, CA, USA",
  routes: [
    {
      route_index: 0,
      overview_polyline: "a~l~Fjk~uOwHJy@P",
      summary: "via I-5 S",
      total_duration_minutes: 350,
      total_distance_km: 612.3,
      waypoints: [
        {
          location: { lat: 37.7749, lng: -122.4194 },
          minutes_from_start: 0,
          estimated_time: "2026-02-16T10:00:00Z",
          weather: {
            temperature_c: 15.2,
            apparent_temperature_c: 14.1,
            precipitation_mm: 0,
            precipitation_probability: 5,
            weather_code: 1,
            weather_description: "Mainly clear",
            wind_speed_kmh: 9.5,
            humidity_percent: 62,
          },
        },
        {
          location: { lat: 34.0522, lng: -118.2437 },
          minutes_from_start: 350,
          estimated_time: "2026-02-16T15:50:00Z",
          weather: {
            temperature_c: 21.3,
            apparent_temperature_c: 20.5,
            precipitation_mm: 0,
            precipitation_probability: 10,
            weather_code: 2,
            weather_description: "Partly cloudy",
            wind_speed_kmh: 14.2,
            humidity_percent: 48,
          },
        },
      ],
    },
  ],
  recommendation: {
    recommended_route_index: 0,
    scores: [
      {
        overall_score: 89.4,
        duration_score: 90.1,
        weather_score: 88.2,
        recommendation_reason: "Fastest route with mostly clear weather",
      },
    ],
    advisories: [[]],
  },
};

test("user can submit a route and see recommendation, map, and weather panel", async ({ page }) => {
  await page.route("**/api/route-weather", async (route) => {
    if (route.request().method() !== "POST") {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(MOCK_RESPONSE),
    });
  });

  await page.goto("/");

  await page.getByPlaceholder("Starting location").fill("San Francisco, CA");
  await page.getByPlaceholder("Destination").fill("Los Angeles, CA");
  await page.getByRole("button", { name: "Get Route Weather" }).click();

  await expect(page.getByText("San Francisco, CA, USA")).toBeVisible();
  await expect(page.getByText("Los Angeles, CA, USA")).toBeVisible();
  await expect(page.getByText("Recommended")).toBeVisible();
  await expect(page.getByTestId("e2e-route-map")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Weather Along Route" }),
  ).toBeVisible();
});
