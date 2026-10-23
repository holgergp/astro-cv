#!/usr/bin/env sh
# Run `playwright test` in the same container image that CI uses, so screenshots
# render exactly like the baselines in tests/screenshots/ (local browsers differ
# by a few anti-aliased pixels). Arguments go to `playwright test`.
set -eu

version=$(node -p "require('./package.json').devDependencies['@playwright/test']")
image="mcr.microsoft.com/playwright:v$version-noble"

if command -v podman >/dev/null 2>&1; then
  # Rootless podman maps the container's root user to the current user
  engine="podman"
  user_args=""
elif command -v docker >/dev/null 2>&1; then
  engine="docker"
  user_args="--user $(id -u):$(id -g) -e HOME=/tmp"
else
  echo "Needs podman or docker" >&2
  exit 1
fi

# The anonymous volume keeps the container's `npm ci` out of the host's
# node_modules; `:z` lets the container access the repo under SELinux
# shellcheck disable=SC2086
"$engine" run --rm --ipc=host $user_args \
  -v "$PWD":/work:z -v /work/node_modules -w /work \
  -e CI=1 -e PLAYWRIGHT_HTML_OPEN=never \
  "$image" \
  sh -c 'npm ci --no-audit --no-fund && npm run build && npx playwright test "$@"' sh "$@"
