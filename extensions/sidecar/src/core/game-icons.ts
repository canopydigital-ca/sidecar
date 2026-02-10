
/**
 * Utility to generate URLs for game-icons.net icons.
 * This avoids bundling thousands of SVG files in the extension.
 *
 * Usage:
 * const url = getGameIconUrl("falling-boulder", "lorc");
 * // -> https://game-icons.net/icons/ffffff/000000/1x1/lorc/falling-boulder.svg
 */

export const GAME_ICONS_BASE_URL = "dist/vendor/game-icons.net";

export interface GameIconOptions {
  /** Background color (hex without #, or 'transparent'). Default 'ffffff' */
  bg?: string;
  /** Foreground color (hex without #). Default '000000' */
  fg?: string;
}

/**
 * Returns the URL for a game-icon.net icon.
 * NOTE: This requires the CSP to allow `img-src 'self'`.
 *
 * @param name The icon name (kebab-case), e.g. "falling-boulder"
 * @param author The author name, e.g. "lorc", "delapouite". Defaults to "lorc".
 * @param options Styling options (Ignored for local assets path, handled by consumer)
 */
export function getGameIconUrl(name: string, author: string = 'lorc', options: GameIconOptions = {}) {
  // We only have one set of local assets (ffffff/000000), so we ignore options for the path.
  // Consumers must apply colors via CSS/SVG manipulation.
  return `${GAME_ICONS_BASE_URL}/ffffff/000000/1x1/${author}/${name}.svg`;
}
