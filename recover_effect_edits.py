"""Recover hand-edited side effect text from an older data.js without losing newer site data.

Run with --from-data PATH to review differences, then add --apply to merge them.
"""

import argparse
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parent


def read_data(path):
    text = path.read_text(encoding="utf-8-sig")
    prefix = "window.RECIPE_DATA = "
    if not text.startswith(prefix):
        raise ValueError(f"Not a recipe data.js file: {path}")
    return json.loads(text[len(prefix):].rstrip(" \r\n;"))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--from-data", type=Path, required=True)
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()
    old = read_data(args.from_data)
    current_path = ROOT / "data.js"
    current = read_data(current_path)
    sources_path = ROOT / "side-effects.json"
    audit_path = ROOT / "sources" / "side-effects-audit-2026-11-11.json"
    sources = json.loads(sources_path.read_text(encoding="utf-8"))
    audit = json.loads(audit_path.read_text(encoding="utf-8"))
    previous = {r["id"]: r.get("side_effect") for r in old["recipes"]}
    changes = []
    for recipe in current["recipes"]:
        recipe_id = recipe["id"]
        old_effect = previous.get(recipe_id)
        new_effect = recipe.get("side_effect")
        if old_effect is None or new_effect is None:
            continue
        old_zh = old_effect.get("zh")
        if not old_zh or recipe_id not in sources or recipe_id not in audit["entries"]:
            raise ValueError(f"Missing source or audit entry: {recipe_id}")
        if old_zh != new_effect["zh"]:
            changes.append((recipe_id, new_effect["zh"], old_zh))
            if args.apply:
                new_effect["zh"] = old_zh
                sources[recipe_id]["zh"] = old_zh
                audit["entries"][recipe_id]["zh"] = old_zh
    print(f"Recovered file: {len(old['recipes'])} recipes; {len(changes)} differing side effect descriptions")
    for recipe_id, current_zh, old_zh in changes:
        print(f"{recipe_id}\n  current: {current_zh}\n  recovered: {old_zh}")
    if args.apply and changes:
        sources_path.write_text(json.dumps(sources, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        audit_path.write_text(json.dumps(audit, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        current_path.write_text("window.RECIPE_DATA = " + json.dumps(current, ensure_ascii=False, separators=(",", ":")) + ";\n", encoding="utf-8")
        print(f"Applied {len(changes)} recovered descriptions to source JSON, audit JSON, and current data.js")


if __name__ == "__main__":
    main()
