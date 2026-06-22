#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

state_check_mode="${HARNESS_STATE_CHECK_MODE:-strict}"
case "$state_check_mode" in
  strict)
    bash scripts/check-state.sh --strict
    ;;
  repair-scope)
    bash scripts/check-state.sh --repair-scope
    ;;
  warning)
    bash scripts/check-state.sh
    ;;
  *)
    echo "unsupported HARNESS_STATE_CHECK_MODE: $state_check_mode" >&2
    echo "expected one of: strict, repair-scope, warning" >&2
    exit 1
    ;;
esac

script_tests=()
while IFS= read -r test_file; do
  script_tests+=("$test_file")
done < <(find scripts/tests -maxdepth 1 -name '*.test.mjs' -print | sort)

if (( ${#script_tests[@]} > 0 )); then
  if command -v node >/dev/null 2>&1; then
    node --test "${script_tests[@]}"
  else
    echo "node is unavailable; skipping scripts/tests/*.test.mjs" >&2
  fi
fi

if [[ -n "${HARNESS_LINT_COMMAND:-}" ]]; then
  bash -lc "$HARNESS_LINT_COMMAND"
fi

if [[ -n "${HARNESS_TYPECHECK_COMMAND:-}" ]]; then
  bash -lc "$HARNESS_TYPECHECK_COMMAND"
fi

if [[ -n "${HARNESS_TEST_COMMAND:-}" ]]; then
  bash -lc "$HARNESS_TEST_COMMAND"
fi

if [[ -n "${HARNESS_BUILD_COMMAND:-}" ]]; then
  bash -lc "$HARNESS_BUILD_COMMAND"
fi

bash -n scripts/check-state.sh

echo "Harness check passed"
