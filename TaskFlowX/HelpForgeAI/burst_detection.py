from typing import List, TypedDict
import math


class VolumeBurstEvent(TypedDict):
    index: int        # index of the current volume
    previous: float   # previous volume
    current: float    # current volume
    ratio: float      # current / previous


def detect_volume_bursts(
    volumes: List[float],
    threshold_ratio: float = 1.5,
    min_interval: int = 1
) -> List[VolumeBurstEvent]:
    """
    Identify points where volume jumps by `threshold_ratio` vs the previous value.
    Returns a list of events: { index, previous, current, ratio }.
    """
    if not volumes or len(volumes) < 2:
        return []

    thr = threshold_ratio if threshold_ratio > 0 else 1.0
    gap = max(1, int(min_interval))

    events: List[VolumeBurstEvent] = []
    last_idx = -gap

    for i in range(1, len(volumes)):
        prev = float(volumes[i - 1])
        curr = float(volumes[i])

        if not (math.isfinite(prev) and math.isfinite(curr)):
            continue
        if prev <= 0:
            continue  # avoid division by zero/negative baseline

        ratio = curr / prev
        if ratio >= thr and (i - last_idx) >= gap:
            events.append({
                "index": i,
                "previous": prev,
                "current": curr,
                "ratio": round(ratio, 4),
            })
            last_idx = i

    return events
