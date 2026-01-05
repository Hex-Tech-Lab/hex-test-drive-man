#!/usr/bin/env python3
"""
Schema Validator - Database Migration Safety Tool

Detects schema drift between production database and migration files,
validates migration safety, and ensures rollback scripts exist.

Usage:
    python scripts/validate-schema.py detect-drift
    python scripts/validate-schema.py validate --migration supabase/migrations/20251211_booking_schema.sql
    python scripts/validate-schema.py check-rollbacks

Author: CC (Claude Code)
Date: 2026-01-05
Version: 1.0 (MVP - Drift Detection Only)
"""

import json
import os
import re
import subprocess
import sys
from pathlib import Path
from typing import Dict, List, Optional, Tuple

# Configuration
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL", "")
SUPABASE_ANON_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "")
MIGRATIONS_DIR = "supabase/migrations"


class SchemaValidator:
    """Validates database schema and migration safety."""

    def __init__(self):
        """Initialize schema validator."""
        if not SUPABASE_URL or not SUPABASE_ANON_KEY:
            print("⚠️  Warning: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY not set")
            print("   Schema validation will use limited API access")

    def get_table_list(self) -> List[str]:
        """
        Get list of tables from Supabase via REST API.

        Returns:
            List of table names
        """
        if not SUPABASE_URL:
            return []

        try:
            # Query Supabase REST API root endpoint
            # Note: This is limited - full implementation would use SQL via pg_dump
            import urllib.request

            req = urllib.request.Request(
                f"{SUPABASE_URL}/rest/v1/",
                headers={"apikey": SUPABASE_ANON_KEY}
            )

            with urllib.request.urlopen(req, timeout=10) as response:
                # API returns JSON with table names as keys
                data = json.loads(response.read())
                return list(data.get("definitions", {}).keys())

        except Exception as e:
            print(f"⚠️  Failed to query Supabase schema: {e}")
            return []

    def parse_migration_file(self, migration_file: Path) -> Dict:
        """
        Parse migration SQL file to extract schema changes.

        Args:
            migration_file: Path to SQL migration file

        Returns:
            Dictionary with tables_created, columns_added, etc.
        """
        with open(migration_file, 'r') as f:
            sql_content = f.read()

        # Simple regex-based parsing (production would use SQL parser)
        tables_created = re.findall(
            r'CREATE TABLE\s+(\w+)',
            sql_content,
            re.IGNORECASE
        )

        tables_dropped = re.findall(
            r'DROP TABLE\s+(?:IF EXISTS\s+)?(\w+)',
            sql_content,
            re.IGNORECASE
        )

        return {
            "tables_created": tables_created,
            "tables_dropped": tables_dropped,
            "migration_file": str(migration_file)
        }

    def check_rollback_exists(self, migration_file: Path) -> Tuple[bool, Optional[Path]]:
        """
        Check if rollback script exists for migration.

        Args:
            migration_file: Path to migration SQL file

        Returns:
            (exists: bool, rollback_path: Optional[Path])
        """
        # Extract date prefix (e.g., "20251211" from "20251211_booking_schema.sql")
        filename = migration_file.name
        date_match = re.match(r'(\d+)_(.+)\.sql', filename)

        if not date_match:
            return (False, None)

        date_prefix = date_match.group(1)
        base_name = date_match.group(2)

        # Expected rollback filename
        rollback_filename = f"{date_prefix}_rollback_{base_name}.sql"
        rollback_path = migration_file.parent / rollback_filename

        return (rollback_path.exists(), rollback_path if rollback_path.exists() else None)

    def validate_migration(self, migration_file: str) -> Tuple[bool, List[str]]:
        """
        Validate migration safety before application.

        Args:
            migration_file: Path to migration SQL file

        Returns:
            (is_safe: bool, issues: List[str])
        """
        migration_path = Path(migration_file)
        issues = []

        # Check 1: Migration file exists
        if not migration_path.exists():
            return (False, [f"❌ Migration file not found: {migration_file}"])

        # Check 2: Rollback script exists
        has_rollback, rollback_path = self.check_rollback_exists(migration_path)
        if not has_rollback:
            issues.append(
                f"❌ Rollback script missing (expected: {migration_path.parent / (migration_path.stem.replace('_', '_rollback_', 1) + '.sql')})"
            )

        # Check 3: Parse migration for dangerous operations
        migration_data = self.parse_migration_file(migration_path)

        if migration_data["tables_dropped"]:
            issues.append(
                f"⚠️  WARNING: Migration drops tables: {', '.join(migration_data['tables_dropped'])}"
            )
            issues.append(
                "   This is a HIGH RISK operation - ensure backup exists first"
            )

        # Check 4: Verify tables don't already exist (would cause conflict)
        existing_tables = self.get_table_list()
        for table in migration_data["tables_created"]:
            if table in existing_tables:
                issues.append(
                    f"⚠️  Table '{table}' already exists in database (migration may fail)"
                )

        is_safe = len([i for i in issues if i.startswith("❌")]) == 0

        return (is_safe, issues)

    def detect_drift(self) -> List[str]:
        """
        Detect schema drift between production and migrations.

        Returns:
            List of drift descriptions
        """
        drifts = []

        # Get actual tables from Supabase
        actual_tables = set(self.get_table_list())

        # Get expected tables from migrations
        expected_tables = set()
        migrations_path = Path(MIGRATIONS_DIR)

        if migrations_path.exists():
            for migration_file in sorted(migrations_path.glob("*.sql")):
                if "rollback" in migration_file.name:
                    continue

                migration_data = self.parse_migration_file(migration_file)
                expected_tables.update(migration_data["tables_created"])
                expected_tables.difference_update(migration_data["tables_dropped"])

        # Find tables in migrations but not in production
        missing_tables = expected_tables - actual_tables
        for table in missing_tables:
            drifts.append(
                f"⚠️  Table '{table}' defined in migrations but missing in production"
            )

        # Find tables in production but not in migrations
        undocumented_tables = actual_tables - expected_tables
        for table in undocumented_tables:
            drifts.append(
                f"⚠️  Table '{table}' exists in production but not documented in migrations"
            )

        return drifts

    def check_all_rollbacks(self) -> Tuple[int, int, List[str]]:
        """
        Check if all migrations have corresponding rollback scripts.

        Returns:
            (total_migrations: int, missing_rollbacks: int, issues: List[str])
        """
        migrations_path = Path(MIGRATIONS_DIR)
        if not migrations_path.exists():
            return (0, 0, ["⚠️  Migrations directory not found"])

        migration_files = [
            f for f in sorted(migrations_path.glob("*.sql"))
            if "rollback" not in f.name
        ]

        total = len(migration_files)
        missing = 0
        issues = []

        for migration_file in migration_files:
            has_rollback, _ = self.check_rollback_exists(migration_file)
            if not has_rollback:
                missing += 1
                issues.append(f"❌ Missing rollback for: {migration_file.name}")

        return (total, missing, issues)


