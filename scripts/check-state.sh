#!/usr/bin/env bash
set -u

ROOT_DIR="${HARNESS_STATE_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
MODE="warning"

for arg in "$@"; do
  case "$arg" in
    --strict)
      MODE="strict"
      ;;
    --repair-scope)
      MODE="repair-scope"
      ;;
    *)
      echo "check-state: unknown argument: $arg" >&2
      exit 2
      ;;
  esac
done

WARNINGS=0

warn() {
  WARNINGS=$((WARNINGS + 1))
  echo "WARN: $*"
}

pass() {
  echo "PASS: $*"
}

require_file() {
  local path="$1"
  if [[ -f "$ROOT_DIR/$path" ]]; then
    pass "$path exists"
  else
    warn "$path is missing"
  fi
}

current_files=(
  "docs/current/PROJECT_CONTEXT.md"
  "docs/current/STORY_QUEUE.yaml"
  "docs/current/ACTIVE_TASKS.yaml"
  "docs/current/BLOCKERS.md"
  "docs/registry/TRACE_INDEX.yaml"
  "docs/registry/DECISION_INDEX.yaml"
)

for file in "${current_files[@]}"; do
  require_file "$file"
done

story_file="$ROOT_DIR/docs/current/STORY_QUEUE.yaml"
task_file="$ROOT_DIR/docs/current/ACTIVE_TASKS.yaml"
trace_file="$ROOT_DIR/docs/registry/TRACE_INDEX.yaml"
project_context_file="$ROOT_DIR/docs/current/PROJECT_CONTEXT.md"

