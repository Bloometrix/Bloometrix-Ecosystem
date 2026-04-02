import math
from typing import Union, Dict

Number = Union[float, int]

def _clamp(x: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, x))

def _safe_log10(x: Number) -> float:
    """log10 with guard; returns -inf for nonpositive values."""
    xv = float(x)
    return math.log10(xv) if xv > 0 else float("-inf")

def calculate_risk_score(
    price_change_pct: Number,
    liquidity_usd: Number,
    flags_mask: int
) -> float:
    """
    Compute a 0–100 risk score.
    - price_change_pct: percent change over period (e.g., +5.0 for +5%).
    - liquidity_usd: total liquidity in USD.
    - flags_mask: integer bitmask of risk flags; each set bit adds a penalty.
    """
    # Volatility component (max 50)
    vol = min(abs(float(price_change_pct)) / 10.0, 1.0) * 50.0

    # Liquidity component: more liquidity => lower risk (capped at 30)
    if liquidity_usd and float(liquidity_usd) > 0:
        liq_raw = 30.0 - (_safe_log10(liquidity_usd) * 5.0)
        liq = _clamp(liq_raw, 0.0, 30.0)
    else:
        liq = 30.0

    # Flag penalty: 5 points per set bit
    mask = int(flags_mask) if flags_mask is not None else 0
    if mask < 0:
        mask = 0
    flag_penalty = bin(mask).count("1") * 5.0

    score = vol + liq + flag_penalty
    return _clamp(round(score, 2), 0.0, 100.0)

def calculate_risk_score_breakdown(
    price_change_pct: Number,
    liquidity_usd: Number,
    flags_mask: int
) -> Dict[str, float]:
    """Return components along with the final score."""
    # reuse internal logic without double-rounding the final score
    vol = min(abs(float(price_change_pct)) / 10.0, 1.0) * 50.0
    if liquidity_usd and float(liquidity_usd) > 0:
        liq = _clamp(30.0 - (_safe_log10(liquidity_usd) * 5.0), 0.0, 30.0)
    else:
        liq = 30.0
    mask = int(flags_mask) if flags_mask is not None else 0
    if mask < 0:
        mask = 0
    flags = bin(mask).count("1") * 5.0
    total = _clamp(round(vol + liq + flags, 2), 0.0, 100.0)
    return {
        "volatility": round(vol, 2),
        "liquidity": round(liq, 2),
        "flags": round(flags, 2),
        "score": total,
    }
