"""Simple in-memory TTL cache with LRU eviction."""
from __future__ import annotations

import hashlib
import json
import time
from collections import OrderedDict
from typing import Any

DEFAULT_TTL = 30 * 60  # 30 minutes
MAX_ENTRIES = 100


class TTLCache:
    def __init__(self, ttl: int = DEFAULT_TTL, max_entries: int = MAX_ENTRIES):
        self._ttl = ttl
        self._max_entries = max_entries
        self._store: OrderedDict[str, tuple[float, Any]] = OrderedDict()

    @staticmethod
    def make_key(origin: str, destination: str, departure_time_iso: str | None) -> str:
        dt_rounded = ""
        if departure_time_iso:
            dt_rounded = departure_time_iso[:13]  # "2026-02-16T10"
        raw = json.dumps(
            [origin.lower().strip(), destination.lower().strip(), dt_rounded],
            sort_keys=True,
        )
        return hashlib.sha256(raw.encode()).hexdigest()

    def get(self, key: str) -> Any | None:
        if key not in self._store:
            return None
        ts, value = self._store[key]
        if time.time() - ts > self._ttl:
            del self._store[key]
            return None
        self._store.move_to_end(key)
        return value

    def set(self, key: str, value: Any) -> None:
        if key in self._store:
            self._store.move_to_end(key)
        self._store[key] = (time.time(), value)
        while len(self._store) > self._max_entries:
            self._store.popitem(last=False)


route_cache = TTLCache()
