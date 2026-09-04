#!/usr/bin/env bash

set -euo pipefail

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

git fetch origin --tags

if [[ "$(git rev-parse HEAD)" != "$(git rev-parse "origin/$default_branch")" ]]; then
	echo "Local $default_branch must match origin/$default_branch before preparing a release." >&2
	exit 1
fi

current_version="$(node -p "require('./package.json').version")"
next_version="$(node - "$release_type" <<'NODE'
const releaseType = process.argv[2];
const currentVersion = require('./package.json').version;
const match = currentVersion.match(/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/);

if (!match) {
	console.error(`Unsupported current version: ${currentVersion}`);
	process.exit(1);
}

let [, major, minor, patch] = match.map(Number);

if (releaseType === 'major') {
	major += 1;
	minor = 0;
	patch = 0;
} else if (releaseType === 'minor') {
	minor += 1;
	patch = 0;
} else {
	patch += 1;
}

process.stdout.write(`${major}.${minor}.${patch}`);
NODE
)"
release_branch="release/v$next_version"

if git show-ref --verify --quiet "refs/heads/$release_branch" || git show-ref --verify --quiet "refs/remotes/origin/$release_branch"; then
	echo "Release branch $release_branch already exists." >&2
	exit 1
fi

if ! grep -Fqx '### Unreleased' CHANGELOG.md; then
	echo 'CHANGELOG.md must contain a "### Unreleased" heading.' >&2
	exit 1
fi

if ! grep -Fqx 'Future Features' CHANGELOG.md; then
	echo 'CHANGELOG.md must contain a "Future Features" heading.' >&2
	exit 1
fi

echo "Preparing $current_version -> $next_version"
npm ci
npm test

git switch -c "$release_branch"
npm version "$next_version" --no-git-tag-version --ignore-scripts

node - "$next_version" <<'NODE'
const { readFileSync, writeFileSync } = require('node:fs');

const version = process.argv[2];
const changelogPath = 'CHANGELOG.md';
const changelog = readFileSync(changelogPath, 'utf8');
const futureFeaturesHeading = '\nFuture Features\n';
const versionedChangelog = changelog.replace('### Unreleased', `### Version ${version}`);

writeFileSync(changelogPath, versionedChangelog.replace(futureFeaturesHeading, `\n### Unreleased\n${futureFeaturesHeading}`));
NODE

git add package.json package-lock.json CHANGELOG.md
git commit -m "chore: prepare release $next_version"
git push --set-upstream origin "$release_branch"

gh pr create --title "Release v$next_version" --body "This pull request prepares the release of v$next_version." --base "$default_branch" --head "$release_branch"

echo
echo "Release v$next_version is prepared on $release_branch."
echo "  After merging, publish GitHub Release v$next_version from the merge commit."
