# Release v{{VERSION}}

## Summary

- Prepare `@luanmuniz/password-generator` v{{VERSION}} for publication.
- Update the package manifests and move the pending changelog entries into this release.

## Validation

- [x] `npm ci`
- [x] `npm test`
- [x] `npm pack --dry-run`

## Release checklist

- [ ] Review the changelog entries below and adjust them if needed.
- [ ] Merge this pull request into `master`.
- [ ] Publish GitHub Release `v{{VERSION}}` from the merge commit.
- [ ] Wait for the `Publish packages` workflow to complete.
- [ ] Inspect and approve the staged npm package.

## Suggested GitHub Release

**Title:** `v{{VERSION}}`

**Body:**

```markdown
## v{{VERSION}}

### Changes

- Summarize the user-facing changes from this release.

### Upgrade notes

- State any breaking changes or required upgrade steps.
```
