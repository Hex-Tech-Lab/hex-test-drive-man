#!/usr/bin/env python3
"""
Agent Coordination System - Multi-Agent Conflict Prevention

Provides file locking, task reservation, and real-time status broadcast
to prevent concurrent work conflicts in multi-agent environment.

Usage:
    python scripts/agent-coordination.py claim CLAUDE.md --agent CC
    python scripts/agent-coordination.py release CLAUDE.md --agent CC
    python scripts/agent-coordination.py check-conflicts --agent CC
    python scripts/agent-coordination.py list-locks

Author: CC (Claude Code)
Date: 2026-01-05
Version: 1.0 (MVP - File Locking Only)
"""

import json
import os
import sys
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional, Tuple

# Configuration
COORDINATION_FILE = "docs/AGENT_STATUS_REALTIME.json"
LOCK_TIMEOUT_MINUTES = 30
HEARTBEAT_TIMEOUT_MINUTES = 10

class AgentCoordination:
    """Manages multi-agent coordination via JSON file storage."""

    def __init__(self, coordination_file: str = COORDINATION_FILE):
        """
        Initialize coordination system.

        Args:
            coordination_file: Path to JSON file storing locks and status
        """
        self.coordination_file = Path(coordination_file)
        self._ensure_file_exists()

    def _ensure_file_exists(self) -> None:
        """Create coordination file with empty structure if doesn't exist."""
        if not self.coordination_file.exists():
            self.coordination_file.parent.mkdir(parents=True, exist_ok=True)
            initial_data = {
                "file_locks": {},
                "agent_status": {},
                "task_queue": []  # Future: Task reservation system
            }
            self._write_data(initial_data)

    def _read_data(self) -> Dict:
        """Read coordination data from JSON file."""
        try:
            with open(self.coordination_file, 'r') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            # Corrupted or missing file - reset to empty state
            return {"file_locks": {}, "agent_status": {}, "task_queue": []}

    def _write_data(self, data: Dict) -> None:
        """
        Write coordination data to JSON file atomically.

        Uses atomic rename strategy to prevent partial writes.
        """
        temp_file = self.coordination_file.with_suffix('.tmp')
        with open(temp_file, 'w') as f:
            json.dump(data, f, indent=2)
        temp_file.replace(self.coordination_file)

    def _is_expired(self, expires_at_str: str) -> bool:
        """Check if lock has expired."""
        expires_at = datetime.fromisoformat(expires_at_str.replace('Z', '+00:00'))
        return datetime.now(expires_at.tzinfo) > expires_at

    def _clean_expired_locks(self, data: Dict) -> Dict:
        """Remove expired locks from data."""
        expired = []
        for file_path, lock in data["file_locks"].items():
            if self._is_expired(lock["expires_at"]):
                expired.append(file_path)

        for file_path in expired:
            print(f"⏱️  Auto-released expired lock: {file_path} (was locked by {data['file_locks'][file_path]['agent']})")
            del data["file_locks"][file_path]

        return data

    def claim_file(self, agent_name: str, file_path: str, reason: str = "") -> Tuple[bool, str]:
        """
        Attempt to lock file for editing.

        Args:
            agent_name: Name of agent requesting lock (CC, BB, GC, etc.)
            file_path: Path to file to lock
            reason: Optional reason for locking (displayed to other agents)

        Returns:
            (success: bool, message: str)
        """
        data = self._read_data()
        data = self._clean_expired_locks(data)

        # Check if file already locked
        if file_path in data["file_locks"]:
            lock = data["file_locks"][file_path]
            if lock["agent"] == agent_name:
                return (True, f"✅ You already hold lock for {file_path}")
            else:
                expires_at = datetime.fromisoformat(lock["expires_at"].replace('Z', '+00:00'))
                remaining = (expires_at - datetime.now(expires_at.tzinfo)).total_seconds() / 60
                return (False,
                    f"❌ BLOCKED: {file_path} locked by {lock['agent']} "
                    f"({int(remaining)} min remaining)\n"
                    f"Reason: {lock.get('reason', 'No reason provided')}")

        # Acquire lock
        now = datetime.utcnow()
        expires_at = now + timedelta(minutes=LOCK_TIMEOUT_MINUTES)

        data["file_locks"][file_path] = {
            "agent": agent_name,
            "locked_at": now.isoformat() + 'Z',
            "expires_at": expires_at.isoformat() + 'Z',
            "reason": reason or f"Working on {file_path}"
        }

        self._write_data(data)
        return (True, f"✅ Lock acquired for {file_path} (expires in {LOCK_TIMEOUT_MINUTES} min)")

    def release_file(self, agent_name: str, file_path: str) -> Tuple[bool, str]:
        """
        Release file lock.

        Args:
            agent_name: Name of agent releasing lock
            file_path: Path to file to unlock

        Returns:
            (success: bool, message: str)
        """
        data = self._read_data()

        if file_path not in data["file_locks"]:
            return (False, f"⚠️  {file_path} is not locked (nothing to release)")

        lock = data["file_locks"][file_path]
        if lock["agent"] != agent_name:
            return (False,
                f"❌ Cannot release: {file_path} is locked by {lock['agent']}, not {agent_name}")

        del data["file_locks"][file_path]
        self._write_data(data)
        return (True, f"✅ Lock released for {file_path}")

    def check_conflicts(self, agent_name: str) -> List[str]:
        """
        Check if agent has any conflicts with other agents.

        Args:
            agent_name: Name of agent to check

        Returns:
            List of conflict messages (empty if no conflicts)
        """
        data = self._read_data()
        data = self._clean_expired_locks(data)

        conflicts = []
        for file_path, lock in data["file_locks"].items():
            if lock["agent"] != agent_name:
                conflicts.append(
                    f"⚠️  {file_path} is locked by {lock['agent']} "
                    f"(reason: {lock.get('reason', 'Unknown')})"
                )

        return conflicts

    def list_locks(self) -> List[Dict]:
        """
        List all active locks.

        Returns:
            List of lock dictionaries with file_path, agent, locked_at, expires_at
        """
        data = self._read_data()
        data = self._clean_expired_locks(data)

        locks = []
        for file_path, lock in data["file_locks"].items():
            locks.append({
                "file_path": file_path,
                "agent": lock["agent"],
                "locked_at": lock["locked_at"],
                "expires_at": lock["expires_at"],
                "reason": lock.get("reason", "")
            })

        return locks

    def force_unlock(self, file_path: str) -> Tuple[bool, str]:
        """
        Force unlock file (emergency use only).

        Args:
            file_path: Path to file to unlock

        Returns:
            (success: bool, message: str)
        """
        data = self._read_data()

        if file_path not in data["file_locks"]:
            return (False, f"⚠️  {file_path} is not locked")

        lock = data["file_locks"][file_path]
        del data["file_locks"][file_path]
        self._write_data(data)

        return (True,
            f"⚠️  Force unlock: {file_path} was locked by {lock['agent']} "
            f"(locked {lock['locked_at']})\n✅ Lock removed")

    def update_status(self, agent_name: str, status: str, current_file: str = "") -> None:
        """
        Update agent status (heartbeat).

        Args:
            agent_name: Name of agent
            status: Current status (ACTIVE, IDLE, etc.)
            current_file: File currently being worked on
        """
        data = self._read_data()

        now = datetime.utcnow()
        data["agent_status"][agent_name] = {
            "status": status,
            "current_file": current_file,
            "last_heartbeat": now.isoformat() + 'Z'
        }

        self._write_data(data)


