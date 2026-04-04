import { Router, type IRouter } from "express";
import { getAuth } from "@clerk/express";
import { eq, and } from "drizzle-orm";
import { db, clothingItemsTable, favoriteOutfitsTable } from "@workspace/db";
import {
  SaveFavoriteBody,
  DeleteFavoriteParams,
  ListFavoritesResponse,
} from "@workspace/api-zod";

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

// GET /favorites
router.get("/favorites", requireAuth, async (req: any, res): Promise<void> => {
  const userId = req.userId as string;

  const rows = await db
    .select({
      id: favoriteOutfitsTable.id,
      userId: favoriteOutfitsTable.userId,
      topId: favoriteOutfitsTable.topId,
      bottomId: favoriteOutfitsTable.bottomId,
      name: favoriteOutfitsTable.name,
      score: favoriteOutfitsTable.score,
      reason: favoriteOutfitsTable.reason,
      createdAt: favoriteOutfitsTable.createdAt,
    })
    .from(favoriteOutfitsTable)
    .where(eq(favoriteOutfitsTable.userId, userId))
    .orderBy(favoriteOutfitsTable.createdAt);

  // Enrich with top + bottom details
  const enriched = await Promise.all(
    rows.map(async (fav) => {
      const [top] = await db
        .select()
        .from(clothingItemsTable)
        .where(eq(clothingItemsTable.id, fav.topId));
      const [bottom] = await db
        .select()
        .from(clothingItemsTable)
        .where(eq(clothingItemsTable.id, fav.bottomId));
      return { ...fav, top, bottom };
    }),
  );

  // Filter out any favorites where items were deleted
  const valid = enriched.filter((f) => f.top && f.bottom);

  res.json(ListFavoritesResponse.parse(valid));
});

// POST /favorites
router.post("/favorites", requireAuth, async (req: any, res): Promise<void> => {
  const userId = req.userId as string;
  const parsed = SaveFavoriteBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { topId, bottomId, name, score, reason } = parsed.data;

  const [fav] = await db
    .insert(favoriteOutfitsTable)
    .values({ userId, topId, bottomId, name, score, reason })
    .returning();

  const [top] = await db
    .select()
    .from(clothingItemsTable)
    .where(eq(clothingItemsTable.id, topId));
  const [bottom] = await db
    .select()
    .from(clothingItemsTable)
    .where(eq(clothingItemsTable.id, bottomId));

  res.status(201).json({ ...fav, top, bottom });
});

// DELETE /favorites/:id
router.delete("/favorites/:id", requireAuth, async (req: any, res): Promise<void> => {
  const userId = req.userId as string;
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);

  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [fav] = await db
    .delete(favoriteOutfitsTable)
    .where(and(eq(favoriteOutfitsTable.id, id), eq(favoriteOutfitsTable.userId, userId)))
    .returning();

  if (!fav) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  res.status(204).send();
});

export default router;
