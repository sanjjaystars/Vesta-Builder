import { Router, type IRouter } from "express";
import { getAuth } from "@clerk/express";
import { eq } from "drizzle-orm";
import { db, clothingItemsTable } from "@workspace/db";
import {
  GetOutfitMatchesBody,
  GenerateOutfitBody,
  GetOutfitMatchesResponse,
  GenerateOutfitResponse,
} from "@workspace/api-zod";
import { findMatches, generateBestOutfit } from "../lib/matcher";
import { serializeItem } from "../lib/serialize";

const router: IRouter = Router();

function requireAuth(req: any, res: any, next: any) {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  req.userId = userId;
  next();
}

// POST /outfits/match
router.post("/outfits/match", requireAuth, async (req: any, res): Promise<void> => {
  const userId = req.userId as string;
  const parsed = GetOutfitMatchesBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { clothingItemId, filterStyle } = parsed.data;

  // Load anchor item
  const [anchor] = await db
    .select()
    .from(clothingItemsTable)
    .where(eq(clothingItemsTable.id, clothingItemId));

  if (!anchor || anchor.userId !== userId) {
    res.status(404).json({ error: "Item not found" });
    return;
  }

  // Load full wardrobe
  const wardrobe = await db
    .select()
    .from(clothingItemsTable)
    .where(eq(clothingItemsTable.userId, userId));

  const matches = findMatches(anchor, wardrobe, filterStyle);

  const serializedMatches = matches.map((m: any) => ({
    ...m,
    top: serializeItem(m.top),
    bottom: serializeItem(m.bottom),
  }));
  res.json(GetOutfitMatchesResponse.parse(serializedMatches));
});

// POST /outfits/generate
router.post("/outfits/generate", requireAuth, async (req: any, res): Promise<void> => {
  const userId = req.userId as string;
  const parsed = GenerateOutfitBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { filterStyle } = parsed.data;

  const wardrobe = await db
    .select()
    .from(clothingItemsTable)
    .where(eq(clothingItemsTable.userId, userId));

  const outfit = generateBestOutfit(wardrobe, filterStyle);
  if (!outfit) {
    res.status(404).json({ error: "Not enough items to generate an outfit. Add more tops and bottoms." });
    return;
  }

  const serializedOutfit = {
    ...(outfit as any),
    top: serializeItem((outfit as any).top),
    bottom: serializeItem((outfit as any).bottom),
  };
  res.json(GenerateOutfitResponse.parse(serializedOutfit));
});

export default router;