extract_ids() {
  local file="$1"
  awk '
    /^[[:space:]]*(-[[:space:]]*)?id:[[:space:]]*/ {
      value=$0
      sub(/^[[:space:]]*(-[[:space:]]*)?id:[[:space:]]*/, "", value)
      gsub(/["'\'']/, "", value)
      gsub(/[[:space:]]+$/, "", value)
      if (value != "") print value
    }
  ' "$file" 2>/dev/null
}

duplicate_ids() {
  sort | uniq -d
}

if [[ -f "$story_file" ]]; then
  duplicate_story_ids="$(extract_ids "$story_file" | duplicate_ids)"
  if [[ -n "$duplicate_story_ids" ]]; then
    warn "duplicate story IDs in docs/current/STORY_QUEUE.yaml: $duplicate_story_ids"
  else
    pass "story IDs are unique"
  fi
fi

if [[ -f "$task_file" ]]; then
  duplicate_task_ids="$(extract_ids "$task_file" | duplicate_ids)"
  if [[ -n "$duplicate_task_ids" ]]; then
    warn "duplicate task IDs in docs/current/ACTIVE_TASKS.yaml: $duplicate_task_ids"
  else
    pass "task IDs are unique"
  fi
fi

if [[ -f "$story_file" ]]; then
  if grep -Eq '^[[:space:]]*status:[[:space:]]*["'\'']?done["'\'']?[[:space:]]*$' "$story_file"; then
    warn "docs/current/STORY_QUEUE.yaml must not retain done story history"
  else
    pass "current story queue does not retain done history"
  fi
fi

if [[ -f "$task_file" ]]; then
  if grep -Eq '^[[:space:]]*status:[[:space:]]*["'\'']?done["'\'']?[[:space:]]*$' "$task_file"; then
    warn "docs/current/ACTIVE_TASKS.yaml must not retain done task history"
  else
    pass "current active tasks do not retain done history"
  fi
fi

if [[ -f "$project_context_file" ]]; then
  done_history_markers="$(
    grep -Eic 'current queue returned to empty|current queue is empty after|completed .*then current queue returned to empty' "$project_context_file" || true
  )"
  if (( done_history_markers > 3 )); then
    warn "docs/current/PROJECT_CONTEXT.md contains accumulated done-history markers ($done_history_markers); move history to archive and keep only current state"
  else
    pass "PROJECT_CONTEXT.md keeps done-history markers within current-state budget"
  fi
fi

story_ids="$(extract_ids "$story_file" 2>/dev/null || true)"
task_story_refs="$(awk '
  /^[[:space:]]*story_ids:[[:space:]]*\[/ {
    value=$0
    sub(/^.*\[/, "", value)
    sub(/\].*$/, "", value)
    gsub(/["'\'' ]/, "", value)
    n=split(value, ids, ",")
    for (i=1; i<=n; i++) if (ids[i] != "") print ids[i]
  }
  /^[[:space:]]*-[[:space:]]*US[0-9]+/ {
    value=$0
    sub(/^[[:space:]]*-[[:space:]]*/, "", value)
    gsub(/["'\'']/, "", value)
    print value
  }
' "$task_file" 2>/dev/null || true)"

ready_story_ids="$(awk '
  /^[[:space:]]*(-[[:space:]]*)?id:[[:space:]]*/ {
    current=$0
    sub(/^[[:space:]]*(-[[:space:]]*)?id:[[:space:]]*/, "", current)
    gsub(/["'\'']/, "", current)
  }
  /^[[:space:]]*status:[[:space:]]*ready/ {
    if (current != "") print current
  }
' "$story_file" 2>/dev/null || true)"

for story_id in $ready_story_ids; do
  if printf '%s\n' "$task_story_refs" | grep -qx "$story_id"; then
    pass "ready story $story_id has an active task"
  else
    warn "ready story $story_id has no matching active task"
  fi
done

for task_story_id in $task_story_refs; do
  if printf '%s\n' "$story_ids" | grep -qx "$task_story_id"; then
    pass "active task references current story $task_story_id"
  else
    warn "active task references missing current story $task_story_id"
  fi
done

if [[ -f "$trace_file" ]]; then
  if grep -Eq '(^|[[:space:]])status[[:space:]]*:' "$trace_file"; then
    warn "docs/registry/TRACE_INDEX.yaml must not contain lifecycle state fields"
  else
    pass "TRACE_INDEX.yaml does not contain lifecycle state fields"
  fi

  while IFS= read -r path; do
    [[ -z "$path" ]] && continue
    if [[ -e "$ROOT_DIR/$path" ]]; then
      pass "registry path exists: $path"
    else
      warn "registry path missing: $path"
    fi
  done < <(awk '
    /^[[:space:]]*file:[[:space:]]*/ {
      value=$0
      sub(/^[[:space:]]*file:[[:space:]]*/, "", value)
      gsub(/["'\'']/, "", value)
      gsub(/[[:space:]]+$/, "", value)
      print value
    }
    /^[[:space:]]*(project_context|story_queue|active_tasks|blockers):[[:space:]]*/ {
      value=$0
      sub(/^[[:space:]]*[^:]+:[[:space:]]*/, "", value)
      gsub(/["'\'']/, "", value)
      gsub(/[[:space:]]+$/, "", value)
      print value
    }
  ' "$trace_file" | sort -u)
fi

if [[ -f "$story_file" ]] && grep -Eq 'docs/archive/|archive_file:' "$story_file"; then
  warn "current story queue must not use archive as execution entry"
else
  pass "current story queue does not execute from archive"
fi

line_budget_check() {
  local path="$1"
  local budget="$2"
  if [[ ! -f "$ROOT_DIR/$path" ]]; then
    return
  fi
  local lines
  lines="$(wc -l < "$ROOT_DIR/$path" | tr -d ' ')"
  if (( lines > budget )); then
    warn "$path has $lines lines, over budget $budget"
  else
    pass "$path line budget ok ($lines/$budget)"
  fi
}

line_budget_check "docs/current/PROJECT_CONTEXT.md" 160
line_budget_check "docs/current/STORY_QUEUE.yaml" 200
line_budget_check "docs/current/ACTIVE_TASKS.yaml" 220
line_budget_check "docs/current/BLOCKERS.md" 120

if (( WARNINGS > 0 )); then
  echo "check-state completed with $WARNINGS warning(s) in $MODE mode."
  if [[ "$MODE" == "strict" ]]; then
    exit 1
  fi
else
  echo "check-state passed in $MODE mode."
fi
