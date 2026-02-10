# Semantic Versioning Policy

This project adheres to [Semantic Versioning 2.0.0](https://semver.org/).

## Version Format
`MAJOR.MINOR.PATCH`

- **MAJOR**: Incompatible API changes or significant rewrites.
- **MINOR**: Backward-compatible functionality (new features).
- **PATCH**: Backward-compatible bug fixes and tweaks.

## Release Process

1.  **Feature Commits**: Each major feature commit or significant update should bump the **PATCH** version (the furthest right value).
2.  **Documentation**: Update `docs/changelog.md` with the new version, date, and changes.
3.  **UI Notification**: The extension will automatically detect the version change and display the changelog to the user on the next reload.
4.  **Storage**: The user's dismissal of the changelog is stored. It will only reappear if the version changes or if settings are reset.
