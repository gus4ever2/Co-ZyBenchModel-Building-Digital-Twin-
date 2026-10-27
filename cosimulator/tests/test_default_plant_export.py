import importlib.util
from pathlib import Path

import pytest


def load_exporter():
    path = Path(__file__).resolve().parents[1] / "tools/export_default_plants.py"
    spec = importlib.util.spec_from_file_location("default_plant_export", path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def test_grouping_combines_only_identical_illumination(monkeypatch):
    exporter = load_exporter()
    captured = {}
    monkeypatch.setattr(exporter, "ORIGINAL_EVALUATE", lambda **kwargs: captured.update(kwargs))
    exporter.compact_slice(
        leaf_areas_m2=[0.1, 0.2, 0.3],
        absorbed_factors=[0.5, 0.5, 0.500000001], ppfd=100,
    )
    assert captured["absorbed_factors"] == [0.5, 0.500000001]
    assert captured["leaf_areas_m2"] == pytest.approx([0.3, 0.3])


def test_darkness_preserves_total_area(monkeypatch):
    exporter = load_exporter()
    captured = {}
    monkeypatch.setattr(exporter, "ORIGINAL_EVALUATE", lambda **kwargs: captured.update(kwargs))
    exporter.compact_slice(
        leaf_areas_m2=[0.1, 0.2, 0.3], absorbed_factors=[0.2, 0.5, 0.8], ppfd=0,
    )
    assert captured["absorbed_factors"] == [0]
    assert captured["leaf_areas_m2"] == pytest.approx([0.6])
