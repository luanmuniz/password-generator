# Performance comparison

From the project directory, run:

```sh
npm run bench
```

This compares the latest **local `master` commit** with the current working files,
including uncommitted changes. It does not fetch remotes, switch branches, or
modify either implementation. A temporary detached worktree holds the baseline
and is removed after success or a measurement failure. No dependencies are installed.

To pin another baseline or adjust the measurement time:

```sh
npm run bench -- --baseline <commit-or-ref>
npm run bench -- --rounds 20 --warmup 200 --duration 500
npm run bench -- --output benchmark-result.json
```

`--warmup` and `--duration` are milliseconds per scenario per round. Defaults are
10 rounds, 100 ms warm-up, and at least 200 ms measurement. Allow about 40 seconds
for the default run. Avoid editing the implementation while a comparison runs.

Each version runs sequentially in a fresh process using the same Node executable.
The order alternates each round. Both versions run the same six scenarios:
default generation, 52 unique letters, 1,024 characters with repetition, and
shuffling strings of lengths 16, 52, and 1,024. Before timing, each scenario checks
50 outputs for the expected length, composition, uniqueness, or shuffle contents.
Shuffle validation also checks the existing requirement that the output differs.
These checks do not establish statistical uniformity or cryptographic security.

Timing excludes startup, imports, and validation. It includes result consumption
and garbage collection during measured batches. Coverage collection is disabled
in measurement processes. Each process has a timeout so broken implementations
cannot stall the comparison indefinitely.

The report prints commit IDs, the current branch, Node version, platform, median
microseconds per operation, median absolute deviation (MAD) as a percentage, and
baseline/current speedup. Each sample is a batch average, not individual-call
latency. A speedup above 1 means the current code is faster. Run on an idle machine;
small differences relative to the variation should not be treated as improvements.
The command fails for incorrect output or execution errors, not timing regressions.

`--output` writes the same measurements as JSON, including a per-scenario
evaluation. A change of at least 5% is reported as improved or degraded; smaller
changes are reported as unchanged. Pull-request CI uses this output to update one
performance comment after the benchmark completes.

The same runner and scenarios test both implementations, so the baseline does not
need to contain benchmark files. This setup targets this package's dependency-free
CommonJS `index.js` entry point.
