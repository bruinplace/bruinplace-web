#!/usr/bin/env python3
"""
Find listing IDs backed by at least one image (listing or property image).

Run with backend venv so SQLAlchemy deps are available:
  ../bruinplace-backend/.venv/bin/python scripts/find_image_backed_listing_ids.py
"""

from __future__ import annotations

import argparse
import json
import os
import random
import sys
from pathlib import Path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--backend-dir",
        default="../bruinplace-backend",
        help="Path to bruinplace-backend directory",
    )
    parser.add_argument(
        "--count",
        type=int,
        default=12,
        help="Number of IDs to output",
    )
    parser.add_argument(
        "--seed",
        type=int,
        default=None,
        help="Optional random seed for deterministic output",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    backend_dir = Path(args.backend_dir).resolve()
    if not (backend_dir / "app").exists():
        print(f"Backend directory not found: {backend_dir}", file=sys.stderr)
        return 1

    os.chdir(backend_dir)
    sys.path.insert(0, str(backend_dir))

    from sqlalchemy import or_  # pylint: disable=import-error

    from app.api.v1.images.models import (  # pylint: disable=import-error
        ListingImage,
        PropertyImage,
    )
    from app.api.v1.listings.models import (  # pylint: disable=import-error
        Listing,
        ListingStatus,
    )
    from app.db.session import SessionLocal  # pylint: disable=import-error

    db = SessionLocal()
    try:
        has_listing_image = (
            db.query(ListingImage.id)
            .filter(ListingImage.listing_id == Listing.id)
            .exists()
        )
        has_property_image = (
            db.query(PropertyImage.id)
            .filter(PropertyImage.property_id == Listing.property_id)
            .exists()
        )

        rows = (
            db.query(Listing.id)
            .filter(Listing.deleted_at.is_(None))
            .filter(Listing.status == ListingStatus.ACTIVE)
            .filter(or_(has_listing_image, has_property_image))
            .all()
        )
        ids = [str(row[0]) for row in rows]
    finally:
        db.close()

    rng = random.Random(args.seed)
    rng.shuffle(ids)
    selected = ids[: max(args.count, 0)]

    print(f"Found {len(ids)} active image-backed listings.")
    print(f"Selected {len(selected)} IDs.")
    print()
    print(json.dumps(selected, indent=2))
    print()
    print("TypeScript:")
    print("const HARD_CODED_LISTING_IDS = [")
    for listing_id in selected:
        print(f'  "{listing_id}",')
    print("] as const;")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
