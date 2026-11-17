"""Detect whether a Steam update has invalidated the recorded effect audit.
This verifies source fingerprints, not game runtime behavior or translations.
"""
import argparse
import hashlib
import json
from pathlib import Path
import zipfile


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--mod-root', type=Path, required=True)
    parser.add_argument('--game-scripts', type=Path, required=True, help='DST data/databundles/scripts.zip')
    args = parser.parse_args()
    root = Path(__file__).resolve().parent
    audit = json.loads((root / 'sources/side-effects-audit-2026-11-11.json').read_text(encoding='utf-8'))
    mismatches = []
    with zipfile.ZipFile(args.game_scripts) as archive:
        for source, record in audit['sources'].items():
            kind, name = source.split(':', 1)
            try:
                content = archive.read(name) if kind == 'base' else (args.mod_root / name).read_bytes()
            except (OSError, KeyError):
                mismatches.append(source + ' (missing)')
                continue
            if hashlib.sha256(content).hexdigest() != record['sha256']:
                mismatches.append(source + ' (changed)')
    if mismatches:
        print('Source changes detected; review affected effects before reusing the old numbers:')
        print('\n'.join(mismatches))
        return 1
    print(f"All {len(audit['sources'])} source fingerprints match the {audit['checked_on']} audit.")
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
