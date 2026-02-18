import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

function createMemoryStorage(): Storage {
  const store = new Map<string, string>();

  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null;
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(String(key), String(value));
    },
  };
}

function isStorageLike(value: unknown): value is Storage {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<Storage>;
  return (
    typeof candidate.getItem === "function" &&
    typeof candidate.setItem === "function" &&
    typeof candidate.removeItem === "function" &&
    typeof candidate.clear === "function" &&
    typeof candidate.key === "function" &&
    typeof candidate.length === "number"
  );
}

if (!isStorageLike(globalThis.localStorage)) {
  vi.stubGlobal("localStorage", createMemoryStorage());
}

if (!isStorageLike(globalThis.sessionStorage)) {
  vi.stubGlobal("sessionStorage", createMemoryStorage());
}

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
