# SemVer Rules (for Trae AI builds)

> Recommended agent: Gemini 3 Pro 200k (or Kimi)
> Scope: Any files, bundles, templates, docs, or “deliverables” generated in this project.

## 1) We use Semantic Versioning (SemVer)
- Every release/deliverable has a version: `MAJOR.MINOR.PATCH`
- Versions are **non-negative integers**, **no leading zeroes** (`1.02.3` is invalid).
- Once a version is published, **never edit it**. Fixes = **new version**.

## 2) Define the “Public API” first
SemVer only means something if we agree what “breaking” means.
- Public API can be: exported functions/types, CLI flags, config schema, file layout, endpoints, template variables, etc.
- If users/other code depend on it, it’s API.

## 3) Version bump rules
Given `X.Y.Z`:

### PATCH (x.y.Z)
Bump PATCH when you ship **backward-compatible bug fixes only**.
- Fixes incorrect behavior without changing the public API.
- Example: `1.4.2 -> 1.4.3`

### MINOR (x.Y.z)
Bump MINOR when you add **backward-compatible functionality**.
- Includes adding new features that don’t break existing usage.
- Also bump MINOR when you **deprecate** public API (mark as discouraged but still supported).
- When MINOR bumps, reset PATCH to `0`.
- Example: `1.4.3 -> 1.5.0`

### MAJOR (X.y.z)
Bump MAJOR when you introduce **backward-incompatible changes** to the public API.
- May include MINOR and PATCH changes too.
- When MAJOR bumps, reset MINOR and PATCH to `0`.
- Example: `1.5.0 -> 2.0.0`

## 4) Special case: 0.y.z (initial development)
- `0.y.z` means “unstable, anything can change.”
- You can move fast here, but don’t pretend it’s stable.

## 5) Pre-releases and build metadata
### Pre-release
- Append `-` and identifiers: `1.2.0-alpha`, `1.2.0-rc.1`
- Identifiers: ASCII letters/digits/hyphens, dot-separated, not empty.
- **Pre-release has lower precedence** than the associated normal release.
  - `1.0.0-alpha < 1.0.0`

### Build metadata
- Append `+` and identifiers: `1.2.0+build.20260129`, `1.2.0-rc.1+sha.abc123`
- **Ignored for precedence** (ordering).
  - `1.0.0+001` and `1.0.0+exp.sha` are “equal” in precedence.

## 6) Precedence (how versions compare)
Order versions by:
1) Compare `MAJOR`, then `MINOR`, then `PATCH` **numerically**.
2) If equal, compare **pre-release** identifiers (if present):
   - Pre-release < normal release
   - Compare dot parts left-to-right:
     - Numeric identifiers compare numerically
     - Non-numeric compare lexically (ASCII)
     - Numeric identifiers have **lower precedence** than non-numeric
     - If all equal so far, the longer set wins precedence
- Build metadata never affects precedence.

Examples:
- `1.0.0 < 2.0.0 < 2.1.0 < 2.1.1`
- `1.0.0-alpha < 1.0.0`
- `alpha < alpha.1 < alpha.beta < beta < beta.2 < beta.11 < rc.1 < (no prerelease)`

## 7) Project workflow rules (Trae AI)
When generating or updating artifacts:
- Always include the current version in:
  - `package.json` (if applicable), and/or a `VERSION` file, and/or header comment in primary entry files.
- Every change must include a bump decision:
  - **Breaking public API** -> MAJOR
  - **New compatible functionality / deprecation** -> MINOR
  - **Compatible bugfix only** -> PATCH
- If producing a “release bundle” (zip/folder drop), include a short `CHANGELOG` entry:
  - Added / Changed / Fixed / Deprecated / Removed / Security (only what applies)

## 8) Quick bump decision cheatsheet
- Rename/remove exported function/type/config key used by others -> **MAJOR**
- Change default behavior in a way that breaks existing consumers -> **MAJOR**
- Add a new optional parameter/config option -> **MINOR**
- Add a new endpoint/feature behind existing contract -> **MINOR**
- Fix parsing/logic/typo without changing contract -> **PATCH**
- Mark something deprecated (still works) -> **MINOR**