def main():
    """CLI interface for agent coordination system."""
    import argparse

    parser = argparse.ArgumentParser(
        description="Agent Coordination System - Multi-Agent Conflict Prevention"
    )
    subparsers = parser.add_subparsers(dest='command', help='Commands')

    # Claim file command
    claim_parser = subparsers.add_parser('claim', help='Lock file for editing')
    claim_parser.add_argument('file', help='File path to lock')
    claim_parser.add_argument('--agent', required=True, help='Agent name (CC, BB, GC, etc.)')
    claim_parser.add_argument('--reason', default='', help='Reason for locking (displayed to other agents)')

    # Release file command
    release_parser = subparsers.add_parser('release', help='Release file lock')
    release_parser.add_argument('file', help='File path to unlock')
    release_parser.add_argument('--agent', required=True, help='Agent name')

    # Check conflicts command
    conflicts_parser = subparsers.add_parser('check-conflicts', help='Check for conflicts with other agents')
    conflicts_parser.add_argument('--agent', required=True, help='Agent name')

    # List locks command
    subparsers.add_parser('list-locks', help='List all active file locks')

    # Force unlock command
    unlock_parser = subparsers.add_parser('force-unlock', help='Force unlock file (emergency only)')
    unlock_parser.add_argument('file', help='File path to unlock')

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        sys.exit(1)

    coord = AgentCoordination()

    if args.command == 'claim':
        success, message = coord.claim_file(args.agent, args.file, args.reason)
        print(message)
        sys.exit(0 if success else 1)

    elif args.command == 'release':
        success, message = coord.release_file(args.agent, args.file)
        print(message)
        sys.exit(0 if success else 1)

    elif args.command == 'check-conflicts':
        conflicts = coord.check_conflicts(args.agent)
        if conflicts:
            print(f"⚠️  Conflicts detected for {args.agent}:")
            for conflict in conflicts:
                print(f"  {conflict}")
            sys.exit(1)
        else:
            print(f"✅ No conflicts for {args.agent}")
            sys.exit(0)

    elif args.command == 'list-locks':
        locks = coord.list_locks()
        if not locks:
            print("✅ No active file locks")
        else:
            print(f"📋 Active File Locks ({len(locks)}):")
            for lock in locks:
                print(f"  {lock['file_path']}")
                print(f"    Agent: {lock['agent']}")
                print(f"    Locked: {lock['locked_at']}")
                print(f"    Expires: {lock['expires_at']}")
                if lock['reason']:
                    print(f"    Reason: {lock['reason']}")
                print()
        sys.exit(0)

    elif args.command == 'force-unlock':
        success, message = coord.force_unlock(args.file)
        print(message)
        sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
