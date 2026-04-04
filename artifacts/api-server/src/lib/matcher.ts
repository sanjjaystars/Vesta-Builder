/**
 * Outfit matching engine — rule-based scoring system.
 * Scores a pair of (top, bottom) clothing items from 0-10.
 */
import type { ClothingItem } from "@workspace/db";

// Bottom categories that count as "bottoms"
const BOTTOM_CATEGORIES = new Set([
  "pant",
  "jeans",
  "cargo",
  "pants",
  "trousers",
  "chinos",
  "shorts",
  "skirt",
]);

// Top categories that count as "tops"
const TOP_CATEGORIES = new Set([
  "shirt",
  "t-shirt",
  "top wear",
  "hoodie",
  "jacket",
  "blouse",
  "sweater",
  "top",
  "tshirt",
  "kurta",
]);

export function isBottom(item: ClothingItem): boolean {
  return BOTTOM_CATEGORIES.has(item.category.toLowerCase());
}

export function isTop(item: ClothingItem): boolean {
  return TOP_CATEGORIES.has(item.category.toLowerCase());
}

// Color compatibility map: bottom color -> list of compatible top colors
const COLOR_COMPAT: Record<string, string[]> = {
  black: ["white", "grey", "gray", "beige", "cream", "olive", "blue", "navy", "red", "yellow", "pink"],
  white: ["black", "navy", "blue", "grey", "gray", "beige", "olive", "red", "green", "maroon"],
  grey: ["white", "black", "navy", "blue", "maroon", "pink", "olive"],
  gray: ["white", "black", "navy", "blue", "maroon", "pink", "olive"],
  navy: ["white", "grey", "gray", "beige", "cream", "light blue", "yellow", "red"],
  blue: ["white", "grey", "gray", "beige", "black", "brown", "navy"],
  beige: ["white", "black", "navy", "brown", "olive", "maroon", "grey"],
  cream: ["black", "navy", "brown", "olive", "maroon", "grey"],
  brown: ["beige", "cream", "white", "olive", "khaki"],
  olive: ["white", "black", "beige", "cream", "navy", "grey"],
  khaki: ["white", "black", "navy", "olive", "brown"],
  maroon: ["white", "grey", "gray", "beige", "cream", "navy"],
  green: ["white", "beige", "cream", "brown", "khaki"],
  red: ["white", "grey", "gray", "black", "navy"],
  pink: ["white", "grey", "navy", "black"],
  yellow: ["white", "navy", "black", "grey"],
  purple: ["white", "grey", "black", "navy"],
  orange: ["white", "navy", "black", "grey"],
};

function getColorScore(top: ClothingItem, bottom: ClothingItem): number {
  const topColor = top.color.toLowerCase();
  const bottomColor = bottom.color.toLowerCase();

  // Same color — usually not ideal but acceptable for monochrome
  if (topColor === bottomColor) return 5;

  const compatible = COLOR_COMPAT[bottomColor] || COLOR_COMPAT[topColor] || [];
  if (compatible.includes(topColor) || compatible.includes(bottomColor)) {
    // Bonus if it's a classic pair
    const classics = [
      ["black", "white"],
      ["navy", "white"],
      ["grey", "white"],
      ["beige", "white"],
    ];
    const isClassic = classics.some(
      ([b, t]) =>
        (bottomColor === b && topColor === t) ||
        (bottomColor === t && topColor === b),
    );
    return isClassic ? 10 : 8;
  }

  // Neutral colors partially compatible
  const neutrals = ["white", "black", "grey", "gray", "beige", "cream"];
  if (neutrals.includes(topColor) || neutrals.includes(bottomColor)) return 6;

  return 3;
}

// Style compatibility map
const STYLE_COMPAT: Record<string, string[]> = {
  casual: ["casual", "streetwear"],
  formal: ["formal"],
  streetwear: ["streetwear", "casual"],
  party: ["party", "streetwear", "casual"],
  traditional: ["traditional"],
};

function getStyleScore(top: ClothingItem, bottom: ClothingItem): number {
  const topStyle = top.style.toLowerCase();
  const bottomStyle = bottom.style.toLowerCase();

  if (topStyle === bottomStyle) return 10;

  const compat = STYLE_COMPAT[bottomStyle] || [];
  if (compat.includes(topStyle)) return 8;

  // Casual with party is passable
  if (
    (topStyle === "casual" && bottomStyle === "party") ||
    (topStyle === "party" && bottomStyle === "casual")
  )
    return 6;

  return 3;
}

// Pattern balance scoring
function getPatternScore(top: ClothingItem, bottom: ClothingItem): number {
  const topPattern = top.pattern.toLowerCase();
  const bottomPattern = bottom.pattern.toLowerCase();

  if (topPattern === "plain" && bottomPattern === "plain") return 9;
  if (topPattern === "plain" || bottomPattern === "plain") return 9; // one plain = good
  if (topPattern === bottomPattern) return 5; // same non-plain pattern = risky
  return 6; // two different non-plain patterns — can work but risky
}

