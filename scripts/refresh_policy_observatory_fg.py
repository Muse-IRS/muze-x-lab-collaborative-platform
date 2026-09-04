#!/usr/bin/env python3
from __future__ import annotations

import json
import urllib.parse
import urllib.request
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "public" / "policy-observatory" / "data" / "france_travail_fg_public_min.json"
DATASET_ID = "dares_defm_stock_regions_brut_mens"
BASES = [
    "https://data.dares.travail-emploi.gouv.fr/api/explore/v2.1/catalog/datasets",
    "https://data.smartidf.services/api/explore/v2.1/catalog/datasets",
]
BASELINE = "2025-01"
TERRITORIES = [
    ("country", "FR", "France"),
    ("region", "84", "Auvergne-Rhône-Alpes"),
    ("department", "07", "Ardèche"),
    ("department", "26", "Drôme"),
]
USER_AGENT = "Muze-X-Public-Policy-Observatory-Public/0.1"


def get_json(url: str) -> dict:
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=90) as response:
        return json.loads(response.read().decode("utf-8"))


def request_records(base: str, *, where: str, order_by: str = "", limit: int = 100, offset: int = 0) -> dict:
    params = {"where": where, "limit": limit, "offset": offset}
    if order_by:
        params["order_by"] = order_by
    url = f"{base}/{DATASET_ID}/records?{urllib.parse.urlencode(params)}"
    return get_json(url)


def base_filter() -> str:
    return (
        'categorie in ("F","G") and type_de_donnees="Brutes" '
        'and sexe="Total" and tranche_d_age="Total" and anciennete="Total"'
    )


def latest_period(base: str) -> str:
    payload = request_records(base, where=base_filter(), order_by="date desc", limit=1)
    rows = payload.get("results", [])
    if not rows:
        raise RuntimeError("No DARES observation returned")
    return str(rows[0]["date"])


def month_rows(base: str, period: str) -> list[dict]:
    where = f'{base_filter()} and date="{period}"'
    rows: list[dict] = []
    offset = 0
    while True:
        payload = request_records(base, where=where, limit=100, offset=offset)
        batch = payload.get("results", [])
        rows.extend(batch)
        if len(batch) < 100:
            break
        offset += 100
    return rows


def territory_key(row: dict) -> tuple[str, str, str] | None:
    region_code = str(row.get("code_region", ""))
    dep_code = str(row.get("code_departement", ""))
    if region_code == "Total France" and dep_code == "Total":
        return ("country", "FR", "France")
    if dep_code == "Total" and region_code == "84":
        return ("region", "84", "Auvergne-Rhône-Alpes")
    if dep_code in {"07", "26"}:
        return ("department", dep_code, str(row.get("departement", "")))
    return None


def summarize(rows: list[dict], marker: str) -> list[dict]:
    grouped: dict[tuple[str, str, str, str], dict[str, int]] = defaultdict(dict)
    for row in rows:
        territory = territory_key(row)
        if territory is None:
            continue
        level, code, name = territory
        category = str(row.get("categorie", ""))
        period = str(row.get("date", ""))
        if category not in {"F", "G"}:
            continue
        grouped[(period, level, code, name)][category] = int(row.get("nombre_de_demandeurs_d_emploi") or 0)

    out: list[dict] = []
    for period, level, code, name in sorted(grouped):
        values = grouped[(period, level, code, name)]
        if "F" not in values or "G" not in values:
            continue
        F, G = values["F"], values["G"]
        FG = F + G
        out.append({
            "marker": marker,
            "period": period,
            "territory_level": level,
            "territory_code": code,
            "territory_name": name,
            "F": F,
            "G": G,
            "FG": FG,
            "G_share": round(G / FG, 6) if FG else None,
            "status": "OBS",
        })
    return out


def main() -> None:
    last_error = None
    for base in BASES:
        try:
            latest = latest_period(base)
            baseline_rows = month_rows(base, BASELINE)
            latest_rows = month_rows(base, latest)
            observations = summarize(baseline_rows, "baseline") + summarize(latest_rows, "latest")
            observations.sort(key=lambda r: (TERRITORIES.index((r["territory_level"], r["territory_code"], r["territory_name"])), r["marker"] != "baseline"))
            if len(observations) != 8:
                raise RuntimeError(f"Expected 8 minimized observations, got {len(observations)}")
            payload = {
                "schema_version": "0.4.1",
                "status": "OBS",
                "source": "DARES / France Travail — données mensuelles brutes",
                "source_url": "https://dares.travail-emploi.gouv.fr/donnees/demandeurs-emploi-inscrits-france-travail-donnees-mensuelles",
                "latest_period": latest,
                "territories": [
                    {"level": level, "code": code, "name": name}
                    for level, code, name in TERRITORIES
                ],
                "row_count": 8,
                "observations": observations,
                "method_note": "Extrait public strictement minimisé : première et dernière observation disponibles pour France, Auvergne-Rhône-Alpes, Ardèche et Drôme. G_share = G/(F+G). Un écart est descriptif et ne constitue pas une qualification causale."
            }
            TARGET.parent.mkdir(parents=True, exist_ok=True)
            TARGET.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
            print(json.dumps({"status": "OBS", "latest_period": latest, "rows": 8, "source_host": base}, ensure_ascii=False))
            return
        except Exception as exc:
            last_error = exc
    raise RuntimeError(f"Public DARES refresh failed: {last_error}")


if __name__ == "__main__":
    main()
