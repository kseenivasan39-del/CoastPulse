"""
Command-Line Interface (CLI) for CoastPulse Scientific Processing Engine.
Usage:
    python -m coastpulse_engine.cli nisar-process --input <path> --output <path> [--tile-size 512] [--enl 4.8]
    python -m coastpulse_engine.cli inspect-metadata --input <path>
"""

import sys
import argparse
import json
from coastpulse_engine.pipelines.nisar_pipeline import NISARGCOVPipeline


def main():
    parser = argparse.ArgumentParser(
        prog="coastpulse-engine",
        description="CoastPulse Sensor-Specific Earth Observation Scientific Processing Engine",
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    # Subcommand: inspect-metadata
    insp_parser = subparsers.add_parser("inspect-metadata", help="Inspect raw radar file metadata without processing")
    insp_parser.add_argument("--input", "-i", required=True, help="Path to input HDF5 or GeoTIFF product")

    # Subcommand: nisar-process
    proc_parser = subparsers.add_parser("nisar-process", help="Execute sensor-specific NISAR GCOV tiled processing")
    proc_parser.add_argument("--input", "-i", required=True, help="Path to source NISAR GeoTIFF/HDF5")
    proc_parser.add_argument("--output", "-o", required=True, help="Destination Cloud Optimized GeoTIFF path")
    proc_parser.add_argument("--tile-size", type=int, default=512, help="CPU windowed tile block size (default: 512)")
    proc_parser.add_argument("--enl", type=float, default=4.8, help="Target Equivalent Number of Looks (ENL)")
    proc_parser.add_argument("--no-filter", action="store_true", help="Bypass Refined Lee speckle filter")

    args = parser.parse_args()
    pipeline = NISARGCOVPipeline(enl_target=args.enl if hasattr(args, "enl") else 4.8)

    if args.command == "inspect-metadata":
        try:
            meta = pipeline.inspect_metadata(args.input)
            print(json.dumps(meta, indent=2))
        except Exception as e:
            print(f"Error inspecting metadata: {e}", file=sys.stderr)
            sys.exit(1)

    elif args.command == "nisar-process":
        try:
            print(f"[CoastPulse Engine] Processing {args.input} -> {args.output}")
            res = pipeline.process_tiled(
                source_path=args.input,
                output_cog_path=args.output,
                tile_size=args.tile_size,
                apply_speckle_filter=not args.no_filter,
            )
            print("[CoastPulse Engine] Execution completed successfully:")
            print(json.dumps(res, indent=2))
        except Exception as e:
            print(f"[CoastPulse Engine] Job execution failed: {e}", file=sys.stderr)
            sys.exit(1)


if __name__ == "__main__":
    main()
