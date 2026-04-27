#!/usr/bin/env bash
# Publish all @hex-core/* packages to npm.
#
# See usage() below for flags and behavior.
set -euo pipefail

SECONDS=0

# ------------- colors + logging -------------
# Use $'...' so the vars hold actual ESC bytes; substituting these into
# printf %s arguments works on bash 3.2 (macOS default) where printf does
# not re-interpret backslash escapes in arguments.
if [[ -t 1 ]]; then
	GREEN=$'\033[0;32m'
	YELLOW=$'\033[1;33m'
	RED=$'\033[0;31m'
	BLUE=$'\033[0;34m'
	BOLD=$'\033[1m'
	NC=$'\033[0m'
else
	GREEN='' YELLOW='' RED='' BLUE='' BOLD='' NC=''
fi

log() { printf "${GREEN}→${NC} %s\n" "$*"; }
warn() { printf "${YELLOW}⚠${NC} %s\n" "$*"; }
err() { printf "${RED}✗${NC} %s\n" "$*" >&2; }
info() { printf "${BLUE}ℹ${NC} %s\n" "$*"; }

usage() {
	cat <<'EOF'
Publish all @hex-core/* packages to npm.

Usage:
  export NPM_TOKEN=npm_xxx
  ./scripts/publish-local.sh            # real publish
  ./scripts/publish-local.sh --dry-run  # simulate, no actual publish
  ./scripts/publish-local.sh --yes      # skip confirmations (non-interactive)
  ./scripts/publish-local.sh --help     # print this help

What it does:
  1. Validates NPM_TOKEN + working-tree state + current branch
  2. Creates a temporary .npmrc with mode 600 (auto-cleaned on exit)
  3. Verifies auth via npm whoami
  4. Builds all 5 @hex-core/* packages
  5. For each package in dependency order:
     - Skips if version already on npm (idempotent)
     - Otherwise publishes with --access=public
     - Aborts on first failure (dependents reference the registry)
  6. Prints a summary with npm URLs + elapsed time
EOF
}

# ------------- flags -------------
DRY_RUN_ARGS=()
ASSUME_YES=""
for arg in "$@"; do
	case "$arg" in
		--dry-run) DRY_RUN_ARGS+=("--dry-run"); warn "DRY RUN mode — no packages will be published" ;;
		--yes|-y) ASSUME_YES="1" ;;
		--help|-h) usage; exit 0 ;;
		*) err "Unknown flag: $arg"; usage; exit 1 ;;
	esac
done

is_dry_run() { [[ ${#DRY_RUN_ARGS[@]} -gt 0 ]]; }

confirm() {
	local prompt="$1"
	[[ -n "$ASSUME_YES" ]] && return 0
	if [[ ! -t 0 ]]; then
		err "Non-interactive shell and --yes not passed — cannot confirm."
		return 1
	fi
	local response
	read -r -p "${YELLOW}?${NC} $prompt [y/N] " response
	[[ "$response" =~ ^[yY]$ ]]
}

# ------------- preflight -------------
if [[ -z "${NPM_TOKEN:-}" ]]; then
	err "NPM_TOKEN is not set."
	echo "  Run: export NPM_TOKEN=npm_xxx"
	exit 1
fi

# pnpm is the publisher (rewrites workspace:^ in the tarball); npm is used for whoami
# and version probing. Both must be on PATH.
for cmd in pnpm npm; do
	if ! command -v "$cmd" >/dev/null 2>&1; then
		err "$cmd is not on PATH."
		exit 1
	fi
done

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

if ! is_dry_run && [[ -n "$(git status --porcelain)" ]]; then
	warn "Working tree has uncommitted changes:"
	git status --short | sed 's/^/    /'
	confirm "Continue anyway?" || { err "Aborted"; exit 1; }
fi

BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if ! is_dry_run && [[ "$BRANCH" != "main" ]]; then
	warn "Not on main branch (current: $BRANCH)"
	confirm "Continue anyway?" || { err "Aborted"; exit 1; }
fi

# ------------- auth setup -------------
NPMRC_PATH="$REPO_ROOT/.npmrc.publish-local"
cleanup() { rm -f "$NPMRC_PATH"; }
trap cleanup EXIT INT TERM HUP

# heredoc uses unquoted EOF so ${NPM_TOKEN} expands inside the file.
# umask 077 ensures the file is mode 600 — only the owner can read the token.
(
	umask 077
	cat > "$NPMRC_PATH" <<EOF
//registry.npmjs.org/:_authToken=${NPM_TOKEN}
registry=https://registry.npmjs.org/
EOF
)

log "Verifying npm auth..."
if ! WHO=$(npm whoami --userconfig="$NPMRC_PATH" 2>&1); then
	err "npm whoami failed: $WHO"
	err "Check that NPM_TOKEN is valid and not expired."
	exit 1
fi
info "Authenticated as: ${BOLD}$WHO${NC}"

# ------------- build -------------
BUILD_LOG=$(mktemp -t hex-core-build.XXXXXX)
log "Building packages..."
if ! pnpm --filter "@hex-core/*" build > "$BUILD_LOG" 2>&1; then
	err "Build failed. Full log:"
	cat "$BUILD_LOG"
	rm -f "$BUILD_LOG"
	exit 1
fi
rm -f "$BUILD_LOG"
info "All 5 packages built"

# ------------- publish loop -------------
# Order: registry first (others depend on it), then leaves.
PACKAGES=(
	"packages/registry"
	"packages/tokens"
	"packages/components"
	"packages/cli"
	"packages/mcp-server"
	"packages/preview"
)

PUBLISHED=()
SKIPPED=()
FAILED=()

# Return 0 if package@version is already on npm, 1 if not, 2 if indeterminate (network).
check_published() {
	local spec="$1"
	local view_out view_rc=0
	view_out=$(npm view "$spec" version --userconfig="$NPMRC_PATH" 2>&1) || view_rc=$?
	if [[ "$view_rc" -eq 0 && "$view_out" =~ ^[0-9]+\.[0-9]+\.[0-9]+ ]]; then
		return 0
	fi
	if [[ "$view_out" == *"code E404"* || "$view_out" == *"404 Not Found"* ]]; then
		return 1
	fi
	err "Cannot determine publish state of $spec: $view_out"
	return 2
}

for pkg in "${PACKAGES[@]}"; do
	name=$(node -p "require('./$pkg/package.json').name")
	version=$(node -p "require('./$pkg/package.json').version")
	spec="${name}@${version}"

	if ! is_dry_run; then
		check_rc=0
		check_published "$spec" || check_rc=$?
		case "$check_rc" in
			0)
				warn "$spec already on npm — skipping"
				SKIPPED+=("$spec")
				continue
				;;
			1) : ;; # not published, proceed
			2)
				err "Aborting — cannot verify $spec publish state."
				FAILED+=("$spec")
				break
				;;
		esac
	fi

	log "Publishing ${BOLD}${spec}${NC}..."
	PUBLISH_LOG=$(mktemp -t hex-core-publish.XXXXXX)
	# pnpm publish (not npm) so workspace:^ specifiers in package.json get rewritten to
	# pinned versions in the published tarball. npm publish leaves them as literals,
	# which breaks `npm install` outside pnpm workspaces (EUNSUPPORTEDPROTOCOL).
	# --no-git-checks: pnpm's git gates (clean tree, branch, remote-sync) overlap with
	# the manual preflight checks above; we accept the trade-off for local publishing —
	# the script's checks are warn-and-confirm, pnpm's would be hard-block.
	# NPM_CONFIG_USERCONFIG (env): pnpm 9.15 ignores --config.userconfig= as a CLI flag
	# for auth resolution and falls back to ~/.npmrc, causing ENEEDAUTH. The env var
	# is the only reliable path. Verified during v1.0.0 release.
	# Safe expansion for bash 3.2 with set -u: empty array errors otherwise.
	if (cd "$pkg" && NPM_CONFIG_USERCONFIG="$NPMRC_PATH" pnpm publish --access=public --no-git-checks ${DRY_RUN_ARGS[@]+"${DRY_RUN_ARGS[@]}"}) > "$PUBLISH_LOG" 2>&1; then
		# Output format differs between npm and pnpm; anchored pattern covers both
		# without surfacing stderr noise from unrelated lines.
		grep -E "^(npm notice|Publishing| \+ |.*tarball:|.*package size)" "$PUBLISH_LOG" | sed 's/^/    /' || true
		PUBLISHED+=("$spec")
		rm -f "$PUBLISH_LOG"
	else
		err "Failed to publish $spec"
		sed 's/^/    /' "$PUBLISH_LOG"
		rm -f "$PUBLISH_LOG"
		FAILED+=("$spec")
		err "Aborting — dependent packages reference this one."
		break
	fi
done

# ------------- summary -------------
echo ""
printf "${BOLD}Release summary${NC}  (elapsed: %ds)\n" "$SECONDS"
printf "  published: %d  skipped: %d  failed: %d\n" "${#PUBLISHED[@]}" "${#SKIPPED[@]}" "${#FAILED[@]}"

if [[ ${#PUBLISHED[@]} -gt 0 ]]; then
	echo ""
	echo "Published:"
	for p in "${PUBLISHED[@]}"; do
		pkg_name="${p%@*}"
		printf "  ${GREEN}✓${NC} %s  →  https://www.npmjs.com/package/%s\n" "$p" "$pkg_name"
	done
fi

if [[ ${#SKIPPED[@]} -gt 0 ]]; then
	echo ""
	echo "Skipped (already on npm):"
	for s in "${SKIPPED[@]}"; do
		printf "  ${YELLOW}-${NC} %s\n" "$s"
	done
fi

if [[ ${#FAILED[@]} -gt 0 ]]; then
	echo ""
	err "Failed:"
	for f in "${FAILED[@]}"; do
		printf "  ${RED}✗${NC} %s\n" "$f"
	done
	exit 1
fi

echo ""
if is_dry_run; then
	info "Dry run complete. Re-run without --dry-run to publish."
else
	log "Done."
fi