def main():
    """CLI interface for schema validation."""
    import argparse

    parser = argparse.ArgumentParser(
        description="Schema Validator - Database Migration Safety Tool"
    )
    subparsers = parser.add_subparsers(dest='command', help='Commands')

    # Detect drift command
    subparsers.add_parser('detect-drift', help='Detect schema drift between production and migrations')

    # Validate migration command
    validate_parser = subparsers.add_parser('validate', help='Validate migration safety')
    validate_parser.add_argument('--migration', required=True, help='Path to migration SQL file')

    # Check rollbacks command
    subparsers.add_parser('check-rollbacks', help='Check if all migrations have rollback scripts')

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        sys.exit(1)

    validator = SchemaValidator()

    if args.command == 'detect-drift':
        drifts = validator.detect_drift()
        if drifts:
            print("⚠️  Schema Drift Detected:")
            for drift in drifts:
                print(f"  {drift}")
            sys.exit(1)
        else:
            print("✅ No schema drift detected - production matches migrations")
            sys.exit(0)

    elif args.command == 'validate':
        is_safe, issues = validator.validate_migration(args.migration)

        if issues:
            print(f"Migration Validation: {args.migration}")
            for issue in issues:
                print(f"  {issue}")

        if is_safe:
            print("✅ Migration appears safe to apply")
            sys.exit(0)
        else:
            print("❌ Migration has blocking issues - fix before applying")
            sys.exit(1)

    elif args.command == 'check-rollbacks':
        total, missing, issues = validator.check_all_rollbacks()

        print(f"📋 Rollback Script Status:")
        print(f"  Total migrations: {total}")
        print(f"  Missing rollbacks: {missing}")

        if issues:
            print("")
            for issue in issues:
                print(f"  {issue}")

        if missing == 0:
            print("✅ All migrations have rollback scripts")
            sys.exit(0)
        else:
            print(f"❌ {missing} migration(s) missing rollback scripts")
            sys.exit(1)


if __name__ == "__main__":
    main()
