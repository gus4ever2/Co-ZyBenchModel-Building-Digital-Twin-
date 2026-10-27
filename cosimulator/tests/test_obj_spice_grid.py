"""Tests that do not require the optional CARIBU/R runtime."""

from __future__ import annotations

from pathlib import Path
from tempfile import TemporaryDirectory
import unittest

from cosimulator.plant.obj_caribu_plantecophys_grid import (
    PlantParameters,
    _parse_leaf_triangles,
    normalise_obj_with_standard_mtl,
    write_standard_mtl,
)


class ObjSpiceGridTests(unittest.TestCase):
    def test_standard_obj_is_normalised_and_back_faces_are_not_double_counted(self) -> None:
        test_temp_root = Path(__file__).resolve().parent / ".test-tmp"
        test_temp_root.mkdir(exist_ok=True)
        with TemporaryDirectory(dir=test_temp_root) as directory:
            root = Path(directory)
            source = root / "uploaded.obj"
            target = root / "plant_model.obj"
            mtl = root / "plant_model.mtl"
            source.write_text(
                "\n".join((
                    "v 0 0 0", "v 1 0 0", "v 0 1 0", "",
                    "usemtl leaf_green", "f 1 2 3", "f 3 2 1", "",
                    "usemtl stem_green", "f 1 3 2", "",
                )),
                encoding="utf-8",
            )
            normalise_obj_with_standard_mtl(source, target, mtl.name)
            write_standard_mtl(mtl)
            _, triangles, _ = _parse_leaf_triangles(target)
            self.assertEqual(len(triangles), 1)
            self.assertTrue(target.read_text(encoding="utf-8").startswith("mtllib plant_model.mtl"))
            self.assertIn("newmtl leaf_green", mtl.read_text(encoding="utf-8"))

    def test_parameters_reject_nonphysical_optics(self) -> None:
        with self.assertRaises(ValueError):
            PlantParameters(0.8, 0.2, 14.0, 21.0, 0.75).validate()


if __name__ == "__main__":
    unittest.main()
