#!/usr/bin/env bash
# The only way to publish. Deploys from the main folder on `main`, one at a time.
set -euo pipefail
root="$(git rev-parse --show-toplevel)"
common="$(git rev-parse --git-common-dir)"
cd "$root"

if [ "$(git rev-parse --abbrev-ref HEAD)" != "main" ]; then
  echo "Refusing: deploy from the main branch in the main folder, not from a worktree."; exit 1
fi
if [ -n "$(git status --porcelain)" ]; then
  echo "Refusing: commit or stash changes first. Live must match a commit."; git status --short; exit 1
fi

lock="$common/deploy.lock"
if ! mkdir "$lock" 2>/dev/null; then
  echo "Another deploy is running (lock: $lock, held by: $(cat "$lock/owner" 2>/dev/null || echo unknown))."
  echo "If you're sure it's stale, remove that folder and retry."; exit 1
fi
echo "${AGENT_NAME:-unknown} $(date)" > "$lock/owner"
trap 'rm -rf "$lock"' EXIT

echo "Deploying $(git rev-parse --short HEAD): $(git log -1 --format=%s)"
npx base44 deploy --build -y
git tag -f "deployed" HEAD >/dev/null
echo "Tagged this commit as 'deployed'."
