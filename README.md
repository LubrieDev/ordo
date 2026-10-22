# Ordo

Ordo is a minimal [Obsidian](https://obsidian.md) theme with dark and light color schemes, cool gray surfaces, soft shadows, and rounded corners. Brighter borders and deeper shadows indicate focus.

## Installation

### Manual

1. Download `theme.css` and `manifest.json` from the latest [release](https://github.com/LubrieDev/ordo/releases).
2. Put both files in `<vault>/.obsidian/themes/Ordo/` and restart Obsidian. The folder name must exactly match the `name` in `manifest.json`, including capitalization.

## Usage

Select **ordo** under **Settings → Appearance → Themes**. It supports both dark and light base color schemes and requires **Obsidian 1.13.0+**.

## Development

Edit `src/theme.css`, which contains the readable source and English comments. The root `theme.css` is generated for distribution.

```sh
npm ci
npm run build
npm run check:build
```

The build removes explanatory comments and formatting whitespace while preserving CSS rules, Style Settings metadata, and required lint directives. Commit both the source and generated CSS after making changes.

## License

MIT — see [LICENSE](https://github.com/LubrieDev/ordo/blob/main/LICENSE).
