from datetime import datetime, timedelta
from math import atan2, cos, radians, sin, sqrt

import polyline as polyline_codec

from ..models import LatLng, Waypoint

INTERVAL_SECONDS = 15 * 60  # 15 minutes


def _haversine(p1: tuple, p2: tuple) -> float:
    """Distance in meters between two (lat, lng) tuples."""
    R = 6_371_000
    lat1, lon1 = radians(p1[0]), radians(p1[1])
    lat2, lon2 = radians(p2[0]), radians(p2[1])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    return R * 2 * atan2(sqrt(a), sqrt(1 - a))


def _interpolate(p1: tuple, p2: tuple, fraction: float) -> tuple:
    """Linear interpolation between two (lat, lng) tuples."""
    return (
        p1[0] + (p2[0] - p1[0]) * fraction,
        p1[1] + (p2[1] - p1[1]) * fraction,
    )


def sample_route_points(
    steps: list[dict],
    departure_time: datetime,
) -> list[Waypoint]:
    """Sample waypoints along the route at 15-minute intervals.

    Walks through each step's decoded polyline, tracking cumulative elapsed
    time. When a 15-minute boundary is crossed, the exact position is
    interpolated within that polyline segment.
    """
    if not steps:
        return []

    # Always include the starting point
    first_step = steps[0]
    waypoints = [
        Waypoint(
            location=LatLng(
                lat=first_step["start_location"]["lat"],
                lng=first_step["start_location"]["lng"],
            ),
            minutes_from_start=0,
            estimated_time=departure_time,
        )
    ]

    elapsed_seconds = 0.0
    next_threshold = INTERVAL_SECONDS

    for step in steps:
        step_duration = step["duration_seconds"]
        step_distance = step["distance_meters"]

        if step_distance == 0 or step_duration == 0:
            elapsed_seconds += step_duration
            continue

        speed_mps = step_distance / step_duration
        step_points = polyline_codec.decode(step["polyline"])

        for i in range(len(step_points) - 1):
            p1 = step_points[i]
            p2 = step_points[i + 1]
            segment_distance = _haversine(p1, p2)
            segment_duration = segment_distance / speed_mps if speed_mps > 0 else 0

            segment_end_elapsed = elapsed_seconds + segment_duration

            while next_threshold <= segment_end_elapsed:
                time_into_segment = next_threshold - elapsed_seconds
                fraction = (
                    time_into_segment / segment_duration
                    if segment_duration > 0
                    else 0
                )
                fraction = max(0.0, min(1.0, fraction))

                point = _interpolate(p1, p2, fraction)
                minutes = int(next_threshold // 60)

                waypoints.append(
                    Waypoint(
                        location=LatLng(lat=point[0], lng=point[1]),
                        minutes_from_start=minutes,
                        estimated_time=departure_time
                        + timedelta(seconds=next_threshold),
                    )
                )
                next_threshold += INTERVAL_SECONDS

            elapsed_seconds = segment_end_elapsed

    # Always include the ending point
    last_step = steps[-1]
    total_minutes = int(elapsed_seconds // 60)
    if not waypoints or waypoints[-1].minutes_from_start != total_minutes:
        waypoints.append(
            Waypoint(
                location=LatLng(
                    lat=last_step["end_location"]["lat"],
                    lng=last_step["end_location"]["lng"],
                ),
                minutes_from_start=total_minutes,
                estimated_time=departure_time
                + timedelta(seconds=elapsed_seconds),
            )
        )

    return waypoints
