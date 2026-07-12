# Changesets

Version bumps and changelogs are driven by [changesets](https://github.com/changesets/changesets).

If your PR changes user-facing behavior, run `pnpm changeset` and commit the generated file —
pick the bump (patch/minor) and write the changelog line a user would want to read. Docs-only and
internal-only changes don't need one.

On merge to `main`, the release workflow collects pending changesets into a "Version Packages" PR;
the maintainer merges that PR to publish.