// Category-specific rules
function getCategoryRuleScore(top: ClothingItem, bottom: ClothingItem): number {
  const topCat = top.category.toLowerCase();
  const bottomCat = bottom.category.toLowerCase();
  const topFit = top.fit.toLowerCase();
  const topStyle = top.style.toLowerCase();

  let score = 7; // default neutral

  // Formal shirt + chinos/formal pants → great
  if (topCat === "shirt" && topStyle === "formal" && (bottomCat === "pant" || bottomCat === "chinos")) {
    score = 10;
  }
  // Formal shirt + jeans → acceptable but not ideal
  if (topCat === "shirt" && topStyle === "formal" && bottomCat === "jeans") {
    score = 6;
  }
  // Oversized tee + cargo/jeans → great
  if (
    (topCat === "t-shirt" || topCat === "tshirt") &&
    topFit === "oversized" &&
    (bottomCat === "cargo" || bottomCat === "jeans")
  ) {
    score = 10;
  }
  // Hoodie + jeans/cargo → great casual
  if (topCat === "hoodie" && (bottomCat === "jeans" || bottomCat === "cargo")) {
    score = 9;
  }
  // Jacket + jeans → streetwear classic
  if (topCat === "jacket" && bottomCat === "jeans") {
    score = 9;
  }

  return score;
}

// Season compatibility
function getSeasonScore(top: ClothingItem, bottom: ClothingItem): number {
  if (top.season === bottom.season) return 10;
  if (top.season === "all-season" || bottom.season === "all-season") return 9;
  return 5;
}

export interface MatchResult {
  score: number;
  reason: string;
  matchType: string;
}

/**
 * Score a top+bottom pairing. Returns score out of 10 and a human-readable reason.
 */
export function scoreOutfit(top: ClothingItem, bottom: ClothingItem): MatchResult {
  const colorScore = getColorScore(top, bottom);
  const styleScore = getStyleScore(top, bottom);
  const patternScore = getPatternScore(top, bottom);
  const categoryScore = getCategoryRuleScore(top, bottom);
  const seasonScore = getSeasonScore(top, bottom);

  // Weighted average: color 30%, style 30%, pattern 20%, category 10%, season 10%
  const rawScore =
    colorScore * 0.3 +
    styleScore * 0.3 +
    patternScore * 0.2 +
    categoryScore * 0.1 +
    seasonScore * 0.1;

  const score = Math.round(rawScore * 10) / 10;

  // Build human-readable reason
  const reasons: string[] = [];

  if (colorScore >= 9) {
    reasons.push(`${top.color} top pairs excellently with ${bottom.color} ${bottom.category}`);
  } else if (colorScore >= 7) {
    reasons.push(`${top.color} and ${bottom.color} complement each other well`);
  } else if (colorScore <= 4) {
    reasons.push(`${top.color} and ${bottom.color} clash — color mismatch`);
  }

  if (styleScore >= 9) {
    reasons.push(`matching ${top.style} style`);
  } else if (styleScore <= 4) {
    reasons.push(`style mismatch: ${top.style} vs ${bottom.style}`);
  }

  if (patternScore >= 9 && top.pattern !== "plain") {
    reasons.push(`${top.pattern} top balances ${bottom.pattern} ${bottom.category}`);
  } else if (top.pattern === "plain" && bottom.pattern === "plain") {
    reasons.push(`clean all-plain combination`);
  } else if (patternScore <= 5) {
    reasons.push(`multiple patterns clash`);
  }

  const reason = reasons.length > 0 ? reasons.join("; ") : `${top.name} and ${bottom.name} are a decent match`;

  // Determine match type for UI badge
  let matchType = "Good match";
  if (score >= 8.5) matchType = "Perfect match";
  else if (score >= 7) matchType = "Great match";
  else if (score >= 5) matchType = "Good match";
  else if (score >= 3) matchType = "Possible match";
  else matchType = "Poor match";

  return { score, reason, matchType };
}

/**
 * Given one item, find all matching counterparts from the wardrobe and rank them.
 */
export function findMatches(
  anchor: ClothingItem,
  wardrobe: ClothingItem[],
  filterStyle?: string | null,
): Array<{ item: ClothingItem; score: number; reason: string; matchType: string }> {
  const anchorIsBottom = isBottom(anchor);
  const anchorIsTop = isTop(anchor);

  // Filter items to matching role
  let candidates = wardrobe.filter((item) => {
    if (item.id === anchor.id) return false;
    if (!item.isAvailable) return false;
    if (anchorIsBottom) return isTop(item);
    if (anchorIsTop) return isBottom(item);
    return false;
  });

  if (filterStyle) {
    candidates = candidates.filter(
      (item) => item.style.toLowerCase() === filterStyle.toLowerCase(),
    );
  }

  return candidates
    .map((item) => {
      const top = anchorIsBottom ? item : anchor;
      const bottom = anchorIsBottom ? anchor : item;
      const result = scoreOutfit(top as ClothingItem, bottom as ClothingItem);
      return { item, ...result };
    })
    .sort((a, b) => b.score - a.score);
}

/**
 * Generate the best outfit from the whole wardrobe.
 */
export function generateBestOutfit(
  wardrobe: ClothingItem[],
  filterStyle?: string | null,
): { top: ClothingItem; bottom: ClothingItem; score: number; reason: string } | null {
  const tops = wardrobe.filter((i) => isTop(i) && i.isAvailable);
  const bottoms = wardrobe.filter((i) => isBottom(i) && i.isAvailable);

  if (tops.length === 0 || bottoms.length === 0) return null;

  let best: {
    top: ClothingItem;
    bottom: ClothingItem;
    score: number;
    reason: string;
  } | null = null;

  for (const top of tops) {
    for (const bottom of bottoms) {
      if (filterStyle) {
        if (
          top.style.toLowerCase() !== filterStyle.toLowerCase() &&
          bottom.style.toLowerCase() !== filterStyle.toLowerCase()
        )
          continue;
      }
      const result = scoreOutfit(top, bottom);
      if (!best || result.score > best.score) {
        best = { top, bottom, score: result.score, reason: result.reason };
      }
    }
  }

  return best;
}
