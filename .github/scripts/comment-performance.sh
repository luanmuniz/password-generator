#!/usr/bin/env bash

set -euo pipefail

readonly MARKER='<!-- password-generator-performance -->'
readonly THRESHOLD_PERCENT=5
readonly EXPECTED_SCENARIOS='["Default password","52 unique letters","1024 characters, repetitions","Shuffle 16 characters","Shuffle 52 characters","Shuffle 1024 characters"]'

function fail() {
	echo "$1" >&2
	exit 1
}

for command in gh jq; do
	command -v "$command" > /dev/null || fail "Missing required command: $command"
done

: "${BENCHMARK_ARTIFACT_PATH:?BENCHMARK_ARTIFACT_PATH must be set}"
: "${BENCHMARK_WORKFLOW_SHA:?BENCHMARK_WORKFLOW_SHA must be set}"
: "${GH_REPO:?GH_REPO must be set}"

readonly pr_number_path="$BENCHMARK_ARTIFACT_PATH/benchmark-pr-number.txt"
readonly report_path="$BENCHMARK_ARTIFACT_PATH/benchmark-result.json"
readonly pr_number="$(< "$pr_number_path")"

[[ "$pr_number" =~ ^[1-9][0-9]*$ ]] || fail "Invalid pull request number: $pr_number"
[[ "$BENCHMARK_WORKFLOW_SHA" =~ ^[a-f0-9]{40}$ ]] || fail 'Invalid benchmark workflow commit'

if ! jq -e \
	--argjson expected_scenarios "$EXPECTED_SCENARIOS" \
	--argjson threshold "$THRESHOLD_PERCENT" '
		def valid_commit: type == "string" and test("^[a-f0-9]{40}$");
		def positive_number: type == "number" and . > 0 and . < 1000000000;
		.schemaVersion == 1
		and .thresholdPercent == $threshold
		and (.baseline.commit | valid_commit)
		and (.current.commit | valid_commit)
		and (.scenarios | type == "array"
			and length == ($expected_scenarios | length)
			and map(.name) == $expected_scenarios
			and all(.[]; (.baselineMicroseconds | positive_number)
				and (.currentMicroseconds | positive_number)))
	' "$report_path" > /dev/null; then
	fail 'Invalid performance benchmark report'
fi

pull_request="$(gh api --method GET "repos/$GH_REPO/pulls/$pr_number")"
jq -e --arg head "$BENCHMARK_WORKFLOW_SHA" --arg repository "$GH_REPO" \
	'.head.sha == $head and .base.repo.full_name == $repository' <<< "$pull_request" > /dev/null \
	|| fail 'Benchmark does not match the pull request'

merge_sha="$(jq -r '.current.commit' "$report_path")"
baseline_sha="$(jq -r '.baseline.commit' "$report_path")"
merge_commit="$(gh api --method GET "repos/$GH_REPO/commits/$merge_sha")"
jq -e --arg merge "$merge_sha" --arg base "$baseline_sha" --arg head "$BENCHMARK_WORKFLOW_SHA" \
	'.sha == $merge and [.parents[].sha] == [$base, $head]' <<< "$merge_commit" > /dev/null \
	|| fail 'Benchmark merge commit does not match the base and PR head'

read -r improved unchanged degraded < <(
	jq -r --argjson threshold "$THRESHOLD_PERCENT" '
		reduce .scenarios[] as $scenario (
			{ improved: 0, unchanged: 0, degraded: 0 };
			(($scenario.currentMicroseconds / $scenario.baselineMicroseconds - 1) * 100) as $change
			| if $change <= -$threshold then .improved += 1
				elif $change >= $threshold then .degraded += 1
				else .unchanged += 1
				end
		) | "\(.improved) \(.unchanged) \(.degraded)"
	' "$report_path"
)

if (( unchanged == 6 )); then
	evaluation='Performance kept the same in all 6 scenarios.'
else
	parts=()
	if (( improved > 0 )); then
		parts+=("improved in $improved scenario$([[ "$improved" == 1 ]] || echo s)")
	fi
	if (( unchanged > 0 )); then
		parts+=("kept the same in $unchanged scenario$([[ "$unchanged" == 1 ]] || echo s)")
	fi
	if (( degraded > 0 )); then
		parts+=("degraded in $degraded scenario$([[ "$degraded" == 1 ]] || echo s)")
	fi
	if (( ${#parts[@]} == 1 )); then
		evaluation="Performance ${parts[0]}."
	elif (( ${#parts[@]} == 2 )); then
		evaluation="Performance ${parts[0]}, and ${parts[1]}."
	else
		evaluation="Performance ${parts[0]}, ${parts[1]}, and ${parts[2]}."
	fi
fi

temporary_directory="$(mktemp -d)"
trap 'rm -rf "$temporary_directory"' EXIT
readonly body_path="$temporary_directory/comment.md"
readonly request_path="$temporary_directory/request.json"

{
	printf '%s\n\n' "$MARKER"
	printf '%s\n\n' '## Performance comparison'
	printf '%s\n\n' "$evaluation"
	printf 'Compared base `%s` with this PR\047s merge commit `%s`.\n\n' \
		"$(jq -r '.baseline.commit[:7]' "$report_path")" \
		"$(jq -r '.current.commit[:7]' "$report_path")"
	printf '%s\n' '| Scenario | Base µs/op | PR µs/op | Change | Evaluation |'
	printf '%s\n' '| --- | ---: | ---: | ---: | --- |'
	while IFS=$'\t' read -r name baseline current; do
		change_percent="$(awk -v baseline="$baseline" -v current="$current" 'BEGIN { printf "%.1f", (current / baseline - 1) * 100 }')"
		if awk -v change="$change_percent" -v threshold="$THRESHOLD_PERCENT" 'BEGIN { exit !(change <= -threshold) }'; then
			scenario_evaluation='Improved'
		elif awk -v change="$change_percent" -v threshold="$THRESHOLD_PERCENT" 'BEGIN { exit !(change >= threshold) }'; then
			scenario_evaluation='Degraded'
		else
			scenario_evaluation='Unchanged'
		fi
		printf '| %s | %.3f | %.3f | %s%% | %s |\n' "$name" "$baseline" "$current" "$change_percent" "$scenario_evaluation"
	done < <(jq -r '.scenarios[] | [.name, .baselineMicroseconds, .currentMicroseconds] | @tsv' "$report_path")
	printf '\nChanges below %s%% are treated as unchanged. Lower time is better.\n' "$THRESHOLD_PERCENT"
} > "$body_path"

comments="$(gh api --method GET --paginate --slurp "repos/$GH_REPO/issues/$pr_number/comments")"
existing_comment_id="$(jq -r --arg marker "$MARKER" '
	[.[] | .[] | select(.user.type? == "Bot" and (.body? | type == "string" and contains($marker)))][0].id // empty
' <<< "$comments")"

jq -n --rawfile body "$body_path" '{ body: $body }' > "$request_path"
if [[ -n "$existing_comment_id" ]]; then
	[[ "$existing_comment_id" =~ ^[1-9][0-9]*$ ]] || fail 'Invalid existing comment ID'
	gh api --silent --method PATCH "repos/$GH_REPO/issues/comments/$existing_comment_id" --input "$request_path"
else
	gh api --silent --method POST "repos/$GH_REPO/issues/$pr_number/comments" --input "$request_path"
fi
