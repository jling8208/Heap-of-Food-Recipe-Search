"""Import recipe translations from an installed Heap of Foods mod.

Usage: python import_mod_names.py --mod-root PATH
The generated JSON files are committed so the website works offline.
"""

import argparse
import json
import re
import zipfile
from pathlib import Path


ROOT = Path(__file__).resolve().parent
RECIPE_FILES = ("recipes.json", "recipes-warly.json", "recipes-keg.json", "recipes-jar.json")
NAME_LINE = re.compile(r'^\s*STRINGS\.NAMES\.([A-Z0-9_]+)\s*=\s*"((?:\\.|[^"\\])*)"', re.M)


def names_in(path):
    return {key.lower(): value for key, value in NAME_LINE.findall(path.read_text(encoding="utf-8-sig"))}


def vanilla_names_in(archive):
    with zipfile.ZipFile(archive) as bundle:
        text = bundle.read("scripts/strings.lua").decode("utf-8")
    start = re.search(r'^    NAMES\s*=\s*\{', text, re.M)
    if not start:
        raise ValueError("Vanilla names table not found")
    end = re.search(r'^    \},', text[start.end():], re.M)
    if not end:
        raise ValueError("Vanilla names table has no end")
    section = text[start.end():start.end() + end.start()]
    return {key.lower(): value for key, value in re.findall(r'^\s*([A-Z0-9_]+)\s*=\s*"((?:\\.|[^"\\])*)"', section, re.M)}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--mod-root", type=Path, required=True)
    parser.add_argument("--game-scripts", type=Path, help="Optional DST data/databundles/scripts.zip for vanilla item names")
    args = parser.parse_args()
    strings = args.mod_root / "scripts" / "strings"
    zh = names_in(strings / "localization_zht" / "hof_strings.lua")
    en = names_in(strings / "hof_strings.lua")
    recipe_ids = {row["name"] for file in RECIPE_FILES for row in json.loads((ROOT / file).read_text(encoding="utf-8"))}
    missing = sorted(recipe_ids - zh.keys())
    if missing:
        raise ValueError(f"Mod translations missing recipes: {missing}")
    recipe_names = {key: zh[key] for key in sorted(recipe_ids)}
    (ROOT / "recipe-names-zht.json").write_text(json.dumps(recipe_names, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    ingredient_ids = set(json.loads((ROOT / "ingredient-labels.json").read_text(encoding="utf-8")))
    vanilla = vanilla_names_in(args.game_scripts) if args.game_scripts else {}
    ingredient_names = {key: en.get(key, vanilla[key] if key in vanilla else "") for key in sorted(ingredient_ids & (en.keys() | vanilla.keys()))}
    ingredient_names.update({"tag_chickenegg": "Chicken Egg", "tag_spotspice": "Spot Spice"})
    (ROOT / "ingredient-labels-en.json").write_text(json.dumps(ingredient_names, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Imported {len(recipe_names)} Traditional Chinese recipe names and {len(ingredient_names)} English ingredient names.")


if __name__ == "__main__":
    main()
