export interface RecentRoute {
  origin: string;
  destination: string;
  originDisplay: string;
  destinationDisplay: string;
  timestamp: number;
}

const STORAGE_KEY = "route-weather-history";
const MAX_ENTRIES = 5;

export function loadHistory(): RecentRoute[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveToHistory(entry: RecentRoute): void {
  const history = loadHistory();
  const filtered = history.filter(
    (h) => !(h.origin === entry.origin && h.destination === entry.destination)
  );
  filtered.unshift(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered.slice(0, MAX_ENTRIES)));
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}

function formatRelativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  return `${days}d ago`;
}

interface Props {
  history: RecentRoute[];
  onSelect: (entry: RecentRoute) => void;
  onClear: () => void;
}

export default function RecentRoutes({ history, onSelect, onClear }: Props) {
  if (history.length === 0) return null;

  return (
    <div className="recent-routes">
      <div className="recent-routes-header">
        <span className="recent-routes-title">Recent Searches</span>
        <button className="recent-routes-clear" onClick={onClear}>Clear</button>
      </div>
      <div className="recent-routes-list">
        {history.map((entry, idx) => (
          <button key={idx} className="recent-route-item" onClick={() => onSelect(entry)}>
            <span className="recent-route-text">
              {entry.originDisplay} &rarr; {entry.destinationDisplay}
            </span>
            <span className="recent-route-time">
              {formatRelativeTime(entry.timestamp)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
