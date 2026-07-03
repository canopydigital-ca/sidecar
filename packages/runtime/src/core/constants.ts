export const DOCK_ID = "cgpt-dock";
export const POPOVER_ID = "cgpt-popover";
export const STATUS_ID = "cgpt-statusbar";
export const MODEL_SLOT_ID = "cgpt-model-slot";
export const INPUT_HANDLE_ID = "cgpt-input-resize-handle";
export const VERSION = "0.5.67";

// Feature Flags
// Set to true to enable new unified runtime boot sequence
export const USE_NEW_BOOT = true;

export const FLAGS = {
	wide: "cgpt-wide",
	collapseCode: "cgpt-collapse-code",
	statusbar: "cgpt-statusbar-on",
	fontOn: "cgpt-font-on",
	inputCollapsed: "cgpt-input-collapsed",
	hideThinking: "cgpt-hide-thinking"
};

export const SIDEBAR_MIN = 220;
export const SIDEBAR_MAX = 820;

export const INPUT_MIN = 44;
export const INPUT_MAX = 520;

export const DEFAULT_EMOJIS = [
	"😀", "😅", "😂", "🙂", "😉", "😍", "🥲", "😌", "😎", "🤔",
	"👍", "👏", "🙏", "🔥", "💡", "✅", "🧠", "🧪", "🛠️", "🧵",
	"⚠️", "🧹", "🧩", "📌", "📝", "🚀", "🎯", "🫠", "🤝", "💀"
];

export const SYSTEM_FONTS = [
	"Segoe UI", "Helvetica Neue", "Arial", "Roboto", "Open Sans", "Verdana", "Tahoma",
	"Trebuchet MS", "Georgia", "Times New Roman", "Courier New", "Consolas", "Impact",
	"Gill Sans", "Calibri", "Candara", "Segoe Print", "Segoe Script", "Comic Sans MS",
	"San Francisco", "Helvetica", "Lucida Grande", "Menlo", "Monaco", "Garamond",
	"Palatino", "Bookman", "Avant Garde", "Arial Black", "Arial Narrow", "Century Gothic"
];

export const POPULAR_GOOGLE_FONTS = [
	"Poppins", "Montserrat", "Oswald", "Raleway", "Nunito", "Merriweather", "Playfair Display",
	"Rubik", "Ubuntu", "Kanit", "Mukta", "Work Sans", "Quicksand", "Karla", "Inconsolata",
	"PT Sans", "Dosis", "Oxygen", "Space Mono", "Crimson Text", "Libre Baskerville", "Bitter",
	"Anton", "Josefin Sans", "Pacifico", "Shadows Into Light", "Dancing Script", "Amatic SC",
	"Lobster", "Comfortaa", "Bebas Neue", "Fjalla One", "Exo 2", "Righteous", "Fredoka One",
	"Abril Fatface", "Permanent Marker", "Audiowide", "Chakra Petch", "Slabo 27px", "Arvo",
	"Lato", "Lora", "Source Sans Pro", "Noto Sans", "Nunito Sans", "Fira Sans", "Josefin Slab",
	"Cabin", "Varela Round", "Hind", "Barlow", "Titillium Web", "Asap", "Cairo", "Signika",
	"Archivo", "Maven Pro", "Catamaran", "Questrial", "Muli", "Overpass", "IBM Plex Sans",
	"Exo", "Red Hat Display", "Cuprum", "Rokkitt", "Pathway Gothic One", "Francois One",
	"Vollkorn", "Old Standard TT", "Crete Round", "Patua One", "Playball", "Cookie", "Great Vibes"
];

export const PRESET_FONTS = [
	{ name: "System UI", css: null },
	{ name: "Inter", css: "https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" },
	{ name: "Roboto", css: "https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" },
	{ name: "Open Sans", css: "https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;700&display=swap" },
	{ name: "Lato", css: "https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap" },
	{ name: "Source Sans 3", css: "https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;700&display=swap" },
	{ name: "Noto Sans", css: "https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;700&display=swap" },
	{ name: "Merriweather", css: "https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap" },
	{ name: "IBM Plex Sans", css: "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;700&display=swap" },
	{ name: "JetBrains Mono", css: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap" },
	{ name: "Fira Code", css: "https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;700&display=swap" },
	{ name: "Comic Neue", css: "https://fonts.googleapis.com/css2?family=Comic+Neue:wght@400;700&display=swap" }
];

export const ICONS = {
	sidebar: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>`,
	sparkles: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
	wide: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>`,
	chevronDown: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>`,
	collapse: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 14 10 14 10 20"></polyline><polyline points="20 10 14 10 14 4"></polyline></svg>`,
	emoji: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>`,
	prompts: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`,
	save: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>`,
	trash: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`,
	fonts: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7V4h16v3M9 20h6M12 4v16"/></svg>`,
	settings: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`,
	help: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
	close: `&times;`
};
