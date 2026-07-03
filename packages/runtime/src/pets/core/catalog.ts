export const PETS_CATALOG: Record<string, string[]> = {
  chicken: ["white"],
  clippy: ["black", "brown", "green", "yellow"],
  cockatiel: ["gray"],
  crab: ["red"],
  deno: ["green"],
  dog: ["akita", "black", "brown", "red", "white"],
  fox: ["red", "white"],
  horse: ["black", "brown", "magical", "paint_beige", "paint_black", "paint_brown", "socks_beige", "socks_black", "socks_brown", "warrior", "white"],
  mod: ["purple"],
  morph: ["purple"],
  panda: ["black", "brown"],
  rat: ["brown", "gray", "white"],
  rocky: ["gray"],
  "rubber-duck": ["yellow"],
  snake: ["green"],
  totoro: ["gray"],
  zappy: ["yellow"]
};

export const DEFAULT_PET_TYPE = "snake";
export const DEFAULT_PET_COLOR = "green";

export function sanitizePetSelection(type: unknown, color: unknown) {
  const t = typeof type === "string" ? type.trim() : "";
  const colors = PETS_CATALOG[t];
  if (!colors) {
    return { type: DEFAULT_PET_TYPE, color: DEFAULT_PET_COLOR };
  }

  const c = typeof color === "string" ? color.trim() : "";
  if (!c || !colors.includes(c)) {
    return { type: t, color: colors[0] };
  }

  return { type: t, color: c };
}

