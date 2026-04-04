import { Router, type IRouter } from "express";
import { getAuth } from "@clerk/express";
import { eq, desc } from "drizzle-orm";
import { db, clothingItemsTable, favoriteOutfitsTable } from "@workspace/db";
import { GetDashboardSummaryResponse, GetRecentItemsResponse } from "@workspace/api-zod";
import { serializeItems } from "../lib/serialize";

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

// GET /dashboard/summary
router.get("/dashboard/summary", requireAuth, async (req: any, res): Promise<void> => {
  const userId = req.userId as string;

  const items = await db
    .select()
    .from(clothingItemsTable)
    .where(eq(clothingItemsTable.userId, userId));

  const favorites = await db
    .select()
    .from(favoriteOutfitsTable)
    .where(eq(favoriteOutfitsTable.userId, userId));

  const byCategory: Record<string, number> = {};
  const byStyle: Record<string, number> = {};
  const bySeason: Record<string, number> = {};

  for (const item of items) {
    byCategory[item.category] = (byCategory[item.category] || 0) + 1;
    byStyle[item.style] = (byStyle[item.style] || 0) + 1;
    bySeason[item.season] = (bySeason[item.season] || 0) + 1;
  }

  const summary = {
    totalItems: items.length,
    totalFavorites: favorites.length,
    byCategory,
    byStyle,
    bySeason,
  };

  res.json(GetDashboardSummaryResponse.parse(summary));
});

// GET /dashboard/recent
router.get("/dashboard/recent", requireAuth, async (req: any, res): Promise<void> => {
  const userId = req.userId as string;

  const items = await db
    .select()
    .from(clothingItemsTable)
    .where(eq(clothingItemsTable.userId, userId))
    .orderBy(desc(clothingItemsTable.createdAt))
    .limit(6);

  res.json(GetRecentItemsResponse.parse(serializeItems(items as any[])));
});

export default router;
