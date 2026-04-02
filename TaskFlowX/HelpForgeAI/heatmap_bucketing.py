from typing import List

def generate_activity_heatmap(
    timestamps: List[int],
    counts: List[int],
    buckets: int = 10,
    normalize: bool = True
) -> List[float]:
    """
    Bucket activity counts into 'buckets' time intervals,
    returning either raw counts (floats) or normalized values in [0.0, 1.0].

    Args:
        timestamps: list of epoch-ms timestamps.
        counts: list of integer counts per timestamp (same length as timestamps).
        buckets: number of buckets (must be > 0).
        normalize: scale values to [0, 1] if True.
    """
    if not timestamps or not counts or len(timestamps) != len(counts):
        return []
    if buckets <= 0:
        buckets = 1

    t_min, t_max = min(timestamps), max(timestamps)
    span = (t_max - t_min) or 1  # avoid zero-division for constant timestamps
    bucket_size = span / buckets

    agg: List[float] = [0.0] * buckets
    for t, c in zip(timestamps, counts):
        idx = min(buckets - 1, int((t - t_min) / bucket_size))
        agg[idx] += float(c)

    if normalize:
        m = max(agg) or 1.0
        return [round(val / m, 4) for val in agg]
    return [float(val) for val in agg]
