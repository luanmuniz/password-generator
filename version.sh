#!/usr/bin/env bash

set -euo pipefail

changelog_temporary_file=''
pull_request_body=''

cleanup() {
	if [[ -n "$changelog_temporary_file" ]]; then
		rm -f "$changelog_temporary_file"
	fi

	if [[ -n "$pull_request_body" ]]; then
		rm -f "$pull_request_body"
	fi
}

trap cleanup EXIT

usage() {
	echo 'Usage: bash version.sh {patch|minor|major}' >&2
}

if [[ $# -ne 1 ]]; then
	usage
	exit 1
fi

release_type="$1"

case "$release_type" in
	patch|minor|major) ;;
	*)
		usage
		exit 1
		;;
esac

script_directory="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$script_directory"

if [[ "$(git rev-parse --show-toplevel)" != "$script_directory" ]]; then
	echo 'version.sh must be located at the repository root.' >&2
	exit 1
fi

default_branch='master'
current_branch="$(git branch --show-current)"

if [[ "$current_branch" != "$default_branch" ]]; then
	echo "Switch to $default_branch before preparing a release." >&2
	exit 1
fi

if [[ -n "$(git status --porcelain)" ]]; then
	echo 'Commit or stash all changes before preparing a release.' >&2
	exit 1
fi

if ! git remote get-url origin >/dev/null 2>&1; then
	echo 'The repository must have an origin remote.' >&2
	exit 1
fi

if ! command -v gh >/dev/null 2>&1; then
	echo 'GitHub CLI must be installed to create the release pull request.' >&2
	exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
	echo 'Authenticate GitHub CLI before preparing a release.' >&2
	exit 1
fi

pull_request_template='.github/PULL_REQUEST_TEMPLATE/release.md'

if [[ ! -f "$pull_request_template" ]]; then
	echo "Missing pull request template: $pull_request_template" >&2
	exit 1
fi

git fetch origin --tags

if [[ "$(git rev-parse HEAD)" != "$(git rev-parse "origin/$default_branch")" ]]; then
	echo "Local $default_branch must match origin/$default_branch before preparing a release." >&2
	exit 1
fi

current_version="$(npm pkg get version | tr -d '"')"

if ! grep -Fqx '### Unreleased' CHANGELOG.md; then
	echo 'CHANGELOG.md must contain a "### Unreleased" heading.' >&2
	exit 1
fi

if ! grep -Fqx 'Future Features' CHANGELOG.md; then
	echo 'CHANGELOG.md must contain a "Future Features" heading.' >&2
	exit 1
fi

echo "Preparing a $release_type release from $current_version"
npm ci
npm test
npm pack --dry-run

preparation_branch="release/prepare-$release_type-$(date +%s)"
git switch -c "$preparation_branch"
npm version "$release_type" --no-git-tag-version --ignore-scripts
next_version="$(npm pkg get version | tr -d '"')"
release_branch="release/v$next_version"

echo "Prepared $current_version -> $next_version"

if git show-ref --verify --quiet "refs/heads/$release_branch" || git show-ref --verify --quiet "refs/remotes/origin/$release_branch"; then
	echo "Release branch $release_branch already exists." >&2
	exit 1
fi

git branch -m "$release_branch"

changelog_temporary_file="$(mktemp)"
pull_request_body="$(mktemp)"

while IFS= read -r changelog_line || [[ -n "$changelog_line" ]]; do
	if [[ "$changelog_line" == '### Unreleased' ]]; then
		printf '### Version %s\n' "$next_version"
	elif [[ "$changelog_line" == 'Future Features' ]]; then
		printf '### Unreleased\n\n'
		printf '%s\n' "$changelog_line"
	else
		printf '%s\n' "$changelog_line"
	fi
done < CHANGELOG.md > "$changelog_temporary_file"

mv "$changelog_temporary_file" CHANGELOG.md
sed "s/{{VERSION}}/$next_version/g" "$pull_request_template" > "$pull_request_body"

git add package.json package-lock.json CHANGELOG.md
git commit -m "chore: prepare release $next_version"
git push --set-upstream origin "$release_branch"

gh pr create --title "Release v$next_version" --body-file "$pull_request_body" --base "$default_branch" --head "$release_branch"

echo
echo "Release v$next_version is prepared on $release_branch."
echo "  After merging, publish GitHub Release v$next_version from the merge commit."
