import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

afterEach(() => {
  cleanup();
});

// Global mock for Google Maps API objects used across many components
const mockGoogle = {
  maps: {
    places: {
      Autocomplete: vi.fn().mockImplementation(() => ({
        addListener: vi.fn(),
        getPlace: vi.fn(),
      })),
    },
    Geocoder: vi.fn().mockImplementation(() => ({
      geocode: vi.fn(),
    })),
    LatLng: vi.fn().mockImplementation((lat: number, lng: number) => ({ lat, lng })),
    LatLngBounds: vi.fn().mockImplementation(() => ({
      extend: vi.fn(),
    })),
    Polyline: vi.fn().mockImplementation(() => ({
      setMap: vi.fn(),
      addListener: vi.fn(),
      setOptions: vi.fn(),
    })),
  },
};

vi.stubGlobal("google", mockGoogle);
